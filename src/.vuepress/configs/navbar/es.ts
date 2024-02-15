import type { NavbarConfig } from '@vuepress/theme-default'
import versions from './versions.js'

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
          '/es/book/middlewares/affix.md',
          '/es/book/middlewares/compression.md',
          '/es/book/middlewares/flash.md',
          '/es/book/middlewares/force-https.md',
          '/es/book/middlewares/logging.md',
          '/es/book/middlewares/proxy.md',
          '/es/book/middlewares/serve-static.md',
          '/es/book/middlewares/session.md',
          '/es/book/middlewares/sse.md',
          '/es/book/middlewares/timeout.md',
          '/es/book/middlewares/trailing-slash.md',
          '/es/book/middlewares/websocket.md',
        ],
      },
      {
        text: 'Authenticación',
        children: [
          '/es/book/middlewares/basic-auth.html',
          '/es/book/middlewares/jwt-auth.md',
        ],
      },
      {
        text: 'Documentación',
        children: [
          '/es/book/middlewares/openapi.md',
        ],
      },
      {
        text: 'Seguridad',
        children: [
          '/es/book/middlewares/cors.md',
          '/es/book/middlewares/csrf.md',
          '/es/book/middlewares/rate-limiter.md',
        ],
      },
      {
        text: 'Capturador',
        children: [
          '/es/book/middlewares/cache.md',
          '/es/book/middlewares/caching-headers.md',
        ],
      },
    ],
  },
  {
    text: 'Donar',
    link: '/es/donate.html',
  },
  versions,
]
