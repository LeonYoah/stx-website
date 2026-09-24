import React, {useRef} from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import gsap from 'gsap';
import {useGSAP} from '@gsap/react';
import './docs-overview.css';

gsap.registerPlugin(useGSAP);

const paths = [
  {number: '01', title: '快速部署', detail: '在 Linux 上安装 STX，打开 Web UI 并完成首次登录。', to: '/docs/get-started/quick-start', icon: 'terminal'},
  {number: '02', title: '系统架构', detail: '认识 STX 安装机、被纳管主机和各进程的连接方式。', to: '/docs/architecture/overview', icon: 'nodes'},
  {number: '03', title: '主机与集群', detail: '登记主机，安装 stx-agent，管理 SeaTunnel 集群。', to: '/docs/host-cluster/host-management', icon: 'server'},
  {number: '04', title: '调试工作台', detail: '查看连接器参数，编写和调试同步作业。', to: '/docs/workbench/overview', icon: 'code'},
];

const groups = [
  {title: '安装与连接', description: '准备安装环境，确认 Web UI、API 和 gRPC 的访问地址。', links: [{label: '快速部署', to: '/docs/get-started/quick-start'}, {label: '系统架构与默认端口', to: '/docs/architecture/overview'}]},
  {title: '管理运行环境', description: '从登记主机开始，再纳管已有集群或安装新集群。', links: [{label: '主机管理', to: '/docs/host-cluster/host-management'}, {label: '集群管理', to: '/docs/host-cluster/cluster-management'}]},
  {title: '编写与调试作业', description: '在 Web UI 中查看连接器说明，调试作业并检查运行结果。', links: [{label: '调试工作台', to: '/docs/workbench/overview'}]},
  {title: '告警与诊断', description: '从告警或错误进入巡检，查看报告和已有处理方法。', links: [{label: '告警中心', to: '/docs/alerts-diagnostics/alert-center'}, {label: '错误', to: '/docs/alerts-diagnostics/error-center'}, {label: '巡检与报告', to: '/docs/alerts-diagnostics/diagnostic-report'}, {label: '经验库', to: '/docs/alerts-diagnostics/troubleshooting-memory'}]},
  {title: '使用命令行', description: '了解 CLI 命令的用法，以及它和 Web UI 的关系。', links: [{label: 'CLI 设计', to: '/docs/architecture/cli'}]},
];

const pathsEn = [
  {number: '01', title: 'Quick deploy', detail: 'Install STX on Linux, open the Web UI, and connect a host.', to: '/docs/get-started/quick-start', icon: 'terminal'},
  {number: '02', title: 'System architecture', detail: 'See where STX Server and stx-agent run and which ports they use.', to: '/docs/architecture/overview', icon: 'nodes'},
  {number: '03', title: 'Hosts & clusters', detail: 'Register hosts and manage SeaTunnel cluster processes.', to: '/docs/host-cluster/host-management', icon: 'server'},
  {number: '04', title: 'Debug workbench', detail: 'Check connector settings and preview a job draft.', to: '/docs/workbench/overview', icon: 'code'},
];

const groupsEn = [
  {title: 'Install and connect', description: 'Check the installation host and its Web UI, API, and gRPC addresses.', links: [{label: 'Quick deploy', to: '/docs/get-started/quick-start'}, {label: 'Architecture and ports', to: '/docs/architecture/overview'}]},
  {title: 'Manage the runtime', description: 'Connect a host, then attach an existing cluster or install a new one.', links: [{label: 'Host management', to: '/docs/host-cluster/host-management'}, {label: 'Cluster management', to: '/docs/host-cluster/cluster-management'}]},
  {title: 'Edit and debug jobs', description: 'Use connector templates, check connections, inspect the DAG, and preview data.', links: [{label: 'Debug workbench', to: '/docs/workbench/overview'}]},
  {title: 'Alerts & diagnostics', description: 'Review alerts, inspect grouped errors, then read inspection reports and troubleshooting records.', links: [{label: 'Alert center', to: '/docs/alerts-diagnostics/alert-center'}, {label: 'Errors', to: '/docs/alerts-diagnostics/error-center'}, {label: 'Inspection & report', to: '/docs/alerts-diagnostics/diagnostic-report'}, {label: 'Experience library', to: '/docs/alerts-diagnostics/troubleshooting-memory'}]},
  {title: 'Use the CLI', description: 'Sign in and learn how read and write commands differ.', links: [{label: 'STX CLI', to: '/docs/architecture/cli'}]},
];

