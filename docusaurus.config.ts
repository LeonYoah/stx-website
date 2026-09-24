import path from 'path';
import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// 自建服务器从站点根目录提供：首页 /，文档 /docs/。
const SITE_BASE_URL = '/';
const SITE_URL = (process.env.SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');

/**
 * STX 文档站点核心配置文件 (Docusaurus v3)
 * STX documentation site core configuration file (Docusaurus v3)
 */
const config: Config = {
  // 启用 Markdown 中的 Mermaid 图渲染
  // Enable Mermaid diagram rendering in Markdown
  markdown: {
    mermaid: true,
  },
  themes: ['@docusaurus/theme-mermaid'],

  // 注入 Tailwind CSS 与 @ 别名支持插件
  // Inject Tailwind CSS and @ alias support plugin
  plugins: [
    async function tailwindAndAliasPlugin() {
      return {
        name: 'docusaurus-tailwind-and-alias',
        configurePostCss(postcssOptions) {
          postcssOptions.plugins.push(require('tailwindcss'));
          postcssOptions.plugins.push(require('autoprefixer'));
          return postcssOptions;
        },
        configureWebpack() {
          return {
            resolve: {
              alias: {
                '@': path.resolve(__dirname, 'src'),
              },
            },
          };
        },
      };
    },
  ],
  // 站点主标题与简短描述
  // Main title and short tagline of the site
  title: 'STX',
  tagline: 'Apache SeaTunnel 一站式运维平台',
  favicon: 'img/stx-favicon.ico',

  // 发布时设置 SITE_URL=https://你的域名；本地构建使用 localhost。
  url: SITE_URL,
  baseUrl: SITE_BASE_URL,

  // GitHub 组织与仓库元信息
  // GitHub organization and repository metadata
  organizationName: 'LeonYoah',
  projectName: 'stx-website',

  // 发现站内失效链接时中止构建，避免发布后出现 404。
  onBrokenLinks: 'throw',

  // 国际化双语配置（中文为主，英文为辅）
  // Internationalization configuration (Chinese primary, English secondary)
  i18n: {
    defaultLocale: 'zh-CN',
    locales: ['zh-CN', 'en'],
    localeConfigs: {
      'zh-CN': {
        label: '简体中文',
        direction: 'ltr',
        htmlLang: 'zh-CN',
      },
      en: {
        label: 'English',
        direction: 'ltr',
        htmlLang: 'en-US',
      },
    },
  },

  // 字体走国内 npmmirror CDN（fontsource），避免 Google Fonts
  // Fonts via China npmmirror CDN (fontsource), not Google Fonts
  headTags: [
    {
      tagName: 'link',
      attributes: {
        rel: 'preconnect',
        href: 'https://cdn.npmmirror.com',
        crossorigin: 'anonymous',
      },
    },
  ],
  // STX Ask AI — hide Kapa default ball; custom FAB via clientModules (aligned with console)
  // STX Ask AI — 隐藏 Kapa 默认球；由 clientModules 挂载与控制台对齐的自定义 FAB
  clientModules: ['./src/kapaThemeSync.ts'],
  scripts: [
    {
      src: 'https://widget.kapa.ai/kapa-widget.bundle.js',
      'data-website-id': 'd9390efd-fdc5-4449-8aa1-bb2fd5fe13f3',
      'data-project-name': 'STX',
      'data-project-color': '#2563eb',
      'data-project-logo': `${SITE_BASE_URL}img/stx-mark.png`,
      'data-modal-title': 'Ask AI',
      'data-launcher-button-hidden': 'true',
      'data-color-scheme-selector': "[data-theme='dark']",
      async: true,
    },
  ],
  stylesheets: [
    {
      href: 'https://cdn.npmmirror.com/packages/@fontsource-variable/inter/5.3.0/files/wght.css',
      type: 'text/css',
    },
    {
      href: 'https://cdn.npmmirror.com/packages/@fontsource-variable/noto-sans-sc/5.3.0/files/wght.css',
      type: 'text/css',
    },
    {
      href: 'https://cdn.npmmirror.com/packages/@fontsource-variable/jetbrains-mono/5.3.0/files/wght.css',
      type: 'text/css',
    },
  ],

  // 经典主题预设配置（文档、博客、样式）
  // Classic theme preset options (docs, blog, styles)
  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // 指向文档源码仓库编辑地址
          // Points to the docs source repository edit URL
          editUrl: 'https://github.com/LeonYoah/stx-website/tree/main/',
          editLocalizedFiles: true,
          showLastUpdateTime: false,
          showLastUpdateAuthor: false,
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  // 界面外观与交互组件配置
  // Theme UI and interactive component configuration
  themeConfig: {
    mermaid: {
      theme: { light: 'neutral', dark: 'dark' },
    },
    // 社交分享卡片封面图
    // Social card image for OpenGraph / Twitter previews
    image: 'img/stx-logo.png',
    navbar: {
      title: '',
      logo: {
        alt: 'STX Logo',
        src: 'img/stx-logo.png',
        srcDark: 'img/stx-logo-dark.png',
        // 新锁章更方，略增高以保持导航栏可读体量。 / Taller lockup: raise height for navbar legibility.
        height: 32,
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: '文档中心',
        },
        {
          href: 'https://demo.stxcli.com',
          label: '在线体验',
          position: 'right',
          className: 'header-demo-link',
        },
        {
          type: 'localeDropdown',
          position: 'right',
        },
      ],
    },
    // 色彩模式：默认暗色（更具冰川青夜间极客质感），支持用户切换
    // Color mode: dark mode by default for Glacier Cyan aesthetic, supports toggling
    colorMode: {
      defaultMode: 'dark',
      respectPrefersColorScheme: true,
    },
    // 代码高亮主题配置
    // Code syntax highlighting configuration
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'yaml', 'sql', 'go', 'json'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
