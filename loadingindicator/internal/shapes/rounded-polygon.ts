/**
 * @license
 * Copyright 2022 The Android Open Source Project
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

// TypeScript port of androidx.graphics.shapes.RoundedPolygon and
// CornerRounding (RoundedPolygon.kt, CornerRounding.kt) from
// https://github.com/androidx/androidx/tree/df73c2438e78ba644a436dc402ede6ba2d472812/graphics/graphics-shapes
// Modified for petal-elements: ported to TypeScript. See NOTICE.

import {Cubic} from './cubic.js';
import {Feature} from './features.js';
import {
  convex,
  DISTANCE_EPSILON,
  directionVector,
  distance,
  distanceSquared,
  div,
  dotProduct,
  getDirection,
  getDistance,
  interpolatePoint,
  minus,
  plus,
  point,
  Point,
  PointTransformer,
  radialToCartesian,
  rotate90,
  times,
} from './utils.js';

/** Corner rounding: a radius and how much of the corner is smoothed (0..1). */
export class CornerRounding {
  constructor(
    readonly radius = 0,
    readonly smoothing = 0,
  ) {}

  static readonly UNROUNDED = new CornerRounding();
}

/** A polygon with rounded corners, as a list of features (corners and edges). */
export class RoundedPolygon {
  readonly cubics: readonly Cubic[];

  constructor(
    readonly features: readonly Feature[],
    readonly center: Point,
  ) {
    this.cubics = buildCubics(features, center);
    let prev = this.cubics[this.cubics.length - 1];
    for (const cubic of this.cubics) {
      if (
        Math.abs(cubic.anchor0X - prev.anchor1X) > DISTANCE_EPSILON ||
        Math.abs(cubic.anchor0Y - prev.anchor1Y) > DISTANCE_EPSILON
      ) {
        throw new Error(
          'RoundedPolygon must be contiguous, with the anchor points of all curves matching ' +
            'the anchor points of the preceding and succeeding cubics',
        );
      }
      prev = cubic;
    }
  }

  get centerX() {
    return this.center.x;
  }

  get centerY() {
    return this.center.y;
  }

  transformed(f: PointTransformer) {
    const [x, y] = f(this.center.x, this.center.y);
    return new RoundedPolygon(
      this.features.map((feature) => feature.transformed(f)),
      point(x, y),
    );
  }

  /** Scaled and moved into the unit square, centered. */
  normalized() {
    const bounds = this.calculateBounds();
    const width = bounds[2] - bounds[0];
    const height = bounds[3] - bounds[1];
    const side = Math.max(width, height);
    const offsetX = (side - width) / 2 - bounds[0];
    const offsetY = (side - height) / 2 - bounds[1];
    return this.transformed((x, y) => [(x + offsetX) / side, (y + offsetY) / side]);
  }

  /** Bounds of the shape as it rotates around its center. */
  calculateMaxBounds(bounds = new Float64Array(4)) {
    let maxDistSquared = 0;
    for (const cubic of this.cubics) {
      const anchorDistance = distanceSquared(cubic.anchor0X - this.centerX, cubic.anchor0Y - this.centerY);
      const middle = cubic.pointOnCurve(0.5);
      const middleDistance = distanceSquared(middle.x - this.centerX, middle.y - this.centerY);
      maxDistSquared = Math.max(maxDistSquared, anchorDistance, middleDistance);
    }
    const d = Math.sqrt(maxDistSquared);
    bounds[0] = this.centerX - d;
    bounds[1] = this.centerY - d;
    bounds[2] = this.centerX + d;
    bounds[3] = this.centerY + d;
    return bounds;
  }

  calculateBounds(bounds = new Float64Array(4), approximate = true) {
    // The original starts the maximums at Float.MIN_VALUE (the smallest
    // positive float).
    let minX = Number.MAX_VALUE;
    let minY = Number.MAX_VALUE;
    let maxX = Number.MIN_VALUE;
    let maxY = Number.MIN_VALUE;
    for (const cubic of this.cubics) {
      cubic.calculateBounds(bounds, approximate);
      minX = Math.min(minX, bounds[0]);
      minY = Math.min(minY, bounds[1]);
      maxX = Math.max(maxX, bounds[2]);
      maxY = Math.max(maxY, bounds[3]);
    }
    bounds[0] = minX;
    bounds[1] = minY;
    bounds[2] = maxX;
    bounds[3] = maxY;
    return bounds;
  }

