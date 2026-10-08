/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import 'petal-elements/labs/aria/menu/md-aria-fieldset.js';
import 'petal-elements/labs/aria/menu/md-aria-menubar.js';
import 'petal-elements/labs/aria/menu/md-aria-menuitem.js';
import 'petal-elements/labs/aria/menu/md-aria-menulist.js';

import {MaterialStoryInit} from './material-collection.js';
import {css, html} from 'lit';

export interface StoryKnobs {}

const menubar: MaterialStoryInit<StoryKnobs> = {
  name: 'Menubar',
  styles: css``,
  render(knobs) {
    return html`
      <petal-aria-menubar>
        <petal-aria-menuitem>Item 1</petal-aria-menuitem>
        <petal-aria-menuitem>Item 2</petal-aria-menuitem>
        <petal-aria-menuitem disabled>Item 3</petal-aria-menuitem>
        <petal-aria-menuitem>Item 4</petal-aria-menuitem>
      </petal-aria-menubar>
    `;
  },
};

const menu: MaterialStoryInit<StoryKnobs> = {
  name: 'Menu',
  styles: css``,
  render(knobs) {
    return html`
      <button popovertarget="the-menu">Menu</button>
      <petal-aria-menulist id="the-menu">
        <petal-aria-menuitem autofocus>Item 1</petal-aria-menuitem>
        <petal-aria-menuitem>Item 2</petal-aria-menuitem>
        <hr />
        <petal-aria-menuitem disabled>Item 3</petal-aria-menuitem>
        <petal-aria-menuitem>Item 4</petal-aria-menuitem>
      </petal-aria-menulist>
    `;
  },
};

const menuWithDialog: MaterialStoryInit<StoryKnobs> = {
  name: 'Menu with dialog',
  styles: css``,
  render(knobs) {
    return html`
      <button popovertarget="the-menu">Menu</button>
      <petal-aria-menulist id="the-menu">
        <petal-aria-menuitem
          commandfor="the-dialog"
          command="show-modal"
          autofocus>
          Open dialog...
        </petal-aria-menuitem>
      </petal-aria-menulist>
      <dialog id="the-dialog">
        <button popovertarget="the-dialog-menu" autofocus>Menu</button>
        <petal-aria-menulist id="the-dialog-menu">
          <petal-aria-menuitem commandfor="the-dialog" command="close" autofocus>
            Close
          </petal-aria-menuitem>
          <petal-aria-menuitem commandfor="the-dialog" command="request-close">
            Request close
          </petal-aria-menuitem>
        </petal-aria-menulist>
        <hr />
        This is a dialog.
      </dialog>
    `;
  },
};

const menuWithPopover: MaterialStoryInit<StoryKnobs> = {
  name: 'Menu with popover',
  styles: css``,
  render(knobs) {
    return html`
      <button popovertarget="the-menu">Menu</button>
      <petal-aria-menulist id="the-menu">
        <petal-aria-menuitem
          popovertarget="the-popover"
          popovertargetaction="show"
          autofocus>
          Open popover...
        </petal-aria-menuitem>
      </petal-aria-menulist>
      <div id="the-popover" popover="manual">
        <button popovertarget="the-popover-menu" autofocus>Menu</button>
        <petal-aria-menulist id="the-popover-menu">
          <petal-aria-menuitem
            popovertarget="the-popover"
            popovertargetaction="hide"
            autofocus>
            Hide
          </petal-aria-menuitem>
        </petal-aria-menulist>
        <hr />
        This is a popover.
      </div>
    `;
  },
};

const menuWithFieldset: MaterialStoryInit<StoryKnobs> = {
  name: 'Menu with fieldset, not checkable',
  styles: css``,
  render(knobs) {
    return html`
      <button popovertarget="the-menu">Menu</button>
      <petal-aria-menulist id="the-menu">
        <petal-aria-fieldset>
          <petal-aria-menuitem autofocus>Item 1</petal-aria-menuitem>
          <petal-aria-menuitem>Item 2</petal-aria-menuitem>
          <petal-aria-menuitem disabled>Item 3</petal-aria-menuitem>
        </petal-aria-fieldset>
      </petal-aria-menulist>
    `;
  },
};

