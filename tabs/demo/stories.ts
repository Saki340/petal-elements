/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import 'petal-elements/icon/icon.js';
import 'petal-elements/iconbutton/icon-button.js';
import 'petal-elements/tabs/primary-tab.js';
import 'petal-elements/tabs/secondary-tab.js';
import 'petal-elements/tabs/tabs.js';

import {MaterialStoryInit} from './material-collection.js';
import {PetalTabs} from 'petal-elements/tabs/tabs.js';
import {styles as typescaleStyles} from 'petal-elements/typography/md-typescale-styles.cssresult.js';
import {css, html, nothing} from 'lit';
import {ref} from 'lit/directives/ref.js';

/** Knob types for Tabs stories. */
export interface StoryKnobs {
  activeTabIndex: number;
  autoActivate: boolean;
  inlineIcon: boolean;
  content: string;
}

const styles = [
  typescaleStyles,
  css`
    [role='tabpanel']:not(.subtabs) {
      padding: 16px;
    }

    petal-tabs {
      --inline-size: 50vw;
      min-inline-size: var(--inline-size);
    }

    petal-tabs.scrolling {
      inline-size: var(--inline-size);
    }

    .controls {
      height: 48px;
    }
  `,
];

const primary: MaterialStoryInit<StoryKnobs> = {
  name: 'Primary Tabs',
  styles,
  render(knobs) {
    const tabContent = getTabContentGenerator(knobs);
    const inlineIcon = knobs.inlineIcon;

    return html`
      <petal-tabs
        aria-label="Primary tabs"
        active-tab-index=${knobs.activeTabIndex}
        .autoActivate=${knobs.autoActivate}
        ${setupTabPanels()}>
        <petal-primary-tab
          id="tab-one"
          aria-controls="panel-one"
          .inlineIcon=${inlineIcon}>
          ${tabContent('piano', 'Keyboard')}
        </petal-primary-tab>
        <petal-primary-tab
          id="tab-two"
          aria-controls="panel-two"
          .inlineIcon=${inlineIcon}>
          ${tabContent('tune', 'Guitar')}
        </petal-primary-tab>
        <petal-primary-tab
          id="tab-three"
          aria-controls="panel-three"
          .inlineIcon=${inlineIcon}>
          ${tabContent('graphic_eq', 'Drums')}
        </petal-primary-tab>
        <petal-primary-tab
          id="tab-four"
          aria-controls="panel-four"
          .inlineIcon=${inlineIcon}>
          ${tabContent('speaker', 'Bass')}
        </petal-primary-tab>
        <petal-primary-tab
          id="tab-five"
          aria-controls="panel-five"
          .inlineIcon=${inlineIcon}>
          ${tabContent('nightlife', 'Saxophone')}
        </petal-primary-tab>
      </petal-tabs>

      <div
        role="tabpanel"
        class="md-typescale-body-medium"
        id="panel-one"
        aria-labelledby="tab-one">
        Keyboard
      </div>
      <div
        role="tabpanel"
        class="md-typescale-body-medium"
        id="panel-two"
        aria-labelledby="tab-two"
        hidden>
        Guitar
      </div>
      <div
        role="tabpanel"
        class="md-typescale-body-medium"
        id="panel-three"
        aria-labelledby="tab-three"
        hidden>
        Drums
      </div>
      <div
        role="tabpanel"
        class="md-typescale-body-medium"
        id="panel-four"
        aria-labelledby="tab-four"
        hidden>
        Bass
      </div>
      <div
        role="tabpanel"
        class="md-typescale-body-medium"
        id="panel-five"
        aria-labelledby="tab-five"
        hidden>
        Saxophone
      </div>
    `;
  },
};

