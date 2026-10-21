/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import '../../divider/divider.js';

import {html, isServer, LitElement} from 'lit';
import {property, query, queryAssignedElements} from 'lit/decorators.js';

import {
  DEFAULT_SPATIAL,
  Spring,
  springFromCss,
} from '../../internal/motion/spring.js';

import {ANIMATE_INDICATOR, Tab} from './tab.js';

/**
 * @fires change {Event} Fired when the selected tab changes. The target's
 * `activeTabIndex` or `activeTab` provide information about the selection
 * change. The change event is fired when a user interaction like a space/enter
 * key or click cause a selection change. The tab selection based on these
 * actions can be cancelled by calling preventDefault on the triggering
 * `keydown` or `click` event. --bubbles
 *
 * @example
 * // perform an action if a tab is clicked
 * tabs.addEventListener('change', (event: Event) => {
 *   if (event.target.activeTabIndex === 2)
 *     takeAction();
 *   }
 * });
 *
 * // prevent a click from triggering tab selection under some condition
 * tabs.addEventListener('click', (event: Event) => {
 *   if (notReady)
 *     event.preventDefault();
 *   }
 * });
 *
 *
 * @slot - The `petal-primary-tab`s or `petal-secondary-tab`s.
 */
export class Tabs extends LitElement {
  /**
   * The tabs of this tab bar.
   */
  @queryAssignedElements({flatten: true, selector: '[md-tab]'})
  readonly tabs!: Tab[];

  /**
   * The currently selected tab, `null` only when there are no tab children.
   *
   * @export
   */
  get activeTab() {
    return this.tabs.find((tab) => tab.active) ?? null;
  }
  set activeTab(tab: Tab | null) {
    // Ignore setting activeTab to null. As long as there are children, one tab
    // must be selected.
    if (tab) {
      this.activateTab(tab);
    }
  }

  /**
   * The index of the currently selected tab.
   *
   * @export
   */
  @property({type: Number, attribute: 'active-tab-index'})
  get activeTabIndex() {
    return this.tabs.findIndex((tab) => tab.active);
  }
  set activeTabIndex(index: number) {
    const activateTabAtIndex = () => {
      const tab = this.tabs[index];
      // Ignore out-of-bound indices.
      if (tab) {
        this.activateTab(tab);
      }
    };

    if (!this.slotElement) {
      // This is needed to support setting the activeTabIndex via a lit property
      // binding.
      //
      // ```ts
      // html`
      //   <petal-tabs .activeTabIndex=${1}>
      //     <md-tab>First</md-tab>
      //     <md-tab>Second</md-tab>
      //   </petal-tabs>
      // `;
      // ```
      //
      // It's needed since lit's rendering lifecycle is asynchronous, and the
      // `<slot>` element hasn't rendered, so `tabs` is empty.
      this.updateComplete.then(activateTabAtIndex);
      return;
    }

    activateTabAtIndex();
  }

  /**
   * Whether or not to automatically select a tab when it is focused.
   */
  @property({type: Boolean, attribute: 'auto-activate'}) autoActivate = false;

  /**
   * Whether the tabs are as wide as their content (90px at least) with 52px
   * of space at the start and the end, and the row scrolls, like Compose's
   * scrollable tab rows. Otherwise the tabs share the width equally. The
   * selected tab scrolls to the center of the row either way, if the row
   * overflows.
   */
  @property({type: Boolean, reflect: true}) scrollable = false;

  @query('.tabs') private readonly tabsScrollerElement!: HTMLElement | null;
  @query('slot') private readonly slotElement!: HTMLSlotElement | null;

  // The scroll position, driven like Compose's animateScrollTo on the default
  // spatial spring (ScrollableTabData).
  private readonly scrollSpring = new Spring(DEFAULT_SPATIAL);
  private scrollFrame = 0;
  private scrolledOnce = false;

  private get focusedTab() {
    return this.tabs.find((tab) => tab.matches(':focus-within'));
  }

