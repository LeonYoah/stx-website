/**
 * Sync Kapa Ask AI logos with Docusaurus color mode at runtime.
 * 运行时将 Kapa Ask AI logo 与 Docusaurus 浅深色模式同步。
 *
 * Kapa does not reliably honor image *-dark data attributes, so we swap <img> src
 * when `data-theme` on <html> changes.
 * Kapa 对图片类 *-dark 属性支持不可靠，因此在 data-theme 变化时主动替换 <img> src。
 */

const LIGHT_LOGO =
  'https://leonyoah.github.io/stx-website/img/stx-logo.png';
const DARK_LOGO =
  'https://leonyoah.github.io/stx-website/img/stx-logo-dark.png';
const MARK = 'https://leonyoah.github.io/stx-website/img/stx-mark.png';

function isDarkMode(): boolean {
  return document.documentElement.getAttribute('data-theme') === 'dark';
}

function applyKapaThemeLogos(): void {
  const modalLogo = isDarkMode() ? DARK_LOGO : LIGHT_LOGO;

  document.querySelectorAll('img').forEach((img) => {
    const src = img.getAttribute('src') || '';
    if (src.includes('stx-mark')) {
      if (img.src !== MARK) {
        img.src = MARK;
      }
      return;
    }
    if (src.includes('stx-logo') && img.src !== modalLogo) {
      img.src = modalLogo;
    }
  });
}

function startThemeObserver(): void {
  applyKapaThemeLogos();
  const observer = new MutationObserver(() => {
    applyKapaThemeLogos();
  });
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme', 'class'],
  });
}

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startThemeObserver);
  } else {
    startThemeObserver();
  }
}

export function onRouteDidUpdate(): void {
  applyKapaThemeLogos();
}
