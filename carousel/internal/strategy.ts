/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

// A port of Jetpack Compose Material 3's carousel Strategy.kt (androidx commit
// df73c24): the keylines for every scroll offset. In the middle of the
// content the default keylines apply; near the start and the end, the
// keylines shift step by step so the first and last items can reach the
// focal (large) size.

import {
  EMPTY_KEYLINE_LIST,
  Keyline,
  KeylineList,
  KeylineListBuilder,
  lerpKeylineList,
} from './keylines.js';

/** The keylines of a carousel for any scroll offset. */
export class Strategy {
  readonly minItemSize: number;
  readonly maxItemSize: number;
  readonly startKeylineSteps: KeylineList[];
  readonly endKeylineSteps: KeylineList[];
  private readonly startShiftDistance: number;
  private readonly endShiftDistance: number;
  private readonly startShiftPoints: number[];
  private readonly endShiftPoints: number[];
  private lastStartAndEndKeylineListSteps: KeylineList[] | null = null;

  constructor(
    readonly defaultKeylines: KeylineList,
    readonly availableSpace: number,
    readonly itemSpacing: number,
    readonly beforeContentPadding: number,
    readonly afterContentPadding: number,
  ) {
    this.startKeylineSteps = getStartKeylineSteps(
      defaultKeylines,
      availableSpace,
      itemSpacing,
      beforeContentPadding,
    );
    this.endKeylineSteps = getEndKeylineSteps(
      defaultKeylines,
      availableSpace,
      itemSpacing,
      afterContentPadding,
    );
    let min = defaultKeylines.minSize;
    let max = defaultKeylines.maxSize;
    for (const step of [...this.startKeylineSteps, ...this.endKeylineSteps]) {
      min = Math.min(min, step.minSize);
      max = Math.max(max, step.maxSize);
    }
    this.minItemSize = min;
    this.maxItemSize = max;
    this.startShiftDistance = getStartShiftDistance(this.startKeylineSteps, beforeContentPadding);
    this.endShiftDistance = getEndShiftDistance(this.endKeylineSteps, afterContentPadding);
    this.startShiftPoints = getStepInterpolationPoints(
      this.startShiftDistance,
      this.startKeylineSteps,
      true,
    );
    this.endShiftPoints = getStepInterpolationPoints(
      this.endShiftDistance,
      this.endKeylineSteps,
      false,
    );
  }

  static readonly EMPTY = new Strategy(EMPTY_KEYLINE_LIST, 0, 0, 0, 0);

  /** The size of a focal item, which is each item's (each page's) size. */
  get itemMainAxisSize() {
    return this.defaultKeylines.isEmpty() ? 0 : this.defaultKeylines.firstFocal.size;
  }

  get isValid() {
    return (
      !this.defaultKeylines.isEmpty() && this.availableSpace !== 0 && this.itemMainAxisSize !== 0
    );
  }

  /** The keylines at a scroll offset (getKeylineListForScrollOffset). */
  getKeylineListForScrollOffset(
    scrollOffset: number,
    maxScrollOffset: number,
    roundToNearestStep = false,
  ): KeylineList {
    const positiveScrollOffset = Math.max(0, scrollOffset);
    const startShiftOffset = this.startShiftDistance;
    const endShiftOffset = Math.max(0, maxScrollOffset - this.endShiftDistance);
    if (positiveScrollOffset >= startShiftOffset && positiveScrollOffset <= endShiftOffset) {
      return this.defaultKeylines;
    }

    let interpolation = lerpRange(1, 0, 0, startShiftOffset, positiveScrollOffset);
    let shiftPoints = this.startShiftPoints;
    let steps = this.startKeylineSteps;
    if (positiveScrollOffset > endShiftOffset) {
      interpolation = lerpRange(0, 1, endShiftOffset, maxScrollOffset, positiveScrollOffset);
      shiftPoints = this.endShiftPoints;
      steps = this.endKeylineSteps;
      // Ending at the start: from the last start step straight to the last
      // end step.
      if (
        endShiftOffset < 0.01 &&
        this.startKeylineSteps.length === 2 &&
        this.endKeylineSteps.length === 2
      ) {
        this.lastStartAndEndKeylineListSteps ??= [
          this.startKeylineSteps[this.startKeylineSteps.length - 1],
          this.endKeylineSteps[this.endKeylineSteps.length - 1],
        ];
        steps = this.lastStartAndEndKeylineListSteps;
      }
    }

    let fromStepIndex = 0;
    let toStepIndex = 0;
    let steppedInterpolation = 0;
    let lowerBounds = shiftPoints[0];
    for (let i = 1; i < steps.length; i++) {
      const upperBounds = shiftPoints[i];
      if (interpolation <= upperBounds) {
        fromStepIndex = i - 1;
        toStepIndex = i;
        steppedInterpolation = lerpRange(0, 1, lowerBounds, upperBounds, interpolation);
        break;
      }
      lowerBounds = upperBounds;
    }
    if (roundToNearestStep) {
      return steps[Math.round(steppedInterpolation) === 0 ? fromStepIndex : toStepIndex];
    }
    return lerpKeylineList(steps[fromStepIndex], steps[toStepIndex], steppedInterpolation);
  }

