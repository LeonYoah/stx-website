import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

/**
 * STX 文档侧边栏分类路由配置
 * STX documentation sidebar navigation configuration
 */
const sidebars: SidebarsConfig = {
  docsSidebar: [
    {
      type: 'doc',
      id: 'index',
      label: '文档总览',
    },
    {
      type: 'category',
      label: '快速入门',
      collapsed: false,
      items: ['get-started/quick-start'],
    },
    {
      type: 'category',
      label: '架构与设计',
      collapsed: false,
      items: [
        'architecture/overview',
        'architecture/cli',
      ],
    },
    {
      type: 'category',
      label: '主机与集群管理',
      collapsed: false,
      items: [
        'host-cluster/host-management',
        'host-cluster/cluster-management',
      ],
    },
    {
      type: 'category',
      label: '调试工作台',
      collapsed: false,
      items: ['workbench/overview'],
    },
  ],
};

export default sidebars;
