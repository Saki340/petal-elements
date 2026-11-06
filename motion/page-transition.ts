/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Transitions between the views of a page, with the View
 * Transitions API and the springs the components move on. See docs/motion.md.
 */

import {springEasing, springFromCss} from '../internal/motion/spring.js';
import {
  finishViewTransition,
  isRunning,
  startViewTransitionRun,
  stopViewTransition,
} from '../internal/motion/view-transition.js';

/**
 * How the views change:
 *
 * - `fade`: the old view fades out, the new one fades in and grows from 92%.
 *   Between views that are not related, such as top-level destinations.
 * - `forward`, `back`: the shared X axis. Views slide 30px and fade, for steps
 *   of a flow.
 * - `container`: an element grows into the new view, or shrinks back.
 */
export type PageTransitionType = 'fade' | 'forward' | 'back' | 'container';

/** The elements that move in a `container` transition, on one side of it. */
export interface PageTransitionElements {
  /** The card or the detail view: what grows or shrinks. */
  container?: Element | null;
  /**
   * An image in it: it stays visible all the way, covering its box. Its corners
   * are its own, or the container's where it sits in the container's corners.
   */
  media?: Element | null;
  /** A title in it: the old and the new text overlap only briefly. */
  title?: Element | null;
}

/** Options of `transitionPage()`. */
export interface PageTransitionOptions {
  /** How the views change. The default is `fade`. */
  type?: PageTransitionType;
  /**
   * The part of the page that changes, so that bars around it stay in place:
   * a selector, an element, or a function that returns one. It is looked up
   * before and after `update`, so the element can be replaced. The default is
   * the whole page. Not used by `container`.
   */
  page?: string | Element | (() => Element | null);
  /** `container`: the elements before `update`. */
  from?: PageTransitionElements;
  /** `container`: the elements after `update`. A function runs after it. */
  to?: PageTransitionElements | (() => PageTransitionElements);
}

/** On <html> while a page transition runs, with its type as the value. */
const ACTIVE = 'data-petal-page-transition';

// The springs, as read from the page when the transition starts.
const SPATIAL = '--petal-page-transition-spatial';
const SPATIAL_DURATION = '--petal-page-transition-spatial-duration';
const EFFECTS_DURATION = '--petal-page-transition-effects-duration';

// The corners of the container and the media, before and after the update.
const radius = (element: 'container' | 'media', side: 'from' | 'to') =>
  `--petal-page-${element}-radius-${side}`;

const PAGE = 'petal-page';
const CONTAINER = 'petal-page-container';
const MEDIA = 'petal-page-media';
const TITLE = 'petal-page-title';

// Corners of a snapshot that was cut by a parent, or that `cover` crops, are
// square: the image pair clips them again, moving with the box.
const corners = (element: 'container' | 'media') => `
@keyframes petal-page-${element}-radius {
  from { border-radius: var(${radius(element, 'from')}, var(${radius(element, 'to')}, 0px)); }
  to { border-radius: var(${radius(element, 'to')}, var(${radius(element, 'from')}, 0px)); }
}`;

const spatial = (delay = '0ms') => `var(${SPATIAL_DURATION}) var(${SPATIAL}) ${delay} both`;

