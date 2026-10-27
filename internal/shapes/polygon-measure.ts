/**
 * @license
 * Copyright 2023 The Android Open Source Project
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

// TypeScript port of androidx.graphics.shapes PolygonMeasure.kt from
// https://github.com/androidx/androidx/tree/df73c2438e78ba644a436dc402ede6ba2d472812/graphics/graphics-shapes
// Modified for petal-elements: ported to TypeScript. See NOTICE.

import {Cubic} from './cubic.js';
import {Feature} from './features.js';
import {ProgressableFeature} from './mapping.js';
import {RoundedPolygon} from './rounded-polygon.js';
import {DISTANCE_EPSILON, getDistance, minus, point, positiveModulo} from './utils.js';

/** Measures cubics by their approximate length (LengthMeasurer). */
const SEGMENTS = 3;

function closestProgressTo(cubic: Cubic, threshold: number): [number, number] {
  let total = 0;
  let remainder = threshold;
  let prev = point(cubic.anchor0X, cubic.anchor0Y);
  for (let i = 1; i <= SEGMENTS; i++) {
    const progress = i / SEGMENTS;
    const p = cubic.pointOnCurve(progress);
    const segment = getDistance(minus(p, prev));
    if (segment >= remainder) {
      return [progress - (1 - remainder / segment) / SEGMENTS, threshold];
    }
    remainder -= segment;
    total += segment;
    prev = p;
  }
  return [1, total];
}

const measureCubic = (c: Cubic) => closestProgressTo(c, Infinity)[1];
const findCubicCutPoint = (c: Cubic, m: number) => closestProgressTo(c, m)[0];

/** A cubic with its range of progress along the outline. */
export class MeasuredCubic {
  readonly measuredSize: number;

  constructor(
    readonly cubic: Cubic,
    public startOutlineProgress: number,
    public endOutlineProgress: number,
  ) {
    if (endOutlineProgress < startOutlineProgress) {
      throw new Error('endOutlineProgress is expected to be equal or greater than startOutlineProgress');
    }
    this.measuredSize = measureCubic(cubic);
  }

  cutAtProgress(cutOutlineProgress: number): [MeasuredCubic, MeasuredCubic] {
    const bounded = Math.min(Math.max(cutOutlineProgress, this.startOutlineProgress), this.endOutlineProgress);
    const size = this.endOutlineProgress - this.startOutlineProgress;
    const relativeProgress = (bounded - this.startOutlineProgress) / size;
    const t = findCubicCutPoint(this.cubic, relativeProgress * this.measuredSize);
    if (!(t >= 0 && t <= 1)) throw new Error('Cubic cut point is expected to be between 0 and 1');
    const [c1, c2] = this.cubic.split(t);
    return [
      new MeasuredCubic(c1, this.startOutlineProgress, bounded),
      new MeasuredCubic(c2, bounded, this.endOutlineProgress),
    ];
  }
}

/** A polygon's cubics and features, with their progress along the outline. */
export class MeasuredPolygon {
  readonly cubics: MeasuredCubic[];

  private constructor(
    readonly features: ProgressableFeature[],
    cubics: readonly Cubic[],
    outlineProgress: number[],
  ) {
    if (outlineProgress.length !== cubics.length + 1) {
      throw new Error('Outline progress size is expected to be the cubics size + 1');
    }
    if (outlineProgress[0] !== 0) throw new Error('First outline progress value is expected to be zero');
    if (outlineProgress[outlineProgress.length - 1] !== 1) {
      throw new Error('Last outline progress value is expected to be one');
    }
    const measured: MeasuredCubic[] = [];
    let start = 0;
    for (let i = 0; i < cubics.length; i++) {
      if (outlineProgress[i + 1] - outlineProgress[i] > DISTANCE_EPSILON) {
        measured.push(new MeasuredCubic(cubics[i], start, outlineProgress[i + 1]));
        start = outlineProgress[i + 1];
      }
    }
    measured[measured.length - 1].endOutlineProgress = 1;
    this.cubics = measured;
  }

  /** The same outline, starting at `cuttingPoint`. */
  cutAndShift(cuttingPoint: number): MeasuredPolygon {
    if (!(cuttingPoint >= 0 && cuttingPoint <= 1)) {
      throw new Error('Cutting point is expected to be between 0 and 1');
    }
    if (cuttingPoint < DISTANCE_EPSILON) return this;
    const targetIndex = this.cubics.findIndex(
      (c) => cuttingPoint >= c.startOutlineProgress && cuttingPoint <= c.endOutlineProgress,
    );
    const [b1, b2] = this.cubics[targetIndex].cutAtProgress(cuttingPoint);
    const n = this.cubics.length;
    const retCubics = [b2.cubic];
    for (let i = 1; i < n; i++) retCubics.push(this.cubics[(i + targetIndex) % n].cubic);
    retCubics.push(b1.cubic);
    const retOutlineProgress: number[] = [];
    for (let index = 0; index < n + 2; index++) {
      if (index === 0) retOutlineProgress.push(0);
      else if (index === n + 1) retOutlineProgress.push(1);
      else {
        const cubicIndex = (targetIndex + index - 1) % n;
        retOutlineProgress.push(positiveModulo(this.cubics[cubicIndex].endOutlineProgress - cuttingPoint, 1));
      }
    }
    const newFeatures = this.features.map((f) => ({
      progress: positiveModulo(f.progress - cuttingPoint, 1),
      feature: f.feature,
    }));
    return new MeasuredPolygon(newFeatures, retCubics, retOutlineProgress);
  }

  static measure(polygon: RoundedPolygon): MeasuredPolygon {
    const cubics: Cubic[] = [];
    const featureToCubic: Array<[Feature, number]> = [];
    for (const feature of polygon.features) {
      feature.cubics.forEach((cubic, cubicIndex) => {
        if (!feature.isEdge && cubicIndex === Math.floor(feature.cubics.length / 2)) {
          featureToCubic.push([feature, cubics.length]);
        }
        cubics.push(cubic);
      });
    }
    const measures = [0];
    for (const cubic of cubics) {
      const m = measureCubic(cubic);
      if (!(m >= 0)) throw new Error('Measured cubic is expected to be greater or equal to zero');
      measures.push(measures[measures.length - 1] + m);
    }
    const total = measures[measures.length - 1];
    const outlineProgress = measures.map((m) => m / total);
    const features = featureToCubic.map(([feature, ix]) => ({
      progress: positiveModulo((outlineProgress[ix] + outlineProgress[ix + 1]) / 2, 1),
      feature,
    }));
    return new MeasuredPolygon(features, cubics, outlineProgress);
  }
}
