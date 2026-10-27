/**
 * @license
 * Copyright 2023 The Android Open Source Project
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

// TypeScript port of androidx.graphics.shapes (Shapes.kt: circle, rectangle,
// star) and androidx.compose.material3.MaterialShapes (MaterialShapes.kt, all
// 35 shapes), at
// https://github.com/androidx/androidx/tree/df73c2438e78ba644a436dc402ede6ba2d472812
// Modified for petal-elements: ported to TypeScript. See NOTICE.

import {CornerRounding, RoundedPolygon} from './rounded-polygon.js';
import {point, Point, PointTransformer, radialToCartesian} from './utils.js';

/** RoundedPolygon.circle: a circle from `numVertices` rounded vertices. */
export function circle(numVertices = 8, radius = 1, centerX = 0, centerY = 0) {
  if (numVertices < 3) throw new Error('Circle must have at least three vertices');
  const theta = Math.PI / numVertices;
  const polygonRadius = radius / Math.cos(theta);
  return RoundedPolygon.regular(numVertices, polygonRadius, centerX, centerY, new CornerRounding(radius));
}

/** RoundedPolygon(numVertices, ...): a regular polygon on the unit circle. */
export function polygon(
  numVertices: number,
  rounding = CornerRounding.UNROUNDED,
  perVertexRounding?: readonly CornerRounding[],
) {
  return RoundedPolygon.regular(numVertices, 1, 0, 0, rounding, perVertexRounding);
}

/**
 * RoundedPolygon.rectangle: the vertices go right bottom, left bottom, left
 * top, right top.
 */
export function rectangle(
  width = 2,
  height = 2,
  rounding = CornerRounding.UNROUNDED,
  perVertexRounding?: readonly CornerRounding[],
  centerX = 0,
  centerY = 0,
) {
  const left = centerX - width / 2;
  const top = centerY - height / 2;
  const right = centerX + width / 2;
  const bottom = centerY + height / 2;
  return RoundedPolygon.fromVertices(
    [right, bottom, left, bottom, left, top, right, top],
    rounding,
    perVertexRounding,
    centerX,
    centerY,
  );
}

/** RoundedPolygon.star. */
export function star(
  numVerticesPerRadius: number,
  radius = 1,
  innerRadius = 0.5,
  rounding = CornerRounding.UNROUNDED,
  innerRounding?: CornerRounding,
  centerX = 0,
  centerY = 0,
) {
  if (radius <= 0 || innerRadius <= 0) throw new Error('Star radii must both be greater than 0');
  if (innerRadius >= radius) throw new Error('innerRadius must be less than radius');
  const perVertexRounding = innerRounding
    ? Array.from({length: numVerticesPerRadius}).flatMap(() => [rounding, innerRounding])
    : undefined;
  const vertices = new Float64Array(numVerticesPerRadius * 4);
  for (let i = 0; i < numVerticesPerRadius; i++) {
    const outer = radialToCartesian(radius, (Math.PI / numVerticesPerRadius) * 2 * i);
    const inner = radialToCartesian(innerRadius, (Math.PI / numVerticesPerRadius) * (2 * i + 1));
    vertices.set([outer.x + centerX, outer.y + centerY, inner.x + centerX, inner.y + centerY], i * 4);
  }
  return RoundedPolygon.fromVertices(vertices, rounding, perVertexRounding, centerX, centerY);
}

/** Compose's Matrix().rotateZ(degrees), as a point transformer. */
export function rotateZ(degrees: number): PointTransformer {
  const a = (degrees * Math.PI) / 180;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  return (x, y) => [x * cos - y * sin, x * sin + y * cos];
}

const scale =
  (sx: number, sy: number): PointTransformer =>
  (x, y) => [x * sx, y * sy];

interface PointNRound {
  o: Point;
  r: CornerRounding;
}

const pnr = (x: number, y: number, r = CornerRounding.UNROUNDED): PointNRound => ({o: point(x, y), r});

const toRadians = (degrees: number) => (degrees / 360) * 2 * Math.PI;
const angleDegrees = (p: Point) => (Math.atan2(p.y, p.x) * 180) / Math.PI;

function rotateDegrees(p: Point, angle: number, center: Point) {
  const a = toRadians(angle);
  const x = p.x - center.x;
  const y = p.y - center.y;
  return point(x * Math.cos(a) - y * Math.sin(a) + center.x, x * Math.sin(a) + y * Math.cos(a) + center.y);
}

