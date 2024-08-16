import type { NavbarConfig } from '@vuepress/theme-default'
import versions from './versions.js'

export const navbarZhHans: NavbarConfig = [
  {
    text: '入门指南',
    link: '/zh-hans/book/',
  },
  {
    text: '主要功能',
    children: [
      {
        text: '常用功能',
        children: [
          '/zh-hans/book/features/affix-state.md',
          '/zh-hans/book/features/compression.md',
          '/zh-hans/book/features/flash.md',
          '/zh-hans/book/features/force-https.md',
          '/zh-hans/book/features/logging.md',
          '/zh-hans/book/features/proxy.md',
          '/zh-hans/book/features/serve-static.md',
          '/zh-hans/book/features/session.md',
          '/zh-hans/book/features/sse.md',
          '/zh-hans/book/features/timeout.md',
          '/zh-hans/book/features/trailing-slash.md',
          '/zh-hans/book/features/websocket.md',
        ],
      },
      {
        text: '用户验证',
        children: [
          '/zh-hans/book/features/basic-auth.md',
          '/zh-hans/book/features/jwt-auth.md',
        ],
      },
      {
        text: '文档协作',
        children: [
          '/zh-hans/book/features/openapi.md',
        ],
      },
      {
        text: '安全防护',
        children: [
          '/zh-hans/book/features/cors.md',
          '/zh-hans/book/features/csrf.md',
          '/zh-hans/book/features/rate-limiter.md',
        ],
      },
      {
        text: '数据缓存',
        children: [
          '/zh-hans/book/features/cache.md',
          '/zh-hans/book/features/caching-headers.md',
        ],
      },
    ],
  },
  {
    text: '资助项目',
    link: '/zh-hans/donate.html',
  },
  {
    text: 'Gitee',
    link: 'https://gitee.com/salvo-rs/salvo',
  },
  versions,
]