  private readonly internals =
    // Cast needed for closure
    (this as HTMLElement).attachInternals();

  constructor() {
    super();
    if (!isServer) {
      this.internals.role = 'tablist';
      this.addEventListener('keydown', this.handleKeydown.bind(this));
      this.addEventListener('keyup', this.handleKeyup.bind(this));
      this.addEventListener('focusout', this.handleFocusout.bind(this));
    }
  }

  /**
   * Scrolls the toolbar, if overflowing, to the active tab, or the provided
   * tab.
   *
   * @param tabToScrollTo The tab that should be scrolled to. Defaults to the
   *     active tab.
   * @return A Promise that resolves after the tab has been scrolled to.
   */
  async scrollToTab(tabToScrollTo?: Tab | null) {
    await this.updateComplete;
    const {tabs} = this;
    tabToScrollTo ??= this.activeTab;
    if (
      !tabToScrollTo ||
      !tabs.includes(tabToScrollTo) ||
      !this.tabsScrollerElement
    ) {
      return;
    }

    // wait for tabs to render.
    for (const tab of this.tabs) {
      await tab.updateComplete;
    }

    // Like ScrollableTabData: the tab goes to the center of the row, or as
    // close to it as the scroll range allows.
    const scroller = this.tabsScrollerElement;
    const tabRect = tabToScrollTo.getBoundingClientRect();
    const scrollerRect = scroller.getBoundingClientRect();
    const delta =
      tabRect.left +
      tabRect.width / 2 -
      (scrollerRect.left + scrollerRect.width / 2);
    const range = scroller.scrollWidth - scroller.clientWidth;
    const isRtl = getComputedStyle(this).direction === 'rtl';
    const [min, max] = isRtl ? [-range, 0] : [0, range];
    const to = Math.min(max, Math.max(min, scroller.scrollLeft + delta));
    // The first scroll, to the selected tab when the tabs appear, is not
    // animated.
    const animate = this.scrolledOnce;
    this.scrolledOnce = true;
    this.scrollTabsTo(to, animate);
  }

  private scrollTabsTo(left: number, animate: boolean) {
    const scroller = this.tabsScrollerElement;
    if (!scroller) {
      return;
    }

    const moving = this.scrollFrame !== 0;
    this.cancelScroll();
    if (
      !animate ||
      left === scroller.scrollLeft ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      scroller.scrollLeft = left;
      return;
    }

    const spring = this.scrollSpring;
    spring.spec = springFromCss(this, 'default-spatial', DEFAULT_SPATIAL);
    spring.value = scroller.scrollLeft;
    spring.velocity = moving ? spring.velocity : 0;
    spring.target = left;
    let last = performance.now();
    const step = () => {
      const now = performance.now();
      spring.step(Math.min(now - last, 50));
      last = now;
      if (spring.atRest) {
        scroller.scrollLeft = left;
        this.scrollFrame = 0;
        return;
      }
      scroller.scrollLeft = spring.value;
      this.scrollFrame = requestAnimationFrame(step);
    };
    this.scrollFrame = requestAnimationFrame(step);
  }

  // The user takes over the scroll position.
  private readonly cancelScrollListener = {
    handleEvent: () => {
      this.cancelScroll();
    },
    passive: true,
  };

  private cancelScroll() {
    if (this.scrollFrame !== 0) {
      cancelAnimationFrame(this.scrollFrame);
      this.scrollFrame = 0;
    }
  }

  protected override render() {
    return html`
      <div
        class="tabs"
        @wheel=${this.cancelScrollListener}
        @touchstart=${this.cancelScrollListener}>
        <slot
          @slotchange=${this.handleSlotChange}
          @click=${this.handleTabClick}></slot>
      </div>
      <petal-divider part="divider"></petal-divider>
    `;
  }

  private async handleTabClick(event: Event) {
    const tab = event.target;
    // Allow event to bubble
    await 0;
    if (event.defaultPrevented || !isTab(tab) || tab.active) {
      return;
    }

    this.activateTab(tab);
  }

