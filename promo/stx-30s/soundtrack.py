#!/usr/bin/env python3
"""
STX 30 秒宣传片临时配乐（temp track）与音效生成器，仅依赖 numpy（响度标准化可选用 ffmpeg）。
Temp score and sound design generator for the STX 30s promo; needs numpy only (ffmpeg optional for loudness).

读取渲染器导出的 out/cues.json，让音效与画面逐帧对齐；正式投放可替换为授权音乐，保留音效层即可。
Reads out/cues.json exported by the renderer so SFX stay frame-aligned; swap the music for licensed audio before release.

用法 / Usage:
  node promo/stx-30s/render.mjs --cues-only
  python3 promo/stx-30s/soundtrack.py            # -> promo/stx-30s/out/soundtrack.wav
"""
import json
import math
import os
import shutil
import subprocess
import sys
import wave

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
OUT_DIR = os.path.join(HERE, "out")
SR = 48000
BPM = 150
BEAT = 60.0 / BPM  # 0.4s，与镜头时间码同一网格 / same grid as the shot timecodes

rng = np.random.default_rng(20261008)


# ---------------------------------------------------------------------------
# 基础 DSP / Basic DSP
# ---------------------------------------------------------------------------

def secs(n):
    return np.arange(n) / SR


def midi_hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def fft_filter(x, lp=None, hp=None, order=2):
    """零相位频域滤波（Butterworth 幅度响应）。/ Zero-phase frequency-domain filter with Butterworth magnitude."""
    n = x.shape[0]
    spec = np.fft.rfft(x, axis=0)
    f = np.fft.rfftfreq(n, 1 / SR)
    h = np.ones_like(f)
    if lp:
        h *= 1 / np.sqrt(1 + (f / lp) ** (2 * order))
    if hp:
        h *= 1 / np.sqrt(1 + (hp / np.maximum(f, 1e-3)) ** (2 * order))
    if x.ndim == 2:
        h = h[:, None]
    return np.fft.irfft(spec * h, n=n, axis=0)


def additive_saw(freq, n, max_hz=4500, detune_cents=0.0):
    """限带锯齿波（加法合成，避免混叠）。/ Band-limited saw via additive synthesis to avoid aliasing."""
    f = freq * 2 ** (detune_cents / 1200)
    t = secs(n)
    out = np.zeros(n)
    k_max = max(1, int(max_hz / f))
    phase0 = rng.uniform(0, 2 * np.pi)
    for k in range(1, k_max + 1):
        out += np.sin(2 * np.pi * k * f * t + k * phase0) / k
    return out * (2 / np.pi)


def env_ar(n, attack, release_start, release):
    """线性起音 + 指数释音包络。/ Linear attack with exponential release."""
    t = secs(n)
    e = np.minimum(1.0, t / max(attack, 1e-4))
    rel = t > release_start
    e[rel] *= np.exp(-(t[rel] - release_start) / max(release, 1e-4))
    return e


