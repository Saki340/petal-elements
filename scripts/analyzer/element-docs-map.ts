/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import {COMPONENT_CUSTOM_ELEMENTS} from '../component-custom-elements.js';

/**
 * A map of Markdown documentation file name to element entrypoints associated
 * with that documentation.
 */
export const docsToElementMapping: {[key: string]: readonly string[]} = {
  'top-app-bar.md': COMPONENT_CUSTOM_ELEMENTS.appBar,
  'badge.md': COMPONENT_CUSTOM_ELEMENTS.badge,
  'bottom-sheet.md': COMPONENT_CUSTOM_ELEMENTS.sheet,
  'button.md': COMPONENT_CUSTOM_ELEMENTS.button,
  'button-group.md': COMPONENT_CUSTOM_ELEMENTS.buttonGroup,
  'card.md': COMPONENT_CUSTOM_ELEMENTS.card,
  'checkbox.md': COMPONENT_CUSTOM_ELEMENTS.checkbox,
  'chip.md': COMPONENT_CUSTOM_ELEMENTS.chips,
  'dialog.md': COMPONENT_CUSTOM_ELEMENTS.dialog,
  'divider.md': COMPONENT_CUSTOM_ELEMENTS.divider,
  'elevation.md': COMPONENT_CUSTOM_ELEMENTS.elevation,
  'fab.md': COMPONENT_CUSTOM_ELEMENTS.fab,
  'fab-menu.md': COMPONENT_CUSTOM_ELEMENTS.fabMenu,
  'focus-ring.md': COMPONENT_CUSTOM_ELEMENTS.focus,
  'icon-button.md': COMPONENT_CUSTOM_ELEMENTS.iconButton,
  'icon.md': COMPONENT_CUSTOM_ELEMENTS.icon,
  'list.md': COMPONENT_CUSTOM_ELEMENTS.list,
  'loading-indicator.md': COMPONENT_CUSTOM_ELEMENTS.loadingIndicator,
  'pull-to-refresh.md': COMPONENT_CUSTOM_ELEMENTS.pullToRefresh,
  'menu.md': COMPONENT_CUSTOM_ELEMENTS.menu,
  'navigation-bar.md': COMPONENT_CUSTOM_ELEMENTS.navigationBar,
  'navigation-drawer.md': COMPONENT_CUSTOM_ELEMENTS.navigationDrawer,
  'navigation-rail.md': COMPONENT_CUSTOM_ELEMENTS.navigationRail,
  'progress.md': COMPONENT_CUSTOM_ELEMENTS.progress,
  'radio.md': COMPONENT_CUSTOM_ELEMENTS.radio,
  'ripple.md': COMPONENT_CUSTOM_ELEMENTS.ripple,
  'slider.md': COMPONENT_CUSTOM_ELEMENTS.slider,
  'switch.md': COMPONENT_CUSTOM_ELEMENTS.switch,
  'tabs.md': COMPONENT_CUSTOM_ELEMENTS.tabs,
  'text-field.md': COMPONENT_CUSTOM_ELEMENTS.textField,
  'tooltip.md': COMPONENT_CUSTOM_ELEMENTS.tooltip,
  'segmented-button.md': COMPONENT_CUSTOM_ELEMENTS.segmentedButton,
  'select.md': COMPONENT_CUSTOM_ELEMENTS.select,
  'snackbar.md': COMPONENT_CUSTOM_ELEMENTS.snackbar,
  'search.md': COMPONENT_CUSTOM_ELEMENTS.search,
  'floating-toolbar.md': COMPONENT_CUSTOM_ELEMENTS.floatingToolbar,
  'split-button.md': COMPONENT_CUSTOM_ELEMENTS.splitButton,
};
