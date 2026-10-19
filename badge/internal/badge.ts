/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import {html, LitElement} from 'lit';
import {property} from 'lit/decorators.js';

/**
 * A badge, after Jetpack Compose Material 3 (`Badge` and `BadgedBox` in
 * Badge.kt): a 6px dot, or a 16px pill with a short value such as a count.
 *
 * With `slot="badge"` in a navigation item, an icon button or any element
 * with a position, it sits at the end of the top edge like `BadgedBox`
 * places it.
 */
export class Badge extends LitElement {
  /**
   * The text of the badge, for example a count. Without it the badge is a
   * small dot.
   */
  @property({reflect: true}) value = '';

  protected override render() {
    return html`<span class="badge">${this.value}</span>`;
  }
}