const menuWithFieldsetSingleCheckable: MaterialStoryInit<StoryKnobs> = {
  name: 'Menu with fieldset, single-checkable',
  styles: css``,
  render(knobs) {
    return html`
      <button popovertarget="the-menu">Menu</button>
      <petal-aria-menulist id="the-menu">
        <petal-aria-fieldset checkable="single">
          <petal-aria-menuitem autofocus>Item 1</petal-aria-menuitem>
          <petal-aria-menuitem defaultchecked>Item 2</petal-aria-menuitem>
          <petal-aria-menuitem disabled>Item 3</petal-aria-menuitem>
        </petal-aria-fieldset>
      </petal-aria-menulist>
    `;
  },
};

const menuWithFieldsetMultipleCheckable: MaterialStoryInit<StoryKnobs> = {
  name: 'Menu with fieldset, multiple-checkable',
  styles: css``,
  render(knobs) {
    return html`
      <button popovertarget="the-menu">Menu</button>
      <petal-aria-menulist id="the-menu">
        <petal-aria-fieldset checkable="multiple">
          <petal-aria-menuitem autofocus>Item 1</petal-aria-menuitem>
          <petal-aria-menuitem defaultchecked>Item 2</petal-aria-menuitem>
          <petal-aria-menuitem disabled>Item 3</petal-aria-menuitem>
        </petal-aria-fieldset>
      </petal-aria-menulist>
    `;
  },
};

const menuWithFieldsetDisabled: MaterialStoryInit<StoryKnobs> = {
  name: 'Menu with disabled fieldset',
  styles: css``,
  render(knobs) {
    return html`
      <button popovertarget="the-menu">Menu</button>
      <petal-aria-menulist id="the-menu">
        <petal-aria-fieldset checkable="multiple" disabled>
          <petal-aria-menuitem autofocus>Item 1</petal-aria-menuitem>
          <petal-aria-menuitem>Item 2</petal-aria-menuitem>
          <petal-aria-menuitem disabled>Item 3</petal-aria-menuitem>
        </petal-aria-fieldset>
      </petal-aria-menulist>
    `;
  },
};

const menuWithMultipleFieldsetsCheckable: MaterialStoryInit<StoryKnobs> = {
  name: 'Menu with multiple fieldsets, single- and multiple-checkable',
  styles: css``,
  render(knobs) {
    return html`
      <button popovertarget="the-menu">Menu</button>
      <petal-aria-menulist id="the-menu">
        <petal-aria-fieldset checkable="single">
          <petal-aria-menuitem autofocus>Item 1</petal-aria-menuitem>
          <petal-aria-menuitem defaultchecked>Item 2</petal-aria-menuitem>
          <petal-aria-menuitem disabled>Item 3</petal-aria-menuitem>
        </petal-aria-fieldset>
        <hr />
        <petal-aria-fieldset checkable="multiple">
          <petal-aria-menuitem autofocus>Item 4</petal-aria-menuitem>
          <petal-aria-menuitem defaultchecked>Item 5</petal-aria-menuitem>
          <petal-aria-menuitem disabled>Item 6</petal-aria-menuitem>
        </petal-aria-fieldset>
      </petal-aria-menulist>
    `;
  },
};

const menuWithStyles: MaterialStoryInit<StoryKnobs> = {
  name: 'Menu with styles',
  styles: css`
    petal-aria-menuitem:state(enabled) {
      color: blue;
    }

    petal-aria-menuitem:state(disabled) {
      font-style: italic;
    }

    petal-aria-menuitem:state(checked) {
      color: green;
    }

    petal-aria-menuitem::part(checkmark)::before {
      content: '\\25B8'; /* &rtrif; */
    }
  `,
  render(knobs) {
    return html`
      <button popovertarget="the-menu">Menu</button>
      <petal-aria-menulist id="the-menu">
        <petal-aria-fieldset checkable="multiple">
          <petal-aria-menuitem autofocus>Item 1</petal-aria-menuitem>
          <petal-aria-menuitem defaultchecked>Item 2</petal-aria-menuitem>
          <petal-aria-menuitem disabled>Item 3</petal-aria-menuitem>
        </petal-aria-fieldset>
      </petal-aria-menulist>
    `;
  },
};

export const stories = [
  menubar,
  menu,
  menuWithDialog,
  menuWithPopover,
  menuWithFieldset,
  menuWithFieldsetSingleCheckable,
  menuWithFieldsetMultipleCheckable,
  menuWithFieldsetDisabled,
  menuWithMultipleFieldsetsCheckable,
  menuWithStyles,
];
