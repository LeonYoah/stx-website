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
    <div
      style={{
        borderTop: '1px solid var(--stx-card-border)',
        borderBottom: '1px solid var(--stx-card-border)',
        backgroundColor: 'rgba(142, 202, 214, 0.05)',
        backdropFilter: 'blur(8px)',
        padding: '9px 1.5rem',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.84rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '4px',
              backgroundColor: '#298294',
              color: '#ffffff',
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.5px',
            }}
          >
            {current.tag}
          </span>
          <span
            key={currentIdx}
            style={{
              color: 'var(--ifm-color-emphasis-800)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              animation: 'fadeIn 0.4s ease-in-out',
            }}
          >
            {current.text}
          </span>
        </div>

        <Link
          to={current.link}
          style={{
            color: 'var(--ifm-color-primary)',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            marginLeft: '1rem',
            textDecoration: 'none',
          }}
        >
          {current.actionText}
        </Link>
      </div>
    </div>
  );
}
