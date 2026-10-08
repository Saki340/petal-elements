/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import 'petal-elements/icon/icon.js';
import 'petal-elements/labs/navigationbar/navigation-bar.js';
import 'petal-elements/labs/navigationtab/navigation-tab.js';

import {MaterialStoryInit} from './material-collection.js';
import {css, html} from 'lit';

/** Knob types for nav bar stories. */
export interface StoryKnobs {
  hideInactiveLabels: boolean;
  label: string;
  showBadge: boolean;
  badgeValue: string;
  'active icon': string;
  'inactive icon': string;
}

const standard: MaterialStoryInit<StoryKnobs> = {
  name: '<petal-navigation-bar>',
  styles: css`
    :host {
      /* Material Symbols does not include filled star. */
      --md-icon-font: 'Material Icons';
    }
  `,
  render(knobs) {
    const {hideInactiveLabels, label, showBadge, badgeValue} = knobs;
    return html` <div style="width:400px">
      <petal-navigation-bar
        activeIndex="1"
        .hideInactiveLabels=${hideInactiveLabels}>
        <petal-navigation-tab
          .label=${label}
          .showBadge=${showBadge}
          .badgeValue=${badgeValue}>
          <petal-icon slot="active-icon">${knobs['active icon']}</petal-icon>
          <petal-icon slot="inactive-icon">${knobs['inactive icon']}</petal-icon>
        </petal-navigation-tab>

        <petal-navigation-tab
          .label=${label}
          .showBadge=${showBadge}
          .badgeValue=${badgeValue}>
          <petal-icon slot="active-icon">${knobs['active icon']}</petal-icon>
          <petal-icon slot="inactive-icon">${knobs['inactive icon']}</petal-icon>
        </petal-navigation-tab>

        <petal-navigation-tab
          .label=${label}
          .showBadge=${showBadge}
          .badgeValue=${badgeValue}>
          <petal-icon slot="active-icon">${knobs['active icon']}</petal-icon>
          <petal-icon slot="inactive-icon">${knobs['inactive icon']}</petal-icon>
        </petal-navigation-tab>

        <petal-navigation-tab
          .label=${label}
          .showBadge=${showBadge}
          .badgeValue=${badgeValue}>
          <petal-icon slot="active-icon">${knobs['active icon']}</petal-icon>
          <petal-icon slot="inactive-icon">${knobs['inactive icon']}</petal-icon>
        </petal-navigation-tab>
      </petal-navigation-bar>
    </div>`;
  },
};

/** Nav Bar stories. */
export const stories = [standard];
