import React from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import ThemedImage from '@theme/ThemedImage';

const docsZh = [
  {label: '文档总览', to: '/docs/'},
  {label: '快速部署', to: '/docs/get-started/quick-start'},
  {label: '系统架构', to: '/docs/architecture/overview'},
  {label: '主机与集群', to: '/docs/host-cluster/host-management'},
  {label: '调试工作台', to: '/docs/workbench/overview'},
  {label: 'STX CLI', to: '/docs/architecture/cli'},
];

const docsEn = [
  {label: 'Docs overview', to: '/docs/'},
  {label: 'Quick deploy', to: '/docs/get-started/quick-start'},
  {label: 'System architecture', to: '/docs/architecture/overview'},
  {label: 'Hosts & clusters', to: '/docs/host-cluster/host-management'},
  {label: 'Debug workbench', to: '/docs/workbench/overview'},
  {label: 'STX CLI', to: '/docs/architecture/cli'},
];

export default function Footer(): React.JSX.Element {
  const {i18n, siteConfig} = useDocusaurusContext();
  const isEnglish = i18n.currentLocale === 'en';
  const logoLight = `${siteConfig.baseUrl}img/stx-logo.png`;
  const logoDark = `${siteConfig.baseUrl}img/stx-logo-dark.png`;

  function backToTop() {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({top: 0, behavior: reduced ? 'auto' : 'smooth'});
  }

  return <footer className="stx-site-footer">
    <div className="stx-footer-inner">
      <div className="stx-footer-main">
        <div className="stx-footer-brand">
          <Link to="/" aria-label={isEnglish ? 'STX home' : 'STX 首页'}>
            <ThemedImage className="stx-footer-logo" sources={{light: logoLight, dark: logoDark}} alt="STX" />
          </Link>
          <p>{isEnglish ? 'All-in-one ops for Apache SeaTunnel, with a native AI Agent entry (CLI + Skill).' : '面向 Apache SeaTunnel 的一站式运维平台；并原生提供 AI Agent 智能运维入口（CLI + Skill）。'}</p>
          <button type="button" onClick={backToTop}>{isEnglish ? 'Back to top' : '返回顶部'} <span aria-hidden="true">↑</span></button>
        </div>
        <nav className="stx-footer-group" aria-label={isEnglish ? 'Documentation' : '文档'}>
          <h2>{isEnglish ? 'Documentation' : '文档'}</h2>
          {(isEnglish ? docsEn : docsZh).map(item => <Link key={item.to} to={item.to}>{item.label}</Link>)}
        </nav>
        <nav className="stx-footer-group" aria-label={isEnglish ? 'Project links' : '项目链接'}>
          <h2>{isEnglish ? 'Project' : '项目'}</h2>
          <a href="https://github.com/LeonYoah/stx" target="_blank" rel="noopener noreferrer">GitHub <span aria-hidden="true">↗</span></a>
          <a href="https://github.com/LeonYoah/stx/issues" target="_blank" rel="noopener noreferrer">{isEnglish ? 'Issues' : '问题反馈'} <span aria-hidden="true">↗</span></a>
          <a href="https://seatunnel.apache.org" target="_blank" rel="noopener noreferrer">Apache SeaTunnel <span aria-hidden="true">↗</span></a>
        </nav>
      </div>
      <div className="stx-footer-bottom">
        <span>© {new Date().getFullYear()} STX Project</span>
        <a href="https://github.com/LeonYoah/stx-website" target="_blank" rel="noopener noreferrer">{isEnglish ? 'Edit documentation on GitHub' : '查看文档源码'} <span aria-hidden="true">↗</span></a>
      </div>
    </div>
  </footer>;
}
