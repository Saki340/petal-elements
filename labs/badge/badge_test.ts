/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

// import 'jasmine'; (google3-only)

import {createTokenTests} from '../../testing/tokens.js';

import {PetalBadge} from './badge.js';

describe('<petal-badge>', () => {
  describe('.styles', () => {
    createTokenTests(PetalBadge.styles);
  });
});
