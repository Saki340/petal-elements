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

  it('reveals the new theme with a soft-edged circle from the pointer', async () => {
    const root = document.documentElement;
    const animate = spyOn(root, 'animate').and.callThrough();
    let activeDuringApply = false;
    let center = '';
    await transitionTheme(
      () => {
        activeDuringApply = root.classList.contains('petal-theme-transition');
        center = `${root.style.getPropertyValue('--petal-theme-transition-x')} ${root.style.getPropertyValue('--petal-theme-transition-y')}`;
        root.classList.add('dark-test');
      },
      {x: 10, y: 20},
    );
    expect(root.classList.contains('dark-test')).toBeTrue();
    expect(activeDuringApply).toBeTrue();
    expect(center).toBe('10px 20px');
    // Only while the transition runs.
    expect(root.classList.contains('petal-theme-transition')).toBeFalse();
    expect(root.style.getPropertyValue('--petal-theme-transition-x')).toBe('');

    const [keyframes, options] = animate.calls.mostRecent().args as [
      Record<string, string[]>,
      KeyframeAnimationOptions,
    ];
    const radii = keyframes['--petal-theme-transition-radius'].map(parseFloat);
    expect(options.pseudoElement).toBe('::view-transition-new(root)');
    expect(options.easing).toBe('linear');
    // Holds the last frame until the view transition finishes.
    expect(options.fill).toBe('forwards');
    expect(radii[0]).toBe(0);
    // The opaque part, inside the 320px soft edge, ends on the farthest corner.
    const corner = Math.hypot(innerWidth - 10, innerHeight - 20);
    expect(radii[radii.length - 1]).toBeCloseTo(corner + 320, 3);
    // It slows down toward the corner and never goes past it.
    for (let i = 1; i < radii.length; i++) {
      expect(radii[i]).toBeGreaterThanOrEqual(radii[i - 1]);
    }
    const last = radii.length - 1;
    expect(radii[last] - radii[last - 1]).toBeLessThan((radii[2] - radii[1]) / 10);
  });

  it('follows the slow spatial spring of the page', async () => {
    const root = document.documentElement;
    const animate = spyOn(root, 'animate').and.callThrough();
    await transitionTheme(() => {}, {x: 0, y: 0});
    const expressive = Number((animate.calls.mostRecent().args[1] as KeyframeAnimationOptions).duration);
    root.style.setProperty('--md-sys-motion-spring-slow-spatial-damping', '0.9');
    root.style.setProperty('--md-sys-motion-spring-slow-spatial-stiffness', '300');
    try {
      await transitionTheme(() => {}, {x: 0, y: 0});
    } finally {
      root.style.removeProperty('--md-sys-motion-spring-slow-spatial-damping');
      root.style.removeProperty('--md-sys-motion-spring-slow-spatial-stiffness');
    }
    const standard = Number((animate.calls.mostRecent().args[1] as KeyframeAnimationOptions).duration);
    expect(expressive).toBeGreaterThan(300);
    expect(standard).not.toBe(expressive);
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
