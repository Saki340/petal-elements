/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview This file runs logic across every page in the SSG'd catalog and
 * is loaded top-level as a <script type=module>. So this file handles
 * global client-side logic for shared components (e.g. top-app bar) that can't
 * be run on the server in SSR such as accessing localstorage, media queries,
 * and global scroll listeners.
 */

import {
  expressiveSprings,
  springEasing,
} from 'petal-elements/motion/spring.js';
import {transitionTheme} from 'petal-elements/theme/theme-transition.js';

import type {SiteSearch} from '../components/site-search.js';
import {startRouter} from '../utils/router.js';
import {
  changeColor,
  changeColorAndMode,
  changeColorMode,
  getCurrentMode,
  getCurrentSeedColor,
  getCurrentThemeString,
  getLastSavedAutoColorMode,
  isModeDark,
} from '../utils/theme.js';

/**
 * Applies theme-based event listeners such as changing color, mode, and
 * listening to system mode changes.
 */
function applyColorThemeListeners() {
  document.body.addEventListener('change-color', (event) => {
    if (event.origin) {
      void transitionTheme(() => {
        changeColor(event.color);
      }, event.origin);
    } else {
      changeColor(event.color);
    }
  });

  document.body.addEventListener('change-mode', (event) => {
    void transitionTheme(() => {
      changeColorMode(event.mode);
    }, event.origin);
  });

  // Listen for system color change and applies the new theme if the current
  // color mode is 'auto'.
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', () => {
      if (getCurrentMode() !== 'auto') {
        return;
      }

      changeColor(getCurrentSeedColor()!);
    });
}

/**
 * Sets color and mode to the petal amber and 'auto' respectively if there is
 * no material theme saved to localStorage. This is the case in initial
 * navigation to the catalog.
 */
function initializeTheme() {
  if (!getCurrentThemeString()) {
    changeColorAndMode('#ECAA2E', 'auto');
  }
}

/**
 * Gives the CSS of the catalog the springs of the components, as `linear()`
 * easings (see global.css).
 */
function applySprings() {
  const root = document.documentElement.style;
  const set = (name: string, spring: {dampingRatio: number; stiffness: number}) => {
    const {easing, duration} = springEasing(spring);
    root.setProperty(`--catalog-${name}`, easing);
    root.setProperty(`--catalog-${name}-duration`, `${duration}ms`);
  };
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  set('spring', expressiveSprings.defaultSpatial);
  set('spring-fast', expressiveSprings.fastSpatial);
  set('effects', expressiveSprings.defaultEffects);
}

/**
 * Opens the search palette from the top app bar and with Ctrl/⌘ K. The palette
 * is only loaded when it is first used.
 */
function applySearchListeners() {
  let search: SiteSearch | undefined;
  const open = async () => {
    await import('../components/site-search.js');
    search ??= document.body.appendChild(document.createElement('site-search'));
    await search.updateComplete;
    await search.open();
  };

  document.body.addEventListener('open-site-search', () => void open());
  document.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      void open();
    }
  });
}

/**
 * Determines whether to update the theme on page navigation if the mode is
 * 'auto'.
 *
 * This is necessary in the edge case where the user has set color mode to
 * 'auto', and the system mode is A. They navigate away from the catalog, and
 * over time the system mode changes to B. When they navigate back to the
 * catalog, the mode may be 'auto', but color theme with mode A is saved instead
 * of B.
 */
function determinePageNavigationAutoMode() {
  if (getCurrentMode() !== 'auto') {
    return;
  }

  const actualColorMode = isModeDark('auto', false) ? 'dark' : 'light';
  const lastSavedAutoColorMode = getLastSavedAutoColorMode();

  if (actualColorMode !== lastSavedAutoColorMode) {
    // Recalculate auto mode with the same theme color.
    changeColorMode('auto');
  }
}

applyColorThemeListeners();
initializeTheme();
determinePageNavigationAutoMode();
applySprings();
applySearchListeners();
startRouter();
