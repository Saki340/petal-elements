/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * The base path of the site, such as `/catalog/`. The build only rewrites URLs
 * in the HTML, so URLs that scripts make must go through `withBase()`.
 */
export const base =
  document
    .querySelector('meta[name="catalog-base"]')
    ?.getAttribute('content') || '/';

/** The site URL of a root-relative path such as `/components/button/`. */
export function withBase(path: string) {
  return base + path.replace(/^\//, '');
}
