/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import '../../../elevation/elevation.js';

import {html, LitElement} from 'lit';

/**
 * A card component.
 */
export class Card extends LitElement {
  protected override render() {
    return html`
      <petal-elevation part="elevation"></petal-elevation>
      <div class="background"></div>
      <slot></slot>
      <div class="outline"></div>
    `;
  }
}
