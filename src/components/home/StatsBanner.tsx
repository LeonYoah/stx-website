import React from 'react';

/**
 * 统计指标项定义
 * Statistical metric item definition
 */
interface StatItem {
  metric: string;
  label: string;
  detail: string;
}

const STATS_DATA: StatItem[] = [
  {
    metric: '< 5s',
    label: '节点状态心跳感知',
    detail: 'gRPC 双向流实时监测主从状态',
  },
  {
    metric: '100+',
    label: '数据源生态连接器',
    detail: 'MySQL, Doris, Kafka, Iceberg 等',
  },
  {
    metric: '0 侵入',
    label: '独立 Agent 守护模式',
    detail: '不修改 SeaTunnel 引擎核心包',
  },
  {
    metric: '100%',
    label: '配置变更版本回滚',
    detail: '每次下发均生成不可变版本快照',
  },
];

/**
 * 首页指标数据展板组件
 * Homepage key metrics and stats banner component
 */
export function StatsBanner(): React.JSX.Element {
  return (
    <section
      style={{
        borderTop: '1px solid var(--stx-card-border)',
        borderBottom: '1px solid var(--stx-card-border)',
        backgroundColor: 'rgba(142, 202, 214, 0.04)',
        padding: '3rem 1.5rem',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '2rem',
          textAlign: 'center',
        }}
      >
        {STATS_DATA.map((item, idx) => (
          <div key={idx}>
            <div
              className="stx-gradient-text"
              style={{
                fontSize: '2.4rem',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
                marginBottom: '6px',
              }}
            >
              {item.metric}
            </div>
            <div style={{ fontSize: '0.98rem', fontWeight: 600, marginBottom: '4px' }}>
              {item.label}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--ifm-color-emphasis-600)' }}>
              {item.detail}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
