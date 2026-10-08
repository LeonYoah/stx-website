#!/usr/bin/env node
/**
 * STX 宣传片逐帧渲染器：用系统 Chrome（DevTools 协议）逐帧 seek 时间线并截图，管道交给 ffmpeg 编码为 MP4。
 * STX promo frame renderer: drives system Chrome over the DevTools protocol, seeks the timeline per frame and pipes PNGs into ffmpeg.
 *
 * 零 npm 依赖：需要 Node >= 22（内置 WebSocket）、Chrome/Chromium、ffmpeg。
 * Zero npm deps: requires Node >= 22 (built-in WebSocket), Chrome/Chromium and ffmpeg.
 *
 * 用法 / Usage:
 *   node promo/stx-30s/render.mjs                          # 输出 promo/stx-30s/out/stx-promo-30s.mp4
 *   node promo/stx-30s/render.mjs --stills 1.8,5,8.2       # 只导出指定秒数的静帧 PNG / export stills only
 *   node promo/stx-30s/render.mjs --cues-only              # 只导出音效提示点 cues.json / export sound cues only
 *   node promo/stx-30s/render.mjs --audio music.wav        # 混入配乐 / mux a soundtrack
 *   CHROME_PATH=/path/to/chrome node promo/stx-30s/render.mjs
 */
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { once } from 'node:events';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const WIDTH = 1920;
const HEIGHT = 1080;

function parseArgs(argv) {
  const opts = { out: path.join(HERE, 'out', 'stx-promo-30s.mp4'), stills: null, audio: null, from: 0, to: null, cuesOnly: false };
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    const val = argv[i + 1];
    if (key === '--out') { opts.out = path.resolve(val); i += 1; }
    else if (key === '--stills') { opts.stills = val.split(',').map(Number); i += 1; }
    else if (key === '--audio') { opts.audio = path.resolve(val); i += 1; }
    else if (key === '--from') { opts.from = Number(val); i += 1; }
    else if (key === '--to') { opts.to = Number(val); i += 1; }
    else if (key === '--cues-only') { opts.cuesOnly = true; }
    else throw new Error(`未知参数 / Unknown argument: ${key}`);
  }
  return opts;
}

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    'google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
  ].filter(Boolean);
  for (const bin of candidates) {
    if (bin.includes('/') ? existsSync(bin) : spawnSync('which', [bin]).status === 0) return bin;
  }
  throw new Error('找不到 Chrome，请设置 CHROME_PATH / Chrome not found, set CHROME_PATH');
}

function launchChrome(bin, userDir) {
  const proc = spawn(bin, [
    '--headless=new',
    '--remote-debugging-port=0',
    `--user-data-dir=${userDir}`,
    '--allow-file-access-from-files',
    '--hide-scrollbars',
    '--force-device-scale-factor=1',
    `--window-size=${WIDTH},${HEIGHT}`,
    '--force-color-profile=srgb',
    '--no-first-run',
    '--no-default-browser-check',
    '--mute-audio',
    'about:blank',
  ], { stdio: ['ignore', 'ignore', 'pipe'] });

  return new Promise((resolve, reject) => {
    let buf = '';
    const timer = setTimeout(() => reject(new Error('Chrome 启动超时 / Chrome launch timed out')), 20000);
    proc.stderr.on('data', (chunk) => {
      buf += chunk;
      const m = buf.match(/DevTools listening on (ws:\/\/\S+)/);
      if (m) { clearTimeout(timer); resolve({ proc, wsUrl: m[1] }); }
    });
    proc.on('exit', (code) => { clearTimeout(timer); reject(new Error(`Chrome 提前退出 / Chrome exited early (${code})`)); });
  });
}

