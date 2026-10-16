/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import {BottomSheet} from './internal/bottom-sheet.js';
import {styles} from './internal/bottom-sheet-styles.cssresult.js';

export {type SheetValue} from './internal/bottom-sheet.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-bottom-sheet': PetalBottomSheet;
  }
}

/**
 * @summary Bottom sheets show content at the bottom of the screen, above a
 * scrim. They can be dragged between a partial height, the full height and
 * hidden.
 *
 * @description
 * A modal bottom sheet, after Jetpack Compose Material 3's `ModalBottomSheet`.
 * Open it with `show()` or the `open` attribute. The content goes in the
 * default slot; a custom drag handle in the `drag-handle` slot.
 *
 * @final
 * @suppress {visibility}
 */
@customElement('petal-bottom-sheet')
export class PetalBottomSheet extends BottomSheet {
  static override styles: CSSResultOrNative[] = [styles];
}
