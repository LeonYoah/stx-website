import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// 文档区使用常驻分组标题；页面入口只出现一次。
const section = (zh: string, en: string) => ({
  type: 'html' as const,
  className: 'stx-sidebar-section',
  value: `<span lang="zh-CN">${zh}</span><span lang="en">${en}</span>`,
});

const sidebars: SidebarsConfig = {
  docsSidebar: [
    {type: 'doc', id: 'index', label: '文档总览'},
    section('快速入门', 'Getting started'),
    'get-started/quick-start',
    section('架构与设计', 'Architecture'),
    'architecture/overview',
    'architecture/cli',
    section('主机与集群', 'Hosts & clusters'),
    'host-cluster/host-management',
    'host-cluster/cluster-management',
    section('作业', 'Jobs'),
    'workbench/overview',
    section('安装包与插件', 'Packages & plugins'),
    'packages-plugins/package-management',
    'packages-plugins/plugin-marketplace',
    section('告警与诊断', 'Alerts & diagnostics'),
    'alerts-diagnostics/alert-center',
    'alerts-diagnostics/error-center',
    'alerts-diagnostics/diagnostic-report',
    'alerts-diagnostics/troubleshooting-memory',
  ],
};

export default sidebars;
