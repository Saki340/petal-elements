/**
 * @license
 * Copyright 2022 The Android Open Source Project
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

// TypeScript port of androidx.graphics.shapes.Cubic (Cubic.kt) from
// https://github.com/androidx/androidx/tree/df73c2438e78ba644a436dc402ede6ba2d472812/graphics/graphics-shapes
// Modified for petal-elements: ported to TypeScript. See NOTICE.

import {
  convex,
  DISTANCE_EPSILON,
  directionVector,
  distance,
  dotProduct,
  interpolate,
  point,
  Point,
  PointTransformer,
  rotate90,
} from './utils.js';

/** A cubic Bézier curve: anchor0, control0, control1, anchor1. */
export class Cubic {
  constructor(readonly points: Float64Array = new Float64Array(8)) {
    if (points.length !== 8) throw new Error('Points array size should be 8');
  }

  static of(
    anchor0X: number,
    anchor0Y: number,
    control0X: number,
    control0Y: number,
    control1X: number,
    control1Y: number,
    anchor1X: number,
    anchor1Y: number,
  ) {
    return new Cubic(
      Float64Array.of(anchor0X, anchor0Y, control0X, control0Y, control1X, control1Y, anchor1X, anchor1Y),
    );
  }

  static fromPoints(anchor0: Point, control0: Point, control1: Point, anchor1: Point) {
    return Cubic.of(anchor0.x, anchor0.y, control0.x, control0.y, control1.x, control1.y, anchor1.x, anchor1.y);
  }

  get anchor0X() {
    return this.points[0];
  }
  get anchor0Y() {
    return this.points[1];
  }
  get control0X() {
    return this.points[2];
  }
  get control0Y() {
    return this.points[3];
  }
  get control1X() {
    return this.points[4];
  }
  get control1Y() {
    return this.points[5];
  }
  get anchor1X() {
    return this.points[6];
  }
  get anchor1Y() {
    return this.points[7];
  }

  pointOnCurve(t: number): Point {
    const u = 1 - t;
    return point(
      this.anchor0X * (u * u * u) +
        this.control0X * (3 * t * u * u) +
        this.control1X * (3 * t * t * u) +
        this.anchor1X * (t * t * t),
      this.anchor0Y * (u * u * u) +
        this.control0Y * (3 * t * u * u) +
        this.control1Y * (3 * t * t * u) +
        this.anchor1Y * (t * t * t),
    );
  }

  zeroLength() {
    return (
      Math.abs(this.anchor0X - this.anchor1X) < DISTANCE_EPSILON &&
      Math.abs(this.anchor0Y - this.anchor1Y) < DISTANCE_EPSILON
    );
  }

  convexTo(next: Cubic) {
    return convex(
      point(this.anchor0X, this.anchor0Y),
      point(this.anchor1X, this.anchor1Y),
      point(next.anchor1X, next.anchor1Y),
    );
  }

