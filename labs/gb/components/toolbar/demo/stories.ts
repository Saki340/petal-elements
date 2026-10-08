/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import '@material/web/labs/gb/components/button/md-gb-button.js';
import '@material/web/labs/gb/components/iconbutton/md-gb-icon-button.js';
import '@material/web/labs/gb/components/toolbar/md-gb-toolbar.js';
import '@material/web/labs/gb/styles/icon/md-gb-icon.js';

import {MaterialStoryInit} from './material-collection.js';
import {
  type ToolbarColor,
  type ToolbarOrientation,
} from '@material/web/labs/gb/components/toolbar/toolbar.js';
import {adoptStyles} from '@material/web/labs/gb/styles/adopt-styles.js';
import {css, html} from 'lit';

import {styles as m3Styles} from '@material/web/labs/gb/styles/m3.css' with {type: 'css'}; // github-only
// import {styles as m3Styles} from '@material/web/labs/gb/styles/m3.cssresult.js'; // google3-only

/** Knob types for toolbar stories. */
export interface StoryKnobs {
  color?: ToolbarColor;
  orientation?: ToolbarOrientation;
  docked: boolean;
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
    align-items: center;
    background-color: var(--md-sys-color-surface);
    border: 1px solid var(--md-sys-color-outline-variant);
    border-radius: 16px;
    box-shadow: var(--md-sys-elevation-shadow-1);
    display: flex;
    justify-content: center;
    margin-bottom: 24px;
    min-height: 140px;
    overflow: hidden;
    padding: 24px;
  }

  .demo-stack {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
`;

const playground: MaterialStoryInit<StoryKnobs> = {
  name: 'Playground',
  styles,
  render(knobs) {
    const color = knobs.color || 'standard';
    const orientation = knobs.orientation || 'horizontal';
    const docked = Boolean(knobs.docked);

    return html`
      <div class="demo-container">
        <petal-gb-toolbar
          color=${color}
          orientation=${orientation}
          ?docked=${docked}
          aria-label="Formatting toolbar">
          <petal-gb-button square type="toggle" selected>
            <petal-gb-icon>edit</petal-gb-icon>
            Edit
          </petal-gb-button>
          <petal-gb-button square type="toggle">
            <petal-gb-icon>palette</petal-gb-icon>
            Style
          </petal-gb-button>
          <petal-gb-icon-button square aria-label="Favorite" type="toggle">
            <petal-gb-icon>favorite</petal-gb-icon>
          </petal-gb-icon-button>
          <petal-gb-icon-button square aria-label="Settings" type="toggle">
            <petal-gb-icon>settings</petal-gb-icon>
          </petal-gb-icon-button>
        </petal-gb-toolbar>
      </div>
    `;
  },
};

const allVariants: MaterialStoryInit<StoryKnobs> = {
  name: 'Expressive Variants',
  styles,
  render() {
    return html`
      <div class="demo-stack">
        <div class="demo-container">
          <petal-gb-toolbar color="standard" aria-label="Standard floating">
            <petal-gb-button square type="toggle" selected>
              <petal-gb-icon>star</petal-gb-icon>
              Starred
            </petal-gb-button>
            <petal-gb-button square type="toggle">
              <petal-gb-icon>visibility</petal-gb-icon>
              Preview
            </petal-gb-button>
            <petal-gb-icon-button square aria-label="Favorite" type="toggle">
              <petal-gb-icon>favorite</petal-gb-icon>
            </petal-gb-icon-button>
          </petal-gb-toolbar>
        </div>

        <div class="demo-container">
          <petal-gb-toolbar color="vibrant" aria-label="Vibrant floating">
            <petal-gb-button square type="toggle" selected>
              <petal-gb-icon>auto_awesome</petal-gb-icon>
              Generate
            </petal-gb-button>
            <petal-gb-button square type="toggle">
              <petal-gb-icon>palette</petal-gb-icon>
              Theme
            </petal-gb-button>
            <petal-gb-icon-button
              square
              aria-label="Bookmark"
              type="toggle"
              selected>
              <petal-gb-icon>bookmark</petal-gb-icon>
            </petal-gb-icon-button>
          </petal-gb-toolbar>
        </div>

        <div class="demo-container">
          <petal-gb-toolbar color="standard" docked aria-label="Standard docked">
            <petal-gb-icon-button square aria-label="Home" type="toggle">
              <petal-gb-icon>home</petal-gb-icon>
            </petal-gb-icon-button>
            <petal-gb-button square type="toggle" selected>
              <petal-gb-icon>folder</petal-gb-icon>
              Files
            </petal-gb-button>
            <petal-gb-icon-button square aria-label="Image" type="toggle">
              <petal-gb-icon>image</petal-gb-icon>
            </petal-gb-icon-button>
          </petal-gb-toolbar>
        </div>
      </div>
    `;
  },
};

/** Toolbar stories. */
export const stories = [playground, allVariants];
