import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { HeroBrandPanel } from './HeroBrandPanel';

gsap.registerPlugin(useGSAP);

/**
 * 首屏仅品牌文案，Agent 对话下移为独立窗口，避免双栏拥挤。
 * Brand-only hero; agent chat lives in its own section below.
 * Demo 入口放在品牌 CTA 组内（对齐 Databricks「Try」位），不另起底栏条。
 */
export function HeroSection(): React.JSX.Element {
  const containerRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    let raf = 0;
    const current = { x: 50, y: 50 };
    const target = { x: 50, y: 50 };

    const render = () => {
      current.x += (target.x - current.x) * 0.08;
      current.y += (target.y - current.y) * 0.08;
      stage.style.setProperty('--mouse-x', `${current.x}%`);
      stage.style.setProperty('--mouse-y', `${current.y}%`);
      raf = window.requestAnimationFrame(render);
    };

    const onMove = (event: PointerEvent) => {
      const rect = stage.getBoundingClientRect();
      target.x = ((event.clientX - rect.left) / rect.width) * 100;
      target.y = ((event.clientY - rect.top) / rect.height) * 100;
    };

    const onLeave = () => {
      target.x = 50;
      target.y = 50;
    };

    raf = window.requestAnimationFrame(render);
    stage.addEventListener('pointermove', onMove, { passive: true });
    stage.addEventListener('pointerleave', onLeave, { passive: true });

    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      stage.removeEventListener('pointermove', onMove);
      stage.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  useGSAP(
    () => {
      if (
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ) {
        return;
      }

      gsap.from('.stx-stage-copy', {
        x: -18,
        duration: 0.55,
        ease: 'power2.out',
        clearProps: 'transform',
      });
    },
    { scope: containerRef },
  );

  return (
    <header ref={containerRef} className="stx-hero">
      <div className="stx-hero-glow" aria-hidden="true" />
      <div className="stx-hero-grid-fade" aria-hidden="true" />

      <div ref={stageRef} className="stx-stage stx-stage--brand">
        <div className="stx-stage-copy">
          <HeroBrandPanel />
        </div>
      </div>
    </header>
  );
}
