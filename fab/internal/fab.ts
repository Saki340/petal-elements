/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import {property} from 'lit/decorators.js';

import {SharedFab} from './shared.js';

/**
 * The variants available to non-branded FABs.
 *
 * `primary`, `secondary` and `tertiary` use the container colors
 * (md.comp.fab.primary-container, ...); the `filled-` variants use the solid
 * colors (md.comp.fab.primary, ...).
 */
export type FabVariant =
  | 'surface'
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'filled-primary'
  | 'filled-secondary'
  | 'filled-tertiary';

// tslint:disable-next-line:enforce-comments-on-exported-symbols
export class Fab extends SharedFab {
  /**
   * The FAB color variant to render. The default, `primary`, is Compose's
   * default FAB color (primary container).
   */
  @property() variant: FabVariant = 'primary';

  protected override getRenderClasses() {
    return {
      ...super.getRenderClasses(),
      'primary': this.variant === 'primary',
      'secondary': this.variant === 'secondary',
      'tertiary': this.variant === 'tertiary',
      'filled-primary': this.variant === 'filled-primary',
      'filled-secondary': this.variant === 'filled-secondary',
      'filled-tertiary': this.variant === 'filled-tertiary',
    };
  }
}
