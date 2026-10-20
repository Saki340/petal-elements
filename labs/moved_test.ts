/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

// The modules that left labs keep working from their old paths until 1.0.

import * as oldElementInternals from './behaviors/element-internals.js';
import * as oldValidator from './behaviors/validators/validator.js';
import * as oldItem from './item/item.js';
import * as elementInternals from '../behaviors/element-internals.js';
import * as validator from '../behaviors/validators/validator.js';
import * as item from '../item/item.js';

describe('modules moved out of labs', () => {
  it('re-exports behaviors from the old path', () => {
    expect(oldElementInternals.mixinElementInternals).toBe(
      elementInternals.mixinElementInternals,
    );
    expect(oldValidator.Validator).toBe(validator.Validator);
  });

  it('re-exports petal-item from the old path', () => {
    expect(oldItem.PetalItem).toBe(item.PetalItem);
    expect(customElements.get('petal-item')).toBe(item.PetalItem);
  });
});
