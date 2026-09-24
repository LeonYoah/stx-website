import React, {useRef, useState} from 'react';
import clsx from 'clsx';
import gsap from 'gsap';
import {useGSAP} from '@gsap/react';
import {ThemeClassNames} from '@docusaurus/theme-common';
import {useDoc} from '@docusaurus/plugin-content-docs/client';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Heading from '@theme/Heading';
import MDXContent from '@theme/MDXContent';

const RenderMDX = MDXContent as React.ComponentType<React.PropsWithChildren>;

gsap.registerPlugin(useGSAP);

const sections: Record<string, [string, string]> = {
  index: ['文档中心', 'DOCUMENTATION'],
  'get-started': ['快速入门', 'GET STARTED'],
  architecture: ['架构与设计', 'ARCHITECTURE'],
  'host-cluster': ['主机与集群管理', 'HOSTS & CLUSTERS'],
  workbench: ['调试工作台', 'WORKBENCH'],
  'alerts-diagnostics': ['告警与诊断', 'ALERTS & DIAGNOSTICS'],
};

export default function DocItemContent({children}: {children: React.ReactNode}): React.JSX.Element {
  const {metadata, frontMatter, contentTitle} = useDoc();
  const {i18n} = useDocusaurusContext();
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const root = useRef<HTMLDivElement>(null);
  const isEnglish = i18n.currentLocale === 'en';
  const section = sections[metadata.id.split('/')[0]] || sections.index;
  const syntheticTitle = !frontMatter.hide_title && typeof contentTitle === 'undefined'
    ? metadata.title
    : null;

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from('.stx-doc-heading > *', {
        y: 12,
        autoAlpha: 0,
        duration: 0.52,
        stagger: 0.065,
        ease: 'power2.out',
        clearProps: 'all',
      });
    });
    return () => {
      mm.revert();
      if (timer.current) clearTimeout(timer.current);
    };
  }, {scope: root});

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div ref={root} className={clsx(ThemeClassNames.docs.docMarkdown, 'markdown', 'stx-doc-content')}>
      {syntheticTitle && (
        <header className="stx-doc-heading">
          <div className="stx-doc-eyebrow">{isEnglish ? section[1] : section[0]}</div>
          <div className="stx-doc-title-row">
            <Heading as="h1">{syntheticTitle}</Heading>
            <button type="button" className="stx-doc-copy" onClick={copyLink} aria-live="polite">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
                  <rect x="8" y="8" width="12" height="12" rx="2"/>
                  <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>
                </svg>
                {copied ? (isEnglish ? 'Copied' : '已复制') : (isEnglish ? 'Copy link' : '复制链接')}
            </button>
          </div>
          {metadata.description && <p className="stx-doc-description">{metadata.description}</p>}
        </header>
      )}
      <RenderMDX>{children}</RenderMDX>
    </div>
  );
}