  equals(other: Strategy) {
    if (!this.isValid && !other.isValid) return true;
    return (
      this.isValid === other.isValid &&
      this.availableSpace === other.availableSpace &&
      this.itemSpacing === other.itemSpacing &&
      this.beforeContentPadding === other.beforeContentPadding &&
      this.afterContentPadding === other.afterContentPadding &&
      this.defaultKeylines.equals(other.defaultKeylines)
    );
  }
}

function getStartShiftDistance(steps: KeylineList[], beforeContentPadding: number) {
  if (steps.length === 0) return 0;
  return Math.max(
    steps[steps.length - 1].first().unadjustedOffset - steps[0].first().unadjustedOffset,
    beforeContentPadding,
  );
}

function getEndShiftDistance(steps: KeylineList[], afterContentPadding: number) {
  if (steps.length === 0) return 0;
  return Math.max(
    steps[0].last().unadjustedOffset - steps[steps.length - 1].last().unadjustedOffset,
    afterContentPadding,
  );
}

function getStartKeylineSteps(
  defaultKeylines: KeylineList,
  carouselMainAxisSize: number,
  itemSpacing: number,
  beforeContentPadding: number,
): KeylineList[] {
  if (defaultKeylines.isEmpty()) return [];
  const steps = [defaultKeylines];
  if (defaultKeylines.isFirstFocalItemAtStartOfContainer()) {
    if (beforeContentPadding !== 0) {
      steps.push(
        createShiftedKeylineListForContentPadding(
          defaultKeylines,
          carouselMainAxisSize,
          itemSpacing,
          beforeContentPadding,
          defaultKeylines.firstFocal,
          defaultKeylines.firstFocalIndex,
        ),
      );
    }
    return steps;
  }

  const startIndex = defaultKeylines.firstNonAnchorIndex;
  const endIndex = defaultKeylines.firstFocalIndex;
  const numberOfSteps = endIndex - startIndex;
  if (numberOfSteps <= 0 && defaultKeylines.firstFocal.cutoff > 0) {
    steps.push(
      moveKeylineAndCreateShiftedKeylineList(defaultKeylines, 0, 0, carouselMainAxisSize, itemSpacing),
    );
    return steps;
  }
  for (let i = 0; i < numberOfSteps; i++) {
    const prevStep = steps[steps.length - 1];
    const originalItemIndex = startIndex + i;
    let dstIndex = defaultKeylines.lastIndex;
    if (originalItemIndex > 0) {
      const originalNeighborBeforeSize = defaultKeylines.get(originalItemIndex - 1).size;
      dstIndex = prevStep.firstIndexAfterFocalRangeWithSize(originalNeighborBeforeSize) - 1;
    }
    steps.push(
      moveKeylineAndCreateShiftedKeylineList(
        prevStep,
        defaultKeylines.firstNonAnchorIndex,
        dstIndex,
        carouselMainAxisSize,
        itemSpacing,
      ),
    );
  }
  if (beforeContentPadding !== 0) {
    const last = steps[steps.length - 1];
    steps[steps.length - 1] = createShiftedKeylineListForContentPadding(
      last,
      carouselMainAxisSize,
      itemSpacing,
      beforeContentPadding,
      last.firstFocal,
      last.firstFocalIndex,
    );
  }
  return steps;
}

