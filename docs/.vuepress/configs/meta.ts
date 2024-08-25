import { createRequire } from 'node:module'
import { fs } from '@vuepress/utils'

const require = createRequire(import.meta.url)

export default fs.readJsonSync(
  require.resolve('@vuepress/concepts/package.json')
)
