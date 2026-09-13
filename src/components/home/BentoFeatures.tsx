import React from 'react';
import Link from '@docusaurus/Link';

/**
 * 首页 Bento Grid 特性卡片展台组件
 * Homepage Bento Grid interactive feature cards showcase component
 */
export function BentoFeatures(): React.JSX.Element {
  return (
    <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '3.5rem 1.5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.75rem' }}>
          为现代化海量数据同步而生
        </h2>
        <p style={{ fontSize: '1.05rem', color: 'var(--ifm-color-emphasis-600)', maxWidth: '640px', margin: '0 auto' }}>
          打破传统大数据组件运维门槛，让集群状态一眼可见、配置变更灰度可逆、作业水位精准感知。
        </p>
      </div>

      {/* Bento Grid 四格现代化布局 */}
      {/* 4-cell Bento Grid modern layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: '1.5rem',
        }}
      >
        {/* 卡片 1 (宽格 7/12)：集群可视化拓扑与状态 */}
        {/* Card 1: Visual Cluster Topology and States */}
        <div className="stx-interactive-card" style={{ gridColumn: 'span 7' }}>
          <div className="stx-card-accent-bar" />
          <div style={{ color: 'var(--ifm-color-primary)', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '8px' }}>
            Cluster Management
          </div>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '8px' }}>
            集群全生命周期管理
          </h3>
          <p style={{ color: 'var(--ifm-color-emphasis-600)', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '1.25rem' }}>
            支持单机模式与 Zeta 高可用集群一键安装部署。实时探针守护主从节点，提供平滑启停、滚动重启与故障自愈转移。
          </p>

          {/* 交互式拓扑图模拟视窗 */}
          {/* Interactive cluster topology mock widget */}
          <div
            style={{
              borderRadius: '8px',
              backgroundColor: 'rgba(142, 202, 214, 0.06)',
              border: '1px solid var(--stx-card-border)',
              padding: '1rem',
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'center',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: '#0c1a29',
                  border: '2px solid #8ecad6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 6px',
                  boxShadow: '0 0 12px var(--stx-glow)',
                }}
              >
                👑
              </div>
              <div style={{ fontSize: '0.78rem', fontWeight: 600 }}>Master Node</div>
              <span style={{ fontSize: '0.7rem', color: '#4ade80' }}>● Leader</span>
            </div>

            <div style={{ color: 'var(--stx-glacier-300)', fontSize: '1.2rem' }}>⇆</div>

            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: '#0c1a29',
                  border: '1px solid #38bdf8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 6px',
                }}
              >
                ⚙️
              </div>
              <div style={{ fontSize: '0.78rem', fontWeight: 600 }}>Worker-01</div>
              <span style={{ fontSize: '0.7rem', color: '#4ade80' }}>● 8 Slots</span>
            </div>

            <div style={{ color: 'var(--stx-glacier-300)', fontSize: '1.2rem' }}>⇆</div>

            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: '#0c1a29',
                  border: '1px solid #38bdf8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 6px',
                }}
              >
                ⚙️
              </div>
              <div style={{ fontSize: '0.78rem', fontWeight: 600 }}>Worker-02</div>
              <span style={{ fontSize: '0.7rem', color: '#4ade80' }}>● 8 Slots</span>
            </div>
          </div>
        </div>

        {/* 卡片 2 (宽格 5/12)：配置中心与一键回滚 */}
        {/* Card 2: Configuration Center & One-click Rollback */}
        <div className="stx-interactive-card" style={{ gridColumn: 'span 5' }}>
          <div className="stx-card-accent-bar" />
          <div style={{ color: 'var(--ifm-color-primary)', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '8px' }}>
            Config Center
          </div>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '8px' }}>
            配置中心与灰度回滚
          </h3>
          <p style={{ color: 'var(--ifm-color-emphasis-600)', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '1.25rem' }}>
            在线版本化维护 `seatunnel.yaml`。任何参数调整均支持视觉 Diff 比对与秒级回滚。
          </p>

          <div
            style={{
              fontFamily: 'monospace',
              fontSize: '0.78rem',
              backgroundColor: '#070d15',
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid #1e293b',
              lineHeight: '1.6',
            }}
          >
            <div style={{ color: '#94a3b8' }}>// v1.2 vs v1.3</div>
            <div style={{ color: '#f87171' }}>- engine.backup-count: 1</div>
            <div style={{ color: '#4ade80' }}>+ engine.backup-count: 2</div>
            <div style={{ color: '#8ecad6' }}>✔ 流式安全推送至所有节点</div>
          </div>
        </div>

        {/* 卡片 3 (宽格 5/12)：Agent 实时心跳守护 */}
        {/* Card 3: Agent High-frequency Heartbeat Guard */}
        <div className="stx-interactive-card" style={{ gridColumn: 'span 5' }}>
          <div className="stx-card-accent-bar" />
          <div style={{ color: 'var(--ifm-color-primary)', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '8px' }}>
            Process Guard
          </div>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '8px' }}>
            轻量探针 秒级保活
          </h3>
          <p style={{ color: 'var(--ifm-color-emphasis-600)', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '1rem' }}>
            `stx-agent` 极低资源占用（内存 &lt; 25MB），采用 gRPC 双向流与服务端长连，进程崩溃秒级报警重拉。
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              backgroundColor: 'rgba(74, 222, 128, 0.08)',
              borderRadius: '6px',
              border: '1px solid rgba(74, 222, 128, 0.3)',
              fontSize: '0.82rem',
            }}
          >
            <span style={{ color: '#4ade80', fontWeight: 600 }}>● Agent 状态: ACTIVE</span>
            <span style={{ color: '#94a3b8' }}>延迟: 1.2ms</span>
          </div>
        </div>

        {/* 卡片 4 (宽格 7/12)：端到端可观测性 */}
        {/* Card 4: End-to-end Observability */}
        <div className="stx-interactive-card" style={{ gridColumn: 'span 7' }}>
          <div className="stx-card-accent-bar" />
          <div style={{ color: 'var(--ifm-color-primary)', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '8px' }}>
            Observability
          </div>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '8px' }}>
            实时作业吞吐与指标大屏
          </h3>
          <p style={{ color: 'var(--ifm-color-emphasis-600)', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '1.25rem' }}>
            开箱即用集成 Prometheus 与 Grafana。同步作业每秒处理记录数（TPS）、延迟抖动、内存水位全景透视。
          </p>

          <div
            style={{
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-end',
              height: '54px',
              padding: '6px 12px',
              backgroundColor: 'rgba(142, 202, 214, 0.05)',
              borderRadius: '6px',
              border: '1px solid var(--stx-card-border)',
            }}
          >
            <div style={{ height: '35%', width: '14%', backgroundColor: '#38bdf8', borderRadius: '3px' }} />
            <div style={{ height: '55%', width: '14%', backgroundColor: '#38bdf8', borderRadius: '3px' }} />
            <div style={{ height: '85%', width: '14%', backgroundColor: '#8ecad6', borderRadius: '3px', boxShadow: '0 0 8px var(--stx-glow)' }} />
            <div style={{ height: '70%', width: '14%', backgroundColor: '#38bdf8', borderRadius: '3px' }} />
            <div style={{ height: '95%', width: '14%', backgroundColor: '#8ecad6', borderRadius: '3px', boxShadow: '0 0 8px var(--stx-glow)' }} />
            <div style={{ height: '60%', width: '14%', backgroundColor: '#38bdf8', borderRadius: '3px' }} />
            <div style={{ height: '80%', width: '14%', backgroundColor: '#38bdf8', borderRadius: '3px' }} />
            <span style={{ fontSize: '0.74rem', color: 'var(--ifm-color-primary)', fontWeight: 600, marginLeft: 'auto' }}>
              Live TPS: 142.8k/s
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
