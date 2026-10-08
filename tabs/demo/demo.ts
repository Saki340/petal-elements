/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import './material-collection.js';
import './index.js';

import {
  KnobTypesToKnobs,
  MaterialCollection,
  materialInitsToStoryInits,
  setUpDemo,
} from './material-collection.js';
import {PetalTabs} from 'petal-elements/tabs/tabs.js';
import {
  boolInput,
  Knob,
  numberInput,
  radioSelector,
} from './index.js';

import {stories, StoryKnobs} from './stories.js';

const collection = new MaterialCollection<KnobTypesToKnobs<StoryKnobs>>(
  'Tabs',
  [
    new Knob('activeTabIndex', {
      ui: numberInput(),
      defaultValue: 0,
      // fire a change event manually to sync tabbed content
      wiring: async (knob, value, container) => {
        await new Promise(requestAnimationFrame);
        const tabs = Array.from(container.querySelectorAll<PetalTabs>('petal-tabs'));
        for (const tab of tabs) {
          const event = new Event('change', {bubbles: true, composed: true});
          tab.dispatchEvent(event);
        }
      },
    }),
    new Knob('autoActivate', {ui: boolInput(), defaultValue: false}),
    new Knob('inlineIcon', {ui: boolInput(), defaultValue: false}),
    new Knob('content', {
      defaultValue: 'icon/label',
      ui: radioSelector({
        name: 'contentRadioGroup',
        options: [
          {label: 'icon/label', value: 'icon/label'},
          {label: 'icon', value: 'icon'},
          {label: 'label', value: 'label'},
        ],
      }),
    }),
  ],
);

collection.addStories(...materialInitsToStoryInits(stories));

setUpDemo(collection, {icons: 'material-symbols'});
