/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

// <petal-shape> with a real mouse pointer: springs run on real frames.

import {emulateMedia, resetMouse, sendMouse} from '@web/test-runner-commands';
import {html, render, TemplateResult} from 'lit';

import '../shape.js';

import {materialShape, ShapeName, shapePath} from '../shapes.js';
import {Shape} from './shape.js';

const frame = () => new Promise(requestAnimationFrame);

/** The clip-path a shape gets at a size, as the browser writes it back. */
function clipOf(name: ShapeName, width = 48, height = width) {
  const probe = document.createElement('div');
  probe.style.clipPath = `path('${shapePath(materialShape(name), width, height)}')`;
  return probe.style.clipPath;
}

function center(element: Element): [number, number] {
  const box = element.getBoundingClientRect();
  return [Math.round(box.left + box.width / 2), Math.round(box.top + box.height / 2)];
}

describe('<petal-shape>', () => {
  let root: HTMLElement;

  // Not the testing Environment: its fake clock would stop the frames.
  async function setupTest(template: TemplateResult = html`<petal-shape></petal-shape>`) {
    root = document.createElement('div');
    document.body.append(root);
    render(template, root);
    const shape = root.querySelector('petal-shape') as Shape;
    await shape.updateComplete;
    // The size arrives with the first resize observation.
    await frame();
    await frame();
    const box = shape.shadowRoot!.querySelector('.shape') as HTMLElement;
    return {shape, clip: () => box.style.clipPath};
  }

  /** Waits for the clip to settle on a shape, or up to 3 seconds. */
  async function settle(clip: () => string, name: ShapeName, size = 48) {
    const expected = clipOf(name, size);
    const end = performance.now() + 3000;
    while (clip() !== expected && performance.now() < end) await frame();
    return clip() === expected;
  }

  afterEach(async () => {
    root.remove();
    await resetMouse();
    await emulateMedia({reducedMotion: 'no-preference'});
  });

  it('is a 48px circle by default', async () => {
    const {shape, clip} = await setupTest();
    expect(shape.getBoundingClientRect().width).toBe(48);
    expect(clip()).toBe(clipOf('circle'));
  });

  it('clips to its shape at its size, and follows its size', async () => {
    const {shape, clip} = await setupTest(
      html`<petal-shape shape="cookie-9-sided" style="width: 120px; height: 80px"></petal-shape>`,
    );
    expect(clip()).toBe(clipOf('cookie-9-sided', 120, 80));
    shape.style.width = '80px';
    await frame();
    await frame();
    expect(clip()).toBe(clipOf('cookie-9-sided', 80, 80));
  });

  it('morphs to a new shape on a spring', async () => {
    const {shape, clip} = await setupTest();
    shape.shape = 'heart';
    await shape.updateComplete;
    await frame();
    // On the way: neither shape.
    expect(clip()).not.toBe(clipOf('circle'));
    expect(clip()).not.toBe(clipOf('heart'));
    expect(await settle(clip, 'heart')).toBeTrue();
  });

  it('takes its hover shape under a mouse, and its pressed shape when pressed', async () => {
    const {shape, clip} = await setupTest(
      html`<petal-shape shape="circle" hover-shape="cookie-6-sided" pressed-shape="square"></petal-shape>`,
    );
    await sendMouse({type: 'move', position: center(shape)});
    expect(await settle(clip, 'cookie-6-sided')).toBeTrue();
    await sendMouse({type: 'down'});
    expect(await settle(clip, 'square')).toBeTrue();
    await sendMouse({type: 'up'});
    expect(await settle(clip, 'cookie-6-sided')).toBeTrue();
    await sendMouse({type: 'move', position: [0, 0]});
    expect(await settle(clip, 'circle')).toBeTrue();
  });

  it('turns back or morphs on from where it is when interrupted', async () => {
    const {shape, clip} = await setupTest(
      html`<petal-shape shape="circle" hover-shape="flower" pressed-shape="pill"></petal-shape>`,
    );
    await sendMouse({type: 'move', position: center(shape)});
    await frame();
    await frame();
    // Leaving mid-way turns the same morph back.
    await sendMouse({type: 'move', position: [0, 0]});
    expect(await settle(clip, 'circle')).toBeTrue();

    await sendMouse({type: 'move', position: center(shape)});
    await frame();
    await frame();
    // Pressing mid-way morphs on to the pressed shape.
    await sendMouse({type: 'down'});
    await frame();
    expect(clip()).not.toBe(clipOf('flower'));
    expect(await settle(clip, 'pill')).toBeTrue();
    await sendMouse({type: 'up'});
    expect(await settle(clip, 'flower')).toBeTrue();
  });

  it('changes shape at once with reduced motion', async () => {
    await emulateMedia({reducedMotion: 'reduce'});
    const {shape, clip} = await setupTest();
    shape.shape = 'gem';
    await shape.updateComplete;
    expect(clip()).toBe(clipOf('gem'));
  });

  it('falls back to the circle for an unknown shape', async () => {
    const {clip} = await setupTest(html`<petal-shape shape="blob"></petal-shape>`);
    expect(clip()).toBe(clipOf('circle'));
  });
});
