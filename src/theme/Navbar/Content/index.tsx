import React from 'react';
import {useLocation} from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import OriginalNavbarContent from '@theme-original/Navbar/Content';
import DocsSearch from '../../../components/docs/DocsSearch';

export default function NavbarContent(): React.JSX.Element {
  const {pathname} = useLocation();
  const {siteConfig, i18n} = useDocusaurusContext();
  const docsPath = `${siteConfig.baseUrl}docs`;
  const isDocs = pathname === docsPath || pathname.startsWith(`${docsPath}/`);

  return <>
    <OriginalNavbarContent />
    {isDocs && <div className="stx-navbar-search"><DocsSearch isEnglish={i18n.currentLocale === 'en'} /></div>}
  </>;
}
