/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import {TestTable} from './internal/test-table.js';
import {styles as testTableStyles} from './internal/test-table-styles.cssresult.js';

export {type TestTableTemplate} from './internal/test-table.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-test-table': PetalTestTable;
  }
}

/**
 * @final
 * @suppress {visibility}
 */
@customElement('petal-test-table')
export class PetalTestTable<S extends string = string> extends TestTable<S> {
  static override styles: CSSResultOrNative[] = [testTableStyles];
}
