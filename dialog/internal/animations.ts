/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import {EASING} from '../../internal/motion/animation.js';
import {
  DEFAULT_SPATIAL,
  SpringSpec,
  springEasing,
  springFromCss,
} from '../../internal/motion/spring.js';

/**
 * A dialog animation's arguments. See `Element.prototype.animate`.
 */
export type DialogAnimationArgs = Parameters<Element['animate']>;

/**
 * A collection of dialog animations. Each element of a dialog may have multiple
 * animations.
 */
export interface DialogAnimation {
  /**
   * Animations for the dialog itself.
   */
  dialog?: DialogAnimationArgs[];

  /**
   * Animations for the scrim backdrop.
   */
  scrim?: DialogAnimationArgs[];

  /**
   * Animations for the container of the dialog.
   */
  container?: DialogAnimationArgs[];

  /**
   * Animations for the headline section.
   */
  headline?: DialogAnimationArgs[];

  /**
   * Animations for the contents section.
   */
  content?: DialogAnimationArgs[];
  /**
   * Animations for the actions section.
   */
  actions?: DialogAnimationArgs[];
}

/**
 * The default dialog open animation.
 */
export const DIALOG_DEFAULT_OPEN_ANIMATION: DialogAnimation = {
  dialog: [
    [
      // Dialog slide down
      [{'transform': 'translateY(-50px)'}, {'transform': 'translateY(0)'}],
      {duration: 500, easing: EASING.EMPHASIZED},
    ],
  ],
  scrim: [
    [
      // Scrim fade in
      [{'opacity': 0}, {'opacity': 0.32}],
      {duration: 500, easing: 'linear'},
    ],
  ],
  container: [
    [
      // Container fade in
      [{'opacity': 0}, {'opacity': 1}],
      {duration: 50, easing: 'linear', pseudoElement: '::before'},
    ],
    [
      // Container grow
      // Note: current spec says to grow from 0dp->100% and shrink from
      // 100%->35%. We change this to 35%->100% to simplify the animation that
      // is supposed to clip content as it grows. From 0dp it's possible to see
      // text/actions appear before the container has fully grown.
      [{'height': '35%'}, {'height': '100%'}],
      {duration: 500, easing: EASING.EMPHASIZED, pseudoElement: '::before'},
    ],
  ],
  headline: [
    [
      // Headline fade in
      [{'opacity': 0}, {'opacity': 0, offset: 0.2}, {'opacity': 1}],
      {duration: 250, easing: 'linear', fill: 'forwards'},
    ],
  ],
  content: [
    [
      // Content fade in
      [{'opacity': 0}, {'opacity': 0, offset: 0.2}, {'opacity': 1}],
      {duration: 250, easing: 'linear', fill: 'forwards'},
    ],
  ],
  actions: [
    [
      // Actions fade in
      [{'opacity': 0}, {'opacity': 0, offset: 0.5}, {'opacity': 1}],
      {duration: 300, easing: 'linear', fill: 'forwards'},
    ],
  ],
};

/**
 * The default dialog close animation.
 */
export const DIALOG_DEFAULT_CLOSE_ANIMATION: DialogAnimation = {
  dialog: [
    [
      // Dialog slide up
      [{'transform': 'translateY(0)'}, {'transform': 'translateY(-50px)'}],
      {duration: 150, easing: EASING.EMPHASIZED_ACCELERATE},
    ],
  ],
  scrim: [
    [
      // Scrim fade out
      [{'opacity': 0.32}, {'opacity': 0}],
      {duration: 150, easing: 'linear'},
    ],
  ],
  container: [
    [
      // Container shrink
      [{'height': '100%'}, {'height': '35%'}],
      {
        duration: 150,
        easing: EASING.EMPHASIZED_ACCELERATE,
        pseudoElement: '::before',
      },
    ],
    [
      // Container fade out
      [{'opacity': '1'}, {'opacity': '0'}],
      {delay: 100, duration: 50, easing: 'linear', pseudoElement: '::before'},
    ],
  ],
  headline: [
    [
      // Headline fade out
      [{'opacity': 1}, {'opacity': 0}],
      {duration: 100, easing: 'linear', fill: 'forwards'},
    ],
  ],
  content: [
    [
      // Content fade out
      [{'opacity': 1}, {'opacity': 0}],
      {duration: 100, easing: 'linear', fill: 'forwards'},
    ],
  ],
  actions: [
    [
      // Actions fade out
      [{'opacity': 1}, {'opacity': 0}],
      {duration: 100, easing: 'linear', fill: 'forwards'},
    ],
  ],
};

// The petal-elements dialog motion. Compose's AlertDialog leaves the window
// animation to the platform, so the dialog moves like the menu (Compose's
// DropdownMenu): it scales from 80% and fades, on the springs of the page's
// motion scheme.

/** MotionSchemeKeyTokens.DefaultEffects (both schemes). */
const DEFAULT_EFFECTS: SpringSpec = {dampingRatio: 1, stiffness: 1600};

/** MotionSchemeKeyTokens.FastEffects (both schemes). */
const FAST_EFFECTS: SpringSpec = {dampingRatio: 1, stiffness: 3800};

/** The scale the dialog opens from and closes to. */
const START_SCALE = 'scale(0.8)';

/**
 * Opens on the default spatial spring (it overshoots a little with the
 * expressive scheme) and fades in on the default effects spring; the scrim
 * fades in with it.
 */
export function springOpenAnimation(element: Element): DialogAnimation {
  const spatial = springEasing(springFromCss(element, 'default-spatial', DEFAULT_SPATIAL));
  const effects = springEasing(springFromCss(element, 'default-effects', DEFAULT_EFFECTS));
  return {
    dialog: [
      [[{transform: START_SCALE}, {transform: 'none'}], spatial],
      [[{opacity: 0}, {opacity: 1}], effects],
    ],
    scrim: [[[{opacity: 0}, {opacity: 0.32}], effects]],
  };
}

/**
 * Closes on the fast effects spring, scaling back and fading out. The end is
 * kept until the dialog closes, so it does not show again for a frame.
 */
export function springCloseAnimation(element: Element): DialogAnimation {
  const fast = {
    ...springEasing(springFromCss(element, 'fast-effects', FAST_EFFECTS)),
    fill: 'forwards' as const,
  };
  return {
    dialog: [
      [[{transform: 'none'}, {transform: START_SCALE}], fast],
      [[{opacity: 1}, {opacity: 0}], fast],
    ],
    scrim: [[[{opacity: 0.32}, {opacity: 0}], fast]],
  };
}
