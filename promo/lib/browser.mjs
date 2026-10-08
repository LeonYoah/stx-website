/**
 * 宣传片工具共用的无头 Chrome + 极简 CDP 客户端（零 npm 依赖，需要 Node >= 22 的内置 WebSocket）。
 * Shared headless Chrome + minimal CDP client for the promo tooling (zero npm deps, needs Node >= 22 built-in WebSocket).
 */
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { once } from 'node:events';
import { tmpdir } from 'node:os';
import path from 'node:path';

export function findChrome() {
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

function launchChrome(bin, userDir, extraArgs) {
  const proc = spawn(bin, [
    '--headless=new',
    '--remote-debugging-port=0',
    `--user-data-dir=${userDir}`,
    '--hide-scrollbars',
    '--force-color-profile=srgb',
    '--no-first-run',
    '--no-default-browser-check',
    '--mute-audio',
    ...extraArgs,
    'about:blank',
  ], { stdio: ['ignore', 'ignore', 'pipe'], detached: process.platform !== 'win32' });

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

function connectCdp(wsUrl) {
  if (typeof WebSocket === 'undefined') throw new Error('需要 Node >= 22 / Node >= 22 required (global WebSocket)');
  const ws = new WebSocket(wsUrl);
  let nextId = 1;
  const pending = new Map();
  const listeners = new Set();
  ws.addEventListener('message', (ev) => {
    const msg = JSON.parse(ev.data);
    if (!msg.id) {
      // 无 id 的是 CDP 事件，按方法名分发给订阅者。/ Messages without an id are CDP events; fan out to subscribers.
      for (const fn of listeners) fn(msg);
      return;
    }
    if (!pending.has(msg.id)) return;
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
    ws.addEventListener('open', () => resolve({
      send,
      subscribe: (fn) => { listeners.add(fn); return () => listeners.delete(fn); },
      close: () => ws.close(),
    }));
    ws.addEventListener('error', reject);
  });
}

/**
 * 打开一个页面会话：返回 page(method, params)、evaluate(expr) 与 on(event, handler)，用完调用 close()。
 * Open a page session exposing page(method, params), evaluate(expr) and on(event, handler); call close() when done.
 */
export async function openPage({ width, height, deviceScaleFactor = 1, chromeArgs = [] }) {
  const userDir = mkdtempSync(path.join(tmpdir(), 'stx-promo-'));
  const { proc, wsUrl } = await launchChrome(findChrome(), userDir, [`--window-size=${width},${height}`, ...chromeArgs]);
  const cdp = await connectCdp(wsUrl);
  const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
  const page = (method, params) => cdp.send(method, params, sessionId);
  const evaluate = async (expression) => {
    const res = await page('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (res.exceptionDetails) throw new Error(res.exceptionDetails.exception?.description || res.exceptionDetails.text);
    return res.result.value;
  };
  const on = (method, handler) => cdp.subscribe((msg) => {
    if (msg.method === method && msg.sessionId === sessionId) handler(msg.params);
  });
  await page('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor, mobile: false });
  await page('Page.enable');

  const close = async () => {
    cdp.close();
    if (proc.exitCode === null) {
      const exited = once(proc, 'exit');
      // 杀掉整个进程组：渲染 / GPU 子进程不随主进程退出，会继续写临时目录。
      // Kill the whole process group: renderer / GPU children outlive the main process and keep writing the temp dir.
      try { process.kill(-proc.pid, 'SIGKILL'); } catch { proc.kill('SIGKILL'); }
      await exited;
    }
    for (let i = 0; ; i += 1) {
      try {
        rmSync(userDir, { recursive: true, force: true });
        break;
      } catch (err) {
        if (i >= 10) { console.warn(`临时目录清理失败 / temp dir cleanup failed: ${userDir} (${err.code})`); break; }
        await new Promise((r) => setTimeout(r, 300));
      }
    }
  };
  return { page, evaluate, on, close };
}