// Position and size follow the spatial spring; fades are linear and short.
const STYLE = `
:root[${ACTIVE}]::view-transition-group(*) {
  animation-duration: var(${SPATIAL_DURATION});
  animation-timing-function: var(${SPATIAL});
}
:root[${ACTIVE}]::view-transition-old(*),
:root[${ACTIVE}]::view-transition-new(*) {
  animation-duration: var(${EFFECTS_DURATION});
  animation-timing-function: linear;
}

:root[${ACTIVE}=fade]::view-transition-old(${PAGE}) {
  animation: petal-page-out 90ms linear both;
}
:root[${ACTIVE}=fade]::view-transition-new(${PAGE}) {
  animation: petal-page-in 210ms linear 90ms both,
    petal-page-grow ${spatial('60ms')};
}

:root[${ACTIVE}=forward]::view-transition-old(${PAGE}) {
  animation: petal-page-out 90ms linear both,
    petal-page-to-start ${spatial()};
}
:root[${ACTIVE}=forward]::view-transition-new(${PAGE}) {
  animation: petal-page-in 210ms linear 90ms both,
    petal-page-from-end ${spatial()};
}
:root[${ACTIVE}=back]::view-transition-old(${PAGE}) {
  animation: petal-page-out 90ms linear both,
    petal-page-to-end ${spatial()};
}
:root[${ACTIVE}=back]::view-transition-new(${PAGE}) {
  animation: petal-page-in 210ms linear 90ms both,
    petal-page-from-start ${spatial()};
}

:root[${ACTIVE}]::view-transition-image-pair(${CONTAINER}) {
  overflow: clip;
  animation: petal-page-container-radius ${spatial()};
}
:root[${ACTIVE}]::view-transition-image-pair(${MEDIA}) {
  overflow: clip;
  animation: petal-page-media-radius ${spatial()};
}
:root[${ACTIVE}]::view-transition-old(${CONTAINER}),
:root[${ACTIVE}]::view-transition-new(${CONTAINER}) {
  height: 100%;
  object-fit: cover;
  object-position: top;
}
:root[${ACTIVE}]::view-transition-old(${CONTAINER}) {
  animation: petal-page-out 100ms linear both;
}
:root[${ACTIVE}]::view-transition-new(${CONTAINER}) {
  animation: petal-page-in 200ms linear 60ms both;
}
:root[${ACTIVE}]::view-transition-old(${MEDIA}),
:root[${ACTIVE}]::view-transition-new(${MEDIA}) {
  height: 100%;
  object-fit: cover;
}
:root[${ACTIVE}]::view-transition-old(${MEDIA}) {
  animation: petal-page-out 60ms linear both;
}
:root[${ACTIVE}]::view-transition-new(${MEDIA}) {
  animation: none;
}
:root[${ACTIVE}]::view-transition-old(${TITLE}) {
  animation: petal-page-out 80ms linear both;
}
:root[${ACTIVE}]::view-transition-new(${TITLE}) {
  animation: petal-page-in 150ms linear 40ms both;
}

@keyframes petal-page-out { to { opacity: 0; } }
@keyframes petal-page-in { from { opacity: 0; } }
@keyframes petal-page-grow { from { transform: scale(0.92); } }
@keyframes petal-page-to-start { to { transform: translateX(-30px); } }
@keyframes petal-page-to-end { to { transform: translateX(30px); } }
@keyframes petal-page-from-start { from { transform: translateX(-30px); } }
@keyframes petal-page-from-end { from { transform: translateX(30px); } }
${corners('container')}
${corners('media')}`;

let styleAdded = false;

function addStyle() {
  if (styleAdded) return;
  styleAdded = true;
  const style = document.createElement('style');
  style.textContent = STYLE;
  document.head.append(style);
}

/** Sets `view-transition-name`s, and puts back what was there. */
class Names {
  private readonly named: Array<[ElementCSSInlineStyle, string]> = [];

  set(element: Element | null | undefined, name: string) {
    if (!element) return;
    const {style} = element as Element & ElementCSSInlineStyle;
    this.named.push([element as Element & ElementCSSInlineStyle, style.viewTransitionName]);
    style.viewTransitionName = name;
  }

  clear() {
    for (const [{style}, name] of this.named.splice(0)) {
      style.viewTransitionName = name;
    }
  }
}

const CORNERS = [
  ['borderTopLeftRadius', 'left', 'top'],
  ['borderTopRightRadius', 'right', 'top'],
  ['borderBottomRightRadius', 'right', 'bottom'],
  ['borderBottomLeftRadius', 'left', 'bottom'],
] as const;

/**
 * The corners `element` looks like it has, as a `border-radius`: its own, or,
 * where it sits in a corner of `container`, the container's, which cuts it.
 */
