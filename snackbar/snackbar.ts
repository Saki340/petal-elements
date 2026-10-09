/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import {Snackbar} from './internal/snackbar.js';
import {styles} from './internal/snackbar-styles.cssresult.js';

export {
  type SnackbarCloseReason,
  type SnackbarDuration,
} from './internal/snackbar.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-snackbar': PetalSnackbar;
  }
}

/**
 * @summary Snackbars show a short message at the bottom of the screen, with an
 * optional action.
 *
 * @final
 * @suppress {visibility}
 */
@customElement('petal-snackbar')
export class PetalSnackbar extends Snackbar {
  static override styles: CSSResultOrNative[] = [styles];
}
