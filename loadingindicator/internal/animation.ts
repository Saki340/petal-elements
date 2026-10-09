/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

// The loading indicator's shapes and motion, after Jetpack Compose Material 3
// LoadingIndicator.kt (LoadingIndicatorDefaults, IndeterminateLoadingIndicator,
// DeterminateLoadingIndicator) and SpringEstimation.kt.

import {MaterialShapes, rotateZ} from './shapes/material-shapes.js';
import {Morph} from './shapes/morph.js';
import {RoundedPolygon} from './shapes/rounded-polygon.js';

/** LoadingIndicatorTokens: 48dp container, 38dp active indicator. */
export const CONTAINER_SIZE = 48;
export const ACTIVE_SIZE = 38;

/** A new morph starts every MorphIntervalMillis. */
export const MORPH_INTERVAL_MS = 650;
/** GlobalRotationDurationMillis: one turn, linear. */
export const GLOBAL_ROTATION_MS = 4666;

/** The morph spring: spring(dampingRatio = 0.6, stiffness = 200, visibilityThreshold = 0.1). */
const DAMPING_RATIO = 0.6;
const STIFFNESS = 200;
const VISIBILITY_THRESHOLD = 0.1;

const omega = Math.sqrt(STIFFNESS);
const decay = DAMPING_RATIO * omega;
const omegaD = omega * Math.sqrt(1 - DAMPING_RATIO * DAMPING_RATIO);

/**
 * How long the spring runs from 0 to 1, as Compose estimates it
 * (estimateUnderDamped with the displacement in units of the threshold).
 */
export const MORPH_SPRING_MS = (() => {
  const p0 = -1 / VISIBILITY_THRESHOLD;
  const r = -decay;
  const c2 = (0 - r * p0) / omegaD;
  const c = Math.sqrt(p0 * p0 + c2 * c2);
  return Math.floor((Math.log(1 / c) / r) * 1000);
})();

/** The spring's value at `ms`, from 0 toward 1 (it overshoots). */
export function springProgress(ms: number) {
  if (ms >= MORPH_SPRING_MS) return 1;
  const t = ms / 1000;
  return (
    1 - Math.exp(-decay * t) * (Math.cos(omegaD * t) + (decay / omegaD) * Math.sin(omegaD * t))
  );
}

let indeterminate: Morph[] | undefined;
let determinate: Morph[] | undefined;
let indeterminateScale = 0;
let determinateScale = 0;

/** LoadingIndicatorDefaults.IndeterminateIndicatorPolygons. */
function indeterminatePolygons() {
  return [
    MaterialShapes.softBurst(),
    MaterialShapes.cookie9Sided(),
    MaterialShapes.pentagon(),
    MaterialShapes.pill(),
    MaterialShapes.sunny(),
    MaterialShapes.cookie4Sided(),
    MaterialShapes.oval(),
  ];
}

/** LoadingIndicatorDefaults.DeterminateIndicatorPolygons. */
function determinatePolygons() {
  return [MaterialShapes.circle().transformed(rotateZ(360 / 20)), MaterialShapes.softBurst()];
}

/** The polygons' scale factor, so they fit as they rotate (calculateScaleFactor). */
function scaleFactor(polygons: RoundedPolygon[]) {
  let factor = 1;
  for (const polygon of polygons) {
    const b = polygon.calculateBounds();
    const m = polygon.calculateMaxBounds();
    const sx = (b[2] - b[0]) / (m[2] - m[0]);
    const sy = (b[3] - b[1]) / (m[3] - m[1]);
    factor = Math.min(factor, Math.max(sx, sy));
  }
  return (factor * ACTIVE_SIZE) / CONTAINER_SIZE;
}

/** Morphs between consecutive polygons, optionally from the last back to the first. */
function morphSequence(polygons: RoundedPolygon[], circular: boolean) {
  const morphs: Morph[] = [];
  for (let i = 0; i < polygons.length; i++) {
    if (i + 1 < polygons.length) morphs.push(new Morph(polygons[i].normalized(), polygons[i + 1].normalized()));
    else if (circular) morphs.push(new Morph(polygons[i].normalized(), polygons[0].normalized()));
  }
  return morphs;
}

function indeterminateMorphs() {
  if (!indeterminate) {
    const polygons = indeterminatePolygons();
    indeterminate = morphSequence(polygons, true);
    indeterminateScale = scaleFactor(polygons);
  }
  return indeterminate;
}

function determinateMorphs() {
  if (!determinate) {
    const polygons = determinatePolygons();
    determinate = morphSequence(polygons, false);
    determinateScale = scaleFactor(polygons);
  }
  return determinate;
}

/** The indicator at one moment: an SVG path in a 48x48 box and its rotation. */
export interface Frame {
  d: string;
  rotation: number;
}

/**
 * The path of a morph at `progress`, scaled into the 48x48 box and centered
 * (processPath).
 */
function path(morph: Morph, progress: number, scale: number) {
  const size = CONTAINER_SIZE * scale;
  const cubics = morph.asCubics(progress);
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
  const dx = CONTAINER_SIZE / 2 - ((minX + maxX) / 2) * size;
  const dy = CONTAINER_SIZE / 2 - ((minY + maxY) / 2) * size;
  const x = (v: number) => (v * size + dx).toFixed(2);
  const y = (v: number) => (v * size + dy).toFixed(2);
  const first = cubics[0];
  let d = `M${x(first.anchor0X)} ${y(first.anchor0Y)}`;
  for (const c of cubics) {
    d += `C${x(c.control0X)} ${y(c.control0Y)} ${x(c.control1X)} ${y(c.control1Y)} ${x(c.anchor1X)} ${y(c.anchor1Y)}`;
  }
  return `${d}Z`;
}

/**
 * The indeterminate indicator `ms` after it started: every 650ms the next
 * morph runs on the spring and turns 90 degrees, while the whole indicator
 * turns once every 4666ms.
 */
export function indeterminateFrame(ms: number): Frame {
  const morphs = indeterminateMorphs();
  const step = Math.floor(ms / MORPH_INTERVAL_MS);
  const elapsed = ms - step * MORPH_INTERVAL_MS;
  // morphRotationTargetAngle starts at a quarter turn and adds one per morph.
  let index = step % morphs.length;
  let target = (90 + 90 * step) % 360;
  let progress = springProgress(elapsed);
  if (elapsed >= MORPH_SPRING_MS) {
    // The morph finished: the next one waits at its start.
    index = (index + 1) % morphs.length;
    target = (target + 90) % 360;
    progress = 0;
  }
  const global = ((ms % GLOBAL_ROTATION_MS) / GLOBAL_ROTATION_MS) * 360;
  return {
    d: path(morphs[index], progress, indeterminateScale),
    rotation: progress * 90 + target + global,
  };
}

/** The determinate indicator at `value` (0..1): circle to soft burst, turning back. */
export function determinateFrame(value: number): Frame {
  const morphs = determinateMorphs();
  const v = Math.min(1, Math.max(0, value));
  const index = Math.min(Math.floor(morphs.length * v), morphs.length - 1);
  const progress = v === 1 && index === morphs.length - 1 ? 1 : (v * morphs.length) % 1;
  return {d: path(morphs[index], progress, determinateScale), rotation: -v * 180};
}
