import React from 'react';
import IntegrationCard from '../ui/integration-card';

/**
 * 链路拓扑区：从首屏下移，承接 Agent 演示后的产品结构叙事。
 * Topology section: below hero, product structure after the agent demo.
 */
export function TopologySection(): React.JSX.Element {
  return (
    <section className="stx-topo-section" aria-labelledby="stx-topo-title">
      <div className="stx-topo-section__intro">
        <p className="stx-topo-section__eyebrow">Control plane · Runtime</p>
        <h2 id="stx-topo-title" className="stx-topo-section__title">
          控制面到引擎运行时，一眼看清链路
        </h2>
        <p className="stx-topo-section__sub">
          Agent 通过 stx 触达集群；拓扑展示 STX 与 Zeta / Spark / Flink
          及周边基础设施如何连成一体。
        </p>
      </div>
      <div className="stx-topo-section__viz">
        <IntegrationCard embedded />
      </div>
    </section>
  );
}
