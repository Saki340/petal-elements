/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

// A port of Jetpack Compose Material 3's carousel KeylineList.kt and
// Keylines.kt (androidx commit df73c24). A keyline is a place in the carousel
// with the size an item takes there; items in between take sizes between
// those of the keylines around them. Sizes and offsets are in px; offsets are
// the centers of items from the start of the carousel.

import {Arrangement, findLowestCostArrangement} from './arrangement.js';

/** CarouselDefaults.AnchorSize: 10dp. */
export const ANCHOR_SIZE = 10;

/** CarouselDefaults.MinSmallItemSize: 40dp. */
export const MIN_SMALL_ITEM_SIZE = 40;

/** CarouselDefaults.MaxSmallItemSize: 56dp. */
export const MAX_SMALL_ITEM_SIZE = 56;

/** CarouselDefaults.MediumLargeItemDiffThreshold. */
const MEDIUM_LARGE_ITEM_DIFF_THRESHOLD = 0.85;

/** One place in a carousel. */
export interface Keyline {
  size: number;
  offset: number;
  unadjustedOffset: number;
  isFocal: boolean;
  isAnchor: boolean;
  isPivot: boolean;
  cutoff: number;
}

/** Where a carousel's focal (largest) items sit. */
export type CarouselAlignment = 'start' | 'center' | 'end';

/** An ordered list of keylines and what is known about them. */
export class KeylineList {
  readonly minSize: number;
  readonly maxSize: number;
  readonly pivotIndex: number;
  readonly firstNonAnchorIndex: number;
  readonly lastNonAnchorIndex: number;
  readonly firstFocalIndex: number;
  readonly lastFocalIndex: number;
  readonly focalCount: number;

  constructor(readonly keylines: readonly Keyline[]) {
    let min = Number.MAX_VALUE;
    let max = 0;
    for (const keyline of keylines) {
      min = Math.min(min, keyline.size);
      max = Math.max(max, keyline.size);
    }
    this.minSize = min;
    this.maxSize = max;
    this.pivotIndex = keylines.findIndex((k) => k.isPivot);
    this.firstNonAnchorIndex = keylines.findIndex((k) => !k.isAnchor);
    this.lastNonAnchorIndex = findLastIndex(keylines, (k) => !k.isAnchor);
    this.firstFocalIndex = keylines.findIndex((k) => k.isFocal);
    this.lastFocalIndex = findLastIndex(keylines, (k) => k.isFocal);
    this.focalCount = this.lastFocalIndex - this.firstFocalIndex + 1;
  }

  get size() {
    return this.keylines.length;
  }

  get lastIndex() {
    return this.keylines.length - 1;
  }

  get(index: number) {
    return this.keylines[index];
  }

  isEmpty() {
    return this.keylines.length === 0;
  }

  first() {
    return this.keylines[0];
  }

  last() {
    return this.keylines[this.keylines.length - 1];
  }

  get pivot() {
    return this.keylines[this.pivotIndex];
  }

  get firstNonAnchor() {
    return this.keylines[this.firstNonAnchorIndex];
  }

  get lastNonAnchor() {
    return this.keylines[this.lastNonAnchorIndex];
  }

  get firstFocal() {
    const keyline = this.keylines[this.firstFocalIndex];
    if (!keyline) throw new Error('All KeylineLists must have at least one focal keyline');
    return keyline;
  }

  get lastFocal() {
    const keyline = this.keylines[this.lastFocalIndex];
    if (!keyline) throw new Error('All KeylineLists must have at least one focal keyline');
    return keyline;
  }

  isFirstFocalItemAtStartOfContainer() {
    const firstFocalLeft = this.firstFocal.offset - this.firstFocal.size / 2;
    return firstFocalLeft >= 0 && this.firstFocal === this.firstNonAnchor;
  }

  isLastFocalItemAtEndOfContainer(carouselMainAxisSize: number) {
    const lastFocalRight = this.lastFocal.offset + this.lastFocal.size / 2;
    return lastFocalRight <= carouselMainAxisSize && this.lastFocal === this.lastNonAnchor;
  }

  firstIndexAfterFocalRangeWithSize(size: number) {
    for (let i = this.lastFocalIndex; i <= this.lastIndex; i++) {
      if (this.keylines[i].size === size) return i;
    }
    return this.lastIndex;
  }

  lastIndexBeforeFocalRangeWithSize(size: number) {
    for (let i = this.firstFocalIndex - 1; i >= 0; i--) {
      if (this.keylines[i].size === size) return i;
    }
    return 0;
  }

