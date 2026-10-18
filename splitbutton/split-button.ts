/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import {SplitButton} from './internal/split-button.js';
import {styles} from './internal/split-button-styles.cssresult.js';

export {
  type SplitButtonSize,
  type SplitButtonVariant,
} from './internal/split-button.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-split-button': PetalSplitButton;
  }
}

/**
 * @summary A split button has a leading button for the main action and a
 * trailing button that opens a menu of related actions.
 *
 * @description
 * Put the label in the default slot and an optional icon in the `icon` slot.
 * A click on the host is a click on the leading button. The trailing button
 * toggles `checked` and fires `input` and `change`; use that to open a
 * `<petal-menu>` anchored to the split button. Follows Jetpack Compose
 * `SplitButtonLayout` and `SplitButtonDefaults`.
 *
 * @final
 * @suppress {visibility}
 */
@customElement('petal-split-button')
export class PetalSplitButton extends SplitButton {
  static override styles: CSSResultOrNative[] = [styles];
}
