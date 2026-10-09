/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import {OutlinedButton} from './internal/outlined-button.js';
import {styles as outlinedStyles} from './internal/outlined-styles.cssresult.js';
import {styles as sharedStyles} from './internal/shared-styles.cssresult.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-outlined-button': PetalOutlinedButton;
  }
}

/**
 * @summary Buttons start an action, such as sending a message or saving a form.
 *
 * @description
 * An outlined button: medium emphasis.
 *
 * @final
 * @suppress {visibility}
 */
@customElement('petal-outlined-button')
export class PetalOutlinedButton extends OutlinedButton {
  static override styles: CSSResultOrNative[] = [sharedStyles, outlinedStyles];
}
