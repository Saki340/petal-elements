/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

// A document has one view transition at a time, and starting one skips the one
// before. This keeps track of the running one, so the theme and page
// transitions can stop each other cleanly.

/** A view transition started with `startViewTransitionRun()`. */
export interface ViewTransitionRun {
  transition: ViewTransition;
  /** A Web Animation on the transition's pseudo-elements, if any. */
  animation?: Animation;
  /** Removes what the transition set on the page. */
  cleanup: () => void;
}

/** The running view transition, if any. */
let current: ViewTransitionRun | undefined;

/** Skips the running view transition, cancels its animation and cleans up. */
export function stopViewTransition() {
  if (!current) return;
  const run = current;
  current = undefined;
  // Left running on a pseudo-element that is gone, an animation can crash
  // Chrome's compositor.
  run.animation?.cancel();
  run.transition.skipTransition();
  run.cleanup();
}

/** Starts a view transition. Call `stopViewTransition()` first. */
export function startViewTransitionRun(
  update: () => void | Promise<void>,
  cleanup: () => void,
): ViewTransitionRun {
  const run = {transition: document.startViewTransition(update), cleanup};
  current = run;
  return run;
}

/** Whether `run` is still the running view transition. */
export function isRunning(run: ViewTransitionRun) {
  return current === run;
}

/** Cleans up after `run` has finished, unless it was stopped before that. */
export function finishViewTransition(run: ViewTransitionRun) {
  run.animation?.cancel();
  if (current !== run) return;
  current = undefined;
  run.cleanup();
}
