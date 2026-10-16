/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  BOUNDARY_DAMPENING_ZONE,
  calculateAnchors,
  closestAnchor,
  computeTarget,
  dampenFlingVelocity,
  MAX_FLING_VELOCITY,
  overflowScale,
  POSITIONAL_THRESHOLD,
  positionOf,
  resolveValue,
  VELOCITY_THRESHOLD,
  VelocityTracker,
} from './sheet-physics.js';

describe('sheet physics', () => {
  it('uses the thresholds of BottomSheetDefaults', () => {
    expect(POSITIONAL_THRESHOLD).toBe(56);
    expect(VELOCITY_THRESHOLD).toBe(125);
    expect(BOUNDARY_DAMPENING_ZONE).toBe(125);
  });

  describe('calculateAnchors', () => {
    it('hides at the bottom, expands to the sheet height', () => {
      const anchors = calculateAnchors(800, 300, true);
      expect(anchors).toEqual([
        {value: 'hidden', position: 800},
        {value: 'expanded', position: 500},
      ]);
    });

    it('partially expands at half the page for a tall sheet', () => {
      const anchors = calculateAnchors(800, 700, false);
      expect(positionOf(anchors, 'partially-expanded')).toBe(400);
      expect(positionOf(anchors, 'expanded')).toBe(100);
    });

    it('partially expands to the sheet height for a short sheet', () => {
      // The deterministic behavior: the partial anchor converges with expanded.
      const anchors = calculateAnchors(800, 300, false);
      expect(positionOf(anchors, 'partially-expanded')).toBe(500);
      expect(positionOf(anchors, 'expanded')).toBe(500);
    });

    it('limits the expanded anchor to the top of the page', () => {
      const anchors = calculateAnchors(800, 800, false);
      expect(positionOf(anchors, 'expanded')).toBe(0);
    });

    it('has only hidden without content', () => {
      expect(calculateAnchors(800, 0, false)).toEqual([{value: 'hidden', position: 800}]);
    });
  });

  describe('resolveValue', () => {
    it('keeps a value that is an anchor', () => {
      const anchors = calculateAnchors(800, 700, false);
      expect(resolveValue(anchors, 'partially-expanded')).toBe('partially-expanded');
      expect(resolveValue(anchors, 'expanded')).toBe('expanded');
      expect(resolveValue(anchors, 'hidden')).toBe('hidden');
    });

    it('falls back from partially expanded to expanded, then hidden', () => {
      expect(resolveValue(calculateAnchors(800, 700, true), 'partially-expanded')).toBe('expanded');
      expect(resolveValue(calculateAnchors(800, 0, false), 'partially-expanded')).toBe('hidden');
      expect(resolveValue(calculateAnchors(800, 0, false), 'expanded')).toBe('hidden');
    });
  });

  describe('closestAnchor', () => {
    const anchors = calculateAnchors(800, 700, false); // 800, 400, 100

    it('finds the closest anchor', () => {
      expect(closestAnchor(anchors, 150)!.value).toBe('expanded');
      expect(closestAnchor(anchors, 300)!.value).toBe('partially-expanded');
      expect(closestAnchor(anchors, 700)!.value).toBe('hidden');
    });

    it('searches down or up from a position', () => {
      expect(closestAnchor(anchors, 150, true)!.value).toBe('partially-expanded');
      expect(closestAnchor(anchors, 150, false)!.value).toBe('expanded');
      expect(closestAnchor(anchors, 450, true)!.value).toBe('hidden');
      expect(closestAnchor(anchors, 400, true)!.value).toBe('partially-expanded');
      expect(closestAnchor(anchors, 50, false)).toBeUndefined();
    });

    it('prefers the later anchor on a tie', () => {
      const converged = calculateAnchors(800, 300, false);
      expect(closestAnchor(converged, 500)!.value).toBe('expanded');
    });
  });

  describe('computeTarget', () => {
    const anchors = calculateAnchors(800, 700, false); // 800, 400, 100

    it('goes to the closest anchor without velocity', () => {
      expect(computeTarget(anchors, 270, 0)).toBe('partially-expanded');
      expect(computeTarget(anchors, 700, 0)).toBe('hidden');
    });

    it('goes to the next anchor in the direction of a fast fling', () => {
      // Released just below expanded, flung down at the threshold.
      expect(computeTarget(anchors, 110, VELOCITY_THRESHOLD)).toBe('partially-expanded');
      // Flung up from just above the partial anchor.
      expect(computeTarget(anchors, 380, -VELOCITY_THRESHOLD)).toBe('expanded');
      // Down from the partial anchor to hidden.
      expect(computeTarget(anchors, 410, 2000)).toBe('hidden');
    });

    it('stays when a slow release is within the positional threshold', () => {
      // 55px below expanded, moving down slowly: back to expanded.
      expect(computeTarget(anchors, 100 + POSITIONAL_THRESHOLD - 1, 50)).toBe('expanded');
      // 55px above partially expanded, moving up slowly: back to it.
      expect(computeTarget(anchors, 400 - POSITIONAL_THRESHOLD + 1, -50)).toBe('partially-expanded');
    });

    it('moves on when a slow release is beyond the positional threshold', () => {
      expect(computeTarget(anchors, 100 + POSITIONAL_THRESHOLD, 50)).toBe('partially-expanded');
      expect(computeTarget(anchors, 400 - POSITIONAL_THRESHOLD, -50)).toBe('expanded');
      expect(computeTarget(anchors, 400 + POSITIONAL_THRESHOLD, 50)).toBe('hidden');
    });

    it('dismisses a partial sheet dragged down past the threshold', () => {
      const partial = calculateAnchors(800, 300, false); // 800, 500, 500
      expect(computeTarget(partial, 500 + 40, 20)).toBe('expanded');
      expect(computeTarget(partial, 500 + 60, 20)).toBe('hidden');
    });
  });

  describe('dampenFlingVelocity', () => {
    it('keeps velocities away from the bottom', () => {
      expect(dampenFlingVelocity(500, 200, 800)).toBe(500);
      expect(dampenFlingVelocity(-500, 780, 800)).toBe(-500);
    });

    it('clamps to the maximum velocity', () => {
      expect(dampenFlingVelocity(20000, 200, 800)).toBe(MAX_FLING_VELOCITY);
      expect(dampenFlingVelocity(-20000, 200, 800)).toBe(-MAX_FLING_VELOCITY);
    });

    it('scales a downward fling near the bottom by the square of the distance', () => {
      // Half the dampening zone from the floor: a quarter of the velocity.
      const offset = 800 - BOUNDARY_DAMPENING_ZONE / 2;
      expect(dampenFlingVelocity(400, offset, 800)).toBe(VELOCITY_THRESHOLD);
      expect(dampenFlingVelocity(4000, offset, 800)).toBe(1000);
    });

    it('keeps a valid fling at the velocity threshold at least', () => {
      expect(dampenFlingVelocity(200, 800 - 10, 800)).toBe(VELOCITY_THRESHOLD);
    });

    it('lets a slow drag stay slow', () => {
      expect(dampenFlingVelocity(50, 800 - 10, 800)).toBeLessThan(1);
    });
  });

  describe('overflowScale', () => {
    it('is 1 at or below the topmost anchor', () => {
      expect(overflowScale(100, 100, 700)).toBe(1);
      expect(overflowScale(300, 100, 700)).toBe(1);
    });

    it('stretches the sheet by the overflow above it', () => {
      expect(overflowScale(80, 100, 700)).toBeCloseTo(720 / 700);
    });
  });

  describe('VelocityTracker', () => {
    it('is the speed of the last moves', () => {
      const tracker = new VelocityTracker();
      tracker.addPosition(0, 0);
      tracker.addPosition(50, 25);
      tracker.addPosition(100, 50);
      expect(tracker.velocity(100)).toBe(500);
    });

    it('ignores moves older than 100ms', () => {
      const tracker = new VelocityTracker();
      tracker.addPosition(0, 0);
      tracker.addPosition(50, 100);
      tracker.addPosition(250, 110);
      tracker.addPosition(300, 120);
      expect(tracker.velocity(300)).toBe(200);
    });

    it('is zero for a pointer that stopped', () => {
      const tracker = new VelocityTracker();
      tracker.addPosition(0, 0);
      tracker.addPosition(50, 100);
      expect(tracker.velocity(400)).toBe(0);
    });

    it('is zero without moves', () => {
      const tracker = new VelocityTracker();
      tracker.addPosition(0, 0);
      expect(tracker.velocity(10)).toBe(0);
    });
  });
});
