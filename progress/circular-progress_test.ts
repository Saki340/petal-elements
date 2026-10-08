/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import {createTokenTests} from '../testing/tokens.js';

import {PetalCircularProgress} from './circular-progress.js';

describe('<petal-circular-progress>', () => {
  describe('.styles', () => {
    createTokenTests(PetalCircularProgress.styles);
  });
});
