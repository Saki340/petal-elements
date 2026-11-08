/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import 'petal-elements/shapes/shape.js';

import {MaterialStoryInit} from './material-collection.js';
import {css, html} from 'lit';

/** Knob types for the stories of this demo. */
export interface StoryKnobs {
  shape: string;
  hoverShape: string;
  pressedShape: string;
}

const styles = css`
  petal-shape {
    width: 160px;
    height: 160px;
    --md-shape-color: var(--md-sys-color-primary);
  }
`;

const story0: MaterialStoryInit<StoryKnobs> = {
  name: 'Hover and press it',
  styles,
  render({shape, hoverShape, pressedShape}) {
    return html`
      <petal-shape
        shape=${shape}
        hover-shape=${hoverShape}
        pressed-shape=${pressedShape}></petal-shape>
    `;
  },
};

export const stories = [story0];
