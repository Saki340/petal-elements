/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import {PrimaryTab} from './internal/primary-tab.js';
import {styles as primaryStyles} from './internal/primary-tab-styles.cssresult.js';
import {styles as sharedStyles} from './internal/tab-styles.cssresult.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-primary-tab': PetalPrimaryTab;
  }
}

// TODO(b/267336507): add docs
/**
 * @summary A primary tab, used inside `<petal-tabs>`.
 *
 * @final
 * @suppress {visibility}
 */
@customElement('petal-primary-tab')
export class PetalPrimaryTab extends PrimaryTab {
  static override styles: CSSResultOrNative[] = [sharedStyles, primaryStyles];
}