def sweep_noise(dur, f0, f1, bw_oct=0.6):
    """中心频率随时间指数滑动的带通噪声（STFT 叠加）。/ Band-passed noise whose centre glides exponentially (STFT overlap-add)."""
    n = int(dur * SR)
    frame, hop = 2048, 512
    out = np.zeros(n + frame)
    win = np.hanning(frame)
    freqs = np.fft.rfftfreq(frame, 1 / SR)
    logf = np.log2(np.maximum(freqs, 1.0))
    for k in range(n // hop + 1):
        p = min(1.0, k * hop / max(n, 1))
        fc = f0 * (f1 / f0) ** p
        spec = rng.standard_normal(len(freqs)) + 1j * rng.standard_normal(len(freqs))
        g = np.exp(-0.5 * ((logf - math.log2(fc)) / bw_oct) ** 2)
        out[k * hop:k * hop + frame] += np.fft.irfft(spec * g, n=frame) * win
    out = out[:n]
    return out / (np.max(np.abs(out)) + 1e-9)


def reverb(x, decay=2.0, predelay=0.025, damp=5000):
    """指数衰减噪声脉冲的卷积混响（立体声去相关）。/ Convolution reverb from decaying noise IR (decorrelated stereo)."""
    length = int(decay * SR)
    t = secs(length)
    ir = rng.standard_normal((length, 2)) * np.exp(-t * 6.9 / decay)[:, None]
    ir = fft_filter(ir, lp=damp, order=1)
    ir[: int(predelay * SR)] = 0
    ir /= np.sqrt(np.sum(ir ** 2, axis=0, keepdims=True))
    n = x.shape[0] + length
    nfft = 1 << (n - 1).bit_length()
    y = np.fft.irfft(np.fft.rfft(x, nfft, axis=0) * np.fft.rfft(ir, nfft, axis=0), nfft, axis=0)
    return y[: x.shape[0]]


class Bus:
    """立体声总线，支持按秒放置与等功率声像。/ Stereo bus with time placement and equal-power panning."""

    def __init__(self, n):
        self.buf = np.zeros((n, 2))

    def place(self, sig, t0, gain=1.0, pan=0.0):
        i0 = int(round(t0 * SR))
        if sig.ndim == 1:
            if np.isscalar(pan):
                pan = np.full(len(sig), pan)
            ang = (np.clip(pan, -1, 1) + 1) * np.pi / 4
            sig = np.stack([sig * np.cos(ang), sig * np.sin(ang)], axis=1)
        if i0 < 0:
            sig, i0 = sig[-i0:], 0
        i1 = min(len(self.buf), i0 + len(sig))
        if i1 > i0:
            self.buf[i0:i1] += gain * sig[: i1 - i0]


# ---------------------------------------------------------------------------
# 乐器与音效 / Instruments and SFX
# ---------------------------------------------------------------------------

def kick(dur=0.45, f_hi=150, f_lo=52, pdec=0.03, adec=0.24):
    t = secs(int(dur * SR))
    f = f_lo + (f_hi - f_lo) * np.exp(-t / pdec)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / adec)
    click = fft_filter(rng.standard_normal(len(t)), hp=2500) * np.exp(-t / 0.0025) * 0.35
    return np.tanh(1.8 * (body + click)) / np.tanh(1.8)


def clap():
    n = int(0.4 * SR)
    t = secs(n)
    env = np.zeros(n)
    for d in (0.0, 0.010, 0.021):
        env += np.where(t >= d, np.exp(-(t - d) / 0.007), 0)
    env += np.where(t >= 0.03, np.exp(-(t - 0.03) / 0.12), 0) * 0.7
    return fft_filter(rng.standard_normal(n) * env, lp=7500, hp=950)


def hat(open_hat=False):
    n = int((0.3 if open_hat else 0.09) * SR)
    t = secs(n)
    return fft_filter(rng.standard_normal(n), hp=7800) * np.exp(-t / (0.1 if open_hat else 0.02))


def crash(dur=1.6):
    n = int(dur * SR)
    t = secs(n)
    return fft_filter(rng.standard_normal(n), hp=3800, lp=13000) * np.exp(-t / 0.55)


def impact(size="big"):
    dur = 2.2 if size == "big" else 1.2
    n = int(dur * SR)
    t = secs(n)
    k = np.zeros(n)
    kk = kick(dur=dur, f_hi=170, f_lo=46, pdec=0.05, adec=0.75 if size == "big" else 0.4)
    k[: len(kk)] = kk
    boom = fft_filter(rng.standard_normal(n), lp=900) * np.exp(-t / (0.7 if size == "big" else 0.35))
    sub = np.sin(2 * np.pi * 40 * t) * np.exp(-t / 0.9) * (0.35 if size == "big" else 0.2)
    return k + 0.5 * boom / (np.max(np.abs(boom)) + 1e-9) + sub


def bass_note(freq, dur):
    n = int(dur * SR)
    t = secs(n)
    saw = fft_filter(additive_saw(freq * 2, n, max_hz=2400), lp=900)
    sub = np.sin(2 * np.pi * freq * t)
    return (0.75 * saw + 0.35 * sub) * env_ar(n, 0.004, 0.02, dur * 0.55)


