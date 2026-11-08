/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Moves between the pages of the catalog without reloading: the
 * next page is fetched, its content replaces the current content, and
 * `transitionPage()` animates the change. Anything it cannot do falls back to
 * a normal navigation.
 */

import {
  transitionPage,
  type PageTransitionOptions,
} from 'petal-elements/motion/page-transition.js';

import type {NavDrawer} from '../components/nav-drawer.js';
import {drawerOpenSignal} from '../signals/drawer-open-state.js';

import {base} from './base.js';

/** Fires on `window` after the content of the page has been replaced. */
export const PAGE_CHANGE = 'catalog-page-change';

/**
 * Parses a page, with its declarative shadow roots. Not parseHTMLUnsafe(),
 * which drops the comments that Lit hydrates from.
 */
function parsePage(html: string) {
  const page = document.implementation.createHTMLDocument('');
  page.documentElement.setHTMLUnsafe(html);
  return page;
}

// Only a newer navigation may change the page.
let latest = 0;
let current = new URL(location.href);

function isPage(url: URL) {
  return (
    url.origin === location.origin &&
    url.pathname.startsWith(base) &&
    url.pathname.endsWith('/') &&
    !url.pathname.includes('/stories/') &&
    !url.pathname.includes('/assets/')
  );
}

function navPaths() {
  return Array.from(
    document.querySelectorAll('nav.nav petal-list-item[href]'),
    (item) => new URL(item.getAttribute('href')!, location.href).pathname,
  );
}

/** Pages next to each other in the navigation slide; others fade. */
function typeBetween(from: URL, to: URL, back: boolean) {
  const paths = navPaths();
  const fromIndex = paths.indexOf(from.pathname);
  const toIndex = paths.indexOf(to.pathname);
  const siblings =
    fromIndex >= 0 &&
    toIndex >= 0 &&
    from.pathname.includes('/components/') &&
    to.pathname.includes('/components/');
  if (!siblings) return 'fade';
  if (back) return 'back';
  return toIndex > fromIndex ? 'forward' : 'back';
}

const header = () =>
  document.querySelector('#main-content catalog-component-header') ??
  document.querySelector('#main-content h1');

/** The options of a transition from the overview card to its page, and back. */
function transitionOptions(
  from: URL,
  to: URL,
  card: Element | null,
  back: boolean,
): PageTransitionOptions {
  const slug = from.pathname.split('/').filter(Boolean).at(-1);
  const overview = `${base}components/`;
  if (card) {
    return {
      type: 'container',
      from: {
        container: card.querySelector('.thumb'),
        title: card.querySelector('.card-name'),
      },
      to: () => ({
        container: header(),
        title: document.querySelector('#main-content h1'),
      }),
    };
  }
  if (back && to.pathname === overview && from.pathname.includes('/components/')) {
    return {
      type: 'container',
      from: {
        container: header(),
        title: document.querySelector('#main-content h1'),
      },
      to: () => {
        const target = document.querySelector(`.card[data-slug="${slug}"]`);
        target?.scrollIntoView({block: 'center'});
        return {
          container: target?.querySelector('.thumb'),
          title: target?.querySelector('.card-name'),
        };
      },
    };
  }
  return {type: typeBetween(from, to, back), page: '#main-content'};
}

// Direct children only: in a parsed page, <noscript> holds real elements.
const STYLES = ':scope > link[rel="stylesheet"]';

const sheetUrl = (link: Element) => (link as HTMLLinkElement).href;

/** Loads the styles and page scripts of the next page. */
async function loadAssets(next: Document) {
  const present = new Set(
    Array.from(document.head.querySelectorAll(STYLES), sheetUrl),
  );
  const links = Array.from(
    next.head.querySelectorAll<HTMLLinkElement>(STYLES),
  ).filter((link) => !present.has(new URL(link.getAttribute('href')!, location.href).href));
  await Promise.all([
    ...links.map(
      (link) =>
        new Promise<void>((resolve, reject) => {
          const copy = document.createElement('link');
          copy.rel = 'stylesheet';
          copy.href = new URL(link.getAttribute('href')!, location.href).href;
          copy.onload = () => {
            resolve();
          };
          copy.onerror = reject;
          document.head.append(copy);
        }),
    ),
    ...Array.from(
      next.head.querySelectorAll('script[type="module"][src]'),
      (script) =>
        import(new URL(script.getAttribute('src')!, location.href).href),
    ),
  ]);
}

