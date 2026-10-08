/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import 'petal-elements/icon/icon.js';
import 'petal-elements/labs/segmentedbutton/outlined-segmented-button.js';
import 'petal-elements/labs/segmentedbuttonset/outlined-segmented-button-set.js';

import {MaterialStoryInit} from './material-collection.js';
import {html} from 'lit';

/** Knob types for Segmented Button Set stories. */
export interface StoryKnobs {}

const standard: MaterialStoryInit<StoryKnobs> = {
  name: '<petal-outlined-segmented-button-set> labels and icons',
  render() {
    return html` <div style="width:325px">
      <petal-outlined-segmented-button-set>
        <petal-outlined-segmented-button label="Enabled">
          <petal-icon slot="icon">grade</petal-icon>
        </petal-outlined-segmented-button>

        <petal-outlined-segmented-button selected label="Selected">
          <petal-icon slot="icon">favorite</petal-icon>
        </petal-outlined-segmented-button>

        <petal-outlined-segmented-button label="Enabled">
          <petal-icon slot="icon">change_history</petal-icon>
        </petal-outlined-segmented-button>
      </petal-outlined-segmented-button-set>
    </div>`;
  },
};

const withoutIcons: MaterialStoryInit<StoryKnobs> = {
  name: '<petal-outlined-segmented-button-set> without icons',
  render() {
    return html` <div style="width:325px">
      <petal-outlined-segmented-button-set>
        <petal-outlined-segmented-button selected label="Selected">
        </petal-outlined-segmented-button>

        <petal-outlined-segmented-button label="Enabled">
        </petal-outlined-segmented-button>

        <petal-outlined-segmented-button label="Enabled">
        </petal-outlined-segmented-button>
      </petal-outlined-segmented-button-set>
    </div>`;
  },
};

const multiselect: MaterialStoryInit<StoryKnobs> = {
  name: '<petal-outlined-segmented-button-set> Multiselect',
  render() {
    return html` <div style="width:325px">
      <petal-outlined-segmented-button-set multiselect>
        <petal-outlined-segmented-button selected label="$">
        </petal-outlined-segmented-button>

        <petal-outlined-segmented-button selected label="$$">
        </petal-outlined-segmented-button>

        <petal-outlined-segmented-button label="$$$">
        </petal-outlined-segmented-button>

        <petal-outlined-segmented-button label="$$$">
        </petal-outlined-segmented-button>
      </petal-outlined-segmented-button-set>
    </div>`;
  },
};

const transportationModes: MaterialStoryInit<StoryKnobs> = {
  name: 'Transportaton modes',
  render() {
    return html` <div style="width:202px">
      <petal-outlined-segmented-button-set>
        <petal-outlined-segmented-button>
          <petal-icon slot="icon">directions_walk</petal-icon>
        </petal-outlined-segmented-button>

        <petal-outlined-segmented-button>
          <petal-icon slot="icon">directions_subway</petal-icon>
        </petal-outlined-segmented-button>

        <petal-outlined-segmented-button selected>
          <petal-icon slot="icon">directions_car</petal-icon>
        </petal-outlined-segmented-button>
      </petal-outlined-segmented-button-set>
    </div>`;
  },
};

const iconOnly: MaterialStoryInit<StoryKnobs> = {
  name: 'Icon only (no checkmark)',
  render() {
    return html` <div style="width:202px;">
      <petal-outlined-segmented-button-set>
        <petal-outlined-segmented-button noCheckmark selected>
          <petal-icon slot="icon">format_align_left</petal-icon>
        </petal-outlined-segmented-button>

        <petal-outlined-segmented-button noCheckmark>
          <petal-icon slot="icon">format_align_center</petal-icon>
        </petal-outlined-segmented-button>

        <petal-outlined-segmented-button noCheckmark>
          <petal-icon slot="icon">format_align_right</petal-icon>
        </petal-outlined-segmented-button>
      </petal-outlined-segmented-button-set>
    </div>`;
  },
};

const singleSelect: MaterialStoryInit<StoryKnobs> = {
  name: 'Single select',
  render() {
    return html` <div style="width:400px">
      <petal-outlined-segmented-button-set>
        <petal-outlined-segmented-button label="Label">
          <petal-icon slot="icon">star</petal-icon>
        </petal-outlined-segmented-button>

        <petal-outlined-segmented-button disabled label="Label">
        </petal-outlined-segmented-button>

        <petal-outlined-segmented-button>
          <petal-icon slot="icon">directions_bus</petal-icon>
        </petal-outlined-segmented-button>

        <petal-outlined-segmented-button label="Label">
        </petal-outlined-segmented-button>
      </petal-outlined-segmented-button-set>
    </div>`;
  },
};

const multiSelect2: MaterialStoryInit<StoryKnobs> = {
  name: 'Multi select',
  render() {
    return html` <div style="width:400px">
      <petal-outlined-segmented-button-set multiselect>
        <petal-outlined-segmented-button label="Label">
        </petal-outlined-segmented-button>

        <petal-outlined-segmented-button disabled selected label="Label">
        </petal-outlined-segmented-button>

        <petal-outlined-segmented-button label="Label">
        </petal-outlined-segmented-button>

        <petal-outlined-segmented-button label="Label">
        </petal-outlined-segmented-button>
      </petal-outlined-segmented-button-set>
    </div>`;
  },
};

/** Segmented Button Set stories. */
export const stories = [
  standard,
  withoutIcons,
  multiselect,
  transportationModes,
  iconOnly,
  singleSelect,
  multiSelect2,
];
