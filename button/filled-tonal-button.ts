/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import {FilledTonalButton} from './internal/filled-tonal-button.js';
import {styles as tonalStyles} from './internal/filled-tonal-styles.cssresult.js';
import {styles as sharedElevationStyles} from './internal/shared-elevation-styles.cssresult.js';
import {styles as sharedStyles} from './internal/shared-styles.cssresult.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-filled-tonal-button': PetalFilledTonalButton;
  }
}

/**
 * @summary Buttons start an action, such as sending a message or saving a form.
 *
 * @description
 * A filled tonal button: between filled and outlined.
 *
 * @final
 * @suppress {visibility}
 */
@customElement('petal-filled-tonal-button')
export class PetalFilledTonalButton extends FilledTonalButton {
  static override styles: CSSResultOrNative[] = [
    sharedStyles,
    sharedElevationStyles,
    tonalStyles,
  ];
}
