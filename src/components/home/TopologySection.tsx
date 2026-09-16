import React from 'react';
import IntegrationCard from '../ui/integration-card';
import {useHomeLocale} from './useHomeLocale';

/**
 * 链路拓扑区：纯可视化窗口，无营销文案。
 * Topology section: visualization only, no marketing copy.
 */
export function TopologySection(): React.JSX.Element {
  const locale = useHomeLocale();
  return (
    <section
      className="stx-topo-section"
      aria-label={locale === 'en' ? 'STX cluster topology' : 'STX 集群拓扑'}
    >
      <div className="stx-topo-section__viz">
        <IntegrationCard embedded />
      </div>
    </section>
  );
}
