/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

// Hover as a preview of the press, for mice and trackpads; see _hover.scss.

import {isServer} from 'lit';

/** How far toward the pressed value a hover goes. */
export const HOVER_FRACTION = 0.3;

/** Whether the page has a pointer that hovers (a mouse or trackpad). */
export function hasFinePointer() {
  return !isServer && matchMedia('(hover: hover) and (pointer: fine)').matches;
}

/** Whether the page asks for reduced motion. */
export function prefersReducedMotion() {
  return !isServer && matchMedia('(prefers-reduced-motion: reduce)').matches;
}
