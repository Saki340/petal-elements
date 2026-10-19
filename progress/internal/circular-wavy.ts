/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

// The circular progress indicators, after Jetpack Compose Material 3
// (CircularProgressIndicator in ProgressIndicator.kt, CircularWavyProgressIndicator
// in WavyProgressIndicator.kt and its drawing in
// internal/CircularWavyProgressModifiers.kt). Sizes:
// CircularProgressIndicatorTokens.

import {Cubic} from '../../loadingindicator/internal/shapes/cubic.js';
import {circle, star} from '../../loadingindicator/internal/shapes/material-shapes.js';
import {Morph} from '../../loadingindicator/internal/shapes/morph.js';
import {CornerRounding, RoundedPolygon} from '../../loadingindicator/internal/shapes/rounded-polygon.js';

import {STANDARD} from './wavy.js';

/** Size: the flat indicator. */
export const SIZE = 40;
/** WaveSize: the wavy indicator. */
export const WAVY_SIZE = 48;
/** ActiveThickness and TrackThickness. */
export const STROKE_WIDTH = 4;
/** TrackActiveSpace: the gap between the indicator and the track. */
export const GAP_SIZE = 4;
/** ActiveWaveWavelength. */
export const WAVELENGTH = 15;
/** MinCircularVertexCount. */
const MIN_VERTICES = 5;

/** One indeterminate cycle (CircularAnimationProgressDuration). */
export const INDETERMINATE_CYCLE_MS = 6000;
/** CircularIndeterminateMinProgress and MaxProgress. */
export const MIN_SWEEP = 0.1;
export const MAX_SWEEP = 0.87;

/**
 * The indeterminate indicator `ms` after start: its rotation in degrees and
 * the fraction of the circle it covers. The rotation is a turn and a half
 * every 3 seconds plus a quarter turn in 300ms every 1.5 seconds
 * (circularIndeterminateRotationAnimationSpec; Compose's keyframe easings
 * apply from their keyframe, so the quarter turns are linear). The sweep
 * grows linearly to 0.87 in 3 seconds and shrinks back on the standard
 * easing.
 */
export function indeterminateFrame(ms: number) {
  const t = ms % INDETERMINATE_CYCLE_MS;
  const global = (t / INDETERMINATE_CYCLE_MS) * 1080;
  const quarter = Math.floor(t / 1500);
  const step = Math.min(1, (t - quarter * 1500) / 300);
  const additional = (quarter + step) * 90;
  const sweep =
    t < 3000
      ? MIN_SWEEP + (MAX_SWEEP - MIN_SWEEP) * (t / 3000)
      : MAX_SWEEP - (MAX_SWEEP - MIN_SWEEP) * STANDARD((t - 3000) / 3000);
  return {rotation: global + Math.min(additional, 360), sweep};
}

/**
 * The flat determinate indicator's arcs in degrees, clockwise from 3
 * o'clock: the active arc from 12 o'clock and the track after a gap of
 * GAP_SIZE plus the stroke width (the round caps) on both sides, measured on
 * the indicator's width as in Compose.
 */
export function determinateArcs(progress: number, size = SIZE) {
  const sweep = Math.min(1, Math.max(0, progress || 0)) * 360;
  const gap = ((GAP_SIZE + STROKE_WIDTH) / (Math.PI * size)) * 360;
  const trackGap = Math.min(sweep, gap);
  return {
    active: {start: 270, sweep},
    track: {start: 270 + sweep + trackGap, sweep: 360 - sweep - 2 * trackGap},
  };
}

/** The polygons and morph of the wavy indicator, for its size. */
interface Shapes {
  vertices: number;
  track: RoundedPolygon;
  morph: Morph;
}

const shapesCache = new Map<number, Shapes>();

/**
 * The wavy indicator's shapes (CircularShapes): a circle and a star with as
 * many points as waves fit around it (2πr / wavelength, 5 at least).
 */
