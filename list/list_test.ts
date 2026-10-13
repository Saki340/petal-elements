/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

// import 'jasmine'; (google3-only)
import './list.js';
import './list-item.js';

import {html} from 'lit';

import {Environment} from '../testing/environment.js';
import {createTokenTests} from '../testing/tokens.js';

import {ListHarness, ListItemHarness} from './harness.js';
import {PetalList} from './list.js';
import {PetalListItem} from './list-item.js';

describe('<petal-list>', () => {
  const env = new Environment();

  describe('.styles', () => {
    createTokenTests(PetalList.styles);
  });

  describe('keyboard navigation', () => {
    it('non-nagivable key does nothing', async () => {
      const root = env.render(html` <petal-list>
        <petal-list-item type="button" tabindex="-1"></petal-list-item>
        <petal-list-item type="button" tabindex="0"></petal-list-item>
        <petal-list-item type="button" tabindex="-1"></petal-list-item>
      </petal-list>`);

      const listEl = root.querySelector('petal-list')!;
      const listHarness = new ListHarness(listEl);
      const [first, second, third] = Array.from(
        root.querySelectorAll('petal-list-item'),
      );

      await env.waitForStability();

      expect(first.tabIndex).toEqual(-1);
      expect(second.tabIndex).toEqual(0);
      expect(third.tabIndex).toEqual(-1);

      await listHarness.keypress('k');
      await env.waitForStability();

      expect(first.tabIndex).toEqual(-1);
      expect(second.tabIndex).toEqual(0);
      expect(third.tabIndex).toEqual(-1);
    });

    it('ArrowDown activates the next item', async () => {
      const root = env.render(html` <petal-list>
        <petal-list-item type="button" tabindex="-1"></petal-list-item>
        <petal-list-item type="button" tabindex="0"></petal-list-item>
        <petal-list-item type="button" tabindex="-1"></petal-list-item>
      </petal-list>`);

      const listEl = root.querySelector('petal-list')!;
      const listHarness = new ListHarness(listEl);
      const [first, second, third] = Array.from(
        root.querySelectorAll('petal-list-item'),
      );

      await env.waitForStability();

      expect(first.tabIndex).toEqual(-1);
      expect(second.tabIndex).toEqual(0);
      expect(third.tabIndex).toEqual(-1);

      await listHarness.pressHandledKey('ArrowDown');
      await env.waitForStability();

      expect(first.tabIndex).toEqual(-1);
      expect(second.tabIndex).toEqual(-1);
      expect(third.tabIndex).toEqual(0);
    });

    it('ArrowRight in LTR activates the next item', async () => {
      const root = env.render(html` <petal-list>
        <petal-list-item type="button" tabindex="-1"></petal-list-item>
        <petal-list-item type="button" tabindex="0"></petal-list-item>
        <petal-list-item type="button" tabindex="-1"></petal-list-item>
      </petal-list>`);

      const listEl = root.querySelector('petal-list')!;
      const listHarness = new ListHarness(listEl);
      const [first, second, third] = Array.from(
        root.querySelectorAll('petal-list-item'),
      );

      await env.waitForStability();

      expect(first.tabIndex).toEqual(-1);
      expect(second.tabIndex).toEqual(0);
      expect(third.tabIndex).toEqual(-1);

      await listHarness.pressHandledKey('ArrowRight');
      await env.waitForStability();

      expect(first.tabIndex).toEqual(-1);
      expect(second.tabIndex).toEqual(-1);
      expect(third.tabIndex).toEqual(0);
    });

    it('ArrowLeft in RTL activates the next item', async () => {
      const root = env.render(html` <petal-list dir="rtl">
        <petal-list-item type="button" tabindex="-1"></petal-list-item>
        <petal-list-item type="button" tabindex="0"></petal-list-item>
        <petal-list-item type="button" tabindex="-1"></petal-list-item>
      </petal-list>`);

      const listEl = root.querySelector('petal-list')!;
      const listHarness = new ListHarness(listEl);
      const [first, second, third] = Array.from(
        root.querySelectorAll('petal-list-item'),
      );

      await env.waitForStability();

      expect(first.tabIndex).toEqual(-1);
      expect(second.tabIndex).toEqual(0);
      expect(third.tabIndex).toEqual(-1);

      await listHarness.pressHandledKey('ArrowLeft');
      await env.waitForStability();

      expect(first.tabIndex).toEqual(-1);
      expect(second.tabIndex).toEqual(-1);
      expect(third.tabIndex).toEqual(0);
    });

    it('ArrowDown will loop around', async () => {
      const root = env.render(html` <petal-list>
        <petal-list-item type="button" tabindex="-1"></petal-list-item>
        <petal-list-item type="button" tabindex="-1"></petal-list-item>
        <petal-list-item type="button" tabindex="0"></petal-list-item>
      </petal-list>`);
      const listEl = root.querySelector('petal-list')!;
      const listHarness = new ListHarness(listEl);
      const [first, second, third] = Array.from(
        root.querySelectorAll('petal-list-item'),
      );

      await env.waitForStability();

      expect(first.tabIndex).toEqual(-1);
      expect(second.tabIndex).toEqual(-1);
      expect(third.tabIndex).toEqual(0);

      await listHarness.pressHandledKey('ArrowDown');
      await env.waitForStability();

      expect(first.tabIndex).toEqual(0);
      expect(second.tabIndex).toEqual(-1);
      expect(third.tabIndex).toEqual(-1);
    });

    it('ArrowDown will do nothing if nothing is selectable', async () => {
      const root = env.render(html` <petal-list>
        <petal-list-item type="button" disabled></petal-list-item>
        <petal-list-item type="button" disabled></petal-list-item>
      </petal-list>`);
      const listEl = root.querySelector('petal-list')!;
      const listHarness = new ListHarness(listEl);
      const [first, second] = Array.from(root.querySelectorAll('petal-list-item'));

      await env.waitForStability();

      expect(first.tabIndex).toEqual(-1);
      expect(second.tabIndex).toEqual(-1);

      await listHarness.pressHandledKey('ArrowDown');
      await env.waitForStability();

      expect(first.tabIndex).toEqual(-1);
      expect(second.tabIndex).toEqual(-1);
    });

    it('ArrowDown does not activate disabled items', async () => {
      const root = env.render(html` <petal-list>
        <petal-list-item type="button"></petal-list-item>
        <petal-list-item type="button" disabled></petal-list-item>
        <petal-list-item type="button"></petal-list-item>
      </petal-list>`);
      const listEl = root.querySelector('petal-list')!;
      const listHarness = new ListHarness(listEl);
      const [first, second, third] = Array.from(
        root.querySelectorAll('petal-list-item'),
      );

      await env.waitForStability();

      expect(first.tabIndex).toEqual(0);
      expect(second.tabIndex).toEqual(-1);
      expect(third.tabIndex).toEqual(-1);

      await listHarness.pressHandledKey('ArrowDown');
      await env.waitForStability();

      expect(first.tabIndex).toEqual(-1);
      expect(second.tabIndex).toEqual(-1);
      expect(third.tabIndex).toEqual(0);
      expect(document.activeElement).toEqual(third);
    });

    it('ArrowDown will select itself if its the only activatable', async () => {
      const root = env.render(html` <petal-list>
        <petal-list-item type="button" tabindex="0"></petal-list-item>
      </petal-list>`);
      const listEl = root.querySelector('petal-list')!;
      const listHarness = new ListHarness(listEl);
      const first = root.querySelector('petal-list-item')!;

      await env.waitForStability();

      expect(first.tabIndex).toEqual(0);

      await listHarness.pressHandledKey('ArrowDown');
      await env.waitForStability();

      expect(first.tabIndex).toEqual(0);
      expect(document.activeElement).toEqual(first);
    });

    it('ArrowUp activates the previous item', async () => {
      const root = env.render(html` <petal-list>
        <petal-list-item type="button" tabindex="-1"></petal-list-item>
        <petal-list-item type="button" tabindex="0"></petal-list-item>
        <petal-list-item type="button" tabindex="-1"></petal-list-item>
      </petal-list>`);
      const listEl = root.querySelector('petal-list')!;
      const listHarness = new ListHarness(listEl);
      const [first, second, third] = Array.from(
        root.querySelectorAll('petal-list-item'),
      );

      await env.waitForStability();

      expect(first.tabIndex).toEqual(-1);
      expect(second.tabIndex).toEqual(0);
      expect(third.tabIndex).toEqual(-1);

      await listHarness.pressHandledKey('ArrowUp');
      await env.waitForStability();

      expect(first.tabIndex).toEqual(0);
      expect(second.tabIndex).toEqual(-1);
      expect(third.tabIndex).toEqual(-1);
      expect(document.activeElement).toEqual(first);
    });

    it('ArrowLeft in LTR activates the previous item', async () => {
      const root = env.render(html` <petal-list>
        <petal-list-item type="button" tabindex="-1"></petal-list-item>
        <petal-list-item type="button" tabindex="0"></petal-list-item>
        <petal-list-item type="button" tabindex="-1"></petal-list-item>
      </petal-list>`);
      const listEl = root.querySelector('petal-list')!;
      const listHarness = new ListHarness(listEl);
      const [first, second, third] = Array.from(
        root.querySelectorAll('petal-list-item'),
      );

      await env.waitForStability();

      expect(first.tabIndex).toEqual(-1);
      expect(second.tabIndex).toEqual(0);
      expect(third.tabIndex).toEqual(-1);

      await listHarness.pressHandledKey('ArrowLeft');
      await env.waitForStability();

      expect(first.tabIndex).toEqual(0);
      expect(second.tabIndex).toEqual(-1);
      expect(third.tabIndex).toEqual(-1);
    });

    it('ArrowRight in RTL activates the previous item', async () => {
      const root = env.render(html` <petal-list dir="rtl">
        <petal-list-item type="button" tabindex="-1"></petal-list-item>
        <petal-list-item type="button" tabindex="0"></petal-list-item>
        <petal-list-item type="button" tabindex="-1"></petal-list-item>
      </petal-list>`);
      const listEl = root.querySelector('petal-list')!;
      const listHarness = new ListHarness(listEl);
      const [first, second, third] = Array.from(
        root.querySelectorAll('petal-list-item'),
      );

      await env.waitForStability();

      expect(first.tabIndex).toEqual(-1);
      expect(second.tabIndex).toEqual(0);
      expect(third.tabIndex).toEqual(-1);

      await listHarness.pressHandledKey('ArrowRight');
      await env.waitForStability();

      expect(first.tabIndex).toEqual(0);
      expect(second.tabIndex).toEqual(-1);
      expect(third.tabIndex).toEqual(-1);
    });

    it('activatePreviousItem will loop around', async () => {
      const root = env.render(html` <petal-list>
        <petal-list-item type="button"></petal-list-item>
        <petal-list-item type="button"></petal-list-item>
        <petal-list-item type="button"></petal-list-item>
      </petal-list>`);
      const listEl = root.querySelector('petal-list')!;
      const listHarness = new ListHarness(listEl);
      const [first, second, third] = Array.from(
        root.querySelectorAll('petal-list-item'),
      );

      await env.waitForStability();

      expect(first.tabIndex).toEqual(0);
      expect(second.tabIndex).toEqual(-1);
      expect(third.tabIndex).toEqual(-1);

      await listHarness.pressHandledKey('ArrowUp');
      await env.waitForStability();

      expect(first.tabIndex).toEqual(-1);
      expect(second.tabIndex).toEqual(-1);
      expect(third.tabIndex).toEqual(0);
      expect(document.activeElement).toEqual(third);
    });

    it('ArrowUp will return null if nothing is selectable', async () => {
      const root = env.render(html` <petal-list>
        <petal-list-item type="button" disabled></petal-list-item>
        <petal-list-item type="button" disabled></petal-list-item>
      </petal-list>`);
      const listEl = root.querySelector('petal-list')!;
      const listHarness = new ListHarness(listEl);
      const [first, second] = Array.from(root.querySelectorAll('petal-list-item'));

      await env.waitForStability();

      expect(first.tabIndex).toEqual(-1);
      expect(second.tabIndex).toEqual(-1);

      await listHarness.pressHandledKey('ArrowUp');
      await env.waitForStability();

      expect(first.tabIndex).toEqual(-1);
      expect(second.tabIndex).toEqual(-1);
    });

    it('ArrowUp does not activate disabled items', async () => {
      const root = env.render(html` <petal-list>
        <petal-list-item type="button" tabindex="-1"></petal-list-item>
        <petal-list-item type="button" disabled></petal-list-item>
        <petal-list-item type="button" tabindex="0"></petal-list-item>
      </petal-list>`);
      const listEl = root.querySelector('petal-list')!;
      const listHarness = new ListHarness(listEl);
      const [first, second, third] = Array.from(
        root.querySelectorAll('petal-list-item'),
      );

      await env.waitForStability();

      expect(first.tabIndex).toEqual(-1);
      expect(second.tabIndex).toEqual(-1);
      expect(third.tabIndex).toEqual(0);

      await listHarness.pressHandledKey('ArrowUp');
      await env.waitForStability();

      expect(first.tabIndex).toEqual(0);
      expect(second.tabIndex).toEqual(-1);
      expect(third.tabIndex).toEqual(-1);
      expect(document.activeElement).toEqual(first);
    });

    it('ArrowUp will select itself if its the only activatable', async () => {
      const root = env.render(html` <petal-list>
        <petal-list-item type="button"></petal-list-item>
      </petal-list>`);
      const listEl = root.querySelector('petal-list')!;
      const listHarness = new ListHarness(listEl);
      const first = root.querySelector('petal-list-item')!;

      await env.waitForStability();

      expect(first.tabIndex).toEqual(0);

      await listHarness.pressHandledKey('ArrowUp');
      await env.waitForStability();

      expect(first.tabIndex).toEqual(0);
      expect(document.activeElement).toEqual(first);
    });

    it('Home will select the first item if something is already selected', async () => {
      const root = env.render(html` <petal-list>
        <petal-list-item type="button" tabindex="-1"></petal-list-item>
        <petal-list-item type="button" tabindex="0"></petal-list-item>
        <petal-list-item type="button"></petal-list-item>
      </petal-list>`);
      const listEl = root.querySelector('petal-list')!;
      const listHarness = new ListHarness(listEl);
      const [first, second, third] = Array.from(
        root.querySelectorAll('petal-list-item'),
      );

      await env.waitForStability();

      expect(first.tabIndex).toEqual(-1);
      expect(second.tabIndex).toEqual(0);
      expect(third.tabIndex).toEqual(-1);

      await listHarness.pressHandledKey('Home');
      await env.waitForStability();

      expect(first.tabIndex).toEqual(0);
      expect(second.tabIndex).toEqual(-1);
      expect(third.tabIndex).toEqual(-1);
      expect(document.activeElement).toEqual(first);
    });

    it('Home will select the first activatable item if first is non-activatable', async () => {
      const root = env.render(html` <petal-list>
        <petal-list-item type="button" disabled></petal-list-item>
        <petal-list-item type="button" tabindex="-1"></petal-list-item>
        <petal-list-item type="button" tabindex="0"></petal-list-item>
      </petal-list>`);
      const listEl = root.querySelector('petal-list')!;
      const listHarness = new ListHarness(listEl);
      const [first, second, third] = Array.from(
        root.querySelectorAll('petal-list-item'),
      );

      await env.waitForStability();

      expect(first.tabIndex).toEqual(-1);
      expect(second.tabIndex).toEqual(-1);
      expect(third.tabIndex).toEqual(0);

      await listHarness.pressHandledKey('Home');
      await env.waitForStability();

      expect(first.tabIndex).toEqual(-1);
      expect(second.tabIndex).toEqual(0);
      expect(third.tabIndex).toEqual(-1);
      expect(document.activeElement).toEqual(second);
    });

    it('Home will select the first item if it is already selected', async () => {
      const root = env.render(html` <petal-list>
        <petal-list-item type="button" tabindex="0"></petal-list-item>
        <petal-list-item type="button" tabindex="-1"></petal-list-item>
        <petal-list-item type="button" tabindex="-1"></petal-list-item>
      </petal-list>`);
      const listEl = root.querySelector('petal-list')!;
      const listHarness = new ListHarness(listEl);
      const [first, second, third] = Array.from(
        root.querySelectorAll('petal-list-item'),
      );

      await env.waitForStability();

      expect(first.tabIndex).toEqual(0);
      expect(second.tabIndex).toEqual(-1);
      expect(third.tabIndex).toEqual(-1);

      await listHarness.pressHandledKey('Home');
      await env.waitForStability();

      expect(first.tabIndex).toEqual(0);
      expect(second.tabIndex).toEqual(-1);
      expect(third.tabIndex).toEqual(-1);
      expect(document.activeElement).toEqual(first);
    });

    it('End will select the last item if something is already selected', async () => {
      const root = env.render(html` <petal-list>
        <petal-list-item type="button" tabindex="-1"></petal-list-item>
        <petal-list-item type="button" tabindex="0"></petal-list-item>
        <petal-list-item type="button" tabindex="-1"></petal-list-item>
      </petal-list>`);
      const listEl = root.querySelector('petal-list')!;
      const listHarness = new ListHarness(listEl);
      const [first, second, third] = Array.from(
        root.querySelectorAll('petal-list-item'),
      );

      await env.waitForStability();

      expect(first.tabIndex).toEqual(-1);
      expect(second.tabIndex).toEqual(0);
      expect(third.tabIndex).toEqual(-1);

      await listHarness.pressHandledKey('End');
      await env.waitForStability();

      expect(first.tabIndex).toEqual(-1);
      expect(second.tabIndex).toEqual(-1);
      expect(third.tabIndex).toEqual(0);
      expect(document.activeElement).toEqual(third);
    });

    it('End will select the last activatable item if last is non-activatable', async () => {
      const root = env.render(html` <petal-list>
        <petal-list-item type="button"></petal-list-item>
        <petal-list-item type="button"></petal-list-item>
        <petal-list-item type="button" disabled></petal-list-item>
      </petal-list>`);
      const listEl = root.querySelector('petal-list')!;
      const listHarness = new ListHarness(listEl);
      const [first, second, third] = Array.from(
        root.querySelectorAll('petal-list-item'),
      );

      await env.waitForStability();

      expect(first.tabIndex).toEqual(0);
      expect(second.tabIndex).toEqual(-1);
      expect(third.tabIndex).toEqual(-1);

      await listHarness.pressHandledKey('End');
      await env.waitForStability();

      expect(first.tabIndex).toEqual(-1);
      expect(second.tabIndex).toEqual(0);
      expect(third.tabIndex).toEqual(-1);
      expect(document.activeElement).toEqual(second);
    });

    it('End will select the last item if it is already selected', async () => {
      const root = env.render(html` <petal-list>
        <petal-list-item type="button" tabindex="-1"></petal-list-item>
        <petal-list-item type="button" tabindex="-1"></petal-list-item>
        <petal-list-item type="button" tabindex="0"></petal-list-item>
      </petal-list>`);
      const listEl = root.querySelector('petal-list')!;
      const listHarness = new ListHarness(listEl);
      const [first, second, third] = Array.from(
        root.querySelectorAll('petal-list-item'),
      );

      await env.waitForStability();

      expect(first.tabIndex).toEqual(-1);
      expect(second.tabIndex).toEqual(-1);
      expect(third.tabIndex).toEqual(0);

      await listHarness.pressHandledKey('End');
      await env.waitForStability();

      expect(first.tabIndex).toEqual(-1);
      expect(second.tabIndex).toEqual(-1);
      expect(third.tabIndex).toEqual(0);
      expect(document.activeElement).toEqual(third);
    });

    it('Clicking on an item will activate it', async () => {
      const root = env.render(html` <petal-list>
        <petal-list-item type="button" tabindex="-1"></petal-list-item>
        <petal-list-item type="button" tabindex="-1"></petal-list-item>
        <petal-list-item type="button" tabindex="0"></petal-list-item>
      </petal-list>`);
      const [first, second, third] = Array.from(
        root.querySelectorAll('petal-list-item'),
      );

      await env.waitForStability();

      expect(first.tabIndex).toEqual(-1);
      expect(second.tabIndex).toEqual(-1);
      expect(third.tabIndex).toEqual(0);

      const secondHarness = new ListItemHarness(second);

      await secondHarness.clickWithMouse();
      await env.waitForStability();

      expect(first.tabIndex).toEqual(-1);
      expect(second.tabIndex).toEqual(0);
      expect(third.tabIndex).toEqual(-1);
    });
  });

  describe('activate items methods', () => {
    it('List will activate only first item by default', async () => {
      const root = env.render(html` <petal-list>
        <petal-list-item type="button"></petal-list-item>
        <petal-list-item type="button"></petal-list-item>
        <petal-list-item type="button"></petal-list-item>
      </petal-list>`);
      const [first, second, third] = Array.from(
        root.querySelectorAll('petal-list-item'),
      );

      await env.waitForStability();

      expect(first.tabIndex).toEqual(0);
      expect(second.tabIndex).toEqual(-1);
      expect(third.tabIndex).toEqual(-1);
      expect(document.activeElement).toEqual(document.body);
    });

    it('List will activate only first activatable item by default', async () => {
      const root = env.render(html` <petal-list>
        <petal-list-item type="button" disabled></petal-list-item>
        <petal-list-item type="button"></petal-list-item>
        <petal-list-item type="button"></petal-list-item>
      </petal-list>`);
      const [first, second, third] = Array.from(
        root.querySelectorAll('petal-list-item'),
      );

      await env.waitForStability();

      expect(first.tabIndex).toEqual(-1);
      expect(second.tabIndex).toEqual(0);
      expect(third.tabIndex).toEqual(-1);
      expect(document.activeElement).toEqual(document.body);
    });

    it('List will activate first activatable item if all are tabindex -1', async () => {
      const root = env.render(html` <petal-list>
        <petal-list-item type="button" tabindex="-1"></petal-list-item>
        <petal-list-item type="button" tabindex="-1"></petal-list-item>
        <petal-list-item type="button" tabindex="-1"></petal-list-item>
      </petal-list>`);
      const [first, second, third] = Array.from(
        root.querySelectorAll('petal-list-item'),
      );

      await env.waitForStability();

      expect(first.tabIndex).toEqual(0);
      expect(second.tabIndex).toEqual(-1);
      expect(third.tabIndex).toEqual(-1);
      expect(document.activeElement).toEqual(document.body);
    });

    it('List will activate first activatable item if defined by user', async () => {
      const root = env.render(html` <petal-list>
        <petal-list-item type="button" tabindex="-1"></petal-list-item>
        <petal-list-item type="button" tabindex="2"></petal-list-item>
        <petal-list-item type="button" tabindex="1"></petal-list-item>
      </petal-list>`);
      const [first, second, third] = Array.from(
        root.querySelectorAll('petal-list-item'),
      );

      await env.waitForStability();

      expect(first.tabIndex).toEqual(-1);
      expect(second.tabIndex).toEqual(0);
      expect(third.tabIndex).toEqual(-1);
      expect(document.activeElement).toEqual(document.body);
    });

    it('activateNextItem activates the next item', async () => {
      const root = env.render(html` <petal-list>
        <petal-list-item type="button" tabindex="-1"></petal-list-item>
        <petal-list-item type="button" tabindex="0"></petal-list-item>
        <petal-list-item type="button" tabindex="-1"></petal-list-item>
      </petal-list>`);
      const listEl = root.querySelector('petal-list')!;
      const [first, second, third] = Array.from(
        root.querySelectorAll('petal-list-item'),
      );

      await env.waitForStability();

      expect(first.tabIndex).toEqual(-1);
      expect(second.tabIndex).toEqual(0);
      expect(third.tabIndex).toEqual(-1);

      const nextItem = listEl.activateNextItem();
      await env.waitForStability();

      expect(first.tabIndex).toEqual(-1);
      expect(second.tabIndex).toEqual(-1);
      expect(third.tabIndex).toEqual(0);
      expect(nextItem).toEqual(third);
      expect(document.activeElement).toEqual(third);
    });

    it('activateNextItem will loop around', async () => {
      const root = env.render(html` <petal-list>
        <petal-list-item type="button" tabindex="-1"></petal-list-item>
        <petal-list-item type="button" tabindex="-1"></petal-list-item>
        <petal-list-item type="button" tabindex="0"></petal-list-item>
      </petal-list>`);
      const listEl = root.querySelector('petal-list')!;
      const [first, second, third] = Array.from(
        root.querySelectorAll('petal-list-item'),
      );

      await env.waitForStability();

      expect(first.tabIndex).toEqual(-1);
      expect(second.tabIndex).toEqual(-1);
      expect(third.tabIndex).toEqual(0);

      const nextItem = listEl.activateNextItem();
      await env.waitForStability();

      expect(first.tabIndex).toEqual(0);
      expect(second.tabIndex).toEqual(-1);
      expect(third.tabIndex).toEqual(-1);
      expect(nextItem).toEqual(first);
      expect(document.activeElement).toEqual(first);
    });

    it('activateNextItem will return null if nothing is selectable', async () => {
      const root = env.render(html` <petal-list> </petal-list>`);
      const listEl = root.querySelector('petal-list')!;

      await env.waitForStability();

      const nextItem = listEl.activateNextItem();
      await env.waitForStability();

      expect(nextItem).toBeNull();
    });

    it('activateNextItem does not activate disabled items', async () => {
      const root = env.render(html` <petal-list>
        <petal-list-item type="button"></petal-list-item>
        <petal-list-item type="button" disabled></petal-list-item>
        <petal-list-item type="button"></petal-list-item>
      </petal-list>`);
      const listEl = root.querySelector('petal-list')!;
      const [first, second, third] = Array.from(
        root.querySelectorAll('petal-list-item'),
      );

      await env.waitForStability();

      expect(first.tabIndex).toEqual(0);
      expect(second.tabIndex).toEqual(-1);
      expect(third.tabIndex).toEqual(-1);

      const nextItem = listEl.activateNextItem();
      await env.waitForStability();

      expect(first.tabIndex).toEqual(-1);
      expect(second.tabIndex).toEqual(-1);
      expect(third.tabIndex).toEqual(0);
      expect(nextItem).toEqual(third);
      expect(document.activeElement).toEqual(third);
    });

    it('activateNextItem will return itself if it is the only activatable item', async () => {
      const root = env.render(html` <petal-list>
        <petal-list-item type="button" tabindex="0"></petal-list-item>
      </petal-list>`);
      const listEl = root.querySelector('petal-list')!;
      const first = root.querySelector('petal-list-item')!;

      await env.waitForStability();

      expect(first.tabIndex).toEqual(0);

      const nextItem = listEl.activateNextItem();
      await env.waitForStability();

      expect(first.tabIndex).toEqual(0);
      expect(nextItem).toEqual(first);
      expect(document.activeElement).toEqual(first);
    });

    it('activatePreviousItem activates the previous item', async () => {
      const root = env.render(html` <petal-list>
        <petal-list-item type="button" tabindex="-1"></petal-list-item>
        <petal-list-item type="button" tabindex="0"></petal-list-item>
        <petal-list-item type="button" tabindex="-1"></petal-list-item>
      </petal-list>`);
      const listEl = root.querySelector('petal-list')!;
      const [first, second, third] = Array.from(
        root.querySelectorAll('petal-list-item'),
      );

      await env.waitForStability();

      expect(first.tabIndex).toEqual(-1);
      expect(second.tabIndex).toEqual(0);
      expect(third.tabIndex).toEqual(-1);

      const nextItem = listEl.activatePreviousItem();
      await env.waitForStability();

      expect(first.tabIndex).toEqual(0);
      expect(second.tabIndex).toEqual(-1);
      expect(third.tabIndex).toEqual(-1);
      expect(nextItem).toEqual(first);
      expect(document.activeElement).toEqual(first);
    });

    it('activatePreviousItem will loop around', async () => {
      const root = env.render(html` <petal-list>
        <petal-list-item type="button"></petal-list-item>
        <petal-list-item type="button"></petal-list-item>
        <petal-list-item type="button"></petal-list-item>
      </petal-list>`);
      const listEl = root.querySelector('petal-list')!;
      const [first, second, third] = Array.from(
        root.querySelectorAll('petal-list-item'),
      );

      await env.waitForStability();

      expect(first.tabIndex).toEqual(0);
      expect(second.tabIndex).toEqual(-1);
      expect(third.tabIndex).toEqual(-1);

      const nextItem = listEl.activatePreviousItem();
      await env.waitForStability();

      expect(first.tabIndex).toEqual(-1);
      expect(second.tabIndex).toEqual(-1);
      expect(third.tabIndex).toEqual(0);
      expect(nextItem).toEqual(third);
      expect(document.activeElement).toEqual(third);
    });

    it('activatePreviousItem will return null if nothing is selectable', async () => {
      const root = env.render(html` <petal-list> </petal-list>`);
      const listEl = root.querySelector('petal-list')!;

      await env.waitForStability();

      const nextItem = listEl.activatePreviousItem();
      await env.waitForStability();

      expect(nextItem).toBeNull();
      expect(document.activeElement).toEqual(document.body);
    });

    it('activatePreviousItem does not activate disabled items', async () => {
      const root = env.render(html` <petal-list>
        <petal-list-item type="button" tabindex="-1"></petal-list-item>
        <petal-list-item type="button" disabled></petal-list-item>
        <petal-list-item type="button" tabindex="0"></petal-list-item>
      </petal-list>`);
      const listEl = root.querySelector('petal-list')!;
      const [first, second, third] = Array.from(
        root.querySelectorAll('petal-list-item'),
      );

      await env.waitForStability();

      expect(first.tabIndex).toEqual(-1);
      expect(second.tabIndex).toEqual(-1);
      expect(third.tabIndex).toEqual(0);

      const nextItem = listEl.activatePreviousItem();
      await env.waitForStability();

      expect(first.tabIndex).toEqual(0);
      expect(second.tabIndex).toEqual(-1);
      expect(third.tabIndex).toEqual(-1);
      expect(nextItem).toEqual(first);
      expect(document.activeElement).toEqual(first);
    });

    it('activatePreviousItem will return itself if its activatable', async () => {
      const root = env.render(html` <petal-list>
        <petal-list-item type="button"></petal-list-item>
      </petal-list>`);
      const listEl = root.querySelector('petal-list')!;
      const first = root.querySelector('petal-list-item')!;

      await env.waitForStability();

      expect(first.tabIndex).toEqual(0);

      const nextItem = listEl.activatePreviousItem();
      await env.waitForStability();

      expect(first.tabIndex).toEqual(0);
      expect(nextItem).toEqual(first);
      expect(document.activeElement).toEqual(first);
    });
  });

  describe('aria', () => {
    it('Sets default role to list', async () => {
      const root = env.render(html`<petal-list></petal-list>`);
      const listEl = root.querySelector('petal-list')!;
      await env.waitForStability();
      const internals = (
        listEl as unknown as {internals: {role: string | null}}
      ).internals;

      expect(internals.role).toEqual('list');
    });

    it('Does not override user given role attribute', async () => {
      const root = env.render(html`<petal-list role="listbox"></petal-list>`);
      const listEl = root.querySelector('petal-list')!;
      await env.waitForStability();

      expect(listEl.getAttribute('role')).toBe('listbox');
    });

    it('Does not override user given role property', async () => {
      const root = env.render(html`<petal-list .role=${'listbox'}></petal-list>`);
      const listEl = root.querySelector('petal-list')!;
      await env.waitForStability();

      expect(listEl.role).toBe('listbox');
    });
  });
});

