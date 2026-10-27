/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

// The shapes of Compose's MaterialShapes (androidx commit df73c24).

import {
  isShapeName,
  materialShape,
  Morph,
  morphPath,
  shapeNames,
  shapePath,
} from './shapes.js';

/**
 * The bounds of a polygon with its control points, [left, top, right,
 * bottom], as normalized() measures them.
 */
const bounds = (name: Parameters<typeof materialShape>[0]) =>
  Array.from(materialShape(name).calculateBounds());

describe('Material shapes', () => {
  it("has Compose's 35 shapes, in its order", () => {
    expect(shapeNames.length).toBe(35);
    expect(shapeNames.slice(0, 8)).toEqual([
      'circle',
      'square',
      'slanted',
      'arch',
      'fan',
      'arrow',
      'semi-circle',
      'oval',
    ]);
    expect(shapeNames).toContain('cookie-12-sided');
    expect(shapeNames).toContain('clover-4-leaf');
    expect(shapeNames[34]).toBe('heart');
    expect(isShapeName('puffy-diamond')).toBeTrue();
    expect(isShapeName('blob')).toBeFalse();
  });

  it('makes every shape normalized, filling 0..1 on its longer side', () => {
    for (const name of shapeNames) {
      const [left, top, right, bottom] = bounds(name);
      expect(left).withContext(name).toBeGreaterThanOrEqual(-1e-3);
      expect(top).withContext(name).toBeGreaterThanOrEqual(-1e-3);
      expect(right).withContext(name).toBeLessThanOrEqual(1 + 1e-3);
      expect(bottom).withContext(name).toBeLessThanOrEqual(1 + 1e-3);
      expect(Math.max(right - left, bottom - top))
        .withContext(name)
        .toBeCloseTo(1, 3);
    }
  });

  it('builds the shapes as Compose does', () => {
    // RoundedPolygon.rectangle(1, 1): a square.
    expect(bounds('square').map((v) => Number(v.toFixed(3)))).toEqual([0, 0, 1, 1]);
    // semiCircle is a 1.6 by 1 rectangle.
    const [l, t, r, b] = bounds('semi-circle');
    expect((r - l) / (b - t)).toBeCloseTo(1.6, 2);
    // Turned -90 degrees, the triangle points up.
    const triangle = materialShape('triangle');
    const top = triangle.cubics.reduce((a, c) => (c.anchor0Y < a.anchor0Y ? c : a));
    expect(top.anchor0X).toBeCloseTo(0.5, 2);
    // Puffy is squashed to 0.742 of its height.
    const [pl, pt, pr, pb] = bounds('puffy');
    expect(pb - pt).toBeLessThan(pr - pl);
  });

  it('shares each shape', () => {
    expect(materialShape('flower')).toBe(materialShape('flower'));
    expect(() => materialShape('blob' as 'flower')).toThrowError(/Unknown shape/);
  });

  it('writes a shape as path data scaled to a size and centered', () => {
    const d = shapePath(materialShape('square'), 200, 100);
    expect(d).toMatch(/^M[\d.]+ [\d.]+(C[\d. ]+)+Z$/);
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.append(path);
    document.body.append(svg);
    path.setAttribute('d', d);
    const box = path.getBBox();
    svg.remove();
    expect(box.x).toBeCloseTo(0, 1);
    expect(box.y).toBeCloseTo(0, 1);
    expect(box.width).toBeCloseTo(200, 1);
    expect(box.height).toBeCloseTo(100, 1);
  });

  it('morphs between any two shapes', () => {
    const morph = new Morph(materialShape('circle'), materialShape('heart'));
    expect(morphPath(morph, 0, 48)).toBe(morphPath(new Morph(materialShape('circle'), materialShape('heart')), 0, 48));
    expect(morphPath(morph, 0.5, 48)).not.toBe(morphPath(morph, 0, 48));
    expect(morphPath(morph, 1, 48)).not.toBe(morphPath(morph, 0.5, 48));
  });
});
