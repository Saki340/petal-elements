/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

// Jetpack Compose Material 3's carousel MultiBrowseTest.kt and StrategyTest.kt
// (androidx commit df73c24), ported, with Density(1f): dp are px.

import {
  heroKeylineList,
  keylineListOf,
  MAX_SMALL_ITEM_SIZE,
  MIN_SMALL_ITEM_SIZE,
  multiBrowseKeylineList,
  uncontainedKeylineList,
} from './keylines.js';
import {itemLayout, maxScrollOffset, snapScrollOffsets} from './layout.js';
import {Strategy} from './strategy.js';

const large = 100;
const small = 20;
const medium = (large + small) / 2;
const xSmall = 5;

function startAligned() {
  // [xs | l m s | xs]
  return keylineListOf(large + medium + small, 0, 'start', (k) => {
    k.add(xSmall, true);
    k.add(large);
    k.add(medium);
    k.add(small);
    k.add(xSmall, true);
  });
}

describe('carousel keylines (MultiBrowseTest)', () => {
  it('does not resize large items when there is room', () => {
    const keylines = multiBrowseKeylineList(500, 120, 0, 10);
    expect(new Strategy(keylines, 500, 0, 0, 0).itemMainAxisSize).toBe(120);
  });

  it('resizes an item larger than the container to fit one small item', () => {
    const keylines = multiBrowseKeylineList(100, 200, 0, 10);
    const strategy = new Strategy(keylines, 100, 0, 0, 0);
    expect(strategy.itemMainAxisSize).toBeLessThanOrEqual(100);
    expect(keylines.size).toBe(4);
    expect(keylines.get(0).unadjustedOffset).toBeLessThan(0);
    expect(keylines.last().unadjustedOffset).toBeGreaterThan(100);
    expect(keylines.get(1).isFocal).toBeTrue();
    expect(keylines.get(2).size).toBe(MIN_SMALL_ITEM_SIZE);
  });

  it('has no small items if there is no room', () => {
    const keylines = multiBrowseKeylineList(MIN_SMALL_ITEM_SIZE, 200, 0, 10);
    const strategy = new Strategy(keylines, MIN_SMALL_ITEM_SIZE, 0, 0, 0);
    expect(strategy.itemMainAxisSize).toBe(MIN_SMALL_ITEM_SIZE);
    expect(keylines.firstFocal).toBe(keylines.firstNonAnchor);
    expect(keylines.lastFocal).toBe(keylines.lastNonAnchor);
  });

  it('is empty without space', () => {
    expect(multiBrowseKeylineList(0, 200, 0, 10).isEmpty()).toBeTrue();
    expect(multiBrowseKeylineList(-10, 200, 0, 10).isEmpty()).toBeTrue();
  });

  it('sizes medium items between large and small', () => {
    const size = 200 * 2 + MAX_SMALL_ITEM_SIZE * 2;
    const keylines = multiBrowseKeylineList(size, 200, 0, 10);
    expect(keylines.size).toBe(6);
    expect(keylines.get(1).isFocal).toBeTrue();
    expect(keylines.get(2).isFocal).toBeTrue();
    expect(keylines.get(3).size).toBeLessThan(keylines.get(2).size);
    expect(keylines.get(4).size).toBeLessThan(keylines.get(3).size);
  });

  it('drops keylines with fewer items', () => {
    const size = 200 * 2 + MAX_SMALL_ITEM_SIZE * 2;
    const keylines = multiBrowseKeylineList(size, 200, 0, 3);
    expect(keylines.size).toBe(5);
    expect(keylines.get(3).size).toBeLessThan(keylines.get(2).size);
  });

  it('accounts for item spacing', () => {
    const keylines = multiBrowseKeylineList(380, 186, 8, 10);
    const strategy = new Strategy(keylines, 380, 8, 0, 0);
    expect(keylines.firstFocal.size).toBe(186);
    expect(keylines.firstFocal.offset).toBe(186 / 2);
    expect(keylines.lastNonAnchor.offset + keylines.lastNonAnchor.size / 2).toBe(380);
    expect(strategy.itemMainAxisSize).toBe(186);
    expect(keylines.get(3).size).toBe(56);
    expect(keylines.get(3).offset).toBe(380 - 56 / 2);
    const max = 186 * 10 + 8 * 10 - 380;
    expect(strategy.getKeylineListForScrollOffset(0, max).keylines.map((k) => k.unadjustedOffset))
      .toEqual([-101, 93, 287, 481, 675]);
  });
});