const secondary: MaterialStoryInit<StoryKnobs> = {
  name: 'Secondary Tabs',
  styles,
  render(knobs) {
    const tabContent = getTabContentGenerator(knobs);

    return html`
      <petal-tabs
        aria-label="Secondary tabs"
        active-tab-index=${knobs.activeTabIndex}
        .autoActivate=${knobs.autoActivate}
        ${setupTabPanels()}>
        <petal-secondary-tab id="tab-one" aria-controls="panel-one">
          ${tabContent('flight', 'Travel')}
        </petal-secondary-tab>
        <petal-secondary-tab id="tab-two" aria-controls="panel-two">
          ${tabContent('hotel', 'Hotel')}
        </petal-secondary-tab>
        <petal-secondary-tab id="tab-three" aria-controls="panel-three">
          ${tabContent('hiking', 'Activities')}
        </petal-secondary-tab>
        <petal-secondary-tab id="tab-four" aria-controls="panel-four">
          ${tabContent('restaurant', 'Food')}
        </petal-secondary-tab>
      </petal-tabs>

      <div
        role="tabpanel"
        class="md-typescale-body-medium"
        id="panel-one"
        aria-labelledby="tab-one">
        Travel
      </div>
      <div
        role="tabpanel"
        class="md-typescale-body-medium"
        id="panel-two"
        aria-labelledby="tab-two"
        hidden>
        Hotel
      </div>
      <div
        role="tabpanel"
        class="md-typescale-body-medium"
        id="panel-three"
        aria-labelledby="tab-three"
        hidden>
        Activities
      </div>
      <div
        role="tabpanel"
        class="md-typescale-body-medium"
        id="panel-four"
        aria-labelledby="tab-four"
        hidden>
        Food
      </div>
    `;
  },
};

const scrolling: MaterialStoryInit<StoryKnobs> = {
  name: 'Scrolling Tabs',
  styles,
  render(knobs) {
    const tabContent = getTabContentGenerator(knobs);
    const inlineIcon = knobs.inlineIcon;

    return html` <petal-tabs
      aria-label="A tab bar that scrolls"
      class="scrolling"
      active-tab-index=${knobs.activeTabIndex}
      .autoActivate=${knobs.autoActivate}>
      ${new Array(10).fill(html`
        <petal-primary-tab .inlineIcon=${inlineIcon}>
          ${tabContent('piano', 'Keyboard')}
        </petal-primary-tab>
        <petal-primary-tab .inlineIcon=${inlineIcon}>
          ${tabContent('tune', 'Guitar')}
        </petal-primary-tab>
        <petal-primary-tab .inlineIcon=${inlineIcon}>
          ${tabContent('graphic_eq', 'Drums')}
        </petal-primary-tab>
        <petal-primary-tab .inlineIcon=${inlineIcon}>
          ${tabContent('speaker', 'Bass')}
        </petal-primary-tab>
        <petal-primary-tab .inlineIcon=${inlineIcon}>
          ${tabContent('nightlife', 'Saxophone')}
        </petal-primary-tab>
      `)}
    </petal-tabs>`;
  },
};

const custom: MaterialStoryInit<StoryKnobs> = {
  name: 'Custom Tabs',
  styles: [
    ...styles,
    css`
      .custom {
        /* colors */
        --md-sys-color-primary: var(--md-sys-color-tertiary);
        /* text */
        --md-primary-tab-label-text-font: cursive, system-ui;
        --md-primary-tab-label-text-size: 0.8em;
        /* indicator */
        --md-primary-tab-active-indicator-height: 8px;
        --md-primary-tab-active-indicator-shape: 9999px 0;
      }

      .custom::part(divider) {
        --md-divider-color: var(--md-sys-color-tertiary);
        --md-divider-thickness: 4px;
      }
    `,
  ],
  render(knobs) {
    const tabContent = getTabContentGenerator(knobs);

    return html`
      <petal-tabs
        aria-label="A custom themed tab bar"
        class="custom"
        active-tab-index=${knobs.activeTabIndex}
        .autoActivate=${knobs.autoActivate}
        ${setupTabPanels()}>
        <petal-primary-tab id="tab-one" aria-controls="panel-one">
          ${tabContent('flight', 'Travel')}
        </petal-primary-tab>
        <petal-primary-tab id="tab-two" aria-controls="panel-two">
          ${tabContent('hotel', 'Hotel')}
        </petal-primary-tab>
        <petal-primary-tab id="tab-three" aria-controls="panel-three">
          ${tabContent('hiking', 'Activities')}
        </petal-primary-tab>
        <petal-primary-tab id="tab-four" aria-controls="panel-four">
          ${tabContent('restaurant', 'Food')}
        </petal-primary-tab>
      </petal-tabs>

      <div
        role="tabpanel"
        class="md-typescale-body-medium"
        id="panel-one"
        aria-labelledby="tab-one">
        Travel
      </div>
      <div
        role="tabpanel"
        class="md-typescale-body-medium"
        id="panel-two"
        aria-labelledby="tab-two"
        hidden>
        Hotel
      </div>
      <div
        role="tabpanel"
        class="md-typescale-body-medium"
        id="panel-three"
        aria-labelledby="tab-three"
        hidden>
        Activities
      </div>
      <div
        role="tabpanel"
        class="md-typescale-body-medium"
        id="panel-four"
        aria-labelledby="tab-four"
        hidden>
        Food
      </div>
    `;
  },
};

