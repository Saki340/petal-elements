/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import 'petal-elements/appbar/top-app-bar.js';
import 'petal-elements/icon/icon.js';
import 'petal-elements/iconbutton/icon-button.js';

import {MaterialStoryInit} from './material-collection.js';
import {html} from 'lit';

/** Knob types for the stories of this demo. */
export interface StoryKnobs {
  headline: string;
  subtitle: string;
}

const story0: MaterialStoryInit<StoryKnobs> = {
  name: 'Small',
  render({headline, subtitle}) {
    return html`
      <petal-top-app-bar size="small" headline=${headline} subtitle=${subtitle}>
        <petal-icon-button slot="navigation" aria-label="Menu">
          <petal-icon>menu</petal-icon>
        </petal-icon-button>
        <petal-icon-button slot="actions" aria-label="Search">
          <petal-icon>search</petal-icon>
        </petal-icon-button>
      </petal-top-app-bar>
    `;
  },
};

const story1: MaterialStoryInit<StoryKnobs> = {
  name: 'Medium',
  render({headline, subtitle}) {
    return html`
      <petal-top-app-bar size="medium" headline=${headline} subtitle=${subtitle}>
        <petal-icon-button slot="navigation" aria-label="Menu">
          <petal-icon>menu</petal-icon>
        </petal-icon-button>
        <petal-icon-button slot="actions" aria-label="Search">
          <petal-icon>search</petal-icon>
        </petal-icon-button>
      </petal-top-app-bar>
    `;
  },
};

const story2: MaterialStoryInit<StoryKnobs> = {
  name: 'Large',
  render({headline, subtitle}) {
    return html`
      <petal-top-app-bar size="large" headline=${headline} subtitle=${subtitle}>
        <petal-icon-button slot="navigation" aria-label="Menu">
          <petal-icon>menu</petal-icon>
        </petal-icon-button>
        <petal-icon-button slot="actions" aria-label="Search">
          <petal-icon>search</petal-icon>
        </petal-icon-button>
      </petal-top-app-bar>
    `;
  },
};

export const stories = [story0, story1, story2];
