import type { SidebarConfig } from '@vuepress/theme-default'
import { coreChildren } from './core-children'
import { topicsChildren } from './topics-children'
import { featuresChildren } from './features-children'

export const sidebarEs: SidebarConfig = {
  '/es/book/': [
    {
      text: 'Libro',
      children: [
        '/es/book/README.md',
        '/es/book/guide.md',
        {
          text: 'Base',
          children: coreChildren('/es/book'),
        },
        {
          text: 'Tópicos',
          children: topicsChildren('/es/book'),
        },
        {
          text: 'Middlewares',
          children: featuresChildren('/es/book'),
        }
      ],
    },
  ],
}
