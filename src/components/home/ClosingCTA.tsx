import React from 'react';
import Link from '@docusaurus/Link';
import {useHomeLocale} from './useHomeLocale';

/**
 * 收尾 CTA：页脚前的最后一屏，给出主行动。
 * Closing call-to-action: the last screen before the footer, with the primary actions.
 */
export function ClosingCTA(): React.JSX.Element {
  const locale = useHomeLocale();
  const copy =
    locale === 'en'
      ? {
          title: 'Put SeaTunnel ops on STX today',
          sub: 'One install command. Works with Apache SeaTunnel 2.3.x+ and 100+ connector plugins.',
          primary: 'Try online',
          secondary: 'Quick deploy',
        }
      : {
          title: '现在就把 SeaTunnel 运维交给 STX',
          sub: '一条命令完成安装，兼容 Apache SeaTunnel 2.3.x+ 与 100+ Connector 插件。',
          primary: '在线体验',
          secondary: '快速部署',
        };

  return (
    <section className="stx-close-cta" aria-label={copy.title}>
      <h2 className="stx-close-cta__title">{copy.title}</h2>
      <p className="stx-close-cta__sub">{copy.sub}</p>
      <div className="stx-close-cta__actions">
        <Link
          className="button--glacier"
          href="https://demo.stxcli.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          {copy.primary}
        </Link>
        <Link className="stx-close-cta__ghost" to="/docs/get-started/quick-start">
          {copy.secondary}
        </Link>
      </div>
    </section>
  );
}
