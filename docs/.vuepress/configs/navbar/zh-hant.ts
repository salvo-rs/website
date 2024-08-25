import type { NavbarConfig } from '@vuepress/theme-default'
// import versions from './versions.js'

export const navbarZhHant: NavbarConfig = [
  {
    text: '開發指南',
    link: '/zh-hant/book/',
  },
  {
    text: '功能大全',
    children: [
      {
        text: '常用功能',
        children: [
          '/zh-hant/book/features/affix-state.md',
          '/zh-hant/book/features/catch-panic.md',
          '/zh-hant/book/features/compression.md',
          '/zh-hant/book/features/flash.md',
          '/zh-hant/book/features/force-https.md',
          '/zh-hant/book/features/logging.md',
          '/zh-hant/book/features/open-telemetry.md',
          '/zh-hant/book/features/proxy.md',
          '/zh-hant/book/features/request-id.md',
          '/zh-hant/book/features/serve-static.md',
          '/zh-hant/book/features/session.md',
          '/zh-hant/book/features/sse.md',
          '/zh-hant/book/features/timeout.md',
          '/zh-hant/book/features/tower-compat.md',
          '/zh-hant/book/features/trailing-slash.md',
          '/zh-hant/book/features/websocket.md',
        ],
      },
      {
        text: '用戶驗證',
        children: [
          '/zh-hant/book/features/basic-auth.md',
          '/zh-hant/book/features/jwt-auth.md',
        ],
      },
      {
        text: '文檔協作',
        children: [
          '/zh-hant/book/features/openapi.md',
        ],
      },
      {
        text: '安全防護',
        children: [
          '/zh-hant/book/features/concurrency-limiter.md',
          '/zh-hant/book/features/cors.md',
          '/zh-hant/book/features/csrf.md',
          '/zh-hant/book/features/rate-limiter.md',
        ],
      },
      {
        text: '數據緩存',
        children: [
          '/zh-hant/book/features/cache.md',
          '/zh-hant/book/features/caching-headers.md',
        ],
      },
    ],
  },
  {
    text: '文檔參考',
    link: 'https://docs.rs/salvo/latest/salvo/',
  },
  {
    text: '資助項目',
    link: '/zh-hant/donate.html',
  },
  {
    text: 'Gitee',
    link: 'https://gitee.com/salvo-rs/salvo',
  },
  // versions,
]
