/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

// import 'jasmine'; (google3-only)

import {createTokenTests} from '../testing/tokens.js';

import {PetalTextButton} from './text-button.js';

describe('<petal-text-button>', () => {
  describe('.styles', () => {
    createTokenTests(PetalTextButton.styles);
  });
});
