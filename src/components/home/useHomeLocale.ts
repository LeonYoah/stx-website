import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export type HomeLocale = 'zh' | 'en';

/**
 * 首页文案 locale：Docusaurus `en` → English，其余走中文。
 * Homepage copy locale: Docusaurus `en` → English, else Chinese.
 */
export function useHomeLocale(): HomeLocale {
  const {i18n} = useDocusaurusContext();
  return i18n.currentLocale.startsWith('en') ? 'en' : 'zh';
}
