/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import {Dialog} from './internal/dialog.js';
import {styles} from './internal/dialog-styles.cssresult.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-dialog': PetalDialog;
  }
}

/**
 * @summary Dialogs ask for a decision or show important information on top of
 * the page.
 *
 * @description
 * A dialog is modal: the rest of the page is inert until the dialog is
 * closed.
 *
 * @final
 * @suppress {visibility}
 */
@customElement('petal-dialog')
export class PetalDialog extends Dialog {
  static override styles: CSSResultOrNative[] = [styles];
}
