/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

// The pure decisions behind a bottom sheet's anchors and gestures, after
// Jetpack Compose Material 3 (BottomSheet.kt, SheetDefaults.kt) and
// foundation's AnchoredDraggable.kt (pinned commit
// df73c2438e78ba644a436dc402ede6ba2d472812). Positions are in px from the top
// of the container; velocities in px per second, positive moving down.

/** A sheet's resting places, Compose's `SheetValue`. */
export type SheetValue = 'hidden' | 'partially-expanded' | 'expanded';

/** A place the sheet can rest at. */
export interface Anchor {
  value: SheetValue;
  /** Distance of the sheet's top edge from the container's top. */
  position: number;
}

/** BottomSheetDefaults.PositionalThreshold: 56dp. */
export const POSITIONAL_THRESHOLD = 56;

/**
 * BottomSheetDefaults.VelocityThreshold, and foundation's
 * AnchoredDraggableMinFlingVelocity: 125dp per second.
 */
export const VELOCITY_THRESHOLD = 125;

/** BottomSheetDefaults.BoundaryDampeningZone: 125dp. */
export const BOUNDARY_DAMPENING_ZONE = 125;

/**
 * The largest fling velocity, like Android's
 * `ViewConfiguration.maximumFlingVelocity` (8000dp per second), which
 * ModalBottomSheet's fling behavior clamps to.
 */
export const MAX_FLING_VELOCITY = 8000;

/**
 * The anchors of a sheet, as BottomSheet's `draggableAnchors`: `Hidden` at the
 * container's bottom; `PartiallyExpanded` unless skipped, at half the
 * container's height or the sheet's own height when that is smaller
 * (`calculatePartiallyExpandedOffset`, with
 * `isBottomSheetPartiallyExpandedDeterministicEnabled` on, its default);
 * `Expanded` with the sheet fully shown. Ordered hidden, partially expanded,
 * expanded.
 */
export function calculateAnchors(
  fullHeight: number,
  sheetHeight: number,
  skipPartiallyExpanded: boolean,
): Anchor[] {
  const anchors: Anchor[] = [{value: 'hidden', position: fullHeight}];
  if (!skipPartiallyExpanded && sheetHeight > 0) {
    const visibleHeight = Math.min(fullHeight / 2, sheetHeight);
    anchors.push({value: 'partially-expanded', position: fullHeight - visibleHeight});
  }
  // Without content there is nothing to expand (`sheetHeight != 0f`).
  if (sheetHeight > 0) {
    anchors.push({value: 'expanded', position: Math.max(0, fullHeight - sheetHeight)});
  }
  return anchors;
}

/**
 * The anchors of a standard sheet, as StandardBottomSheet's
 * `draggableAnchors` in BottomSheetScaffold.kt: `PartiallyExpanded` with
 * `peekHeight` showing, unless that is the whole sheet; `Hidden` at the
 * bottom when the sheet may hide, or when there is no peek or no sheet;
 * `Expanded` with the sheet fully shown. Ordered hidden, partially expanded,
 * expanded.
 */
export function calculateStandardAnchors(
  fullHeight: number,
  sheetHeight: number,
  peekHeight: number,
  hideable: boolean,
): Anchor[] {
  const anchors: Anchor[] = [];
  if (sheetHeight === 0 || peekHeight === 0 || hideable) {
    anchors.push({value: 'hidden', position: fullHeight});
  }
  if (peekHeight > 0 && peekHeight !== sheetHeight) {
    anchors.push({value: 'partially-expanded', position: fullHeight - peekHeight});
  }
  if (sheetHeight > 0) {
    anchors.push({value: 'expanded', position: Math.max(0, fullHeight - sheetHeight)});
  }
  return anchors;
}

/** The position of a value, or `undefined` when it is not an anchor. */
export function positionOf(anchors: Anchor[], value: SheetValue): number | undefined {
  return anchors.find((anchor) => anchor.value === value)?.position;
}

/**
 * The value to rest at when the anchors change, as BottomSheet's `newTarget`:
 * hidden stays hidden; partially expanded falls back to expanded, then to
 * hidden; expanded to hidden.
 */
export function resolveValue(anchors: Anchor[], value: SheetValue): SheetValue {
  const has = (v: SheetValue) => positionOf(anchors, v) !== undefined;
  switch (value) {
    case 'partially-expanded':
      return has('partially-expanded')
        ? 'partially-expanded'
        : has('expanded')
          ? 'expanded'
          : 'hidden';
    case 'expanded':
      return has('expanded') ? 'expanded' : 'hidden';
    default:
      return 'hidden';
  }
}

/**
 * The anchor closest to `position`. With `searchUpwards` set, only anchors
 * at or beyond it (further down) count; unset, only those at or before it.
 * Ties go to the later anchor, like `DraggableAnchors.closestAnchor`.
 */
