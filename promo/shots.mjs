/**
 * 宣传片镜头清单：每个镜头 = 打开页面 → 可选的等待 / 点击步骤 → 截图。步骤只做浏览，写请求会被 capture.mjs 拦截。
 * Promo shot list: each shot = open a page → optional wait / click steps → capture. Steps only browse; capture.mjs drops writes.
 *
 * 字段 / Fields:
 *   name   输出文件名 / output file name (promo/assets/<name>.webp)
 *   url    起始路由 / start route
 *   ready  页面就绪表达式 / readiness expression
 *   steps  [{ click | eval | waitFor, settle, optional }]
 *   marks  { key: 表达式 }，记录元素位置到 promo/assets/marks.js，宣传片用来放高亮和推镜
 *          { key: expression } recorded into promo/assets/marks.js for highlights and camera moves
 *   mocks  [{ match, method, data }] 仅在截图浏览器里应答的接口夹具 / API fixtures answered inside the capture browser only
 *   css    截图前注入的样式 / style injected before capture
 * 表达式里可用 / Helpers available in expressions: byText, allText, closest, upTo, union, editorLines（见 capture.mjs）
 */
import { CK_JOB, checkpointSnapshot, checkpointFiles, checkpointInspect } from './fixtures.mjs';

export const EXPLORE_ROUTES = [
  '/dashboard', '/hosts', '/clusters', '/workbench', '/sync', '/monitoring', '/monitoring/alerts',
  '/monitoring/history', '/monitoring/rules', '/monitoring/integrations', '/diagnostics', '/packages',
  '/plugins', '/commands', '/audit-logs',
];

// 隐藏底部浮动导航，避免遮住画面下沿。/ Hide the floating bottom dock so it does not cover the lower edge.
const HIDE_DOCK = 'div.fixed.z-50.bottom-4.right-4{display:none!important}';

// 打开工作台并选中资源树里的任务文件（目录展开状态会被记住，所以展开是可选步骤）。
// Open the workbench and select a task file (folder expansion is remembered, so expanding is optional).
const TREE_ROW = "'[draggable] span'";
const openTask = (name) => [
  { click: `byText(/^${name}$/, ${TREE_ROW}) ? null : byText(/^test$/, ${TREE_ROW})`, optional: true, settle: 900 },
  { click: `byText(/^${name}$/, ${TREE_ROW})`, waitFor: "document.querySelector('.monaco-editor .view-lines')", settle: 2500 },
];
const consoleTab = (label) => ({ click: `byText(/^${label}$/, 'button,[role=tab]')`, settle: 1500 });
const selectJob = (id) => ({ click: `closest(byText(/^#${id}$/), 'tr')`, settle: 1500 });
const buttonText = (re) => `byText(${re}, 'button')`;

const CK_MOCKS = [
  { match: new RegExp(`/api/v1/sync/jobs/${CK_JOB.id}/checkpoint`), data: checkpointSnapshot },
  { match: /\/runtime-storage\/checkpoint\/list$/, method: 'POST', data: checkpointFiles },
  { match: /\/runtime-storage\/checkpoint\/inspect$/, method: 'POST', data: checkpointInspect },
];
const openCheckpointTab = [
  ...openTask('私有2'),
  consoleTab('任务'),
  selectJob(CK_JOB.id),
  { click: "byText(/^Checkpoint$/, 'button,[role=tab]')", waitFor: "byText(/^#20$/, 'td')", settle: 1500 },
];

