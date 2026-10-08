/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import {html} from 'lit';

import {Environment} from '../testing/environment.js';
import {createTokenTests} from '../testing/tokens.js';

import {TabsHarness} from './harness.js';
import {PetalPrimaryTab} from './primary-tab.js';
import {PetalSecondaryTab} from './secondary-tab.js';
import {PetalTabs} from './tabs.js';

interface TabsTestProps {
  activeTabIndex?: number;
}

function getTabsTemplate(props?: TabsTestProps) {
  return html` <petal-tabs .activeTabIndex=${props?.activeTabIndex ?? 0}>
    <petal-primary-tab>A</petal-primary-tab>
    <petal-primary-tab>B</petal-primary-tab>
    <petal-primary-tab>C</petal-primary-tab>
  </petal-tabs>`;
}

describe('<petal-tabs>', () => {
  const env = new Environment();

  async function setupTest(props?: TabsTestProps, template = getTabsTemplate) {
    const root = env.render(template(props));
    await env.waitForStability();
    const tab = root.querySelector<PetalTabs>('petal-tabs')!;
    const harness = new TabsHarness(tab);
    return {harness, root};
  }

  describe('.styles', () => {
    createTokenTests(PetalTabs.styles);
    createTokenTests(PetalPrimaryTab.styles);
    createTokenTests(PetalSecondaryTab.styles);
  });

  describe('properties', () => {
    it('renders selected with indicator', async () => {
      const {harness} = await setupTest({activeTabIndex: 1});
      expect(harness.element.activeTabIndex).toBe(1);
      expect(harness.element.activeTab).toBe(harness.harnessedItems[1].element);
      harness.harnessedItems.forEach(async (tabHarness, i) => {
        const shouldBeSelected = i === harness.element.activeTabIndex;
        await tabHarness.element.updateComplete;
        expect(tabHarness.element.active).toBe(shouldBeSelected);
        expect(await tabHarness.isIndicatorShowing()).toBe(shouldBeSelected);
      });
      await env.waitForStability();
      harness.element.activeTabIndex = 0;
      await harness.element.updateComplete;
      expect(harness.element.activeTabIndex).toBe(0);
      harness.harnessedItems.forEach(async (tabHarness, i) => {
        const shouldBeSelected = i === harness.element.activeTabIndex;
        await tabHarness.element.updateComplete;
        expect(tabHarness.element.active).toBe(shouldBeSelected);
        expect(await tabHarness.isIndicatorShowing()).toBe(shouldBeSelected);
      });
    });

    it('updates activeTab', async () => {
      const {harness} = await setupTest({activeTabIndex: 1});
      expect(harness.element.activeTab).toBe(harness.harnessedItems[1].element);
      harness.element.activeTabIndex = 0;
      await harness.element.updateComplete;
      expect(harness.element.activeTab).toBe(harness.harnessedItems[0].element);
    });

    it('maintains selection when tabs are mutated', async () => {
      // Note: adding and moving tabs does not change selection
      const {harness} = await setupTest({activeTabIndex: 1});
      const [, second] = harness.element.tabs;
      expect(harness.element.activeTab).toBe(second);
      const tab = document.createElement('petal-primary-tab');
      tab.textContent = 'tab';
      // add before selected
      harness.element.prepend(tab);
      await env.waitForStability();
      expect(harness.element.activeTab).toBe(second);
      // move after selected
      harness.element.activeTab?.after(tab);
      await env.waitForStability();
      expect(harness.element.activeTab).toBe(second);
      // move before selected
      harness.element.prepend(tab);
      await env.waitForStability();
      expect(harness.element.activeTab).toBe(second);
      // remove
      tab.remove();
      await env.waitForStability();
      expect(harness.element.activeTab).toBe(second);
    });

    it('selects first item when selected tab is removed', async () => {
      const {harness} = await setupTest({activeTabIndex: 1});
      const [first, second] = harness.element.tabs;
      expect(harness.element.activeTab).toBe(second);
      second.remove();
      await env.waitForStability();
      expect(harness.element.activeTab).toBe(first);
    });

    it('should ignore setting activeTab when tab is not a child', async () => {
      const {harness} = await setupTest();
      const [firstTab] = harness.element.tabs;
      expect(harness.element.activeTab).toBe(firstTab);
      const unrelatedTab = document.createElement('petal-primary-tab');
      harness.element.activeTab = unrelatedTab;
      await env.waitForStability();
      expect(harness.element.activeTab).toBe(firstTab);
    });

    it('should allow setting activeTabIndex in a lit property binding', async () => {
      const root = env.render(html`
        <petal-tabs .activeTabIndex=${1}>
          <petal-primary-tab>A</petal-primary-tab>
          <petal-primary-tab>B</petal-primary-tab>
        </petal-tabs>
      `);

      await env.waitForStability();
      const tabs = root.querySelector('petal-tabs')!;
      expect(tabs.activeTabIndex).withContext('activeTabIndex').toBe(1);
      expect(tabs.activeTab?.textContent)
        .withContext('activeTab')
        .toBe('B');
    });

    it('should allow setting active-tab-index as an attribute', async () => {
      const root = env.render(html`
        <petal-tabs active-tab-index=${1}>
          <petal-primary-tab>A</petal-primary-tab>
          <petal-primary-tab>B</petal-primary-tab>
        </petal-tabs>
      `);

      await env.waitForStability();
      const tabs = root.querySelector('petal-tabs')!;
      expect(tabs.activeTabIndex).withContext('activeTabIndex').toBe(1);
      expect(tabs.activeTab?.textContent)
        .withContext('activeTab')
        .toBe('B');
    });
  });

  it('should dispatch "change" when tab changes', async () => {
    const {harness} = await setupTest();
    const changeListener = jasmine.createSpy('changeListener');
    harness.element.addEventListener('change', changeListener);

    await harness.harnessedItems[1].clickWithMouse();
    expect(changeListener).toHaveBeenCalledTimes(1);
  });

  it('should not dispatch "change" when changing to unrelated tab', async () => {
    const {harness} = await setupTest();
    const changeListener = jasmine.createSpy('changeListener');
    harness.element.addEventListener('change', changeListener);

    harness.element.activeTab = document.createElement('petal-primary-tab');
    await env.waitForStability();
    expect(changeListener).not.toHaveBeenCalled();
  });

  it('should not dispatch "change" when setting activeTab to itself', async () => {
    const {harness} = await setupTest();
    const changeListener = jasmine.createSpy('changeListener');
    harness.element.addEventListener('change', changeListener);

    harness.element.activeTab = harness.element.activeTab;
    await env.waitForStability();
    expect(changeListener).not.toHaveBeenCalled();
  });
});
