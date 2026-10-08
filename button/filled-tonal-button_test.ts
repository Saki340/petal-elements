/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

// import 'jasmine'; (google3-only)

import {createTokenTests} from '../testing/tokens.js';

import {PetalFilledTonalButton} from './filled-tonal-button.js';

describe('<petal-filled-tonal-button>', () => {
  describe('.styles', () => {
    createTokenTests(PetalFilledTonalButton.styles);
  });
});