  /**
   * A regular polygon with `numVertices` vertices on a circle of `radius`, the
   * first at angle 0.
   */
  static regular(
    numVertices: number,
    radius = 1,
    centerX = 0,
    centerY = 0,
    rounding = CornerRounding.UNROUNDED,
    perVertexRounding?: readonly CornerRounding[],
  ) {
    return RoundedPolygon.fromVertices(
      verticesFromNumVerts(numVertices, radius, centerX, centerY),
      rounding,
      perVertexRounding,
      centerX,
      centerY,
    );
  }

  /** A polygon through `vertices` ([x0, y0, x1, y1, ...]). */
  static fromVertices(
    vertices: ArrayLike<number>,
    rounding = CornerRounding.UNROUNDED,
    perVertexRounding?: readonly CornerRounding[],
    centerX = UNSET,
    centerY = UNSET,
  ) {
    if (vertices.length < 6) throw new Error('Polygons must have at least 3 vertices');
    if (vertices.length % 2 === 1) throw new Error('The vertices array should have even size');
    if (perVertexRounding && perVertexRounding.length * 2 !== vertices.length) {
      throw new Error(
        'perVertexRounding list should be either null or the same size as the number of vertices',
      );
    }
    const n = vertices.length / 2;
    const vertex = (i: number) => point(vertices[i * 2], vertices[i * 2 + 1]);
    const roundedCorners: RoundedCorner[] = [];
    for (let i = 0; i < n; i++) {
      roundedCorners.push(
        new RoundedCorner(
          vertex((i + n - 1) % n),
          vertex(i),
          vertex((i + 1) % n),
          perVertexRounding?.[i] ?? rounding,
        ),
      );
    }
    // For each side, how much of the round cut and of the whole (smoothed) cut
    // fits: [roundCutRatio, cutRatio].
    const cutAdjusts: Array<[number, number]> = [];
    for (let ix = 0; ix < n; ix++) {
      const next = (ix + 1) % n;
      const expectedRoundCut = roundedCorners[ix].expectedRoundCut + roundedCorners[next].expectedRoundCut;
      const expectedCut = roundedCorners[ix].expectedCut + roundedCorners[next].expectedCut;
      const a = vertex(ix);
      const b = vertex(next);
      const sideSize = distance(a.x - b.x, a.y - b.y);
      if (expectedRoundCut > sideSize) {
        cutAdjusts.push([sideSize / expectedRoundCut, 0]);
      } else if (expectedCut > sideSize) {
        cutAdjusts.push([1, (sideSize - expectedRoundCut) / (expectedCut - expectedRoundCut)]);
      } else {
        cutAdjusts.push([1, 1]);
      }
    }
    const corners: Cubic[][] = [];
    for (let i = 0; i < n; i++) {
      const allowedCuts: number[] = [];
      for (let delta = 0; delta <= 1; delta++) {
        const [roundCutRatio, cutRatio] = cutAdjusts[(i + n - 1 + delta) % n];
        const corner = roundedCorners[i];
        allowedCuts.push(
          corner.expectedRoundCut * roundCutRatio +
            (corner.expectedCut - corner.expectedRoundCut) * cutRatio,
        );
      }
      corners.push(roundedCorners[i].getCubics(allowedCuts[0], allowedCuts[1]));
    }
    const features: Feature[] = [];
    for (let i = 0; i < n; i++) {
      const next = (i + 1) % n;
      features.push(Feature.corner(corners[i], convex(vertex((i + n - 1) % n), vertex(i), vertex(next))));
      const last = corners[i][corners[i].length - 1];
      const first = corners[next][0];
      features.push(
        Feature.edge([Cubic.straightLine(last.anchor1X, last.anchor1Y, first.anchor0X, first.anchor0Y)]),
      );
    }
    const center =
      centerX === UNSET || centerY === UNSET ? calculateCenter(vertices) : point(centerX, centerY);
    return new RoundedPolygon(features, center);
  }
}

