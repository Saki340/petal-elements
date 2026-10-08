/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

// import 'jasmine'; (google3-only)

import {createTokenTests} from '../testing/tokens.js';

import {PetalFilledButton} from './filled-button.js';

describe('<petal-filled-button>', () => {
  describe('.styles', () => {
    createTokenTests(PetalFilledButton.styles);
  });

  it('should not execute pre-bound click listeners when soft-disabled', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const button = document.createElement('petal-filled-button');
    let clicked = false;
    button.addEventListener('click', () => {
      clicked = true;
    });
    button.softDisabled = true;
    container.appendChild(button);
    button.click();
    expect(clicked).toBeFalse();
    container.remove();
  });
});
