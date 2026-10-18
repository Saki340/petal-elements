/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  SLOW_SPATIAL,
  Spring,
  springFromCss,
  type SpringSpec,
} from '../internal/motion/spring.js';

/** Where the new theme starts: a pointer event, an element or a point. */
export type ThemeTransitionOrigin = Event | Element | {x: number; y: number};

/** The class on <html> while a theme transition runs. */
const ACTIVE = 'petal-theme-transition';

/** Width of the circle's soft edge, from opaque to transparent. */
const SOFT_EDGE = 320;

// The circle's center and outer radius; the radius is animated, so it is
// registered as a length.
const X = '--petal-theme-transition-x';
const Y = '--petal-theme-transition-y';
const RADIUS = '--petal-theme-transition-radius';

// Only while our transition runs: no cross-fade, the new page is revealed
// by a circle with a soft edge instead.
const STYLE = `
:root.${ACTIVE}::view-transition-old(root),
:root.${ACTIVE}::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}
:root.${ACTIVE}::view-transition-new(root) {
  mask-image: radial-gradient(circle at var(${X}) var(${Y}),
    #000 calc(var(${RADIUS}) - ${SOFT_EDGE}px), transparent var(${RADIUS}));
}`;

let styleAdded = false;

function addStyle() {
  if (styleAdded) return;
  styleAdded = true;
  try {
    CSS.registerProperty({name: RADIUS, syntax: '<length>', inherits: false, initialValue: '0px'});
  } catch {
    // Already registered, for example by another copy of this module.
  }
  const style = document.createElement('style');
  style.textContent = STYLE;
  document.head.append(style);
}

/**
 * The spring's progress from 0 to 1, one value per 60fps frame, up to its
 * highest point, scaled so that point is 1: the circle slows down to a stop
 * as it reaches the corner, and does not bounce back.
 */
function reveal(spec: SpringSpec) {
  const spring = new Spring(spec);
  spring.target = 1;
  const values = [0];
  while (values.length < 600) {
    spring.step(1000 / 60);
    // Past the highest point: it would come back from here.
    if (spring.velocity <= 0 && values.length > 1) break;
    values.push(spring.value);
    if (spring.atRest) break;
  }
  const peak = values[values.length - 1];
  return values.map((value) => value / peak);
}

/** The center of the circle, in viewport coordinates. */
function pointOf(origin: ThemeTransitionOrigin | undefined) {
  if (origin && 'x' in origin && 'y' in origin && !(origin instanceof Event)) {
    return origin;
  }
  if (origin instanceof MouseEvent && (origin.clientX || origin.clientY)) {
    return {x: origin.clientX, y: origin.clientY};
  }
  // A keyboard click has no position: use the center of its target.
  const element =
    origin instanceof Element
      ? origin
      : origin instanceof Event && origin.target instanceof Element
        ? origin.target
        : null;
  if (element) {
    const rect = element.getBoundingClientRect();
    return {x: rect.left + rect.width / 2, y: rect.top + rect.height / 2};
  }
  return {x: innerWidth / 2, y: innerHeight / 2};
}

/**
 * Changes the theme with a circle that grows from `origin` until it covers the
 * page, revealing the new theme (View Transitions API). `apply` changes the
 * theme, for example by setting `color-scheme` or a class on `<html>`.
 *
 * The circle has a 320px soft edge and is sized to the viewport: it stops
 * when its opaque part reaches the corner farthest from `origin`. It grows on
 * the slow spatial spring of the page's motion scheme
 * (`--md-sys-motion-spring-slow-spatial-damping` and `-stiffness`), so it
 * slows down as it reaches that corner, without bouncing back. Without View
 * Transitions, or with `prefers-reduced-motion`, the theme just changes.
 *
 * Resolves when the transition has finished.
 */
export async function transitionTheme(
  apply: () => void | Promise<void>,
  origin?: ThemeTransitionOrigin,
): Promise<void> {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!document.startViewTransition || reduced) {
    await apply();
    return;
  }

  addStyle();
  const {x, y} = pointOf(origin);
  const root = document.documentElement;
  // The opaque part reaches the farthest corner of the viewport.
  const corner = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  const radius = corner + SOFT_EDGE;
  const values = reveal(springFromCss(root, 'slow-spatial', SLOW_SPATIAL));

  root.classList.add(ACTIVE);
  root.style.setProperty(X, `${x}px`);
  root.style.setProperty(Y, `${y}px`);
  const transition = document.startViewTransition(apply);
  try {
    await transition.ready;
    root.animate(
      {[RADIUS]: values.map((value) => `${value * radius}px`)},
      {
        duration: ((values.length - 1) * 1000) / 60,
        easing: 'linear',
        // Kept until the transition finishes: back at 0px, the soft edge
        // would hide the new page for a frame.
        fill: 'forwards',
        pseudoElement: '::view-transition-new(root)',
      },
    );
    await transition.finished;
  } catch {
    // The transition was skipped; the theme has still changed.
  } finally {
    root.classList.remove(ACTIVE);
    root.style.removeProperty(X);
    root.style.removeProperty(Y);
  }
}
