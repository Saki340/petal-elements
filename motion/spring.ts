/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The springs the components move on, for your own animations:
 * the motion schemes' springs as values, as CSS easings and through the Web
 * Animations API, and a spring you drive yourself for motion that follows a
 * drag or must keep its speed when its target changes. See docs/motion.md.
 */

import {
  EXPRESSIVE,
  STANDARD,
  springEasing,
  springFromCss,
  type MotionSchemeSprings,
  type SpringName,
  type SpringSpec,
} from '../internal/motion/spring.js';

export {Spring, springEasing, springFromCss} from '../internal/motion/spring.js';
export type {
  MotionSchemeSprings,
  SpringEasing,
  SpringName,
  SpringSpec,
} from '../internal/motion/spring.js';

/**
 * The expressive motion scheme's springs (Jetpack Compose
 * `MotionScheme.expressive()`): spatial springs overshoot a little. The
 * default.
 */
export const expressiveSprings: MotionSchemeSprings = EXPRESSIVE;

/**
 * The standard motion scheme's springs (Jetpack Compose
 * `MotionScheme.standard()`): calmer, almost without overshoot.
 */
export const standardSprings: MotionSchemeSprings = STANDARD;

/**
 * Animates `element` with the Web Animations API on a spring: the page's
 * spring of that name (following its motion scheme, read from the element's
 * `--md-sys-motion-spring-*` properties), or a spring of your own. The
 * duration is the time the spring takes to settle, and the easing is the
 * spring's curve. With reduced motion, the animation jumps to its end.
 *
 * `options` go to `element.animate()` and win over the spring's duration and
 * easing. Like any Web Animation, it does not keep its end state after it
 * finishes unless you set it (set the final style yourself, or pass
 * `fill: 'forwards'`).
 *
 * @example
 * ```js
 * panel.style.translate = '0 0';
 * animateSpring(panel, {translate: ['0 100%', '0 0']}, 'default-spatial');
 * ```
 */
export function animateSpring(
  element: Element,
  keyframes: Keyframe[] | PropertyIndexedKeyframes,
  spring: SpringName | SpringSpec = 'default-spatial',
  options: KeyframeAnimationOptions = {},
): Animation {
  const spec = typeof spring === 'string' ? springFromCss(element, spring) : spring;
  const {easing, duration} = springEasing(spec);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  return element.animate(keyframes, {duration: reduced ? 0 : duration, easing, ...options});
}
