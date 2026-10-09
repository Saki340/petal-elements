/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import {styles as sharedStyles} from './internal/shared-styles.cssresult.js';
import {TextButton} from './internal/text-button.js';
import {styles as textStyles} from './internal/text-styles.cssresult.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-text-button': PetalTextButton;
  }
}

/**
 * @summary Buttons start an action, such as sending a message or saving a form.
 *
 * @description
 * A text button: the least emphasis.
 *
 * @final
 * @suppress {visibility}
 */
@customElement('petal-text-button')
export class PetalTextButton extends TextButton {
  static override styles: CSSResultOrNative[] = [sharedStyles, textStyles];
}
