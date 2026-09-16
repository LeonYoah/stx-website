import type {HomeLocale} from './useHomeLocale';

export type PhaseIcon = 'cli' | 'jobs' | 'logs' | 'code' | 'sync' | 'upgrade';

export type Phase = {
  title: string;
  tool: string;
  detail: string;
  queries: string[];
  icon: PhaseIcon;
};

export type Finding = {number: string; title: string; quote: string};

export type Scenario = {
  id: string;
  label: string;
  chatTitle: string;
  projectName: string;
  welcomeTitle: string;
  welcomeSub: string;
  prompt: string;
  reply: string;
  midUsers: {afterPhases: number; text: string}[];
  phases: Phase[];
  completedTitle: string;
  completedSummary: string;
  findings: Finding[];
  artifactTitle: string;
  artifactMeta: string;
  artifactBody: string;
};

export type AgentChrome = {
  ariaDemo: string;
  ariaNav: string;
  ariaComposer: string;
  searchToast: string;
  notifyTitle: string;
  notifyToast: string;
  newTask: string;
  newTaskToast: string;
  plugins: string;
  pluginsToast: string;
  artifacts: string;
  openArtifactToast: string;
  artifactPendingToast: string;
  projects: string;
  recent: string;
  scenarioToast: (label: string) => string;
  expandSidebar: string;
  collapseSidebar: string;
  running: string;
  pause: string;
  pauseDemo: string;
  replay: string;
  inProgress: string;
  generating: string;
  generated: string;
  collapseArtifact: string;
  expandArtifact: string;
  addAttachment: string;
  attachmentToast: string;
  defaultPermission: string;
  permissionToast: string;
  send: string;
  sendStartedToast: string;
  placeholderRunning: string;
  placeholderIdle: string;
};

const CDC_CONF = `env {
  parallelism = 1
  job.mode = "STREAMING"
  checkpoint.interval = 10000
}

source {
  MySQL-CDC {
    plugin_output = "orders_cdc"
    username = "{{MYSQL_USER}}"
    password = "{{password}}"
    base-url = "jdbc:mysql://mysql.prod:3306/"
    database-names = ["shop"]
    table-names = ["shop.orders"]
    startup.mode = "initial"
  }
}

sink {
  Hive {
    plugin_input = ["orders_cdc"]
    table_name = "ods.orders_cdc"
    metastore_uri = "thrift://hive-metastore:9083"
  }
}`;

const CDC_DRAFT_DETAIL_ZH = `已用 \`stx sync draft\` 生成草稿，请确认是否符合要求：

\`\`\`hocon
${CDC_CONF}
\`\`\`

是否按此配置继续？`;

const CDC_DRAFT_DETAIL_EN = `Drafted with \`stx sync draft\`. Please confirm:

\`\`\`hocon
${CDC_CONF}
\`\`\`

Continue with this config?`;

