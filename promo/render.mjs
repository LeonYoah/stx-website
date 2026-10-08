#!/usr/bin/env node
/**
 * STX 宣传片逐帧渲染器：用系统 Chrome（DevTools 协议）逐帧 seek 时间线并截图，管道交给 ffmpeg 编码为 MP4。
 * STX promo frame renderer: drives system Chrome over the DevTools protocol, seeks the timeline per frame and pipes PNGs into ffmpeg.
 *
 * 默认以 2 倍像素渲染（3840×2160）再用 lanczos 缩到 1080p，截图文字与边缘更清晰；--master 额外输出 4K 母版。
 * Renders at 2x device pixels (3840×2160) and downsamples to 1080p with lanczos for sharper UI text; --master also writes a 4K master.
 *
 * 零 npm 依赖：需要 Node >= 22（内置 WebSocket）、Chrome/Chromium、ffmpeg。
 * Zero npm deps: requires Node >= 22 (built-in WebSocket), Chrome/Chromium and ffmpeg.
 *
 * 用法 / Usage:
 *   node promo/render.mjs stx-30s                      # -> promo/stx-30s/out/stx-promo-30s.mp4
 *   node promo/render.mjs stx-45s --audio --master     # 混入 out/soundtrack.wav，并输出 4K 母版 / mux out/soundtrack.wav and write a 4K master
 *   node promo/render.mjs stx-45s --stills 8.4,20      # 只导出指定秒数的静帧 PNG / export stills only
 *   node promo/render.mjs stx-45s --cues-only          # 只导出音效提示点 cues.json / export sound cues only
 *   node promo/render.mjs stx-45s --scale 1            # 1 倍快速预览渲染 / fast 1x draft render
 *   CHROME_PATH=/path/to/chrome node promo/render.mjs stx-30s
 */
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { once } from 'node:events';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { openPage } from './lib/browser.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const WIDTH = 1920;
const HEIGHT = 1080;

function parseArgs(argv) {
  const cut = argv[0];
  if (!cut || cut.startsWith('--')) throw new Error('用法 / usage: node promo/render.mjs <cut> [options]，例如 / e.g. stx-30s');
  const dir = path.join(HERE, cut);
  if (!existsSync(path.join(dir, 'index.html'))) throw new Error(`找不到 / not found: ${path.join(dir, 'index.html')}`);
  const outDir = path.join(dir, 'out');
  const name = cut.replace(/^stx-/, '');
  const opts = {
    dir,
    outDir,
    out: path.join(outDir, `stx-promo-${name}.mp4`),
    master: null,
    stills: null,
    audio: null,
    from: 0,
    to: null,
    scale: 2,
    cuesOnly: false,
  };
  for (let i = 1; i < argv.length; i += 1) {
    const key = argv[i];
    const val = argv[i + 1];
    const hasVal = val !== undefined && !val.startsWith('--');
    if (key === '--out') { opts.out = path.resolve(val); i += 1; }
    else if (key === '--stills') { opts.stills = val.split(',').map(Number); i += 1; }
    else if (key === '--audio') { opts.audio = hasVal ? path.resolve(val) : path.join(outDir, 'soundtrack.wav'); if (hasVal) i += 1; }
    else if (key === '--master') { opts.master = true; }
    else if (key === '--from') { opts.from = Number(val); i += 1; }
    else if (key === '--to') { opts.to = Number(val); i += 1; }
    else if (key === '--scale') { opts.scale = Number(val); i += 1; }
    else if (key === '--cues-only') { opts.cuesOnly = true; }
    else throw new Error(`未知参数 / Unknown argument: ${key}`);
  }
  if (opts.master) opts.master = opts.out.replace(/\.mp4$/, '-4k.mp4');
  if (opts.master && opts.scale !== 2) throw new Error('4K 母版需要 --scale 2 / the 4K master needs --scale 2');
  return opts;
}

// RGB → BT.709 YUV（限定范围），与容器里的色彩标记一致。/ RGB → BT.709 limited-range YUV, matching the container colour tags.
const TO_YUV = 'out_color_matrix=bt709:out_range=tv,format=yuv420p';
const X264 = ['-c:v', 'libx264', '-preset', 'slow', '-pix_fmt', 'yuv420p',
  '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', '-color_range', 'tv', '-movflags', '+faststart'];

