/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import 'petal-elements/carousel/carousel.js';

import {MaterialStoryInit} from './material-collection.js';
import {css, html} from 'lit';

/** Knob types for the stories of this demo. */
export interface StoryKnobs {
  uncontained: boolean;
}

const styles = css`
  petal-carousel { height: 220px; }
  .tile { height: 100%; }
  .a { background: var(--md-sys-color-primary); }
  .b { background: var(--md-sys-color-tertiary); }
  .c { background: var(--md-sys-color-secondary); }
`;

const story0: MaterialStoryInit<StoryKnobs> = {
  name: 'Carousel',
  styles,
  render({uncontained}) {
    return html`
      <petal-carousel
        item-width="186"
        item-spacing="8"
        variant=${uncontained ? 'uncontained' : 'multi-browse'}>
        <div class="tile a"></div>
        <div class="tile b"></div>
        <div class="tile c"></div>
        <div class="tile a"></div>
        <div class="tile b"></div>
        <div class="tile c"></div>
      </petal-carousel>
    `;
  },
};

export const stories = [story0];
