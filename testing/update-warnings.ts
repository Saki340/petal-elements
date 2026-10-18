/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

// Collects Lit's dev mode change-in-update warnings: an element scheduled an
// update while it was updating (from `updated()`, `firstUpdated()` or a
// controller's `hostUpdated()`), so it renders twice. Lit warns once per
// element class and page, so watch from the start of a test file.

const warnings: string[] = [];
let watching = false;

/** Starts collecting the warnings; safe to call more than once. */
export function watchUpdateWarnings() {
  if (watching) return;
  watching = true;
  const warn = console.warn;
  console.warn = (...args: unknown[]) => {
    const message = String(args[0]);
    if (message.includes('change-in-update')) warnings.push(message);
    warn.apply(console, args);
  };
}

/** The warnings since the last call, e.g. "Element petal-x scheduled ...". */
export function takeUpdateWarnings() {
  return warnings.splice(0).map((message) => message.split(' after ')[0]);
}
