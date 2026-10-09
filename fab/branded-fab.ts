/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import {Fab, FabVariant} from './internal/fab.js';
import {styles} from './internal/fab-branded-styles.cssresult.js';
import {styles as forcedColors} from './internal/forced-colors-styles.cssresult.js';
import {styles as sharedStyles} from './internal/shared-styles.cssresult.js';

export {type FabSize} from './internal/shared.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-branded-fab': PetalBrandedFab;
  }
}

/**
 * @summary A floating action button (FAB) for the main action of a screen.
 *
 * @description
 * A branded FAB shows a multicolor logo on a surface container.
 *
 * @final
 * @suppress {visibility}
 */
@customElement('petal-branded-fab')
export class PetalBrandedFab extends Fab {
  /**
   * Branded FABs have no variants
   */
  declare variant: FabVariant;

  override getRenderClasses() {
    return {
      ...super.getRenderClasses(),
      'primary': false,
      'secondary': false,
      'tertiary': false,
      'small': false,
    };
  }
  static override styles: CSSResultOrNative[] = [
    sharedStyles,
    styles,
    forcedColors,
  ];
}
