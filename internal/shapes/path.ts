/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

// Shapes as SVG path data, placed like Compose's RoundedPolygon.toShape()
// (MaterialShapes.kt): the path is scaled to the size, then moved so the
// center of its bounds is the center of the size.

import {Cubic} from './cubic.js';
import {Feature} from './features.js';
import {Morph} from './morph.js';
import {RoundedPolygon} from './rounded-polygon.js';
import {point} from './utils.js';

/**
 * SVG path data for closed `cubics`, scaled by `scaleX` and `scaleY` and
 * centered in a `boxWidth` by `boxHeight` box. The bounds are those of the
 * points, control points included, as Compose's `Path.getBounds()`.
 */
export function cubicsPath(
  cubics: readonly Cubic[],
  scaleX: number,
  scaleY: number,
  boxWidth = scaleX,
  boxHeight = scaleY,
) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const cubic of cubics) {
    for (let i = 0; i < 8; i += 2) {
      minX = Math.min(minX, cubic.points[i]);
      maxX = Math.max(maxX, cubic.points[i]);
      minY = Math.min(minY, cubic.points[i + 1]);
      maxY = Math.max(maxY, cubic.points[i + 1]);
    }
  }
  const dx = boxWidth / 2 - ((minX + maxX) / 2) * scaleX;
  const dy = boxHeight / 2 - ((minY + maxY) / 2) * scaleY;
  const x = (v: number) => round(v * scaleX + dx);
  const y = (v: number) => round(v * scaleY + dy);
  const first = cubics[0];
  let d = `M${x(first.anchor0X)} ${y(first.anchor0Y)}`;
  for (const c of cubics) {
    d += `C${x(c.control0X)} ${y(c.control0Y)} ${x(c.control1X)} ${y(c.control1Y)} ${x(c.anchor1X)} ${y(c.anchor1Y)}`;
  }
  return `${d}Z`;
}

/** Two decimals, without trailing zeros. */
const round = (v: number) => String(Math.round(v * 100) / 100);

/** A normalized polygon as path data, filling `width` by `height`. */
export function shapePath(polygon: RoundedPolygon, width = 1, height = width) {
  return cubicsPath(polygon.cubics, width, height);
}

/** A morph at `progress` as path data, filling `width` by `height`. */
export function morphPath(morph: Morph, progress: number, width = 1, height = width) {
  return cubicsPath(morph.asCubics(progress), width, height);
}

/**
 * The outline of a morph at `progress` as a polygon, to morph on from where
 * an interrupted morph is. Its curved cubics become corners (convex or
 * concave by the way they turn) and its straight ones edges, so that the new
 * morph can match its corners to the target's.
 */
export function morphOutline(morph: Morph, progress: number) {
  const cubics = morph.asCubics(progress);
  const features = cubics.map((c) => {
    // The turn from the first control segment to the last.
    const cross =
      (c.control0X - c.anchor0X) * (c.anchor1Y - c.control1Y) -
      (c.control0Y - c.anchor0Y) * (c.anchor1X - c.control1X);
    if (Math.abs(cross) < 1e-6) return Feature.edge([c]);
    return Feature.corner([c], cross > 0);
  });
  let cx = 0;
  let cy = 0;
  for (const c of cubics) {
    cx += c.anchor0X;
    cy += c.anchor0Y;
  }
  return new RoundedPolygon(features, point(cx / cubics.length, cy / cubics.length));
}