  getKeylineBefore(unadjustedOffset: number) {
    for (let i = this.lastIndex; i >= 0; i--) {
      if (this.keylines[i].unadjustedOffset < unadjustedOffset) return this.keylines[i];
    }
    return this.first();
  }

  getKeylineAfter(unadjustedOffset: number) {
    return this.keylines.find((k) => k.unadjustedOffset >= unadjustedOffset) ?? this.last();
  }

  equals(other: KeylineList) {
    if (this.size !== other.size) return false;
    return this.keylines.every((k, i) => keylinesEqual(k, other.keylines[i]));
  }
}

function keylinesEqual(a: Keyline, b: Keyline) {
  return (
    a.size === b.size &&
    a.offset === b.offset &&
    a.unadjustedOffset === b.unadjustedOffset &&
    a.isFocal === b.isFocal &&
    a.isAnchor === b.isAnchor &&
    a.isPivot === b.isPivot &&
    a.cutoff === b.cutoff
  );
}

function findLastIndex<T>(items: readonly T[], test: (item: T) => boolean) {
  for (let i = items.length - 1; i >= 0; i--) if (test(items[i])) return i;
  return -1;
}

export const EMPTY_KEYLINE_LIST = new KeylineList([]);

/** A keyline being added: its size and whether it is an anchor. */
interface TmpKeyline {
  size: number;
  isAnchor: boolean;
}

/** Builds a keyline list (KeylineListScopeImpl). */
export class KeylineListBuilder {
  private firstFocalIndex = -1;
  private focalItemSize = 0;
  private readonly tmpKeylines: TmpKeyline[] = [];

  add(size: number, isAnchor = false) {
    this.tmpKeylines.push({size, isAnchor});
    // The first focal item is the first of the largest items.
    if (!isAnchor && size > this.focalItemSize) {
      this.firstFocalIndex = this.tmpKeylines.length - 1;
      this.focalItemSize = size;
    }
  }

  createWithPivot(
    carouselMainAxisSize: number,
    itemSpacing: number,
    pivotIndex: number,
    pivotOffset: number,
  ) {
    return new KeylineList(
      this.createKeylinesWithPivot(
        pivotIndex,
        pivotOffset,
        this.firstFocalIndex,
        this.findLastFocalIndex(),
        this.focalItemSize,
        carouselMainAxisSize,
        itemSpacing,
      ),
    );
  }

  createWithAlignment(
    carouselMainAxisSize: number,
    itemSpacing: number,
    alignment: CarouselAlignment,
  ) {
    const lastFocalIndex = this.findLastFocalIndex();
    const focalItemCount = lastFocalIndex - this.firstFocalIndex;
    const focalItemSize = this.focalItemSize;
    let pivotOffset: number;
    if (alignment === 'center') {
      const itemSpacingSplit =
        itemSpacing === 0 || mod(focalItemCount, 2) === 0 ? 0 : itemSpacing / 2;
      const itemSpaceCounts = Math.trunc(focalItemCount / 2) * itemSpacing;
      pivotOffset =
        carouselMainAxisSize / 2 -
        (focalItemSize / 2) * focalItemCount -
        itemSpacingSplit -
        itemSpaceCounts;
    } else if (alignment === 'end') {
      pivotOffset = carouselMainAxisSize - focalItemSize / 2;
    } else {
      pivotOffset = focalItemSize / 2;
    }
    return new KeylineList(
      this.createKeylinesWithPivot(
        this.firstFocalIndex,
        pivotOffset,
        this.firstFocalIndex,
        lastFocalIndex,
        focalItemSize,
        carouselMainAxisSize,
        itemSpacing,
      ),
    );
  }

  private findLastFocalIndex() {
    if (this.firstFocalIndex < 0) return -1;
    let last = this.firstFocalIndex;
    while (
      last < this.tmpKeylines.length - 1 &&
      this.tmpKeylines[last + 1].size === this.focalItemSize
    ) {
      last++;
    }
    return last;
  }

