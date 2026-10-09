/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import {ElevatedButton} from './internal/elevated-button.js';
import {styles as elevatedStyles} from './internal/elevated-styles.cssresult.js';
import {styles as sharedElevationStyles} from './internal/shared-elevation-styles.cssresult.js';
import {styles as sharedStyles} from './internal/shared-styles.cssresult.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-elevated-button': PetalElevatedButton;
  }
}

/**
 * @summary Buttons start an action, such as sending a message or saving a form.
 *
 * @description
 * An elevated button: a tonal button with a shadow.
 *
 * @final
 * @suppress {visibility}
 */
@customElement('petal-elevated-button')
export class PetalElevatedButton extends ElevatedButton {
  static override styles: CSSResultOrNative[] = [
    sharedStyles,
    sharedElevationStyles,
    elevatedStyles,
  ];
}
