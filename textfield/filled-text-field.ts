/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import '../field/filled-field.js';

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';
import {literal} from 'lit/static-html.js';

import {styles as filledStyles} from './internal/filled-styles.cssresult.js';
import {FilledTextField} from './internal/filled-text-field.js';
import {styles as sharedStyles} from './internal/shared-styles.cssresult.js';

export {type TextFieldType} from './internal/text-field.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-filled-text-field': PetalFilledTextField;
  }
}

/**
 * TODO(b/228525797): Add docs
 * @final
 * @suppress {visibility}
 */
@customElement('petal-filled-text-field')
export class PetalFilledTextField extends FilledTextField {
  static override styles: CSSResultOrNative[] = [sharedStyles, filledStyles];

  protected override readonly fieldTag = literal`petal-filled-field`;
}
