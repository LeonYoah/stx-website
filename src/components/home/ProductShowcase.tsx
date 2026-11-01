import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {useHomeLocale, type HomeLocale} from './useHomeLocale';

type ShowcaseCard = {
  id: string;
  image: string;
  index: string;
  title: string;
  lead: string;
  points: string[];
  mediaAlt: string;
};

type ShowcaseCopy = {
  eyebrow: string;
  title: string;
  sub: string;
  mediaNote: string;
  cards: ShowcaseCard[];
};

const COPY: Record<HomeLocale, ShowcaseCopy> = {
  zh: {
    eyebrow: '产品能力',
    title: '主机、集群、任务与诊断同在一处',
    sub: '对齐 v1.3.0：实时可观测、作业告警、测试连接、一键升级，以及版本发布与 Savepoint 提示，都在 Web UI 里完成。',
    mediaNote: '界面预览',
    cards: [
      {
        id: 'dashboard',
        image: '/img/screenshots/01-dashboard.png',
        index: '01',
        title: 'Web UI 总览',
        lead: '先看全局，再落到问题本身。',
        points: [
          '主机、集群与任务健康同屏呈现',
          '关键水位与异常入口就近可达',
          '从概览一键进入处置路径',
        ],
        mediaAlt: 'STX Web UI 总览',
      },
      {
        id: 'clusters',
        image: '/img/screenshots/40-cluster-install-config.png',
        index: '02',
        title: '集群生命周期',
        lead: '安装、启停、一键升级，不再散落在脚本里。',
        points: [
          '创建到升级的完整链路同屏管理',
          '节点可配置自定义 JDK',
          '端口和 JVM 堆内存在安装配置里指定',
        ],
        mediaAlt: 'STX 创建集群安装配置',
      },
      {
        id: 'workbench',
        image: '/img/screenshots/02-workbench.png',
        index: '03',
        title: '调试工作台',
        lead: '草稿保存、版本发布，形成可回看的闭环。',
        points: [
          '保存只更新草稿；发布新版本后才能正式运行',
          'Savepoint 恢复前会提示先发布版本',
          'HOCON 与 Checkpoint 可逐层排查',
        ],
        mediaAlt: 'STX 调试工作台',
      },
      {
        id: 'test-connection',
        image: '/img/screenshots/38-test-connection.gif',
        index: '04',
        title: '测试连接',
        lead: '改完地址与表名，先探活再跑作业。',
        points: [
          '工具栏一键测试连接，不必先发布',
          '验证库能否连通、对象是否存在',
          '失败先改配置，再继续 DAG 或预览',
        ],
        mediaAlt: 'STX 工作台测试连接',
      },
      {
        id: 'dag',
        image: '/img/screenshots/08-dag.png',
        index: '05',
        title: 'DAG 预览',
        lead: '配置落成图，上下游一眼能对上。',
        points: [
          '从 HOCON 解析出执行拓扑',
          'Source 与 Sink 的表路径同屏可见',
          '点开算子即可看上下游与表结构',
        ],
        mediaAlt: 'STX DAG 预览',
      },
      {
        id: 'observe',
        image: '/img/screenshots/36-observe-realtime.gif',
        index: '06',
        title: '实时可观测',
        lead: '运行水位实时可见，异常有据可查。',
        points: [
          '作业吞吐与运行态同屏刷新',
          '监控承接水位信号，便于下钻',
          '确认后可继续走到诊断与恢复',
        ],
        mediaAlt: 'STX 实时可观测',
      },
      {
        id: 'alert',
        image: '/img/screenshots/37-job-alert.gif',
        index: '07',
        title: '作业告警',
        lead: '告警进入 AlertHub，处理路径清晰。',
        points: [
          '作业告警事件集中呈现',
          '规则与通知通道可配置',
          '确认、静默后可转入诊断',
        ],
        mediaAlt: 'STX 作业告警 AlertHub',
      },
    ],
  },
  en: {
    eyebrow: 'Capabilities',
    title: 'Hosts, clusters, jobs, and diagnosis in one place',
    sub: 'See status in the Web UI, then install, start/stop, debug, or troubleshoot as needed.',
    mediaNote: 'UI preview',
    cards: [
      {
        id: 'dashboard',
        image: '/img/screenshots/01-dashboard.png',
        index: '01',
        title: 'Web UI overview',
        lead: 'See the big picture first, then drill into the issue.',
        points: [
          'Host, cluster, and job health on one screen',
          'Key levels and exception entry points nearby',
          'Jump from overview into the next action',
        ],
        mediaAlt: 'STX Web UI overview',
      },
      {
        id: 'clusters',
        image: '/img/screenshots/40-cluster-install-config.png',
        index: '02',
        title: 'Cluster lifecycle',
        lead: 'Install, start/stop, and upgrade—without scattered scripts.',
        points: [
          'Create through upgrade managed on one screen',
          'Set a custom JDK path on each node',
          'Set ports and JVM heap on the install step',
        ],
        mediaAlt: 'STX cluster install configuration',
      },
      {
        id: 'workbench',
        image: '/img/screenshots/02-workbench.png',
        index: '03',
        title: 'Debug workbench',
        lead: 'Configure, preview, and submit in a reviewable loop.',
        points: [
          'Edit HOCON with a visual DAG',
          'Inspect Checkpoint and runtime state layer by layer',
          'From debug to run, steps stay reproducible',
        ],
        mediaAlt: 'STX debug workbench',
      },
      {
        id: 'test-connection',
        image: '/img/screenshots/38-test-connection.gif',
        index: '04',
        title: 'Test connection',
        lead: 'Validate connectivity before running the job.',
        points: [
          'One-click test from the workbench toolbar',
          'Check database reachability and objects',
          'Fix config first, then continue to DAG or preview',
        ],
        mediaAlt: 'STX workbench test connection',
      },
      {
        id: 'dag',
        image: '/img/screenshots/08-dag.png',
        index: '05',
        title: 'DAG preview',
        lead: 'Config becomes a graph; upstream and downstream line up.',
        points: [
          'Execution topology parsed from HOCON',
          'Source and sink table paths on the same view',
          'Open an operator to see upstream, downstream, and schema',
        ],
        mediaAlt: 'STX DAG preview',
      },
      {
        id: 'observe',
        image: '/img/screenshots/36-observe-realtime.gif',
        index: '06',
        title: 'Realtime observability',
        lead: 'See runtime levels live, then follow the evidence.',
        points: [
          'Job throughput and runtime state refresh on screen',
          'Monitoring surfaces level signals for drill-down',
          'Continue into diagnosis and recovery when ready',
        ],
        mediaAlt: 'STX realtime observability',
      },
      {
        id: 'alert',
        image: '/img/screenshots/37-job-alert.gif',
        index: '07',
        title: 'Job alerts',
        lead: 'Alerts land in AlertHub with a clear handling path.',
        points: [
          'Job alert events in one place',
          'Rules and notification channels are configurable',
          'Acknowledge or silence, then move to diagnosis',
        ],
        mediaAlt: 'STX job alerts AlertHub',
      },
    ],
  },
};

