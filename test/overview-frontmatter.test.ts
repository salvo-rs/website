import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@rstest/core';

const docsRoot = join(process.cwd(), 'docs');
const locales = readdirSync(docsRoot).filter((locale) =>
  existsSync(join(docsRoot, locale, '_nav.json')),
);

for (const locale of locales) {
  for (const section of ['concepts', 'features', 'topics']) {
    test(`${locale}/${section} preserves overview frontmatter`, () => {
      const source = readFileSync(
        join(docsRoot, locale, 'guide', section, 'index.mdx'),
        'utf8',
      );
      const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);

      expect(frontmatter).not.toBeNull();
      expect(frontmatter?.[1]).toMatch(/^overview: true\s*$/m);
      expect(frontmatter?.[1]).toMatch(/^title: \S.*$/m);
    });
  }
}
