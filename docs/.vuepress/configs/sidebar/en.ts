import type { SidebarConfig } from '@vuepress/theme-default'
import { conceptsChildren } from './concepts-children'
import { topicsChildren } from './topics-children'
import { featuresChildren } from './features-children'

export const sidebarEn: SidebarConfig = {
  '/book/': [
    {
      text: 'Book',
      children: [
        '/book/README.md',
        '/book/guide.md',
        {
          text: 'Core Concepts',
          children: conceptsChildren('/book'),
        },
        {
          text: 'Topics',
          children: topicsChildren('/book'),
        },
        {
          text: 'Middlewares',
          children: featuresChildren('/book'),
        }
      ],
    },
  ],
}
