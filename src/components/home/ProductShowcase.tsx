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
    sub: '在 Web UI 里查看状态，再去做安装、启停、调试或排查。',
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
        image: '/img/screenshots/04-clusters.png',
        index: '02',
        title: '集群生命周期',
        lead: '安装、启停、升级，不再散落在脚本里。',
        points: [
          '创建到升级的完整链路同屏管理',
          '节点状态与引擎类型始终可见',
          '每次变更可追踪，操作不再黑箱',
        ],
        mediaAlt: 'STX 集群管理',
      },
      {
        id: 'workbench',
        image: '/img/screenshots/02-workbench.png',
        index: '03',
        title: '调试工作台',
        lead: '配置、预览、提交，形成可回看的闭环。',
        points: [
          'HOCON 与 DAG 结构可视化编辑',
          'Checkpoint 与运行态可逐层排查',
          '从调试到运行，动作连贯可复现',
        ],
        mediaAlt: 'STX 调试工作台',
      },
      {
        id: 'dag',
        image: '/img/screenshots/08-dag.png',
        index: '04',
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
        image: '/img/screenshots/05-monitoring.png',
        index: '05',
        title: '监控与诊断',
        lead: '异常不是终点，证据链才是。',
        points: [
          '监控承接运行水位与告警信号',
          '诊断把线索、日志与根因串起来',
          '确认后可继续走到恢复动作',
        ],
        mediaAlt: 'STX 监控中心',
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
        image: '/img/screenshots/04-clusters.png',
        index: '02',
        title: 'Cluster lifecycle',
        lead: 'Install, start/stop, and upgrade—without scattered scripts.',
        points: [
          'Create through upgrade managed on one screen',
          'Node status and engine type stay visible',
          'Each change is trackable',
        ],
        mediaAlt: 'STX cluster management',
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
        id: 'dag',
        image: '/img/screenshots/08-dag.png',
        index: '04',
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
        image: '/img/screenshots/05-monitoring.png',
        index: '05',
        title: 'Monitoring & diagnosis',
        lead: 'Alerts are a start; evidence comes next.',
        points: [
          'Monitoring shows runtime levels and alerts',
          'Diagnosis links clues, logs, and root cause',
          'Then continue into recovery when ready',
        ],
        mediaAlt: 'STX monitoring',
      },
    ],
  },
};

/**
 * 第四屏：多组「描述 + 媒体窗」；暂用截图，后续可换视频。
 * Fourth band: multiple copy + media rows; screenshots now, video later.
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