function doRepeat(points: PointNRound[], reps: number, center: Point, mirroring: boolean) {
  const result: PointNRound[] = [];
  if (mirroring) {
    const rel = points.map((p) => point(p.o.x - center.x, p.o.y - center.y));
    const angles = rel.map(angleDegrees);
    const distances = rel.map((p) => Math.sqrt(p.x * p.x + p.y * p.y));
    const actualReps = reps * 2;
    const sectionAngle = 360 / actualReps;
    for (let it = 0; it < actualReps; it++) {
      for (let index = 0; index < points.length; index++) {
        const i = it % 2 === 0 ? index : points.length - 1 - index;
        if (i > 0 || it % 2 === 0) {
          const a = toRadians(
            sectionAngle * it +
              (it % 2 === 0 ? angles[i] : sectionAngle - angles[i] + 2 * angles[0]),
          );
          result.push({
            o: point(Math.cos(a) * distances[i] + center.x, Math.sin(a) * distances[i] + center.y),
            r: points[i].r,
          });
        }
      }
    }
  } else {
    const np = points.length;
    for (let it = 0; it < np * reps; it++) {
      result.push({
        o: rotateDegrees(points[it % np].o, (Math.floor(it / np) * 360) / reps, center),
        r: points[it % np].r,
      });
    }
  }
  return result;
}

function customPolygon(points: PointNRound[], reps: number, center = point(0.5, 0.5), mirroring = false) {
  const actual = doRepeat(points, reps, center, mirroring);
  return RoundedPolygon.fromVertices(
    actual.flatMap((p) => [p.o.x, p.o.y]),
    CornerRounding.UNROUNDED,
    actual.map((p) => p.r),
    center.x,
    center.y,
  );
}

const round = (radius: number, smoothing = 0) => new CornerRounding(radius, smoothing);

// MaterialShapes' corner roundings.
const round15 = round(0.15);
const round20 = round(0.2);
const round30 = round(0.3);
const round50 = round(0.5);
const round100 = round(1);

/**
 * Compose's MaterialShapes, each a function making the shape normalized (in
 * the 0..1 square), in the order of MaterialShapes.kt.
 */
