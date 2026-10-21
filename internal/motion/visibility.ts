/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

// Tells endless animations (loading indicators, wavy progress) when their
// element enters or leaves the viewport, so that they draw only while they
// can be seen. One observer serves every element.

const callbacks = new WeakMap<Element, (visible: boolean) => void>();
let observer: IntersectionObserver | undefined;

/**
 * Calls `onChange` with whether `element` is in the viewport, now (once the
 * browser has checked) and whenever that changes. Returns a function that
 * stops watching.
 */
export function observeVisibility(element: Element, onChange: (visible: boolean) => void) {
  observer ??= new IntersectionObserver((entries) => {
    for (const entry of entries) callbacks.get(entry.target)?.(entry.isIntersecting);
  });
  callbacks.set(element, onChange);
  observer.observe(element);
  return () => {
    callbacks.delete(element);
    observer?.unobserve(element);
  };
}