/** Marks an unset center, like the original's Float.MIN_VALUE. */
const UNSET = Number.MIN_VALUE;

function calculateCenter(vertices: ArrayLike<number>) {
  let x = 0;
  let y = 0;
  for (let i = 0; i < vertices.length; i += 2) {
    x += vertices[i];
    y += vertices[i + 1];
  }
  return point(x / (vertices.length / 2), y / (vertices.length / 2));
}

function verticesFromNumVerts(numVertices: number, radius: number, centerX: number, centerY: number) {
  const result = new Float64Array(numVertices * 2);
  for (let i = 0; i < numVertices; i++) {
    const v = plus(radialToCartesian(radius, (Math.PI / numVertices) * 2 * i), point(centerX, centerY));
    result[i * 2] = v.x;
    result[i * 2 + 1] = v.y;
  }
  return result;
}

/**
 * The polygon's cubics: the features' cubics, without zero-length ones, the
 * first feature split in the middle so the outline starts there, and the last
 * anchor matching the first exactly.
 */
function buildCubics(features: readonly Feature[], center: Point): Cubic[] {
  const result: Cubic[] = [];
  let firstCubic: Cubic | null = null;
  let lastCubic: Cubic | null = null;
  let splitStart: Cubic[] | null = null;
  let splitEnd: Cubic[] | null = null;
  if (features.length > 0 && features[0].cubics.length === 3) {
    const [start, end] = features[0].cubics[1].split(0.5);
    splitStart = [features[0].cubics[0], start];
    splitEnd = [end, features[0].cubics[2]];
  }
  for (let i = 0; i <= features.length; i++) {
    let featureCubics: readonly Cubic[];
    if (i === 0 && splitEnd) featureCubics = splitEnd;
    else if (i === features.length) {
      if (splitStart) featureCubics = splitStart;
      else break;
    } else featureCubics = features[i].cubics;
    for (const cubic of featureCubics) {
      if (!cubic.zeroLength()) {
        if (lastCubic) result.push(lastCubic);
        lastCubic = cubic;
        if (!firstCubic) firstCubic = cubic;
      } else if (lastCubic) {
        // Keep the latest anchor point when dropping zero-length curves.
        const points = new Float64Array(lastCubic.points);
        points[6] = cubic.anchor1X;
        points[7] = cubic.anchor1Y;
        lastCubic = new Cubic(points);
      }
    }
  }
  if (lastCubic && firstCubic) {
    result.push(
      Cubic.of(
        lastCubic.anchor0X,
        lastCubic.anchor0Y,
        lastCubic.control0X,
        lastCubic.control0Y,
        lastCubic.control1X,
        lastCubic.control1Y,
        firstCubic.anchor0X,
        firstCubic.anchor0Y,
      ),
    );
  } else {
    result.push(Cubic.empty(center.x, center.y));
  }
  return result;
}

class RoundedCorner {
  readonly d1: Point;
  readonly d2: Point;
  readonly cornerRadius: number;
  readonly smoothing: number;
  readonly cosAngle: number;
  readonly sinAngle: number;
  readonly expectedRoundCut: number;
  center = point(0, 0);

  constructor(
    readonly p0: Point,
    readonly p1: Point,
    readonly p2: Point,
    readonly rounding: CornerRounding,
  ) {
    const v01 = minus(p0, p1);
    const v21 = minus(p2, p1);
    const d01 = getDistance(v01);
    const d21 = getDistance(v21);
    if (d01 > 0 && d21 > 0) {
      this.d1 = div(v01, d01);
      this.d2 = div(v21, d21);
      this.cornerRadius = rounding.radius;
      this.smoothing = rounding.smoothing;
      this.cosAngle = dotProduct(this.d1, this.d2);
      this.sinAngle = Math.sqrt(1 - this.cosAngle * this.cosAngle);
      this.expectedRoundCut =
        this.sinAngle > 1e-3 ? (this.cornerRadius * (this.cosAngle + 1)) / this.sinAngle : 0;
    } else {
      this.d1 = point(0, 0);
      this.d2 = point(0, 0);
      this.cornerRadius = 0;
      this.smoothing = 0;
      this.cosAngle = 0;
      this.sinAngle = 0;
      this.expectedRoundCut = 0;
    }
  }

