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
    title: '运维面被摊开，而不是藏起来',
    sub: '主机、集群、任务与诊断在同一控制面里推进——看见状态，再决定动作。',
    mediaNote: '界面预览',
    cards: [
      {
        id: 'dashboard',
        image: '/img/screenshots/01-dashboard.png',
        index: '01',
        title: '控制台总览',
        lead: '先看全局，再落到问题本身。',
        points: [
          '主机、集群与任务健康同屏呈现',
          '关键水位与异常入口就近可达',
          '从概览一键进入处置路径',
        ],
        mediaAlt: 'STX 控制台总览',
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
        title: '任务工作台',
        lead: '配置、预览、提交，形成可回看的闭环。',
        points: [
          'HOCON 与 DAG 结构可视化编辑',
          'Checkpoint 与运行态可逐层排查',
          '从草稿到调试，动作连贯可复现',
        ],
        mediaAlt: 'STX 任务工作台',
      },
      {
        id: 'observe',
        image: '/img/screenshots/05-monitoring.png',
        index: '04',
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
    title: 'Ops laid open — not buried',
    sub: 'Hosts, clusters, jobs, and diagnosis move on one control plane: see state, then act.',
    mediaNote: 'UI preview',
    cards: [
      {
        id: 'dashboard',
        image: '/img/screenshots/01-dashboard.png',
        index: '01',
        title: 'Console overview',
        lead: 'Start wide, then land on the problem.',
        points: [
          'Host, cluster, and job health on one screen',
          'Key levels and exception entry points nearby',
          'Move from overview into action in one step',
        ],
        mediaAlt: 'STX console overview',
      },
      {
        id: 'clusters',
        image: '/img/screenshots/04-clusters.png',
        index: '02',
        title: 'Cluster lifecycle',
        lead: 'Install, start/stop, upgrade — not scattered scripts.',
        points: [
          'Full create-to-upgrade path in one place',
          'Node status and engine type stay visible',
          'Every change is trackable, less black-box ops',
        ],
        mediaAlt: 'STX cluster management',
      },
      {
        id: 'workbench',
        image: '/img/screenshots/02-workbench.png',
        index: '03',
        title: 'Job workbench',
        lead: 'Draft, preview, submit — a loop you can revisit.',
        points: [
          'Visual HOCON and DAG structure editing',
          'Checkpoint and runtime state, layer by layer',
          'From draft to debug with a coherent trail',
        ],
        mediaAlt: 'STX job workbench',
      },
      {
        id: 'observe',
        image: '/img/screenshots/05-monitoring.png',
        index: '04',
        title: 'Monitoring & diagnosis',
        lead: 'An incident is not the end — evidence is.',
        points: [
          'Monitoring carries runtime levels and alerts',
          'Diagnosis connects clues, logs, and root cause',
          'Then continue into recovery actions',
        ],
        mediaAlt: 'STX monitoring center',
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