def pluck(freq, dur=0.5, bright=1.0):
    n = int(dur * SR)
    t = secs(n)
    out = np.zeros(n)
    for k in range(1, 9):
        if k * freq > 12000:
            break
        out += np.sin(2 * np.pi * k * freq * t) * np.exp(-t * (4 + k * 3.5 / bright)) / k
    return out * np.minimum(1, t / 0.002)


def bell(freq, dur=2.4):
    n = int(dur * SR)
    t = secs(n)
    partials = [(1, 1.0, 1.6), (2.0, 0.45, 1.0), (2.76, 0.35, 0.7), (5.4, 0.18, 0.35), (8.93, 0.08, 0.2)]
    out = np.zeros(n)
    for ratio, amp, dec in partials:
        out += amp * np.sin(2 * np.pi * freq * ratio * t) * np.exp(-t / dec)
    return out * np.minimum(1, t / 0.003)


def blip(freq, dur=0.06, dec=0.04):
    n = int(dur * SR) + int(0.1 * SR)
    t = secs(n)
    return (np.sin(2 * np.pi * freq * t) + 0.3 * np.sin(4 * np.pi * freq * t)) * np.exp(-t / dec) * np.minimum(1, t / 0.001)


def tick(lo=2000, hi=6500, dec=0.005):
    n = int(0.04 * SR)
    t = secs(n)
    return fft_filter(rng.standard_normal(n), hp=lo, lp=hi) * np.exp(-t / dec)


def glitch_burst():
    n = int(0.08 * SR)
    t = secs(n)
    f = rng.uniform(180, 900)
    sq = np.sign(np.sin(2 * np.pi * f * t))
    nz = np.round(rng.standard_normal(n) * 3) / 3
    hold = np.repeat(nz[::24], 24)[:n]
    return fft_filter(0.5 * sq + 0.7 * hold, hp=250) * np.exp(-t / 0.035)


# ---------------------------------------------------------------------------
# 编曲 / Arrangement
# ---------------------------------------------------------------------------

# 和弦（MIDI）：Am9 · Fmaj9 · Cadd9 · G6，A 小调 / C 大调。Chords in A minor / C major.
CHORDS = {
    "Am": {"pad": [57, 60, 64, 67, 71], "root": 33, "arp": [69, 72, 76, 79]},
    "F": {"pad": [53, 57, 60, 64, 67], "root": 29, "arp": [65, 69, 72, 76]},
    "C": {"pad": [55, 60, 64, 67, 74], "root": 36, "arp": [67, 72, 76, 79]},
    "G": {"pad": [55, 59, 62, 67, 69], "root": 31, "arp": [67, 71, 74, 79]},
}
ARP_STEPS = [0, 2, 1, 3, 0, 2, 3, 1]