const primaryAndSecondary: MaterialStoryInit<StoryKnobs> = {
  name: 'Primary and Secondary Tabs',
  styles,
  render(knobs) {
    const tabContent = getTabContentGenerator(knobs);
    const inlineIcon = knobs.inlineIcon;

    return html`
      <petal-tabs
        aria-label="Primary tabs"
        active-tab-index=${knobs.activeTabIndex}
        .autoActivate=${knobs.autoActivate}
        ${setupTabPanels()}>
        <petal-primary-tab .inlineIcon=${inlineIcon} aria-controls="movies">
          ${tabContent('videocam', 'Movies')}
        </petal-primary-tab>
        <petal-primary-tab .inlineIcon=${inlineIcon} aria-controls="photos">
          ${tabContent('photo', 'Photos')}
        </petal-primary-tab>
        <petal-primary-tab .inlineIcon=${inlineIcon} aria-controls="music">
          ${tabContent('audiotrack', 'Music')}
        </petal-primary-tab>
      </petal-tabs>

      <div
        role="tabpanel"
        class="md-typescale-body-medium"
        id="movies"
        class="subtabs"
        aria-label="Movies">
        <petal-tabs
          aria-label="Secondary tabs for movies"
          active-tab-index=${knobs.activeTabIndex}
          .autoActivate=${knobs.autoActivate}
          ${setupTabPanels()}>
          <petal-secondary-tab aria-controls="star-wars">
            Star Wars
          </petal-secondary-tab>
          <petal-secondary-tab aria-controls="avengers">
            Avengers
          </petal-secondary-tab>
          <petal-secondary-tab aria-controls="jaws">Jaws </petal-secondary-tab>
          <petal-secondary-tab aria-controls="forzen">Frozen </petal-secondary-tab>
        </petal-tabs>

        <div
          role="tabpanel"
          class="md-typescale-body-medium"
          id="star-wars"
          aria-label="Star Wars">
          Star Wars
        </div>
        <div
          role="tabpanel"
          class="md-typescale-body-medium"
          id="avengers"
          aria-label="Avengers"
          hidden>
          Avengers
        </div>
        <div
          role="tabpanel"
          class="md-typescale-body-medium"
          id="jaws"
          aria-label="Jaws"
          hidden>
          Jaws
        </div>
        <div
          role="tabpanel"
          class="md-typescale-body-medium"
          id="frozen"
          aria-label="Frozen"
          hidden>
          Frozen
        </div>
      </div>

      <div
        role="tabpanel"
        class="md-typescale-body-medium"
        id="photos"
        class="subtabs"
        aria-label="Photos"
        hidden>
        <petal-tabs
          aria-label="Secondary tabs for photos"
          active-tab-index=${knobs.activeTabIndex}
          .autoActivate=${knobs.autoActivate}>
          <petal-secondary-tab aria-controls="yosemite">
            Yosemite
          </petal-secondary-tab>
          <petal-secondary-tab aria-controls="mona-lisa">
            Mona Lisa
          </petal-secondary-tab>
          <petal-secondary-tab aria-controls="swiss-alps">
            Swiss Alps
          </petal-secondary-tab>
          <petal-secondary-tab aria-controls="niagra-falls">
            Niagra Falls
          </petal-secondary-tab>
        </petal-tabs>

        <div
          role="tabpanel"
          class="md-typescale-body-medium"
          id="yosemite"
          aria-label="Yosemite">
          Yosemite
        </div>
        <div
          role="tabpanel"
          class="md-typescale-body-medium"
          id="mona-lisa"
          aria-label="Mona Lisa"
          hidden>
          Mona Lisa
        </div>
        <div
          role="tabpanel"
          class="md-typescale-body-medium"
          id="swiss-alps"
          aria-label="Swiss Alps"
          hidden>
          Swiss Alps
        </div>
        <div
          role="tabpanel"
          class="md-typescale-body-medium"
          id="niagra-falls"
          aria-label="Niagra Falls"
          hidden>
          Niagra Falls
        </div>
      </div>

      <div
        role="tabpanel"
        class="md-typescale-body-medium"
        id="music"
        class="subtabs"
        aria-label="Music"
        hidden>
        <petal-tabs
          aria-label="Secondary tabs for music"
          active-tab-index=${knobs.activeTabIndex}
          .autoActivate=${knobs.autoActivate}
          ${setupTabPanels()}>
          <petal-secondary-tab aria-controls="rock">Rock </petal-secondary-tab>
          <petal-secondary-tab aria-controls="ambient">Ambient </petal-secondary-tab>
          <petal-secondary-tab aria-controls="sounds">
            Soundscapes
          </petal-secondary-tab>
          <petal-secondary-tab aria-controls="noise">
            White Noise
          </petal-secondary-tab>
        </petal-tabs>

        <div
          role="tabpanel"
          class="md-typescale-body-medium"
          id="rock"
          aria-label="Rock">
          Rock
        </div>
        <div
          role="tabpanel"
          class="md-typescale-body-medium"
          id="ambient"
          aria-label="Ambient"
          hidden>
          Ambient
        </div>
        <div
          role="tabpanel"
          class="md-typescale-body-medium"
          id="sounds"
          aria-label="Soundscapes"
          hidden>
          Soundscapes
        </div>
        <div
          role="tabpanel"
          class="md-typescale-body-medium"
          id="noise"
          aria-label="White noise"
          hidden>
          White Noise
        </div>
      </div>
    `;
  },
};

