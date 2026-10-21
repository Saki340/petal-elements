/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Writes llms-full.txt: llms.txt, the guides and every
 * component doc in one file, for coding assistants that read a single file.
 * Catalog-only blocks, comments and images are left out, and API tables that
 * repeat an earlier element's (the variants of one component) are replaced by
 * a reference. Run from the repository root after
 * `npm run update-docs:components`:
 *
 *     node scripts/llms-full.js
 */

import * as fs from 'fs';

const GUIDES = [
  'docs/building-pages.md',
  'docs/motion.md',
  'docs/migrating.md',
  'docs/quick-start.md',
  'docs/expressive.md',
  'docs/theming/README.md',
  'docs/theming/color.md',
  'docs/theming/typography.md',
  'docs/theming/shape.md',
];

/** Removes what only the catalog site or the GitHub view needs. */
export function clean(markdown: string) {
  return (
    markdown
      // Blocks for the catalog only.
      .replace(/<!-- catalog-only-start -->[\s\S]*?<!-- catalog-only-end -->/g, '')
      // Comments: TOC markers, mdformat markers, catalog includes, notes.
      .replace(/<!--[\s\S]*?-->/g, '')
      // Images (their alt text can span lines) and the header image.
      .replace(/^!\[[^\]]*\]\((?:images|\.\.?)\/[^)]*\)[^\n]*$/gm, '')
      .replace(/<img[\s\S]*?>/g, '')
      .replace(/<\/?catalog-component-header[^>]*>/g, '')
      // Theming examples (the token tables above them stay).
      .replace(/^### [^\n]*[Ee]xample\n[\s\S]*?(?=\n## |\n### )/gm, '')
      // MDN links at the end of API descriptions.
      .replace(/<br>https:\/\/developer\.mozilla\.org\S*/g, '')
      // "This documentation is fully rendered on the catalog."
      .replace(/^\*\*This documentation is fully rendered[\s\S]*?\*\*\s*$/gm, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  );
}

/**
 * Replaces the API tables of an element that are the same as an earlier
 * element's on the page with a reference to that element.
 */
export function dedupeApi(markdown: string) {
  const start = markdown.indexOf('\n## API\n');
  if (start < 0) return markdown;
  const prose = markdown.slice(0, start);
  const api = markdown.slice(start);
  const seen = new Map<string, string>();
  const sections = api.split(/\n(?=### )/).map((section) => {
    const heading = section.match(/^### (\S+)/)?.[1];
    const tablesAt = section.indexOf('\n#### ');
    if (!heading || tablesAt < 0) return section;
    const tables = section.slice(tablesAt);
    const first = seen.get(tables);
    if (!first) {
      seen.set(tables, heading);
      return section;
    }
    return `${section.slice(0, tablesAt)}\n\nThe same properties, methods, events and slots as ${first}.\n`;
  });
  return `${prose}${sections.join('\n')}`;
}

/** The component docs in the order llms.txt lists them. */
export function componentDocs(llms: string) {
  const docs: string[] = [];
  for (const match of llms.matchAll(/\]\((docs\/components\/[\w-]+\.md)\)/g)) {
    if (!docs.includes(match[1])) docs.push(match[1]);
  }
  for (const file of fs.readdirSync('docs/components').sort()) {
    const path = `docs/components/${file}`;
    if (file.endsWith('.md') && !docs.includes(path)) docs.push(path);
  }
  return docs;
}

function main() {
  const llms = fs.readFileSync('llms.txt', 'utf8');
  const files = [...GUIDES, ...componentDocs(llms)];
  const parts = [
    llms.trim(),
    ...files.map((path) => {
      const doc = dedupeApi(clean(fs.readFileSync(path, 'utf8')));
      return `---\n\nFile: ${path}\n\n${doc}`;
    }),
  ];
  fs.writeFileSync('llms-full.txt', `${parts.join('\n\n')}\n`);
  console.log(`Wrote llms-full.txt (${files.length} docs)`);
}

main();