const SCENARIOS_ZH: Scenario[] = [
  {
    id: 'diagnose',
    label: '线上集群健康巡检',
    chatTitle: 'SeaTunnel 集群诊断',
    projectName: 'zeta-prod 运维',
    welcomeTitle:
      '可视化管理 + 原生 AI Agent（CLI + Skill）：让 SeaTunnel 运维清晰透明',
    welcomeSub: '用自然语言驱动 stx：集群、任务、日志与源码一气呵成。',
    prompt:
      '帮我看看线上 SeaTunnel 现在有哪些集群在跑，任务是否健康；若有失败任务，拉错误日志并对照源码给出根因。',
    reply:
      '先列集群与运行中任务，再定位失败作业日志，最后对照 SeaTunnel 源码给出可执行修复建议。',
    midUsers: [],
    phases: [
      {
        title: '拉取运行中集群',
        tool: 'stx cluster list',
        icon: 'cli',
        queries: [
          'zeta-prod · Zeta · healthy 3/3',
          'spark-batch · Spark · healthy 4/4',
          'flink-cdc · Flink · degraded 2/3',
        ],
        detail:
          '通过 `stx cluster list` 汇总引擎类型、节点心跳与纳管状态。',
      },
      {
        title: '枚举运行 / 失败任务',
        tool: 'stx job list',
        icon: 'jobs',
        queries: [
          'job-1831 orders_cdc_sync · RUNNING',
          'job-1842 inventory_enrich · FAILED',
          'job-1850 user_profile_stream · RUNNING',
        ],
        detail:
          '`stx job list --cluster zeta-prod --state RUNNING,FAILED`，锁定失败作业 job-1842。',
      },
      {
        title: '采集失败任务日志',
        tool: 'stx job logs',
        icon: 'logs',
        queries: [
          'Checkpoint barrier timeout 30s',
          'JDBC batch failed: Duplicate key',
          'JobMaster · SinkException',
        ],
        detail: '`stx job logs --id job-1842 --tail 40`，定位到 JDBC Sink 写冲突。',
      },
      {
        title: '对照 SeaTunnel 源码',
        tool: 'stx skill read',
        icon: 'code',
        queries: [
          'JdbcSinkWriter.java:214',
          'ignoreDuplicate / upsert 策略',
          '建议 stx job restart',
        ],
        detail:
          '`stx skill read` 打开 JdbcSinkWriter 冲突分支，确认根因为主键冲突而非集群宕机。',
      },
    ],
    completedTitle: '诊断完成',
    completedSummary:
      '根因是 JDBC Sink 主键冲突。可改为 upsert，或清理冲突数据后执行 `stx job restart --id job-1842`。',
    findings: [
      {
        number: '01',
        title: '集群面健康',
        quote: 'zeta-prod 节点 3/3 在线，控制面心跳正常。',
      },
      {
        number: '02',
        title: '任务面异常',
        quote: 'job-1842 失败，日志指向 Duplicate key。',
      },
      {
        number: '03',
        title: '源码可解释',
        quote: '非 upsert 模式下冲突直接抛 SinkException。',
      },
    ],
    artifactTitle: 'job-1842 诊断纪要',
    artifactMeta: 'SeaTunnel · stx skill',
    artifactBody: `# job-1842 诊断纪要

根因：JDBC Sink 主键冲突（Duplicate key）

建议：
1. Sink 改为 upsert / 开启 ignoreDuplicate
2. 清理冲突数据后重提
3. stx job restart --id job-1842`,
  },
  {
    id: 'cdc-hive',
    label: 'MySQL CDC → Hive 提交',
    chatTitle: '同步任务提交',
    projectName: 'data-sync studio',
    welcomeTitle: '用 stx 提交同步任务',
    welcomeSub: '从连接器文档生成 HOCON，测试连接、抽 DAG、预览后发布运行。',
    prompt:
      '帮我提交一下 MySQL CDC 到 Hive 的任务。MySQL url 是 jdbc:mysql://mysql.prod:3306/，密码用系统变量 {{password}}，库表 shop.orders，落到 Hive ods.orders_cdc。',
    reply:
      '收到。我会用 stx 走完整链路：对照 connector 文档生成 HOCON（密码引用 {{password}}）→ 请你确认 → 测连 → 抽 DAG → 询问预览 → 发布运行。',
    midUsers: [
      {
        afterPhases: 2,
        text: '确认，按这份 HOCON 继续。密码保持 {{password}} 系统变量。',
      },
      {
        afterPhases: 4,
        text: '是，先预览几行数据，没问题再正式发布运行。',
      },
    ],
    phases: [
      {
        title: '读取连接器源码与文档',
        tool: 'stx skill read',
        icon: 'code',
        queries: [
          'docs: MySQL-CDC / Hive',
          'plugin: connector-cdc-mysql',
          'plugin: connector-hive',
        ],
        detail:
          '`stx skill read` 对齐 Source=`MySQL-CDC`、Sink=`Hive` 字段；密码走全局变量 {{password}}。',
      },
      {
        title: '生成 HOCON 并请确认',
        tool: 'stx sync draft',
        icon: 'sync',
        queries: [
          'env.job.mode = STREAMING',
          'password = "{{password}}"',
          'source MySQL-CDC → sink Hive',
        ],
        detail: CDC_DRAFT_DETAIL_ZH,
      },
      {
        title: '测试连接',
        tool: 'stx sync test',
        icon: 'cli',
        queries: [
          'Source[0]-MySQL-CDC ok',
          'Sink[0]-Hive ok',
          'vars: {{password}} resolved',
        ],
        detail:
          '`stx sync test`：MySQL CDC 与 Hive Metastore 均通过；系统变量 {{password}} 已解析。',
      },
      {
        title: '提取 DAG',
        tool: 'stx sync dag',
        icon: 'jobs',
        queries: [
          'Source[0]-MySQL-CDC',
          '→ Sink[0]-Hive',
          'edges=1 · nodes=2',
        ],
        detail:
          '`stx sync dag`：`MySQL-CDC(orders_cdc) → Hive(ods.orders_cdc)`。是否预览源端样例数据？',
      },
      {
        title: '预览数据',
        tool: 'stx sync preview',
        icon: 'logs',
        queries: [
          'preview job_id=9124',
          'rows=8 · cols=12',
          'order_id / user_id / amount …',
        ],
        detail:
          '`stx sync preview` 已返回样例行，字段与 shop.orders 对齐。准备发布并提交。',
      },
      {
        title: '发布并运行',
        tool: 'stx sync submit',
        icon: 'sync',
        queries: [
          'publish version=v3',
          'engine_job_id=883921',
          'status=RUNNING',
        ],
        detail:
          '`stx sync submit` 已发布 v3 并在 Zeta 提交运行；binlog 位点开始推进。',
      },
    ],
    completedTitle: '任务已发布运行',
    completedSummary:
      'MySQL CDC → Hive 已完成：配置确认 → stx sync test → dag → preview → submit，作业 RUNNING。',
    findings: [
      {
        number: '01',
        title: '配置合规',
        quote: '密码使用 {{password}}，url / 库表 / Hive 表名已按你的要求写入。',
      },
      {
        number: '02',
        title: '链路打通',
        quote: 'test / dag / preview 均通过。',
      },
      {
        number: '03',
        title: '已上线',
        quote: 'stx sync submit · engine_job_id=883921 · RUNNING',
      },
    ],
    artifactTitle: 'mysql_cdc_to_hive.v3.conf',
    artifactMeta: 'stx sync · published v3',
    artifactBody: CDC_CONF,
  },
  {
    id: 'upgrade',
    label: 'SeaTunnel 升级验证',
    chatTitle: 'Upgrade 验证 · 2.3.13',
    projectName: 'upgrade-lab',
    welcomeTitle: '升级前兼容验证',
    welcomeSub: '搭 2.3.13 小型验证集群，冒烟 + 差异报告，验收后再决定是否升级。',
    prompt:
      '我们目前要从 SeaTunnel 2.3.8 升级到 2.3.13。帮我搭建一个 2.3.13 的小型验证集群，验证现有配置在新版本是否兼容、运行是否报错，最后给出差异报告供验收评估。',
    reply:
      '可以。流程是：用 stx 拉起 2.3.13 小型验证集群 → 装好连接器 → 把现有典型配置拿去冒烟 → 产出配置差异报告 → 整理验收清单，由你评估是否对生产执行升级（本轮不做正式 Execute）。',
    midUsers: [
      {
        afterPhases: 3,
        text: '冒烟结果可以，继续出差异报告和验收清单吧。',
      },
    ],
    phases: [
      {
        title: '搭建 2.3.13 小型验证集群',
        tool: 'stx cluster create',
        icon: 'cli',
        queries: [
          'cluster=upgrade-verify-2313',
          'nodes=1 · engine=Zeta',
          'package=apache-seatunnel-2.3.13',
        ],
        detail:
          '`stx cluster create` + `stx package install --version 2.3.13`，单节点验证集群就绪，与生产隔离。',
      },
      {
        title: '准备目标版连接器',
        tool: 'stx plugin install',
        icon: 'upgrade',
        queries: [
          'connector-cdc-mysql@2.3.13',
          'connector-hive@2.3.13',
          'connector-jdbc@2.3.13',
        ],
        detail:
          '`stx plugin install` 为目标版本装好生产常用连接器，供后续冒烟使用。',
      },
      {
        title: '配置兼容冒烟',
        tool: 'stx job smoke',
        icon: 'jobs',
        queries: [
          'batch.template → ok',
          'mysql-cdc→hive draft → ok',
          'jdbc upsert sample → ok',
        ],
        detail:
          '`stx job smoke` 用现有三类配置在 2.3.13 验证集群跑通：批模板、CDC→Hive、JDBC upsert，均无报错。',
      },
      {
        title: '生成配置差异报告',
        tool: 'stx upgrade diff',
        icon: 'logs',
        queries: [
          'seatunnel.yaml · http.port keep',
          'checkpoint.namespace keep',
          'deprecated keys: 2 · new keys: 5',
        ],
        detail:
          '`stx upgrade diff --from 2.3.8 --to 2.3.13`：保留本地 http/checkpoint；标出废弃项与新增默认项，形成可审阅差异报告。',
      },
      {
        title: '验收清单（待评估）',
        tool: 'stx upgrade review',
        icon: 'upgrade',
        queries: [
          'smoke: passed',
          'diff report: attached',
          'decision: pending human approve',
        ],
        detail:
          '`stx upgrade review` 汇总冒烟结果与差异报告。请验收后决定是否对生产执行升级；本演示到验收为止，不自动 Execute。',
      },
    ],
    completedTitle: '验证完成 · 待你验收',
    completedSummary:
      '2.3.13 小型验证集群已冒烟通过，配置差异报告已产出。请验收后评估是否对生产升级；本轮未执行正式 SWITCH_VERSION。',
    findings: [
      {
        number: '01',
        title: '验证集群',
        quote: 'upgrade-verify-2313 · SeaTunnel 2.3.13 · 单节点 Zeta 就绪。',
      },
      {
        number: '02',
        title: '冒烟通过',
        quote: '三类现有配置在新版本运行无报错。',
      },
      {
        number: '03',
        title: '待验收决策',
        quote: '差异报告已给出；是否升级由你确认后再执行。',
      },
    ],
    artifactTitle: 'upgrade-diff 2.3.8→2.3.13',
    artifactMeta: 'stx upgrade review',
    artifactBody: `# upgrade verification

verify_cluster: upgrade-verify-2313 (2.3.13)
from_prod: 2.3.8

smoke:
- batch.template → ok
- mysql-cdc→hive → ok
- jdbc upsert → ok

diff highlights:
- keep: http.port, checkpoint.namespace
- review: 2 deprecated keys, 5 new defaults

next:
1. human accept diff report
2. decide go / no-go
3. only then: stx upgrade execute (not in this demo)

result: verification complete · pending approval`,
  },
];

