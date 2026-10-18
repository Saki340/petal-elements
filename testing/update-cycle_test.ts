/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

// Every petal element renders and changes state without scheduling an update
// while it updates (Lit's change-in-update warning, which means it renders
// twice). The elements are the ones all.ts exports, so new ones are covered.

import {takeUpdateWarnings, watchUpdateWarnings} from './update-warnings.js';

// Before any element is defined, since Lit warns once per class.
watchUpdateWarnings();

// The imports above run first; load the elements after the watch starts.
const loaded = import('../all.js');

const STATES = ['disabled', 'selected', 'checked', 'expanded', 'indeterminate'];

/** The tags of the elements all.ts exports, from their classes. */
let tags: string[] = [];

describe('update cycle', () => {
  beforeAll(async () => {
    const module = (await loaded) as Record<string, unknown>;
    tags = Object.values(module)
      .filter((value): value is CustomElementConstructor => typeof value === 'function')
      .map((ctor) => customElements.getName(ctor) ?? '')
      .filter((tag) => tag.startsWith('petal-'));
    // Loading every element takes a while when many test files run at once.
  }, 60_000);

  it('finds the elements', () => {
    expect(tags.length).toBeGreaterThan(50);
  });

  it('renders and changes state without updating during an update', async () => {
    const root = document.createElement('div');
    document.body.append(root);
    for (const tag of tags) {
      const element = document.createElement(tag) as HTMLElement & {
        updateComplete?: Promise<unknown>;
        show?: () => unknown;
        close?: () => unknown;
      } & Record<string, unknown>;
      element.append('Label');
      root.append(element);
      await element.updateComplete;
      for (const state of STATES) {
        if (typeof element[state] !== 'boolean') continue;
        element[state] = !element[state];
        await element.updateComplete;
        element[state] = !element[state];
        await element.updateComplete;
      }
      if (typeof element.show === 'function' && typeof element.close === 'function') {
        await Promise.race([element.show(), new Promise((r) => setTimeout(r, 500))]);
        await element.updateComplete;
        await Promise.race([element.close(), new Promise((r) => setTimeout(r, 500))]);
        await element.updateComplete;
      }
      // Settle microtasks and a frame, for work started from updated().
      await new Promise((r) => setTimeout(r, 20));
    }
    root.remove();
    expect(takeUpdateWarnings()).toEqual([]);
  }, 120_000);
});
