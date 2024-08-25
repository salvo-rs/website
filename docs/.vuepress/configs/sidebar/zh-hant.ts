import type { SidebarConfig } from '@vuepress/theme-default'
import { conceptsChildren } from './concepts-children'
import { topicsChildren } from './topics-children'
import { featuresChildren } from './features-children'

export const sidebarZhHant: SidebarConfig = {
  '/zh-hant/book/': [
    {
      text: 'Book',
      children: [
        '/zh-hant/book/README.md',
        '/zh-hant/book/guide.md',
        {
          text: '核心概念',
          children: conceptsChildren('/zh-hant/book'),
        },
        {
          text: '專題講解',
          children: topicsChildren('/zh-hant/book'),
        },
        {
          text: '中間件',
          children: featuresChildren('/zh-hant/book'),
        }
      ],
    },
  ],
}
