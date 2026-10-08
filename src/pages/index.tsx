import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import {HeroSection} from '../components/home/HeroSection';
import {PromoVideoSection} from '../components/home/PromoVideoSection';
import {AgentChatDemo} from '../components/home/AgentChatDemo';
import {TopologySection} from '../components/home/TopologySection';
import {ProductShowcase} from '../components/home/ProductShowcase';
import {NewsTicker} from '../components/home/NewsTicker';
import {useHomeLocale} from '../components/home/useHomeLocale';
import {PROMO_VIDEO, usePromoVideoUrls} from '../components/home/promoVideo';

/**
 * STX 文档站点官方首页入口（当前聚焦精细化设计上半页）
 * STX documentation site official homepage main entry (currently focused on upper half)
 */
export default function Home(): React.JSX.Element {
  const {siteConfig} = useDocusaurusContext();
  const locale = useHomeLocale();
  const video = usePromoVideoUrls({absolute: true});
  const meta =
    locale === 'en'
      ? {
          title: `${siteConfig.title} - All-in-one Apache SeaTunnel ops`,
          description:
            'Make SeaTunnel ops clearly visible. All-in-one ops and job management for Apache SeaTunnel, with native AI Agent (CLI + Skill).',
          videoName: 'STX in 45 seconds',
        }
      : {
          title: `${siteConfig.title} - Apache SeaTunnel 一站式运维平台`,
          description:
            '让 SeaTunnel 运维清晰可见。Apache SeaTunnel 一站式运维与任务管理，原生 AI Agent 入口（CLI + Skill）。',
          videoName: '45 秒看懂 STX',
        };

  // 视频结构化数据，便于搜索引擎在结果中展示视频卡片。/ Video structured data so search engines can show a video card.
  const videoJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: meta.videoName,
    description: meta.description,
    thumbnailUrl: [video.poster],
    uploadDate: PROMO_VIDEO.uploadDate,
    duration: `PT${PROMO_VIDEO.duration}S`,
    contentUrl: video.mp4,
    inLanguage: 'zh-CN',
  };

  return (
    <Layout title={meta.title} description={meta.description}>
      {/* JSON-LD 放在正文里同样有效；转义 < 防止内容提前闭合 script。/ JSON-LD in the body is equally valid; escape < so content cannot close the script early. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(videoJsonLd).replace(/</g, '\\u003c')}}
      />
      {/* 品牌首屏 → 产品视频 → Agent → 拓扑 → 产品展示 → 公告 */}
      {/* Brand → product video → Agent → topology → product showcase → ticker */}
      <HeroSection />
      <PromoVideoSection />
      <AgentChatDemo />
      <TopologySection />
      <ProductShowcase />
      <NewsTicker />
    </Layout>
  );
}
