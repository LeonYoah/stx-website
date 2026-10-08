import {useBaseUrlUtils} from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import gsap from 'gsap';
import {ScrollToPlugin} from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollToPlugin);

/**
 * 首页 45 秒产品视频的文件与章节信息，视频文件放在 static/video/。
 * Files and chapters of the 45s homepage product video; the video files live in static/video/.
 */
export const PROMO_VIDEO_SECTION_ID = 'stx-promo-video';

export const PROMO_VIDEO = {
  name: 'stx-promo-45s',
  duration: 45,
  width: 1920,
  height: 1080,
  // 重新渲染并替换视频时同步修改，供搜索引擎的视频结构化数据使用。
  // Update when the video is re-rendered and replaced; used by the search-engine video structured data.
  uploadDate: '2026-10-08',
  // 各章节在视频里的起点（秒），换视频后要按新片重新核对。/ Where each chapter starts in the video (seconds); re-check against the new cut when the video changes.
  chapters: [
    {start: 6.8, zh: '主机与集群', en: 'Hosts & clusters'},
    {start: 11.6, zh: '安装包与插件', en: 'Packages & plugins'},
    {start: 16.4, zh: '作业工作台', en: 'Job workbench'},
    {start: 21.2, zh: 'Checkpoint 可视化', en: 'Checkpoint'},
    {start: 26.0, zh: '告警与诊断', en: 'Alerts & diagnostics'},
    {start: 30.8, zh: '版本升级', en: 'Upgrades'},
    {start: 35.6, zh: 'AI Agent', en: 'AI Agent'},
  ],
} as const;

export type PromoVideoUrls = {
  webm: string;
  mp4: string;
  poster: string;
  subtitlesEn: string;
};

/**
 * 视频地址：默认随站点发布在 /video/（英文页为 /en/video/，与站内图片一致）；
 * 构建时设置 PROMO_VIDEO_BASE_URL 可改从 CDN 加载视频文件，海报与字幕仍随站点。
 * Video URLs: shipped with the site under /video/ (/en/video/ on English pages, like the site's images);
 * set PROMO_VIDEO_BASE_URL at build time to load the video files from a CDN, while poster and subtitles stay with the site.
 */
export function usePromoVideoUrls(options: {absolute?: boolean} = {}): PromoVideoUrls {
  const {siteConfig} = useDocusaurusContext();
  const {withBaseUrl} = useBaseUrlUtils();
  const cdnBase = String(siteConfig.customFields?.promoVideoBaseUrl ?? '').replace(/\/+$/, '');
  const local = (file: string) => withBaseUrl(`/video/${file}`, {absolute: options.absolute});
  const video = (ext: string) =>
    cdnBase ? `${cdnBase}/${PROMO_VIDEO.name}${ext}` : local(`${PROMO_VIDEO.name}${ext}`);
  return {
    webm: video('.webm'),
    mp4: video('.mp4'),
    poster: local(`${PROMO_VIDEO.name}-poster.webp`),
    subtitlesEn: local(`${PROMO_VIDEO.name}.en.vtt`),
  };
}

/** 秒数格式化为 m:ss。/ Format seconds as m:ss. */
export function formatClock(seconds: number): string {
  const s = Math.floor(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/**
 * 滚动到视频并开始播放。必须在点击事件里同步调用：浏览器只允许用户手势内带声音播放。
 * Scroll to the video and start playback. Must be called synchronously inside a click handler: browsers only allow audible playback within a user gesture.
 */
export function scrollToPromoVideoAndPlay(): void {
  const section = document.getElementById(PROMO_VIDEO_SECTION_ID);
  const player = section?.querySelector<HTMLElement>('[data-promo-player]');
  if (!section || !player) return;
  void player.querySelector('video')?.play().catch(() => undefined);

  // 播放器在视口内垂直居中，矮屏时贴住顶栏下沿。/ Center the player vertically; on short screens pin it below the navbar.
  const navbar = document.querySelector('.navbar')?.getBoundingClientRect().height ?? 60;
  const room = window.innerHeight - navbar;
  const offsetY = navbar + Math.max(12, (room - player.getBoundingClientRect().height) / 2);

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.scrollTo({top: player.getBoundingClientRect().top + window.scrollY - offsetY});
    return;
  }
  gsap.to(window, {
    duration: 0.9,
    ease: 'power3.inOut',
    scrollTo: {y: player, offsetY, autoKill: true},
  });
}
