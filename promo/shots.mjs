/**
 * 宣传片镜头清单：每个镜头 = 打开页面 → 可选的等待 / 点击步骤 → 截图。步骤只做浏览，写请求会被 capture.mjs 拦截。
 * Promo shot list: each shot = open a page → optional wait / click steps → capture. Steps only browse; capture.mjs drops writes.
 *
 * 字段 / Fields:
 *   name   输出文件名 / output file name (promo/assets/<name>.webp)
 *   url    起始路由 / start route
 *   ready  页面就绪表达式 / readiness expression
 *   steps  [{ click | eval | waitFor, settle }]，表达式里可用 byText(re, sel) / closest(el, sel)
 *   mocks  [{ match, method, data }] 仅在截图浏览器里应答的接口夹具 / API fixtures answered inside the capture browser only
 *   css    截图前注入的样式 / style injected before capture
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

export const SHOTS = [
  { name: 'dashboard', url: '/dashboard', ready: "byText(/资源统计/)" },
  { name: 'hosts', url: '/hosts', ready: "byText(/^10\\.0\\.0\\.211$/)", css: HIDE_DOCK },
  { name: 'clusters', url: '/clusters', ready: "byText(/^运行中$/)", css: HIDE_DOCK },
  { name: 'cluster-detail', url: '/clusters/1', ready: "byText(/独孤九剑111/)", settle: 3500 },
  { name: 'plugins', url: '/plugins', ready: "byText(/^Activemq$/)", css: HIDE_DOCK },
  { name: 'packages', url: '/packages', ready: "byText(/^2\\.3\\.13$/)", css: HIDE_DOCK },
  {
    name: 'workbench',
    url: '/workbench',
    ready: "byText(/^test$/)",
    steps: [...openTask('私有2'), consoleTab('任务')],
    css: HIDE_DOCK,
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
  },
  {
    name: 'checkpoint',
    url: '/workbench',
    ready: "byText(/^test$/)",
    mocks: [
      { match: new RegExp(`/api/v1/sync/jobs/${CK_JOB.id}/checkpoint`), data: checkpointSnapshot },
      { match: /\/runtime-storage\/checkpoint\/list$/, method: 'POST', data: checkpointFiles },
      { match: /\/runtime-storage\/checkpoint\/inspect$/, method: 'POST', data: checkpointInspect },
    ],
    steps: [
      ...openTask('私有2'),
      consoleTab('任务'),
      selectJob(CK_JOB.id),
      { click: "byText(/^Checkpoint$/, 'button,[role=tab]')", waitFor: "byText(/^#20$/, 'td')", settle: 1500 },
      { click: "closest(document.querySelector('svg.lucide-maximize-2, svg.lucide-maximize2'), 'button')", settle: 2000 },
    ],
    css: HIDE_DOCK,
  },
  {
    name: 'checkpoint-detail',
    url: '/workbench',
    ready: "byText(/^test$/)",
    mocks: [
      { match: new RegExp(`/api/v1/sync/jobs/${CK_JOB.id}/checkpoint`), data: checkpointSnapshot },
      { match: /\/runtime-storage\/checkpoint\/list$/, method: 'POST', data: checkpointFiles },
      { match: /\/runtime-storage\/checkpoint\/inspect$/, method: 'POST', data: checkpointInspect },
    ],
    steps: [
      ...openTask('私有2'),
      consoleTab('任务'),
      selectJob(CK_JOB.id),
      { click: "byText(/^Checkpoint$/, 'button,[role=tab]')", waitFor: "byText(/^#20$/, 'td')", settle: 1500 },
      { click: "closest(byText(/^#20$/, 'td'), 'tr').querySelector('button')", waitFor: "byText(/CK 文件详情/)", settle: 2500 },
      { eval: "byText(/^Source State$/).scrollIntoView({ block: 'start' })", settle: 1200 },
    ],
  },
  { name: 'alerts', url: '/monitoring/alerts', ready: "byText(/SeaTunnelMetricsEndpointDown/)" },
  { name: 'diagnostics', url: '/diagnostics', ready: "byText(/已有方案/)" },
  {
    name: 'diagnostics-detail',
    url: '/diagnostics',
    ready: "byText(/已有方案/)",
    steps: [
      { click: "closest(byText(/check new active master/, 'td *'), 'tr').querySelector('button')", waitFor: "document.querySelector('[role=dialog]')", settle: 3000 },
    ],
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
      // 把第一处差异行滚到画面中部。/ Scroll the first differing line to the middle of the viewport.
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
  },
];