  /** Bounds as [left, top, right, bottom]. */
  calculateBounds(bounds = new Float64Array(4), approximate = false) {
    if (this.zeroLength()) {
      bounds[0] = bounds[2] = this.anchor0X;
      bounds[1] = bounds[3] = this.anchor0Y;
      return bounds;
    }
    let minX = Math.min(this.anchor0X, this.anchor1X);
    let minY = Math.min(this.anchor0Y, this.anchor1Y);
    let maxX = Math.max(this.anchor0X, this.anchor1X);
    let maxY = Math.max(this.anchor0Y, this.anchor1Y);
    if (approximate) {
      bounds[0] = Math.min(minX, this.control0X, this.control1X);
      bounds[1] = Math.min(minY, this.control0Y, this.control1Y);
      bounds[2] = Math.max(maxX, this.control0X, this.control1X);
      bounds[3] = Math.max(maxY, this.control0Y, this.control1Y);
      return bounds;
    }
    // Roots of the derivative (a quadratic) give the extremes.
    const extremes = (a0: number, c0: number, c1: number, a1: number) => {
      const ts: number[] = [];
      const a = -a0 + 3 * c0 - 3 * c1 + a1;
      const b = 2 * a0 - 4 * c0 + 2 * c1;
      const c = -a0 + c0;
      if (Math.abs(a) < DISTANCE_EPSILON) {
        if (b !== 0) ts.push((2 * c) / (-2 * b));
      } else {
        const s = b * b - 4 * a * c;
        if (s >= 0) {
          ts.push((-b + Math.sqrt(s)) / (2 * a), (-b - Math.sqrt(s)) / (2 * a));
        }
      }
      return ts.filter((t) => t >= 0 && t <= 1);
    };
    for (const t of extremes(this.anchor0X, this.control0X, this.control1X, this.anchor1X)) {
      const x = this.pointOnCurve(t).x;
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
    }
    for (const t of extremes(this.anchor0Y, this.control0Y, this.control1Y, this.anchor1Y)) {
      const y = this.pointOnCurve(t).y;
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
    bounds[0] = minX;
    bounds[1] = minY;
    bounds[2] = maxX;
    bounds[3] = maxY;
    return bounds;
  }

  split(t: number): [Cubic, Cubic] {
    const u = 1 - t;
    const p = this.pointOnCurve(t);
    return [
      Cubic.of(
        this.anchor0X,
        this.anchor0Y,
        this.anchor0X * u + this.control0X * t,
        this.anchor0Y * u + this.control0Y * t,
        this.anchor0X * (u * u) + this.control0X * (2 * u * t) + this.control1X * (t * t),
        this.anchor0Y * (u * u) + this.control0Y * (2 * u * t) + this.control1Y * (t * t),
        p.x,
        p.y,
      ),
      Cubic.of(
        p.x,
        p.y,
        this.control0X * (u * u) + this.control1X * (2 * u * t) + this.anchor1X * (t * t),
        this.control0Y * (u * u) + this.control1Y * (2 * u * t) + this.anchor1Y * (t * t),
        this.control1X * u + this.anchor1X * t,
        this.control1Y * u + this.anchor1Y * t,
        this.anchor1X,
        this.anchor1Y,
      ),
    ];
  }

  reverse() {
    return Cubic.of(
      this.anchor1X,
      this.anchor1Y,
      this.control1X,
      this.control1Y,
      this.control0X,
      this.control0Y,
      this.anchor0X,
      this.anchor0Y,
    );
  }

  plus(o: Cubic) {
    return new Cubic(this.points.map((v, i) => v + o.points[i]));
  }

  times(x: number) {
    return new Cubic(this.points.map((v) => v * x));
  }

  div(x: number) {
    return this.times(1 / x);
  }

  transformed(f: PointTransformer) {
    const points = new Float64Array(this.points);
    for (let i = 0; i < 8; i += 2) {
      [points[i], points[i + 1]] = f(points[i], points[i + 1]);
    }
    return new Cubic(points);
  }

  static straightLine(x0: number, y0: number, x1: number, y1: number) {
    return Cubic.of(
      x0,
      y0,
      interpolate(x0, x1, 1 / 3),
      interpolate(y0, y1, 1 / 3),
      interpolate(x0, x1, 2 / 3),
      interpolate(y0, y1, 2 / 3),
      x1,
      y1,
    );
  }

  /** An arc of a circle centered at (centerX, centerY), less than 180 degrees. */
  static circularArc(centerX: number, centerY: number, x0: number, y0: number, x1: number, y1: number) {
    const p0d = directionVector(x0 - centerX, y0 - centerY);
    const p1d = directionVector(x1 - centerX, y1 - centerY);
    const rotatedP0 = rotate90(p0d);
    const rotatedP1 = rotate90(p1d);
    const clockwise = dotProduct(rotatedP0, point(x1 - centerX, y1 - centerY)) >= 0;
    const cosa = dotProduct(p0d, p1d);
    if (cosa > 0.999) return Cubic.straightLine(x0, y0, x1, y1);
    const k =
      ((((distance(x0 - centerX, y0 - centerY) * 4) / 3) *
        (Math.sqrt(2 * (1 - cosa)) - Math.sqrt(1 - cosa * cosa))) /
        (1 - cosa)) *
      (clockwise ? 1 : -1);
    return Cubic.of(
      x0,
      y0,
      x0 + rotatedP0.x * k,
      y0 + rotatedP0.y * k,
      x1 - rotatedP1.x * k,
      y1 - rotatedP1.y * k,
      x1,
      y1,
    );
  }

  static empty(x0: number, y0: number) {
    return Cubic.of(x0, y0, x0, y0, x0, y0, x0, y0);
  }

  /** The cubic between c1 and c2 at `progress`. */
  static interpolate(c1: Cubic, c2: Cubic, progress: number) {
    return new Cubic(c1.points.map((v, i) => interpolate(v, c2.points[i], progress)));
  }
}
