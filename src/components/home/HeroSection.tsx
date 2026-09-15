import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { HeroBrandPanel } from './HeroBrandPanel';
import { AgentChatDemo } from './AgentChatDemo';

gsap.registerPlugin(useGSAP);

/**
 * 左文案能力，右嵌 Agent 对话工作台，无边框融页。
 * brand copy left, embedded agent workspace right.
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

      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
      tl.from('.stx-stage-copy', {
        x: -18,
        duration: 0.55,
        clearProps: 'transform',
      }).from(
        '.stx-stage-viz',
        {
          y: 22,
          duration: 0.6,
          clearProps: 'transform',
        },
        '-=0.35',
      );
    },
    { scope: containerRef },
  );

  return (
    <header ref={containerRef} className="stx-hero">
      <div className="stx-hero-glow" aria-hidden="true" />
      <div className="stx-hero-grid-fade" aria-hidden="true" />

      <div ref={stageRef} className="stx-stage stx-stage--mimo">
        <div className="stx-stage-copy">
          <HeroBrandPanel />
        </div>
        <div className="stx-stage-viz stx-stage-viz--demo">
          <AgentChatDemo embedded />
        </div>
      </div>
    </header>
  );
}
