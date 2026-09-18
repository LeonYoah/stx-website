/**
 * Unset Mantine fixed width on Kapa modal logo (crops bird crest).
 * 去掉 Kapa 弹窗 logo 的 Mantine 固定 width（会裁切青鸾顶部）。
 */

function fixKapaModalLogoWidth(): void {
  if (typeof document === 'undefined') {
    return;
  }

  const id = 'st-kapa-logo-fix';
  if (!document.getElementById(id)) {
    const style = document.createElement('style');
    style.id = id;
    style.textContent = `
      img[src*="stx-mark"] {
        width: auto !important;
        max-width: none !important;
        height: 1.375rem !important;
        object-fit: contain !important;
      }
    `;
    document.head.appendChild(style);
  }

  document.querySelectorAll('img[src*="stx-mark"]').forEach((img) => {
    const el = img as HTMLImageElement;
    el.style.removeProperty('width');
    el.style.setProperty('width', 'auto', 'important');
  });
}

if (typeof window !== 'undefined') {
  const start = () => {
    fixKapaModalLogoWidth();
    new MutationObserver(() => fixKapaModalLogoWidth()).observe(document.body, {
      childList: true,
      subtree: true,
    });
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
}

export function onRouteDidUpdate(): void {
  fixKapaModalLogoWidth();
}
