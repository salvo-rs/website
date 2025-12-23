import * as path from 'node:path';
import { defineConfig } from 'rspress/config';
import { pluginFontOpenSans } from 'rspress-plugin-font-open-sans';
import ga from 'rspress-plugin-google-analytics';
import mermaid from 'rspress-plugin-mermaid';
import { pluginOpenGraph } from 'rsbuild-plugin-open-graph';

const siteUrl = 'https://salvo.rs/';

export default defineConfig({
  plugins: [pluginFontOpenSans(),ga({
    id: 'G-X828N63WC8',
  },),mermaid(),
  pluginOpenGraph({
    title: 'Rspress',
    type: 'website',
    url: siteUrl,
    image: 'https://salvo.rs/images/logo-text.svg',
    description: 'Salvo Docs',
    twitter: {
      site: '@salvo',
      card: 'summary_large_image',
    },
  }),

],
  root: path.join(__dirname, 'docs'),
  title: 'Salvo - A perfect web framework written in Rust',
  lang: 'en',
  locales: [
    {
      lang: 'en',
      label: 'English',
      title: 'Salvo - A perfect web framework written in Rust',
      description: 'Salvo - A perfect web framework written in Rust',
      editLink: {
        docRepoBaseUrl:
          'https://github.com/salvo-rs/website/tree/main/docs',
        text: '📝 Edit this page on GitHub',
      },
      outlineTitle: 'On this page',
      outline: true,
      lastUpdated: true,
      lastUpdatedText: 'Last Updated',
      prevPageText: 'Previous Page',
      nextPageText: 'Next Page',
      searchPlaceholderText: 'Search Docs',
      searchNoResultsText: 'No results found',
      searchSuggestedQueryText: 'Try searching for',
    },
    {
      lang: 'zh-hans',
      label: '简体中文',
      title: 'Salvo - ',
      description: 'Salvo - 完美的 Rust Web 框架',
      editLink: {
        docRepoBaseUrl:
          'https://github.com/salvo-rs/website/tree/main/docs',
        text: '📝 在 GitHub 上编辑此页',
      },
      outlineTitle: '在本页上',
      outline: true,
      lastUpdated: true,
      lastUpdatedText: '最后更新',
      prevPageText: '上一页',
      nextPageText: '下一页',
      searchPlaceholderText: '搜索文档',
      searchNoResultsText: '未找到结果',
      searchSuggestedQueryText: '尝试搜索',
    },
    {
      lang: 'zh-hant',
      label: '繁體中文',
      title: 'Salvo - 完美的 Rust Web 框架',
      description: 'Salvo - 完美的 Rust Web 框架',
      editLink: {
        docRepoBaseUrl:
          'https://github.com/salvo-rs/website/tree/main/docs',
        text: '📝 在 GitHub 上編輯此頁',
      },
      outlineTitle: '在本頁上',
      outline: true,
      lastUpdated: true,
      lastUpdatedText: '最後更新',
      prevPageText: '上一頁',
      nextPageText: '下一頁',
      searchPlaceholderText: '搜索文檔',
      searchNoResultsText: '未找到結果',
      searchSuggestedQueryText: '嘗試搜索',
    },
    {
      lang: 'fr',
      label: 'Français',
      title: 'Salvo - Un framework web parfait écrit en Rust',
      description: 'Salvo - Un framework web parfait écrit en Rust',
      editLink: {
        docRepoBaseUrl:
          'https://github.com/salvo-rs/website/tree/main/docs',
        text: '📝 Éditer cette page sur GitHub',
      },
      outlineTitle: 'Sur cette page',
      outline: true,
      lastUpdated: true,
      lastUpdatedText: 'Dernière mise à jour',
      prevPageText: 'Page précédente',
      nextPageText: 'Page suivante',
      searchPlaceholderText: 'Rechercher dans la documentation',
      searchNoResultsText: 'Aucun résultat trouvé',
      searchSuggestedQueryText: 'Essayez de rechercher',
    },
    {
      lang: 'es',
      label: 'Español',
      title: 'Salvo - Un framework web perfecto escrito en Rust',
      description: 'Salvo - Un framework web perfecto escrito en Rust',
      editLink: {
        docRepoBaseUrl:
          'https://github.com/salvo-rs/website/tree/main/docs',
        text: '📝 Editar esta página en GitHub',
      },
      outlineTitle: 'En esta página',
      outline: true,
      lastUpdated: true,
      lastUpdatedText: 'Última actualización',
      prevPageText: 'Página anterior',
      nextPageText: 'Página siguiente',
      searchPlaceholderText: 'Buscar en la documentación',
      searchNoResultsText: 'No se encontraron resultados',
      searchSuggestedQueryText: 'Intente buscar',
    },
    {
      lang: 'ja',
      label: '日本語',
      title: 'Salvo - ',
      description: 'Salvo - Rustで書かれた完璧なウェブフレームワーク',
      editLink: {
        docRepoBaseUrl:
          'https://github.com/salvo-rs/website/tree/main/docs',
        text: '📝 GitHub でこのページを編集する',
      },
      outlineTitle: 'このページ内',
      outline: true,
      lastUpdated: true,
      lastUpdatedText: '最終更新',
      prevPageText: '前のページ',
      nextPageText: '次のページ',
      searchPlaceholderText: 'ドキュメントを検索',
      searchNoResultsText: '結果が見つかりません',
      searchSuggestedQueryText: '検索してみてください',
    },
    {
      lang: 'de',
      label: 'Deutsch',
      title: 'Salvo - Ein perfektes Web-Framework, geschrieben in Rust',
      description: 'Salvo - Ein perfektes Web-Framework, geschrieben in Rust',
      editLink: {
        docRepoBaseUrl:
          'https://github.com/salvo-rs/website/tree/main/docs',
        text: '📝 Diese Seite auf GitHub bearbeiten',
      },
      outlineTitle: 'Auf dieser Seite',
      outline: true,
      lastUpdated: true,
      lastUpdatedText: 'Zuletzt aktualisiert',
      prevPageText: 'Vorherige Seite',
      nextPageText: 'Nächste Seite',
      searchPlaceholderText: 'Dokumentation durchsuchen',
      searchNoResultsText: 'Keine Ergebnisse gefunden',
      searchSuggestedQueryText: 'Versuchen Sie zu suchen',
    },
    {
      lang: 'ru',
      label: 'Русский',
      title: 'Salvo - Идеальный веб-фреймворк, написанный на Rust',
      description: 'Salvo - Идеальный веб-фреймворк, написанный на Rust',
      editLink: {
        docRepoBaseUrl:
          'https://github.com/salvo-rs/website/tree/main/docs',
        text: '📝 Редактировать эту страницу на GitHub',
      },
      outlineTitle: 'На этой странице',
      outline: true,
      lastUpdated: true,
      lastUpdatedText: 'Последнее обновление',
      prevPageText: 'Предыдущая страница',
      nextPageText: 'Следующая страница',
      searchPlaceholderText: 'Поиск по документации',
      searchNoResultsText: 'Результаты не найдены',
      searchSuggestedQueryText: 'Попробуйте поискать',
    },
    {
      lang: 'pt',
      label: 'Português',
      title: 'Salvo - Um framework web perfeito escrito em Rust',
      description: 'Salvo - Um framework web perfeito escrito em Rust',
      editLink: {
        docRepoBaseUrl:
          'https://github.com/salvo-rs/website/tree/main/docs',
        text: '📝 Editar esta página no GitHub',
      },
      outlineTitle: 'Nesta página',
      outline: true,
      lastUpdated: true,
      lastUpdatedText: 'Última atualização',
      prevPageText: 'Página anterior',
      nextPageText: 'Próxima página',
      searchPlaceholderText: 'Pesquisar na documentação',
      searchNoResultsText: 'Nenhum resultado encontrado',
      searchSuggestedQueryText: 'Tente pesquisar',
    },
    {
      lang: 'it',
      label: 'Italiano',
      title: 'Salvo - Un framework web perfetto scritto in Rust',
      description: 'Salvo - Un framework web perfetto scritto in Rust',
      editLink: {
        docRepoBaseUrl:
          'https://github.com/salvo-rs/website/tree/main/docs',
        text: '📝 Modifica questa pagina su GitHub',
      },
      outlineTitle: 'In questa pagina',
      outline: true,
      lastUpdated: true,
      lastUpdatedText: 'Ultimo aggiornamento',
      prevPageText: 'Pagina precedente',
      nextPageText: 'Pagina successiva',
      searchPlaceholderText: 'Cerca nella documentazione',
      searchNoResultsText: 'Nessun risultato trovato',
      searchSuggestedQueryText: 'Prova a cercare',
    },
  ],
  icon: 'docs/public/images/icons/icon.png',
  logo: {
    light: '/images/icons/icon.png',
    dark: '/images/icons/icon.png',
  },
  // locales 为一个对象数组
  themeConfig: {
    hideNavbar: "auto",
    enableContentAnimation: true,
    enableScrollToTop: true,
    overview: {
      filterNameText: 'Filter',
      filterPlaceholderText: 'Enter keyword',
      filterNoResultText: 'No matching API found',
    },
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
        content: 'https://discord.gg/xNpR8XjC',
      },
    ],
  },
});