describe('<petal-list-item>', () => {
  const env = new Environment();

  describe('.styles', () => {
    createTokenTests(PetalListItem.styles);
  });

  describe('rendering', () => {
    it('self-describes as a list-item', async () => {
      const root = env.render(html` <petal-list-item> </petal-list-item>`);

      const listItemEl = root.querySelector('petal-list-item')!;

      await env.waitForStability();

      expect(listItemEl.hasAttribute('petal-list-item')).toBeTrue();
    });
  });

  it('disabled overrides tabIndex', async () => {
    const root = env.render(html`<petal-list-item type="button"></petal-list-item>`);

    const listItem = root.querySelector('petal-list-item')!;

    await env.waitForStability();

    const internalRoot = listItem.renderRoot.querySelector(
      '#item',
    ) as HTMLElement;

    expect(internalRoot.tabIndex).toBe(0);

    listItem.disabled = true;

    await env.waitForStability();

    expect(listItem.disabled).toBeTrue();
    expect(internalRoot.tabIndex).toBe(-1);
  });

  it('ripple and focus ring rendered on interactive', async () => {
    const root = env.render(html`<petal-list-item></petal-list-item>`);

    const listItem = root.querySelector('petal-list-item')!;

    await env.waitForStability();

    let rippleEl = listItem.renderRoot.querySelector('petal-ripple');
    let focusRingEl = listItem.renderRoot.querySelector('petal-focus-ring');

    expect(rippleEl).toBeNull();
    expect(focusRingEl).toBeNull();

    listItem.type = 'button';

    await env.waitForStability();

    rippleEl = listItem.renderRoot.querySelector('petal-ripple');
    focusRingEl = listItem.renderRoot.querySelector('petal-focus-ring');

    expect(rippleEl).toBeTruthy();
    expect(focusRingEl).toBeTruthy();
  });
});

