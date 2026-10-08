/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import '../../elevation/elevation.js';

import {html} from 'lit';

import {Button} from './button.js';

/**
 * An elevated button component.
 */
export class ElevatedButton extends Button {
  protected override renderElevationOrOutline() {
    return html`<petal-elevation part="elevation"></petal-elevation>`;
  }
}