const SCENARIOS_EN: Scenario[] = [
  {
    id: 'diagnose',
    label: 'Prod cluster health check',
    chatTitle: 'SeaTunnel cluster diagnosis',
    projectName: 'zeta-prod ops',
    welcomeTitle:
      'Visual ops + native AI Agent (CLI + Skill): make SeaTunnel ops clear',
    welcomeSub:
      'Drive stx with natural language: clusters, jobs, logs, and source in one flow.',
    prompt:
      'Check which SeaTunnel clusters are running in prod and whether jobs are healthy. If any failed, pull error logs and map them to source for root cause.',
    reply:
      'I will list clusters and running jobs, locate failed job logs, then map them to SeaTunnel source for actionable fixes.',
    midUsers: [],
    phases: [
      {
        title: 'List running clusters',
        tool: 'stx cluster list',
        icon: 'cli',
        queries: [
          'zeta-prod · Zeta · healthy 3/3',
          'spark-batch · Spark · healthy 4/4',
          'flink-cdc · Flink · degraded 2/3',
        ],
        detail:
          '`stx cluster list` summarizes engine type, node heartbeat, and managed status.',
      },
      {
        title: 'List running / failed jobs',
        tool: 'stx job list',
        icon: 'jobs',
        queries: [
          'job-1831 orders_cdc_sync · RUNNING',
          'job-1842 inventory_enrich · FAILED',
          'job-1850 user_profile_stream · RUNNING',
        ],
        detail:
          '`stx job list --cluster zeta-prod --state RUNNING,FAILED` pinpoints failed job-1842.',
      },
      {
        title: 'Collect failed job logs',
        tool: 'stx job logs',
        icon: 'logs',
        queries: [
          'Checkpoint barrier timeout 30s',
          'JDBC batch failed: Duplicate key',
          'JobMaster · SinkException',
        ],
        detail:
          '`stx job logs --id job-1842 --tail 40` points to a JDBC Sink write conflict.',
      },
      {
        title: 'Map to SeaTunnel source',
        tool: 'stx skill read',
        icon: 'code',
        queries: [
          'JdbcSinkWriter.java:214',
          'ignoreDuplicate / upsert strategy',
          'suggest stx job restart',
        ],
        detail:
          '`stx skill read` opens the JdbcSinkWriter conflict branch; root cause is primary-key conflict, not cluster downtime.',
      },
    ],
    completedTitle: 'Diagnosis complete',
    completedSummary:
      'Root cause: JDBC Sink primary-key conflict. Switch to upsert, or clean conflicting rows then run `stx job restart --id job-1842`.',
    findings: [
      {
        number: '01',
        title: 'Cluster healthy',
        quote: 'zeta-prod nodes 3/3 online; control-plane heartbeat OK.',
      },
      {
        number: '02',
        title: 'Job failure',
        quote: 'job-1842 failed; logs show Duplicate key.',
      },
      {
        number: '03',
        title: 'Source-backed',
        quote: 'Without upsert, conflicts throw SinkException.',
      },
    ],
    artifactTitle: 'job-1842 diagnosis notes',
    artifactMeta: 'SeaTunnel · stx skill',
    artifactBody: `# job-1842 diagnosis notes

Root cause: JDBC Sink primary-key conflict (Duplicate key)

Recommendations:
1. Switch Sink to upsert / enable ignoreDuplicate
2. Clean conflicting data, then resubmit
3. stx job restart --id job-1842`,
  },
  {
    id: 'cdc-hive',
    label: 'MySQL CDC → Hive submit',
    chatTitle: 'Sync job submit',
    projectName: 'data-sync studio',
    welcomeTitle: 'Submit a sync job with stx',
    welcomeSub:
      'Generate HOCON from connector docs, test, extract DAG, preview, then publish.',
    prompt:
      'Submit a MySQL CDC to Hive job. MySQL url is jdbc:mysql://mysql.prod:3306/, password uses system var {{password}}, table shop.orders, sink Hive ods.orders_cdc.',
    reply:
      'Got it. Full stx path: draft HOCON from connector docs (password = {{password}}) → confirm → test → DAG → preview → publish.',
    midUsers: [
      {
        afterPhases: 2,
        text: 'Confirmed. Keep password as {{password}} system variable.',
      },
      {
        afterPhases: 4,
        text: 'Yes — preview a few rows first, then publish if it looks good.',
      },
    ],
    phases: [
      {
        title: 'Read connector docs',
        tool: 'stx skill read',
        icon: 'code',
        queries: [
          'docs: MySQL-CDC / Hive',
          'plugin: connector-cdc-mysql',
          'plugin: connector-hive',
        ],
        detail:
          '`stx skill read` aligns Source=`MySQL-CDC`, Sink=`Hive`; password uses global {{password}}.',
      },
      {
        title: 'Draft HOCON for confirm',
        tool: 'stx sync draft',
        icon: 'sync',
        queries: [
          'env.job.mode = STREAMING',
          'password = "{{password}}"',
          'source MySQL-CDC → sink Hive',
        ],
        detail: CDC_DRAFT_DETAIL_EN,
      },
      {
        title: 'Test connections',
        tool: 'stx sync test',
        icon: 'cli',
        queries: [
          'Source[0]-MySQL-CDC ok',
          'Sink[0]-Hive ok',
          'vars: {{password}} resolved',
        ],
        detail:
          '`stx sync test`: MySQL CDC and Hive Metastore passed; {{password}} resolved.',
      },
      {
        title: 'Extract DAG',
        tool: 'stx sync dag',
        icon: 'jobs',
        queries: [
          'Source[0]-MySQL-CDC',
          '→ Sink[0]-Hive',
          'edges=1 · nodes=2',
        ],
        detail:
          '`stx sync dag`: `MySQL-CDC(orders_cdc) → Hive(ods.orders_cdc)`. Preview sample rows?',
      },
      {
        title: 'Preview data',
        tool: 'stx sync preview',
        icon: 'logs',
        queries: [
          'preview job_id=9124',
          'rows=8 · cols=12',
          'order_id / user_id / amount …',
        ],
        detail:
          '`stx sync preview` returned sample rows aligned with shop.orders. Ready to publish.',
      },
      {
        title: 'Publish and run',
        tool: 'stx sync submit',
        icon: 'sync',
        queries: [
          'publish version=v3',
          'engine_job_id=883921',
          'status=RUNNING',
        ],
        detail:
          '`stx sync submit` published v3 on Zeta; binlog offset is advancing.',
      },
    ],
    completedTitle: 'Job published and running',
    completedSummary:
      'MySQL CDC → Hive done: confirm → stx sync test → dag → preview → submit · RUNNING.',
    findings: [
      {
        number: '01',
        title: 'Config OK',
        quote: 'Password uses {{password}}; url / tables / Hive name match your request.',
      },
      {
        number: '02',
        title: 'Pipeline OK',
        quote: 'test / dag / preview all passed.',
      },
      {
        number: '03',
        title: 'Live',
        quote: 'stx sync submit · engine_job_id=883921 · RUNNING',
      },
    ],
    artifactTitle: 'mysql_cdc_to_hive.v3.conf',
    artifactMeta: 'stx sync · published v3',
    artifactBody: CDC_CONF,
  },
  {
    id: 'upgrade',
    label: 'SeaTunnel upgrade verify',
    chatTitle: 'Upgrade verify · 2.3.13',
    projectName: 'upgrade-lab',
    welcomeTitle: 'Pre-upgrade compatibility check',
    welcomeSub:
      'Stand up a small 2.3.13 verify cluster, smoke + diff report, then you decide.',
    prompt:
      'We need to upgrade SeaTunnel from 2.3.8 to 2.3.13. Stand up a small 2.3.13 verify cluster, check whether existing configs are compatible, and produce a diff report for acceptance.',
    reply:
      'Plan: create a 2.3.13 verify cluster with stx → install connectors → smoke existing configs → emit config diff → acceptance checklist. No production Execute in this demo.',
    midUsers: [
      {
        afterPhases: 3,
        text: 'Smoke looks good — continue with the diff report and checklist.',
      },
    ],
    phases: [
      {
        title: 'Create 2.3.13 verify cluster',
        tool: 'stx cluster create',
        icon: 'cli',
        queries: [
          'cluster=upgrade-verify-2313',
          'nodes=1 · engine=Zeta',
          'package=apache-seatunnel-2.3.13',
        ],
        detail:
          '`stx cluster create` + `stx package install --version 2.3.13`; single-node verify cluster ready, isolated from prod.',
      },
      {
        title: 'Install target connectors',
        tool: 'stx plugin install',
        icon: 'upgrade',
        queries: [
          'connector-cdc-mysql@2.3.13',
          'connector-hive@2.3.13',
          'connector-jdbc@2.3.13',
        ],
        detail:
          '`stx plugin install` installs common prod connectors for the target version.',
      },
      {
        title: 'Config smoke tests',
        tool: 'stx job smoke',
        icon: 'jobs',
        queries: [
          'batch.template → ok',
          'mysql-cdc→hive draft → ok',
          'jdbc upsert sample → ok',
        ],
        detail:
          '`stx job smoke` ran three existing configs on 2.3.13: batch template, CDC→Hive, JDBC upsert — all green.',
      },
      {
        title: 'Generate config diff',
        tool: 'stx upgrade diff',
        icon: 'logs',
        queries: [
          'seatunnel.yaml · http.port keep',
          'checkpoint.namespace keep',
          'deprecated keys: 2 · new keys: 5',
        ],
        detail:
          '`stx upgrade diff --from 2.3.8 --to 2.3.13`: keep local http/checkpoint; flag deprecated and new defaults.',
      },
      {
        title: 'Acceptance checklist',
        tool: 'stx upgrade review',
        icon: 'upgrade',
        queries: [
          'smoke: passed',
          'diff report: attached',
          'decision: pending human approve',
        ],
        detail:
          '`stx upgrade review` summarizes smoke + diff. You decide whether to upgrade prod; this demo stops at acceptance.',
      },
    ],
    completedTitle: 'Verification done · awaiting you',
    completedSummary:
      '2.3.13 verify cluster smoked green; config diff is ready. Decide go/no-go for prod; no SWITCH_VERSION in this run.',
    findings: [
      {
        number: '01',
        title: 'Verify cluster',
        quote: 'upgrade-verify-2313 · SeaTunnel 2.3.13 · single-node Zeta ready.',
      },
      {
        number: '02',
        title: 'Smoke passed',
        quote: 'Three existing configs ran cleanly on the new version.',
      },
      {
        number: '03',
        title: 'Pending decision',
        quote: 'Diff report ready; upgrade only after you confirm.',
      },
    ],
    artifactTitle: 'upgrade-diff 2.3.8→2.3.13',
    artifactMeta: 'stx upgrade review',
    artifactBody: `# upgrade verification

verify_cluster: upgrade-verify-2313 (2.3.13)
from_prod: 2.3.8

smoke:
- batch.template → ok
- mysql-cdc→hive → ok
- jdbc upsert → ok

diff highlights:
- keep: http.port, checkpoint.namespace
- review: 2 deprecated keys, 5 new defaults

next:
1. human accept diff report
2. decide go / no-go
3. only then: stx upgrade execute (not in this demo)

result: verification complete · pending approval`,
  },
];