function Symbol({name}: {name: string}) {
  const common = {width: 23, height: 23, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.55, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true as const};
  if (name === 'terminal') return <svg {...common}><rect x="3" y="4" width="18" height="16" rx="2"/><path d="m7 9 3 3-3 3m6 0h4"/></svg>;
  if (name === 'nodes') return <svg {...common}><rect x="2" y="9" width="6" height="6" rx="1"/><rect x="16" y="3" width="6" height="6" rx="1"/><rect x="16" y="15" width="6" height="6" rx="1"/><path d="M8 12h4m0 0V6h4m-4 6v6h4"/></svg>;
  if (name === 'server') return <svg {...common}><rect x="3" y="3" width="18" height="8" rx="2"/><rect x="3" y="13" width="18" height="8" rx="2"/><path d="M7 7h.01M7 17h.01M11 7h6m-6 10h6"/></svg>;
  return <svg {...common}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="m10 8-4 4 4 4m4-8 4 4-4 4"/></svg>;
}

export default function DocsOverview(): React.JSX.Element {
  const root = useRef<HTMLDivElement>(null);
  const {i18n} = useDocusaurusContext();
  const isEnglish = i18n.currentLocale === 'en';
  const cards = isEnglish ? pathsEn : paths;
  const topics = isEnglish ? groupsEn : groups;
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from('.stx-doc-card', {
        y: 18,
        autoAlpha: 0,
        duration: 0.54,
        stagger: 0.07,
        ease: 'power2.out',
        clearProps: 'all',
      });
    });
    return () => mm.revert();
  }, {scope: root});

  return <div ref={root} className="stx-doc-overview">
    <p className="stx-doc-intro">{isEnglish ? 'English guides are being prepared. Start with the quick deploy guide or browse these short topic outlines. Each outline links to the complete Chinese guide.' : '按你要做的事选择一篇文档。初次使用可以从快速部署开始；已有 STX 环境时，直接查看相应功能。'}</p>
    <h2 id={isEnglish ? "start-here" : "从这里开始"}>{isEnglish ? "Start here" : "从这里开始"}</h2>
    <div className="stx-doc-cards">
      {cards.map(item => <Link className="stx-doc-card" to={item.to} key={item.number}>
        <span className="stx-doc-card-top"><Symbol name={item.icon}/><span>{item.number}</span></span>
        <strong>{item.title}</strong>
        <span className="stx-doc-card-detail">{item.detail}</span>
        <span className="stx-doc-card-more">{isEnglish ? "Read guide" : "阅读文档"} <span aria-hidden="true">↗</span></span>
      </Link>)}
    </div>
    <h2 id={isEnglish ? "browse-by-topic" : "按主题查找"}>{isEnglish ? "Browse by topic" : "按主题查找"}</h2>
    <div className="stx-doc-topics">
      {topics.map(group => <details key={group.title}>
        <summary><span>{group.title}</span><span className="stx-doc-topic-plus" aria-hidden="true"/></summary>
        <div className="stx-doc-topic-body"><p>{group.description}</p><div>{group.links.map(link => <Link key={link.to} to={link.to}>{link.label}<span aria-hidden="true">↗</span></Link>)}</div></div>
      </details>)}
    </div>
  </div>;
}
