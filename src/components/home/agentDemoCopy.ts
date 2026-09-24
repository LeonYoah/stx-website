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

const SCENARIOS_ZH: Scenario[] = [
  {
    id: 'diagnose',
    label: '集群与失败任务',
    chatTitle: '查集群与失败任务',
    projectName: '生产环境示例',
    welcomeTitle: '一句话开始排查，过程能看清',
    welcomeSub: 'AI Agent 通过 STX Skill 使用真实 CLI 命令；这里展示的是示例数据。',
    prompt: '帮我看看 6 号集群有没有失败的同步作业，先查状态和日志，不要改动环境。',
    reply: '先查集群和节点，再列出失败作业、读取日志。全程只查询，不执行重启或恢复。',
    midUsers: [],
    phases: [
      {
        title: '列出集群', tool: 'stx cluster list --output table', icon: 'cli',
        queries: ['集群 6 · zeta-prod', '版本 2.3.13', '先确认目标集群'],
        detail: 'stx cluster list --output table：确认集群编号和版本。这里的编号与状态仅用于演示。',
      },
      {
        title: '查看节点', tool: 'stx cluster node list 6', icon: 'jobs',
        queries: ['查看节点列表', '检查在线状态', '不修改集群'],
        detail: 'stx cluster node list 6：单独查看 6 号集群的节点信息，不从作业失败推断集群故障。',
      },
      {
        title: '筛选失败作业', tool: 'stx sync job list --status FAILED', icon: 'sync',
        queries: ['作业 1842 · FAILED', '记录作业编号', '核对所属任务'],
        detail: 'stx sync job list --status FAILED：从返回结果中核对作业所属集群和任务，再选要查看的作业编号。',
      },
      {
        title: '读取作业日志', tool: 'stx sync job logs 1842 --lines 40', icon: 'logs',
        queries: ['示例：Duplicate key', '对照任务配置', '暂不自动恢复'],
        detail: 'stx sync job logs 1842 --lines 40：按日志线索检查配置与目标表。仅凭一条报错不能断定全部原因。',
      },
    ],
    completedTitle: '查询完成 · 等待你决定',
    completedSummary: '已示范通过 CLI 查集群、节点、失败作业和日志；未执行写操作。',
    findings: [
      {number: '01', title: '目标集群', quote: '先确认集群编号和节点状态。'},
      {number: '02', title: '失败作业', quote: '按 FAILED 筛选后核对作业归属。'},
      {number: '03', title: '后续操作', quote: '日志只是线索，修改配置或恢复作业前需要再次确认。'},
    ],
    artifactTitle: '排查记录（示例）',
    artifactMeta: 'stx cluster · stx sync job',
    artifactBody: `# 排查记录（示例）

集群：6 · zeta-prod
作业：1842 · FAILED

已查询：
- stx cluster list --output table
- stx cluster node list 6
- stx sync job list --status FAILED
- stx sync job logs 1842 --lines 40

下一步：核对任务配置与日志全文，确认后再决定是否修改或恢复。`,
  },
  {
    id: 'cdc-hive',
    label: '创建同步任务',
    chatTitle: 'MySQL CDC → Hive',
    projectName: '同步任务示例',
    welcomeTitle: '从配置文件到任务提交',
    welcomeSub: '先核对连接器与配置，写入和提交前分别请你确认。',
    prompt: '我要把 MySQL 的订单变更写入 Hive。先检查连接器和配置，确认后再创建任务。',
    reply: '先列出 6 号集群可用连接器。配置文件由你检查；创建、发布和提交都需要明确确认。',
    midUsers: [
      {afterPhases: 1, text: '配置文件我检查过了，可以创建任务。'},
      {afterPhases: 4, text: '验证和连接测试通过，可以发布；提交运行前再问我。'},
      {afterPhases: 5, text: '同意提交运行，之后把作业状态发给我。'},
    ],
    phases: [
      {
        title: '检查连接器', tool: 'stx sync plugin list --cluster-id 6 --type source', icon: 'code',
        queries: ['检查 MySQL-CDC', '检查 Hive', '确认配置文件内容'],
        detail: '分别执行 stx sync plugin list --cluster-id 6 --type source 和 --type sink，确认 MySQL-CDC 与 Hive 在目标集群可用。配置文件需使用该版本连接器接受的字段。',
      },
      {
        title: '创建任务', tool: 'stx sync task create', icon: 'sync',
        queries: ['--name orders-to-hive', '--cluster-id 6', '示例任务编号 12'],
        detail: 'stx sync task create --name orders-to-hive --cluster-id 6 --config-file task.conf --confirm：创建任务草稿，尚未发布或运行。',
      },
      {
        title: '验证配置', tool: 'stx sync task validate 12', icon: 'cli',
        queries: ['语法与插件字段', '读取验证结果', '有错先改配置'],
        detail: 'stx sync task validate 12：验证已保存的配置。验证成功不等于源端和目标端一定可以连接。',
      },
      {
        title: '测试连接', tool: 'stx sync task test-connections 12', icon: 'jobs',
        queries: ['检查源端连接', '检查目标端连接', '失败时停止'],
        detail: 'stx sync task test-connections 12：单独测试连接；若失败，先修正配置，不继续发布。',
      },
      {
        title: '发布配置版本', tool: 'stx sync task publish 12 --confirm', icon: 'sync',
        queries: ['生成历史版本', '不自动运行', '等待提交确认'],
        detail: 'stx sync task publish 12 --confirm：冻结当前配置为一个历史版本。发布与提交运行是两步。',
      },
      {
        title: '提交并查看状态', tool: 'stx sync task submit 12 --wait --confirm', icon: 'logs',
        queries: ['提交会占用集群资源', '返回作业编号', '再查询运行状态'],
        detail: 'stx sync task submit 12 --wait --confirm：提交任务。返回的执行状态不等于持续运行状态；随后用 stx sync job list --task_id 12 查询。',
      },
    ],
    completedTitle: '流程演示完成',
    completedSummary: '命令按检查、创建、验证、测试、发布、提交的顺序执行；实际结果要以 CLI 返回为准。',
    findings: [
      {number: '01', title: '先检查', quote: '目标集群有对应连接器，配置文件经人工确认。'},
      {number: '02', title: '再发布', quote: '创建任务与发布版本是不同操作。'},
      {number: '03', title: '提交后查询', quote: '提交成功后还要查看作业是否持续运行。'},
    ],
    artifactTitle: '同步任务步骤（示例）',
    artifactMeta: 'stx sync task',
    artifactBody: `# MySQL CDC → Hive（示例）

配置文件：task.conf（先按当前连接器字段检查）
集群：6
任务：12

stx sync plugin list --cluster-id 6 --type source
stx sync plugin list --cluster-id 6 --type sink
stx sync task create --name orders-to-hive --cluster-id 6 --config-file task.conf --confirm
stx sync task validate 12
stx sync task test-connections 12
stx sync task publish 12 --confirm
stx sync task submit 12 --wait --confirm
stx sync job list --task_id 12`,
  },
  {
    id: 'upgrade',
    label: '升级前预检',
    chatTitle: '升级前预检 · 2.3.13',
    projectName: '升级评估示例',
    welcomeTitle: '先看预检，再决定要不要升级',
    welcomeSub: '展示现有升级命令；不创建验证集群，也不执行升级。',
    prompt: '想把 8 号 SeaTunnel 集群升级到 2.3.13。先帮我看看准备情况，不要执行升级。',
    reply: '我会核对目标集群和可用安装包，再运行升级预检。发现问题先告诉你，本轮不创建升级计划或执行升级。',
    midUsers: [],
    phases: [
      {
        title: '确认目标集群', tool: 'stx cluster get 8', icon: 'cli',
        queries: ['集群编号 8', '核对当前版本', '核对部署模式'],
        detail: 'stx cluster get 8：先检查集群资料，避免把别的集群当成升级目标。',
      },
      {
        title: '检查安装包', tool: 'stx package list', icon: 'upgrade',
        queries: ['目标版本 2.3.13', '检查包是否可用', '缺包先准备'],
        detail: 'stx package list：确认目标 SeaTunnel 版本是否已有可用安装包；没有时先准备安装包。',
      },
      {
        title: '运行升级预检', tool: 'stx upgrade precheck', icon: 'logs',
        queries: ['检查目标安装目录', '查看预检结果', '不执行升级'],
        detail: 'stx upgrade precheck 8 --target-version 2.3.13 --target-install-dir /tmp/seatunnel-2.3.13-new：返回预检结果；后续计划需另行创建。',
      },
    ],
    completedTitle: '预检演示结束',
    completedSummary: '展示了升级前需要查的集群、安装包与预检命令；没有创建计划，也没有执行升级。',
    findings: [
      {number: '01', title: '集群资料', quote: '确认编号、版本和部署模式。'},
      {number: '02', title: '目标安装包', quote: '先确认 2.3.13 在环境中可用。'},
      {number: '03', title: '预检结果', quote: '只有阅读实际预检输出后，才能决定下一步。'},
    ],
    artifactTitle: '升级前检查（示例）',
    artifactMeta: 'stx upgrade precheck',
    artifactBody: `# 升级前检查（示例）

集群：8
目标版本：2.3.13

stx cluster get 8
stx package list
stx upgrade precheck 8 --target-version 2.3.13 --target-install-dir /tmp/seatunnel-2.3.13-new

本轮未创建升级计划，未执行升级。请根据实际预检结果决定后续操作。`,
  },
];

