/**
 * STX Ask AI: hide Kapa default launcher, mount console-aligned FAB,
 * and unset Mantine logo width that crops the bird crest.
 * STX Ask AI：隐藏 Kapa 默认球，挂载与控制台对齐的悬浮按钮，并去掉裁切鸟冠的 Mantine width。
 */

const FAB_ID = 'stx-ask-ai-fab';
const STYLE_ID = 'st-kapa-ask-ai-styles';
const MARK_SRC = '/img/stx-mark.png';

function isZh(): boolean {
  const lang = document.documentElement.lang || '';
  return lang.toLowerCase().startsWith('zh');
}

function openAskAi(): void {
  const kapa = (window as Window & {Kapa?: any}).Kapa;
  if (!kapa) {
    return;
  }
  if (typeof kapa.open === 'function') {
    kapa.open();
    return;
  }
  if (typeof kapa === 'function') {
    kapa('open');
  }
}

/**
 * Inject FAB + logo-width fix styles (aligned with console Ask AI chip).
 * 注入与控制台 Ask AI 芯片对齐的悬浮按钮样式，并修复 logo width。
 */
function ensureStyles(): void {
  if (document.getElementById(STYLE_ID)) {
    return;
  }
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    /* Hide any leftover Kapa launcher if script attr is ignored */
    /* 若脚本属性未生效，再藏一层 Kapa 默认悬浮球 */
    .mantine-Button-root[aria-label*="Ask AI"],
    button[class*="kapa"],
    #kapa-widget-container > button {
      display: none !important;
    }

    img[src*="stx-mark"] {
      width: auto !important;
      max-width: none !important;
      height: 1.375rem !important;
      object-fit: contain !important;
    }

    #${FAB_ID} {
      position: fixed;
      z-index: 240;
      right: 1.25rem;
      bottom: max(1.5rem, env(safe-area-inset-bottom));
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.625rem 0.75rem;
      border-radius: 1rem;
      border: 1px solid color-mix(in srgb, var(--ifm-color-emphasis-300) 70%, transparent);
      background: color-mix(in srgb, var(--ifm-background-surface-color) 88%, transparent);
      color: var(--ifm-font-color-base);
      box-shadow: 0 10px 28px rgba(0, 0, 0, 0.18);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      cursor: pointer;
      font: 500 0.75rem/1.2 var(--ifm-font-family-base);
      letter-spacing: 0.02em;
      transition: background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, transform 0.15s ease;
    }

    #${FAB_ID}:hover {
      background: color-mix(in srgb, var(--ifm-hover-overlay) 100%, var(--ifm-background-surface-color));
      border-color: var(--ifm-color-emphasis-400);
      box-shadow: 0 14px 32px rgba(0, 0, 0, 0.22);
    }

    #${FAB_ID}:active {
      transform: scale(0.98);
    }

    #${FAB_ID}:disabled {
      opacity: 0.6;
      cursor: default;
    }

    #${FAB_ID} .stx-ask-ai-fab__icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 1.75rem;
      height: 1.75rem;
      border-radius: 0.5rem;
      background: color-mix(in srgb, var(--ifm-color-emphasis-200) 55%, transparent);
      box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--ifm-color-emphasis-300) 55%, transparent);
      overflow: hidden;
    }

    #${FAB_ID} .stx-ask-ai-fab__icon img {
      width: 1.5rem !important;
      height: 1.5rem !important;
      max-width: 1.5rem !important;
      object-fit: contain;
      display: block;
    }

    #${FAB_ID} .stx-ask-ai-fab__label {
      padding-right: 0.125rem;
      white-space: nowrap;
    }

    [data-theme='dark'] #${FAB_ID} {
      border-color: color-mix(in srgb, var(--ifm-color-emphasis-300) 50%, transparent);
      background: color-mix(in srgb, var(--ifm-background-surface-color) 92%, transparent);
      box-shadow: 0 10px 28px rgba(0, 0, 0, 0.45);
    }

    [data-theme='dark'] #${FAB_ID}:hover {
      background: color-mix(in srgb, var(--ifm-color-emphasis-200) 18%, var(--ifm-background-surface-color));
    }
  `;
  document.head.appendChild(style);
}

function ensureFab(): void {
  if (document.getElementById(FAB_ID)) {
    return;
  }

  const btn = document.createElement('button');
  btn.id = FAB_ID;
  btn.type = 'button';
  btn.setAttribute('aria-label', 'Ask AI');
  btn.title = isZh()
    ? '基于 STX 与 SeaTunnel 源码/文档知识库的 AI 问答助手'
    : 'AI assistant trained on STX and SeaTunnel source/docs';

  const icon = document.createElement('span');
  icon.className = 'stx-ask-ai-fab__icon';
  const img = document.createElement('img');
  img.src = MARK_SRC;
  img.alt = '';
  img.width = 24;
  img.height = 24;
  img.draggable = false;
  icon.appendChild(img);

  const label = document.createElement('span');
  label.className = 'stx-ask-ai-fab__label';
  label.textContent = isZh() ? 'Ask AI 问答' : 'Ask AI';

  btn.appendChild(icon);
  btn.appendChild(label);
  btn.addEventListener('click', () => {
    openAskAi();
  });
  document.body.appendChild(btn);
}

function fixKapaModalLogoWidth(): void {
  if (typeof document === 'undefined') {
    return;
  }
  document.querySelectorAll('img[src*="stx-mark"]').forEach((img) => {
    if (img.closest(`#${FAB_ID}`)) {
      return;
    }
    const el = img as HTMLImageElement;
    el.style.removeProperty('width');
    el.style.setProperty('width', 'auto', 'important');
  });
}

function boot(): void {
  if (typeof document === 'undefined') {
    return;
  }
  ensureStyles();
  ensureFab();
  fixKapaModalLogoWidth();
  new MutationObserver(() => {
    ensureFab();
    fixKapaModalLogoWidth();
  }).observe(document.body, {childList: true, subtree: true});
}

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
}

export function onRouteDidUpdate(): void {
  ensureStyles();
  ensureFab();
  fixKapaModalLogoWidth();
}
