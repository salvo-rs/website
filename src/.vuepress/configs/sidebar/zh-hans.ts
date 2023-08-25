import type { SidebarConfig } from '@vuepress/theme-default'
import { coreChildren } from './core-children'
import { topicsChildren } from './topics-children'
import { middlewaresChildren } from './middlewares-children'

export const sidebarZhHans: SidebarConfig = {
  '/zh-hans/book/': [
    {
      text: 'Book',
      children: [
        '/zh-hans/book/README.html',
        '/zh-hans/book/guide.html',
        {
          text: '核心功能',
          children: coreChildren('/zh-hans/book'),
        },
        {
          text: '专题讲解',
          children: topicsChildren('/zh-hans/book'),
        },
        {
          text: '中间件',
          children: middlewaresChildren('/zh-hans/book'),
        }
      ],
    },
  ],
}
