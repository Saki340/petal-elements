/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import '../field/outlined-field.js';

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';
import {literal} from 'lit/static-html.js';

import {styles as outlinedStyles} from './internal/outlined-styles.cssresult.js';
import {OutlinedTextField} from './internal/outlined-text-field.js';
import {styles as sharedStyles} from './internal/shared-styles.cssresult.js';

export {type TextFieldType} from './internal/text-field.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-outlined-text-field': PetalOutlinedTextField;
  }
}

/**
 * TODO(b/228525797): Add docs
 * @final
 * @suppress {visibility}
 */
@customElement('petal-outlined-text-field')
export class PetalOutlinedTextField extends OutlinedTextField {
  static override styles: CSSResultOrNative[] = [sharedStyles, outlinedStyles];

  protected override readonly fieldTag = literal`petal-outlined-field`;
}
