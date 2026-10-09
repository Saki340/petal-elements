/**
 * @license
 * Copyright 2022 The Android Open Source Project
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

// TypeScript port of androidx.graphics.shapes.Morph (Morph.kt) from
// https://github.com/androidx/androidx/tree/df73c2438e78ba644a436dc402ede6ba2d472812/graphics/graphics-shapes
// Modified for petal-elements: ported to TypeScript. See NOTICE.

import {Cubic} from './cubic.js';
import {featureMapper} from './mapping.js';
import {MeasuredCubic, MeasuredPolygon} from './polygon-measure.js';
import {RoundedPolygon} from './rounded-polygon.js';
import {ANGLE_EPSILON, positiveModulo} from './utils.js';

/** A morph between two polygons: pairs of cubics, matched by their features. */
export class Morph {
  private readonly morphMatch: Array<[Cubic, Cubic]>;

  constructor(
    private readonly start: RoundedPolygon,
    private readonly end: RoundedPolygon,
  ) {
    this.morphMatch = Morph.match(start, end);
  }

  calculateBounds(bounds = new Float64Array(4), approximate = true) {
    this.start.calculateBounds(bounds, approximate);
    const [minX, minY, maxX, maxY] = bounds;
    this.end.calculateBounds(bounds, approximate);
    bounds[0] = Math.min(minX, bounds[0]);
    bounds[1] = Math.min(minY, bounds[1]);
    bounds[2] = Math.max(maxX, bounds[2]);
    bounds[3] = Math.max(maxY, bounds[3]);
    return bounds;
  }

  /** The outline at `progress` (0 start, 1 end), as closed cubics. */
  asCubics(progress: number): Cubic[] {
    const result: Cubic[] = [];
    let first: Cubic | null = null;
    let last: Cubic | null = null;
    for (const [a, b] of this.morphMatch) {
      const cubic = Cubic.interpolate(a, b, progress);
      if (!first) first = cubic;
      if (last) result.push(last);
      last = cubic;
    }
    if (last && first) {
      result.push(
        Cubic.of(
          last.anchor0X,
          last.anchor0Y,
          last.control0X,
          last.control0Y,
          last.control1X,
          last.control1Y,
          first.anchor0X,
          first.anchor0Y,
        ),
      );
    }
    return result;
  }

  static match(p1: RoundedPolygon, p2: RoundedPolygon): Array<[Cubic, Cubic]> {
    const measured1 = MeasuredPolygon.measure(p1);
    const measured2 = MeasuredPolygon.measure(p2);
    const doubleMapper = featureMapper(measured1.features, measured2.features);
    const polygon2CutPoint = doubleMapper.map(0);
    const bs1 = measured1.cubics;
    const bs2 = measured2.cutAndShift(polygon2CutPoint).cubics;
    const result: Array<[Cubic, Cubic]> = [];
    let i1 = 0;
    let i2 = 0;
    let b1: MeasuredCubic | undefined = bs1[i1++];
    let b2: MeasuredCubic | undefined = bs2[i2++];
    while (b1 && b2) {
      const b1a = i1 === bs1.length ? 1 : b1.endOutlineProgress;
      const b2a =
        i2 === bs2.length
          ? 1
          : doubleMapper.mapBack(positiveModulo(b2.endOutlineProgress + polygon2CutPoint, 1));
      const minb = Math.min(b1a, b2a);
      let seg1: MeasuredCubic;
      let newb1: MeasuredCubic | undefined;
      if (b1a > minb + ANGLE_EPSILON) {
        [seg1, newb1] = b1.cutAtProgress(minb);
      } else {
        seg1 = b1;
        newb1 = bs1[i1++];
      }
      let seg2: MeasuredCubic;
      let newb2: MeasuredCubic | undefined;
      if (b2a > minb + ANGLE_EPSILON) {
        [seg2, newb2] = b2.cutAtProgress(positiveModulo(doubleMapper.map(minb) - polygon2CutPoint, 1));
      } else {
        seg2 = b2;
        newb2 = bs2[i2++];
      }
      result.push([seg1.cubic, seg2.cubic]);
      b1 = newb1;
      b2 = newb2;
    }
    if (b1 || b2) throw new Error("Expected both Polygon's Cubic to be fully matched");
    return result;
  }
}