/** 极简 CDP 客户端（flatten 会话模式）。/ Minimal CDP client using flattened sessions. */
function connectCdp(wsUrl) {
  if (typeof WebSocket === 'undefined') throw new Error('需要 Node >= 22 / Node >= 22 required (global WebSocket)');
  const ws = new WebSocket(wsUrl);
  let nextId = 1;
  const pending = new Map();
  ws.addEventListener('message', (ev) => {
    const msg = JSON.parse(ev.data);
    if (!msg.id || !pending.has(msg.id)) return;
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    if (msg.error) reject(new Error(`${msg.error.message} ${msg.error.data || ''}`));
    else resolve(msg.result);
  });
  const send = (method, params = {}, sessionId) => new Promise((resolve, reject) => {
    const id = nextId++;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params, sessionId }));
  });
  return new Promise((resolve, reject) => {
    ws.addEventListener('open', () => resolve({ send, close: () => ws.close() }));
    ws.addEventListener('error', reject);
  });
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const userDir = mkdtempSync(path.join(tmpdir(), 'stx-promo-'));
  const { proc, wsUrl } = await launchChrome(findChrome(), userDir);
  const cdp = await connectCdp(wsUrl);

  try {
    const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
    const page = (method, params) => cdp.send(method, params, sessionId);
    const evaluate = async (expression) => {
      const res = await page('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
      if (res.exceptionDetails) throw new Error(res.exceptionDetails.exception?.description || res.exceptionDetails.text);
      return res.result.value;
    };

    await page('Emulation.setDeviceMetricsOverride', { width: WIDTH, height: HEIGHT, deviceScaleFactor: 1, mobile: false });
    await page('Page.enable');
    const url = `${pathToFileURL(path.join(HERE, 'index.html')).href}?render`;
    await page('Page.navigate', { url });

    // 等待字体、截图解码与时间线就绪。/ Wait for fonts, decoded screenshots and the timeline.
    const meta = await evaluate(`new Promise((resolve) => {
      const tick = () => window.__STX_PROMO__
        ? window.__STX_PROMO__.ready.then(() => resolve({ fps: __STX_PROMO__.fps, duration: __STX_PROMO__.duration }))
        : setTimeout(tick, 50);
      tick();
    })`);

    // 导出音效提示点，供 soundtrack.py 对齐。/ Export sound cues for soundtrack.py.
    const cues = await evaluate('({ fps: __STX_PROMO__.fps, duration: __STX_PROMO__.duration, shots: __STX_PROMO__.shots, cues: __STX_PROMO__.cues })');
    mkdirSync(path.dirname(opts.out), { recursive: true });
    const cuesFile = path.join(path.dirname(opts.out), 'cues.json');
    writeFileSync(cuesFile, `${JSON.stringify(cues, null, 2)}\n`);
    if (opts.cuesOnly) {
      console.log(`cues -> ${cuesFile} (${cues.cues.length})`);
      return;
    }

    const capture = async (t, format = 'png') => {
      await evaluate(`(window.__STX_PROMO__.seek(${t}), new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(1)))))`);
      const { data } = await page('Page.captureScreenshot', { format, optimizeForSpeed: true, captureBeyondViewport: false });
      return Buffer.from(data, 'base64');
    };

    if (opts.stills) {
      const dir = path.extname(opts.out) ? path.join(path.dirname(opts.out), 'stills') : opts.out;
      mkdirSync(dir, { recursive: true });
      for (const t of opts.stills) {
        const file = path.join(dir, `still-${t.toFixed(2).padStart(5, '0')}s.png`);
        writeFileSync(file, await capture(t));
        console.log(`still ${t}s -> ${file}`);
      }
      return;
    }

    mkdirSync(path.dirname(opts.out), { recursive: true });
    const fps = meta.fps;
    const start = Math.round(opts.from * fps);
    const end = Math.round((opts.to ?? meta.duration) * fps);
    const silentOut = opts.audio ? opts.out.replace(/\.mp4$/, '.silent.mp4') : opts.out;

    const ffmpeg = spawn('ffmpeg', [
      '-y', '-loglevel', 'error',
      '-f', 'image2pipe', '-framerate', String(fps), '-i', '-',
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p',
      '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709',
      '-movflags', '+faststart',
      silentOut,
    ], { stdio: ['pipe', 'inherit', 'inherit'] });

    const began = Date.now();
    for (let f = start; f < end; f += 1) {
      const png = await capture(f / fps);
      if (!ffmpeg.stdin.write(png)) await once(ffmpeg.stdin, 'drain');
      if (f % fps === 0) {
        const done = f - start + 1;
        const eta = ((Date.now() - began) / done) * (end - start - done) / 1000;
        process.stdout.write(`\rframe ${f}/${end}  eta ${eta.toFixed(0)}s   `);
      }
    }
    ffmpeg.stdin.end();
    const [code] = await once(ffmpeg, 'exit');
    if (code !== 0) throw new Error(`ffmpeg 退出码 / ffmpeg exit code ${code}`);

    if (opts.audio) {
      const mux = spawnSync('ffmpeg', [
        '-y', '-loglevel', 'error', '-i', silentOut, '-i', opts.audio,
        '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest',
        '-movflags', '+faststart', opts.out,
      ], { stdio: 'inherit' });
      if (mux.status !== 0) throw new Error('混音失败 / audio mux failed');
    }
    console.log(`\n完成 / done -> ${opts.out}  (${((Date.now() - began) / 1000).toFixed(1)}s)`);
  } finally {
    cdp.close();
    if (proc.exitCode === null) {
      proc.kill('SIGKILL');
      await once(proc, 'exit');
    }
    rmSync(userDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
