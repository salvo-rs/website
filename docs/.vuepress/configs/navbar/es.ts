import type { NavbarConfig } from '@vuepress/theme-default'
// import versions from './versions.js'

export const navbarEs: NavbarConfig = [
  {
    text: 'Libro',
    link: '/es/book/',
  },
  {
    text: 'Middlewares',
    children: [
      {
        text: 'Características Comunes',
        children: [
          '/es/book/features/affix-state.md',
          '/es/book/features/catch-panic.md',
          '/es/book/features/compression.md',
          '/es/book/features/flash.md',
          '/es/book/features/force-https.md',
          '/es/book/features/logging.md',
          '/es/book/features/open-telemetry.md',
          '/es/book/features/proxy.md',
          '/es/book/features/request-id.md',
          '/es/book/features/serve-static.md',
          '/es/book/features/session.md',
          '/es/book/features/sse.md',
          '/es/book/features/timeout.md',
          '/es/book/features/tower-compat.md',
          '/es/book/features/trailing-slash.md',
          '/es/book/features/websocket.md',
        ],
      },
      {
        text: 'Authenticación',
        children: [
          '/es/book/features/basic-auth.html',
          '/es/book/features/jwt-auth.md',
        ],
      },
      {
        text: 'Documentación',
        children: [
          '/es/book/features/openapi.md',
        ],
      },
      {
        text: 'Seguridad',
        children: [
          '/es/book/features/concurrency-limiter.md',
          '/es/book/features/cors.md',
          '/es/book/features/csrf.md',
          '/es/book/features/rate-limiter.md',
        ],
      },
      {
        text: 'Capturador',
        children: [
          '/es/book/features/cache.md',
          '/es/book/features/caching-headers.md',
        ],
      },
    ],
  },
  {
    text: 'Donar',
    link: '/es/donate.html',
  },
  // versions,
]
