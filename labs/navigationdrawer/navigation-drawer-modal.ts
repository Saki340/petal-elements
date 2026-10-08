/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import {customElement} from 'lit/decorators.js';

import {NavigationDrawerModal} from './internal/navigation-drawer-modal.js';
import {styles} from './internal/navigation-drawer-modal-styles.cssresult.js';
import {styles as sharedStyles} from './internal/shared-styles.cssresult.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-navigation-drawer-modal': PetalNavigationDrawerModal;
  }
}

/**
 * @final
 * @suppress {visibility}
 */
@customElement('petal-navigation-drawer-modal')
export class PetalNavigationDrawerModal extends NavigationDrawerModal {
  static override readonly styles = [sharedStyles, styles];
}
