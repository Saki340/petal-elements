/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import {IconButton} from './internal/icon-button.js';
import {styles} from './internal/outlined-styles.cssresult.js';
import {styles as sharedStyles} from './internal/shared-styles.cssresult.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-outlined-icon-button': PetalOutlinedIconButton;
  }
}

/**
 * @summary Icon buttons start a secondary action with a single icon.
 *
 * @description
 * An outlined icon button: medium emphasis.
 *
 * @final
 * @suppress {visibility}
 */
@customElement('petal-outlined-icon-button')
export class PetalOutlinedIconButton extends IconButton {
  static override styles: CSSResultOrNative[] = [sharedStyles, styles];

  protected override getRenderClasses() {
    return {
      ...super.getRenderClasses(),
      'outlined': true,
    };
  }
}
