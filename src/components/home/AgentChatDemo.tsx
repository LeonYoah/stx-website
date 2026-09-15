import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import logoLight from '@site/static/img/stx-logo.png';
import logoDark from '@site/static/img/stx-logo-dark.png';

/**
 * STX 多场景演示：诊断 / MySQL-CDC→Hive 提交 / 2.3.8→2.3.13 升级验证。
 * stx 是 CLI 命令 + Skill，不是独立 AI Agent。
 * Multi-scenario demo; stx is a CLI command + Skill, not a standalone AI agent.
 */

type PhaseIcon = 'cli' | 'jobs' | 'logs' | 'code' | 'sync' | 'upgrade';

type Phase = {
  title: string;
  tool: string;
  detail: string;
  queries: string[];
  icon: PhaseIcon;
};

type Finding = { number: string; title: string; quote: string };

type Scenario = {
  id: string;
  label: string;
  chatTitle: string;
  projectName: string;
  welcomeTitle: string;
  welcomeSub: string;
  /** 首条用户输入（打字机） / First typed user prompt */
  prompt: string;
  /** 开场助手回复 / Opening assistant reply */
  reply: string;
  /** 过程中插入的用户确认等 / Mid-flow user turns (after N phases) */
  midUsers: { afterPhases: number; text: string }[];
  phases: Phase[];
  completedTitle: string;
  completedSummary: string;
  findings: Finding[];
  artifactTitle: string;
  artifactMeta: string;
  artifactBody: string;
};

const SCENARIOS: Scenario[] = [
  {
    id: 'diagnose',
    label: '线上集群健康巡检',
    chatTitle: 'SeaTunnel 集群诊断',
    projectName: 'zeta-prod 运维',
    welcomeTitle: '可视化管理 + 原生 AI Agent（CLI + Skill）：让 SeaTunnel 运维清晰透明',
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
        detail: `已用 \`stx sync draft\` 生成草稿，请确认是否符合要求：

\`\`\`hocon
env {
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
}
\`\`\`

是否按此配置继续？`,
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
    artifactBody: `env {
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
}`,
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

/** 放慢节奏；阶段更多的场景仍保持可跟读 / Slow timeline for readability */
const TYPE_START = 200;
const TYPE_DURATION = 2800;
const START_AT = 4800;
const PHASE_GAP = 3200;
const MID_USER_GAP = 1600;
const FINISH_GAP = 2800;

type Mode = 'welcome' | 'running' | 'complete';

/**
 * stx Skill 提及胶囊：完整青鸾 Logo（图形 + STX 字样，仅提问时）。
 * Skill mention chip: full Qingluan logo (mark + STX wordmark, asks only).
 */
function StxMentionChip({
  className = '',
}: {
  className?: string;
}): React.JSX.Element {
  return (
    <span className={`stx-mention ${className}`.trim()} title="青鸾 · STX">
      <img
        className="stx-mention__logo stx-mention__logo--light"
        src={logoLight}
        alt="STX"
        height={18}
        draggable={false}
      />
      <img
        className="stx-mention__logo stx-mention__logo--dark"
        src={logoDark}
        alt="STX"
        height={18}
        draggable={false}
      />
    </span>
  );
}

/** 对话区内完整青鸾 Logo（图形 + STX） / Full Qingluan logo inside chat shell */
function StxBrandMark({
  className = '',
  height = 28,
}: {
  className?: string;
  height?: number;
}): React.JSX.Element {
  return (
    <span className={`stx-brand-mark ${className}`.trim()}>
      <img
        className="stx-brand-mark__img stx-brand-mark__img--light"
        src={logoLight}
        alt="STX"
        height={height}
        draggable={false}
      />
      <img
        className="stx-brand-mark__img stx-brand-mark__img--dark"
        src={logoDark}
        alt="STX"
        height={height}
        draggable={false}
      />
    </span>
  );
}

function Icon({
  name,
  className,
}: {
  name: string;
  className?: string;
}): React.JSX.Element {
  const common = {
    className,
    width: 16,
    height: 16,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true as const,
  };

  const paths: Record<string, ReactNode> = {
    panel: <path d="M4 6h16M4 12h10M4 18h16" />,
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-3.5-3.5" />
      </>
    ),
    bell: (
      <>
        <path d="M6 9a6 6 0 0 1 12 0c0 7 3 7 3 7H3s3 0 3-7" />
        <path d="M10 20a2 2 0 0 0 4 0" />
      </>
    ),
    plus: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v8M8 12h8" />
      </>
    ),
    plugin: (
      <path d="M12 3l7 4v10l-7 4-7-4V7l7-4zM12 12l7-4M12 12v10M12 12L5 8" />
    ),
    box: <path d="M3 7l9-4 9 4-9 4-9-4zm0 0v10l9 4 9-4V7" />,
    folder: (
      <path d="M3 7h6l2 2h10v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
    ),
    chevron: <path d="M6 9l6 6 6-6" />,
    send: <path d="M5 12h14M13 6l6 6-6 6" />,
    check: <path d="M5 12l5 5L20 7" />,
    replay: <path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5" />,
    stop: <path d="M7 7h10v10H7z" />,
    cli: (
      <>
        <path d="M4 6h16v12H4z" />
        <path d="M7 10l3 2-3 2M12 14h5" />
      </>
    ),
    jobs: (
      <>
        <path d="M8 6h13M8 12h13M8 18h13" />
        <path d="M3 6h.01M3 12h.01M3 18h.01" />
      </>
    ),
    logs: (
      <>
        <path d="M8 6h13v14H8z" />
        <path d="M4 6h4v14H4z" />
        <path d="M11 10h6M11 14h6" />
      </>
    ),
    code: (
      <>
        <path d="M9 8l-4 4 4 4M15 8l4 4-4 4" />
      </>
    ),
    sync: (
      <>
        <path d="M4 12a8 8 0 0 1 14-5" />
        <path d="M18 4v4h-4" />
        <path d="M20 12a8 8 0 0 1-14 5" />
        <path d="M6 20v-4h4" />
      </>
    ),
    upgrade: (
      <>
        <path d="M12 19V5" />
        <path d="M6 11l6-6 6 6" />
        <path d="M5 19h14" />
      </>
    ),
  };

  return <svg {...common}>{paths[name] ?? null}</svg>;
}

