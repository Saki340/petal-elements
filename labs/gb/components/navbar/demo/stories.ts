/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import '@material/web/labs/gb/components/navbar/md-gb-nav-bar.js';
import '@material/web/labs/gb/components/navbar/md-gb-nav-bar-item.js';
import '@material/web/labs/gb/styles/icon/md-gb-icon.js';

import {type MaterialStoryInit} from './material-collection.js';
import {type NavBarItemLayout} from '@material/web/labs/gb/components/navbar/nav-bar.js';
import {adoptStyles} from '@material/web/labs/gb/styles/adopt-styles.js';
import {css, html} from 'lit';

import {styles as m3Styles} from '@material/web/labs/gb/styles/m3.css' with {type: 'css'}; // github-only
// import {styles as m3Styles} from '@material/web/labs/gb/styles/m3.cssresult.js'; // google3-only

/** Knob types for navigation bar stories. */
export interface StoryKnobs {
  itemLayout?: NavBarItemLayout;
  showBadges: boolean;
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
    align-items: flex-end;
    background-color: var(--md-sys-color-surface);
    border: 1px solid var(--md-sys-color-outline-variant);
    border-radius: 16px;
    box-shadow: var(--md-sys-elevation-shadow-1);
    display: flex;
    justify-content: center;
    margin-bottom: 24px;
    min-height: 160px;
    overflow: hidden;
    padding: 0;
    width: 100%;
    max-width: 640px;
  }

  .demo-stack {
    display: flex;
    flex-direction: column;
    gap: 24px;
    width: 100%;
    max-width: 640px;
  }
`;

const playground: MaterialStoryInit<StoryKnobs> = {
  name: 'Playground',
  styles,
  render(knobs) {
    const itemLayout = knobs.itemLayout || 'vertical';
    const showBadges = Boolean(knobs.showBadges);

    return html`
      <div class="demo-container">
        <petal-gb-nav-bar
          item-layout=${itemLayout}
          aria-label="Primary navigation">
          <petal-gb-nav-bar-item active badge=${showBadges ? 'dot' : ''}>
            <petal-gb-icon slot="icon">home</petal-gb-icon>
            Home
          </petal-gb-nav-bar-item>
          <petal-gb-nav-bar-item badge=${showBadges ? '3' : ''}>
            <petal-gb-icon slot="icon">explore</petal-gb-icon>
            Explore
          </petal-gb-nav-bar-item>
          <petal-gb-nav-bar-item badge=${showBadges ? '99+' : ''}>
            <petal-gb-icon slot="icon">library_music</petal-gb-icon>
            Library
          </petal-gb-nav-bar-item>
          <petal-gb-nav-bar-item>
            <petal-gb-icon slot="icon">person</petal-gb-icon>
            Profile
          </petal-gb-nav-bar-item>
        </petal-gb-nav-bar>
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
          <petal-gb-nav-bar
            item-layout="vertical"
            aria-label="Vertical item navigation bar">
            <petal-gb-nav-bar-item active>
              <petal-gb-icon slot="icon">home</petal-gb-icon>
              Home
            </petal-gb-nav-bar-item>
            <petal-gb-nav-bar-item badge="4">
              <petal-gb-icon slot="icon">mail</petal-gb-icon>
              Inbox
            </petal-gb-nav-bar-item>
            <petal-gb-nav-bar-item badge="dot">
              <petal-gb-icon slot="icon">chat_bubble</petal-gb-icon>
              Chat
            </petal-gb-nav-bar-item>
            <petal-gb-nav-bar-item>
              <petal-gb-icon slot="icon">videocam</petal-gb-icon>
              Meet
            </petal-gb-nav-bar-item>
          </petal-gb-nav-bar>
        </div>

        <div class="demo-container">
          <petal-gb-nav-bar
            item-layout="horizontal"
            aria-label="Horizontal item navigation bar">
            <petal-gb-nav-bar-item active>
              <petal-gb-icon slot="icon">auto_awesome</petal-gb-icon>
              For You
            </petal-gb-nav-bar-item>
            <petal-gb-nav-bar-item>
              <petal-gb-icon slot="icon">bookmark</petal-gb-icon>
              Saved
            </petal-gb-nav-bar-item>
            <petal-gb-nav-bar-item>
              <petal-gb-icon slot="icon">settings</petal-gb-icon>
              Settings
            </petal-gb-nav-bar-item>
          </petal-gb-nav-bar>
        </div>
      </div>
    `;
  },
};

/** Navigation Bar stories. */
export const stories = [playground, allVariants];