/** Drops the stylesheets that only the previous page used. */
function removeStaleStyles(next: Document) {
  const wanted = new Set(
    Array.from(
      next.head.querySelectorAll(STYLES),
      (link) => new URL(link.getAttribute('href')!, location.href).href,
    ),
  );
  for (const link of document.head.querySelectorAll(STYLES)) {
    if (!wanted.has(sheetUrl(link))) link.remove();
  }
}

function setMeta(next: Document, selector: string, attribute: string) {
  const value = next.querySelector(selector)?.getAttribute(attribute);
  if (value != null) {
    document.querySelector(selector)?.setAttribute(attribute, value);
  }
}

function updateNavigation(url: URL) {
  for (const item of document.querySelectorAll<HTMLElement & {selected: boolean}>(
    'nav.nav petal-list-item[href]',
  )) {
    const selected =
      new URL(item.getAttribute('href')!, location.href).pathname === url.pathname;
    item.toggleAttribute('selected', selected);
    if (selected) (item.closest('details') as HTMLDetailsElement | null)?.setAttribute('open', '');
  }
}

/** Replaces the content of the page with that of `next`. */
function swap(next: Document, url: URL) {
  const main = document.querySelector('#main-content')!;
  const nextMain = next.querySelector('#main-content')!;
  main.replaceWith(document.adoptNode(nextMain));

  const drawer = document.querySelector('nav-drawer') as NavDrawer;
  const nextDrawer = next.querySelector('nav-drawer')!;
  drawer.querySelector('section[slot="toc"]')?.remove();
  const toc = nextDrawer.querySelector('section[slot="toc"]');
  if (toc) drawer.append(document.adoptNode(toc));
  drawer.hasToc = nextDrawer.hasAttribute('has-toc');
  drawer.pageTitle = nextDrawer.getAttribute('page-title') ?? '';

  document.title = next.title;
  setMeta(next, 'meta[name="description"]', 'content');
  setMeta(next, 'link[rel="canonical"]', 'href');
  removeStaleStyles(next);
  updateNavigation(url);

  drawer.scrollContentToTop();
  if (url.hash) {
    document.getElementById(decodeURIComponent(url.hash.slice(1)))?.scrollIntoView();
  }
  (document.querySelector('#main-content') as HTMLElement).focus({
    preventScroll: true,
  });
  window.dispatchEvent(new Event(PAGE_CHANGE));
}

interface NavigateOptions {
  /** Adds a history entry. False when going through the history. */
  push?: boolean;
  /** Going back through the history. */
  back?: boolean;
  /** The card of the components page that was clicked. */
  card?: Element | null;
}

/** Goes to a page of the site. */
export async function navigateTo(
  url: URL,
  {push = true, back = false, card = null}: NavigateOptions = {},
) {
  const id = ++latest;
  const from = current;
  let next: Document;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${response.status}`);
    next = parsePage(await response.text());
    if (!next.querySelector('#main-content')) throw new Error('Not a page');
    await loadAssets(next);
  } catch {
    location.href = url.href;
    return;
  }
  if (id !== latest) return;

  drawerOpenSignal.value = false;
  current = url;
  if (push) history.pushState(null, '', url);
  await transitionPage(
    () => {
      swap(next, url);
    },
    transitionOptions(from, url, card, back),
  ).catch(() => {
    // A newer transition stopped this one; its content is already replaced.
  });
}

function onClick(event: MouseEvent) {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return;
  }
  const anchor = event
    .composedPath()
    .find((target) => target instanceof HTMLAnchorElement) as
    | HTMLAnchorElement
    | undefined;
  if (!anchor?.href || anchor.hasAttribute('download')) return;
  if (anchor.target && anchor.target !== '_self') return;

  const url = new URL(anchor.href);
  if (!isPage(url)) return;
  // A link to a heading on this page is left to the browser.
  if (url.pathname === location.pathname && url.hash) return;

  event.preventDefault();
  void navigateTo(url, {card: anchor.closest('.card')});
}

function onPopState() {
  const url = new URL(location.href);
  if (url.pathname === current.pathname) {
    current = url;
    return;
  }
  void navigateTo(url, {push: false, back: true});
}

/** Starts handling the links of the site, where the browser allows it. */
export function startRouter() {
  if (!('setHTMLUnsafe' in Element.prototype)) return;
  document.addEventListener('click', onClick);
  window.addEventListener('popstate', onPopState);
}
