#!/usr/bin/env node
/**
 * 从 STX Web UI 截取宣传片用的高清截图（默认 1440×900 视口、2 倍像素密度 → 2880×1800）。
 * Capture high-DPI STX Web UI screenshots for the promo (1440×900 viewport at 2x DPR → 2880×1800 by default).
 *
 * 只做浏览与截图：登录后所有非 GET 的 /api 请求都会在浏览器内被拦截丢弃，不会到达服务端。
 * 账号只从环境变量读取，不要写进文件。
 * Read-only: after sign-in every non-GET /api request is dropped inside the browser and never reaches the server.
 * Credentials come from env vars only; never commit them.
 *
 * 用法 / Usage:
 *   STX_UI_USER=admin STX_UI_PASSWORD=*** node promo/capture.mjs                 # 按 SHOTS 输出 2x WebP 到 promo/assets/
 *   STX_UI_USER=admin STX_UI_PASSWORD=*** node promo/capture.mjs --preview       # 按 SHOTS 输出 1x JPEG 到 promo/assets/_explore/
 *   STX_UI_USER=admin STX_UI_PASSWORD=*** node promo/capture.mjs --explore       # 1x 预览 EXPLORE_ROUTES 全部页面
 *   ... --only workbench,dag                                                     # 只截指定镜头 / only the named shots
 *   STX_UI_URL=https://demo.stxcli.com（默认 / default）
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { openPage } from './lib/browser.mjs';
import { SHOTS, EXPLORE_ROUTES } from './shots.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BASE = (process.env.STX_UI_URL || 'https://demo.stxcli.com').replace(/\/+$/, '');
const USER = process.env.STX_UI_USER;
const PASSWORD = process.env.STX_UI_PASSWORD;
const VIEW_W = 1440;
const VIEW_H = 900;

// 注入到每个步骤表达式里的小工具。/ Small helpers injected into every step expression.
const HELPERS = `
  const visible = (el) => !!el && el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden';
  const byText = (re, sel = '*', root = document) => {
    const rx = re instanceof RegExp ? re : new RegExp(re);
    const hits = [...root.querySelectorAll(sel)].filter((el) => visible(el) && rx.test((el.textContent || '').trim()));
    return hits.find((el) => !hits.some((o) => o !== el && el.contains(o))) || null;
  };
  const closest = (el, sel) => (el ? el.closest(sel) : null);
`;
const wrap = (expr) => `(() => { ${HELPERS}; return (${expr}); })()`;

// 后端注册表里标为只读（RiskR0 / read_extras）但用 POST 承载查询体的接口，页面加载时会自动调用。
// POST routes the backend registry marks read-only (RiskR0 / read_extras); pages call them on load with a query body.
const READ_ONLY_POSTS = [
  /\/api\/v1\/sync\/plugins\/(list|options|enum-catalog)$/,
  /\/api\/v1\/sync\/curated-templates\/list$/,
  /\/api\/v1\/clusters\/\d+\/runtime-storage\/(checkpoint|imap)\/list$/,
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const argv = process.argv.slice(2);
  const explore = argv.includes('--explore');
  const preview = explore || argv.includes('--preview');
  const only = argv.includes('--only') ? argv[argv.indexOf('--only') + 1].split(',') : null;
  if (!USER || !PASSWORD) throw new Error('请设置 STX_UI_USER / STX_UI_PASSWORD / Set STX_UI_USER and STX_UI_PASSWORD');

  const dpr = preview ? 1 : 2;
  const outDir = path.join(HERE, 'assets', preview ? '_explore' : '');
  mkdirSync(outDir, { recursive: true });
  mkdirSync(path.join(HERE, 'assets', '_explore'), { recursive: true });

  const { page, evaluate, on, close } = await openPage({ width: VIEW_W, height: VIEW_H, deviceScaleFactor: dpr, chromeArgs: ['--lang=zh-CN'] });

  const waitFor = async (expr, timeout = 20000) => {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      if (await evaluate(`(() => { try { return !!${wrap(expr)}; } catch (e) { return false; } })()`)) return true;
      await sleep(200);
    }
    throw new Error(`等待超时 / timed out waiting for: ${expr}`);
  };
  const goto = async (url) => {
    await page('Page.navigate', { url: url.startsWith('http') ? url : `${BASE}${url}` });
    await waitFor('document.readyState === "complete"');
  };
  // 用真实鼠标事件点击（Radix 等组件依赖 pointer 事件）。/ Click with real mouse events (Radix relies on pointer events).
  const click = async (expr, timeout = 15000) => {
    const start = Date.now();
    let pos = null;
    while (Date.now() - start < timeout) {
      pos = await evaluate(`(() => { try {
        const el = ${wrap(expr)};
        if (!el) return null;
        el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        const r = el.getBoundingClientRect();
        return r.width && r.height ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null;
      } catch (e) { return null; } })()`);
      if (pos) break;
      await sleep(250);
    }
    if (!pos) throw new Error(`找不到可点击元素 / no clickable element for: ${expr}`);
    await page('Input.dispatchMouseEvent', { type: 'mouseMoved', x: pos.x, y: pos.y });
    await page('Input.dispatchMouseEvent', { type: 'mousePressed', x: pos.x, y: pos.y, button: 'left', clickCount: 1 });
    await page('Input.dispatchMouseEvent', { type: 'mouseReleased', x: pos.x, y: pos.y, button: 'left', clickCount: 1 });
  };

  // 请求守卫 + 夹具：GET 放行；命中当前镜头 mocks 的请求在本地应答；其余写请求一律丢弃。
  // Request guard + fixtures: GETs pass; requests matching the current shot's mocks are answered locally; other writes are dropped.
  let activeMocks = [];
  on('Fetch.requestPaused', async ({ requestId, request }) => {
    try {
      const mock = activeMocks.find((m) => m.match.test(request.url) && (!m.method || m.method === request.method));
      if (mock) {
        const payload = typeof mock.data === 'function' ? mock.data(request) : mock.data;
        const body = Buffer.from(JSON.stringify({ error_msg: '', data: payload })).toString('base64');
        await page('Fetch.fulfillRequest', { requestId, responseCode: 200, responseHeaders: [{ name: 'Content-Type', value: 'application/json; charset=utf-8' }], body });
      } else if (['GET', 'HEAD', 'OPTIONS'].includes(request.method) || READ_ONLY_POSTS.some((re) => re.test(request.url.split('?')[0]))) {
        await page('Fetch.continueRequest', { requestId });
      } else {
        console.warn(`  ! 已拦截写请求 / blocked ${request.method} ${request.url.replace(BASE, '')}`);
        await page('Fetch.failRequest', { requestId, errorReason: 'BlockedByClient' });
      }
    } catch (err) {
      console.warn(`  ! fetch handler: ${err.message}`);
    }
  });

  try {
    await page('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'dark' }, { name: 'prefers-reduced-motion', value: 'reduce' }] });
    await page('Emulation.setLocaleOverride', { locale: 'zh-CN' }).catch(() => {});
    await page('Emulation.setTimezoneOverride', { timezoneId: process.env.STX_UI_TZ || 'Asia/Shanghai' }).catch(() => {});

    // 通过登录页登录（与真实用户一致）。/ Sign in through the login form like a real user.
    await goto('/login');
    await waitFor('document.querySelector("input[type=password]")');
    await evaluate('document.querySelector("input:not([type=password]):not([type=hidden])").focus()');
    await page('Input.insertText', { text: USER });
    await evaluate('document.querySelector("input[type=password]").focus()');
    await page('Input.insertText', { text: PASSWORD });
    await evaluate('[...document.querySelectorAll("button")].find((b) => b.type === "submit" || /进入|登录|Sign in/i.test(b.textContent)).click()');
    await waitFor('!location.pathname.startsWith("/login")', 30000);
    await sleep(1500);
    await page('Fetch.enable', { patterns: [{ urlPattern: `${BASE}/api/*`, requestStage: 'Request' }] });

    const list = explore
      ? EXPLORE_ROUTES.map((url) => ({ name: url.replace(/\W+/g, '_').replace(/^_|_$/g, '') || 'root', url }))
      : SHOTS;
    for (const shot of list) {
      if (only && !only.includes(shot.name)) continue;
      activeMocks = shot.mocks || [];
      try {
        await goto(shot.url);
        if (shot.ready) await waitFor(shot.ready, 30000);
        await sleep(shot.settle ?? 2500);
        for (const step of shot.steps || []) {
          if (step.eval) await evaluate(wrap(step.eval));
          if (step.click) {
            // optional：元素不存在就跳过（例如目录已展开）。/ optional: skip when absent (e.g. folder already expanded).
            const ok = await click(step.click, step.optional ? 1500 : 15000).then(() => true, (err) => {
              if (!step.optional) throw err;
              return false;
            });
            if (!ok) continue;
          }
          if (step.waitFor) await waitFor(step.waitFor, step.timeout ?? 20000);
          await sleep(step.settle ?? 1200);
        }
        if (shot.css) {
          await evaluate(`(() => { const s = document.createElement('style'); s.textContent = ${JSON.stringify(shot.css)}; document.head.appendChild(s); })()`);
        }
        // 截图前去掉悬停与焦点框。/ Blur focus and park the mouse before capturing.
        await evaluate('document.activeElement && document.activeElement.blur && document.activeElement.blur()');
        await page('Input.dispatchMouseEvent', { type: 'mouseMoved', x: shot.mouse?.[0] ?? VIEW_W - 2, y: shot.mouse?.[1] ?? 2 });
        await sleep(400);
        const format = preview ? 'jpeg' : 'webp';
        const { data } = await page('Page.captureScreenshot', { format, quality: preview ? 80 : 94, captureBeyondViewport: false });
        const file = path.join(outDir, `${shot.name}.${format === 'jpeg' ? 'jpg' : 'webp'}`);
        writeFileSync(file, Buffer.from(data, 'base64'));
        console.log(`${shot.name} <- ${shot.url}  ${path.relative(process.cwd(), file)}`);
      } catch (err) {
        console.warn(`  ! ${shot.name}: ${err.message}`);
        const { data } = await page('Page.captureScreenshot', { format: 'jpeg', quality: 70 });
        writeFileSync(path.join(HERE, 'assets', '_explore', `${shot.name}.failed.jpg`), Buffer.from(data, 'base64'));
      }
    }
  } finally {
    await close();
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