const CHROME_ZH: AgentChrome = {
  ariaDemo: 'stx Skill 对话演示',
  ariaNav: 'stx 工作台导航',
  ariaComposer: '演示输入框',
  searchToast: '演示模式：搜索暂不可用',
  notifyTitle: '通知',
  notifyToast: '暂无新通知',
  newTask: '新建任务',
  newTaskToast: '已新建任务',
  plugins: '插件 / Skill',
  pluginsToast: 'Skill / 插件市场（演示）',
  artifacts: '产物中心',
  openArtifactToast: '已打开产物',
  artifactPendingToast: '产物将在流程完成后出现',
  projects: '项目',
  recent: '最近',
  scenarioToast: (label) => `场景：${label}`,
  expandSidebar: '展开侧栏',
  collapseSidebar: '收起侧栏',
  running: '执行中',
  pause: '暂停',
  pauseDemo: '暂停演示',
  replay: '重播演示',
  inProgress: '进行中',
  generating: '生成中',
  generated: '已生成',
  collapseArtifact: '已收起产物',
  expandArtifact: '已展开产物',
  addAttachment: '添加附件',
  attachmentToast: '演示模式：附件上传暂不可用',
  defaultPermission: '默认权限',
  permissionToast: '权限：默认（演示）',
  send: '发送',
  sendStartedToast: '已发送，开始调用 stx…',
  placeholderRunning: '正在通过 stx 执行…',
  placeholderIdle: '描述你想排查或提交的运维任务…',
};

