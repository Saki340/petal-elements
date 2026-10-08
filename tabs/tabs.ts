/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import {Tabs} from './internal/tabs.js';
import {styles} from './internal/tabs-styles.cssresult.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-tabs': PetalTabs;
  }
}

// TODO(b/267336507): add docs
/**
 * @summary Tabs displays a list of selectable tabs.
 *
 * @final
 * @suppress {visibility}
 */
@customElement('petal-tabs')
export class PetalTabs extends Tabs {
  static override styles: CSSResultOrNative[] = [styles];
}
