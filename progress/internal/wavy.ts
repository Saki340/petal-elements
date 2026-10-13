/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

// The wavy linear progress indicator, after Jetpack Compose Material 3
// (LinearWavyProgressIndicator in WavyProgressIndicator.kt, the drawing in
// internal/LinearWavyProgressModifiers.kt, and the indeterminate timing in
// ProgressIndicator.kt). Sizes: LinearProgressIndicatorTokens.

/** WaveHeight: the indicator's height. */
export const WAVE_HEIGHT = 10;
/** ActiveThickness and TrackThickness. */
export const STROKE_WIDTH = 4;
/** TrackActiveSpace: the gap between the indicator and the track. */
export const GAP_SIZE = 4;
/** StopSize. */
export const STOP_SIZE = 4;
/** ActiveWaveWavelength. */
export const DETERMINATE_WAVELENGTH = 40;
/** IndeterminateActiveWaveWavelength. */
export const INDETERMINATE_WAVELENGTH = 20;
/** The wave moves one wavelength per second (waveSpeed = wavelength). */
export const WAVE_PERIOD_MS = 1000;
/** Amplitude changes take MotionTokens.DurationLong2. */
export const AMPLITUDE_DURATION_MS = 500;

/** A CSS-like cubic-bezier easing function. */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const at = (t: number, a: number, b: number) =>
    3 * a * t * (1 - t) ** 2 + 3 * b * t ** 2 * (1 - t) + t ** 3;
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let lo = 0;
    let hi = 1;
    for (let i = 0; i < 30; i++) {
      const mid = (lo + hi) / 2;
      if (at(mid, x1, x2) < x) lo = mid;
      else hi = mid;
    }
    return at((lo + hi) / 2, y1, y2);
  };
}

/** MotionTokens.EasingStandardCubicBezier: amplitude going up. */
export const STANDARD = cubicBezier(0.2, 0, 0, 1);
/** MotionTokens.EasingEmphasizedAccelerateCubicBezier: amplitude going down, and the lines. */
export const EMPHASIZED_ACCELERATE = cubicBezier(0.3, 0, 0.8, 0.15);

/** One indeterminate cycle (LinearAnimationDuration). */
export const INDETERMINATE_CYCLE_MS = 1750;

/** Delay and duration of each line's tail and head, in the order Compose draws them. */
const LINES = [
  // First line: tail, head.
  [250, 1000],
  [0, 1000],
  // Second line: tail, head.
  [900, 850],
  [650, 850],
] as const;

/**
 * The indeterminate lines `ms` after start: [first tail, first head, second
 * tail, second head], each 0 to 1 across the track.
 */
export function indeterminateFractions(ms: number) {
  const t = ms % INDETERMINATE_CYCLE_MS;
  return LINES.map(([delay, duration]) =>
    EMPHASIZED_ACCELERATE(Math.min(1, Math.max(0, (t - delay) / duration))),
  );
}

/** The determinate amplitude: flat below 10% and from 95% (indicatorAmplitude). */
export function determinateAmplitude(progress: number) {
  return progress <= 0.1 || progress >= 0.95 ? 0 : 1;
}

/** Arc length samples of one half wave, to find points by distance. */
interface HalfWave {
  halfWavelength: number;
  controlY: number;
  /** Cumulative length at t = i / SAMPLES. */
  lengths: Float64Array;
  length: number;
}

const SAMPLES = 256;
const halfWaves = new Map<string, HalfWave>();

/**
 * The quadratic half wave of the full path: from (0, 0) through the control
 * point (halfWavelength / 2, controlY) to (halfWavelength, 0).
 */
function halfWave(wavelength: number, height: number): HalfWave {
  const key = `${wavelength} ${height}`;
  let wave = halfWaves.get(key);
  if (wave) return wave;
  const halfWavelength = wavelength / 2;
  // "We offset this height with the progress stroke's width to avoid cropping."
  const controlY = height - STROKE_WIDTH;
  const lengths = new Float64Array(SAMPLES + 1);
  let [px, py] = [0, 0];
  for (let i = 1; i <= SAMPLES; i++) {
    const [x, y] = quadPoint(i / SAMPLES, halfWavelength, controlY);
    lengths[i] = lengths[i - 1] + Math.hypot(x - px, y - py);
    [px, py] = [x, y];
  }
  wave = {halfWavelength, controlY, lengths, length: lengths[SAMPLES]};
  halfWaves.set(key, wave);
  return wave;
}

function quadPoint(t: number, halfWavelength: number, controlY: number) {
  // P0 = (0, 0), P1 = (halfWavelength / 2, controlY), P2 = (halfWavelength, 0).
  const x = 2 * (1 - t) * t * (halfWavelength / 2) + t * t * halfWavelength;
  const y = 2 * (1 - t) * t * controlY;
  return [x, y];
}

/** The t of a half wave at `distance` along it. */
function tAt(wave: HalfWave, distance: number) {
  const {lengths} = wave;
  if (distance <= 0) return 0;
  if (distance >= wave.length) return 1;
  let lo = 0;
  let hi = SAMPLES;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (lengths[mid] < distance) lo = mid;
    else hi = mid;
  }
  const f = (distance - lengths[lo]) / (lengths[hi] - lengths[lo]);
  return (lo + f) / SAMPLES;
}

const n = (v: number) => Number(v.toFixed(2));

