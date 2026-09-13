/** @type {import('tailwindcss').Config} */
module.exports = {
  // 适配 Docusaurus 暗黑模式类名机制
  // Compatible with Docusaurus dark mode selector
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./src/**/*.{js,jsx,ts,tsx,md,mdx}'],
  corePlugins: {
    // 禁用预检样式重置，防止破坏 Docusaurus 原生排版
    // Disable preflight reset to prevent breaking Docusaurus native typography
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        border: 'var(--stx-card-border)',
        input: 'var(--stx-card-border)',
        ring: 'var(--stx-glacier-300)',
        background: 'var(--ifm-background-color)',
        foreground: 'var(--ifm-color-emphasis-900)',
        primary: {
          DEFAULT: 'var(--ifm-color-primary)',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: 'var(--stx-sidebar-active-bg)',
          foreground: 'var(--ifm-color-primary)',
        },
        muted: {
          DEFAULT: 'rgba(142, 202, 214, 0.08)',
          foreground: 'var(--ifm-color-emphasis-600)',
        },
        card: {
          DEFAULT: 'var(--ifm-background-surface-color)',
          foreground: 'var(--ifm-color-emphasis-900)',
        },
      },
      borderRadius: {
        lg: 'var(--ifm-global-radius)',
        md: 'calc(var(--ifm-global-radius) - 2px)',
        sm: 'calc(var(--ifm-global-radius) - 4px)',
      },
    },
  },
  plugins: [],
};