function getEndKeylineSteps(
  defaultKeylines: KeylineList,
  carouselMainAxisSize: number,
  itemSpacing: number,
  afterContentPadding: number,
): KeylineList[] {
  if (defaultKeylines.isEmpty()) return [];
  const steps = [defaultKeylines];
  if (defaultKeylines.isLastFocalItemAtEndOfContainer(carouselMainAxisSize)) {
    if (afterContentPadding !== 0) {
      steps.push(
        createShiftedKeylineListForContentPadding(
          defaultKeylines,
          carouselMainAxisSize,
          itemSpacing,
          -afterContentPadding,
          defaultKeylines.lastFocal,
          defaultKeylines.lastFocalIndex,
        ),
      );
    }
    return steps;
  }

  const startIndex = defaultKeylines.lastFocalIndex;
  const endIndex = defaultKeylines.lastNonAnchorIndex;
  const numberOfSteps = endIndex - startIndex;
  if (numberOfSteps <= 0 && defaultKeylines.lastFocal.cutoff > 0) {
    steps.push(
      moveKeylineAndCreateShiftedKeylineList(defaultKeylines, 0, 0, carouselMainAxisSize, itemSpacing),
    );
    return steps;
  }
  for (let i = 0; i < numberOfSteps; i++) {
    const prevStep = steps[steps.length - 1];
    const originalItemIndex = endIndex - i;
    let dstIndex = 0;
    if (originalItemIndex < defaultKeylines.lastIndex) {
      const originalNeighborAfterSize = defaultKeylines.get(originalItemIndex + 1).size;
      dstIndex = prevStep.lastIndexBeforeFocalRangeWithSize(originalNeighborAfterSize) + 1;
    }
    steps.push(
      moveKeylineAndCreateShiftedKeylineList(
        prevStep,
        defaultKeylines.lastNonAnchorIndex,
        dstIndex,
        carouselMainAxisSize,
        itemSpacing,
      ),
    );
  }
  if (afterContentPadding !== 0) {
    const last = steps[steps.length - 1];
    steps[steps.length - 1] = createShiftedKeylineListForContentPadding(
      last,
      carouselMainAxisSize,
      itemSpacing,
      -afterContentPadding,
      last.lastFocal,
      last.lastFocalIndex,
    );
  }
  return steps;
}

function createShiftedKeylineListForContentPadding(
  from: KeylineList,
  carouselMainAxisSize: number,
  itemSpacing: number,
  contentPadding: number,
  pivot: Keyline,
  pivotIndex: number,
): KeylineList {
  const numberOfNonAnchorKeylines = from.keylines.filter((k) => !k.isAnchor).length;
  const sizeReduction = contentPadding / numberOfNonAnchorKeylines;
  const builder = new KeylineListBuilder();
  for (const k of from.keylines) builder.add(k.size - Math.abs(sizeReduction), k.isAnchor);
  const newKeylines = builder.createWithPivot(
    carouselMainAxisSize,
    itemSpacing,
    pivotIndex,
    pivot.offset - sizeReduction / 2 + contentPadding,
  );
  // The pages still lay out at the original size: keep the unadjusted offsets.
  return new KeylineList(
    newKeylines.keylines.map((k, i) => ({...k, unadjustedOffset: from.get(i).unadjustedOffset})),
  );
}

function moveKeylineAndCreateShiftedKeylineList(
  from: KeylineList,
  srcIndex: number,
  dstIndex: number,
  carouselMainAxisSize: number,
  itemSpacing: number,
): KeylineList {
  const pivotDir = srcIndex > dstIndex ? 1 : -1;
  const pivotDelta =
    (from.get(srcIndex).size - from.get(srcIndex).cutoff + itemSpacing) * pivotDir;
  const newPivotIndex = from.pivotIndex + pivotDir;
  const newPivotOffset = from.pivot.offset + pivotDelta;
  const moved = [...from.keylines];
  const [keyline] = moved.splice(srcIndex, 1);
  moved.splice(dstIndex, 0, keyline);
  const builder = new KeylineListBuilder();
  for (const k of moved) builder.add(k.size, k.isAnchor);
  return builder.createWithPivot(carouselMainAxisSize, itemSpacing, newPivotIndex, newPivotOffset);
}

function getStepInterpolationPoints(
  totalShiftDistance: number,
  steps: KeylineList[],
  isShiftingLeft: boolean,
): number[] {
  const points = [0];
  if (totalShiftDistance === 0 || steps.length === 0) return points;
  for (let i = 1; i < steps.length; i++) {
    const prev = steps[i - 1];
    const curr = steps[i];
    const distanceShifted = isShiftingLeft
      ? curr.first().unadjustedOffset - prev.first().unadjustedOffset
      : prev.last().unadjustedOffset - curr.last().unadjustedOffset;
    const stepPercentage = distanceShifted / totalShiftDistance;
    points.push(i === steps.length - 1 ? 1 : points[i - 1] + stepPercentage);
  }
  return points;
}

/** Maps `value` from the input range to the output range, clamped (Strategy.kt's lerp). */
export function lerpRange(
  outputMin: number,
  outputMax: number,
  inputMin: number,
  inputMax: number,
  value: number,
) {
  if (value <= inputMin) return outputMin;
  if (value >= inputMax) return outputMax;
  return outputMin + (outputMax - outputMin) * ((value - inputMin) / (inputMax - inputMin));
}