type TimelineEvent =
  | { at: number; kind: 'start' }
  | { at: number; kind: 'phase'; index: number }
  | { at: number; kind: 'midUser'; text: string }
  | { at: number; kind: 'finish' };

function buildTimeline(scenario: Scenario): {
  events: TimelineEvent[];
  endAt: number;
} {
  const events: TimelineEvent[] = [{ at: START_AT, kind: 'start' }];
  let t = START_AT + 1400;
  let phasesDone = 0;

  scenario.phases.forEach((_, index) => {
    events.push({ at: t, kind: 'phase', index });
    phasesDone += 1;
    t += PHASE_GAP;

    const mids = scenario.midUsers.filter((m) => m.afterPhases === phasesDone);
    mids.forEach((m) => {
      events.push({ at: t, kind: 'midUser', text: m.text });
      t += MID_USER_GAP;
    });
  });

  events.push({ at: t + FINISH_GAP - PHASE_GAP, kind: 'finish' });
  return { events, endAt: t + FINISH_GAP - PHASE_GAP };
}

/**
 * 首页 stx Skill 对话演示工作台（多场景）
 */
export function AgentChatDemo({
  embedded = false,
}: {
  embedded?: boolean;
}): React.JSX.Element {
  const [scenarioId, setScenarioId] = useState(SCENARIOS[0].id);
  const scenario = SCENARIOS.find((s) => s.id === scenarioId) ?? SCENARIOS[0];

  const [mode, setMode] = useState<Mode>('welcome');
  const [promptText, setPromptText] = useState('');
  const [phaseCount, setPhaseCount] = useState(0);
  const [phaseDone, setPhaseDone] = useState<boolean[]>([]);
  /** 按时间顺序的会话流（含阶段占位） / Chronological feed including phase slots */
  const [feed, setFeed] = useState<
    Array<
      | { kind: 'user'; text: string; mention?: boolean }
      | { kind: 'assistant'; text: string }
      | { kind: 'phase'; index: number }
    >
  >([]);
  const [showFinish, setShowFinish] = useState(false);
  const [showTyping, setShowTyping] = useState(false);
  const [headerTitle, setHeaderTitle] = useState('');
  const [expanded, setExpanded] = useState<Set<number>>(() => new Set());
  const [runId, setRunId] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [pressedId, setPressedId] = useState<string | null>(null);
  const [artifactOpen, setArtifactOpen] = useState(false);

  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef({
    playing: true,
    elapsed: 0,
    eventIdx: -1,
    mode: 'welcome' as Mode,
  });
  const reducedMotion = useRef(false);
  const toastTimer = useRef<number | null>(null);
  const timelineRef = useRef(buildTimeline(scenario));

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2200);
  }, []);

  const flashPress = useCallback((id: string) => {
    setPressedId(id);
    window.setTimeout(() => setPressedId((cur) => (cur === id ? null : cur)), 160);
  }, []);

  const resetPlay = useCallback(() => {
    timelineRef.current = buildTimeline(
      SCENARIOS.find((s) => s.id === scenarioId) ?? SCENARIOS[0],
    );
    stateRef.current = {
      playing: true,
      elapsed: 0,
      eventIdx: -1,
      mode: 'welcome',
    };
    setMode('welcome');
    setPromptText('');
    setPhaseCount(0);
    setPhaseDone([]);
    setFeed([]);
    setShowFinish(false);
    setShowTyping(false);
    setHeaderTitle('');
    setExpanded(new Set());
    setArtifactOpen(false);
    setRunId((n) => n + 1);
  }, [scenarioId]);

  const selectScenario = useCallback((id: string) => {
    setScenarioId(id);
  }, []);

  useEffect(() => {
    // 切换场景后重建时间线并重播 / Rebuild timeline when scenario changes
    timelineRef.current = buildTimeline(scenario);
    stateRef.current = {
      playing: true,
      elapsed: 0,
      eventIdx: -1,
      mode: 'welcome',
    };
    setMode('welcome');
    setPromptText('');
    setPhaseCount(0);
    setPhaseDone([]);
    setFeed([]);
    setShowFinish(false);
    setShowTyping(false);
    setHeaderTitle('');
    setExpanded(new Set());
    setArtifactOpen(false);
    setRunId((n) => n + 1);
  }, [scenario]);

  const stopPlayback = useCallback(() => {
    stateRef.current.playing = false;
    setShowTyping(false);
    if (stateRef.current.mode === 'running') showToast('已暂停演示');
  }, [showToast]);

  const togglePhase = useCallback((index: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }, []);

  useEffect(() => {
    reducedMotion.current =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  useEffect(() => {
    let frameId: number | null = null;
    let previous = performance.now();
    let cancelled = false;
    const { events, endAt } = timelineRef.current;
    const current = SCENARIOS.find((s) => s.id === scenarioId) ?? SCENARIOS[0];

    const applyEvent = (ev: TimelineEvent) => {
      if (ev.kind === 'start') {
        stateRef.current.mode = 'running';
        setMode('running');
        setHeaderTitle(current.chatTitle);
        setShowTyping(true);
        setPhaseCount(0);
        setPhaseDone([]);
        setShowFinish(false);
        setPromptText('');
        setExpanded(new Set());
        setArtifactOpen(false);
        setFeed([
          { kind: 'user', text: current.prompt, mention: true },
          { kind: 'assistant', text: current.reply },
        ]);
      } else if (ev.kind === 'phase') {
        setPhaseDone((prev) => {
          const next = [...prev];
          for (let i = 0; i < ev.index; i += 1) next[i] = true;
          return next;
        });
        setPhaseCount(ev.index + 1);
        setFeed((prev) => [...prev, { kind: 'phase', index: ev.index }]);
      } else if (ev.kind === 'midUser') {
        setFeed((prev) => [...prev, { kind: 'user', text: ev.text }]);
        setShowTyping(true);
      } else if (ev.kind === 'finish') {
        setPhaseDone(current.phases.map(() => true));
        setShowTyping(false);
        setShowFinish(true);
        stateRef.current.mode = 'complete';
        setMode('complete');
        stateRef.current.playing = false;
      }
    };

    const completeImmediately = () => {
      while (stateRef.current.eventIdx + 1 < events.length) {
        stateRef.current.eventIdx += 1;
        applyEvent(events[stateRef.current.eventIdx]);
      }
      stateRef.current.elapsed = endAt;
      stateRef.current.playing = false;
    };

    const tick = () => {
      frameId = null;
      if (cancelled) return;
      const now = performance.now();
      const delta = Math.max(0, Math.min(now - previous, 100));
      previous = now;
      const s = stateRef.current;
      if (!s.playing) return;

      if (reducedMotion.current) {
        completeImmediately();
        return;
      }

      s.elapsed = Math.min(endAt, s.elapsed + delta);

      if (s.mode === 'welcome') {
        const progress = Math.max(
          0,
          Math.min(1, (s.elapsed - TYPE_START) / TYPE_DURATION),
        );
        const chars = Array.from(current.prompt);
        setPromptText(chars.slice(0, Math.floor(chars.length * progress)).join(''));
      }

      while (
        s.eventIdx + 1 < events.length &&
        s.elapsed >= events[s.eventIdx + 1].at
      ) {
        s.eventIdx += 1;
        applyEvent(events[s.eventIdx]);
      }

      if (s.playing && s.elapsed < endAt) {
        frameId = window.requestAnimationFrame(tick);
      }
      // 播完停在结果页，不自动重播；切换「最近」场景或点重播才再动
      // Stay on final result; only scenario switch / replay restarts
    };

    previous = performance.now();
    frameId = window.requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      if (frameId !== null) window.cancelAnimationFrame(frameId);
    };
  }, [runId, scenarioId]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || mode === 'welcome') return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [mode, phaseCount, showFinish, showTyping, feed]);

  /**
   * 对话区内滚到顶/底后，把滚轮交给页面，避免困在内部滚动条。
   * Forward wheel to the page at scroll edges so users aren't trapped.
   */
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const onWheel = (event: WheelEvent) => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const maxScroll = scrollHeight - clientHeight;
      const canScroll = maxScroll > 1;
      const scrollingUp = event.deltaY < 0;
      const scrollingDown = event.deltaY > 0;
      const atTop = scrollTop <= 1;
      const atBottom = scrollTop >= maxScroll - 1;

      if (!canScroll || (atTop && scrollingUp) || (atBottom && scrollingDown)) {
        event.preventDefault();
        window.scrollBy(0, event.deltaY);
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const handleSend = () => {
    flashPress('send');
    const s = stateRef.current;
    if (s.mode === 'welcome') {
      s.elapsed = START_AT;
      s.playing = true;
      showToast('已发送，开始调用 stx…');
      return;
    }
    if (s.mode === 'running') {
      stopPlayback();
      return;
    }
    resetPlay();
  };

  const composerPlaceholder =
    mode === 'running'
      ? '正在通过 stx 执行…'
      : '描述你想排查或提交的运维任务…';

  const shellClass = [
    'stx-mimo',
    mode !== 'welcome' ? 'is-active' : '',
    sidebarCollapsed ? 'is-sidebar-collapsed' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section
      id="stx-agent-section"
      className={`stx-agent-demo${embedded ? ' stx-agent-demo--embedded' : ''}`}
      aria-label="stx Skill 对话演示"
    >
      <div className={shellClass}>
        <aside className="stx-mimo__sidebar" aria-label="stx 工作台导航">
          <div className="stx-mimo__toolbar">
            <button
              type="button"
              className={`stx-mimo__icon-btn${pressedId === 'panel' ? ' is-pressed' : ''}`}
              title={sidebarCollapsed ? '展开侧栏' : '收起侧栏'}
              aria-label={sidebarCollapsed ? '展开侧栏' : '收起侧栏'}
              onClick={() => {
                flashPress('panel');
                setSidebarCollapsed((v) => !v);
              }}
            >
              <Icon name="panel" />
            </button>
            <button
              type="button"
              className={`stx-mimo__icon-btn${pressedId === 'search' ? ' is-pressed' : ''}`}
              title="搜索"
              aria-label="搜索"
              onClick={() => {
                flashPress('search');
                showToast('演示模式：搜索暂不可用');
              }}
            >
              <Icon name="search" />
            </button>
            <button
              type="button"
              className={`stx-mimo__icon-btn${pressedId === 'bell' ? ' is-pressed' : ''}`}
              title="通知"
              aria-label="通知"
              onClick={() => {
                flashPress('bell');
                showToast('暂无新通知');
              }}
            >
              <Icon name="bell" />
            </button>
          </div>

          <nav className="stx-mimo__nav">
            <button
              type="button"
              className="stx-mimo__nav-item"
              onClick={() => {
                resetPlay();
                showToast('已新建任务');
              }}
            >
              <Icon name="plus" />
              新建任务
            </button>
            <button
              type="button"
              className="stx-mimo__nav-item"
              onClick={() => showToast('Skill / 插件市场（演示）')}
            >
              <Icon name="plugin" />
              插件 / Skill
            </button>
            <button
              type="button"
              className="stx-mimo__nav-item"
              onClick={() => {
                if (showFinish) {
                  setArtifactOpen(true);
                  showToast('已打开产物');
                } else {
                  showToast('产物将在流程完成后出现');
                }
              }}
            >
              <Icon name="box" />
              产物中心
              {showFinish ? <em className="stx-mimo__badge">1</em> : null}
            </button>
          </nav>

          <div className="stx-mimo__side-scroll">
            <div className="stx-mimo__section-label">
              <Icon name="folder" />
              项目
            </div>
            <button
              type="button"
              className="stx-mimo__project"
              onClick={() => showToast(scenario.projectName)}
            >
              <Icon name="folder" />
              {scenario.projectName}
            </button>

            <div className="stx-mimo__section-label">最近</div>
            {SCENARIOS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`stx-mimo__recent${scenarioId === item.id ? ' is-selected' : ''}`}
                onClick={() => {
                  selectScenario(item.id);
                  showToast(`场景：${item.label}`);
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="stx-mimo__user"
            aria-label="STX"
            onClick={() => showToast('STX（演示）')}
          >
            <StxBrandMark className="stx-mimo__user-logo" height={28} />
          </button>
        </aside>

        <div className="stx-mimo__main">
          <header className="stx-mimo__header">
            <button
              type="button"
              className="stx-mimo__icon-btn stx-mimo__header-panel"
              title={sidebarCollapsed ? '展开侧栏' : '收起侧栏'}
              aria-label={sidebarCollapsed ? '展开侧栏' : '收起侧栏'}
              onClick={() => setSidebarCollapsed((v) => !v)}
            >
              <Icon name="panel" />
            </button>
            <span
              className="stx-mimo__header-title"
              style={{ opacity: headerTitle ? 1 : 0 }}
            >
              {headerTitle || scenario.chatTitle}
            </span>
            <div className="stx-mimo__header-actions">
              {mode === 'running' ? (
                <span className="stx-mimo__status">
                  <i />
                  执行中
                </span>
              ) : null}
              {mode === 'running' ? (
                <button
                  type="button"
                  className="stx-mimo__icon-btn"
                  onClick={stopPlayback}
                  title="暂停"
                  aria-label="暂停演示"
                >
                  <Icon name="stop" />
                </button>
              ) : null}
              <button
                type="button"
                className={`stx-mimo__icon-btn${pressedId === 'replay' ? ' is-pressed' : ''}`}
                onClick={() => {
                  flashPress('replay');
                  resetPlay();
                }}
                title="重播演示"
                aria-label="重播演示"
              >
                <Icon name="replay" />
              </button>
            </div>
          </header>

          <div ref={scrollerRef} className="stx-mimo__viewport">
            {mode === 'welcome' ? (
              <div className="stx-mimo__welcome">
                <div className="stx-mimo__welcome-mark" aria-hidden>
                  <StxBrandMark height={28} />
                </div>
                <h3>{scenario.welcomeTitle}</h3>
                <p>{scenario.welcomeSub}</p>
              </div>
            ) : (
              <div className="stx-mimo__conversation" role="log" aria-live="polite">
                {feed.map((item, i) => {
                  if (item.kind === 'user') {
                    return (
                      <div key={`u-${i}`} className="stx-mimo__user-msg stx-mimo__reveal">
                        {item.mention ? (
                          <StxMentionChip className="stx-mention--inline" />
                        ) : null}
                        {item.text}
                      </div>
                    );
                  }
                  if (item.kind === 'assistant') {
                    return (
                      <div key={`a-${i}`} className="stx-mimo__assistant stx-mimo__reveal">
                        <p className="stx-mimo__assistant-text">{item.text}</p>
                      </div>
                    );
                  }

                  const phase = scenario.phases[item.index];
                  if (!phase) return null;
                  const done = Boolean(phaseDone[item.index]);
                  const open = expanded.has(item.index);
                  return (
                    <section
                      key={`p-${scenario.id}-${item.index}`}
                      className="stx-mimo__phase stx-mimo__reveal"
                    >
                      <button
                        type="button"
                        className="stx-mimo__phase-toggle"
                        aria-expanded={open}
                        onClick={() => togglePhase(item.index)}
                      >
                        <span className="stx-mimo__phase-icon">
                          <Icon name={phase.icon} />
                        </span>
                        <span className="stx-mimo__phase-title">
                          <strong>{phase.title}</strong>
                          <small>{phase.tool}</small>
                        </span>
                        <span className="stx-mimo__phase-state">
                          {done ? <Icon name="check" /> : '进行中'}
                        </span>
                        <Icon name="chevron" className="stx-mimo__phase-arrow" />
                      </button>
                      {open ? (
                        <div className="stx-mimo__phase-detail">
                          <p style={{ whiteSpace: 'pre-wrap' }}>{phase.detail}</p>
                          <div className="stx-mimo__queries">
                            {phase.queries.map((q) => (
                              <span key={q}>{q}</span>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </section>
                  );
                })}

                {showTyping ? (
                  <div className="stx-mimo__typing" aria-label="生成中">
                    <i />
                    <i />
                    <i />
                  </div>
                ) : null}

                {showFinish ? (
                  <div className="stx-mimo__finish stx-mimo__reveal">
                    <h4>{scenario.completedTitle}</h4>
                    <p>{scenario.completedSummary}</p>
                    <ol className="stx-mimo__findings">
                      {scenario.findings.map((f) => (
                        <li key={f.number}>
                          <span>{f.number}</span>
                          <div>
                            <strong>{f.title}</strong>
                            <p>{f.quote}</p>
                          </div>
                        </li>
                      ))}
                    </ol>
                    <button
                      type="button"
                      className={`stx-mimo__artifact${artifactOpen ? ' is-open' : ''}`}
                      onClick={() => {
                        setArtifactOpen((v) => !v);
                        showToast(artifactOpen ? '已收起产物' : '已展开产物');
                      }}
                    >
                      <span className="stx-mimo__artifact-cover" aria-hidden>
                        <StxBrandMark className="stx-mimo__artifact-logo" height={22} />
                      </span>
                      <span className="stx-mimo__artifact-copy">
                        <strong>{scenario.artifactTitle}</strong>
                        <small>{scenario.artifactMeta}</small>
                        <em>
                          <Icon name="check" />
                          已生成
                        </em>
                      </span>
                    </button>
                    {artifactOpen ? (
                      <pre className="stx-mimo__artifact-body">{scenario.artifactBody}</pre>
                    ) : null}
                  </div>
                ) : null}
              </div>
            )}
          </div>

          <div className="stx-mimo__composer-wrap">
            <div className="stx-mimo__composer">
              {/* 提问态始终展示 stx 胶囊（不依赖打字进度，避免第一屏 logo 缺失） */}
              <div
                className="stx-mimo__composer-editor"
                aria-label="演示输入框"
                role="textbox"
                aria-readonly="true"
              >
                {mode === 'welcome' ? (
                  <>
                    <StxMentionChip className="stx-mention--composer" />
                    {promptText ? (
                      <span className="stx-mimo__composer-text">{promptText}</span>
                    ) : (
                      <span className="stx-mimo__composer-placeholder">
                        {composerPlaceholder}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="stx-mimo__composer-placeholder">
                    {composerPlaceholder}
                  </span>
                )}
              </div>
              <div className="stx-mimo__composer-bar">
                <div className="stx-mimo__composer-left">
                  <button
                    type="button"
                    className="stx-mimo__chip"
                    title="添加附件"
                    aria-label="添加附件"
                    onClick={() => showToast('演示模式：附件上传暂不可用')}
                  >
                    <Icon name="plus" />
                  </button>
                  <button
                    type="button"
                    className="stx-mimo__chip stx-mimo__chip--label"
                    onClick={() => showToast('权限：默认（演示）')}
                  >
                    默认权限
                  </button>
                </div>
                <div className="stx-mimo__composer-right">
                  <button
                    type="button"
                    className={`stx-mimo__send${
                      promptText || mode !== 'welcome' ? ' is-on' : ''
                    }${pressedId === 'send' ? ' is-pressed' : ''}`}
                    aria-label={mode === 'running' ? '暂停' : '发送'}
                    onClick={handleSend}
                  >
                    <Icon name={mode === 'running' ? 'stop' : 'send'} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {toast ? (
          <div className="stx-mimo__toast" role="status">
            {toast}
          </div>
        ) : null}
      </div>
    </section>
  );
}
