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
      text: 'STX 1.0 社区预览版正式发布：一键纳管与图形化集群生命周期控制面',
      actionText: '快速体验 ➔',
      link: '/docs/get-started/quick-start',
    },
    {
      tag: 'SUPPORT',
      text: '全面兼容 Apache SeaTunnel 2.3.x+ 全系列版本与 100+ Connector 插件',
      actionText: '查看说明 ➔',
      link: '/docs/host-cluster/cluster-management',
    },
    {
      tag: 'DOCS',
      text: '对标 Apache Doris 工业级文档标准与冰川青设计系统全面上线',
      actionText: '阅读文档 ➔',
      link: '/docs/',
    },
  ],
  en: [
    {
      tag: 'RELEASE',
      text: 'STX 1.0 community preview: one-click onboarding and visual cluster lifecycle control',
      actionText: 'Try it ➔',
      link: '/docs/get-started/quick-start',
    },
    {
      tag: 'SUPPORT',
      text: 'Compatible with Apache SeaTunnel 2.3.x+ and 100+ connector plugins',
      actionText: 'Learn more ➔',
      link: '/docs/host-cluster/cluster-management',
    },
    {
      tag: 'DOCS',
      text: 'Industrial-grade docs and the Glacier teal design system are live',
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
