import { createRequire } from "node:module";
// import { docsearchPlugin } from '@vuepress/plugin-docsearch'
import { searchPlugin } from '@vuepress/plugin-search';
import { googleAnalyticsPlugin } from '@vuepress/plugin-google-analytics';
import { getDirname, path } from '@vuepress/utils';
import { defineUserConfig } from "vuepress";
import theme from "./theme.js";
import {
  head
} from './configs/index.js';

const __dirname = getDirname(import.meta.url);

export default defineUserConfig({
  // set site base to default value
  base: '/',
  // extra tags in `<head>`
  head,
  pagePatterns: ['**/*.md', '!.vuepress', '!node_modules', '!codes'],

  // site-level locales config
  locales: {
    '/': {
      lang: 'en',
      title: 'Salvo',
      description: 'A powerful and simple Rust web server framework',
    },
    '/zh-hans/': {
      lang: 'zh-hans',
      title: 'Salvo',
      description: '赛风是一个功能强大且简单的 Rust Web 服务端框架',
    },
    '/zh-hant/': {
      lang: 'zh-hant',
      title: 'Salvo',
      description: '賽風是一個功能強大且簡單的 Rust Web 服務端框架',
    },
  },

  // configure markdown
  markdown: {
    importCode: {
      handleImportPath: (filePath) => {
        if (filePath.endsWith("hotKey.ts"))
          return path.resolve(__dirname, "./assets/hotKey.ts");

        if (filePath.startsWith("@vuepress")) {
          const pkgName = /(^@vuepress\/[^/]+)/.exec(filePath)![1]!;

          return filePath
            .replace(
              pkgName,
              path.dirname(
                createRequire(import.meta.url).resolve(
                  `${pkgName}/package.json`
                )
              )
            )
            .replace("/src/", "/lib/");
        }

        return filePath;
      },
    },
  },

  theme,

  // use plugins
  plugins: [
    searchPlugin({
      locales: {
        '/': {
          placeholder: 'Search',
        },
        '/zh-hans/': {
          placeholder: '搜索',
        },
        '/zh-hant/': {
          placeholder: '搜索',
        },
      },
    }),
    // docsearchPlugin({
    //   appId: '34YFD9IUQ2',
    //   apiKey: '9a9058b8655746634e01071411c366b8',
    //   indexName: 'salvo.rs',
    //   searchParameters: {
    //     facetFilters: ['tags:v2'],
    //   },
    //   locales: {
    //     '/zh-hans/': {
    //       placeholder: '搜索文档',
    //       translations: {
    //         button: {
    //           buttonText: '搜索文档',
    //           buttonAriaLabel: '搜索文档',
    //         },
    //         modal: {
    //           searchBox: {
    //             resetButtonTitle: '清除查询条件',
    //             resetButtonAriaLabel: '清除查询条件',
    //             cancelButtonText: '取消',
    //             cancelButtonAriaLabel: '取消',
    //           },
    //           startScreen: {
    //             recentSearchesTitle: '搜索历史',
    //             noRecentSearchesText: '没有搜索历史',
    //             saveRecentSearchButtonTitle: '保存至搜索历史',
    //             removeRecentSearchButtonTitle: '从搜索历史中移除',
    //             favoriteSearchesTitle: '收藏',
    //             removeFavoriteSearchButtonTitle: '从收藏中移除',
    //           },
    //           errorScreen: {
    //             titleText: '无法获取结果',
    //             helpText: '你可能需要检查你的网络连接',
    //           },
    //           footer: {
    //             selectText: '选择',
    //             navigateText: '切换',
    //             closeText: '关闭',
    //             searchByText: '搜索提供者',
    //           },
    //           noResultsScreen: {
    //             noResultsText: '无法找到相关结果',
    //             suggestedQueryText: '你可以尝试查询',
    //             reportMissingResultsText: '你认为该查询应该有结果？',
    //             reportMissingResultsLinkText: '点击反馈',
    //           },
    //         },
    //       },
    //     },
    //     '/zh-hant/': {
    //       placeholder: '搜索文檔',
    //       translations: {
    //         button: {
    //           buttonText: '搜索文檔',
    //           buttonAriaLabel: '搜索文檔',
    //         },
    //         modal: {
    //           searchBox: {
    //             resetButtonTitle: '清除查詢條件',
    //             resetButtonAriaLabel: '清除查詢條件',
    //             cancelButtonText: '取消',
    //             cancelButtonAriaLabel: '取消',
    //           },
    //           startScreen: {
    //             recentSearchesTitle: '搜索曆史',
    //             noRecentSearchesText: '冇有搜索曆史',
    //             saveRecentSearchButtonTitle: '保存至搜索曆史',
    //             removeRecentSearchButtonTitle: '從搜索曆史中移除',
    //             favoriteSearchesTitle: '收藏',
    //             removeFavoriteSearchButtonTitle: '從收藏中移除',
    //           },
    //           errorScreen: {
    //             titleText: '無法獲取結果',
    //             helpText: '你可能需要檢查你的網絡連接',
    //           },
    //           footer: {
    //             selectText: '選擇',
    //             navigateText: '切換',
    //             closeText: '關閉',
    //             searchByText: '搜索提供者',
    //           },
    //           noResultsScreen: {
    //             noResultsText: '無法找到相關結果',
    //             suggestedQueryText: '你可以嘗試查詢',
    //             reportMissingResultsText: '你認為該查詢應該有結果？',
    //             reportMissingResultsLinkText: '點擊反饋',
    //           },
    //         },
    //       },
    //     },
    //   },
    // }),
    googleAnalyticsPlugin({
      // we have multiple deployments, which would use different id
      id: process.env.DOCS_GA_ID ?? 'G-X828N63WC8',
    }),
  ],
});
