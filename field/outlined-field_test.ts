/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

// import 'jasmine'; (google3-only)

import {createTokenTests} from '../testing/tokens.js';

import {PetalOutlinedField} from './outlined-field.js';

describe('<petal-outlined-field>', () => {
  describe('.styles', () => {
    createTokenTests(PetalOutlinedField.styles);
  });
});