function muxAudio(video, audio, out) {
  const mux = spawnSync('ffmpeg', [
    '-y', '-loglevel', 'error', '-i', video, '-i', audio,
    '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest',
    '-movflags', '+faststart', out,
  ], { stdio: 'inherit' });
  if (mux.status !== 0) throw new Error('混音失败 / audio mux failed');
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.audio && !existsSync(opts.audio)) throw new Error(`找不到配乐 / soundtrack not found: ${opts.audio}`);
  const { page, evaluate, on, close } = await openPage({
    width: WIDTH,
    height: HEIGHT,
    deviceScaleFactor: opts.scale,
    chromeArgs: ['--allow-file-access-from-files'],
  });

  try {
    // 合成页脚本报错时立即失败，而不是一直等 ready。/ Fail fast on composition script errors instead of waiting for ready forever.
    const pageErrors = [];
    on('Runtime.exceptionThrown', (p) => pageErrors.push(p.exceptionDetails?.exception?.description || p.exceptionDetails?.text));
    await page('Runtime.enable');
    await page('Page.navigate', { url: `${pathToFileURL(path.join(opts.dir, 'index.html')).href}?render` });

    // 等待字体、截图解码与时间线就绪。/ Wait for fonts, decoded screenshots and the timeline.
    const began = Date.now();
    for (;;) {
      if (pageErrors.length) throw new Error(`合成页报错 / composition error:\n${pageErrors.join('\n')}`);
      const ok = await evaluate('!!(window.__STX_PROMO__ && document.readyState === "complete")').catch(() => false);
      if (ok) break;
      if (Date.now() - began > 30000) throw new Error('合成页加载超时 / composition load timed out');
      await new Promise((r) => setTimeout(r, 100));
    }
    await evaluate('window.__STX_PROMO__.ready.then(() => 1)');
    const meta = await evaluate('({ fps: __STX_PROMO__.fps, duration: __STX_PROMO__.duration, shots: __STX_PROMO__.shots, music: __STX_PROMO__.music, cues: __STX_PROMO__.cues })');

    // 导出音效提示点，供 soundtrack.py 对齐。/ Export sound cues for soundtrack.py.
    mkdirSync(opts.outDir, { recursive: true });
    const cuesFile = path.join(opts.outDir, 'cues.json');
    writeFileSync(cuesFile, `${JSON.stringify(meta, null, 2)}\n`);
    if (opts.cuesOnly) {
      console.log(`cues -> ${cuesFile} (${meta.cues.length})`);
      return;
    }

    const capture = async (t) => {
      await evaluate(`(window.__STX_PROMO__.seek(${t}), new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(1)))))`);
      const { data } = await page('Page.captureScreenshot', { format: 'png', optimizeForSpeed: true, captureBeyondViewport: false });
      return Buffer.from(data, 'base64');
    };

    if (opts.stills) {
      const dir = path.join(opts.outDir, 'stills');
      mkdirSync(dir, { recursive: true });
      for (const t of opts.stills) {
        const file = path.join(dir, `still-${t.toFixed(2).padStart(5, '0')}s.png`);
        writeFileSync(file, await capture(t));
        console.log(`still ${t}s -> ${file}`);
      }
      return;
    }

    const fps = meta.fps;
    const start = Math.round(opts.from * fps);
    const end = Math.round((opts.to ?? meta.duration) * fps);
    const silent = (file) => (opts.audio ? file.replace(/\.mp4$/, '.silent.mp4') : file);

    // 超采样：2 倍帧缩到 1080p；母版直接用 2 倍帧。/ Supersampling: 2x frames scale down to 1080p; the master keeps the 2x frames.
    const hdFilter = opts.scale === 1 ? TO_YUV : `scale=${WIDTH}:${HEIGHT}:flags=lanczos+accurate_rnd+full_chroma_int:${TO_YUV}`;
    const args = ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-'];
    if (opts.master) {
      args.push('-filter_complex', `[0:v]split=2[a][b];[a]${hdFilter}[hd];[b]scale=${TO_YUV}[uhd]`,
        '-map', '[hd]', ...X264, '-crf', '16', silent(opts.out),
        '-map', '[uhd]', ...X264, '-crf', '18', silent(opts.master));
    } else {
      args.push('-vf', hdFilter, ...X264, '-crf', '16', silent(opts.out));
    }
    const ffmpeg = spawn('ffmpeg', args, { stdio: ['pipe', 'inherit', 'inherit'] });

    const t0 = Date.now();
    for (let f = start; f < end; f += 1) {
      const png = await capture(f / fps);
      if (!ffmpeg.stdin.write(png)) await once(ffmpeg.stdin, 'drain');
      if (f % fps === 0) {
        const done = f - start + 1;
        const eta = ((Date.now() - t0) / done) * (end - start - done) / 1000;
        process.stdout.write(`\rframe ${f}/${end}  eta ${eta.toFixed(0)}s   `);
      }
    }
    ffmpeg.stdin.end();
    const [code] = await once(ffmpeg, 'exit');
    if (code !== 0) throw new Error(`ffmpeg 退出码 / ffmpeg exit code ${code}`);

    if (opts.audio) {
      muxAudio(silent(opts.out), opts.audio, opts.out);
      if (opts.master) muxAudio(silent(opts.master), opts.audio, opts.master);
    }
    console.log(`\n完成 / done -> ${opts.out}${opts.master ? ` + ${opts.master}` : ''}  (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
  } finally {
    await close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
