/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import {styles} from './internal/filled-styles.cssresult.js';
import {IconButton} from './internal/icon-button.js';
import {styles as sharedStyles} from './internal/shared-styles.cssresult.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-filled-icon-button': PetalFilledIconButton;
  }
}

/**
 * @summary Icon buttons start a secondary action with a single icon.
 *
 * @description
 * A filled icon button: the strongest emphasis.
 *
 * @final
 * @suppress {visibility}
 */
@customElement('petal-filled-icon-button')
export class PetalFilledIconButton extends IconButton {
  static override styles: CSSResultOrNative[] = [sharedStyles, styles];

  protected override getRenderClasses() {
    return {
      ...super.getRenderClasses(),
      'filled': true,
      'toggle-filled': this.toggle,
    };
  }
}
