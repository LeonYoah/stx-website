import React from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import ThemedImage from '@theme/ThemedImage';
import logoLight from '@site/static/img/stx-logo.png';
import logoDark from '@site/static/img/stx-logo-dark.png';

type LogoProps = {
  className?: string;
  imageClassName?: string;
  titleClassName?: string;
};

type NavbarLogoConfig = {
  alt?: string;
  className?: string;
  height?: number | string;
  href?: string;
  style?: React.CSSProperties;
  target?: string;
  width?: number | string;
};

type NavbarConfig = {
  logo?: NavbarLogoConfig;
  title?: string;
};

/**
 * 静态 Logo 交给 Webpack 生成地址，避免英文开发路由把它错误地请求到 /en/img 下。
 */
export default function Logo({
  className,
  imageClassName,
  titleClassName,
}: LogoProps): React.JSX.Element | null {
  const { siteConfig } = useDocusaurusContext();
  const navbar = (siteConfig.themeConfig as { navbar?: NavbarConfig }).navbar ?? {};
  const { title: navbarTitle, logo } = navbar;
  const { title } = siteConfig;

  if (!logo) return null;

  const logoLink = useBaseUrl(logo.href || '/');
  const alt = logo.alt ?? (navbarTitle ? '' : title);
  const image = (
    <ThemedImage
      className={logo.className}
      sources={{ light: logoLight, dark: logoDark }}
      height={logo.height}
      width={logo.width}
      alt={alt}
      style={logo.style}
    />
  );

  return (
    <Link to={logoLink} className={className} {...(logo.target && { target: logo.target })}>
      {imageClassName ? <div className={imageClassName}>{image}</div> : image}
      {navbarTitle != null && <b className={titleClassName}>{navbarTitle}</b>}
    </Link>
  );
}
