import type { SidebarConfig } from '@vuepress/theme-default'
import { coreChildren } from './core-children'
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
          text: 'Core',
          children: coreChildren('/book'),
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
