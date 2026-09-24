import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export default function ChineseGuideLink({docId}: {docId: string}): React.JSX.Element {
  const {siteConfig, i18n} = useDocusaurusContext();
  const localeSuffix = `${i18n.currentLocale}/`;
  const base = i18n.currentLocale !== i18n.defaultLocale && siteConfig.baseUrl.endsWith(localeSuffix)
    ? siteConfig.baseUrl.slice(0, -localeSuffix.length)
    : siteConfig.baseUrl;
  return <a href={`${base}docs/${docId}`}>Read the complete Chinese guide <span aria-hidden="true">↗</span></a>;
}