  private createKeylinesWithPivot(
    pivotIndex: number,
    pivotOffset: number,
    firstFocalIndex: number,
    lastFocalIndex: number,
    itemMainAxisSize: number,
    carouselMainAxisSize: number,
    itemSpacing: number,
  ): Keyline[] {
    const tmp = this.tmpKeylines;
    if (tmp.length === 0 || pivotIndex < 0 || pivotIndex >= tmp.length) return [];
    const isFocal = (index: number) => index >= firstFocalIndex && index <= lastFocalIndex;
    const pivot = tmp[pivotIndex];
    const keylines: Keyline[] = [];
    const pivotCutoff = isCutoffLeft(pivot.size, pivotOffset)
      ? pivotOffset - pivot.size / 2
      : isCutoffRight(pivot.size, pivotOffset, carouselMainAxisSize)
        ? pivotOffset + pivot.size / 2 - carouselMainAxisSize
        : 0;
    keylines.push({
      size: pivot.size,
      offset: pivotOffset,
      unadjustedOffset: pivotOffset,
      isFocal: isFocal(pivotIndex),
      isAnchor: pivot.isAnchor,
      isPivot: true,
      cutoff: pivotCutoff,
    });

    let offset = pivotOffset - itemMainAxisSize / 2 - itemSpacing;
    let unadjustedOffset = pivotOffset - itemMainAxisSize / 2 - itemSpacing;
    for (let i = pivotIndex - 1; i >= 0; i--) {
      const item = tmp[i];
      const itemOffset = offset - item.size / 2;
      const itemUnadjustedOffset = unadjustedOffset - itemMainAxisSize / 2;
      const cutoff = isCutoffLeft(item.size, itemOffset)
        ? Math.abs(itemOffset - item.size / 2)
        : 0;
      keylines.unshift({
        size: item.size,
        offset: itemOffset,
        unadjustedOffset: itemUnadjustedOffset,
        isFocal: isFocal(i),
        isAnchor: item.isAnchor,
        isPivot: false,
        cutoff,
      });
      offset -= item.size + itemSpacing;
      unadjustedOffset -= itemMainAxisSize + itemSpacing;
    }

    offset = pivotOffset + itemMainAxisSize / 2 + itemSpacing;
    unadjustedOffset = pivotOffset + itemMainAxisSize / 2 + itemSpacing;
    for (let i = pivotIndex + 1; i < tmp.length; i++) {
      const item = tmp[i];
      const itemOffset = offset + item.size / 2;
      const itemUnadjustedOffset = unadjustedOffset + itemMainAxisSize / 2;
      const cutoff = isCutoffRight(item.size, itemOffset, carouselMainAxisSize)
        ? itemOffset + item.size / 2 - carouselMainAxisSize
        : 0;
      keylines.push({
        size: item.size,
        offset: itemOffset,
        unadjustedOffset: itemUnadjustedOffset,
        isFocal: isFocal(i),
        isAnchor: item.isAnchor,
        isPivot: false,
        cutoff,
      });
      offset += item.size + itemSpacing;
      unadjustedOffset += itemMainAxisSize + itemSpacing;
    }
    return keylines;
  }
}

/** Kotlin's mod: the result has the sign of the divisor. */
function mod(a: number, b: number) {
  return ((a % b) + b) % b;
}

function isCutoffLeft(size: number, offset: number) {
  return offset - size / 2 < 0 && offset + size / 2 > 0;
}

function isCutoffRight(size: number, offset: number, carouselMainAxisSize: number) {
  return offset - size / 2 < carouselMainAxisSize && offset + size / 2 > carouselMainAxisSize;
}

function lerpNumber(start: number, end: number, fraction: number) {
  return start + (end - start) * fraction;
}

/** Interpolates two keylines. */
export function lerpKeyline(start: Keyline, end: Keyline, fraction: number): Keyline {
  return {
    size: lerpNumber(start.size, end.size, fraction),
    offset: lerpNumber(start.offset, end.offset, fraction),
    unadjustedOffset: lerpNumber(start.unadjustedOffset, end.unadjustedOffset, fraction),
    isFocal: fraction < 0.5 ? start.isFocal : end.isFocal,
    isAnchor: fraction < 0.5 ? start.isAnchor : end.isAnchor,
    isPivot: fraction < 0.5 ? start.isPivot : end.isPivot,
    cutoff: lerpNumber(start.cutoff, end.cutoff, fraction),
  };
}

/** Interpolates two keyline lists of the same length. */
export function lerpKeylineList(from: KeylineList, to: KeylineList, fraction: number) {
  return new KeylineList(from.keylines.map((k, i) => lerpKeyline(k, to.get(i), fraction)));
}

export function keylineListOf(
  carouselMainAxisSize: number,
  itemSpacing: number,
  alignment: CarouselAlignment,
  build: (builder: KeylineListBuilder) => void,
) {
  const builder = new KeylineListBuilder();
  build(builder);
  return builder.createWithAlignment(carouselMainAxisSize, itemSpacing, alignment);
}

