import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import { HeroSection } from '../components/home/HeroSection';
import { TopologySection } from '../components/home/TopologySection';
import { NewsTicker } from '../components/home/NewsTicker';
import { StatsBanner } from '../components/home/StatsBanner';
import { BentoFeatures } from '../components/home/BentoFeatures';

/**
 * 首页底部行动号召区域组件
 * Homepage bottom Call-To-Action section component
 */
function CallToAction(): React.JSX.Element {
  return (
    <section
      style={{
        position: 'relative',
        overflow: 'hidden',
        padding: '5rem 1.5rem',
        textAlign: 'center',
        background: 'linear-gradient(180deg, transparent 0%, rgba(142, 202, 214, 0.08) 100%)',
      }}
    >
      <div style={{ maxWidth: '680px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '1rem' }}>
          准备好体验全新的 SeaTunnel 运维方式了吗？
        </h2>
        <p style={{ fontSize: '1.05rem', color: 'var(--ifm-color-emphasis-700)', lineHeight: '1.6', marginBottom: '2rem' }}>
          无需繁琐的前置依赖，无论是测试环境单机验证还是生产多节点 Zeta 集群，STX 均可在数分钟内快速就绪。
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link className="button--glacier" to="/docs/get-started/quick-start">
            🚀 立即开始部署
          </Link>
          <Link className="button--outline-glacier" to="/docs/architecture/overview">
            📘 查阅架构与技术实现
          </Link>
        </div>
      </div>
    </section>
  );
}

/**
 * STX 文档站点官方首页入口（当前聚焦精细化设计上半页）
 * STX documentation site official homepage main entry (currently focused on upper half)
 */
export default function Home(): React.JSX.Element {
  const { siteConfig } = useDocusaurusContext();

  return (
    <Layout
      title={`${siteConfig.title} - Apache SeaTunnel 可视化集群与运维管理平台`}
      description="让 SeaTunnel 运维不再黑箱。把配置、升级、诊断、恢复、调试放到一个统一入口，面向 Apache SeaTunnel 的一站式运维与任务管理；并原生提供 AI Agent 智能运维入口（CLI + Skill）。">
      {/* 首页上半页：Hero 主视觉区与公告跑马灯 */}
      {/* Homepage Upper Half: Hero main visual showcase and announcement ticker */}
      <HeroSection />
      <TopologySection />
      <NewsTicker />

      {/* 首页下半页暂行搁置 */}
      {/* Lower half sections put on hold temporarily */}
      {/* <StatsBanner /> */}
      {/* <BentoFeatures /> */}
      {/* <CallToAction /> */}
    </Layout>
  );
}
