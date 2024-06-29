import type { NavbarConfig } from '@vuepress/theme-default'
import versions from './versions.js'

export const navbarEn: NavbarConfig = [
  {
    text: 'Book',
    link: '/book/',
  },
  {
    text: 'Middlewares',
    children: [
      {
        text: 'Common Features',
        children: [
          '/book/features/affix.md',
          '/book/features/compression.md',
          '/book/features/flash.md',
          '/book/features/force-https.md',
          '/book/features/logging.md',
          '/book/features/proxy.md',
          '/book/features/serve-static.md',
          '/book/features/session.md',
          '/book/features/sse.md',
          '/book/features/timeout.md',
          '/book/features/trailing-slash.md',
          '/book/features/websocket.md',
        ],
      },
      {
        text: 'Authentication',
        children: [
          '/book/features/basic-auth.html',
          '/book/features/jwt-auth.md',
        ],
      },
      {
        text: 'Documentation',
        children: [
          '/book/features/openapi.md',
        ],
      },
      {
        text: 'Security',
        children: [
          '/book/features/cors.md',
          '/book/features/csrf.md',
          '/book/features/rate-limiter.md',
        ],
      },
      {
        text: 'Caching',
        children: [
          '/book/features/cache.md',
          '/book/features/caching-headers.md',
        ],
      },
    ],
  },
  {
    text: 'Donate',
    link: '/donate.html',
  },
  versions,
]
