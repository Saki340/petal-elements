/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

// Where carousel items go for a scroll offset, after Jetpack Compose
// Material 3's carouselItem modifier, calculateMaxScrollOffset (Carousel.kt)
// and getSnapPositionOffset (KeylineSnapPosition.kt), androidx commit df73c24.
// The scroll offset is the scroller's own: 0 at the start, the maximum at the
// end; items lie end to end at the focal size, the pages Compose's pager
// lays out.

import {Keyline, lerpKeyline} from './keylines.js';
import {Strategy} from './strategy.js';

/** Where one item shows. */
export interface ItemLayout {
  /** The middle of the item's mask, from the start of the carousel. */
  center: number;
  /** The width of the item's mask (the keyline's size there). */
  size: number;
}

/** The furthest the carousel scrolls (calculateMaxScrollOffset). */
export function maxScrollOffset(strategy: Strategy, itemCount: number) {
  const maxScrollPossible =
    strategy.itemMainAxisSize * itemCount + strategy.itemSpacing * (itemCount - 1);
  return Math.max(0, maxScrollPossible - strategy.availableSpace);
}

function progress(before: Keyline, after: Keyline, unadjustedOffset: number) {
  if (before === after) return 1;
  return (unadjustedOffset - before.unadjustedOffset) /
    (after.unadjustedOffset - before.unadjustedOffset);
}

/**
 * The mask and place of item `index` (carouselItem): the keylines around the
 * item's unmoved center, interpolated, give its size and where it is moved.
 */
export function itemLayout(
  strategy: Strategy,
  index: number,
  scrollOffset: number,
  maxOffset: number,
): ItemLayout {
  const keylines = strategy.getKeylineListForScrollOffset(scrollOffset, maxOffset);
  const itemSizeWithSpacing = strategy.itemMainAxisSize + strategy.itemSpacing;
  const unadjustedCenter =
    index * itemSizeWithSpacing + strategy.itemMainAxisSize / 2 - scrollOffset;
  const before = keylines.getKeylineBefore(unadjustedCenter);
  const after = keylines.getKeylineAfter(unadjustedCenter);
  const keyline = lerpKeyline(before, after, progress(before, after, unadjustedCenter));
  let translation = keyline.offset - unadjustedCenter;
  if (before === after) {
    // Beyond the first or last keyline, the item keeps moving by its masked size.
    translation += (unadjustedCenter - keyline.unadjustedOffset) / keyline.size;
  }
  return {center: unadjustedCenter + translation, size: keyline.size};
}

/**
 * The page offset at which item `index` rests (getSnapPositionOffset): the
 * first focal keyline's, or a start or end step's for items near the ends.
 */
export function snapPositionOffset(strategy: Strategy, index: number, itemCount: number) {
  if (!strategy.isValid) return 0;
  const half = strategy.itemMainAxisSize / 2;
  let offset = Math.round(strategy.defaultKeylines.firstFocal.unadjustedOffset - half);
  const startSteps = strategy.startKeylineSteps;
  const endSteps = strategy.endKeylineSteps;
  if (index <= startSteps.length - 1) {
    const stepIndex = clamp(startSteps.length - 1 - index, 0, startSteps.length - 1);
    offset = Math.round(startSteps[stepIndex].firstFocal.unadjustedOffset - half);
  }
  const lastItemIndex = itemCount - 1;
  if (
    index >= lastItemIndex - (endSteps.length - 1) &&
    itemCount > strategy.defaultKeylines.focalCount
  ) {
    const stepIndex = clamp(
      endSteps.length - 1 - (lastItemIndex - index),
      0,
      endSteps.length - 1,
    );
    offset = Math.round(endSteps[stepIndex].lastFocal.unadjustedOffset - half);
  }
  return offset;
}

/** The scroll offset at which item `index` rests, within the scroll range. */
export function itemScrollOffset(strategy: Strategy, index: number, itemCount: number) {
  const itemSizeWithSpacing = strategy.itemMainAxisSize + strategy.itemSpacing;
  return clamp(
    index * itemSizeWithSpacing - snapPositionOffset(strategy, index, itemCount),
    0,
    maxScrollOffset(strategy, itemCount),
  );
}

/** The scroll offsets at which items rest, without repeats. */
export function snapScrollOffsets(strategy: Strategy, itemCount: number) {
  const offsets: number[] = [];
  for (let i = 0; i < itemCount; i++) {
    const offset = itemScrollOffset(strategy, i, itemCount);
    if (!offsets.some((o) => Math.abs(o - offset) < 0.5)) offsets.push(offset);
  }
  return offsets;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
