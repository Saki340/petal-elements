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
  'button.md': COMPONENT_CUSTOM_ELEMENTS.button,
  'button-group.md': COMPONENT_CUSTOM_ELEMENTS.buttonGroup,
  'checkbox.md': COMPONENT_CUSTOM_ELEMENTS.checkbox,
  'chip.md': COMPONENT_CUSTOM_ELEMENTS.chips,
  'dialog.md': COMPONENT_CUSTOM_ELEMENTS.dialog,
  'divider.md': COMPONENT_CUSTOM_ELEMENTS.divider,
  'elevation.md': COMPONENT_CUSTOM_ELEMENTS.elevation,
  'fab.md': COMPONENT_CUSTOM_ELEMENTS.fab,
  'focus-ring.md': COMPONENT_CUSTOM_ELEMENTS.focus,
  'icon-button.md': COMPONENT_CUSTOM_ELEMENTS.iconButton,
  'icon.md': COMPONENT_CUSTOM_ELEMENTS.icon,
  'list.md': COMPONENT_CUSTOM_ELEMENTS.list,
  'menu.md': COMPONENT_CUSTOM_ELEMENTS.menu,
  'progress.md': COMPONENT_CUSTOM_ELEMENTS.progress,
  'radio.md': COMPONENT_CUSTOM_ELEMENTS.radio,
  'ripple.md': COMPONENT_CUSTOM_ELEMENTS.ripple,
  'slider.md': COMPONENT_CUSTOM_ELEMENTS.slider,
  'switch.md': COMPONENT_CUSTOM_ELEMENTS.switch,
  'tabs.md': COMPONENT_CUSTOM_ELEMENTS.tabs,
  'text-field.md': COMPONENT_CUSTOM_ELEMENTS.textField,
  'tooltip.md': COMPONENT_CUSTOM_ELEMENTS.tooltip,
  'select.md': COMPONENT_CUSTOM_ELEMENTS.select,
  'snackbar.md': COMPONENT_CUSTOM_ELEMENTS.snackbar,
};