  get expectedCut() {
    return (1 + this.smoothing) * this.expectedRoundCut;
  }

  getCubics(allowedCut0: number, allowedCut1 = allowedCut0): Cubic[] {
    const allowedCut = Math.min(allowedCut0, allowedCut1);
    if (
      this.expectedRoundCut < DISTANCE_EPSILON ||
      allowedCut < DISTANCE_EPSILON ||
      this.cornerRadius < DISTANCE_EPSILON
    ) {
      this.center = this.p1;
      return [Cubic.straightLine(this.p1.x, this.p1.y, this.p1.x, this.p1.y)];
    }
    const actualRoundCut = Math.min(allowedCut, this.expectedRoundCut);
    const actualSmoothing0 = this.actualSmoothing(allowedCut0);
    const actualSmoothing1 = this.actualSmoothing(allowedCut1);
    const actualR = (this.cornerRadius * actualRoundCut) / this.expectedRoundCut;
    const centerDistance = Math.sqrt(actualR * actualR + actualRoundCut * actualRoundCut);
    this.center = plus(this.p1, times(getDirection(div(plus(this.d1, this.d2), 2)), centerDistance));
    const circleIntersection0 = plus(this.p1, times(this.d1, actualRoundCut));
    const circleIntersection2 = plus(this.p1, times(this.d2, actualRoundCut));
    const flanking0 = this.flankingCurve(
      actualRoundCut,
      actualSmoothing0,
      this.p1,
      this.p0,
      circleIntersection0,
      circleIntersection2,
      this.center,
      actualR,
    );
    const flanking2 = this.flankingCurve(
      actualRoundCut,
      actualSmoothing1,
      this.p1,
      this.p2,
      circleIntersection2,
      circleIntersection0,
      this.center,
      actualR,
    ).reverse();
    return [
      flanking0,
      Cubic.circularArc(
        this.center.x,
        this.center.y,
        flanking0.anchor1X,
        flanking0.anchor1Y,
        flanking2.anchor0X,
        flanking2.anchor0Y,
      ),
      flanking2,
    ];
  }

  private actualSmoothing(allowedCut: number) {
    if (allowedCut > this.expectedCut) return this.smoothing;
    if (allowedCut > this.expectedRoundCut) {
      return (
        (this.smoothing * (allowedCut - this.expectedRoundCut)) /
        (this.expectedCut - this.expectedRoundCut)
      );
    }
    return 0;
  }

  private flankingCurve(
    actualRoundCut: number,
    actualSmoothing: number,
    corner: Point,
    sideStart: Point,
    circleSegmentIntersection: Point,
    otherCircleSegmentIntersection: Point,
    circleCenter: Point,
    actualR: number,
  ) {
    const sideDirection = getDirection(minus(sideStart, corner));
    const curveStart = plus(corner, times(sideDirection, actualRoundCut * (1 + actualSmoothing)));
    const p = interpolatePoint(
      circleSegmentIntersection,
      div(plus(circleSegmentIntersection, otherCircleSegmentIntersection), 2),
      actualSmoothing,
    );
    const curveEnd = plus(
      circleCenter,
      times(directionVector(p.x - circleCenter.x, p.y - circleCenter.y), actualR),
    );
    const circleTangent = rotate90(minus(curveEnd, circleCenter));
    const anchorEnd =
      lineIntersection(sideStart, sideDirection, curveEnd, circleTangent) ?? circleSegmentIntersection;
    const anchorStart = div(plus(curveStart, times(anchorEnd, 2)), 3);
    return Cubic.fromPoints(curveStart, anchorStart, anchorEnd, curveEnd);
  }
}

function lineIntersection(p0: Point, d0: Point, p1: Point, d1: Point): Point | null {
  const rotatedD1 = rotate90(d1);
  const den = dotProduct(d0, rotatedD1);
  if (Math.abs(den) < DISTANCE_EPSILON) return null;
  const num = dotProduct(minus(p1, p0), rotatedD1);
  if (Math.abs(den) < DISTANCE_EPSILON * Math.abs(num)) return null;
  return plus(p0, times(d0, num / den));
}
