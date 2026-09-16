import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import {HeroSection} from '../components/home/HeroSection';
import {AgentChatDemo} from '../components/home/AgentChatDemo';
import {TopologySection} from '../components/home/TopologySection';
import {ProductShowcase} from '../components/home/ProductShowcase';
import {NewsTicker} from '../components/home/NewsTicker';
import {useHomeLocale} from '../components/home/useHomeLocale';

/**
 * STX 文档站点官方首页入口（当前聚焦精细化设计上半页）
 * STX documentation site official homepage main entry (currently focused on upper half)
 */
export default function Home(): React.JSX.Element {
  const {siteConfig} = useDocusaurusContext();
  const locale = useHomeLocale();
  const meta =
    locale === 'en'
      ? {
          title: `${siteConfig.title} - All-in-one Apache SeaTunnel ops`,
          description:
            'Make SeaTunnel ops clearly visible. All-in-one ops and job management for Apache SeaTunnel, with a native AI Agent entry (CLI + Skill).',
        }
      : {
          title: `${siteConfig.title} - Apache SeaTunnel 一站式运维平台`,
          description:
            '让 SeaTunnel 运维清晰可见。面向 Apache SeaTunnel 的一站式运维与任务管理；并原生提供 AI Agent 智能运维入口（CLI + Skill）。',
        };

  return (
    <Layout title={meta.title} description={meta.description}>
      {/* 品牌首屏 → Agent → 拓扑 → 产品展示 → 公告 */}
      {/* Brand → Agent → topology → product showcase → ticker */}
      <HeroSection />
      <AgentChatDemo />
      <TopologySection />
      <ProductShowcase />
      <NewsTicker />
    </Layout>
  );
}
