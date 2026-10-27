/**
 * @license
 * Copyright 2023 The Android Open Source Project
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

// TypeScript port of androidx.graphics.shapes FloatMapping.kt and
// FeatureMapping.kt from
// https://github.com/androidx/androidx/tree/df73c2438e78ba644a436dc402ede6ba2d472812/graphics/graphics-shapes
// Modified for petal-elements: ported to TypeScript. See NOTICE.

import {Feature} from './features.js';
import {DISTANCE_EPSILON, getDistanceSquared, minus, point, positiveModulo} from './utils.js';

export function progressInRange(progress: number, from: number, to: number) {
  return to >= from ? progress >= from && progress <= to : progress >= from || progress <= to;
}

export const progressDistance = (p1: number, p2: number) => {
  const d = Math.abs(p1 - p2);
  return Math.min(d, 1 - d);
};

function linearMap(xValues: number[], yValues: number[], x: number) {
  if (!(x >= 0 && x <= 1)) throw new Error(`Invalid progress: ${x}`);
  const n = xValues.length;
  let start = -1;
  for (let i = 0; i < n; i++) {
    if (progressInRange(x, xValues[i], xValues[(i + 1) % n])) {
      start = i;
      break;
    }
  }
  if (start < 0) throw new Error('No segment found');
  const end = (start + 1) % n;
  const segmentSizeX = positiveModulo(xValues[end] - xValues[start], 1);
  const segmentSizeY = positiveModulo(yValues[end] - yValues[start], 1);
  const positionInSegment =
    segmentSizeX < 0.001 ? 0.5 : positiveModulo(x - xValues[start], 1) / segmentSizeX;
  return positiveModulo(yValues[start] + segmentSizeY * positionInSegment, 1);
}

function validateProgress(p: number[]) {
  let prev = p[p.length - 1];
  let wraps = 0;
  for (const curr of p) {
    if (!(curr >= 0 && curr < 1)) throw new Error(`FloatMapping - Progress outside of range: ${p}`);
    if (!(progressDistance(curr, prev) > DISTANCE_EPSILON)) {
      throw new Error(`FloatMapping - Progress repeats a value: ${p}`);
    }
    if (curr < prev && ++wraps > 1) {
      throw new Error(`FloatMapping - Progress wraps more than once: ${p}`);
    }
    prev = curr;
  }
}

/** Maps progress on one shape's outline to progress on the other's, and back. */
export class DoubleMapper {
  private readonly sourceValues: number[];
  private readonly targetValues: number[];

  constructor(mappings: Array<[number, number]>) {
    this.sourceValues = mappings.map(([s]) => s);
    this.targetValues = mappings.map(([, t]) => t);
    validateProgress(this.sourceValues);
    validateProgress(this.targetValues);
  }

  map(x: number) {
    return linearMap(this.sourceValues, this.targetValues, x);
  }

  mapBack(x: number) {
    return linearMap(this.targetValues, this.sourceValues, x);
  }
}

/** A feature with its position (0..1) along the outline. */
export interface ProgressableFeature {
  progress: number;
  feature: Feature;
}

const IDENTITY_MAPPING: Array<[number, number]> = [
  [0, 0],
  [0.5, 0.5],
];

/**
 * Matches the corners of two shapes, closest first, keeping their order along
 * the outlines.
 */
export function featureMapper(features1: ProgressableFeature[], features2: ProgressableFeature[]) {
  const corners1 = features1.filter((f) => !f.feature.isEdge);
  const corners2 = features2.filter((f) => !f.feature.isEdge);
  return new DoubleMapper(doMapping(corners1, corners2));
}

function doMapping(features1: ProgressableFeature[], features2: ProgressableFeature[]) {
  const pairs: Array<{distance: number; f1: ProgressableFeature; f2: ProgressableFeature}> = [];
  for (const f1 of features1) {
    for (const f2 of features2) {
      const d = featureDistSquared(f1.feature, f2.feature);
      if (d !== Number.MAX_VALUE) pairs.push({distance: d, f1, f2});
    }
  }
  pairs.sort((a, b) => a.distance - b.distance);
  if (pairs.length === 0) return IDENTITY_MAPPING;
  if (pairs.length === 1) {
    const f1 = pairs[0].f1.progress;
    const f2 = pairs[0].f2.progress;
    return [
      [f1, f2],
      [(f1 + 0.5) % 1, (f2 + 0.5) % 1],
    ] as Array<[number, number]>;
  }
  const mapping: Array<[number, number]> = [];
  const usedF1 = new Set<ProgressableFeature>();
  const usedF2 = new Set<ProgressableFeature>();
  for (const {f1, f2} of pairs) {
    if (usedF1.has(f1) || usedF2.has(f2)) continue;
    // Binary search by f1.progress, as Kotlin's binarySearchBy.
    let lo = 0;
    let hi = mapping.length - 1;
    let found = false;
    while (lo <= hi) {
      const mid = (lo + hi) >>> 1;
      const v = mapping[mid][0];
      if (v < f1.progress) lo = mid + 1;
      else if (v > f1.progress) hi = mid - 1;
      else {
        found = true;
        break;
      }
    }
    if (found) throw new Error("There can't be two features with the same progress");
    const insertionIndex = lo;
    const n = mapping.length;
    if (n >= 1) {
      const [before1, before2] = mapping[(insertionIndex + n - 1) % n];
      const [after1, after2] = mapping[insertionIndex % n];
      if (
        progressDistance(f1.progress, before1) < DISTANCE_EPSILON ||
        progressDistance(f1.progress, after1) < DISTANCE_EPSILON ||
        progressDistance(f2.progress, before2) < DISTANCE_EPSILON ||
        progressDistance(f2.progress, after2) < DISTANCE_EPSILON
      ) {
        continue;
      }
      if (n > 1 && !progressInRange(f2.progress, before2, after2)) continue;
    }
    mapping.splice(insertionIndex, 0, [f1.progress, f2.progress]);
    usedF1.add(f1);
    usedF2.add(f2);
  }
  return mapping;
}

function featureDistSquared(f1: Feature, f2: Feature) {
  if (!f1.isEdge && !f2.isEdge && f1.isConvexCorner !== f2.isConvexCorner) return Number.MAX_VALUE;
  return getDistanceSquared(minus(representativePoint(f1), representativePoint(f2)));
}

function representativePoint(feature: Feature) {
  const first = feature.cubics[0];
  const last = feature.cubics[feature.cubics.length - 1];
  return point((first.anchor0X + last.anchor1X) / 2, (first.anchor0Y + last.anchor1Y) / 2);
}