export function closestAnchor(
  anchors: Anchor[],
  position: number,
  searchUpwards?: boolean,
): Anchor | undefined {
  let closest: Anchor | undefined;
  let minDistance = Infinity;
  for (const anchor of anchors) {
    let distance: number;
    if (searchUpwards === undefined) {
      distance = Math.abs(position - anchor.position);
    } else {
      const delta = searchUpwards ? anchor.position - position : position - anchor.position;
      // Compose gives such an anchor an infinite distance, and still returns
      // the last one when nothing qualifies; here nothing qualifies.
      if (delta < 0) continue;
      distance = delta;
    }
    if (distance <= minDistance) {
      closest = anchor;
      minDistance = distance;
    }
  }
  return closest;
}

/**
 * Where a sheet released at `offset` with `velocity` settles
 * (`DraggableAnchors.computeTarget` in AnchoredDraggable.kt):
 *
 * - without velocity, at the closest anchor;
 * - at or above the velocity threshold, at the next anchor in the direction
 *   of the velocity;
 * - otherwise, at the next anchor in the direction of the velocity once the
 *   sheet has moved the positional threshold away from the anchor it comes
 *   from, else back at that one.
 */
export function computeTarget(
  anchors: Anchor[],
  offset: number,
  velocity: number,
  positionalThreshold = POSITIONAL_THRESHOLD,
  velocityThreshold = VELOCITY_THRESHOLD,
): SheetValue {
  const closest = closestAnchor(anchors, offset)!;
  if (velocity === 0) return closest.value;
  const movingForward = velocity > 0;
  if (Math.abs(velocity) >= Math.abs(velocityThreshold)) {
    return (closestAnchor(anchors, offset, movingForward) ?? closest).value;
  }
  const left = closestAnchor(anchors, offset, false) ?? closest;
  const right = closestAnchor(anchors, offset, true) ?? closest;
  const closestFromStart = movingForward ? left : right;
  const relativePosition = Math.abs(closestFromStart.position - offset);
  const reached = relativePosition >= Math.abs(positionalThreshold);
  const ahead = movingForward ? right : left;
  const behind = movingForward ? left : right;
  return (reached ? ahead : behind).value;
}

/**
 * The fling velocity of ModalBottomSheet's `modalBottomSheetFlingBehavior`:
 * clamped to the maximum, and for a downward fling within the dampening zone
 * above the bottom scaled by the square of the distance to it over the zone,
 * so a sheet lets go of the screen's edge softly. A fling that was above the
 * velocity threshold stays at least at it.
 */
export function dampenFlingVelocity(
  velocity: number,
  offset: number,
  hiddenPosition: number,
  maxVelocity = MAX_FLING_VELOCITY,
): number {
  let safe = Math.max(-maxVelocity, Math.min(maxVelocity, velocity));
  if (safe > 0) {
    const distanceToFloor = Math.max(0, hiddenPosition - offset);
    if (distanceToFloor < BOUNDARY_DAMPENING_ZONE) {
      const factor = distanceToFloor / BOUNDARY_DAMPENING_ZONE;
      safe *= factor * factor;
      if (velocity >= VELOCITY_THRESHOLD) safe = Math.max(safe, VELOCITY_THRESHOLD);
    }
  }
  return safe;
}

/**
 * The scale of a sheet's surface when its offset is above the topmost anchor
 * (a spring that overshoots), so no gap shows below it: Compose's
 * `verticalScaleUp`. The content is scaled by the inverse
 * (`verticalScaleDown`).
 */
export function overflowScale(offset: number, minPosition: number, height: number): number {
  const overflow = offset < minPosition ? minPosition - offset : 0;
  return overflow > 0 && height > 0 ? (height + overflow) / height : 1;
}

/** How far back a velocity looks (Compose's VelocityTracker horizon). */
const VELOCITY_HORIZON_MS = 100;

/**
 * Estimates the velocity of a pointer from its last moves, within the last
 * 100ms like Compose's `VelocityTracker`.
 */
export class VelocityTracker {
  private samples: Array<{time: number; position: number}> = [];

  addPosition(time: number, position: number) {
    this.samples.push({time, position});
    // Keep a little more than the horizon.
    while (this.samples.length > 1 && time - this.samples[0].time > VELOCITY_HORIZON_MS * 2) {
      this.samples.shift();
    }
  }

  /** The velocity in position units per second at `time`. */
  velocity(time: number): number {
    const recent = this.samples.filter((sample) => time - sample.time <= VELOCITY_HORIZON_MS);
    if (recent.length < 2) return 0;
    const first = recent[0];
    const last = recent[recent.length - 1];
    const seconds = (last.time - first.time) / 1000;
    return seconds > 0 ? (last.position - first.position) / seconds : 0;
  }

  reset() {
    this.samples = [];
  }
}