const CHROME_EN: AgentChrome = {
  ariaDemo: 'stx Skill chat demo',
  ariaNav: 'stx workspace nav',
  ariaComposer: 'Demo input',
  searchToast: 'Demo: search unavailable',
  notifyTitle: 'Notifications',
  notifyToast: 'No new notifications',
  newTask: 'New task',
  newTaskToast: 'New task created',
  plugins: 'Plugins / Skill',
  pluginsToast: 'Skill / plugin market (demo)',
  artifacts: 'Artifacts',
  openArtifactToast: 'Opened artifact',
  artifactPendingToast: 'Artifact appears when the flow finishes',
  projects: 'Projects',
  recent: 'Recent',
  scenarioToast: (label) => `Scenario: ${label}`,
  expandSidebar: 'Expand sidebar',
  collapseSidebar: 'Collapse sidebar',
  running: 'Running',
  pause: 'Pause',
  pauseDemo: 'Pause demo',
  replay: 'Replay demo',
  inProgress: 'In progress',
  generating: 'Generating',
  generated: 'Ready',
  collapseArtifact: 'Artifact collapsed',
  expandArtifact: 'Artifact expanded',
  addAttachment: 'Add attachment',
  attachmentToast: 'Demo: attachments unavailable',
  defaultPermission: 'Default ACL',
  permissionToast: 'Permission: default (demo)',
  send: 'Send',
  sendStartedToast: 'Sent — calling stx…',
  placeholderRunning: 'Running via stx…',
  placeholderIdle: 'Describe the ops task to diagnose or submit…',
};

export function getAgentScenarios(locale: HomeLocale): Scenario[] {
  return locale === 'en' ? SCENARIOS_EN : SCENARIOS_ZH;
}

export function getAgentChrome(locale: HomeLocale): AgentChrome {
  return locale === 'en' ? CHROME_EN : CHROME_ZH;
}
