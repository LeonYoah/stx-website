import path from 'path';
import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

/**
 * STX 文档站点核心配置文件 (Docusaurus v3)
 * STX documentation site core configuration file (Docusaurus v3)
 */
const config: Config = {
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
  tagline: 'Apache SeaTunnel 可视化集群与运维管控平台',
  favicon: 'img/stx-favicon.ico',

  // 生产域名与基础路径配置（GitHub Pages 项目站）
  // Production URL and base route (GitHub Pages project site)
  url: 'https://leonyoah.github.io',
  baseUrl: '/stx-website/',

  // GitHub 组织与仓库元信息
  // GitHub organization and repository metadata
  organizationName: 'LeonYoah',
  projectName: 'stx-website',

  // 避免死链阻止构建（设置容错警告）
  // Avoid broken links breaking the build (set to warn)
  onBrokenLinks: 'warn',

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
    // 社交分享卡片封面图
    // Social card image for OpenGraph / Twitter previews
    image: 'img/stx-logo.png',
    navbar: {
      title: '',
      logo: {
        alt: 'STX Logo',
        src: 'img/stx-logo.png',
        srcDark: 'img/stx-logo-dark.png',
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
          to: '/docs/get-started/quick-start',
          label: '快速部署',
          position: 'left',
        },
        {
          to: '/docs/architecture/overview',
          label: '架构设计',
          position: 'left',
        },
        {
          to: '/docs/features/cluster-management',
          label: '集群管理',
          position: 'left',
        },
        {
          type: 'localeDropdown',
          position: 'right',
        },
        {
          href: 'https://github.com/LeonYoah/SeaTunnelX',
          position: 'right',
          className: 'header-github-link',
          'aria-label': 'GitHub 仓库 / GitHub repository',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: '文档与指引 / Docs',
          items: [
            {
              label: '快速开始',
              to: '/docs/get-started/quick-start',
            },
            {
              label: '系统架构',
              to: '/docs/architecture/overview',
            },
            {
              label: '集群纳管',
              to: '/docs/features/cluster-management',
            },
          ],
        },
        {
          title: '生态与社区 / Community',
          items: [
            {
              label: 'Apache SeaTunnel 官网',
              href: 'https://seatunnel.apache.org',
            },
            {
              label: 'GitHub 讨论区',
              href: 'https://github.com/LeonYoah/SeaTunnelX/discussions',
            },
          ],
        },
        {
          title: '代码仓库 / Repository',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/LeonYoah/SeaTunnelX',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} STX Project. Built with Docusaurus.`,
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