  private activateTab(activeTab: Tab) {
    const {tabs} = this;
    const previousTab = this.activeTab;
    if (!tabs.includes(activeTab) || previousTab === activeTab) {
      // Ignore setting activeTab to a tab element that is not a child.
      return;
    }

    for (const tab of tabs) {
      tab.active = tab === activeTab;
    }

    if (previousTab) {
      // Don't dispatch a change event if activating a tab when no previous tabs
      // were selected, such as when petal-tabs auto-selects the first tab.
      const defaultPrevented = !this.dispatchEvent(
        new Event('change', {bubbles: true, cancelable: true}),
      );
      if (defaultPrevented) {
        for (const tab of tabs) {
          tab.active = tab === previousTab;
        }
        return;
      }

      activeTab[ANIMATE_INDICATOR](previousTab);
    }

    this.updateFocusableTab(activeTab);
    this.scrollToTab(activeTab);
  }

  private updateFocusableTab(focusableTab: Tab) {
    for (const tab of this.tabs) {
      tab.tabIndex = tab === focusableTab ? 0 : -1;
    }
  }

  // focus item on keydown and optionally select it
  private async handleKeydown(event: KeyboardEvent) {
    // Allow event to bubble.
    await 0;
    const isLeft = event.key === 'ArrowLeft';
    const isRight = event.key === 'ArrowRight';
    const isHome = event.key === 'Home';
    const isEnd = event.key === 'End';
    // Ignore non-navigation keys
    if (event.defaultPrevented || (!isLeft && !isRight && !isHome && !isEnd)) {
      return;
    }

    const {tabs} = this;
    // Don't try to select another tab if there aren't any.
    if (tabs.length < 2) {
      return;
    }

    // Prevent default interactions, such as scrolling.
    event.preventDefault();

    let indexToFocus: number;
    if (isHome || isEnd) {
      indexToFocus = isHome ? 0 : tabs.length - 1;
    } else {
      // Check if moving forwards or backwards
      const isRtl = getComputedStyle(this).direction === 'rtl';
      const forwards = isRtl ? isLeft : isRight;
      const {focusedTab} = this;
      if (!focusedTab) {
        // If there is not already a tab focused, select the first or last tab
        // based on the direction we're traveling.
        indexToFocus = forwards ? 0 : tabs.length - 1;
      } else {
        const focusedIndex = this.tabs.indexOf(focusedTab);
        indexToFocus = forwards ? focusedIndex + 1 : focusedIndex - 1;
        if (indexToFocus >= tabs.length) {
          // Return to start if moving past the last item.
          indexToFocus = 0;
        } else if (indexToFocus < 0) {
          // Go to end if moving before the first item.
          indexToFocus = tabs.length - 1;
        }
      }
    }

    const tabToFocus = tabs[indexToFocus];
    tabToFocus.focus();
    if (this.autoActivate) {
      this.activateTab(tabToFocus);
    } else {
      this.updateFocusableTab(tabToFocus);
    }
  }

  // scroll to item on keyup.
  private handleKeyup() {
    this.scrollToTab(this.focusedTab ?? this.activeTab);
  }

  private handleFocusout() {
    // restore focus to selected item when blurring the tab bar.
    if (this.matches(':focus-within')) {
      return;
    }

    const {activeTab} = this;
    if (activeTab) {
      this.updateFocusableTab(activeTab);
    }
  }

  private handleSlotChange() {
    const firstTab = this.tabs[0];
    if (!this.activeTab && firstTab) {
      // If the active tab was removed, auto-select the first one. There should
      // always be a selected tab while the bar has children.
      this.activateTab(firstTab);
    }

    // When children shift, ensure the active tab is visible. For example, if
    // many children are added before the active tab, it'd be pushed off screen.
    // This ensures it stays visible.
    this.scrollToTab(this.activeTab);
  }
}

function isTab(element: unknown): element is Tab {
  return element instanceof HTMLElement && element.hasAttribute('md-tab');
}
