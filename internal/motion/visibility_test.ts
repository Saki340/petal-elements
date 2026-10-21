/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

// Endless animations draw only while their element is in the viewport. Real
// animation frames, so no Environment.

import '../../loadingindicator/loading-indicator.js';
import '../../progress/circular-progress.js';
import '../../progress/linear-progress.js';

import {html, render} from 'lit';

const frame = () => new Promise(requestAnimationFrame);
const frames = async (count: number) => {
  for (let i = 0; i < count; i++) await frame();
};

/** What an animated element has drawn: its SVG's attributes, which change as it moves. */
function drawing(element: Element) {
  return [...element.shadowRoot!.querySelectorAll('svg, svg *')]
    .map((node) => [...node.attributes].map((a) => `${a.name}=${a.value}`).join(' '))
    .join('|');
}

describe('animations out of view', () => {
  let root: HTMLElement;

  beforeEach(() => {
    root = document.createElement('div');
    document.body.append(root);
  });

  afterEach(() => root.remove());

  const cases: Array<[string, () => unknown]> = [
    ['loading indicator', () => html`<petal-loading-indicator></petal-loading-indicator>`],
    ['wavy linear progress', () => html`<petal-linear-progress wavy indeterminate style="width: 200px"></petal-linear-progress>`],
    ['wavy circular progress', () => html`<petal-circular-progress wavy indeterminate></petal-circular-progress>`],
  ];

  for (const [name, template] of cases) {
    it(`stops drawing a ${name} out of view and starts again in view`, async () => {
      render(html`<div style="margin-top: 200vh">${template()}</div>`, root);
      const element = root.firstElementChild!.firstElementChild!;
      await frames(10);
      const hidden = drawing(element);
      await frames(10);
      expect(drawing(element)).withContext('out of view').toBe(hidden);

      element.scrollIntoView();
      await frames(10);
      const shown = drawing(element);
      await frames(10);
      expect(drawing(element)).withContext('in view').not.toBe(shown);
      window.scrollTo(0, 0);
    });
  }
});
