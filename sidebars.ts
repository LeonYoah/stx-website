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
      label: '🚀 快速入门',
      collapsed: false,
      items: ['get-started/quick-start'],
    },
    {
      type: 'category',
      label: '🏛️ 架构与设计',
      collapsed: false,
      items: ['architecture/overview'],
    },
    {
      type: 'category',
      label: '💻 功能与运维',
      collapsed: false,
      items: ['features/cluster-management'],
    },
  ],
};

export default sidebars;
