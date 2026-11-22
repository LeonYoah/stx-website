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

const projectZh = [
  {label: 'GitHub', href: 'https://github.com/LeonYoah/stx'},
  {label: '问题反馈', href: 'https://github.com/LeonYoah/stx/issues'},
  {label: '版本发布', href: 'https://github.com/LeonYoah/stx/releases'},
  {label: '开源协议', href: 'https://github.com/LeonYoah/stx/blob/main/LICENSE'},
];

const projectEn = [
  {label: 'GitHub', href: 'https://github.com/LeonYoah/stx'},
  {label: 'Issues', href: 'https://github.com/LeonYoah/stx/issues'},
  {label: 'Releases', href: 'https://github.com/LeonYoah/stx/releases'},
  {label: 'License', href: 'https://github.com/LeonYoah/stx/blob/main/LICENSE'},
];

const resourceZh = [
  {label: '在线体验', href: 'https://demo.stxcli.com'},
  {label: 'Apache SeaTunnel', href: 'https://seatunnel.apache.org'},
  {label: '文档源码', href: 'https://github.com/LeonYoah/stx-website'},
];

const resourceEn = [
  {label: 'Live demo', href: 'https://demo.stxcli.com'},
  {label: 'Apache SeaTunnel', href: 'https://seatunnel.apache.org'},
  {label: 'Docs source', href: 'https://github.com/LeonYoah/stx-website'},
];

function GitHubIcon(): React.JSX.Element {
  return (
    <svg viewBox="0 0 16 16" width="18" height="18" aria-hidden="true">
      <path
        fill="currentColor"
        d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"
      />
    </svg>
  );
}

function GlobeIcon(): React.JSX.Element {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z" />
    </svg>
  );
}

export default function Footer(): React.JSX.Element {
  const {i18n, siteConfig} = useDocusaurusContext();
  const isEnglish = i18n.currentLocale === 'en';
  const logoLight = `${siteConfig.baseUrl}img/stx-logo.png`;
  const logoDark = `${siteConfig.baseUrl}img/stx-logo-dark.png`;

  const groups = [
    {
      title: isEnglish ? 'Documentation' : '文档',
      items: isEnglish ? docsEn : docsZh,
    },
    {
      title: isEnglish ? 'Project' : '项目',
      items: isEnglish ? projectEn : projectZh,
    },
    {
      title: isEnglish ? 'Resources' : '资源',
      items: isEnglish ? resourceEn : resourceZh,
    },
  ];

  return <footer className="stx-site-footer">
    <div className="stx-footer-inner">
      <div className="stx-footer-main">
        <div className="stx-footer-brand">
          <Link to="/" aria-label={isEnglish ? 'STX home' : 'STX 首页'}>
            <ThemedImage className="stx-footer-logo" sources={{light: logoLight, dark: logoDark}} alt="STX" />
          </Link>
          <p>{isEnglish ? 'All-in-one ops for Apache SeaTunnel, with native AI Agent (CLI + Skill).' : 'Apache SeaTunnel 一站式运维平台，原生 AI Agent 入口（CLI + Skill）。'}</p>
          <div className="stx-footer-social">
            <a href="https://github.com/LeonYoah/stx" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><GitHubIcon /></a>
            <a href="https://demo.stxcli.com" target="_blank" rel="noopener noreferrer" aria-label={isEnglish ? 'Live demo' : '在线体验'}><GlobeIcon /></a>
          </div>
        </div>
        {groups.map(group => (
          <nav key={group.title} className="stx-footer-group" aria-label={group.title}>
            <h2>{group.title}</h2>
            {group.items.map(item => 'to' in item
              ? <Link key={item.label} to={item.to}>{item.label}</Link>
              : <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer">{item.label}</a>)}
          </nav>
        ))}
      </div>
      <div className="stx-footer-bottom">
        <span>{isEnglish ? 'Open source under Apache-2.0' : '基于 Apache-2.0 协议开源'}</span>
        <span>© {new Date().getFullYear()} STX Project</span>
      </div>
    </div>
  </footer>;
}
