import React, {useEffect, useRef, useState} from 'react';
import Link from '@docusaurus/Link';

const pages = [
  {title: '文档总览', group: '文档中心', text: '选择阅读路径，查找安装、主机、集群和告警文档', to: '/docs/'},
  {title: '快速部署', group: '快速入门', text: 'Linux 安装、默认端口、Web UI 登录、接入主机', to: '/docs/get-started/quick-start'},
  {title: '系统架构', group: '架构与设计', text: 'STX Server、stx-agent、stx-java-proxy、网络与端口', to: '/docs/architecture/overview'},
  {title: 'CLI 设计', group: '架构与设计', text: '登录、命名空间、只读命令、写入确认与审计', to: '/docs/architecture/cli'},
  {title: '主机管理', group: '主机与集群管理', text: '创建主机、安装 stx-agent、心跳与在线状态', to: '/docs/host-cluster/host-management'},
  {title: '集群管理', group: '主机与集群管理', text: '纳管已有进程、一键安装、混合与分离模式', to: '/docs/host-cluster/cluster-management'},
  {title: '调试工作台', group: '调试工作台', text: '连接器模板、测试连接、DAG、预览与发布', to: '/docs/workbench/overview'},
  {title: '安装包管理', group: '安装包与插件', text: '下载或上传 SeaTunnel 安装包，供一键安装与升级', to: '/docs/packages-plugins/package-management'},
  {title: '插件市场', group: '安装包与插件', text: '浏览连接器、一键附带依赖并安装到集群', to: '/docs/packages-plugins/plugin-marketplace'},
  {title: '告警中心', group: '告警与诊断', text: '告警状态、确认、静默和通知策略', to: '/docs/alerts-diagnostics/alert-center'},
  {title: '错误', group: '告警与诊断', text: 'SeaTunnel 日志 ERROR、错误组、频次和已有方案', to: '/docs/alerts-diagnostics/error-center'},
  {title: '巡检与报告', group: '告警与诊断', text: '发起巡检、查看诊断包和离线报告', to: '/docs/alerts-diagnostics/diagnostic-report'},
  {title: '经验库', group: '告警与诊断', text: '查找和记录已验证的处理方法', to: '/docs/alerts-diagnostics/troubleshooting-memory'},
];

const pagesEn = [
  {title: 'Docs overview', group: 'Documentation', text: 'Start here and browse by topic', to: '/docs/'},
  {title: 'Quick deploy', group: 'Getting started', text: 'Install STX on Linux and connect a host', to: '/docs/get-started/quick-start'},
  {title: 'System architecture', group: 'Architecture', text: 'STX Server, stx-agent, network, and default ports', to: '/docs/architecture/overview'},
  {title: 'STX CLI', group: 'Architecture', text: 'Sign-in, namespaces, confirmation, and audit records', to: '/docs/architecture/cli'},
  {title: 'Host management', group: 'Hosts & clusters', text: 'Register hosts, install stx-agent, and check heartbeats', to: '/docs/host-cluster/host-management'},
  {title: 'Cluster management', group: 'Hosts & clusters', text: 'Attach existing processes or install a SeaTunnel cluster', to: '/docs/host-cluster/cluster-management'},
  {title: 'Debug workbench', group: 'Jobs', text: 'Connector templates, connection tests, DAG, and preview', to: '/docs/workbench/overview'},
  {title: 'Package Management', group: 'Packages & Plugins', text: 'Download or upload SeaTunnel archives for install and upgrade', to: '/docs/packages-plugins/package-management'},
  {title: 'Plugin Marketplace', group: 'Packages & Plugins', text: 'Browse connectors, attach dependencies, and install onto clusters', to: '/docs/packages-plugins/plugin-marketplace'},
  {title: 'Alert center', group: 'Alerts & diagnostics', text: 'Review alerts and notification policies', to: '/docs/alerts-diagnostics/alert-center'},
  {title: 'Errors', group: 'Alerts & diagnostics', text: 'Inspect grouped errors and event samples', to: '/docs/alerts-diagnostics/error-center'},
  {title: 'Inspection & report', group: 'Alerts & diagnostics', text: 'Run an inspection and read the offline report', to: '/docs/alerts-diagnostics/diagnostic-report'},
  {title: 'Experience library', group: 'Alerts & diagnostics', text: 'Find verified troubleshooting steps', to: '/docs/alerts-diagnostics/troubleshooting-memory'},
];

export default function DocsSearch({isEnglish}: {isEnglish: boolean}): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const normalized = query.trim().toLocaleLowerCase();
  const availablePages = isEnglish ? pagesEn : pages;
  const results = normalized
    ? availablePages.filter(page => `${page.title} ${page.group} ${page.text}`.toLocaleLowerCase().includes(normalized))
    : availablePages;

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen(current => !current);
      } else if (event.key === 'Escape') {
        setOpen(false);
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  function keepFocus(event: React.KeyboardEvent<HTMLElement>) {
    if (event.key !== 'Tab') return;
    const items = dialogRef.current?.querySelectorAll<HTMLElement>('input, button, a[href]');
    if (!items?.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function close() {
    setOpen(false);
    setQuery('');
    triggerRef.current?.focus();
  }

  return <>
    <button ref={triggerRef} type="button" className="stx-doc-search-trigger" onClick={() => setOpen(true)} aria-label={isEnglish ? 'Search documentation' : '搜索文档'}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></svg>
      <span>{isEnglish ? 'Search' : '搜索文档'}</span><kbd>⌘ K</kbd>
    </button>
    {open && <div className="stx-doc-search-backdrop" onMouseDown={event => {if (event.target === event.currentTarget) close();}}>
      <section ref={dialogRef} onKeyDown={keepFocus} className="stx-doc-search-dialog" role="dialog" aria-modal="true" aria-label={isEnglish ? 'Search documentation' : '搜索文档'}>
        <div className="stx-doc-search-field">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></svg>
          <input ref={inputRef} value={query} onChange={event => setQuery(event.target.value)} onKeyDown={event => {
            if (event.key === 'Enter' && results[0]) {
              const first = document.querySelector<HTMLAnchorElement>('.stx-doc-search-results a');
              first?.click();
              close();
            }
          }} placeholder={isEnglish ? 'Search titles and topics…' : '搜索标题或主题…'} />
          <button type="button" onClick={close} aria-label={isEnglish ? 'Close' : '关闭搜索'}>Esc</button>
        </div>
        <div className="stx-doc-search-results">
          {results.length ? results.map(page => <Link to={page.to} key={page.to} onClick={close}>
            <span>{page.group}</span><strong>{page.title}</strong><small>{page.text}</small>
          </Link>) : <p>{isEnglish ? 'No matching pages' : '没有找到相关文档'}</p>}
        </div>
        <div className="stx-doc-search-foot">{isEnglish ? 'Enter to open · Esc to close' : '回车打开第一项 · Esc 关闭'}</div>
      </section>
    </div>}
  </>;
}
