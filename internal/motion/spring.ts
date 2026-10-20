/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

// A spring like Compose's spring() animation spec (SpringSimulation.kt): the
// value moves toward its target with the spring's physics, keeping its
// velocity when the target changes mid-way.

/** A spring's damping ratio and stiffness (Compose's spring() parameters). */
export interface SpringSpec {
  dampingRatio: number;
  stiffness: number;
}

/** Compose's default visibility threshold for floats (Spring.DefaultDisplacementThreshold). */
const THRESHOLD = 0.01;

/**
 * Reads a `--md-sys-motion-spring-<name>-damping` and `-stiffness` pair from
 * an element, e.g. `fast-spatial`, falling back to `fallback`. Pages switch
 * the scheme by setting these properties (tokens/css/motion-standard.css).
 */
export function springFromCss(element: Element, name: string, fallback: SpringSpec): SpringSpec {
  const style = getComputedStyle(element);
  const read = (suffix: string) =>
    parseFloat(style.getPropertyValue(`--md-sys-motion-spring-${name}-${suffix}`));
  const dampingRatio = read('damping');
  const stiffness = read('stiffness');
  return dampingRatio > 0 && stiffness > 0 ? {dampingRatio, stiffness} : fallback;
}

// Fallbacks when the page has no spring tokens: the expressive scheme, the
// default (ExpressiveMotionTokens).

/** ExpressiveMotionTokens.SpringDefaultSpatial: damping 0.8, stiffness 380. */
export const DEFAULT_SPATIAL: SpringSpec = {dampingRatio: 0.8, stiffness: 380};

/** ExpressiveMotionTokens.SpringFastSpatial: damping 0.6, stiffness 800. */
export const FAST_SPATIAL: SpringSpec = {dampingRatio: 0.6, stiffness: 800};

/** ExpressiveMotionTokens.SpringSlowSpatial: damping 0.8, stiffness 200. */
export const SLOW_SPATIAL: SpringSpec = {dampingRatio: 0.8, stiffness: 200};

/**
 * The spring from 0 to 1 as a CSS `linear()` easing and its duration, for the
 * Web Animations API.
 */
export function springEasing(spec: SpringSpec) {
  const spring = new Spring(spec);
  spring.target = 1;
  const frameMs = 1000 / 60;
  const points = [0];
  while (!spring.atRest && points.length < 600) {
    spring.step(frameMs);
    points.push(Number(spring.value.toFixed(4)));
  }
  points[points.length - 1] = 1;
  return {
    easing: `linear(${points.join(', ')})`,
    duration: Math.round((points.length - 1) * frameMs),
  };
}

/** A value driven by a spring. */
export class Spring {
  value = 0;
  velocity = 0;
  target = 0;

  /**
   * @param threshold The distance and speed below which the spring is at
   *     rest (Compose's visibilityThreshold).
   */
  constructor(
    public spec: SpringSpec,
    private readonly threshold = THRESHOLD,
  ) {}

  /** Whether the value has settled on its target. */
  get atRest() {
    return (
      Math.abs(this.value - this.target) < this.threshold &&
      Math.abs(this.velocity) < this.threshold
    );
  }

  /** Moves the value `ms` milliseconds forward. */
  step(ms: number) {
    if (this.atRest) {
      this.value = this.target;
      this.velocity = 0;
      return;
    }
    const t = ms / 1000;
    const {dampingRatio: zeta, stiffness} = this.spec;
    const omega = Math.sqrt(stiffness);
    const x0 = this.value - this.target;
    const v0 = this.velocity;
    let x: number;
    let v: number;
    if (zeta > 1) {
      // Over-damped.
      const root = omega * Math.sqrt(zeta * zeta - 1);
      const r1 = -zeta * omega - root;
      const r2 = -zeta * omega + root;
      const c2 = (v0 - r1 * x0) / (r2 - r1);
      const c1 = x0 - c2;
      x = c1 * Math.exp(r1 * t) + c2 * Math.exp(r2 * t);
      v = c1 * r1 * Math.exp(r1 * t) + c2 * r2 * Math.exp(r2 * t);
    } else if (zeta === 1) {
      // Critically damped.
      const c1 = x0;
      const c2 = v0 + omega * x0;
      const e = Math.exp(-omega * t);
      x = (c1 + c2 * t) * e;
      v = (c2 - omega * (c1 + c2 * t)) * e;
    } else {
      // Under-damped: overshoots.
      const omegaD = omega * Math.sqrt(1 - zeta * zeta);
      const cos = Math.cos(omegaD * t);
      const sin = Math.sin(omegaD * t);
      const e = Math.exp(-zeta * omega * t);
      const sinCoef = (v0 + zeta * omega * x0) / omegaD;
      x = e * (x0 * cos + sinCoef * sin);
      v =
        e *
        (-zeta * omega * (x0 * cos + sinCoef * sin) + omegaD * (sinCoef * cos - x0 * sin));
    }
    this.value = this.target + x;
    this.velocity = v;
  }
}