const SCENARIOS_EN: Scenario[] = [
  {
    id: 'diagnose', label: 'Clusters and failed jobs', chatTitle: 'Inspect failed jobs', projectName: 'Production example',
    welcomeTitle: 'Start with a question. See each command.',
    welcomeSub: 'An AI Agent uses the real STX CLI through its Skill. All results here are illustrative.',
    prompt: 'Check cluster 6 and its failed sync jobs. Read logs, but do not change anything.',
    reply: 'I will inspect the cluster, nodes, failed jobs, and logs. No restart or recovery.',
    midUsers: [],
    phases: [
      {title: 'List clusters', tool: 'stx cluster list --output table', icon: 'cli', queries: ['cluster 6 · zeta-prod', 'SeaTunnel 2.3.13', 'confirm target'], detail: 'List clusters and confirm the target ID. IDs and statuses here are examples.'},
      {title: 'Inspect nodes', tool: 'stx cluster node list 6', icon: 'jobs', queries: ['node list', 'online status', 'read-only'], detail: 'Inspect cluster nodes; a failed job does not necessarily mean a failed cluster.'},
      {title: 'Filter failed jobs', tool: 'stx sync job list --status FAILED', icon: 'sync', queries: ['job 1842 · FAILED', 'verify cluster', 'verify task'], detail: 'Filter failed jobs, then verify which cluster and task own each returned job.'},
      {title: 'Read job logs', tool: 'stx sync job logs 1842 --lines 40', icon: 'logs', queries: ['example: Duplicate key', 'inspect config', 'no auto-recovery'], detail: 'Read 40 lines, then compare the full log and task config. One error line is not a complete diagnosis.'},
    ],
    completedTitle: 'Inspection complete', completedSummary: 'Read-only example: clusters, nodes, failed jobs, and logs. No write operation was run.',
    findings: [{number: '01', title: 'Target cluster', quote: 'Verify the cluster ID and nodes.'}, {number: '02', title: 'Failed job', quote: 'Filter by FAILED and check ownership.'}, {number: '03', title: 'Next step', quote: 'Review the full log before changing config or recovering a job.'}],
    artifactTitle: 'Investigation notes (example)', artifactMeta: 'stx cluster · stx sync job',
    artifactBody: `# Investigation notes (example)

stx cluster list --output table
stx cluster node list 6
stx sync job list --status FAILED
stx sync job logs 1842 --lines 40

No write commands were run.`,
  },
  {
    id: 'cdc-hive', label: 'Create a sync task', chatTitle: 'MySQL CDC → Hive', projectName: 'Sync example',
    welcomeTitle: 'From config file to submitted job', welcomeSub: 'Review connectors and configuration first. Confirm writes separately.',
    prompt: 'I want to sync MySQL order changes into Hive. Check connectors and config before creating the task.',
    reply: 'I will inspect available plugins first. Creating, publishing, and submitting require your confirmation.',
    midUsers: [{afterPhases: 1, text: 'I reviewed the config. You may create the task.'}, {afterPhases: 4, text: 'Validation passed. Publish the version; ask me before submitting.'}, {afterPhases: 5, text: 'I approve submitting the job. Check its status afterwards.'}],
    phases: [
      {title: 'Check connectors', tool: 'stx sync plugin list --cluster-id 6 --type source', icon: 'code', queries: ['MySQL-CDC', 'Hive', 'review task.conf'], detail: 'List sources with --type source, then sinks with --type sink on cluster 6. Review the config against supported fields.'},
      {title: 'Create task', tool: 'stx sync task create', icon: 'sync', queries: ['--name orders-to-hive', '--cluster-id 6', 'example task ID 12'], detail: 'Create a draft: stx sync task create --name orders-to-hive --cluster-id 6 --config-file task.conf --confirm. This does not submit it.'},
      {title: 'Validate', tool: 'stx sync task validate 12', icon: 'cli', queries: ['syntax and plugin fields', 'read validation result', 'fix errors first'], detail: 'Validate the saved config. Success does not prove source and sink connectivity.'},
      {title: 'Test connections', tool: 'stx sync task test-connections 12', icon: 'jobs', queries: ['source check', 'sink check', 'stop if failed'], detail: 'Test source and sink connections. Do not publish if this check fails.'},
      {title: 'Publish version', tool: 'stx sync task publish 12 --confirm', icon: 'sync', queries: ['freeze history', 'not running yet', 'wait for approval'], detail: 'Publishing freezes a task version. Submission is a separate operation.'},
      {title: 'Submit and inspect', tool: 'stx sync task submit 12 --wait --confirm', icon: 'logs', queries: ['consumes cluster resources', 'get job ID', 'check status separately'], detail: 'Submit, then use stx sync job list --task_id 12 to check the job status. Execution completion does not imply the streaming job is still running.'},
    ],
    completedTitle: 'Workflow illustrated', completedSummary: 'Inspect, create, validate, test, publish, then submit. Actual outcomes depend on CLI responses.',
    findings: [{number: '01', title: 'Inspect first', quote: 'Check plugins and review the config.'}, {number: '02', title: 'Publish separately', quote: 'Creating and publishing are different operations.'}, {number: '03', title: 'Check after submit', quote: 'Query the job status after submission.'}],
    artifactTitle: 'Sync commands (example)', artifactMeta: 'stx sync task',
    artifactBody: `# MySQL CDC → Hive (example)

stx sync plugin list --cluster-id 6 --type source
stx sync plugin list --cluster-id 6 --type sink
stx sync task create --name orders-to-hive --cluster-id 6 --config-file task.conf --confirm
stx sync task validate 12
stx sync task test-connections 12
stx sync task publish 12 --confirm
stx sync task submit 12 --wait --confirm
stx sync job list --task_id 12`,
  },
  {
    id: 'upgrade', label: 'Upgrade precheck', chatTitle: 'Precheck · 2.3.13', projectName: 'Upgrade example',
    welcomeTitle: 'Check first, decide later', welcomeSub: 'Real upgrade commands, without creating a verification cluster or executing an upgrade.',
    prompt: 'We may upgrade cluster 8 to SeaTunnel 2.3.13. Check readiness; do not upgrade it.',
    reply: 'I will inspect the cluster and package list, then run a precheck. No plan or execution in this example.',
    midUsers: [],
    phases: [
      {title: 'Inspect target', tool: 'stx cluster get 8', icon: 'cli', queries: ['cluster ID 8', 'current version', 'deployment mode'], detail: 'Verify the target cluster before an upgrade.'},
      {title: 'Check packages', tool: 'stx package list', icon: 'upgrade', queries: ['target 2.3.13', 'check availability', 'prepare if missing'], detail: 'See whether the target SeaTunnel package is available in this environment.'},
      {title: 'Run precheck', tool: 'stx upgrade precheck', icon: 'logs', queries: ['target install directory', 'read the response', 'no execution'], detail: 'Run stx upgrade precheck 8 --target-version 2.3.13 --target-install-dir /tmp/seatunnel-2.3.13-new. A plan is a separate step.'},
    ],
    completedTitle: 'Precheck example complete', completedSummary: 'Demonstrates cluster, package, and precheck commands. No plan was created and no upgrade was executed.',
    findings: [{number: '01', title: 'Cluster', quote: 'Confirm ID, version, and mode.'}, {number: '02', title: 'Package', quote: 'Check 2.3.13 availability.'}, {number: '03', title: 'Precheck', quote: 'Read the actual response before deciding what to do next.'}],
    artifactTitle: 'Pre-upgrade steps (example)', artifactMeta: 'stx upgrade precheck',
    artifactBody: `# Pre-upgrade steps (example)

stx cluster get 8
stx package list
stx upgrade precheck 8 --target-version 2.3.13 --target-install-dir /tmp/seatunnel-2.3.13-new

No plan created; no upgrade executed.`,
  },
];

const CHROME_ZH: AgentChrome = {
  ariaDemo: 'STX CLI 场景演示（示例数据）',
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
  ariaDemo: 'STX CLI scenario demo (illustrative data)',
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
