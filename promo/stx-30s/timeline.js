/*
 * STX 30 秒宣传片时间线：镜头时间码 + 每个功能镜头的动作编排，通用动效来自 ../shared/kit.js。
 * STX 30s promo timeline: shot timecodes plus per-feature choreography; shared motion comes from ../shared/kit.js.
 *
 * 镜头时间码（秒）与 STORYBOARD.md 保持一致，改动时两边同步。
 * Shot timecodes (seconds) mirror STORYBOARD.md; keep both in sync when editing.
 */
(function () {
  'use strict';

  // 镜头起点：全部落在 150 BPM 的拍点（0.4s）上，配乐重拍与切镜对齐。
  // Shot start times: all on the 150 BPM beat grid (0.4s) so cuts hit the downbeats of the score.
  var T = { s1: 0, s2: 3.6, f1: 6.4, f2: 10.0, f3: 13.2, f4: 16.4, f5: 19.6, ai: 22.8, s9: 26.4 };

  var kit = PromoKit.create({ duration: 30, shots: T, chapters: 6, aiChapter: '06' });
  var $$ = kit.$$;

  kit.hook();
  kit.brand();

  // ---------- F1 主机与集群：集群详情 + 主机列表 / Cluster detail + host list ----------
  kit.feature('#f1', T.f1, T.f2, [{ el: '#f1-cd', at: 0.08 }, { el: '#f1-hosts', at: 0.5, style: 'up' }]);
  kit.highlight('#f1-cd .hl', T.f1 + 0.95);
  var hostHl = $$('#f1-hosts .hl');
  kit.highlight(hostHl[0], T.f1 + 1.35);
  kit.highlight(hostHl[1], T.f1 + 1.65);
  kit.zoomTo('#f1-cd', 'title', T.f1 + 1.9, { scale: 1.55, dur: 1.1 });

  // ---------- F2 作业工作台：HOCON → 点击 DAG → 拓扑弹窗 / HOCON → click DAG → topology dialog ----------
  kit.feature('#f2', T.f2, T.f3, [{ el: '#f2-wb', at: 0.08 }, { el: '#f2-dag', at: 1.62, style: 'pop' }]);
  kit.highlight('#f2-wb .hl', T.f2 + 0.6, 0.75);
  kit.cursorClick('#f2-wb', { at: T.f2 + 0.85, move: 0.6, to: 'dagBtn', from: [0.5, 0.62] });
  var dagHl = $$('#f2-dag .hl');
  kit.highlight(dagHl[0], T.f2 + 2.15);
  kit.highlight(dagHl[1], T.f2 + 2.35);
  kit.highlight(dagHl[2], T.f2 + 2.55);

  // ---------- F3 Checkpoint：推近 Binlog 位点，再摇到两阶段提交 / Push in on the binlog offset, then pan to 2PC ----------
  kit.feature('#f3', T.f3, T.f4, [{ el: '#f3-ck', at: 0.08 }]);
  var ckHl = $$('#f3-ck .hl');
  kit.zoomTo('#f3-ck', 'binlog', T.f3 + 0.55, { scale: 1.45, dur: 0.85 });
  kit.highlight(ckHl[0], T.f3 + 1.1, 0.8);
  kit.highlight(ckHl[1], T.f3 + 1.4, 0.5);
  kit.zoomTo('#f3-ck', 'sinkBadge', T.f3 + 1.95, { scale: 1.45, dur: 0.75 });
  kit.highlight(ckHl[2], T.f3 + 2.45);

  // ---------- F4 告警与诊断 / Alerts & diagnostics ----------
  kit.feature('#f4', T.f4, T.f5, [{ el: '#f4-alert', at: 0.08 }, { el: '#f4-diag', at: 0.42, style: 'up' }]);
  var alertHl = $$('#f4-alert .hl');
  kit.highlight(alertHl[0], T.f4 + 0.95);
  kit.highlight(alertHl[1], T.f4 + 1.25);
  var diagHl = $$('#f4-diag .hl');
  kit.highlight(diagHl[0], T.f4 + 1.75);
  kit.highlight(diagHl[1], T.f4 + 2.1);

  // ---------- F5 插件与升级：一键下载全部 → 配置逐行合并 / Download all → line-by-line config merge ----------
  kit.feature('#f5', T.f5, T.ai, [{ el: '#f5-plug', at: 0.08 }, { el: '#f5-up', at: 1.75, style: 'up' }]);
  var dlClick = kit.cursorClick('#f5-plug', { at: T.f5 + 0.45, move: 0.6, to: 'downloadAll', from: [0.62, 0.42] });
  kit.highlight('#f5-plug .hl', dlClick, 0.9);
  kit.pops('#f5-plug .done-pill', dlClick + 0.2, 0.14);
  var upHl = $$('#f5-up .hl');
  kit.highlight(upHl[0], T.f5 + 2.3);
  kit.highlight(upHl[1], T.f5 + 2.6);

  // ---------- F6 AI Agent ----------
  kit.feature('#ai', T.ai, T.s9, [{ el: '#ai-chat', at: 0.08 }]);
  kit.aiChat('#ai', T.ai);

  // ---------- 章节进度、切换扫描与收尾 / Progress, sweeps and outro ----------
  kit.progress([T.f1, T.f2, T.f3, T.f4, T.f5, T.ai, T.s9]);
  [T.f2, T.f3, T.f4, T.f5, T.ai].forEach(function (t) { kit.sweep(t - 0.22); });
  kit.outro();

  kit.publish();
})();
