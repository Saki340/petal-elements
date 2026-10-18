/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import '../all.js';

import {html} from 'lit';

import {Environment} from './environment.js';

// Every element in all.ts.
const TAGS = [
  'petal-top-app-bar',
  'petal-elevated-button',
  'petal-filled-button',
  'petal-filled-tonal-button',
  'petal-outlined-button',
  'petal-text-button',
  'petal-button-group',
  'petal-elevated-card',
  'petal-filled-card',
  'petal-outlined-card',
  'petal-checkbox',
  'petal-assist-chip',
  'petal-chip-set',
  'petal-filter-chip',
  'petal-input-chip',
  'petal-suggestion-chip',
  'petal-dialog',
  'petal-divider',
  'petal-elevation',
  'petal-branded-fab',
  'petal-fab',
  'petal-filled-field',
  'petal-outlined-field',
  'petal-focus-ring',
  'petal-icon',
  'petal-filled-icon-button',
  'petal-filled-tonal-icon-button',
  'petal-icon-button',
  'petal-outlined-icon-button',
  'petal-list',
  'petal-loading-indicator',
  'petal-list-item',
  'petal-menu',
  'petal-menu-group',
  'petal-menu-item',
  'petal-sub-menu',
  'petal-circular-progress',
  'petal-linear-progress',
  'petal-pull-to-refresh',
  'petal-radio',
  'petal-ripple',
  'petal-filled-select',
  'petal-outlined-select',
  'petal-select-option',
  'petal-slider',
  'petal-snackbar',
  'petal-switch',
  'petal-primary-tab',
  'petal-secondary-tab',
  'petal-tabs',
  'petal-filled-text-field',
  'petal-outlined-text-field',
  'petal-tooltip',
  'petal-navigation-bar',
  'petal-navigation-bar-item',
  'petal-navigation-rail',
  'petal-navigation-rail-item',
  'petal-navigation-drawer',
  'petal-navigation-drawer-item',
  'petal-bottom-sheet',
  'petal-fab-menu',
  'petal-fab-menu-item',
  'petal-toggle-fab',
  'petal-search-bar',
  'petal-floating-toolbar',
  'petal-split-button',
];

describe('the hidden attribute', () => {
  const env = new Environment();

  for (const tag of TAGS) {
    it(`hides <${tag}>`, async () => {
      const root = env.render(html``);
      const element = document.createElement(tag);
      element.hidden = true;
      root.appendChild(element);
      await env.waitForStability();
      expect(getComputedStyle(element).display).withContext(tag).toBe('none');
    });
  }
});
