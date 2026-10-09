/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import {Fab} from './internal/fab.js';
import {styles} from './internal/fab-styles.cssresult.js';
import {styles as forcedColors} from './internal/forced-colors-styles.cssresult.js';
import {styles as sharedStyles} from './internal/shared-styles.cssresult.js';

export {type FabVariant} from './internal/fab.js';
export {type FabSize} from './internal/shared.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-fab': PetalFab;
  }
}

/**
 * @summary A floating action button (FAB) for the main action of a screen.
 *
 * @description
 * With a `label` the FAB is extended and shows the text next to the icon.
 *
 * @final
 * @suppress {visibility}
 */
@customElement('petal-fab')
export class PetalFab extends Fab {
  static override styles: CSSResultOrNative[] = [
    sharedStyles,
    styles,
    forcedColors,
  ];
}
