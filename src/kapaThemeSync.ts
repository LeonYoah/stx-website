/**
 * Keep Kapa modal logo on the padded square bird mark (crest never clipped).
 * 保持 Kapa 弹窗 logo 为带安全边距的方形青鸾标（鸟冠不被裁切）。
 */

const MARK = 'https://leonyoah.github.io/stx-website/img/stx-mark-kapa.png';
const LOGO_SIZE = '28px';

function applyKapaModalLogo(): void {
  if (!document.getElementById('st-kapa-logo-fix')) {
    const style = document.createElement('style');
    style.id = 'st-kapa-logo-fix';
    style.textContent = `
      img[src*="stx-mark-kapa"] {
        object-fit: contain !important;
        object-position: center !important;
        max-height: ${LOGO_SIZE} !important;
        max-width: ${LOGO_SIZE} !important;
        height: ${LOGO_SIZE} !important;
        width: ${LOGO_SIZE} !important;
      }
    `;
    document.head.appendChild(style);
  }

  document.querySelectorAll('img').forEach((img) => {
    const src = img.getAttribute('src') || '';
    if (src.includes('stx-logo') || src.includes('stx-mark')) {
      if (!src.includes('stx-mark-kapa') && img.src !== MARK) {
        img.src = MARK;
      }
      img.style.height = LOGO_SIZE;
      img.style.width = LOGO_SIZE;
      img.style.maxHeight = LOGO_SIZE;
      img.style.maxWidth = LOGO_SIZE;
      img.style.objectFit = 'contain';
      img.style.objectPosition = 'center';
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
