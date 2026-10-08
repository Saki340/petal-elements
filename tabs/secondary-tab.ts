/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import {SecondaryTab} from './internal/secondary-tab.js';
import {styles as secondaryStyles} from './internal/secondary-tab-styles.cssresult.js';
import {styles as sharedStyles} from './internal/tab-styles.cssresult.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-secondary-tab': PetalSecondaryTab;
  }
}

// TODO(b/267336507): add docs
/**
 * @summary Tab allow users to display a tab within a Tabs.
 *
 * @final
 * @suppress {visibility}
 */
@customElement('petal-secondary-tab')
export class PetalSecondaryTab extends SecondaryTab {
  static override styles: CSSResultOrNative[] = [sharedStyles, secondaryStyles];
}
