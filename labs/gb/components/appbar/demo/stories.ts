/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import 'petal-elements/labs/gb/components/appbar/md-gb-app-bar.js';
import 'petal-elements/labs/gb/components/iconbutton/md-gb-icon-button.js';
import 'petal-elements/labs/gb/styles/icon/md-gb-icon.js';

import {MaterialStoryInit} from './material-collection.js';
import {
  type AppBarSize,
  type AppBarVariant,
} from 'petal-elements/labs/gb/components/appbar/app-bar.js';
import {adoptStyles} from 'petal-elements/labs/gb/styles/adopt-styles.js';
import {styles as m3Styles} from 'petal-elements/labs/gb/styles/m3.cssresult.js';
import {css, html, nothing} from 'lit';

/** Knob types for app bar stories. */
export interface StoryKnobs {
  size?: AppBarSize;
  variant?: AppBarVariant;
  scrolled: boolean;
}

adoptStyles(document, [
  m3Styles,
  css`
    :root {
      --md-icon-font: 'Material Symbols Outlined';
    }
  `,
]);

const styles = css`
  .demo-container {
    border: 1px solid var(--md-sys-color-outline-variant);
    border-radius: 16px;
    overflow: hidden;
    margin-bottom: 24px;
    background-color: var(--md-sys-color-surface);
    box-shadow: var(--md-sys-elevation-shadow-1);
  }
`;

const playground: MaterialStoryInit<StoryKnobs> = {
  name: 'Playground',
  styles,
  render(knobs) {
    const size = knobs.size || 'sm';
    const variant = knobs.variant || 'standard';
    const scrolled = Boolean(knobs.scrolled);

    if (variant === 'search') {
      return html`
        <div class="demo-container">
          <petal-gb-app-bar variant="search" ?scrolled=${scrolled}>
            <petal-gb-icon-button slot="leading" color="standard">
              <petal-gb-icon>menu</petal-gb-icon>
            </petal-gb-icon-button>
            <input
              slot="search"
              type="text"
              placeholder="Search Expressive App Bar..."
              style="width: 100%; border: none; background: transparent; font: inherit; color: var(--md-sys-color-on-surface); outline: none; padding: 8px;" />
            <petal-gb-icon-button slot="trailing" color="standard">
              <petal-gb-icon>account_circle</petal-gb-icon>
            </petal-gb-icon-button>
          </petal-gb-app-bar>
        </div>
      `;
    }

    const showSubtitle = size === 'md' || size === 'lg';

    return html`
      <div class="demo-container">
        <petal-gb-app-bar size=${size} ?scrolled=${scrolled}>
          <petal-gb-icon-button slot="leading" color="standard">
            <petal-gb-icon>menu</petal-gb-icon>
          </petal-gb-icon-button>
          Expressive App Bar (${size})
          ${showSubtitle
            ? html`<span slot="subtitle"
                >Two-tier expressive hierarchy (${size})</span
              >`
            : nothing}
          <petal-gb-icon-button slot="trailing" color="standard">
            <petal-gb-icon>search</petal-gb-icon>
          </petal-gb-icon-button>
          <petal-gb-icon-button slot="trailing" color="standard">
            <petal-gb-icon>more_vert</petal-gb-icon>
          </petal-gb-icon-button>
        </petal-gb-app-bar>
      </div>
    `;
  },
};

const allSizes: MaterialStoryInit<StoryKnobs> = {
  name: 'Expressive Sizes & Variants',
  styles,
  render() {
    return html`
      <div style="display: flex; flex-direction: column; gap: 24px;">
        <div class="demo-container">
          <petal-gb-app-bar size="sm">
            <petal-gb-icon-button slot="leading" color="standard">
              <petal-gb-icon>menu</petal-gb-icon>
            </petal-gb-icon-button>
            Small App Bar (sm)
            <petal-gb-icon-button slot="trailing" color="standard">
              <petal-gb-icon>search</petal-gb-icon>
            </petal-gb-icon-button>
            <petal-gb-icon-button slot="trailing" color="standard">
              <petal-gb-icon>account_circle</petal-gb-icon>
            </petal-gb-icon-button>
          </petal-gb-app-bar>
        </div>

        <div class="demo-container">
          <petal-gb-app-bar size="md">
            <petal-gb-icon-button slot="leading" color="standard">
              <petal-gb-icon>arrow_back</petal-gb-icon>
            </petal-gb-icon-button>
            Medium App Bar (md)
            <petal-gb-icon-button slot="trailing" color="standard">
              <petal-gb-icon>more_vert</petal-gb-icon>
            </petal-gb-icon-button>
          </petal-gb-app-bar>
        </div>

        <div class="demo-container">
          <petal-gb-app-bar size="md">
            <petal-gb-icon-button slot="leading" color="standard">
              <petal-gb-icon>menu</petal-gb-icon>
            </petal-gb-icon-button>
            Medium App Bar with Subtitle
            <span slot="subtitle">Two-tier expressive hierarchy</span>
            <petal-gb-icon-button slot="trailing" color="standard">
              <petal-gb-icon>edit</petal-gb-icon>
            </petal-gb-icon-button>
          </petal-gb-app-bar>
        </div>

        <div class="demo-container">
          <petal-gb-app-bar size="lg">
            <petal-gb-icon-button slot="leading" color="standard">
              <petal-gb-icon>menu</petal-gb-icon>
            </petal-gb-icon-button>
            Large App Bar (lg)
            <petal-gb-icon-button slot="trailing" color="standard">
              <petal-gb-icon>settings</petal-gb-icon>
            </petal-gb-icon-button>
          </petal-gb-app-bar>
        </div>

        <div class="demo-container">
          <petal-gb-app-bar size="lg">
            <petal-gb-icon-button slot="leading" color="standard">
              <petal-gb-icon>menu</petal-gb-icon>
            </petal-gb-icon-button>
            Large App Bar with Subtitle
            <span slot="subtitle">Dynamic headline layout</span>
            <petal-gb-icon-button slot="trailing" color="standard">
              <petal-gb-icon>account_circle</petal-gb-icon>
            </petal-gb-icon-button>
          </petal-gb-app-bar>
        </div>

        <div class="demo-container">
          <petal-gb-app-bar variant="search">
            <petal-gb-icon-button slot="leading" color="standard">
              <petal-gb-icon>search</petal-gb-icon>
            </petal-gb-icon-button>
            <input
              slot="search"
              type="text"
              placeholder="Search variant..."
              style="width:100%; border:none; background:transparent; font:inherit; color: var(--md-sys-color-on-surface); outline:none;" />
            <petal-gb-icon-button slot="trailing" color="standard">
              <petal-gb-icon>close</petal-gb-icon>
            </petal-gb-icon-button>
          </petal-gb-app-bar>
        </div>

        <div class="demo-container">
          <petal-gb-app-bar size="md" scrolled>
            <petal-gb-icon-button slot="leading" color="standard">
              <petal-gb-icon>menu</petal-gb-icon>
            </petal-gb-icon-button>
            Scrolled App Bar (Declarative property)
            <span slot="subtitle">Demonstrating elevated scrolled style</span>
            <petal-gb-icon-button slot="trailing" color="standard">
              <petal-gb-icon>filter_list</petal-gb-icon>
            </petal-gb-icon-button>
          </petal-gb-app-bar>
        </div>
      </div>
    `;
  },
};

/** App Bar stories. */
export const stories = [playground, allSizes];
