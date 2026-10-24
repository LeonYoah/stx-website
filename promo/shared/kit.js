/*
 * STX 宣传片共用动效工具包：30 秒 / 45 秒等各版本共用同一套场景模板、截图窗口、镜头推拉与音效提示点。
 * Shared motion kit for the STX promos: every cut (30s, 45s, ...) reuses the same scene templates, screenshot windows, camera moves and sound cues.
 *
 * 约定 / Conventions:
 * - 所有画面状态都挂在一条暂停的 GSAP 时间线上，渲染器逐帧 seek，因此不要使用 CSS 动画或定时器。
 *   Every visual state lives on one paused GSAP timeline that the renderer seeks per frame, so no CSS animations or timers.
 * - 截图来自 promo/capture.mjs（1440×900 视口、2 倍像素），元素位置来自同目录生成的 marks.js（按截图宽高的比例）。
 *   Screenshots come from promo/capture.mjs (1440×900 viewport at 2x); element boxes come from the generated marks.js as fractions of the shot.
 * - 窗口入场时短暂 3D 倾斜，落定后只用 2D 变换，保证截图里的文字清晰。
 *   Windows tilt in 3D only while entering and settle on plain 2D transforms so screenshot text stays sharp.
 */
(function () {
  'use strict';

  var STAGE_W = 1920;
  var STAGE_H = 1080;
  // 截图的 CSS 视口尺寸，用于把「源像素」换算成比例。/ CSS viewport of the screenshots, used to turn source pixels into fractions.
  var SRC_W = 1440;
  var SRC_H = 900;

  var $ = function (sel, root) { return typeof sel === 'string' ? (root || document).querySelector(sel) : sel; };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var clamp = function (v, lo, hi) { return Math.min(hi, Math.max(lo, v)); };
  var nums = function (str) { return String(str).trim().split(/\s+/).map(Number); };

  // 固定种子随机数，保证每次渲染布局一致。/ Seeded RNG so layouts are identical on every render.
  function rng(seed) {
    return function () {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 4294967296;
    };
  }

  function splitChars(el) {
    var text = el.textContent;
    el.textContent = '';
    Array.from(text).forEach(function (ch) {
      var s = document.createElement('span');
      s.className = 'c';
      s.textContent = ch;
      el.appendChild(s);
    });
    return $$('.c', el);
  }

  // S1 背景里的运维噪声：真实的 SeaTunnel 排障命令与报错片段。
  // S1 background noise: realistic SeaTunnel troubleshooting commands and errors.
  var LOG_LINES = [
    ['$ ssh root@10.0.3.12', 'cmd'],
    ['$ tail -f logs/seatunnel-engine-server.log', 'cmd'],
    ['ERROR CheckpointCoordinator - checkpoint 20 failed: timeout after 30000ms', 'err'],
    ['$ scp connector-cdc-mysql-2.3.13.jar node-02:/opt/seatunnel/connectors/', 'cmd'],
    ['java.lang.OutOfMemoryError: Java heap space', 'err'],
    ['WARN  Member [10.0.3.14]:5801 is not responding', ''],
    ['$ vim config/seatunnel.yaml', 'cmd'],
    ['java.lang.ClassNotFoundException: com.mysql.cj.jdbc.Driver', 'err'],
    ['$ diff hazelcast.yaml hazelcast.yaml.bak', 'cmd'],
    ["Job 1842 FAILED · Duplicate entry '10086' for key 'PRIMARY'", 'err'],
    ['$ ps -ef | grep seatunnel', 'cmd'],
    ['$ ./bin/seatunnel-cluster.sh -d', 'cmd'],
    ['Connection refused: 10.0.3.14:5801', 'err'],
    ['$ grep -n "Exception" logs/job-1842.log | tail', 'cmd'],
    ['$ cp seatunnel.yaml seatunnel.yaml.bak.$(date +%F)', 'cmd'],
    ['INFO  Hazelcast cluster members: 2 → 1', ''],
    ['$ kill -9 23817', 'cmd'],
    ['ERROR Sink[0]-Jdbc prepare commit failed', 'err']
  ];

  var CURSOR_HTML = '<i class="ripple"></i><svg viewBox="0 0 24 24"><path d="M4 2.5 19.5 13l-7 1.2-3.6 6.5z"/></svg>';

  var ICON_GITHUB = '<svg viewBox="0 0 24 24"><path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.7 5.4-5.27 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5z"/></svg>';
  var ICON_GLOBE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/></svg>';
  var ICON_SHIELD = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2 3 7v6c0 5 3.8 8.6 9 9 5.2-.4 9-4 9-9V7z"/><path d="m8.5 12 2.5 2.5 4.5-5"/></svg>';

  /**
   * 各版本共用的场景骨架：背景、痛点、品牌、AI Agent、收尾、角标、进度条。各版本的 index.html 只写功能镜头。
   * Scene skeleton shared by every cut: background, hook, brand, AI Agent, outro, badge and progress. Each cut's index.html only holds its feature shots.
   */
  function scaffold(stage, o) {
    var mark = o.brandMark;
    var before =
      '<div class="bg-grid"></div><div class="bg-glow" id="glow"></div><div class="bg-vignette"></div>' +
      '<section class="scene" id="s1"><div class="logs" id="logs"></div><div class="hook">' +
        '<div class="hook-l1 mask"><span>SeaTunnel 跑在生产</span></div>' +
        '<div class="hook-l2 mask"><span>运维却像个<em class="glitch" data-text="黑箱">黑箱</em>？</span></div>' +
      '</div></section>' +
      '<div class="cline" id="clineTop"></div><div class="cline" id="clineBot"></div><div class="sweep" id="sweep"></div>' +
      '<section class="scene" id="s2">' +
        '<div class="tagline mask"><span>让 SeaTunnel 运维<b class="accent">清晰可见</b></span></div>' +
        '<div class="tagsub">Apache SeaTunnel 一站式运维平台 · 原生 AI Agent 入口</div>' +
      '</section>';
    var ai =
      '<section class="scene feat" id="ai"><div class="copy">' +
        '<div class="chapter"><span class="num">' + o.aiChapter + '</span><i></i><span>AI Agent</span></div>' +
        '<h2 class="headline"><span class="ln"><span>交给 AI</span></span><span class="ln"><span class="accent">解放双手</span></span></h2>' +
        '<p class="sub">原生 AI Agent 入口 · CLI + Skill</p>' +
        '<div class="chips"><span>风险分级</span><span>写操作需确认</span></div>' +
      '</div><div class="visual"><div class="stack">' +
        '<div class="win chat" id="ai-chat" style="left:40px;top:170px;width:1000px">' +
          '<div class="win-bar"><i></i><i></i><i></i><span class="win-title">STX · AI Agent</span></div>' +
          '<div class="chat-body">' +
            '<div class="msg user"><span class="typed">帮我看看 6 号集群有没有失败的同步作业，先查状态和日志，不要改动环境。</span><span class="caret"></span></div>' +
            '<div class="msg ai"><img src="' + mark + '" alt="" />先查集群和节点，再列出失败作业、读取日志，全程只查询。</div>' +
            '<div class="tools">' +
              '<div class="tool"><span class="st"><i class="spin"></i><b class="ok">✓</b></span><code>stx cluster list --output table</code><span class="res">集群 6 · zeta-prod · 2.3.13</span></div>' +
              '<div class="tool"><span class="st"><i class="spin"></i><b class="ok">✓</b></span><code>stx cluster node list 6</code><span class="res">节点在线</span></div>' +
              '<div class="tool"><span class="st"><i class="spin"></i><b class="ok">✓</b></span><code>stx sync job list --status FAILED</code><span class="res warn">作业 1842 · FAILED</span></div>' +
              '<div class="tool"><span class="st"><i class="spin"></i><b class="ok">✓</b></span><code>stx sync job logs 1842 --lines 40</code><span class="res">线索：Duplicate key</span></div>' +
            '</div>' +
            '<div class="done"><i></i><b>查询完成 · 等待你决定</b><span>未执行任何写操作</span></div>' +
          '</div>' +
        '</div>' +
      '</div></div></section>';
    var after =
      '<section class="scene" id="s9">' +
        '<div class="tagline mask"><span>让 SeaTunnel 运维<b class="accent">清晰可见</b></span></div>' +
        '<div class="cmd"><span class="p">$</span><code>curl -fsSL https://github.com/LeonYoah/stx/releases/latest/download/install-online.sh | bash</code><span class="caret"></span></div>' +
        '<div class="links">' +
          '<span>' + ICON_GITHUB + 'github.com/LeonYoah/stx</span>' +
          '<span>' + ICON_GLOBE + '在线体验 demo.stxcli.com</span>' +
          '<span>' + ICON_SHIELD + 'Apache-2.0 开源</span>' +
        '</div>' +
      '</section>' +
      '<div id="brand"><img src="' + mark + '" alt="STX" /><span class="word"><b>S</b><b>T</b><b>X</b></span></div>' +
      '<div id="progress">' + new Array(o.chapters + 1).join('<i></i>') + '</div>' +
      '<div class="flash" id="flash"></div>';
    stage.insertAdjacentHTML('afterbegin', before);
    stage.insertAdjacentHTML('beforeend', ai + after);
  }

  // 窗口入场预设 / Window entrance presets
  var WIN_IN = {
    right: [{ x: 240, y: 30, autoAlpha: 0 }, { duration: 0.9, ease: 'power4.out' }],
    up: [{ y: 150, autoAlpha: 0 }, { duration: 0.85, ease: 'power4.out' }],
    pop: [{ scale: 0.88, y: 50, autoAlpha: 0 }, { duration: 0.7, ease: 'back.out(1.3)' }],
    sheet: [{ x: 300, autoAlpha: 0 }, { duration: 0.75, ease: 'power4.out' }]
  };

  /**
   * 创建一支宣传片的时间线与工具函数。
   * Create the timeline and helpers for one promo cut.
   *
   * @param {{fps?: number, duration: number, shots: Object<string, number>, chapters: number, aiChapter: string, assets?: string, brandMark?: string}} opts
   *   shots 为镜头起点（秒）；chapters 为进度条段数；aiChapter 为 AI Agent 章节号；assets 为截图目录（相对 index.html）。
   *   shots are shot start times (s); chapters is the progress segment count; aiChapter numbers the AI Agent chapter; assets is the screenshot dir relative to index.html.
   */
  function create(opts) {
    var FPS = opts.fps || 30;
    var DURATION = opts.duration;
    var T = opts.shots;
    var ASSETS = opts.assets || '../assets/';
    var MARKS = window.STX_MARKS || {};

    scaffold($('#stage'), {
      brandMark: opts.brandMark || '../../static/img/stx-mark.png',
      aiChapter: opts.aiChapter,
      chapters: opts.chapters
    });

    // 全局关闭强制 3D，避免合成层按旧缩放栅格化导致文字发虚。
    // Disable forced 3D globally so composited layers are not rasterized at a stale scale (blurry text).
    gsap.config({ force3D: false });

    var tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });

    // 音效提示点：渲染器导出为 cues.json 供配乐脚本对齐。/ Sound cues exported to cues.json for the score script.
    var cues = [];
    function cue(type, at, extra) {
      cues.push(Object.assign({ type: type, t: Math.round(at * 1000) / 1000 }, extra || {}));
    }

    function mark(shot, key) {
      var m = MARKS[shot] && MARKS[shot][key];
      if (!m) throw new Error('缺少截图标记 / missing mark: ' + shot + '.' + key);
      return m;
    }

    // 元素框：data-mark 取 marks.js，data-box 直接写比例 "x y w h"。/ Box from data-mark (marks.js) or data-box "x y w h" fractions.
    function boxOf(el, shot) {
      if (el.dataset.mark) return mark(shot, el.dataset.mark);
      if (el.dataset.box) return nums(el.dataset.box);
      return null;
    }

    function resolveBox(win, key) {
      if (Array.isArray(key)) return key;
      return mark(win._geo.shot, key);
    }

    /**
     * 把 .win[data-shot] 组装成「标题栏 + 可裁剪截图 + 镜头层」窗口。
     * Assemble each .win[data-shot] into a title bar, a croppable screenshot and a camera layer.
     *
     * data-crop="l t r b" 为四边裁掉的比例；子元素用 data-mark / data-box 定位，data-pad 为外扩的源像素。
     * data-crop="l t r b" trims each edge by a fraction; children are placed via data-mark / data-box, data-pad grows them in source px.
     */
    function buildWindows() {
      $$('.win[data-shot]').forEach(function (win) {
        var shot = win.dataset.shot;
        var ar = parseFloat(win.dataset.ar || String(SRC_W / SRC_H));
        var crop = nums(win.dataset.crop || '0 0 0 0');
        var bodyW = win.clientWidth;
        var wrapW = bodyW / (1 - crop[0] - crop[2]);
        var wrapH = wrapW / ar;
        var bodyH = wrapH * (1 - crop[1] - crop[3]);
        var left = -crop[0] * wrapW;
        var top = -crop[1] * wrapH;

        var overlays = Array.prototype.slice.call(win.children);

        var bar = document.createElement('div');
        bar.className = 'win-bar';
        bar.innerHTML = '<i></i><i></i><i></i><span class="win-title"></span>';
        bar.querySelector('.win-title').textContent = win.dataset.title || '';

        var body = document.createElement('div');
        body.className = 'win-body';
        body.style.height = bodyH.toFixed(1) + 'px';

        var zoom = document.createElement('div');
        zoom.className = 'zoom';

        var wrap = document.createElement('div');
        wrap.className = 'img-wrap';
        wrap.style.width = wrapW.toFixed(1) + 'px';
        wrap.style.height = wrapH.toFixed(1) + 'px';
        wrap.style.left = left.toFixed(1) + 'px';
        wrap.style.top = top.toFixed(1) + 'px';
        // --u：截图 1 个 CSS 像素在画面中的大小，叠加文字按它缩放才能与界面字号一致。
        // --u: on-stage size of one screenshot CSS pixel; overlay text scales by it to match the UI type size.
        wrap.style.setProperty('--u', (wrapW / SRC_W).toFixed(4));

        var img = document.createElement('img');
        img.src = ASSETS + shot + '.webp';
        img.alt = '';
        wrap.appendChild(img);

        overlays.forEach(function (el) {
          var box = boxOf(el, shot);
          if (box) {
            var pad = parseFloat(el.dataset.pad || (el.classList.contains('hl') ? '6' : '0'));
            var px = pad / SRC_W;
            var py = pad / SRC_H;
            el.style.left = ((box[0] - px) * 100).toFixed(3) + '%';
            el.style.top = ((box[1] - py) * 100).toFixed(3) + '%';
            el.style.width = ((box[2] + 2 * px) * 100).toFixed(3) + '%';
            el.style.height = ((box[3] + 2 * py) * 100).toFixed(3) + '%';
          }
          wrap.appendChild(el);
        });

        zoom.appendChild(wrap);
        body.appendChild(zoom);
        win.appendChild(bar);
        win.appendChild(body);
        gsap.set(zoom, { transformOrigin: '0 0' });

        win._geo = { shot: shot, crop: crop, bodyW: bodyW, bodyH: bodyH, wrapW: wrapW, wrapH: wrapH, left: left, top: top };
      });
    }

    /**
     * 镜头推拉：把截图里的某个元素推到窗口指定位置（默认居中）并放大；key 为 null 时回到全景。
     * Camera move: push a screenshot element to a spot in the window (centre by default) and scale up; key null returns to the full view.
     * 平移量会被夹在裁剪区域内，推近时不会露出被裁掉的部分。/ Translation is clamped to the crop so zooming never reveals trimmed areas.
     */
    function zoomTo(winSel, key, at, o) {
      o = o || {};
      var win = $(winSel);
      var g = win._geo;
      var s = key ? (o.scale || 1.4) : 1;
      var tx = 0;
      var ty = 0;
      if (key) {
        var r = resolveBox(win, key);
        var cx = g.left + (r[0] + r[2] / 2) * g.wrapW;
        var cy = g.top + (r[1] + r[3] / 2) * g.wrapH;
        tx = clamp((o.fx == null ? 0.5 : o.fx) * g.bodyW - s * cx, g.bodyW * (1 - s), 0);
        ty = clamp((o.fy == null ? 0.5 : o.fy) * g.bodyH - s * cy, g.bodyH * (1 - s), 0);
      }
      cue('zoom', at, { dir: key ? 'in' : 'out' });
      tl.to($('.zoom', win), { x: tx, y: ty, scale: s, duration: o.dur || 0.9, ease: o.ease || 'power3.inOut' }, at);
    }

    function highlight(el, at, holdFor) {
      el = $(el);
      cue('hl', at);
      tl.fromTo(el, { autoAlpha: 0, scale: 1.25 }, { autoAlpha: 1, scale: 1, duration: 0.45, ease: 'back.out(2)', immediateRender: false }, at);
      if (holdFor) tl.to(el, { autoAlpha: 0, duration: 0.3, ease: 'power1.in' }, at + holdFor);
    }

    // 弹出一组元素（如「已下载」标记），每个配一声提示音。/ Pop a group of elements (e.g. "downloaded" pills) with a blip each.
    function pops(els, at, step) {
      (typeof els === 'string' ? $$(els) : els).forEach(function (el, i) {
        var t = at + i * (step || 0.14);
        cue('pop', t, { index: i });
        tl.fromTo(el, { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: 0.35, ease: 'back.out(2.2)', immediateRender: false }, t);
      });
    }

    /**
     * 光标从 from 滑到 to 并点击，返回点击时刻。to 可以是标记名或源比例 [x, y]。
     * Glide the cursor from `from` to `to` and click; returns the click time. `to` is a mark key or source fractions [x, y].
     */
    function cursorClick(winSel, o) {
      var win = $(winSel);
      var g = win._geo;
      var wrap = $('.img-wrap', win);
      var c = document.createElement('div');
      c.className = 'cursor';
      c.innerHTML = CURSOR_HTML;
      wrap.appendChild(c);

      var to = o.to;
      if (!Array.isArray(to) || to.length === 4) {
        var r = resolveBox(win, to);
        to = [r[0] + r[2] / 2, r[1] + r[3] / 2];
      }
      var from = o.from || [
        g.crop[0] + (1 - g.crop[0] - g.crop[2]) * 0.55,
        g.crop[1] + (1 - g.crop[1] - g.crop[3]) * 0.8
      ];
      var pct = function (v) { return (v * 100).toFixed(3) + '%'; };
      gsap.set(c, { left: pct(from[0]), top: pct(from[1]) });

      var move = o.move || 0.6;
      tl.to(c, { autoAlpha: 1, duration: 0.2, ease: 'none' }, o.at);
      tl.to(c, { left: pct(to[0]), top: pct(to[1]), duration: move, ease: 'power3.inOut' }, o.at);
      var click = o.at + move + 0.05;
      cue('click', click);
      tl.to($('svg', c), { scale: 0.8, duration: 0.08, ease: 'power1.in', transformOrigin: '6px 4px' }, click);
      tl.to($('svg', c), { scale: 1, duration: 0.16, ease: 'power1.out' }, click + 0.08);
      tl.fromTo($('.ripple', c), { scale: 0.2, autoAlpha: 1 }, { scale: 1.7, autoAlpha: 0, duration: 0.5, ease: 'power2.out', immediateRender: false }, click);
      tl.to(c, { autoAlpha: 0, duration: 0.25, ease: 'none' }, click + (o.hide || 0.55));
      return click;
    }

    // 镜头切换时的竖向扫描光 / Vertical scan sweep between shots
    function sweep(at) {
      cue('whoosh', at, { dur: 0.6 });
      tl.fromTo('#sweep', { x: -30, autoAlpha: 1 }, { x: STAGE_W + 30, duration: 0.6, ease: 'power2.inOut', immediateRender: false }, at);
      tl.set('#sweep', { autoAlpha: 0 }, at + 0.61);
    }

    /**
     * 功能镜头：左侧文案逐行上浮；右侧窗口按计划入场，整组先 3D 倾斜后落平，再做极慢推镜；结束时整体左移淡出。
     * Feature shot: copy rises line by line; windows enter on schedule while the stack tilts in and settles flat, then a very slow push; everything exits left.
     *
     * @param {string} sel 场景选择器 / scene selector
     * @param {number} t0 起点 / start
     * @param {number} t1 终点（下一镜起点）/ end (next shot start)
     * @param {Array<{el: string, at: number, style?: string}>} wins 窗口入场计划 / window entrance plan
     */
    function feature(sel, t0, t1, wins) {
      var s = $(sel);
      var stack = $('.stack', s);
      var SETTLE = 1.1;
      tl.set(s, { autoAlpha: 1 }, t0);
      tl.from($('.chapter', s), { x: -40, autoAlpha: 0, duration: 0.5 }, t0 + 0.05);
      tl.from($$('.headline .ln > span', s), { yPercent: 115, autoAlpha: 0, duration: 0.75, ease: 'expo.out', stagger: 0.09 }, t0 + 0.1);
      tl.from($('.sub', s), { y: 24, autoAlpha: 0, duration: 0.6 }, t0 + 0.35);
      tl.from($$('.chips span', s), { y: 18, autoAlpha: 0, duration: 0.5, stagger: 0.06 }, t0 + 0.45);

      tl.set(stack, { transformPerspective: 2400 }, t0);
      tl.fromTo(stack,
        { rotationY: 9, rotationX: 2.5, scale: 0.96 },
        { rotationY: 0, rotationX: 0, scale: 1, duration: SETTLE, ease: 'power3.out' }, t0);
      // 落平后去掉透视，只剩 2D 缩放。/ Drop the perspective once flat so only a 2D scale remains.
      tl.set(stack, { transformPerspective: 0 }, t0 + SETTLE);
      tl.fromTo(stack, { scale: 1 }, { scale: 1.02, duration: t1 - t0 - SETTLE, ease: 'none', immediateRender: false }, t0 + SETTLE);

      wins.forEach(function (w) {
        var preset = WIN_IN[w.style || 'right'];
        tl.from(w.el, Object.assign({}, preset[0], preset[1]), t0 + w.at);
      });

      tl.to($('.copy', s), { y: -36, autoAlpha: 0, duration: 0.32, ease: 'power2.in' }, t1 - 0.32);
      tl.to($('.visual', s), { x: -150, autoAlpha: 0, duration: 0.36, ease: 'power2.in' }, t1 - 0.34);
      tl.set(s, { autoAlpha: 0 }, t1 + 0.02);
    }

    // ---------- S1 痛点：运维黑箱 / Hook: ops as a black box ----------
    function hook() {
      var end = T.s2;
      var box = $('#logs');
      var rand = rng(20261008);
      var rows = LOG_LINES.length;
      LOG_LINES.forEach(function (item, i) {
        var el = document.createElement('div');
        el.className = 'log ' + item[1];
        el.textContent = item[0];
        var estW = item[0].length * 12.7;
        el.style.top = (46 + ((i * 7) % rows) * 56) + 'px';
        el.style.left = Math.round(40 + rand() * Math.max(0, 1840 - estW)) + 'px';
        box.appendChild(el);
      });

      tl.set('#s1', { autoAlpha: 1 }, T.s1);
      $$('.log', box).forEach(function (el, i) {
        tl.fromTo(el, { autoAlpha: 0, x: i % 2 ? 46 : -46 }, { autoAlpha: 1, x: 0, duration: 0.5, ease: 'power2.out' }, 0.05 + i * 0.13);
        cue(el.classList.contains('err') ? 'logErr' : 'log', 0.05 + i * 0.13);
      });
      tl.fromTo('#logs', { scale: 1 }, { scale: 1.07, duration: end - 0.5, ease: 'none' }, 0);
      tl.from('#s1 .hook-l1 > span', { yPercent: 115, duration: 0.65, ease: 'expo.out' }, 0.4);
      tl.from('#s1 .hook-l2 > span', { yPercent: 115, duration: 0.75, ease: 'expo.out' }, 1.1);

      // 「黑箱」故障闪烁：离散关键帧，逐帧渲染也稳定。/ Glitch on「黑箱」: discrete keyframes so frame rendering stays stable.
      var glitch = $('#s1 .glitch');
      var hookL2 = $('#s1 .hook-l2');
      [
        [1.55, 7, -2, 0.95, -5], [1.62, -9, 3, 0.9, 6], [1.69, 0, 0, 0, 0],
        [2.15, 11, 1, 1, 7], [2.22, -6, -3, 0.85, -4], [2.29, 0, 0, 0, 0],
        [2.7, 5, 2, 0.75, 3], [2.76, 0, 0, 0, 0]
      ].forEach(function (k) {
        tl.set(glitch, { '--gx': k[1] + 'px', '--gy': k[2] + 'px', '--ga': k[3] }, k[0]);
        tl.set(hookL2, { x: k[4] }, k[0]);
        if (k[3] > 0) cue('glitch', k[0]);
      });

      // 混乱收束成一条光线 / Chaos collapses into a single beam
      tl.to(['#logs', '#s1 .hook'], { scaleY: 0.02, autoAlpha: 0, duration: 0.38, ease: 'power3.in', transformOrigin: '50% 50%' }, end - 0.55);
      tl.fromTo(['#clineTop', '#clineBot'], { scaleX: 0, autoAlpha: 1 }, { scaleX: 1, duration: 0.45, ease: 'expo.out' }, end - 0.45);
      tl.to('#flash', { opacity: 0.14, duration: 0.06, ease: 'none' }, end - 0.15);
      tl.to('#flash', { opacity: 0, duration: 0.35, ease: 'power2.out' }, end - 0.09);
      tl.set('#s1', { autoAlpha: 0 }, end - 0.1);
      cue('collapse', end - 0.55);
      cue('impact', end, { size: 'big' });
    }

    // ---------- S2 品牌亮相，随后缩成左上角角标 / Brand reveal, then shrink into the corner badge ----------
    var brandEl = null;
    var BRAND_Y = -120;
    function brand() {
      var s2 = T.s2;
      var f1 = T.f1;
      brandEl = $('#brand');
      gsap.set(brandEl, { xPercent: -50, yPercent: -50, y: BRAND_Y });
      var CORNER_SCALE = 0.2;
      var cornerX = 140 + (brandEl.offsetWidth * CORNER_SCALE) / 2 - STAGE_W / 2;
      var cornerY = 58 + (brandEl.offsetHeight * CORNER_SCALE) / 2 - STAGE_H / 2;

      tl.to('#clineTop', { y: -300, duration: 0.95, ease: 'expo.inOut' }, s2 - 0.05);
      tl.to('#clineBot', { y: 300, duration: 0.95, ease: 'expo.inOut' }, s2 - 0.05);
      tl.to(['#clineTop', '#clineBot'], { autoAlpha: 0, duration: 0.5, ease: 'power1.in' }, s2 + 0.5);

      tl.set('#s2', { autoAlpha: 1 }, s2);
      tl.fromTo('#glow', { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 1.6, ease: 'expo.out' }, s2 - 0.05);
      tl.set(brandEl, { autoAlpha: 1 }, s2 + 0.02);
      tl.fromTo('#brand img',
        { autoAlpha: 0, scale: 0.5, x: -90, filter: 'blur(30px)' },
        { autoAlpha: 1, scale: 1, x: 0, filter: 'blur(0px)', duration: 1.0, ease: 'expo.out' }, s2 + 0.02);
      tl.fromTo('#brand .word b',
        { autoAlpha: 0, y: 70, filter: 'blur(14px)' },
        { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.8, ease: 'expo.out', stagger: 0.08 }, s2 + 0.22);
      [0, 1, 2].forEach(function (i) { cue('letter', s2 + 0.22 + i * 0.08, { index: i }); });
      tl.from('#s2 .tagline > span', { yPercent: 115, duration: 0.8, ease: 'expo.out' }, s2 + 0.8);
      cue('bell', s2 + 0.8);
      tl.from('#s2 .tagsub', { y: 26, autoAlpha: 0, duration: 0.7 }, s2 + 1.15);

      tl.to(['#s2 .tagline', '#s2 .tagsub'], { autoAlpha: 0, y: -30, duration: 0.35, ease: 'power2.in', stagger: 0.05 }, f1 - 0.55);
      tl.to(brandEl, { x: cornerX, y: cornerY, scale: CORNER_SCALE, duration: 0.75, ease: 'power3.inOut' }, f1 - 0.5);
      cue('riser', f1 - 0.5, { end: f1 });
      cue('impact', f1, { size: 'mid' });
      tl.set('#s2', { autoAlpha: 0 }, f1 - 0.1);
      tl.to('#glow', { x: 430, y: 20, opacity: 0.75, duration: 1.2, ease: 'power2.inOut' }, f1 - 0.5);
    }

    /**
     * AI Agent 对话：逐字输入 → AI 回复 → CLI 工具逐条转圈打勾 → 结论卡片。返回关键时刻。
     * AI Agent chat: type the prompt → AI reply → CLI tools spin and tick one by one → summary card. Returns key times.
     *
     * @param {{typeAt?: number, typeStep?: number, toolsAt?: number, rowStep?: number}} o
     */
    function aiChat(sel, t0, o) {
      o = o || {};
      var s = $(sel);
      var chars = splitChars($('.typed', s));
      var typeAt = o.typeAt != null ? o.typeAt : t0 + 0.4;
      var typeStep = o.typeStep || 0.018;
      var rowStep = o.rowStep || 0.26;
      tl.to(chars, { display: 'inline', duration: 0.001, stagger: typeStep, ease: 'none' }, typeAt);
      var typedEnd = typeAt + chars.length * typeStep;
      chars.forEach(function (_, i) { cue('type', typeAt + i * typeStep); });
      tl.set($('.msg.user .caret', s), { autoAlpha: 0 }, typedEnd + 0.08);
      tl.from($('.msg.ai', s), { y: 16, autoAlpha: 0, duration: 0.4 }, typedEnd + 0.08);
      var toolsAt = o.toolsAt != null ? o.toolsAt : typedEnd + 0.3;
      tl.from($('.tools', s), { y: 16, autoAlpha: 0, duration: 0.35 }, toolsAt - 0.04);
      var rows = $$('.tool', s);
      rows.forEach(function (row, i) {
        var at = toolsAt + i * rowStep;
        var okAt = at + Math.min(0.32, rowStep * 0.9);
        tl.from(row, { x: 24, autoAlpha: 0, duration: 0.35 }, at);
        tl.fromTo($('.spin', row), { rotation: 0 }, { rotation: 540, duration: 0.6, ease: 'none', immediateRender: false }, at);
        tl.to($('.spin', row), { autoAlpha: 0, duration: 0.1, ease: 'none' }, okAt);
        cue('ok', okAt, { index: i });
        tl.fromTo($('.ok', row), { autoAlpha: 0, scale: 0.4 }, { autoAlpha: 1, scale: 1, duration: 0.3, ease: 'back.out(2.5)', immediateRender: false }, okAt);
      });
      var doneAt = toolsAt + rows.length * rowStep + 0.05;
      tl.from($('.done', s), { y: 24, scale: 0.97, autoAlpha: 0, duration: 0.55, ease: 'power2.out' }, doneAt);
      cue('done', doneAt);
      return { typedEnd: typedEnd, toolsAt: toolsAt, doneAt: doneAt };
    }

    // ---------- 章节进度条 / Chapter progress bar ----------
    function progress(starts) {
      tl.to('#progress', { autoAlpha: 1, duration: 0.4 }, starts[0] + 0.2);
      $$('#progress i').forEach(function (seg, i) {
        tl.fromTo(seg, { '--p': 0 }, { '--p': 1, duration: starts[i + 1] - starts[i], ease: 'none', immediateRender: false }, starts[i]);
      });
      tl.to('#progress', { autoAlpha: 0, duration: 0.3 }, starts[starts.length - 1] - 0.25);
    }

    // ---------- S9 收尾：品牌回到中央 + 安装命令 / Outro: brand back to centre + install command ----------
    function outro() {
      var s9 = T.s9;
      tl.set('#s9', { autoAlpha: 1 }, s9);
      cue('impact', s9, { size: 'big' });
      tl.to(brandEl, { x: 0, y: BRAND_Y - 20, scale: 1, duration: 0.9, ease: 'power3.inOut' }, s9 - 0.05);
      tl.to('#glow', { x: 0, y: -90, opacity: 1, scale: 1.1, duration: 1.0, ease: 'power2.inOut' }, s9 - 0.1);
      tl.from('#s9 .tagline > span', { yPercent: 115, duration: 0.8, ease: 'expo.out' }, s9 + 0.65);
      tl.from('#s9 .cmd', { y: 30, autoAlpha: 0, duration: 0.6 }, s9 + 1.0);
      tl.fromTo('#s9 .cmd code', { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 0.8, ease: 'steps(48)' }, s9 + 1.25);
      for (var k = 0; k < 16; k += 1) cue('type', s9 + 1.25 + k * 0.05);
      tl.fromTo('#s9 .cmd .caret', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01, immediateRender: false }, s9 + 2.05);
      // 光标一直闪到片尾 / Caret keeps blinking until the end
      for (var d = 2.5; s9 + d + 0.25 < DURATION - 0.05; d += 0.5) {
        tl.set('#s9 .cmd .caret', { autoAlpha: 0 }, s9 + d);
        tl.set('#s9 .cmd .caret', { autoAlpha: 1 }, s9 + d + 0.25);
      }
      tl.from('#s9 .links span', { y: 20, autoAlpha: 0, duration: 0.6, stagger: 0.1 }, s9 + 1.7);
      sweep(s9 + 2.15);
    }

    /**
     * 发布渲染 / 预览接口。music 为配乐锚点（如间奏段），会随 cues.json 一起导出。
     * Publish the render / preview API. `music` carries score anchors (e.g. breakdowns) exported with cues.json.
     */
    function publish(extra) {
      extra = extra || {};
      tl.to('.bg-grid', { x: 80, y: 160, duration: DURATION, ease: 'none' }, 0);
      tl.set('#flash', { opacity: 0 }, 0);
      tl.set({}, {}, DURATION);

      var images = $$('img');
      var ready = Promise.all([document.fonts.ready].concat(images.map(function (img) {
        return img.decode().catch(function () {});
      })));

      window.__STX_PROMO__ = {
        fps: FPS,
        duration: DURATION,
        shots: T,
        music: extra.music || {},
        cues: cues.sort(function (a, b) { return a.t - b.t; }),
        ready: ready,
        seek: function (t) { tl.seek(t, false); },
        timeline: tl
      };

      var params = new URLSearchParams(location.search);
      if (params.has('render')) return;

      // 浏览器预览：自适应缩放 + 自动播放，空格暂停，←/→ 逐帧，R 重播，?t=秒 定格。
      // Browser preview: fit-to-window + autoplay; Space pauses, ←/→ steps a frame, R replays, ?t=seconds holds a still.
      var stage = $('#stage');
      function fit() {
        var s = Math.min(innerWidth / STAGE_W, innerHeight / STAGE_H);
        stage.style.transform = 'translate(' + (innerWidth - STAGE_W * s) / 2 + 'px,' + (innerHeight - STAGE_H * s) / 2 + 'px) scale(' + s + ')';
      }
      fit();
      addEventListener('resize', fit);
      ready.then(function () {
        if (params.has('t')) { tl.seek(parseFloat(params.get('t')) || 0, false); return; }
        tl.play(0);
      });
      addEventListener('keydown', function (e) {
        if (e.code === 'Space') { e.preventDefault(); tl.paused(!tl.paused()); }
        if (e.code === 'ArrowRight') { tl.pause(); tl.seek(Math.min(DURATION, tl.time() + 1 / FPS), false); }
        if (e.code === 'ArrowLeft') { tl.pause(); tl.seek(Math.max(0, tl.time() - 1 / FPS), false); }
        if (e.code === 'KeyR') tl.play(0);
      });
    }

    buildWindows();

    return {
      tl: tl,
      T: T,
      $: $,
      $$: $$,
      cue: cue,
      mark: mark,
      zoomTo: zoomTo,
      highlight: highlight,
      pops: pops,
      cursorClick: cursorClick,
      sweep: sweep,
      feature: feature,
      hook: hook,
      brand: brand,
      aiChat: aiChat,
      progress: progress,
      outro: outro,
      publish: publish
    };
  }

  window.PromoKit = { create: create };
})();