export const MaterialShapes = {
  circle: () => circle(10).normalized(),
  square: () => rectangle(1, 1, round30).normalized(),
  slanted: () =>
    customPolygon([pnr(0.926, 0.97, round(0.189, 0.811)), pnr(-0.021, 0.967, round(0.187, 0.057))], 2).normalized(),
  arch: () =>
    polygon(4, CornerRounding.UNROUNDED, [round100, round100, round20, round20])
      .transformed(rotateZ(-135))
      .normalized(),
  fan: () =>
    customPolygon(
      [
        pnr(1.004, 1.0, round(0.148, 0.417)),
        pnr(0.0, 1.0, round(0.151)),
        pnr(0.0, -0.003, round(0.148)),
        pnr(0.978, 0.02, round(0.803)),
      ],
      1,
    ).normalized(),
  arrow: () =>
    customPolygon(
      [
        pnr(0.5, 0.892, round(0.313)),
        pnr(-0.216, 1.05, round(0.207)),
        pnr(0.499, -0.16, round(0.215, 1.0)),
        pnr(1.225, 1.06, round(0.211)),
      ],
      1,
    ).normalized(),
  semiCircle: () => rectangle(1.6, 1, CornerRounding.UNROUNDED, [round20, round20, round100, round100]).normalized(),
  oval: () => circle().transformed(scale(1, 0.64)).transformed(rotateZ(-45)).normalized(),
  pill: () =>
    customPolygon(
      [pnr(0.961, 0.039, round(0.426)), pnr(1.001, 0.428), pnr(1.0, 0.609, round(1.0))],
      2,
      undefined,
      true,
    ).normalized(),
  triangle: () => polygon(3, round20).transformed(rotateZ(-90)).normalized(),
  diamond: () =>
    customPolygon([pnr(0.5, 1.096, round(0.151, 0.524)), pnr(0.04, 0.5, round(0.159))], 2).normalized(),
  clamShell: () =>
    customPolygon(
      [pnr(0.171, 0.841, round(0.159)), pnr(-0.02, 0.5, round(0.14)), pnr(0.17, 0.159, round(0.159))],
      2,
    ).normalized(),
  pentagon: () =>
    customPolygon(
      [pnr(0.5, -0.009, round(0.172)), pnr(1.03, 0.365, round(0.164)), pnr(0.828, 0.97, round(0.169))],
      1,
      undefined,
      true,
    ).normalized(),
  gem: () =>
    customPolygon(
      [
        pnr(0.499, 1.023, round(0.241, 0.778)),
        pnr(-0.005, 0.792, round(0.208)),
        pnr(0.073, 0.258, round(0.228)),
        pnr(0.433, -0.0, round(0.491)),
      ],
      1,
      undefined,
      true,
    ).normalized(),
  sunny: () => star(8, 1, 0.8, round15).normalized(),
  verySunny: () => customPolygon([pnr(0.5, 1.08, round(0.085)), pnr(0.358, 0.843, round(0.085))], 8).normalized(),
  cookie4Sided: () =>
    customPolygon([pnr(1.237, 1.236, round(0.258)), pnr(0.5, 0.918, round(0.233))], 4).normalized(),
  cookie6Sided: () =>
    customPolygon([pnr(0.723, 0.884, round(0.394)), pnr(0.5, 1.099, round(0.398))], 6).normalized(),
  cookie7Sided: () => star(7, 1, 0.75, round50).transformed(rotateZ(-90)).normalized(),
  cookie9Sided: () => star(9, 1, 0.8, round50).transformed(rotateZ(-90)).normalized(),
  cookie12Sided: () => star(12, 1, 0.8, round50).transformed(rotateZ(-90)).normalized(),
  ghostish: () =>
    customPolygon(
      [
        pnr(0.5, 0, round(1.0)),
        pnr(1, 0, round(1.0)),
        pnr(1, 1.14, round(0.254, 0.106)),
        pnr(0.575, 0.906, round(0.253)),
      ],
      1,
      undefined,
      true,
    ).normalized(),
  clover4Leaf: () =>
    customPolygon([pnr(0.5, 0.074), pnr(0.725, -0.099, round(0.476))], 4, undefined, true).normalized(),
  clover8Leaf: () => customPolygon([pnr(0.5, 0.036), pnr(0.758, -0.101, round(0.209))], 8).normalized(),
  burst: () => customPolygon([pnr(0.5, -0.006, round(0.006)), pnr(0.592, 0.158, round(0.006))], 12).normalized(),
  softBurst: () =>
    customPolygon([pnr(0.193, 0.277, round(0.053)), pnr(0.176, 0.055, round(0.053))], 10).normalized(),
  boom: () => customPolygon([pnr(0.457, 0.296, round(0.007)), pnr(0.5, -0.051, round(0.007))], 15).normalized(),
  softBoom: () =>
    customPolygon(
      [
        pnr(0.733, 0.454),
        pnr(0.839, 0.437, round(0.532)),
        pnr(0.949, 0.449, round(0.439, 1.0)),
        pnr(0.998, 0.478, round(0.174)),
      ],
      16,
      undefined,
      true,
    ).normalized(),
  flower: () =>
    customPolygon(
      [pnr(0.37, 0.187), pnr(0.416, 0.049, round(0.381)), pnr(0.479, 0.001, round(0.095))],
      8,
      undefined,
      true,
    ).normalized(),
  puffy: () =>
    customPolygon(
      [
        pnr(0.5, 0.053),
        pnr(0.545, -0.04, round(0.405)),
        pnr(0.67, -0.035, round(0.426)),
        pnr(0.717, 0.066, round(0.574)),
        pnr(0.722, 0.128),
        pnr(0.777, 0.002, round(0.36)),
        pnr(0.914, 0.149, round(0.66)),
        pnr(0.926, 0.289, round(0.66)),
        pnr(0.881, 0.346),
        pnr(0.94, 0.344, round(0.126)),
        pnr(1.003, 0.437, round(0.255)),
      ],
      2,
      undefined,
      true,
    )
      .transformed(scale(1, 0.742))
      .normalized(),
  puffyDiamond: () =>
    customPolygon(
      [pnr(0.87, 0.13, round(0.146)), pnr(0.818, 0.357), pnr(1.0, 0.332, round(0.853))],
      4,
      undefined,
      true,
    ).normalized(),
  pixelCircle: () =>
    customPolygon(
      [
        pnr(0.5, 0.0),
        pnr(0.704, 0.0),
        pnr(0.704, 0.065),
        pnr(0.843, 0.065),
        pnr(0.843, 0.148),
        pnr(0.926, 0.148),
        pnr(0.926, 0.296),
        pnr(1.0, 0.296),
      ],
      2,
      undefined,
      true,
    ).normalized(),
  pixelTriangle: () =>
    customPolygon(
      [
        pnr(0.11, 0.5),
        pnr(0.113, 0.0),
        pnr(0.287, 0.0),
        pnr(0.287, 0.087),
        pnr(0.421, 0.087),
        pnr(0.421, 0.17),
        pnr(0.56, 0.17),
        pnr(0.56, 0.265),
        pnr(0.674, 0.265),
        pnr(0.675, 0.344),
        pnr(0.789, 0.344),
        pnr(0.789, 0.439),
        pnr(0.888, 0.439),
      ],
      1,
      undefined,
      true,
    ).normalized(),
  bun: () =>
    customPolygon(
      [pnr(0.796, 0.5), pnr(0.853, 0.518, round100), pnr(0.992, 0.631, round100), pnr(0.968, 1.0, round100)],
      2,
      undefined,
      true,
    ).normalized(),
  heart: () =>
    customPolygon(
      [
        pnr(0.5, 0.268, round(0.016)),
        pnr(0.792, -0.066, round(0.958)),
        pnr(1.064, 0.276, round(1.0)),
        pnr(0.501, 0.946, round(0.129)),
      ],
      1,
      undefined,
      true,
    ).normalized(),
};