describe('carousel strategy (StrategyTest)', () => {
  it('shifts a start-aligned list at the end', () => {
    const size = large + medium + small;
    const max = 10 * large - size;
    const defaults = startAligned();
    const strategy = new Strategy(defaults, size, 0, 0, 0);
    expect(strategy.getKeylineListForScrollOffset(0, max).equals(defaults)).toBeTrue();
    const end = strategy.getKeylineListForScrollOffset(max, max);
    expect(end.keylines.map((k) => k.offset)).toEqual([-2.5, 10, 50, 130, 182.5]);
    expect(end.keylines.map((k) => k.unadjustedOffset)).toEqual([
      130 - 300,
      130 - 200,
      130 - 100,
      130,
      130 + 100,
    ]);
  });

  it('skips the defaults when the shifts overlap, and keeps the content padding', () => {
    const size = large + small;
    const max = large * 2 - size;
    const defaults = keylineListOf(size, 0, 'start', (k) => {
      k.add(xSmall, true);
      k.add(large);
      k.add(small);
      k.add(xSmall, true);
    });
    const strategy = new Strategy(defaults, size, 0, 24, 48);
    const start = strategy.getKeylineListForScrollOffset(0, max);
    expect(start.firstFocal.offset).toBe(24 + start.firstFocal.size / 2);
    const end = strategy.getKeylineListForScrollOffset(max, max);
    expect(end.lastFocal.offset).toBe(size - 48 - end.lastFocal.size / 2);
    const middle = strategy.getKeylineListForScrollOffset(max / 2, max, true);
    expect(middle.keylines.map((k) => k.offset)).not.toEqual(
      defaults.keylines.map((k) => k.offset),
    );
  });

  it('accounts for item spacing in the end steps', () => {
    const strategy = new Strategy(
      keylineListOf(380, 8, 'start', (k) => {
        k.add(10, true);
        k.add(186);
        k.add(122);
        k.add(56);
        k.add(10, true);
      }),
      380,
      8,
      0,
      0,
    );
    const middle = strategy.endKeylineSteps[1];
    expect(middle.keylines.map((k) => k.offset)).toEqual([-13, 28, 157, 319, 393]);
    expect(middle.keylines.map((k) => k.unadjustedOffset)).toEqual([-231, -37, 157, 351, 545]);
    const end = strategy.endKeylineSteps[2];
    expect(end.keylines.map((k) => k.offset)).toEqual([-13, 28, 125, 287, 393]);
    expect(end.keylines.map((k) => k.unadjustedOffset)).toEqual([-295, -101, 93, 287, 481]);
  });

  it('accounts for content padding with two large items and one small', () => {
    const strategy = new Strategy(
      keylineListOf(444, 8, 'start', (k) => {
        k.add(10, true);
        k.add(186);
        k.add(186);
        k.add(56);
        k.add(10, true);
      }),
      444,
      8,
      16,
      16,
    );
    expect(strategy.itemMainAxisSize).toBe(186);
    const lastStartSmall = strategy.startKeylineSteps[strategy.startKeylineSteps.length - 1].get(3);
    expect(lastStartSmall.offset + lastStartSmall.size / 2).toBeCloseTo(444, 3);
    const lastEnd = strategy.endKeylineSteps[strategy.endKeylineSteps.length - 1];
    expect(lastEnd.get(1).size + 8 + lastEnd.get(2).size + 8 + lastEnd.get(3).size).toBe(444 - 16);
    expect(lastEnd.get(1).offset - lastEnd.get(1).size / 2).toBeCloseTo(0, 3);
  });
});

describe('carousel layout (carouselItem)', () => {
  const keylines = multiBrowseKeylineList(380, 186, 8, 10);
  const strategy = new Strategy(keylines, 380, 8, 0, 0);
  const max = maxScrollOffset(strategy, 10);

  it('scrolls through all items at the focal size', () => {
    expect(max).toBe(186 * 10 + 8 * 9 - 380);
  });

  it('shows the first item large, then medium and small ones, at the start', () => {
    const items = [0, 1, 2].map((i) => itemLayout(strategy, i, 0, max));
    expect(items[0]).toEqual({center: 93, size: 186});
    expect(items[1].size).toBe(keylines.get(2).size);
    expect(items[2].size).toBe(56);
    expect(items[2].center + items[2].size / 2).toBeCloseTo(380, 3);
  });

  it('snaps each item to rest, the first and last at the ends', () => {
    const offsets = snapScrollOffsets(strategy, 10);
    expect(offsets[0]).toBe(0);
    expect(offsets[offsets.length - 1]).toBe(max);
    for (let i = 1; i < offsets.length; i++) expect(offsets[i]).toBeGreaterThan(offsets[i - 1]);
  });

  it('builds uncontained and hero keylines', () => {
    const uncontained = uncontainedKeylineList(400, 150, 8);
    expect(uncontained.firstFocal.size).toBe(158);
    const hero = heroKeylineList(400, null, 8, 5, true);
    expect(hero.firstFocal.size).toBeGreaterThan(hero.minSize);
    expect(hero.firstFocal.offset + hero.firstFocal.size / 2).toBeLessThan(400);
  });
});
