import React from 'react';
import {useLocation} from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import OriginalNotFoundContent from '@theme-original/NotFound/Content';
import type {Props} from '@theme/NotFound/Content';

function isLocalHost(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1' || host === '[::1]';
}

/**
 * 本地 `docusaurus start` 一次只跑一种语言；切到 /en/* 会 404。
 * 在本地给出可执行的预览方式。
 */
export default function NotFoundContent(props: Props): React.JSX.Element {
  const {pathname} = useLocation();
  const {i18n, siteConfig} = useDocusaurusContext();
  const wantsEnglish = pathname === '/en' || pathname.startsWith('/en/');
  const showEnDevHint =
    isLocalHost() && wantsEnglish && i18n.currentLocale === i18n.defaultLocale;

  if (!showEnDevHint) {
    return <OriginalNotFoundContent {...props} />;
  }

  const port = window.location.port || '3000';
  const enDocs = `http://localhost:${port}/en/docs/`;
  const zhDocs = `http://localhost:${port}/docs/`;

  return (
    <main className="container margin-vert--xl">
      <div className="row">
        <div className="col col--8 col--offset-2">
          <h1 className="hero__title">本地英文需要单独预览</h1>
          <p>
            <code>docusaurus start</code> 一次只启动一种语言。当前跑的是中文，所以{' '}
            <code>/en/…</code> 会显示「找不到页面」。这不是英文文档缺失。
          </p>
          <p>任选一种方式看英文：</p>
          <ol>
            <li>
              <strong>中英文切换（推荐）</strong>
              <pre style={{padding: '0.9rem 1rem', background: 'var(--ifm-pre-background)'}}>
                pnpm preview
              </pre>
              然后打开 <a href={enDocs}>{enDocs}</a>；中文仍是 <a href={zhDocs}>{zhDocs}</a>。
            </li>
            <li>
              <strong>只跑英文开发服</strong>
              <pre style={{padding: '0.9rem 1rem', background: 'var(--ifm-pre-background)'}}>
                pnpm start:en
              </pre>
              打开{' '}
              <a href="http://localhost:3002/en/docs/">http://localhost:3002/en/docs/</a>
              （路径必须带 <code>/en</code>，不要用 <code>/docs/</code>）。
            </li>
          </ol>
          <p>
            <a href={siteConfig.baseUrl}>返回中文首页</a>
            {' · '}
            <a href={`${siteConfig.baseUrl}docs/`}>中文文档</a>
          </p>
        </div>
      </div>
    </main>
  );
}