export function wavyShapes(size = WAVY_SIZE): Shapes {
  const r = size / 2 - STROKE_WIDTH / 2;
  const vertices = Math.max(MIN_VERTICES, Math.round((2 * Math.PI * r) / WAVELENGTH));
  let shapes = shapesCache.get(vertices);
  if (!shapes) {
    const track = circle(vertices).normalized();
    const active = star(
      vertices,
      1,
      0.75,
      new CornerRounding(0.35, 0.4),
      new CornerRounding(0.5),
    ).normalized();
    shapes = {vertices, track, morph: new Morph(track, active)};
    shapesCache.set(vertices, shapes);
  }
  return shapes;
}

/** A path drawn for an outline, and its length. */
export interface MeasuredPath {
  d: string;
  length: number;
}

const n = (v: number) => Number(v.toFixed(3));

/**
 * The SVG path of the outline (pathFromCubics and processPath): rotated so
 * that it starts at 12 o'clock, scaled to the size minus the stroke width and
 * centered.
 */
export function outlinePath(cubics: readonly Cubic[], size: number): MeasuredPath {
  const first = cubics[0];
  const angle =
    ((-Math.atan2(first.anchor0Y - 0.5, first.anchor0X - 0.5) + (3 * Math.PI) / 2));
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const scale = size - STROKE_WIDTH;
  const points = cubics.map((c) => {
    const p = [];
    for (let i = 0; i < 8; i += 2) {
      const x = c.points[i] - 0.5;
      const y = c.points[i + 1] - 0.5;
      p.push((x * cos - y * sin) * scale, (x * sin + y * cos) * scale);
    }
    return p;
  });
  // Center the control point bounds, as Path.getBounds() does.
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of points) {
    for (let i = 0; i < 8; i += 2) {
      minX = Math.min(minX, p[i]);
      maxX = Math.max(maxX, p[i]);
      minY = Math.min(minY, p[i + 1]);
      maxY = Math.max(maxY, p[i + 1]);
    }
  }
  const dx = size / 2 - (minX + maxX) / 2;
  const dy = size / 2 - (minY + maxY) / 2;
  let d = `M${n(points[0][0] + dx)} ${n(points[0][1] + dy)}`;
  let length = 0;
  for (const p of points) {
    d += `C${n(p[2] + dx)} ${n(p[3] + dy)} ${n(p[4] + dx)} ${n(p[5] + dy)} ${n(p[6] + dx)} ${n(p[7] + dy)}`;
    length += cubicLength(p);
  }
  return {d: `${d}Z`, length};
}

function cubicLength(p: number[]) {
  const steps = 16;
  let length = 0;
  let px = p[0];
  let py = p[1];
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const u = 1 - t;
    const x = u * u * u * p[0] + 3 * u * u * t * p[2] + 3 * u * t * t * p[4] + t * t * t * p[6];
    const y = u * u * u * p[1] + 3 * u * u * t * p[3] + 3 * u * t * t * p[5] + t * t * t * p[7];
    length += Math.hypot(x - px, y - py);
    px = x;
    py = y;
  }
  return length;
}

/** A dash of an outline: `stroke-dasharray` and `stroke-dashoffset`. */
export interface Dash {
  dasharray: string;
  dashoffset: string;
}

/** A dash from `start` to `stop` along a closed outline of `length`. */
export function dash(start: number, stop: number, length: number): Dash | null {
  const segment = Math.min(length, stop - start);
  if (segment <= 0) return null;
  const from = ((start % length) + length) % length;
  return {
    dasharray: `${n(segment)} ${n(Math.max(0, length - segment))}`,
    dashoffset: `${n(-from)}`,
  };
}

/**
 * The dashes of the wavy indicator (updateDrawPaths): the active indicator
 * from 0 to `progress` of its outline, shifted by `offset` of a turn for the
 * wave motion, and the track after a gap of GAP_SIZE plus the round caps,
 * both no larger than the active indicator.
 */
export function wavyDashes(
  progress: number,
  offset: number,
  active: MeasuredPath,
  track: MeasuredPath,
) {
  const stop = progress * active.length;
  const shift = offset * active.length;
  const caps = Math.min(stop, STROKE_WIDTH / 2);
  const spacing = caps * 2 + Math.min(stop, GAP_SIZE);
  return {
    active: dash(shift, stop + shift, active.length),
    track: dash(progress * track.length + spacing, track.length - spacing, track.length),
  };
}