def build(cue_doc):
    duration = float(cue_doc["duration"])
    shots = cue_doc["shots"]
    cues = cue_doc["cues"]
    n = int(duration * SR)

    drums, bass, pad, arp, sfx, send = (Bus(n) for _ in range(6))

    s2, f1, s9 = shots["s2"], shots["f1"], shots["s9"]
    cuts = [shots[k] for k in ("f2", "f3", "f4", "f5", "f6")]
    bar = 4 * BEAT

    # 和弦进行：小节以品牌亮相 s2 为锚点，切镜都落在小节线上。
    # Chord timeline anchored at s2 so every feature cut lands on a bar line.
    segments = [(s2, s2 + bar, "Am"), (s2 + bar, s2 + 2 * bar, "F")]
    groove_order = ["Am", "F", "C", "G"]
    t, i = s2 + 2 * bar, 0
    while t < s9 - 1e-6:
        segments.append((t, min(t + bar, s9), groove_order[i % 4]))
        t += bar
        i += 1
    segments += [(s9, s9 + 3 * BEAT, "F"), (s9 + 3 * BEAT, s9 + 6 * BEAT, "G"), (s9 + 6 * BEAT, duration, "C")]

    def chord_at(time):
        for a, b, name in segments:
            if a <= time < b:
                return name
        return segments[-1][2] if time >= segments[-1][0] else "Am"

    # --- S1：低频嗡鸣 + 时钟滴答 + 张力和声 / Hook: drone, ticking clock, tension cluster ---
    drone_n = int((s2 - 0.05) * SR)
    td = secs(drone_n)
    drone = 0.3 * np.sin(2 * np.pi * 55 * td) + 0.6 * fft_filter(additive_saw(110, drone_n, max_hz=2400), lp=1100, hp=90)
    drone *= np.minimum(1, td / 0.8) * (1 + 0.15 * np.sin(2 * np.pi * 0.7 * td))
    drone *= np.clip((s2 - 0.12 - td) / 0.25, 0, 1)
    cluster = 0.05 * (np.sin(2 * np.pi * 1760 * td) + np.sin(2 * np.pi * 1864.66 * td)) * np.clip((td - 0.9) / 1.5, 0, 1)
    cluster *= np.clip((s2 - 0.12 - td) / 0.2, 0, 1)
    sfx.place(drone, 0, 0.45)
    sfx.place(cluster, 0, 0.6, pan=0.2)
    k = 1
    while k * BEAT / 2 < s2 - 0.2:
        tt = k * BEAT / 2
        ramp = 0.25 + 0.75 * tt / s2
        sfx.place(tick(2500, 8000, 0.004) if k % 2 else blip(1150, dec=0.012), tt, 0.32 * ramp, pan=-0.25 if k % 2 else 0.25)
        k += 1

    # 收束前的反向吸气 + 上升噪声 / Reverse suck and rising noise before the impact
    rise_dur = 1.25
    rise = sweep_noise(rise_dur, 350, 9000, bw_oct=0.7) * (secs(int(rise_dur * SR)) / rise_dur) ** 2.2
    sfx.place(rise, s2 - 0.1 - rise_dur, 0.5)
    send.place(rise, s2 - 0.1 - rise_dur, 0.2)

    # --- 品牌段：铺底和弦 + 钟声 / Brand: pads and bells ---
    for a, b, name in segments:
        dur = b - a
        notes = CHORDS[name]["pad"]
        seg_n = int((dur + 0.7) * SR)
        e = env_ar(seg_n, 0.28 if a > s2 else 0.6, dur, 0.35)
        for m in notes:
            for cents, p in ((-9, -0.6), (0, 0.0), (9, 0.6)):
                v = additive_saw(midi_hz(m), seg_n, max_hz=3200, detune_cents=cents) * e
                pad.place(v, a, 0.055, pan=p)

    for m, p in ((81, -0.3), (88, 0.3), (83, 0.0)):
        sfx.place(bell(midi_hz(m)), s2 + 0.02, 0.09, pan=p)
        send.place(bell(midi_hz(m)), s2 + 0.02, 0.12)

    # 能量渐起的脉冲，引出 f1 的落拍 / Building pulse leading into the f1 drop
    tt = s2 + 2 * bar - 4 * BEAT
    while tt < f1 - 1e-6:
        drums.place(kick(adec=0.18), tt, 0.25 + 0.35 * (tt - (s2 + 4 * BEAT)) / (f1 - s2))
        tt += BEAT

    # --- 主段律动（f1 → s9）/ Main groove (f1 → s9) ---
    beat_i = int(round(f1 / BEAT))
    last_beat = int(round(s9 / BEAT))
    kick_times = []
    for b_i in range(beat_i, last_beat):
        tb = b_i * BEAT
        pos = (b_i - int(round(s2 / BEAT))) % 4
        drums.place(kick(), tb, 0.75)
        kick_times.append(tb)
        if pos in (1, 3):
            drums.place(clap(), tb, 0.5, pan=0.05)
            send.place(clap(), tb, 0.12)
        drums.place(hat(open_hat=(pos == 3)), tb + BEAT / 2, 0.16 if pos != 3 else 0.12, pan=0.3)
        drums.place(hat(), tb + BEAT / 4, 0.05, pan=-0.3)
        drums.place(hat(), tb + 3 * BEAT / 4, 0.05, pan=-0.3)

        # 贝斯：八分音符根音 + 八度跳 / Bass: eighth-note roots with octave hops
        root = CHORDS[chord_at(tb + 0.01)]["root"]
        bass.place(bass_note(midi_hz(root), BEAT / 2 * 0.95), tb, 0.55)
        bass.place(bass_note(midi_hz(root + 12), BEAT / 2 * 0.9), tb + BEAT / 2, 0.42)

    # 琶音：八分音符拨弦 / Arpeggio: eighth-note plucks
    step = 0
    te = f1
    while te < s9 - 1e-6:
        notes = CHORDS[chord_at(te + 0.01)]["arp"]
        m = notes[ARP_STEPS[step % 8] % len(notes)]
        v = pluck(midi_hz(m), 0.45, bright=1.2)
        arp.place(v, te, 0.16, pan=-0.35 if step % 2 else 0.35)
        send.place(v, te, 0.08)
        te += BEAT / 2
        step += 1

    # 切镜点缀：镲片 / Cymbal accents on every feature cut
    for c in [f1] + cuts:
        drums.place(crash(), c, 0.28, pan=0.15)
        send.place(crash(), c, 0.1)

    # s9 前的军鼓滚奏 / Snare roll into the outro
    roll_start = s9 - 2 * BEAT
    for j in range(16):
        tr = roll_start + j * (2 * BEAT / 16)
        drums.place(clap(), tr, 0.12 + 0.3 * j / 15, pan=0.05)

    # --- 收尾：钟声和弦 / Outro: bell chord ---
    for m, p in ((84, -0.3), (88, 0.3), (91, 0.0)):
        sfx.place(bell(midi_hz(m), 3.0), s9 + 6 * BEAT, 0.08, pan=p)
        send.place(bell(midi_hz(m), 3.0), s9 + 6 * BEAT, 0.14)
    drums.place(crash(2.4), s9, 0.32)
    send.place(crash(2.4), s9, 0.15)

    # --- 画面提示点音效 / Cue-driven SFX ---
    pop_notes = [84, 88, 91]
    ok_notes = [88, 91, 93, 96]
    for c in cues:
        typ, t0 = c["type"], c["t"]
        if typ == "log":
            sfx.place(tick(3000, 9000, 0.003), t0, 0.12, pan=rng.uniform(-0.7, 0.7))
        elif typ == "logErr":
            sfx.place(blip(rng.uniform(620, 760), dec=0.03), t0, 0.08, pan=rng.uniform(-0.6, 0.6))
        elif typ == "glitch":
            sfx.place(glitch_burst(), t0, 0.32, pan=rng.uniform(-0.4, 0.4))
        elif typ == "impact":
            big = c.get("size") == "big"
            sfx.place(impact("big" if big else "mid"), t0, 0.9 if big else 0.55)
            send.place(impact("big" if big else "mid"), t0, 0.25)
        elif typ == "letter":
            v = pluck(midi_hz([76, 79, 84][c.get("index", 0) % 3]), 0.9, bright=0.8)
            sfx.place(v, t0, 0.1, pan=[-0.3, 0, 0.3][c.get("index", 0) % 3])
            send.place(v, t0, 0.12)
        elif typ == "bell":
            sfx.place(bell(midi_hz(81)), t0, 0.07)
            send.place(bell(midi_hz(81)), t0, 0.1)
        elif typ == "riser":
            d = c["end"] - t0
            r = sweep_noise(d, 500, 7000, bw_oct=0.6) * (secs(int(d * SR)) / d) ** 2
            sfx.place(r, t0, 0.35)
        elif typ == "whoosh":
            d = c.get("dur", 0.6)
            nn = int(d * SR)
            w = sweep_noise(d, 700, 5200, bw_oct=0.5) * np.sin(np.pi * np.linspace(0, 1, nn)) ** 1.6
            sfx.place(w, t0, 0.3, pan=np.linspace(-0.8, 0.8, nn))
            send.place(w, t0, 0.1)
        elif typ == "hl":
            sfx.place(blip(2093, dec=0.045), t0, 0.07, pan=0.25)
            send.place(blip(2093, dec=0.045), t0, 0.05)
        elif typ == "click":
            sfx.place(tick(2500, 9000, 0.002), t0, 0.32, pan=0.3)
            sfx.place(blip(3400, dec=0.01), t0, 0.13, pan=0.3)
        elif typ == "pop":
            sfx.place(blip(midi_hz(pop_notes[c.get("index", 0) % 3]), dec=0.06), t0, 0.1, pan=0.3)
        elif typ == "type":
            sfx.place(tick(1800, 6000, 0.004), t0, 0.07 * rng.uniform(0.5, 1.0), pan=rng.uniform(-0.2, 0.4))
        elif typ == "ok":
            sfx.place(blip(midi_hz(ok_notes[c.get("index", 0) % 4]), dec=0.05), t0, 0.08, pan=0.3)
        elif typ == "done":
            for j, m in enumerate((84, 88, 91)):
                sfx.place(blip(midi_hz(m), dec=0.08), t0 + j * 0.05, 0.07, pan=0.3)

    # --- 混音 / Mix ---
    # 侧链压缩：底鼓让位铺底与琶音 / Sidechain pump: pads and arps duck under the kick
    duck = np.ones(n)
    win_n = int(0.22 * SR)
    shape = 1 - 0.45 * np.exp(-secs(win_n) / 0.08)
    for tk in kick_times:
        i0 = int(tk * SR)
        i1 = min(n, i0 + win_n)
        duck[i0:i1] = np.minimum(duck[i0:i1], shape[: i1 - i0])
    pad_mix = fft_filter(pad.buf, lp=2200, hp=140) * duck[:, None]
    arp_mix = fft_filter(arp.buf, lp=6500, hp=250) * duck[:, None]
    bass_mix = fft_filter(bass.buf, hp=42)

    send.buf += 0.35 * pad.buf * 0.4
    wet = reverb(send.buf, decay=2.4, damp=4500)

    mix = drums.buf * 0.85 + bass_mix * 0.5 + pad_mix * 1.5 + arp_mix * 1.5 + sfx.buf * 1.1 + wet * 0.6
    mix = fft_filter(mix, hp=35)

    # 结尾淡出 + 软限幅 / Tail fade and soft limiting
    fade_n = int(0.6 * SR)
    mix[-fade_n:] *= np.linspace(1, 0, fade_n)[:, None] ** 1.5
    mix /= np.max(np.abs(mix)) + 1e-9
    mix = np.tanh(1.6 * mix) / np.tanh(1.6)
    mix *= 10 ** (-1.0 / 20)
    return mix


def write_wav(path, data):
    pcm = (np.clip(data, -1, 1) * 32767).astype("<i2")
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


def main():
    cues_path = os.path.join(OUT_DIR, "cues.json")
    if not os.path.exists(cues_path):
        sys.exit("缺少 out/cues.json，请先运行 render.mjs --cues-only / missing out/cues.json, run render.mjs --cues-only first")
    with open(cues_path, encoding="utf-8") as f:
        cue_doc = json.load(f)

    raw_path = os.path.join(OUT_DIR, "soundtrack.raw.wav")
    out_path = os.path.join(OUT_DIR, "soundtrack.wav")
    write_wav(raw_path, build(cue_doc))

    # 有 ffmpeg 时做响度标准化（-16 LUFS，网络视频常用）。/ Loudness-normalise to -16 LUFS when ffmpeg exists.
    if shutil.which("ffmpeg"):
        subprocess.run([
            "ffmpeg", "-y", "-loglevel", "error", "-i", raw_path,
            "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", str(SR), out_path,
        ], check=True)
        os.remove(raw_path)
    else:
        os.replace(raw_path, out_path)
    print(f"soundtrack -> {out_path}")


if __name__ == "__main__":
    main()
