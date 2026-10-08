/*
 * STX 45 秒宣传片时间线：镜头时间码 + 每个功能镜头的动作编排，通用动效来自 ../shared/kit.js。
 * STX 45s promo timeline: shot timecodes plus per-feature choreography; shared motion comes from ../shared/kit.js.
 *
 * 镜头时间码（秒）与 STORYBOARD.md 保持一致，改动时两边同步。
 * Shot timecodes (seconds) mirror STORYBOARD.md; keep both in sync when editing.
 */
(function () {
  'use strict';

  // 150 BPM，一小节 1.6 秒：品牌 3.6 秒起，之后每个功能镜头 3 小节（4.8 秒），切镜都落在小节线上。
  // 150 BPM, 1.6s per bar: brand at 3.6s, then 3 bars (4.8s) per feature so every cut lands on a bar line.
  var T = { s1: 0, s2: 3.6, f1: 6.8, f2: 11.6, f3: 16.4, f4: 21.2, f5: 26.0, f6: 30.8, ai: 35.6, s9: 40.4 };

  // 配乐间奏：AI 镜头前一小节只留铺底，用户输入完毕时重新落拍。
  // Score breakdown: the first bar of the AI shot keeps only the pads; the beat drops back in as the prompt finishes typing.
  var DROP = T.ai + 1.6;
  var MUSIC = { breakdowns: [[T.ai, DROP]] };

  var kit = PromoKit.create({ duration: 45, shots: T, chapters: 7, aiChapter: '07' });
  var $$ = kit.$$;

  kit.hook();
  kit.brand();

  // ---------- F1 主机与集群：集群详情 + 主机列表 / Cluster detail + host list ----------
  kit.feature('#f1', T.f1, T.f2, [{ el: '#f1-cd', at: 0.08 }, { el: '#f1-hosts', at: 0.6, style: 'up' }]);
  var cdHl = $$('#f1-cd .hl');
  kit.highlight(cdHl[0], T.f1 + 1.0);
  kit.highlight(cdHl[1], T.f1 + 1.25, 0.9);
  var hostHl = $$('#f1-hosts .hl');
  kit.highlight(hostHl[0], T.f1 + 1.6);
  kit.highlight(hostHl[1], T.f1 + 1.9);
  kit.zoomTo('#f1-cd', 'title', T.f1 + 2.4, { scale: 1.55, dur: 1.2 });

  // ---------- F2 安装包与插件：版本列表 → 一键下载全部连接器 / Version list → download every connector ----------
  kit.feature('#f2', T.f2, T.f3, [{ el: '#f2-pkg', at: 0.08 }, { el: '#f2-plug', at: 0.45, style: 'up' }]);
  kit.highlight('#f2-pkg .hl', T.f2 + 0.95, 1.2);
  var dlClick = kit.cursorClick('#f2-plug', { at: T.f2 + 1.3, move: 0.6, to: 'downloadAll', from: [0.6, 0.45] });
  kit.highlight('#f2-plug .hl', dlClick, 0.9);
  kit.pops('#f2-plug .done-pill', dlClick + 0.2, 0.14);
  kit.zoomTo('#f2-plug', 'card0', T.f2 + 3.0, { scale: 1.5, dur: 1.0 });

  // ---------- F3 作业工作台：推近 HOCON → 拉回 → 点击 DAG / Push in on HOCON → pull back → click DAG ----------
  kit.feature('#f3', T.f3, T.f4, [{ el: '#f3-wb', at: 0.08 }, { el: '#f3-dag', at: 3.0, style: 'pop' }]);
  kit.zoomTo('#f3-wb', 'source', T.f3 + 0.8, { scale: 1.5, dur: 0.9 });
  kit.highlight('#f3-wb .hl', T.f3 + 1.35, 0.9);
  kit.zoomTo('#f3-wb', null, T.f3 + 2.15, { dur: 0.7 });
  kit.cursorClick('#f3-wb', { at: T.f3 + 2.3, move: 0.55, to: 'dagBtn', from: [0.5, 0.62] });
  var dagHl = $$('#f3-dag .hl');
  kit.highlight(dagHl[0], T.f3 + 3.5);
  kit.highlight(dagHl[1], T.f3 + 3.7);
  kit.highlight(dagHl[2], T.f3 + 3.9);

  // ---------- F4 Checkpoint：历史快照 → 查看详情 → 推近 Binlog 位点 / History → view details → push in on the binlog offset ----------
  kit.feature('#f4', T.f4, T.f5, [{ el: '#f4-ck', at: 0.08 }, { el: '#f4-ckd', at: 2.2, style: 'pop' }]);
  var ckHl = $$('#f4-ck .hl');
  kit.highlight(ckHl[0], T.f4 + 0.9, 1.0);
  kit.highlight(ckHl[1], T.f4 + 1.15, 0.8);
  // 第 20 号快照行的「查看详情」/ "View details" on checkpoint #20
  kit.cursorClick('#f4-ck', { at: T.f4 + 1.5, move: 0.55, to: [0.69, 0.3325], from: [0.55, 0.62] });
  var ckdHl = $$('#f4-ckd .hl');
  kit.zoomTo('#f4-ckd', 'binlog', T.f4 + 2.85, { scale: 1.45, dur: 0.85 });
  kit.highlight(ckdHl[0], T.f4 + 3.4);
  kit.highlight(ckdHl[1], T.f4 + 3.7);

  // ---------- F5 告警与诊断：告警 → 错误聚合 → 详情与经验库 / Alerts → grouped errors → detail and knowledge base ----------
  kit.feature('#f5', T.f5, T.f6, [
    { el: '#f5-alert', at: 0.08 },
    { el: '#f5-diag', at: 0.9, style: 'up' },
    { el: '#f5-detail', at: 2.5, style: 'sheet' }
  ]);
  var alertHl = $$('#f5-alert .hl');
  kit.highlight(alertHl[0], T.f5 + 0.8);
  kit.highlight(alertHl[1], T.f5 + 1.05);
  var diagHl = $$('#f5-diag .hl');
  kit.highlight(diagHl[0], T.f5 + 1.6);
  kit.highlight(diagHl[1], T.f5 + 1.9);
  var detailHl = $$('#f5-detail .hl');
  kit.highlight(detailHl[0], T.f5 + 3.1);
  kit.highlight(detailHl[1], T.f5 + 3.4);

  // ---------- F6 版本升级：点击「升级」→ 三栏配置合并 / Click "Upgrade" → three-way config merge ----------
  kit.feature('#f6', T.f6, T.ai, [{ el: '#f6-cd', at: 0.08 }, { el: '#f6-up', at: 1.25, style: 'pop' }]);
  var upClick = kit.cursorClick('#f6-cd', { at: T.f6 + 0.5, move: 0.55, to: 'upgrade', from: [0.6, 0.16] });
  kit.highlight('#f6-cd .hl', upClick, 0.6);
  var upHl = $$('#f6-up .hl');
  kit.highlight(upHl[0], T.f6 + 1.85, 0.9);
  kit.highlight(upHl[1], T.f6 + 2.1, 0.65);
  kit.highlight(upHl[2], T.f6 + 2.3, 0.45);
  kit.zoomTo('#f6-up', [0.15, 0.2794, 0.7, 0.0678], T.f6 + 2.85, { scale: 1.3, dur: 1.0 });

  // ---------- F7 AI Agent：间奏里打字，落拍时开始调用 CLI / Type during the breakdown, CLI calls start on the drop ----------
  kit.feature('#ai', T.ai, T.s9, [{ el: '#ai-chat', at: 0.08 }]);
  kit.aiChat('#ai', T.ai, { typeAt: T.ai + 0.45, typeStep: 0.03, toolsAt: DROP, rowStep: 0.36 });
  kit.cue('impact', DROP, { size: 'mid' });

  // ---------- 章节进度、切换扫描与收尾 / Progress, sweeps and outro ----------
  kit.progress([T.f1, T.f2, T.f3, T.f4, T.f5, T.f6, T.ai, T.s9]);
  [T.f2, T.f3, T.f4, T.f5, T.f6, T.ai].forEach(function (t) { kit.sweep(t - 0.22); });
  kit.outro();

  kit.publish({ music: MUSIC });
})();
