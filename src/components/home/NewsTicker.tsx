import React, { useState, useEffect } from 'react';
import Link from '@docusaurus/Link';

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

const TICKER_ITEMS: TickerItem[] = [
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
    link: '/docs/features/cluster-management',
  },
  {
    tag: 'DOCS',
    text: '对标 Apache Doris 工业级文档标准与冰川青设计系统全面上线',
    actionText: '阅读文档 ➔',
    link: '/docs/',
  },
];

/**
 * 首页动态轮播跑马灯组件
 * Homepage news and announcement ticker component
 */
export function NewsTicker(): React.JSX.Element {
  const [currentIdx, setCurrentIdx] = useState(0);

  // 定时自动滚动条目
  // Automatically cycle through ticker announcements
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % TICKER_ITEMS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const current = TICKER_ITEMS[currentIdx];

  return (
    <div className="stx-news-ticker" aria-label="产品动态">
      <div className="stx-news-ticker__inner">
        <div className="stx-news-ticker__main">
          <span className="stx-news-ticker__tag">{current.tag}</span>
          <span key={currentIdx} className="stx-news-ticker__text">
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
