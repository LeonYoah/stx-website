/*
 * STX 30 秒宣传片时间线。所有画面状态都由这一条暂停的 GSAP 时间线决定，渲染器按帧调用 seek。
 * STX 30s promo timeline. One paused GSAP timeline owns every visual state; the renderer seeks it frame by frame.
 *
 * 镜头时间码（秒）与 STORYBOARD.md 保持一致，改动时两边同步。
 * Shot timecodes (seconds) mirror STORYBOARD.md; keep both in sync when editing.
 */
(function () {
  'use strict';

  var FPS = 30;
  var DURATION = 30;

  // 镜头起点：全部落在 150 BPM 的拍点（0.4s）上，配乐重拍与切镜对齐。
  // Shot start times: all on the 150 BPM beat grid (0.4s) so cuts hit the downbeats of the score.
  var T = { s1: 0, s2: 3.6, f1: 6.4, f2: 10.0, f3: 13.2, f4: 16.4, f5: 19.6, f6: 22.8, s9: 26.4 };

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  // 固定种子随机数，保证每次渲染的日志布局一致。
  // Seeded RNG so the log layout is identical on every render.
  function rng(seed) {
    return function () {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 4294967296;
    };
  }

  /**
   * 把带 data-src 的 .win 组装成「标题栏 + 可裁剪截图」窗口；高亮框等子元素按原图百分比定位。
   * Assemble each .win[data-src] into a title bar + croppable screenshot; overlays are positioned in source-image percentages.
   */
  function buildWindows() {
    $$('.win[data-src]').forEach(function (win) {
      var ar = parseFloat(win.dataset.ar);
      var crop = (win.dataset.crop || '0 0 0 0').split(/\s+/).map(Number);
      var innerW = win.clientWidth;
      var wrapW = innerW / (1 - crop[0] - crop[2]);
      var wrapH = wrapW / ar;
      var bodyH = wrapH * (1 - crop[1] - crop[3]);

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
      wrap.style.left = (-crop[0] * wrapW).toFixed(1) + 'px';
      wrap.style.top = (-crop[1] * wrapH).toFixed(1) + 'px';

      var img = document.createElement('img');
      img.src = win.dataset.src;
      img.alt = '';
      wrap.appendChild(img);
      overlays.forEach(function (el) { wrap.appendChild(el); });

      zoom.appendChild(wrap);
      body.appendChild(zoom);
      win.appendChild(bar);
      win.appendChild(body);
    });
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

  function buildLogs() {
    var rand = rng(20261008);
    var box = $('#logs');
    var rows = LOG_LINES.length;
    LOG_LINES.forEach(function (item, i) {
      var el = document.createElement('div');
      el.className = 'log ' + item[1];
      el.textContent = item[0];
      var estW = item[0].length * 12.7;
      var row = (i * 7) % rows;
      el.style.top = (46 + row * 56) + 'px';
      el.style.left = Math.round(40 + rand() * Math.max(0, 1840 - estW)) + 'px';
      box.appendChild(el);
    });
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

  // 音效提示点：时间线在关键动作处登记，渲染器导出为 cues.json 供配乐脚本对齐。
  // Sound cues: the timeline registers key actions; the renderer exports them to cues.json for the score script.
  var cues = [];
  function cue(type, at, extra) {
    cues.push(Object.assign({ type: type, t: Math.round(at * 1000) / 1000 }, extra || {}));
  }

  buildWindows();
  buildLogs();
  var typedChars = splitChars($('#f6 .typed'));

  var tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });

  // ---------- 全局背景 / Global background ----------
  tl.to('.bg-grid', { x: 80, y: 160, duration: DURATION, ease: 'none' }, 0);
  tl.set('#flash', { opacity: 0 }, 0);

  // ---------- S1 痛点：运维黑箱 / Hook ----------
  tl.set('#s1', { autoAlpha: 1 }, T.s1);
  $$('.log').forEach(function (el, i) {
    tl.fromTo(el, { autoAlpha: 0, x: i % 2 ? 46 : -46 }, { autoAlpha: 1, x: 0, duration: 0.5, ease: 'power2.out' }, 0.05 + i * 0.13);
    cue(el.classList.contains('err') ? 'logErr' : 'log', 0.05 + i * 0.13);
  });
  tl.fromTo('#logs', { scale: 1 }, { scale: 1.07, duration: 3.1, ease: 'none' }, 0);
  tl.from('#s1 .hook-l1 > span', { yPercent: 115, duration: 0.65, ease: 'expo.out' }, 0.4);
  tl.from('#s1 .hook-l2 > span', { yPercent: 115, duration: 0.75, ease: 'expo.out' }, 1.1);

  // 「黑箱」故障闪烁：离散关键帧，逐帧渲染也稳定。
  // Glitch on「黑箱」: discrete keyframes so frame rendering stays stable.
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
  tl.to(['#logs', '#s1 .hook'], { scaleY: 0.02, autoAlpha: 0, duration: 0.38, ease: 'power3.in', transformOrigin: '50% 50%' }, 3.05);
  tl.fromTo(['#clineTop', '#clineBot'], { scaleX: 0, autoAlpha: 1 }, { scaleX: 1, duration: 0.45, ease: 'expo.out' }, 3.15);
  tl.to('#flash', { opacity: 0.14, duration: 0.06, ease: 'none' }, 3.45);
  tl.to('#flash', { opacity: 0, duration: 0.35, ease: 'power2.out' }, 3.51);
  tl.set('#s1', { autoAlpha: 0 }, 3.5);
  cue('collapse', 3.05);
  cue('impact', T.s2, { size: 'big' });

  // ---------- S2 品牌亮相 / Brand reveal ----------
  var brand = $('#brand');
  var BRAND_Y = -120;
  gsap.set(brand, { xPercent: -50, yPercent: -50, y: BRAND_Y });
  var CORNER_SCALE = 0.2;
  var cornerX = 140 + (brand.offsetWidth * CORNER_SCALE) / 2 - 960;
  var cornerY = 58 + (brand.offsetHeight * CORNER_SCALE) / 2 - 540;

  tl.to('#clineTop', { y: -300, duration: 0.95, ease: 'expo.inOut' }, 3.55);
  tl.to('#clineBot', { y: 300, duration: 0.95, ease: 'expo.inOut' }, 3.55);
  tl.to(['#clineTop', '#clineBot'], { autoAlpha: 0, duration: 0.5, ease: 'power1.in' }, 4.1);

  tl.set('#s2', { autoAlpha: 1 }, T.s2);
  tl.fromTo('#glow', { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 1.6, ease: 'expo.out' }, 3.55);
  tl.set(brand, { autoAlpha: 1 }, 3.62);
  tl.fromTo('#brand img',
    { autoAlpha: 0, scale: 0.5, x: -90, filter: 'blur(30px)' },
    { autoAlpha: 1, scale: 1, x: 0, filter: 'blur(0px)', duration: 1.0, ease: 'expo.out' }, 3.62);
  tl.fromTo('#brand .word b',
    { autoAlpha: 0, y: 70, filter: 'blur(14px)' },
    { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.8, ease: 'expo.out', stagger: 0.08 }, 3.82);
  [0, 1, 2].forEach(function (i) { cue('letter', 3.82 + i * 0.08, { index: i }); });
  tl.from('#s2 .tagline > span', { yPercent: 115, duration: 0.8, ease: 'expo.out' }, 4.4);
  cue('bell', 4.4);
  tl.from('#s2 .tagsub', { y: 26, autoAlpha: 0, duration: 0.7 }, 4.75);

  tl.to(['#s2 .tagline', '#s2 .tagsub'], { autoAlpha: 0, y: -30, duration: 0.35, ease: 'power2.in', stagger: 0.05 }, T.f1 - 0.55);
  tl.to(brand, { x: cornerX, y: cornerY, scale: CORNER_SCALE, duration: 0.75, ease: 'power3.inOut' }, T.f1 - 0.5);
  cue('riser', T.f1 - 0.5, { end: T.f1 });
  cue('impact', T.f1, { size: 'mid' });
  tl.set('#s2', { autoAlpha: 0 }, T.f1 - 0.1);
  tl.to('#glow', { x: 430, y: 20, opacity: 0.75, duration: 1.2, ease: 'power2.inOut' }, T.f1 - 0.5);

  // ---------- 功能场景通用进出场 / Shared feature in/out ----------
  var WIN_IN = {
    right: [{ x: 280, y: 40, autoAlpha: 0 }, { duration: 0.9, ease: 'power4.out' }],
    up: [{ y: 160, autoAlpha: 0 }, { duration: 0.85, ease: 'power4.out' }],
    pop: [{ scale: 0.86, y: 60, autoAlpha: 0 }, { duration: 0.7, ease: 'back.out(1.3)' }]
  };

  /**
   * 功能镜头：左侧文案逐行上浮，右侧窗口按计划入场，整组窗口做缓慢 3D 推镜，结束时整体左移淡出。
   * Feature shot: copy rises line by line, windows enter on schedule, the stack does a slow 3D push, then everything exits left.
   */
  function feature(sel, t0, t1, wins) {
    var s = $(sel);
    tl.set(s, { autoAlpha: 1 }, t0);
    tl.from($('.chapter', s), { x: -40, autoAlpha: 0, duration: 0.5 }, t0 + 0.05);
    tl.from($$('.headline .ln > span', s), { yPercent: 115, autoAlpha: 0, duration: 0.75, ease: 'expo.out', stagger: 0.09 }, t0 + 0.1);
    tl.from($('.sub', s), { y: 24, autoAlpha: 0, duration: 0.6 }, t0 + 0.35);
    tl.from($$('.chips span', s), { y: 18, autoAlpha: 0, duration: 0.5, stagger: 0.06 }, t0 + 0.45);

    tl.fromTo($('.stack', s),
      { rotationY: 13, rotationX: 4, scale: 0.95 },
      { rotationY: 5, rotationX: 1.5, scale: 1.02, duration: t1 - t0 + 0.4, ease: 'power1.out' }, t0);

    wins.forEach(function (w) {
      var preset = WIN_IN[w.style || 'right'];
      tl.from(w.el, Object.assign({}, preset[0], preset[1]), t0 + w.at);
    });

    tl.to($('.copy', s), { y: -36, autoAlpha: 0, duration: 0.32, ease: 'power2.in' }, t1 - 0.32);
    tl.to($('.visual', s), { x: -150, autoAlpha: 0, duration: 0.36, ease: 'power2.in' }, t1 - 0.34);
    tl.set(s, { autoAlpha: 0 }, t1 + 0.02);
  }

  function highlight(el, at, holdFor) {
    cue('hl', at);
    tl.fromTo(el, { autoAlpha: 0, scale: 1.25 }, { autoAlpha: 1, scale: 1, duration: 0.45, ease: 'back.out(2)', immediateRender: false }, at);
    if (holdFor) tl.to(el, { autoAlpha: 0, duration: 0.3, ease: 'power1.in' }, at + holdFor);
  }

  // 光标滑到目标并点击，返回点击时刻。/ Glide the cursor to its target and click; returns the click time.
  function cursorClick(win, at, moveFor) {
    var c = $('.cursor', win);
    var target = $('.cursor-target', win);
    tl.to(c, { autoAlpha: 1, duration: 0.2, ease: 'none' }, at);
    tl.to(c, { left: target.dataset.x, top: target.dataset.y, duration: moveFor, ease: 'power3.inOut' }, at);
    var click = at + moveFor + 0.05;
    cue('click', click);
    tl.to($('svg', c), { scale: 0.8, duration: 0.08, ease: 'power1.in', transformOrigin: '6px 4px' }, click);
    tl.to($('svg', c), { scale: 1, duration: 0.16, ease: 'power1.out' }, click + 0.08);
    tl.fromTo($('.ripple', c), { scale: 0.2, autoAlpha: 1 }, { scale: 1.7, autoAlpha: 0, duration: 0.5, ease: 'power2.out', immediateRender: false }, click);
    tl.to(c, { autoAlpha: 0, duration: 0.25, ease: 'none' }, click + 0.55);
    return click;
  }

  // 镜头切换时的竖向扫描光 / Vertical scan sweep between shots
  function sweep(at) {
    cue('whoosh', at, { dur: 0.6 });
    tl.fromTo('#sweep', { x: -30, autoAlpha: 1 }, { x: 1950, duration: 0.6, ease: 'power2.inOut', immediateRender: false }, at);
    tl.set('#sweep', { autoAlpha: 0 }, at + 0.61);
  }

  // ---------- F1 主机与集群 / Hosts & clusters ----------
  feature('#f1', T.f1, T.f2, [{ el: '#f1-hosts', at: 0.08 }, { el: '#f1-clusters', at: 0.26 }]);
  var f1Clusters = $$('#f1-clusters .hl');
  highlight(f1Clusters[0], T.f1 + 1.0, 1.5);
  highlight(f1Clusters[1], T.f1 + 1.35);
  highlight($('#f1-hosts .hl'), T.f1 + 1.85);

  // ---------- F2 作业工作台 / Workbench ----------
  feature('#f2', T.f2, T.f3, [{ el: '#f2-wb', at: 0.08 }, { el: '#f2-dag', at: 1.62, style: 'pop' }]);
  highlight($('#f2-wb .hl'), T.f2 + 0.6, 0.75);
  cursorClick($('#f2-wb'), T.f2 + 0.85, 0.65);
  var dagHl = $$('#f2-dag .hl');
  highlight(dagHl[0], T.f2 + 2.2);
  highlight(dagHl[1], T.f2 + 2.45);

  // ---------- F3 Checkpoint / Checkpoint ----------
  feature('#f3', T.f3, T.f4, [{ el: '#f3-ck', at: 0.08 }]);
  gsap.set('#f3-ck .zoom', { transformOrigin: '50% 50%' });
  tl.fromTo('#f3-ck .zoom', { scale: 1 }, { scale: 1.12, duration: 2.6, ease: 'power1.inOut' }, T.f3 + 0.5);
  var ckHl = $$('#f3-ck .hl');
  highlight(ckHl[0], T.f3 + 0.75);
  highlight(ckHl[1], T.f3 + 1.15);
  highlight(ckHl[2], T.f3 + 1.55);

  // ---------- F4 告警与诊断 / Alerts & diagnostics ----------
  feature('#f4', T.f4, T.f5, [{ el: '#f4-alert', at: 0.08 }, { el: '#f4-err', at: 0.42, style: 'up' }]);
  highlight($('#f4-alert .hl'), T.f4 + 0.95);
  highlight($('#f4-err .hl'), T.f4 + 1.6);

  // ---------- F5 插件与升级 / Plugins & upgrade ----------
  feature('#f5', T.f5, T.f6, [{ el: '#f5-plug', at: 0.08 }, { el: '#f5-diff', at: 1.75, style: 'up' }]);
  var f5Click = cursorClick($('#f5-plug'), T.f5 + 0.45, 0.6);
  highlight($('#f5-plug .hl'), f5Click, 0.9);
  $$('#f5-plug .done-pill').forEach(function (el, i) {
    cue('pop', f5Click + 0.2 + i * 0.14, { index: i });
    tl.fromTo(el, { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: 0.35, ease: 'back.out(2.2)', immediateRender: false }, f5Click + 0.2 + i * 0.14);
  });
  highlight($('#f5-diff .hl'), T.f5 + 2.3);

  // ---------- F6 AI Agent ----------
  feature('#f6', T.f6, T.s9, [{ el: '#f6-chat', at: 0.08 }]);
  var TYPE_STEP = 0.018;
  var ROW_STEP = 0.26;
  tl.to(typedChars, { display: 'inline', duration: 0.001, stagger: TYPE_STEP, ease: 'none' }, T.f6 + 0.4);
  var typedEnd = T.f6 + 0.4 + typedChars.length * TYPE_STEP;
  typedChars.forEach(function (_, i) { cue('type', T.f6 + 0.4 + i * TYPE_STEP); });
  tl.set('#f6 .msg.user .caret', { autoAlpha: 0 }, typedEnd + 0.08);
  tl.from('#f6 .msg.ai', { y: 16, autoAlpha: 0, duration: 0.4 }, typedEnd + 0.08);
  tl.from('#f6 .tools', { y: 16, autoAlpha: 0, duration: 0.35 }, typedEnd + 0.26);
  $$('#f6 .tool').forEach(function (row, i) {
    var at = typedEnd + 0.3 + i * ROW_STEP;
    tl.from(row, { x: 24, autoAlpha: 0, duration: 0.35 }, at);
    tl.fromTo($('.spin', row), { rotation: 0 }, { rotation: 540, duration: 0.6, ease: 'none', immediateRender: false }, at);
    tl.to($('.spin', row), { autoAlpha: 0, duration: 0.1, ease: 'none' }, at + 0.32);
    cue('ok', at + 0.32, { index: i });
    tl.fromTo($('.ok', row), { autoAlpha: 0, scale: 0.4 }, { autoAlpha: 1, scale: 1, duration: 0.3, ease: 'back.out(2.5)', immediateRender: false }, at + 0.32);
  });
  tl.from('#f6 .done', { y: 24, scale: 0.97, autoAlpha: 0, duration: 0.55, ease: 'power2.out' }, typedEnd + 0.3 + 4 * ROW_STEP + 0.05);
  cue('done', typedEnd + 0.3 + 4 * ROW_STEP + 0.05);

  // ---------- 章节进度与切换扫描 / Chapter progress and sweeps ----------
  var chapterStarts = [T.f1, T.f2, T.f3, T.f4, T.f5, T.f6, T.s9];
  tl.to('#progress', { autoAlpha: 1, duration: 0.4 }, T.f1 + 0.2);
  $$('#progress i').forEach(function (seg, i) {
    tl.fromTo(seg, { '--p': 0 }, { '--p': 1, duration: chapterStarts[i + 1] - chapterStarts[i], ease: 'none', immediateRender: false }, chapterStarts[i]);
  });
  tl.to('#progress', { autoAlpha: 0, duration: 0.3 }, T.s9 - 0.25);
  [T.f2, T.f3, T.f4, T.f5, T.f6].forEach(function (t) { sweep(t - 0.22); });

  // ---------- S9 收尾 / Outro ----------
  tl.set('#s9', { autoAlpha: 1 }, T.s9);
  cue('impact', T.s9, { size: 'big' });
  tl.to(brand, { x: 0, y: BRAND_Y - 20, scale: 1, duration: 0.9, ease: 'power3.inOut' }, T.s9 - 0.05);
  tl.to('#glow', { x: 0, y: -90, opacity: 1, scale: 1.1, duration: 1.0, ease: 'power2.inOut' }, T.s9 - 0.1);
  tl.from('#s9 .tagline > span', { yPercent: 115, duration: 0.8, ease: 'expo.out' }, T.s9 + 0.65);
  tl.from('#s9 .cmd', { y: 30, autoAlpha: 0, duration: 0.6 }, T.s9 + 1.0);
  tl.fromTo('#s9 .cmd code', { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 0.8, ease: 'steps(48)' }, T.s9 + 1.25);
  for (var k = 0; k < 16; k += 1) cue('type', T.s9 + 1.25 + k * 0.05);
  tl.fromTo('#s9 .cmd .caret', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01, immediateRender: false }, T.s9 + 2.05);
  [2.5, 3.0].forEach(function (d) {
    tl.set('#s9 .cmd .caret', { autoAlpha: 0 }, T.s9 + d);
    tl.set('#s9 .cmd .caret', { autoAlpha: 1 }, T.s9 + d + 0.25);
  });
  tl.from('#s9 .links span', { y: 20, autoAlpha: 0, duration: 0.6, stagger: 0.1 }, T.s9 + 1.7);
  sweep(T.s9 + 2.15);
  tl.set({}, {}, DURATION);

  // ---------- 渲染 / 预览接口 / Render & preview API ----------
  var images = $$('img');
  var ready = Promise.all([document.fonts.ready].concat(images.map(function (img) {
    return img.decode().catch(function () {});
  })));

  window.__STX_PROMO__ = {
    fps: FPS,
    duration: DURATION,
    shots: T,
    cues: cues.sort(function (a, b) { return a.t - b.t; }),
    ready: ready,
    seek: function (t) { tl.seek(t, false); },
    timeline: tl
  };

  var params = new URLSearchParams(location.search);
  if (params.has('render')) return;

  // 浏览器预览：自适应缩放 + 自动播放，空格暂停，←/→ 逐帧，?t=秒 定格。
  // Browser preview: fit-to-window + autoplay; Space pauses, ←/→ steps a frame, ?t=seconds holds a still.
  var stage = $('#stage');
  function fit() {
    var s = Math.min(innerWidth / 1920, innerHeight / 1080);
    stage.style.transform = 'translate(' + (innerWidth - 1920 * s) / 2 + 'px,' + (innerHeight - 1080 * s) / 2 + 'px) scale(' + s + ')';
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
})();