export const SHOTS = [
  {
    name: 'dashboard',
    url: '/dashboard',
    ready: "byText(/资源统计/)",
    marks: {
      kpis: "upTo(byText(/^主机$/), 600, 30)",
      stats: "upTo(byText(/^资源统计$/), 400, 200)",
    },
  },
  {
    name: 'hosts',
    url: '/hosts',
    ready: "byText(/^10\\.0\\.0\\.211$/)",
    css: HIDE_DOCK,
    marks: {
      row: "closest(byText(/^10\\.0\\.0\\.211$/), 'tr')",
      status: "byText(/^在线$/, 'td *')",
      usage: "closest(byText(/^CPU:/), 'td')",
      create: buttonText('/创建主机/'),
    },
  },
  {
    name: 'clusters',
    url: '/clusters',
    ready: "byText(/^运行中$/)",
    css: HIDE_DOCK,
    marks: {
      card: "upTo(byText(/^独孤九剑111$/), 260, 200)",
      status: "byText(/^运行中$/, '*', upTo(byText(/^独孤九剑111$/), 260, 200))",
      mode: "byText(/^混合模式$/)",
      version: "byText(/^3\\.0\\.0$/)",
    },
  },
  {
    name: 'cluster-detail',
    url: '/clusters/1',
    ready: "byText(/独孤九剑111/)",
    settle: 3500,
    css: HIDE_DOCK,
    marks: {
      title: "union(byText(/^独孤九剑111$/), byText(/^v3\\.0\\.0$/))",
      health: "union(byText(/^运行中$/), byText(/^健康$/))",
      actions: "union(" + buttonText('/^启动$/') + ", " + buttonText('/^删除$/') + ")",
      upgrade: buttonText('/^升级$/'),
      tabs: "union(byText(/^总览$/), byText(/^升级$/, '[role=tab]'))",
      info: "upTo(byText(/^安装目录$/), 900, 100)",
      node: "upTo(byText(/^Master\\/Worker$/), 220, 70)",
    },
  },
  {
    name: 'plugins',
    url: '/plugins',
    ready: "byText(/^Activemq$/)",
    css: HIDE_DOCK,
    marks: {
      downloadAll: buttonText('/一键下载全部/'),
      tabs: "union(byText(/^可用插件/), byText(/^自定义插件$/))",
      filters: "union(byText(/^v3\\.0\\.0$/), " + buttonText('/^搜索$/') + ")",
      card0: "upTo(byText(/^Activemq$/), 200, 200)",
      dl0: "allText(/^下载$/, 'button')[0]",
      dl1: "allText(/^下载$/, 'button')[1]",
      dl2: "allText(/^下载$/, 'button')[2]",
      dl3: "allText(/^下载$/, 'button')[3]",
    },
  },
  {
    name: 'packages',
    url: '/packages',
    ready: "byText(/^2\\.3\\.13$/)",
    css: HIDE_DOCK,
    marks: {
      v300: "closest(byText(/^3\\.0\\.0/, 'td *'), 'tr')",
      v2313: "closest(byText(/^2\\.3\\.13$/), 'tr')",
      recommend: "byText(/^推荐版本/)",
      offline: buttonText('/离线导入/'),
      dlBtns: "union(allText(/^下载到服务器$/, 'button').slice(0, 4))",
    },
  },
  {
    name: 'workbench',
    url: '/workbench',
    ready: "byText(/^test$/)",
    steps: [...openTask('私有2'), consoleTab('任务')],
    css: HIDE_DOCK,
    marks: {
      editor: "document.querySelector('.monaco-editor')",
      source: "union(editorLines(/^\\s*source\\s\\{/), editorLines(/startup\\.mode/))",
      cdc: "editorLines(/MySQL-CDC/)[0]",
      dagBtn: buttonText('/^DAG$/'),
      runBtn: buttonText('/^运行$/'),
      tree: "closest(byText(/^私有2$/, " + TREE_ROW + "), '[draggable]')",
      jobs: "closest(byText(/^#13$/), 'table')",
      job13: "closest(byText(/^#13$/), 'tr')",
    },
  },
  {
    name: 'dag',
    url: '/workbench',
    ready: "byText(/^test$/)",
    steps: [
      ...openTask('公开1'),
      consoleTab('任务'),
      { click: "closest(byText(/^#16$/), 'tr').querySelector('[aria-label*=\"DAG\"]')", waitFor: "document.querySelector('[role=dialog]')", settle: 2500 },
    ],
    marks: {
      dialog: "document.querySelector('[role=dialog]')",
      title: "byText(/执行拓扑 \\(DAG\\)$/)",
      source: "upTo(byText(/Source\\[0\\]-/), 200, 100)",
      sink1: "upTo(byText(/Console-/), 200, 100)",
      sink2: "upTo(byText(/Jdbc-/), 200, 100)",
      stats: "union(upTo(byText(/^输入源$/), 60, 50), upTo(byText(/^目标源$/), 60, 50))",
      ops: "upTo(byText(/^算子列表$/), 200, 150)",
    },
  },
  {
    name: 'checkpoint',
    url: '/workbench',
    ready: "byText(/^test$/)",
    mocks: CK_MOCKS,
    steps: [
      ...openCheckpointTab,
      { click: "closest(document.querySelector('svg.lucide-maximize-2, svg.lucide-maximize2'), 'button')", settle: 2000 },
    ],
    css: HIDE_DOCK,
    marks: {
      summary: "upTo(byText(/^Pipeline #1$/), 500, 24)",
      completed: "byText(/^完成次数/)",
      pulse: "upTo(byText(/检查点耗时波形/), 500, 24)",
      table: "closest(byText(/^#20$/, 'td'), 'table')",
      top3: "union(closest(byText(/^#20$/, 'td'), 'tr'), closest(byText(/^#18$/, 'td'), 'tr'))",
      row20: "closest(byText(/^#20$/, 'td'), 'tr')",
      details: "allText(/查看详情/, 'button')[0]",
    },
  },
  {
    name: 'checkpoint-detail',
    url: '/workbench',
    ready: "byText(/^test$/)",
    mocks: CK_MOCKS,
    steps: [
      ...openCheckpointTab,
      { click: "closest(byText(/^#20$/, 'td'), 'tr').querySelector('button')", waitFor: "byText(/CK 文件详情/)", settle: 2500 },
      { eval: "byText(/^Source State$/).scrollIntoView({ block: 'start' })", settle: 1200 },
    ],
    marks: {
      dialog: "document.querySelector('[role=dialog]')",
      header: "union(byText(/^CK 文件详情$/, '*', dlg()), byText(/^COMPLETED$/, '*', dlg()))",
      path: "byText(/^file:\\/tmp/, '*', dlg())",
      sourceCard: "upTo(byText(/^Source\\[0\\]-MySQL-CDC$/), 700, 200)",
      binlog: "upTo(byText(/^Binlog 位点$/), 200, 60)",
      phase: "byText(/^增量实时 \\(Incremental\\)$/)",
      lag: "upTo(byText(/^业务延迟/), 200, 60)",
      subtasks: "closest(byText(/^Subtask #0$/), 'table')",
      sinkTitle: "union(byText(/^Sink\\[0\\]-Jdbc$/), byText(/^两阶段提交事务机制/))",
      sinkBadge: "byText(/^已预提交 \\(Prepared\\)$/)",
    },
  },
  {
    name: 'alerts',
    url: '/monitoring/alerts',
    ready: "byText(/SeaTunnelMetricsEndpointDown/)",
    css: HIDE_DOCK,
    marks: {
      tabs: "union(byText(/^全部状态$/), byText(/^已关闭$/))",
      row0: "closest(byText(/SeaTunnelMetricsEndpointDown/), 'tr')",
      severity: "union(allText(/^严重$/, 'td *').slice(0, 2))",
      solved: "allText(/^已有方案$/, 'td *')[0]",
      status: "union(allText(/^已恢复$/, 'td *').slice(0, 4))",
      names: "union(byText(/SeaTunnelMetricsEndpointDown/), byText(/SeaTunnelJVMHeapUsageHigh/))",
    },
  },
  {
    name: 'diagnostics',
    url: '/diagnostics',
    ready: "byText(/已有方案/)",
    css: HIDE_DOCK,
    marks: {
      tabs: "union(byText(/^全部错误组/), byText(/^低频偶发/))",
      counts: "union(byText(/^563364 次$/), byText(/^182 次$/))",
      row0: "closest(byText(/^563364 次$/), 'tr')",
      solved: "union(allText(/^已有方案$/, 'td *'))",
      solved0: "allText(/^已有方案$/, 'td *')[0]",
      table: "closest(byText(/^错误组$/, 'th'), 'table')",
    },
  },
  {
    name: 'diagnostics-detail',
    url: '/diagnostics',
    ready: "byText(/已有方案/)",
    steps: [
      { click: "closest(byText(/check new active master/, 'td *'), 'tr').querySelector('button')", waitFor: "document.querySelector('[role=dialog]')", settle: 3000 },
    ],
    marks: {
      sheet: "document.querySelector('[role=dialog]')",
      count: "byText(/^出现次数/, '*', dlg())",
      kb: "upTo(byText(/^经验库$/, '*', dlg()), 400, 50)",
      record: "allText(/^记录方案$/, 'button', dlg())[0]",
      events: "upTo(byText(/^近期事件样本$/, '*', dlg()), 400, 200)",
      topology: "upTo(byText(/^受影响拓扑与来源$/, '*', dlg()), 400, 50)",
    },
  },
  {
    name: 'upgrade-config',
    url: '/clusters/1',
    ready: "byText(/独孤九剑111/)",
    steps: [
      {
        // 只读取已有升级计划（GET），把它放进浏览器会话里供配置合并页展示。
        // Read the existing upgrade plan (GET) and seed the browser session so the merge page can render it.
        eval: `fetch('/api/v1/st-upgrade/plans/3', { credentials: 'include' }).then((r) => r.json()).then(({ data: plan }) => {
          const s = plan.snapshot;
          sessionStorage.setItem('st-upgrade-session:1', JSON.stringify({
            clusterId: 1,
            request: { cluster_id: 1, target_version: s.target_version, node_ids: (s.node_targets || []).map((n) => n.node_id).filter(Boolean) },
            precheck: { cluster_id: 1, target_version: s.target_version, ready: true, issues: [], package_manifest: s.package_manifest, connector_manifest: s.connector_manifest, config_merge_plan: s.config_merge_plan, node_targets: s.node_targets || [], generated_at: s.generated_at },
          }));
          location.assign('/clusters/1/upgrade/config');
          return true;
        })`,
        waitFor: "location.pathname.endsWith('/upgrade/config') && byText(/seatunnel\\.yaml/)",
        settle: 2500,
      },
      { click: "byText(/^seatunnel\\.yaml$/)", settle: 2000 },
      // 把第一处差异行滚到画面上部。/ Scroll the first differing line into the upper part of the viewport.
      {
        eval: `(() => {
          const row = byText(/采用\\s*旧值/, 'button');
          row.scrollIntoView({ block: 'start' });
          let el = row.parentElement;
          while (el && !(el.scrollHeight > el.clientHeight && /auto|scroll/.test(getComputedStyle(el).overflowY))) el = el.parentElement;
          (el || document.scrollingElement).scrollBy(0, -260);
          return true;
        })()`,
        settle: 1500,
      },
    ],
    css: HIDE_DOCK,
    marks: {
      old0: "allText(/采用\\s*旧值/, 'button')[0]",
      new0: "allText(/采用\\s*新值/, 'button')[0]",
      diff0: "union(upTo(allText(/采用\\s*旧值/, 'button')[0], 1300, 0) || allText(/采用\\s*旧值/, 'button')[0])",
      diff1: "upTo(allText(/采用\\s*旧值/, 'button')[1], 1300, 0)",
      diff2: "upTo(allText(/采用\\s*旧值/, 'button')[2], 1300, 0)",
      keep: "byText(/^当前结果不保留这一行$/)",
    },
  },
];
