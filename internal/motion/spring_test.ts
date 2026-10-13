/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import {Spring} from './spring.js';

/** Steps a spring in 16ms frames and returns its values. */
function run(spring: Spring, frames: number) {
  const values: number[] = [];
  for (let i = 0; i < frames; i++) {
    spring.step(16);
    values.push(spring.value);
  }
  return values;
}

describe('Spring', () => {
  it('overshoots with the expressive fast spatial spring (damping 0.6)', () => {
    const spring = new Spring({dampingRatio: 0.6, stiffness: 800});
    spring.target = 1;
    const values = run(spring, 60);
    expect(Math.max(...values)).toBeGreaterThan(1.05);
    expect(spring.atRest).toBeTrue();
    expect(spring.value).toBe(1);
  });

  it('barely overshoots with the standard one (damping 0.9)', () => {
    const spring = new Spring({dampingRatio: 0.9, stiffness: 1400});
    spring.target = 1;
    const values = run(spring, 60);
    expect(Math.max(...values)).toBeLessThan(1.01);
    expect(spring.value).toBe(1);
  });

  it('keeps its velocity when the target changes mid-way', () => {
    const spring = new Spring({dampingRatio: 0.6, stiffness: 800});
    spring.target = 1;
    run(spring, 4);
    const before = spring.value;
    expect(spring.velocity).toBeGreaterThan(0);
    spring.target = 0;
    spring.step(16);
    // Still moving up for a moment, like Compose's Animatable.
    expect(spring.value).toBeGreaterThan(before);
  });

  it('settles critically and over-damped springs without overshoot', () => {
    for (const dampingRatio of [1, 1.5]) {
      const spring = new Spring({dampingRatio, stiffness: 1000});
      spring.target = 1;
      expect(Math.max(...run(spring, 120))).toBeLessThanOrEqual(1);
      expect(spring.value).toBe(1);
    }
  });
});
