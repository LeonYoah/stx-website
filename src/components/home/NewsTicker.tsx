import React, {useEffect, useMemo, useState} from 'react';
import Link from '@docusaurus/Link';
import {useHomeLocale, type HomeLocale} from './useHomeLocale';

/**
 * 滚动动态条目定义
 * Ticker announcement item definitions
 */
interface TickerItem {
  tag: string;
  text: string;
  actionText: string;
  link: string;
}

const TICKER_ITEMS: Record<HomeLocale, TickerItem[]> = {
  zh: [
    {
      tag: 'RELEASE',
      text: 'STX 内置监控与首页大盘：指标采集、趋势图和告警评估在 STX 内完成',
      actionText: '了解内置监控 ➔',
      link: '/docs/alerts-diagnostics/builtin-monitoring',
    },
    {
      tag: 'SUPPORT',
      text: '兼容 Apache SeaTunnel 2.3.x+ 与 100+ Connector 插件',
      actionText: '查看说明 ➔',
      link: '/docs/host-cluster/cluster-management',
    },
    {
      tag: 'DOCS',
      text: '中英文文档已同步：快速部署、主机集群、工作台、CLI 与 Skill',
      actionText: '阅读文档 ➔',
      link: '/docs/',
    },
  ],
  en: [
    {
      tag: 'RELEASE',
      text: 'Built-in monitoring and dashboards: metrics, trends, and alert evaluation run inside STX',
      actionText: 'Learn more ➔',
      link: '/docs/alerts-diagnostics/builtin-monitoring',
    },
    {
      tag: 'SUPPORT',
      text: 'Works with Apache SeaTunnel 2.3.x+ and 100+ connector plugins',
      actionText: 'Learn more ➔',
      link: '/docs/host-cluster/cluster-management',
    },
    {
      tag: 'DOCS',
      text: 'English docs are live: quick deploy, hosts & clusters, workbench, CLI, and Skill',
      actionText: 'Read docs ➔',
      link: '/docs/',
    },
  ],
};

/**
 * 首页动态轮播跑马灯组件
 * Homepage news and announcement ticker component
 */
export function NewsTicker(): React.JSX.Element {
  const locale = useHomeLocale();
  const items = useMemo(() => TICKER_ITEMS[locale], [locale]);
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    setCurrentIdx(0);
  }, [locale]);

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % items.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [items.length]);

  const current = items[currentIdx] ?? items[0];

  return (
    <div
      className="stx-news-ticker"
      aria-label={locale === 'en' ? 'Product updates' : '产品动态'}
    >
      <div className="stx-news-ticker__inner">
        <div className="stx-news-ticker__main">
          <span className="stx-news-ticker__tag">{current.tag}</span>
          <span key={`${locale}-${currentIdx}`} className="stx-news-ticker__text">
            {current.text}
          </span>
        </div>

        <Link to={current.link} className="stx-news-ticker__action">
          {current.actionText}
        </Link>
      </div>
    </div>
  );
}
