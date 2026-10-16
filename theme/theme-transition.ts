/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  springEasing,
  springFromCss,
  SLOW_SPATIAL,
} from '../internal/motion/spring.js';

/** Where the new theme starts: a pointer event, an element or a point. */
export type ThemeTransitionOrigin = Event | Element | {x: number; y: number};

/** The class on <html> while a theme transition runs. */
const ACTIVE = 'petal-theme-transition';

// Only while our transition runs: no cross-fade, the new page is revealed
// by the circle instead.
const STYLE = `
:root.${ACTIVE}::view-transition-old(root),
:root.${ACTIVE}::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}`;

let styleAdded = false;

function addStyle() {
  if (styleAdded) return;
  styleAdded = true;
  const style = document.createElement('style');
  style.textContent = STYLE;
  document.head.append(style);
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
 * The circle grows on the slow spatial spring of the page's motion scheme
 * (`--md-sys-motion-spring-slow-spatial-damping` and `-stiffness`), so it
 * bounces with the expressive scheme. Without View Transitions, or with
 * `prefers-reduced-motion`, the theme just changes.
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
  // To the farthest corner of the viewport.
  const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  const root = document.documentElement;
  const timing = springEasing(springFromCss(root, 'slow-spatial', SLOW_SPATIAL));

  root.classList.add(ACTIVE);
  const transition = document.startViewTransition(apply);
  try {
    await transition.ready;
    root.animate(
      {clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`]},
      {...timing, pseudoElement: '::view-transition-new(root)'},
    );
    await transition.finished;
  } catch {
    // The transition was skipped; the theme has still changed.
  } finally {
    root.classList.remove(ACTIVE);
  }
}
