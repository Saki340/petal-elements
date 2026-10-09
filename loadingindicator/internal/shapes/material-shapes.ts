/**
 * @license
 * Copyright 2023 The Android Open Source Project
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

// TypeScript port of the shapes used by the loading indicator, from
// androidx.graphics.shapes (Shapes.kt: circle, star) and
// androidx.compose.material3.MaterialShapes (MaterialShapes.kt), at
// https://github.com/androidx/androidx/tree/df73c2438e78ba644a436dc402ede6ba2d472812
// Modified for petal-elements: ported to TypeScript, only these shapes. See
// NOTICE.

import {CornerRounding, RoundedPolygon} from './rounded-polygon.js';
import {point, Point, PointTransformer, radialToCartesian} from './utils.js';

/** RoundedPolygon.circle: a circle from `numVertices` rounded vertices. */
export function circle(numVertices = 8, radius = 1, centerX = 0, centerY = 0) {
  if (numVertices < 3) throw new Error('Circle must have at least three vertices');
  const theta = Math.PI / numVertices;
  const polygonRadius = radius / Math.cos(theta);
  return RoundedPolygon.regular(numVertices, polygonRadius, centerX, centerY, new CornerRounding(radius));
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

/** The MaterialShapes the loading indicator morphs between, normalized. */
export const MaterialShapes = {
  circle: () => circle(10).normalized(),
  softBurst: () =>
    customPolygon([pnr(0.193, 0.277, round(0.053)), pnr(0.176, 0.055, round(0.053))], 10).normalized(),
  cookie9Sided: () =>
    star(9, 1, 0.8, round(0.5)).transformed(rotateZ(-90)).normalized(),
  pentagon: () =>
    customPolygon(
      [pnr(0.5, -0.009, round(0.172)), pnr(1.03, 0.365, round(0.164)), pnr(0.828, 0.97, round(0.169))],
      1,
      undefined,
      true,
    ).normalized(),
  pill: () =>
    customPolygon(
      [pnr(0.961, 0.039, round(0.426)), pnr(1.001, 0.428), pnr(1.0, 0.609, round(1.0))],
      2,
      undefined,
      true,
    ).normalized(),
  sunny: () => star(8, 1, 0.8, round(0.15)).normalized(),
  cookie4Sided: () =>
    customPolygon([pnr(1.237, 1.236, round(0.258)), pnr(0.5, 0.918, round(0.233))], 4).normalized(),
  oval: () => circle().transformed(scale(1, 0.64)).transformed(rotateZ(-45)).normalized(),
};
