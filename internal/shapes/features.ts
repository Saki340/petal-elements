/**
 * @license
 * Copyright 2023 The Android Open Source Project
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

// TypeScript port of androidx.graphics.shapes.Feature (Features.kt) from
// https://github.com/androidx/androidx/tree/df73c2438e78ba644a436dc402ede6ba2d472812/graphics/graphics-shapes
// Modified for petal-elements: ported to TypeScript. See NOTICE.

import {Cubic} from './cubic.js';
import {PointTransformer} from './utils.js';

/**
 * A part of a polygon's outline: an edge or a (convex or concave) corner.
 * Morph matches features of two shapes to each other.
 */
export class Feature {
  constructor(
    readonly cubics: readonly Cubic[],
    /** `edge`, or a corner that is convex or concave. */
    readonly type: 'edge' | 'convex' | 'concave',
  ) {}

  get isIgnorableFeature() {
    return this.type === 'edge';
  }
  get isEdge() {
    return this.type === 'edge';
  }
  get isConvexCorner() {
    return this.type === 'convex';
  }
  get isConcaveCorner() {
    return this.type === 'concave';
  }

  transformed(f: PointTransformer) {
    return new Feature(
      this.cubics.map((cubic) => cubic.transformed(f)),
      this.type,
    );
  }

  reversed() {
    const cubics = [...this.cubics].reverse().map((cubic) => cubic.reverse());
    // The convex flag flips with the orientation, as in the original.
    const type = this.type === 'edge' ? 'edge' : this.type === 'convex' ? 'concave' : 'convex';
    return new Feature(cubics, type);
  }

  static edge(cubics: readonly Cubic[]) {
    return new Feature(cubics, 'edge');
  }

  static corner(cubics: readonly Cubic[], convex = true) {
    return new Feature(cubics, convex ? 'convex' : 'concave');
  }
}