function range(from: number, to: number) {
  const values = [];
  for (let i = from; i >= to; i--) values.push(i);
  return values;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

/** The keylines of a multi-browse carousel (multiBrowseKeylineList). */
export function multiBrowseKeylineList(
  carouselMainAxisSize: number,
  preferredItemSize: number,
  itemSpacing: number,
  itemCount: number,
  minSmallItemSize = MIN_SMALL_ITEM_SIZE,
  maxSmallItemSize = MAX_SMALL_ITEM_SIZE,
): KeylineList {
  if (carouselMainAxisSize === 0 || preferredItemSize === 0) return EMPTY_KEYLINE_LIST;
  let smallCounts = [1];
  const mediumCounts = [1, 0];
  const targetLargeSize = Math.min(preferredItemSize, carouselMainAxisSize);
  const targetSmallSize = clamp(targetLargeSize / 3, minSmallItemSize, maxSmallItemSize);
  const targetMediumSize = (targetLargeSize + targetSmallSize) / 2;
  if (carouselMainAxisSize < minSmallItemSize * 2) smallCounts = [0];

  const minAvailableLargeSpace =
    carouselMainAxisSize -
    targetMediumSize * Math.max(...mediumCounts) -
    maxSmallItemSize * Math.max(...smallCounts);
  const minLargeCount = Math.max(1, Math.floor(minAvailableLargeSpace / targetLargeSize));
  const maxLargeCount = Math.ceil(carouselMainAxisSize / targetLargeSize);
  const largeCounts = range(maxLargeCount, minLargeCount);
  const targets = {
    availableSpace: carouselMainAxisSize,
    itemSpacing,
    targetSmallSize,
    minSmallSize: minSmallItemSize,
    maxSmallSize: maxSmallItemSize,
    smallCounts,
    targetMediumSize,
    mediumCounts,
    targetLargeSize,
    largeCounts,
  };
  let arrangement = findLowestCostArrangement(targets);

  if (arrangement && arrangement.itemCount() > itemCount) {
    let surplus = arrangement.itemCount() - itemCount;
    let smallCount = arrangement.smallCount;
    let mediumCount = arrangement.mediumCount;
    while (surplus > 0) {
      if (smallCount > 0) smallCount -= 1;
      else if (mediumCount > 1) mediumCount -= 1;
      surplus -= 1;
    }
    arrangement = findLowestCostArrangement({
      ...targets,
      smallCounts: [smallCount],
      mediumCounts: [mediumCount],
    });
  }
  if (!arrangement) return EMPTY_KEYLINE_LIST;
  return createLeftAlignedKeylineList(
    carouselMainAxisSize,
    itemSpacing,
    ANCHOR_SIZE,
    ANCHOR_SIZE,
    arrangement,
  );
}

/** The keylines of an uncontained carousel (uncontainedKeylineList). */
export function uncontainedKeylineList(
  carouselMainAxisSize: number,
  itemSize: number,
  itemSpacing: number,
): KeylineList {
  if (carouselMainAxisSize === 0 || itemSize === 0) return EMPTY_KEYLINE_LIST;
  const largeItemSize = Math.min(itemSize + itemSpacing, carouselMainAxisSize);
  const largeCount = Math.max(1, Math.floor(carouselMainAxisSize / largeItemSize));
  const remainingSpace = carouselMainAxisSize - largeCount * largeItemSize;
  const mediumCount = remainingSpace > 0 ? 1 : 0;
  const mediumItemSize = calculateMediumChildSize(ANCHOR_SIZE, largeItemSize, remainingSpace);
  const arrangement = new Arrangement(
    0,
    0,
    0,
    mediumItemSize,
    mediumCount,
    largeItemSize,
    largeCount,
  );
  const xSmallSize = Math.min(ANCHOR_SIZE, itemSize);
  const leftAnchorSize = Math.max(xSmallSize, mediumItemSize * 0.5);
  return createLeftAlignedKeylineList(
    carouselMainAxisSize,
    itemSpacing,
    leftAnchorSize,
    ANCHOR_SIZE,
    arrangement,
  );
}

/** The keylines of a hero carousel (heroKeylineList). */
export function heroKeylineList(
  carouselMainAxisSize: number,
  preferredItemSize: number | null,
  itemSpacing: number,
  itemCount: number,
  isCentered = false,
  minSmallItemSize = MIN_SMALL_ITEM_SIZE,
  maxSmallItemSize = MAX_SMALL_ITEM_SIZE,
): KeylineList {
  if (carouselMainAxisSize === 0) return EMPTY_KEYLINE_LIST;
  const shouldCenter = isCentered && itemCount >= 3;
  let smallCounts = itemCount <= 1 ? [0] : shouldCenter ? [2] : [1];
  const targetLargeSize = Math.min(preferredItemSize ?? carouselMainAxisSize, carouselMainAxisSize);
  const targetSmallSize = clamp(targetLargeSize / 3, minSmallItemSize, maxSmallItemSize);
  const fullscreenThreshold =
    minSmallItemSize * Math.max(...smallCounts) + minSmallItemSize * 1.25;
  if (carouselMainAxisSize < fullscreenThreshold) smallCounts = [0];
  const minAvailableLargeSpace = carouselMainAxisSize - minSmallItemSize * Math.max(...smallCounts);
  const minLargeCount = Math.max(1, Math.floor(minAvailableLargeSpace / targetLargeSize));
  const maxLargeCount = Math.ceil(carouselMainAxisSize / targetLargeSize);
  const arrangement = findLowestCostArrangement({
    availableSpace: carouselMainAxisSize,
    itemSpacing,
    targetSmallSize,
    minSmallSize: minSmallItemSize,
    maxSmallSize: maxSmallItemSize,
    smallCounts,
    targetMediumSize: 0,
    mediumCounts: [0],
    targetLargeSize,
    largeCounts: range(maxLargeCount, minLargeCount),
  });
  if (!arrangement) return EMPTY_KEYLINE_LIST;
  return shouldCenter && itemCount >= arrangement.itemCount()
    ? createCenterAlignedKeylineList(
        carouselMainAxisSize,
        itemSpacing,
        ANCHOR_SIZE,
        ANCHOR_SIZE,
        arrangement,
      )
    : createLeftAlignedKeylineList(
        carouselMainAxisSize,
        itemSpacing,
        ANCHOR_SIZE,
        ANCHOR_SIZE,
        arrangement,
      );
}

function repeat(count: number, action: () => void) {
  for (let i = 0; i < count; i++) action();
}

export function createLeftAlignedKeylineList(
  carouselMainAxisSize: number,
  itemSpacing: number,
  leftAnchorSize: number,
  rightAnchorSize: number,
  arrangement: Arrangement,
) {
  return keylineListOf(carouselMainAxisSize, itemSpacing, 'start', (k) => {
    k.add(leftAnchorSize, true);
    repeat(arrangement.largeCount, () => k.add(arrangement.largeSize));
    repeat(arrangement.mediumCount, () => k.add(arrangement.mediumSize));
    repeat(arrangement.smallCount, () => k.add(arrangement.smallSize));
    k.add(rightAnchorSize, true);
  });
}

export function createCenterAlignedKeylineList(
  carouselMainAxisSize: number,
  itemSpacing: number,
  leftAnchorSize: number,
  rightAnchorSize: number,
  arrangement: Arrangement,
) {
  return keylineListOf(carouselMainAxisSize, itemSpacing, 'center', (k) => {
    k.add(leftAnchorSize, true);
    repeat(Math.trunc(arrangement.smallCount / 2), () => k.add(arrangement.smallSize));
    repeat(Math.trunc(arrangement.mediumCount / 2), () => k.add(arrangement.mediumSize));
    repeat(arrangement.largeCount, () => k.add(arrangement.largeSize));
    repeat(Math.trunc(arrangement.mediumCount / 2), () => k.add(arrangement.mediumSize));
    repeat(Math.trunc(arrangement.smallCount / 2), () => k.add(arrangement.smallSize));
    k.add(rightAnchorSize, true);
  });
}

/** A medium item cut off enough to move, and smaller than the large ones. */
function calculateMediumChildSize(
  minimumMediumSize: number,
  largeItemSize: number,
  remainingSpace: number,
) {
  let mediumItemSize = Math.max(remainingSpace * 1.5, minimumMediumSize);
  const largeItemThreshold = largeItemSize * MEDIUM_LARGE_ITEM_DIFF_THRESHOLD;
  if (mediumItemSize > largeItemThreshold) {
    const sizeWithFifthCutOff = remainingSpace * 1.2;
    mediumItemSize = Math.min(Math.max(largeItemThreshold, sizeWithFifthCutOff), largeItemSize);
  }
  return mediumItemSize;
}
