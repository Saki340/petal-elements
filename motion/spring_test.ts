/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

// The public springs: values from Jetpack Compose's ExpressiveMotionTokens
// and StandardMotionTokens (androidx commit df73c24).

import {emulateMedia} from '@web/test-runner-commands';

import {
  animateSpring,
  expressiveSprings,
  Spring,
  springEasing,
  springFromCss,
  standardSprings,
} from './spring.js';

describe('public springs', () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement('div');
    document.body.append(element);
  });

  afterEach(async () => {
    element.remove();
    await emulateMedia({reducedMotion: 'no-preference'});
  });

  it('has both motion schemes, as in Compose', () => {
    expect(expressiveSprings).toEqual({
      fastSpatial: {dampingRatio: 0.6, stiffness: 800},
      defaultSpatial: {dampingRatio: 0.8, stiffness: 380},
      slowSpatial: {dampingRatio: 0.8, stiffness: 200},
      fastEffects: {dampingRatio: 1, stiffness: 3800},
      defaultEffects: {dampingRatio: 1, stiffness: 1600},
      slowEffects: {dampingRatio: 1, stiffness: 800},
    });
    expect(standardSprings).toEqual({
      fastSpatial: {dampingRatio: 0.9, stiffness: 1400},
      defaultSpatial: {dampingRatio: 0.9, stiffness: 700},
      slowSpatial: {dampingRatio: 0.9, stiffness: 300},
      fastEffects: {dampingRatio: 1, stiffness: 3800},
      defaultEffects: {dampingRatio: 1, stiffness: 1600},
      slowEffects: {dampingRatio: 1, stiffness: 800},
    });
  });

  it("reads the page's spring of a name, or falls back to the expressive one", () => {
    expect(springFromCss(element, 'slow-effects')).toEqual(expressiveSprings.slowEffects);
    element.style.setProperty('--md-sys-motion-spring-fast-spatial-damping', '0.9');
    element.style.setProperty('--md-sys-motion-spring-fast-spatial-stiffness', '1400');
    expect(springFromCss(element, 'fast-spatial')).toEqual(standardSprings.fastSpatial);
  });

  it('turns a spring into a linear() easing that ends at 1, cached', () => {
    const easing = springEasing(expressiveSprings.fastSpatial);
    expect(easing.easing).toMatch(/^linear\(0, .*, 1\)$/);
    // The expressive fast spatial spring overshoots.
    const points = easing.easing.slice('linear('.length, -1).split(', ').map(Number);
    expect(Math.max(...points)).toBeGreaterThan(1);
    expect(easing.duration).toBeGreaterThan(200);
    expect(springEasing({...expressiveSprings.fastSpatial})).toBe(easing);
  });

  it('animates on the named spring of the page', () => {
    const animation = animateSpring(element, {opacity: [0, 1]}, 'default-spatial');
    const timing = animation.effect!.getTiming();
    expect(timing.duration).toBe(springEasing(expressiveSprings.defaultSpatial).duration);
    // The browser writes the linear() easing out with percentages.
    expect(timing.easing).toMatch(/^linear\(0 0%, .*, 1 100%\)$/);
    animation.cancel();
  });

  it('takes a spring of its own, and options that win', () => {
    const spec = {dampingRatio: 0.5, stiffness: 300};
    const animation = animateSpring(element, [{opacity: 0}, {opacity: 1}], spec, {
      fill: 'forwards',
      delay: 50,
    });
    const timing = animation.effect!.getTiming();
    expect(timing.duration).toBe(springEasing(spec).duration);
    expect(timing.fill).toBe('forwards');
    expect(timing.delay).toBe(50);
    animation.cancel();
  });

  it('jumps to the end with reduced motion', async () => {
    await emulateMedia({reducedMotion: 'reduce'});
    const animation = animateSpring(element, {opacity: [0, 1]});
    expect(animation.effect!.getTiming().duration).toBe(0);
    animation.cancel();
  });

  it('exports the spring for motion that keeps its speed', () => {
    const spring = new Spring(expressiveSprings.defaultSpatial);
    spring.target = 100;
    for (let i = 0; i < 10; i++) spring.step(16);
    const halfway = spring.velocity;
    expect(halfway).toBeGreaterThan(0);
    // A new target keeps the current velocity.
    spring.target = 0;
    expect(spring.velocity).toBe(halfway);
    for (let i = 0; i < 200; i++) spring.step(16);
    expect(spring.atRest).toBeTrue();
    expect(spring.value).toBe(0);
  });
});
