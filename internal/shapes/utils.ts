/**
 * @license
 * Copyright 2022 The Android Open Source Project
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

// TypeScript port of androidx.graphics.shapes (Utils.kt, Point.kt) from
// https://github.com/androidx/androidx/tree/df73c2438e78ba644a436dc402ede6ba2d472812/graphics/graphics-shapes
// Modified for petal-elements: ported to TypeScript. See NOTICE.

/** A point or vector. */
export interface Point {
  readonly x: number;
  readonly y: number;
}

export const point = (x: number, y: number): Point => ({x, y});

export const ZERO = point(0, 0);

export const DISTANCE_EPSILON = 1e-4;
export const ANGLE_EPSILON = 1e-6;
/** For operations that allow higher tolerances, such as collinearity. */
export const RELAXED_DISTANCE_EPSILON = 5e-3;

export const TWO_PI = 2 * Math.PI;

export const distance = (x: number, y: number) => Math.sqrt(x * x + y * y);
export const distanceSquared = (x: number, y: number) => x * x + y * y;

export const getDistance = (p: Point) => Math.sqrt(p.x * p.x + p.y * p.y);
export const getDistanceSquared = (p: Point) => p.x * p.x + p.y * p.y;
export const dotProduct = (p: Point, o: Point) => p.x * o.x + p.y * o.y;
export const clockwise = (p: Point, o: Point) => p.x * o.y - p.y * o.x > 0;
export const plus = (p: Point, o: Point) => point(p.x + o.x, p.y + o.y);
export const minus = (p: Point, o: Point) => point(p.x - o.x, p.y - o.y);
export const times = (p: Point, f: number) => point(p.x * f, p.y * f);
export const div = (p: Point, f: number) => point(p.x / f, p.y / f);
export const negate = (p: Point) => point(-p.x, -p.y);
export const rotate90 = (p: Point) => point(-p.y, p.x);

export function getDirection(p: Point): Point {
  const d = getDistance(p);
  if (!(d > 0)) throw new Error("Can't get the direction of a 0-length vector");
  return div(p, d);
}

/** Unit vector in the direction of (x, y). */
export function directionVector(x: number, y: number): Point {
  const d = distance(x, y);
  if (!(d > 0)) throw new Error('Required distance greater than zero');
  return point(x / d, y / d);
}

export const directionVectorOfAngle = (radians: number) =>
  point(Math.cos(radians), Math.sin(radians));

export const radialToCartesian = (radius: number, radians: number, center = ZERO) =>
  plus(times(directionVectorOfAngle(radians), radius), center);

export const interpolate = (start: number, stop: number, fraction: number) =>
  (1 - fraction) * start + fraction * stop;

export const interpolatePoint = (start: Point, stop: Point, fraction: number) =>
  point(interpolate(start.x, stop.x, fraction), interpolate(start.y, stop.y, fraction));

/** `num % mod`, always positive. */
export const positiveModulo = (num: number, mod: number) => ((num % mod) + mod) % mod;

/** Whether C is on the line through A and B. */
export function collinearIsh(
  aX: number,
  aY: number,
  bX: number,
  bY: number,
  cX: number,
  cY: number,
  tolerance = DISTANCE_EPSILON,
) {
  const ab = rotate90(point(bX - aX, bY - aY));
  const ac = point(cX - aX, cY - aY);
  const dot = Math.abs(dotProduct(ab, ac));
  const relativeTolerance = tolerance * getDistance(ab) * getDistance(ac);
  return dot < tolerance || dot < relativeTolerance;
}

/** Whether the corner at `current` is convex. */
export const convex = (previous: Point, current: Point, next: Point) =>
  clockwise(minus(current, previous), minus(next, current));

/** Ternary search for the parameter in [v0, v1] that minimizes f. */
export function findMinimum(v0: number, v1: number, f: (value: number) => number, tolerance = 1e-3) {
  let a = v0;
  let b = v1;
  while (b - a > tolerance) {
    const c1 = (2 * a + b) / 3;
    const c2 = (2 * b + a) / 3;
    if (f(c1) < f(c2)) b = c2;
    else a = c1;
  }
  return (a + b) / 2;
}

/** Transforms a point; returns the new [x, y]. */
export type PointTransformer = (x: number, y: number) => [number, number];
