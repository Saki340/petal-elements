/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import '../ripple.js';

import {html} from 'lit';
import {customElement} from 'lit/decorators.js';

import {Environment} from '../../testing/environment.js';
import {Harness} from '../../testing/harness.js';

import {Ripple} from './ripple.js';

enum RippleStateClasses {
  HOVERED = 'hovered',
  PRESSED = 'pressed',
}

declare global {
  interface HTMLElementTagNameMap {
    'test-ripple': TestRipple;
  }
}

@customElement('test-ripple')
class TestRipple extends Ripple {}

interface WithState {
  state: number;
}

describe('Ripple', () => {
  const env = new Environment();

  async function setupTest() {
    const root = env.render(html`
      <div>
        <test-ripple></test-ripple>
      </div>
    `);

    const container = root.querySelector('div');
    if (!container) {
      throw new Error('Could not query rendered container.');
    }

    const instance = root.querySelector('test-ripple');
    if (!instance) {
      throw new Error('Could not query rendered <test-ripple>.');
    }

    await env.waitForStability();

    const surface = instance.renderRoot.querySelector('.surface');
    if (!surface) {
      throw new Error('Could not query rendered surface.');
    }

    return {
      instance,
      surface,
      harness: new Harness(container),
    };
  }

  describe('basic', () => {
    it('initializes as a test-ripple', async () => {
      const {instance} = await setupTest();
      expect(instance).toBeInstanceOf(TestRipple);
    });

    it('sets pressed class on begin press', async () => {
      const {harness, surface} = await setupTest();
      await harness.startTap();
      // No touch delay: the ripple starts at once.
      await env.waitForStability();

      expect(surface).toHaveClass(RippleStateClasses.PRESSED);
    });

    it('removes pressed class on end press', async () => {
      const {harness, surface} = await setupTest();
      await harness.startTap();
      await harness.endTap();
      await harness.endTapClick();
      // No minimum press: it fades out at once.
      await env.waitForStability();

      expect(surface).not.toHaveClass(RippleStateClasses.PRESSED);
    });

    it('sets hover class on pointer enter', async () => {
      const {harness, surface} = await setupTest();
      await harness.startHover();
      await env.waitForStability();

      expect(surface).toHaveClass(RippleStateClasses.HOVERED);
    });

    it('removes hover class on pointer leave', async () => {
      const {harness, surface} = await setupTest();
      await harness.startHover();
      await env.waitForStability();
      await harness.endHover();
      await env.waitForStability();

      expect(surface).not.toHaveClass(RippleStateClasses.HOVERED);
    });

    it('stops hovering when disabled', async () => {
      const {instance, harness, surface} = await setupTest();
      await harness.startHover();
      await env.waitForStability();
      instance.disabled = true;
      await env.waitForStability();

      expect(surface).not.toHaveClass(RippleStateClasses.HOVERED);
    });

    it('responds to keyboard click after mouse click', async () => {
      const {instance, harness} = await setupTest();
      const STATE_INACTIVE = 0;
      await harness.clickWithMouse();
      await env.waitForStability();
      expect((instance as unknown as WithState).state).toBe(STATE_INACTIVE);
      await harness.clickWithKeyboard();
      await env.waitForStability();
      expect((instance as unknown as WithState).state).toBe(STATE_INACTIVE);
    });
  });

  describe('press ripple', () => {
    async function setupPress() {
      const root = env.render(html`
        <div style="position: relative; width: 200px; height: 40px">
          <petal-ripple></petal-ripple>
        </div>
      `);
      const ripple = root.querySelector('petal-ripple')!;
      await env.waitForStability();
      const surface = ripple.renderRoot.querySelector('.surface')!;
      const rect = ripple.getBoundingClientRect();
      const press = (x: number, y: number) => {
        // The ripple listens to its control, the parent.
        ripple.parentElement!.dispatchEvent(
          new PointerEvent('pointerdown', {
            isPrimary: true,
            pointerType: 'mouse',
            button: 0,
            buttons: 1,
            clientX: rect.left + x,
            clientY: rect.top + y,
            bubbles: true,
          }),
        );
      };
      const release = () => {
        ripple.parentElement!.dispatchEvent(new MouseEvent('click', {bubbles: true}));
      };
      return {ripple, surface, press, release};
    }

    it('grows a circle twice the diagonal from the pointer', async () => {
      const {surface, press} = await setupPress();
      press(30, 20);
      await env.waitForStability();
      expect(surface).toHaveClass(RippleStateClasses.PRESSED);
      const wave = surface.querySelector<HTMLElement>('.wave')!;
      const size = Math.hypot(200, 40) * 2;
      expect(parseFloat(wave.style.width)).toBeCloseTo(size, 2);
      // Centered on the pointer.
      expect(parseFloat(wave.style.left)).toBeCloseTo(30 - size / 2, 2);
      expect(parseFloat(wave.style.top)).toBeCloseTo(20 - size / 2, 2);
      expect(getComputedStyle(wave).borderRadius).toBe('50%');
      // From 20% to full size.
      const [animation] = wave.getAnimations();
      const [first, last] = (animation.effect as KeyframeEffect).getKeyframes();
      expect(first['transform']).toBe('scale(0.2)');
      expect(last['transform']).toBe('scale(1)');
    });

    it('overlaps the waves of quick presses', async () => {
      const {surface, press, release} = await setupPress();
      press(30, 20);
      release();
      press(150, 20);
      await env.waitForStability();
      // The first wave is still fading out.
      expect(surface.querySelectorAll('.wave').length).toBe(2);
    });

    it('shows no wave with reduced motion', async () => {
      const {surface, press} = await setupPress();
      spyOn(window, 'matchMedia').and.returnValue({matches: true} as MediaQueryList);
      press(30, 20);
      await env.waitForStability();
      expect(surface.querySelector('.wave')).toBeNull();
    });
  });
});
