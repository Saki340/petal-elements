/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import {Shape} from './internal/shape.js';
import {styles} from './internal/shape-styles.cssresult.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-shape': PetalShape;
  }
}

/**
 * @summary A container clipped to one of the 35 Material 3 Expressive shapes,
 * that morphs between them on a spring.
 *
 * @cssprop --md-shape-color - The fill behind the content (default none).
 * @csspart shape - The clipped box holding the content.
 *
 * @final
 * @suppress {visibility}
 */
@customElement('petal-shape')
export class PetalShape extends Shape {
  static override styles: CSSResultOrNative[] = [styles];
}
