/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

// A port of Jetpack Compose Material 3's carousel Arrangement.kt (androidx
// commit df73c24): the counts and sizes of large, medium and small items that
// fill a carousel, and the search for the one closest to the wanted large size.

/** MediumItemFlexPercentage. */
const MEDIUM_ITEM_FLEX_PERCENTAGE = 0.1;

/** A carousel's large, medium and small items. */
export class Arrangement {
  constructor(
    readonly priority: number,
    readonly smallSize: number,
    readonly smallCount: number,
    readonly mediumSize: number,
    readonly mediumCount: number,
    readonly largeSize: number,
    readonly largeCount: number,
  ) {}

  private isValid() {
    if (this.largeCount > 0 && this.smallCount > 0 && this.mediumCount > 0) {
      return this.largeSize > this.mediumSize && this.mediumSize > this.smallSize;
    } else if (this.largeCount > 0 && this.smallCount > 0) {
      return this.largeSize > this.smallSize;
    }
    return true;
  }

  cost(targetLargeSize: number) {
    if (!this.isValid()) return Number.MAX_VALUE;
    return Math.abs(targetLargeSize - this.largeSize) * this.priority;
  }

  itemCount() {
    return this.largeCount + this.mediumCount + this.smallCount;
  }
}

/** What findLowestCostArrangement fits. */
export interface ArrangementTargets {
  availableSpace: number;
  itemSpacing: number;
  targetSmallSize: number;
  minSmallSize: number;
  maxSmallSize: number;
  smallCounts: number[];
  targetMediumSize: number;
  mediumCounts: number[];
  targetLargeSize: number;
  largeCounts: number[];
}

/**
 * The arrangement, of all the counts given, whose large items are closest to
 * the target size, earlier counts first.
 */
export function findLowestCostArrangement(targets: ArrangementTargets): Arrangement | null {
  let lowest: Arrangement | null = null;
  let priority = 1;
  for (const largeCount of targets.largeCounts) {
    for (const mediumCount of targets.mediumCounts) {
      for (const smallCount of targets.smallCounts) {
        const arrangement = fit(priority, targets, smallCount, mediumCount, largeCount);
        if (
          lowest === null ||
          arrangement.cost(targets.targetLargeSize) < lowest.cost(targets.targetLargeSize)
        ) {
          lowest = arrangement;
          if (lowest.cost(targets.targetLargeSize) === 0) return lowest;
        }
        priority++;
      }
    }
  }
  return lowest;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function fit(
  priority: number,
  targets: ArrangementTargets,
  smallCount: number,
  mediumCount: number,
  largeCount: number,
): Arrangement {
  const {availableSpace, itemSpacing, minSmallSize, maxSmallSize} = targets;
  const largeSize = targets.targetLargeSize;
  const totalItemCount = largeCount + mediumCount + smallCount;
  const availableSpaceWithoutSpacing = availableSpace - (totalItemCount - 1) * itemSpacing;
  let arrangedSmallSize = clamp(targets.targetSmallSize, minSmallSize, maxSmallSize);
  const arrangedMediumTarget = targets.targetMediumSize;

  const totalSpaceTaken =
    largeSize * largeCount + arrangedMediumTarget * mediumCount + arrangedSmallSize * smallCount;
  const delta = availableSpaceWithoutSpacing - totalSpaceTaken;
  // First, resize small items within their range to fit the space.
  if (smallCount > 0 && delta > 0) {
    arrangedSmallSize += Math.min(delta / smallCount, maxSmallSize - arrangedSmallSize);
  } else if (smallCount > 0 && delta < 0) {
    arrangedSmallSize += Math.max(delta / smallCount, minSmallSize - arrangedSmallSize);
  }
  arrangedSmallSize = smallCount > 0 ? arrangedSmallSize : 0;
  let arrangedLargeSize = calculateLargeSize(
    availableSpaceWithoutSpacing,
    smallCount,
    arrangedSmallSize,
    mediumCount,
    largeCount,
  );
  let arrangedMediumSize = (arrangedLargeSize + arrangedSmallSize) / 2;

  // Counter a change of the large size with the medium item's flex.
  if (mediumCount > 0 && arrangedLargeSize !== largeSize) {
    const targetAdjustment = (largeSize - arrangedLargeSize) * largeCount;
    const availableMediumFlex = arrangedMediumSize * MEDIUM_ITEM_FLEX_PERCENTAGE * mediumCount;
    const distribute = Math.min(Math.abs(targetAdjustment), availableMediumFlex);
    if (targetAdjustment > 0) {
      arrangedMediumSize -= distribute / mediumCount;
      arrangedLargeSize += distribute / largeCount;
    } else {
      arrangedMediumSize += distribute / mediumCount;
      arrangedLargeSize -= distribute / largeCount;
    }
  }

  return new Arrangement(
    priority,
    arrangedSmallSize,
    smallCount,
    arrangedMediumSize,
    mediumCount,
    arrangedLargeSize,
    largeCount,
  );
}

function calculateLargeSize(
  availableSpace: number,
  smallCount: number,
  smallSize: number,
  mediumCount: number,
  largeCount: number,
) {
  return (
    (availableSpace - (smallCount + mediumCount / 2) * smallSize) /
    (largeCount + mediumCount / 2)
  );
}