describe('<petal-list-item> link', () => {
  const env = new Environment();

  describe('.styles', () => {
    createTokenTests(PetalListItem.styles);
  });

  it('setting href renders an anchor tag', async () => {
    const root = env.render(
      html`<petal-list-item href="https://google.com"></petal-list-item>`,
    );

    const listItem = root.querySelector('petal-list-item')!;

    await env.waitForStability();

    const internalRoot = listItem.renderRoot.querySelector(
      '#item',
    ) as HTMLElement;

    expect(internalRoot.tagName).toBe('A');
  });

  it('setting target without href renders nothing', async () => {
    const root = env.render(
      html`<petal-list-item target="_blank"></petal-list-item>`,
    );

    const listItem = root.querySelector('petal-list-item')!;

    await env.waitForStability();

    const internalRoot = listItem.renderRoot.querySelector(
      '#item',
    ) as HTMLElement;

    expect(internalRoot.hasAttribute('target')).toBe(false);
  });
  describe('segmented', () => {
    const radii = (element: Element) => {
      const style = getComputedStyle(element);
      return [
        style.borderTopLeftRadius,
        style.borderTopRightRadius,
        style.borderBottomRightRadius,
        style.borderBottomLeftRadius,
      ];
    };

    it('shapes items by position, 2px apart, each on its own surface', async () => {
      const root = env.render(html`<petal-list segmented>
        <petal-list-item>One</petal-list-item>
        <petal-list-item>Two</petal-list-item>
        <petal-list-item>Three</petal-list-item>
      </petal-list>`);
      await env.waitForStability();
      const list = root.querySelector('petal-list')!;
      const items = Array.from(root.querySelectorAll('petal-list-item'));
      for (const item of items) item.style.transition = 'none';

      expect(getComputedStyle(list).backgroundColor).toBe('rgba(0, 0, 0, 0)');
      expect(getComputedStyle(list).rowGap).toBe('2px');
      // Compose's surface.
      expect(getComputedStyle(items[1]).backgroundColor).toBe('rgb(254, 247, 255)');
      expect(radii(items[0])).toEqual(['16px', '16px', '4px', '4px']);
      expect(radii(items[1])).toEqual(['4px', '4px', '4px', '4px']);
      expect(radii(items[2])).toEqual(['4px', '4px', '16px', '16px']);
      const gap =
        items[1].getBoundingClientRect().top - items[0].getBoundingClientRect().bottom;
      expect(gap).toBe(2);
    });

    it('rounds a single item fully', async () => {
      const root = env.render(html`<petal-list segmented>
        <petal-list-item>One</petal-list-item>
      </petal-list>`);
      await env.waitForStability();
      const item = root.querySelector('petal-list-item')!;
      expect(radii(item)).toEqual(['16px', '16px', '16px', '16px']);
    });

    it('does not change lists without segmented', async () => {
      const root = env.render(html`<petal-list>
        <petal-list-item>One</petal-list-item>
      </petal-list>`);
      await env.waitForStability();
      const item = root.querySelector('petal-list-item')!;
      expect(radii(item)).toEqual(['0px', '0px', '0px', '0px']);
      expect(getComputedStyle(item).backgroundColor).toBe('rgba(0, 0, 0, 0)');
    });
  });
});
