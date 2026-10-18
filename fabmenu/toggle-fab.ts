/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import {ToggleFab} from './internal/toggle-fab.js';
import {styles} from './internal/toggle-fab-styles.cssresult.js';

export {type ToggleFabAlignment, type ToggleFabSize} from './internal/toggle-fab.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-toggle-fab': PetalToggleFab;
  }
}

/**
 * @summary A FAB that toggles, and animates its size, shape and colors when it
 * does, for the button of a FAB menu.
 *
 * @description
 * The icon of the unchecked state goes in the `icon` slot and the one of the
 * checked state in `checked-icon`; they are an add and a close icon by default.
 * The icon switches halfway through the animation. Set an accessible name with
 * `aria-label`.
 *
 * @fires change The checked state changed because of a click. {@type Event}
 *
 * @final
 * @suppress {visibility}
 */
@customElement('petal-toggle-fab')
export class PetalToggleFab extends ToggleFab {
  static override styles: CSSResultOrNative[] = [styles];
}
