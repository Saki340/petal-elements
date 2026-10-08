/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import {Button} from './button.js';

/**
 * A text button component.
 */
export class TextButton extends Button {
  // Text buttons have no toggle style (there is no text toggle button in the
  // Material 3 Expressive specs or Compose); `toggle` is ignored.
  protected override supportsToggle = false;
}