const dynamic: MaterialStoryInit<StoryKnobs> = {
  name: 'Dynamic Tabs',
  styles,
  render(knobs) {
    const inlineIcon = knobs.inlineIcon;

    function getTabs(event: Event) {
      return (
        (event.target! as Element).getRootNode() as ShadowRoot
      ).querySelector('petal-tabs')!;
    }

    function addTab(event: Event) {
      const tabs = getTabs(event);
      const count = tabs.childElementCount;
      const tab = document.createElement('petal-primary-tab');
      tab.textContent = `Tab ${count + 1}`;
      tabs.append(tab);
    }
    function removeTab(event: Event) {
      const tabs = getTabs(event);
      tabs.tabs[tabs.tabs.length - 1]?.remove();
    }

    function moveTabTowardsEnd(event: Event) {
      const tabs = getTabs(event);
      if (!tabs.activeTab) {
        return;
      }
      const next = tabs.activeTab.nextElementSibling;
      if (next) {
        next.after(tabs.activeTab);
      }
    }

    function moveTabTowardsStart(event: Event) {
      const tabs = getTabs(event);
      if (!tabs.activeTab) {
        return;
      }
      const previous = tabs.activeTab.previousElementSibling;
      if (previous) {
        previous.before(tabs.activeTab);
      }
    }

    return html` <div class="controls">
        <petal-icon-button @click=${addTab}>
          <petal-icon>add</petal-icon>
        </petal-icon-button>
        <petal-icon-button @click=${removeTab}>
          <petal-icon>remove</petal-icon>
        </petal-icon-button>
        <petal-icon-button @click=${moveTabTowardsStart}>
          <petal-icon>chevron_left</petal-icon>
        </petal-icon-button>
        <petal-icon-button @click=${moveTabTowardsEnd}>
          <petal-icon>chevron_right</petal-icon>
        </petal-icon-button>
      </div>
      <petal-tabs
        class="scrolling"
        active-tab-index=${knobs.activeTabIndex}
        .autoActivate=${knobs.autoActivate}>
        <petal-primary-tab .inlineIcon=${inlineIcon}> Tab 1 </petal-primary-tab>
        <petal-primary-tab .inlineIcon=${inlineIcon}> Tab 2 </petal-primary-tab>
        <petal-primary-tab .inlineIcon=${inlineIcon}> Tab 3 </petal-primary-tab>
      </petal-tabs>`;
  },
};

function getTabContentGenerator(knobs: StoryKnobs) {
  const contentKnob = knobs.content;
  const useIcon = contentKnob !== 'label';
  const useLabel = contentKnob !== 'icon';
  return (icon: string, label: string) => {
    const iconTemplate = html`<petal-icon slot="icon">${icon}</petal-icon>`;
    return html`
      ${useIcon ? iconTemplate : nothing} ${useLabel ? html`${label}` : nothing}
    `;
  };
}

function setupTabPanels() {
  return ref((instance) => {
    if (!instance) {
      return;
    }

    const tabs = instance as PetalTabs;
    let currentPanel: HTMLElement | null = null;
    tabs.addEventListener('change', () => {
      if (currentPanel) {
        currentPanel.hidden = true;
      }

      const panelId = tabs.activeTab?.getAttribute('aria-controls');
      const root = tabs.getRootNode() as Document | ShadowRoot;
      currentPanel = root.querySelector<HTMLElement>(`#${panelId}`);
      if (currentPanel) {
        currentPanel.hidden = false;
      }
    });
  });
}

/** Tabs stories. */
export const stories = [
  primary,
  secondary,
  scrolling,
  custom,
  primaryAndSecondary,
  dynamic,
];
