import { defineConfig } from '@rspress/core';
import { pluginOpenGraph } from 'rsbuild-plugin-open-graph';

const siteUrl = 'https://salvo.rs/';
const docRepoBaseUrl = 'https://github.com/salvo-rs/website/tree/main/docs';

export default defineConfig({
  plugins: [
    pluginOpenGraph({
      title: 'Salvo - A perfect web framework written in Rust',
      type: 'website',
      url: siteUrl,
      image: 'https://salvo.rs/images/logo-text.svg',
      description: 'Salvo - A perfect web framework written in Rust',
      // twitter: {
      //   site: '@salvo',
      //   card: 'summary_large_image',
      // },
    }),
  ],
  root: 'docs',
  // title: 'Salvo - A perfect web framework written in Rust',
  lang: 'en',
  // Site level i18n config. Theme text (pagination, outline, search, ...) is
  // configured in i18n.json, keyed by the same `lang` values.
  locales: [
    {
      lang: 'en',
      label: 'English',
      title: 'Salvo - A perfect web framework written in Rust',
      description: 'Salvo - A perfect web framework written in Rust',
    },
    {
      lang: 'zh-hans',
      label: '简体中文',
      title: 'Salvo - 完美的 Rust Web 框架',
      description: 'Salvo - 完美的 Rust Web 框架',
    },
    {
      lang: 'zh-hant',
      label: '繁體中文',
      title: 'Salvo - 完美的 Rust Web 框架',
      description: 'Salvo - 完美的 Rust Web 框架',
    },
    {
      lang: 'fr',
      label: 'Français',
      title: 'Salvo - Un framework web parfait écrit en Rust',
      description: 'Salvo - Un framework web parfait écrit en Rust',
    },
    {
      lang: 'es',
      label: 'Español',
      title: 'Salvo - Un framework web perfecto escrito en Rust',
      description: 'Salvo - Un framework web perfecto escrito en Rust',
    },
    {
      lang: 'ja',
      label: '日本語',
      title: 'Salvo - Rustで書かれた完璧なウェブフレームワーク',
      description: 'Salvo - Rustで書かれた完璧なウェブフレームワーク',
    },
    {
      lang: 'de',
      label: 'Deutsch',
      title: 'Salvo - Ein perfektes Web-Framework, geschrieben in Rust',
      description: 'Salvo - Ein perfektes Web-Framework, geschrieben in Rust',
    },
    // {
    //   lang: 'ru',
    //   label: 'Русский',
    //   title: 'Salvo - Идеальный веб-фреймворк, написанный на Rust',
    //   description: 'Salvo - Идеальный веб-фреймворк, написанный на Rust',
    // },
    {
      lang: 'pt',
      label: 'Português',
      title: 'Salvo - Um framework web perfeito escrito em Rust',
      description: 'Salvo - Um framework web perfeito escrito em Rust',
    },
    {
      lang: 'it',
      label: 'Italiano',
      title: 'Salvo - Un framework web perfetto scritto in Rust',
      description: 'Salvo - Un framework web perfetto scritto in Rust',
    },
  ],
  icon: '/images/icons/icon.png',
  logo: {
    light: '/images/icons/icon.png',
    dark: '/images/icons/icon.png',
  },
  themeConfig: {
    hideNavbar: 'auto',
    enableContentAnimation: true,
    enableScrollToTop: true,
    editLink: {
      docRepoBaseUrl,
    },
    lastUpdated: true,
    footer: {
      message: 'MIT Licensed | Copyright © 2019-present Salvo Team',
    },
    socialLinks: [
      {
        icon: 'github',
        mode: 'link',
        content: 'https://github.com/salvo-rs/salvo',
      },
      {
        icon: 'qq',
        mode: 'link',
        content: 'https://qm.qq.com/q/IfBy8ezZEk',
      },
      {
        icon: 'discord',
        mode: 'link',
        content: 'https://discord.gg/G8KfmS6ByH',
      },
    ],
  },
  markdown: {
    mermaid: true,
  },
  llms: true,
  // NOTE: `themePlugins` is a Rspress v1 option and is ignored by v2. To keep
  // Google Analytics working, move it to
  // `builderConfig.plugins: [pluginGoogleAnalytics({ id: 'G-X828N63WC8' })]`
  // from 'rsbuild-plugin-google-analytics'.
  themePlugins: {
    ga: {
      id: 'G-X828N63WC8',
    },
  },
});
