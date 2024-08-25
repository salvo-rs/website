import type { SidebarConfig } from '@vuepress/theme-default'
import { conceptsChildren } from './concepts-children'
import { topicsChildren } from './topics-children'
import { featuresChildren } from './features-children'

export const sidebarZhHans: SidebarConfig = {
  '/zh-hans/book/': [
    {
      text: 'Book',
      children: [
        '/zh-hans/book/README.md',
        '/zh-hans/book/guide.md',
        {
          text: '核心概念',
          children: conceptsChildren('/zh-hans/book'),
        },
        {
          text: '专题讲解',
          children: topicsChildren('/zh-hans/book'),
        },
        {
          text: '功能大全',
          children: featuresChildren('/zh-hans/book'),
        }
      ],
    },
  ],
}
