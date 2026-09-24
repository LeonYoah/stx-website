import React, {useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import OriginalImg from '@theme-original/MDXComponents/Img';

type Point = {x: number; y: number};
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.5;

export default function MDXImg(props: React.ComponentProps<'img'>): React.JSX.Element {
  const {i18n} = useDocusaurusContext();
  const isEnglish = i18n.currentLocale === 'en';
  const fallbackAlt = isEnglish ? 'Documentation screenshot' : '文档截图';
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<Point>({x: 0, y: 0});
  const drag = useRef<{pointerX: number; pointerY: number; panX: number; panY: number} | null>(null);
  const didDrag = useRef(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const viewer = useRef<HTMLDivElement>(null);
  const isScreenshot = typeof props.src === 'string' && (props.src.includes('/img/screenshots/') || props.src.includes('/assets/images/'));

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButton.current?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') close();
      if (event.key === 'Tab') {
        const focusable = viewer.current?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href]');
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {event.preventDefault(); last.focus();}
        else if (!event.shiftKey && document.activeElement === last) {event.preventDefault(); first.focus();}
      }
      if (event.key === '+' || event.key === '=') setZoom(value => Math.min(MAX_ZOOM, value + ZOOM_STEP));
      if (event.key === '-') setZoom(value => Math.max(MIN_ZOOM, value - ZOOM_STEP));
      if (event.key === '0') {setZoom(1); setPan({x: 0, y: 0});}
    }
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (zoom === 1) setPan({x: 0, y: 0});
  }, [zoom]);

  function close() {
    setOpen(false);
    setZoom(1);
    setPan({x: 0, y: 0});
    trigger.current?.focus();
  }

  if (!isScreenshot) return <OriginalImg {...props} />;

  return <>
    <button ref={trigger} type="button" className="stx-doc-image-trigger" onClick={() => setOpen(true)} aria-label={`${isEnglish ? 'Enlarge image' : '放大图片'}：${props.alt || fallbackAlt}`}>
      <OriginalImg {...props} />
      <span className="stx-doc-image-hint" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M10.5 7.5v6m-3-3h6m2 5 5 5"/></svg>
        {isEnglish ? 'Click to enlarge' : '点击放大'}
      </span>
    </button>
    {open && createPortal(
      <div ref={viewer} className="stx-image-viewer" role="dialog" aria-modal="true" aria-label={props.alt || fallbackAlt}>
        <div className="stx-image-viewer-bar">
          <span className="stx-image-viewer-title">{props.alt || fallbackAlt}</span>
          <div className="stx-image-viewer-actions">
            <button type="button" onClick={() => setZoom(value => Math.max(MIN_ZOOM, value - ZOOM_STEP))} disabled={zoom === MIN_ZOOM} aria-label={isEnglish ? 'Zoom out' : '缩小图片'}>−</button>
            <button type="button" onClick={() => {setZoom(1); setPan({x: 0, y: 0});}} aria-label={isEnglish ? 'Fit to window' : '恢复适合窗口的大小'}>{Math.round(zoom * 100)}%</button>
            <button type="button" onClick={() => setZoom(value => Math.min(MAX_ZOOM, value + ZOOM_STEP))} disabled={zoom === MAX_ZOOM} aria-label={isEnglish ? 'Zoom in' : '放大图片'}>＋</button>
            <a href={props.src} target="_blank" rel="noopener noreferrer">{isEnglish ? 'View original' : '查看原图'}</a>
            <button ref={closeButton} type="button" className="stx-image-viewer-close" onClick={close} aria-label={isEnglish ? 'Close image' : '关闭图片'}>×</button>
          </div>
        </div>
        <div className="stx-image-viewer-stage" onClick={event => {
          if (event.target === event.currentTarget && !didDrag.current) close();
          didDrag.current = false;
        }}
          onWheel={event => {
            if (event.ctrlKey || event.metaKey) return;
            event.preventDefault();
            setZoom(value => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value + (event.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP))));
          }}
          onPointerDown={event => {
            if (zoom === 1) return;
            didDrag.current = false;
            drag.current = {pointerX: event.clientX, pointerY: event.clientY, panX: pan.x, panY: pan.y};
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerMove={event => {
            if (!drag.current) return;
            if (Math.abs(event.clientX - drag.current.pointerX) + Math.abs(event.clientY - drag.current.pointerY) > 3) didDrag.current = true;
            setPan({x: drag.current.panX + event.clientX - drag.current.pointerX, y: drag.current.panY + event.clientY - drag.current.pointerY});
          }}
          onPointerUp={() => {drag.current = null;}}
          onPointerCancel={() => {drag.current = null;}}
          onDoubleClick={() => setZoom(value => value === 1 ? 2 : 1)}>
          <img src={props.src} alt={props.alt || fallbackAlt} draggable={false} style={{transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`}} />
        </div>
        <p className="stx-image-viewer-help">{isEnglish ? 'Scroll to zoom · Drag to pan · Double-click to toggle · Esc to close' : '滚轮缩放 · 放大后拖动 · 双击切换大小 · Esc 关闭'}</p>
      </div>, document.body)}
  </>;
}
