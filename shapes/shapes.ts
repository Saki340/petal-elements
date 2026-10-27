/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The Material 3 Expressive shapes, after Jetpack Compose's
 * `MaterialShapes` and androidx.graphics.shapes: the 35 shapes as rounded
 * polygons, morphs between any two of them, and both as SVG path data for
 * `clip-path: path()`, `<path d>` or a canvas `Path2D`. See
 * docs/components/shape.md.
 */

import {MaterialShapes} from '../internal/shapes/material-shapes.js';
import {RoundedPolygon} from '../internal/shapes/rounded-polygon.js';

export {circle, polygon, rectangle, star} from '../internal/shapes/material-shapes.js';
export {Morph} from '../internal/shapes/morph.js';
export {morphPath, shapePath} from '../internal/shapes/path.js';
export {CornerRounding, RoundedPolygon} from '../internal/shapes/rounded-polygon.js';

/** The names of the 35 shapes, as in Compose's `MaterialShapes`. */
export type ShapeName =
  | 'circle'
  | 'square'
  | 'slanted'
  | 'arch'
  | 'fan'
  | 'arrow'
  | 'semi-circle'
  | 'oval'
  | 'pill'
  | 'triangle'
  | 'diamond'
  | 'clam-shell'
  | 'pentagon'
  | 'gem'
  | 'sunny'
  | 'very-sunny'
  | 'cookie-4-sided'
  | 'cookie-6-sided'
  | 'cookie-7-sided'
  | 'cookie-9-sided'
  | 'cookie-12-sided'
  | 'ghostish'
  | 'clover-4-leaf'
  | 'clover-8-leaf'
  | 'burst'
  | 'soft-burst'
  | 'boom'
  | 'soft-boom'
  | 'flower'
  | 'puffy'
  | 'puffy-diamond'
  | 'pixel-circle'
  | 'pixel-triangle'
  | 'bun'
  | 'heart';

/** `cookie4Sided` -> `cookie-4-sided`. */
const kebab = (name: string) => name.replace(/([A-Z]|\d+)/g, (part) => `-${part.toLowerCase()}`);

const factories = new Map<string, () => RoundedPolygon>(
  Object.entries(MaterialShapes).map(([name, make]) => [kebab(name), make]),
);
const cache = new Map<string, RoundedPolygon>();

/** The names of the 35 shapes, in Compose's order. */
export const shapeNames = [...factories.keys()] as readonly ShapeName[];

/**
 * The shape of that name, normalized: it fits the square from 0 to 1. Shapes
 * are made once and shared.
 *
 * @example
 * ```js
 * const d = shapePath(materialShape('cookie-9-sided'), 48);
 * ```
 */
export function materialShape(name: ShapeName): RoundedPolygon {
  let shape = cache.get(name);
  if (!shape) {
    const make = factories.get(name);
    if (!make) throw new Error(`Unknown shape: ${name}`);
    shape = make();
    cache.set(name, shape);
  }
  return shape;
}

/** Whether `name` is one of the 35 shapes. */
export function isShapeName(name: string): name is ShapeName {
  return factories.has(name);
}