/**
 * The part of the full wave between two distances along it, as SVG path data,
 * with the amplitude applied and shifted left by `shift`. Like Compose's
 * PathMeasure.getSegment followed by the translate and scale.
 */
function waveSegment(
  wave: HalfWave,
  from: number,
  to: number,
  amplitude: number,
  shift: number,
  halfHeight: number,
) {
  const {halfWavelength, length} = wave;
  const point = (x: number, y: number) =>
    `${n(x - shift)} ${n(halfHeight + amplitude * y)}`;
  let d = '';
  let k = Math.floor(from / length);
  while (k * length < to) {
    const start = Math.max(from, k * length) - k * length;
    const end = Math.min(to, (k + 1) * length) - k * length;
    if (end > start) {
      const t0 = tAt(wave, start);
      const t1 = tAt(wave, end);
      // Every other half wave goes the other way.
      const c = k % 2 === 0 ? wave.controlY : -wave.controlY;
      const x0 = k * halfWavelength;
      const p = (t: number) => {
        const [x, y] = quadPoint(t, halfWavelength, c);
        return [x0 + x, y];
      };
      const [ax, ay] = p(t0);
      const [bx, by] = p(t1);
      // The control point of the quadratic between t0 and t1.
      const cx =
        x0 + (1 - t0) * t1 * (halfWavelength / 2) + t0 * (1 - t1) * (halfWavelength / 2) + t0 * t1 * halfWavelength;
      const cy = ((1 - t0) * t1 + t0 * (1 - t1)) * c;
      if (!d) d = `M${point(ax, ay)}`;
      d += `Q${point(cx, cy)} ${point(bx, by)}`;
    }
    k++;
  }
  return d;
}

/** The drawing of a wavy indicator. */
export interface WavyDrawing {
  /** SVG path data of each progress line ('' when empty). */
  progress: string[];
  /** SVG path data of the track. */
  track: string;
}

/**
 * Draws the indicator in a `width` by `height` box, like
 * LinearProgressDrawingCache.updatePaths. `fractions` holds a tail and head
 * pair (0 to 1) per progress line; `waveOffset` (0 to 1) moves the wave.
 */
export function drawWavy(
  width: number,
  height: number,
  fractions: readonly number[],
  amplitude: number,
  waveOffset: number,
  wavelength: number,
): WavyDrawing {
  const halfHeight = height / 2;
  // Round caps: leave room for them at both ends.
  const capWidth = height > width ? 0 : STROKE_WIDTH / 2;
  const wave = halfWave(wavelength, height);
  // The full path's measured length per pixel of its width.
  const scale = amplitude === 0 ? 1 : wave.length / wave.halfWavelength;
  const shift = amplitude === 0 ? 0 : waveOffset * wavelength;
  const clamp = (v: number) => Math.min(width - capWidth, Math.max(capWidth, v));

  const progress: string[] = [];
  let adjustedGap = GAP_SIZE;
  let activeVisible = false;
  let nextEndTrackOffset = width - capWidth;
  let track = `M${n(nextEndTrackOffset)} ${n(halfHeight)}`;

  for (let i = 0; i < fractions.length / 2; i++) {
    const barTail = fractions[i * 2] * width;
    const barHead = fractions[i * 2 + 1] * width;
    if (i === 0) {
      // A shorter gap while the bar enters the track.
      adjustedGap = barHead < capWidth ? 0 : Math.min(barHead - capWidth, GAP_SIZE);
      activeVisible = barHead >= capWidth;
    }
    const head = clamp(barHead);
    const tail = clamp(barTail);

    let d = '';
    if (Math.abs(barHead - barTail) > 0) {
      if (amplitude === 0) {
        d = `M${n(tail)} ${n(halfHeight)}L${n(head)} ${n(halfHeight)}`;
      } else {
        d = waveSegment(wave, (tail + shift) * scale, (head + shift) * scale, amplitude, shift, halfHeight);
      }
    }
    progress.push(d);

    // The track, from right to left, in the gaps between the lines.
    const spacing = activeVisible ? adjustedGap + capWidth * 2 : adjustedGap;
    if (nextEndTrackOffset > head + spacing) {
      track += `L${n(Math.max(capWidth, head + spacing))} ${n(halfHeight)}`;
    }
    if (barHead > barTail) {
      nextEndTrackOffset = Math.max(capWidth, tail - spacing);
      track += `M${n(nextEndTrackOffset)} ${n(halfHeight)}`;
    }
  }
  if (nextEndTrackOffset > capWidth) {
    track += `L${n(capWidth)} ${n(halfHeight)}`;
  }
  return {progress, track};
}

/**
 * The stop indicator at the end of the track: a dot that shrinks as the
 * progress reaches it (drawStopIndicator). Returns its center and radius.
 */
export function stopIndicator(width: number, height: number, progressEnd: number) {
  const capWidth = height > width ? 0 : STROKE_WIDTH / 2;
  let size = Math.min(STROKE_WIDTH, STOP_SIZE);
  const offset = size === STROKE_WIDTH ? 0 : STROKE_WIDTH / 4;
  let x = width - size - offset;
  const progressX = width * progressEnd + capWidth;
  if (x <= progressX) {
    size = Math.max(0, size - (progressX - x));
    x = progressX;
  }
  return {cx: x + size / 2, cy: height / 2, r: size / 2};
}
