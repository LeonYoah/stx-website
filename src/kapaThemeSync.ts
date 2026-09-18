/**
 * Keep Kapa modal logo on the square bird mark (avoid wide lockup crop artifacts).
 * 保持 Kapa 弹窗 logo 为方形青鸾图形标（避免宽锁章裁切残影）。
 */

const MARK = 'https://leonyoah.github.io/stx-website/img/stx-mark.png';
const LOGO_SIZE = '22px';

function applyKapaModalLogo(): void {
  document.querySelectorAll('img').forEach((img) => {
    const src = img.getAttribute('src') || '';
    if (src.includes('stx-logo') || src.includes('stx-mark')) {
      if (src.includes('stx-logo') && img.src !== MARK) {
        img.src = MARK;
      }
      img.style.height = LOGO_SIZE;
      img.style.width = 'auto';
      img.style.maxHeight = LOGO_SIZE;
      img.style.maxWidth = LOGO_SIZE;
      img.style.objectFit = 'contain';
      img.style.display = 'block';
    }
  });
}

function startObserver(): void {
  applyKapaModalLogo();
  const observer = new MutationObserver(() => {
    applyKapaModalLogo();
  });
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme', 'class'],
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startObserver);
  } else {
    startObserver();
  }
}

export function onRouteDidUpdate(): void {
  applyKapaModalLogo();
}
