import { defaultTheme } from "@vuepress/theme-default";
import {
    head,
    navbarEn,
    navbarZhHans,
    navbarZhHant,
    sidebarEn,
    sidebarZhHans,
    sidebarZhHant,
} from './configs/index.js';

export default defaultTheme({
    logo: '/images/logo-text-h.svg',
    repo: 'salvo-rs/salvo',
    docsRepo: 'salvo-rs/website',
    docsBranch: 'next',
    docsDir: 'book',

    // theme-level locales config
    locales: {
        /**
         * English locale config
         *
         * As the default locale of @vuepress/theme-default is English,
         * we don't need to set all of the locale fields
         */
        '/': {
            // navbar
            navbar: navbarEn,
            // sidebar
            sidebar: sidebarEn,
            // page meta
            editLinkText: 'Edit this page on GitHub',
        },

        /**
         * Chinese locale config
         */
        '/zh-hans/': {
            // navbar
            navbar: navbarZhHans,
            selectLanguageName: '简体中文',
            selectLanguageText: '选择语言',
            selectLanguageAriaLabel: '选择语言',
            // sidebar
            sidebar: sidebarZhHans,
            // page meta
            editLinkText: '在 GitHub 上编辑此页',
            lastUpdatedText: '上次更新',
            contributorsText: '贡献者',
            // custom containers
            tip: '提示',
            warning: '注意',
            danger: '警告',
            // 404 page
            notFound: [
                '这里什么都没有',
                '我们怎么到这来了？',
                '这是一个 404 页面',
                '看起来我们进入了错误的链接',
            ],
            backToHome: '返回首页',
            // a11y
            openInNewWindow: '在新窗口打开',
            toggleColorMode: '切换颜色模式',
            toggleSidebar: '切换侧边栏',
        },
        '/zh-hant/': {
            // navbar
            navbar: navbarZhHant,
            selectLanguageName: '繁體中文',
            selectLanguageText: '選擇語言',
            selectLanguageAriaLabel: '選擇語言',
            // sidebar
            sidebar: sidebarZhHant,
            // page meta
            editLinkText: '在 GitHub 上編輯此頁',
            lastUpdatedText: '上次更新',
            contributorsText: '貢獻者',
            // custom containers
            tip: '提示',
            warning: '註意',
            danger: '警告',
            // 404 page
            notFound: [
                '這裏什麼都冇有',
                '我們怎麼到這來了？',
                '這是一個 404 頁麵',
                '看起來我們進入了錯誤的鏈接',
            ],
            backToHome: '返回首頁',
            // a11y
            openInNewWindow: '在新窗口打開',
            toggleColorMode: '切換顔色模式',
            toggleSidebar: '切換側邊欄',
        },
    },

    plugins: {
        mdEnhance: {
            codetabs: true,
        },
    },
});
