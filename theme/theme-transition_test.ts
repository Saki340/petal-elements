/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import {springEasing} from '../internal/motion/spring.js';

import {transitionTheme} from './theme-transition.js';

describe('transitionTheme()', () => {
  afterEach(() => {
    document.documentElement.classList.remove('dark-test');
  });

  it('changes the theme at once with reduced motion', async () => {
    spyOn(window, 'matchMedia').and.returnValue({matches: true} as MediaQueryList);
    const spy = spyOn(document, 'startViewTransition').and.callThrough();
    await transitionTheme(() => {
      document.documentElement.classList.add('dark-test');
    });
    expect(document.documentElement.classList.contains('dark-test')).toBeTrue();
    expect(spy).not.toHaveBeenCalled();
  });

  it('reveals the new theme with a circle from the pointer', async () => {
    const root = document.documentElement;
    const animate = spyOn(root, 'animate').and.callThrough();
    let activeDuringApply = false;
    await transitionTheme(
      () => {
        activeDuringApply = root.classList.contains('petal-theme-transition');
        root.classList.add('dark-test');
      },
      {x: 10, y: 20},
    );
    expect(root.classList.contains('dark-test')).toBeTrue();
    expect(activeDuringApply).toBeTrue();
    // Only while the transition runs.
    expect(root.classList.contains('petal-theme-transition')).toBeFalse();
    const [keyframes, options] = animate.calls.mostRecent().args as [
      {clipPath: string[]},
      KeyframeAnimationOptions,
    ];
    expect(keyframes.clipPath[0]).toBe('circle(0px at 10px 20px)');
    const radius = Math.hypot(innerWidth - 10, innerHeight - 20);
    expect(keyframes.clipPath[1]).toBe(`circle(${radius}px at 10px 20px)`);
    expect(options.pseudoElement).toBe('::view-transition-new(root)');
    expect(String(options.easing)).toMatch(/^linear\(/);
  });
});

describe('springEasing()', () => {
  it('samples the expressive slow spatial spring, which overshoots', () => {
    const {easing, duration} = springEasing({dampingRatio: 0.8, stiffness: 200});
    const points = easing.slice('linear('.length, -1).split(', ').map(Number);
    expect(points[0]).toBe(0);
    expect(points[points.length - 1]).toBe(1);
    expect(Math.max(...points)).toBeGreaterThan(1);
    expect(duration).toBeGreaterThan(300);
  });

  it('does not overshoot with the standard one', () => {
    const {easing} = springEasing({dampingRatio: 0.9, stiffness: 300});
    const points = easing.slice('linear('.length, -1).split(', ').map(Number);
    expect(Math.max(...points)).toBeLessThan(1.01);
  });
});
