/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import {StandardBottomSheet} from './internal/standard-bottom-sheet.js';
import {styles} from './internal/standard-bottom-sheet-styles.cssresult.js';

export {type SheetValue} from './internal/sheet-physics.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-standard-bottom-sheet': PetalStandardBottomSheet;
  }
}

/**
 * @summary Standard bottom sheets show extra content docked at the bottom of
 * the screen, next to the page, which stays usable.
 *
 * @description
 * A standard (non-modal) bottom sheet, after Jetpack Compose Material 3's
 * `BottomSheetScaffold`. It shows its peek height until it is dragged up or
 * expanded. The content goes in the default slot; a custom drag handle in the
 * `drag-handle` slot.
 *
 * @final
 * @suppress {visibility}
 */
@customElement('petal-standard-bottom-sheet')
export class PetalStandardBottomSheet extends StandardBottomSheet {
  static override styles: CSSResultOrNative[] = [styles];
}