/**
 * 第四屏：多组「描述 + 媒体窗」；截图与发版动图混用。
 * Fourth band: multiple copy + media rows; stills and release GIFs.
 */
export function ProductShowcase(): React.JSX.Element {
  const locale = useHomeLocale();
  const copy = COPY[locale];

  return (
    <section
      className="stx-showcase"
      aria-label={locale === 'en' ? 'Product showcase' : '产品展示'}
    >
      <div className="stx-showcase__intro">
        <p className="stx-showcase__eyebrow">
          <span className="stx-showcase__eyebrow-mark" aria-hidden="true" />
          {copy.eyebrow}
        </p>
        <h2 className="stx-showcase__title">{copy.title}</h2>
        <p className="stx-showcase__sub">{copy.sub}</p>
      </div>

      <div className="stx-showcase__cards">
        {copy.cards.map((card, index) => (
          <ShowcaseCard
            key={card.id}
            card={card}
            reverse={index % 2 === 1}
            mediaNote={copy.mediaNote}
          />
        ))}
      </div>
    </section>
  );
}

function ShowcaseCard({
  card,
  reverse,
  mediaNote,
}: {
  card: ShowcaseCard;
  reverse: boolean;
  mediaNote: string;
}): React.JSX.Element {
  const src = useBaseUrl(card.image);

  return (
    <article
      className={`stx-showcase__card${reverse ? ' is-reverse' : ''}`}
    >
      <div className="stx-showcase__copy">
        <p className="stx-showcase__index" aria-hidden="true">
          {card.index}
        </p>
        <h3 className="stx-showcase__card-title">{card.title}</h3>
        <p className="stx-showcase__lead">{card.lead}</p>
        <ul className="stx-showcase__points">
          {card.points.map((point) => (
            <li key={point}>
              <span className="stx-showcase__bullet" aria-hidden="true" />
              <span className="stx-showcase__point-text">{point}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="stx-showcase__media">
        <figure className="stx-showcase__frame">
          <img
            className="stx-showcase__shot"
            src={src}
            alt={card.mediaAlt}
            width={1440}
            height={900}
            loading="lazy"
            decoding="async"
          />
          <figcaption className="stx-showcase__caption">{mediaNote}</figcaption>
        </figure>
      </div>
    </article>
  );
}