function cornersOf(element: Element, container?: Element | null) {
  const own = getComputedStyle(element);
  const outer = container && getComputedStyle(container);
  const box = element.getBoundingClientRect();
  const outerBox = container?.getBoundingClientRect();
  return CORNERS.map(([corner, x, y]) => {
    // An elliptical corner computes to two lengths; the first is close enough.
    const value = own[corner].split(' ')[0];
    if (parseFloat(value) > 0 || !outer || !outerBox) return value;
    const inCorner =
      Math.abs(box[x] - outerBox[x]) <= 1 && Math.abs(box[y] - outerBox[y]) <= 1;
    return inCorner ? outer[corner].split(' ')[0] : value;
  }).join(' ');
}

function pageElement(page: PageTransitionOptions['page']) {
  if (page === undefined) return document.documentElement;
  if (typeof page === 'string') return document.querySelector(page);
  return typeof page === 'function' ? page() : page;
}

/** Right to left, forward goes the other way along the X axis. */
function mirrored(type: PageTransitionType) {
  if (type === 'forward') return 'back';
  return type === 'back' ? 'forward' : type;
}

/**
 * Changes the view with a transition (View Transitions API). `update` changes
 * the page and may be async, for example a router's render. Position and size
 * follow the default spatial spring of the page's motion scheme, and fades are
 * linear and short.
 *
 * A new transition skips the running one, and so does `transitionTheme()`.
 * Without View Transitions, or with `prefers-reduced-motion`, `update` just
 * runs. Elements with a `view-transition-name` of their own move on the same
 * spring.
 *
 * Resolves when the transition has finished, and rejects if `update` does.
 *
 * @example
 * ```js
 * transitionPage(() => showStep(2), {type: 'forward', page: 'main'});
 * ```
 */
export async function transitionPage(
  update: () => void | Promise<void>,
  options: PageTransitionOptions = {},
): Promise<void> {
  const {type = 'fade', page, from, to} = options;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!document.startViewTransition || reduced) {
    await update();
    return;
  }

  addStyle();
  stopViewTransition();

  const root = document.documentElement;
  const names = new Names();
  const setContainerNames = (side: 'from' | 'to', elements?: PageTransitionElements) => {
    const {container, media, title} = elements ?? {};
    names.set(container, CONTAINER);
    names.set(media, MEDIA);
    names.set(title, TITLE);
    if (container) {
      root.style.setProperty(radius('container', side), cornersOf(container));
    }
    if (media) {
      root.style.setProperty(radius('media', side), cornersOf(media, container));
    }
  };

  const spring = springEasing(springFromCss(root, 'default-spatial'));
  const effects = springEasing(springFromCss(root, 'default-effects'));
  root.setAttribute(ACTIVE, getComputedStyle(root).direction === 'rtl' ? mirrored(type) : type);
  root.style.setProperty(SPATIAL, spring.easing);
  root.style.setProperty(SPATIAL_DURATION, `${spring.duration}ms`);
  root.style.setProperty(EFFECTS_DURATION, `${effects.duration}ms`);
  if (type === 'container') setContainerNames('from', from);
  else names.set(pageElement(page), PAGE);

  const run = startViewTransitionRun(
    async () => {
      await update();
      // The old element may still be on the page, and a name can only be on
      // one element.
      names.clear();
      // Stopped by a newer transition, which owns the page now.
      if (!isRunning(run)) return;
      if (type === 'container') {
        setContainerNames('to', typeof to === 'function' ? to() : to);
      } else {
        names.set(pageElement(page), PAGE);
      }
    },
    () => {
      names.clear();
      root.removeAttribute(ACTIVE);
      root.style.removeProperty(SPATIAL);
      root.style.removeProperty(SPATIAL_DURATION);
      root.style.removeProperty(EFFECTS_DURATION);
      for (const element of ['container', 'media'] as const) {
        root.style.removeProperty(radius(element, 'from'));
        root.style.removeProperty(radius(element, 'to'));
      }
    },
  );
  try {
    await run.transition.finished;
  } finally {
    finishViewTransition(run);
  }
}
