/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import '../../focus/md-focus-ring.js';
import '../../iconbutton/icon-button.js';

import {html, isServer, LitElement, nothing, PropertyValues} from 'lit';
import {property, query, state} from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';
import {live} from 'lit/directives/live.js';

import {ARIAMixinStrict} from '../../internal/aria/aria.js';
import {mixinDelegatesAria} from '../../internal/aria/delegate.js';
import {redispatchEvent} from '../../internal/events/redispatch-event.js';
import {
  DEFAULT_SPATIAL,
  SLOW_SPATIAL,
  springEasing,
  springFromCss,
} from '../../internal/motion/spring.js';
import {mixinElementInternals} from '../../behaviors/element-internals.js';
import {getFormValue, mixinFormAssociated} from '../../behaviors/form-associated.js';

/**
 * How the search bar opens: `full-screen` covers the window, as Compose's
 * `ExpandedFullScreenSearchBar`; `docked` is a dropdown under the bar, as
 * `ExpandedDockedSearchBar`.
 */
export type SearchBarLayout = 'full-screen' | 'docked';

/** SearchBarVerticalPadding: 8dp above and below the input field in the view. */
const VIEW_PADDING_TOP = 'calc(8px + env(safe-area-inset-top, 0px))';
const VIEW_PADDING_BOTTOM = '8px';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Base class: form associated (`name`, `disabled`) and `aria-label` goes to
// the input.
const searchBarBaseClass = mixinDelegatesAria(
  mixinFormAssociated(mixinElementInternals(LitElement)),
);

/** A length in px, or undefined for anything else (a percentage, ...). */
function pixels(value: string) {
  value = value.trim();
  return value.endsWith('px') ? parseFloat(value) : undefined;
}

/** The geometry of the view when a transition starts. */
interface Start {
  hadFocus: boolean;
  wasShown: boolean;
  rect: DOMRect;
  radius: number;
  headerTop: number;
  headerBottom: number;
  contentOpacity: number;
}

/**
 * A Material 3 search bar, after Jetpack Compose (`SearchBar`,
 * `ExpandedFullScreenSearchBar`, `ExpandedDockedSearchBar`).
 *
 * The collapsed bar has a leading icon (`leading` slot, a search icon by
 * default), the input and a trailing slot (`trailing`, for an avatar). It
 * expands into a search view when it is clicked, typed in or the down arrow is
 * pressed, or by `expand()` or the `expanded` attribute. The results go in the
 * default slot; any elements will do, `petal-list` with
 * `petal-list-item type="button"` suits suggestions.
 *
 * The view collapses with `collapse()`, Escape, the back button, and, when
 * docked, a click outside. Focus moves to the input when the view opens and
 * back to the input when it closes.
 *
 * Accessibility: the input is a `combobox` whose `aria-expanded` follows the
 * view and whose `aria-controls` points to the results. The results are a
 * labelled region (`results-label`), not a `listbox`: the bar does not manage
 * an active descendant. The down arrow moves focus into the results, where
 * `petal-list` handles the arrow keys.
 *
 * @fires input {InputEvent} The native `input` event on the input
 * --bubbles --composed
 * @fires change {Event} The native `change` event on the input --bubbles
 * @fires search {Event} The Enter key was pressed in the input. Read `value`.
 * --bubbles --composed
 * @fires open {Event} The view started to open.
 * @fires close {Event} The view started to close.
 *
 * @slot - The suggestions or results shown in the open view, for example a
 *     `petal-list`.
 * @slot leading - Replaces the search icon of the closed bar, for example a menu
 *     button.
 * @slot trailing - An element at the end, such as an avatar image (30px, round).
 */
export class SearchBar extends searchBarBaseClass {
  /** The text in the input. */
  @property() value = '';

  /** The placeholder of the input, which is also its accessible name. */
  @property() placeholder = '';

  /**
   * Whether the search view is open. Use `expand()` and `collapse()` to wait
   * for the animation.
   */
  @property({type: Boolean, reflect: true}) expanded = false;

  /**
   * `full-screen` (the default, for phones) or `docked` (a dropdown under the
   * bar, for tablets and desktops).
   */
  @property({reflect: true}) layout: SearchBarLayout = 'full-screen';

  /**
   * The input's `autocomplete`. `off` by default, so the browser's own
   * suggestions do not cover yours.
   */
  @property() autocomplete = 'off';

  /** Accessible name of the region that holds the results. */
  @property({attribute: 'results-label'}) resultsLabel = 'Search suggestions';

  /** Accessible label of the button that closes the view. */
  @property({attribute: 'back-label'}) backLabel = 'Back';

  /** Accessible label of the button that clears the input. */
  @property({attribute: 'clear-label'}) clearLabel = 'Clear';

  // Writable mixin properties for lit-html binding.
  declare disabled: boolean;
  declare name: string;

  /** The container is the view, open or moving to or from it. */
  @state() private shown = false;
  @state() private hasTrailingSlot = false;

  @query('.container') private readonly container!: HTMLElement | null;
  @query('.header') private readonly header!: HTMLElement | null;
  @query('.content') private readonly content!: HTMLElement | null;
  @query('.input') private readonly input!: HTMLInputElement | null;
  @query('.results slot') private readonly resultsSlot!: HTMLSlotElement | null;

  private start?: Start;
  private transitionId = 0;
  private animations: Animation[] = [];
  private transitionDone: Promise<void> = Promise.resolve();

  override connectedCallback() {
    super.connectedCallback();
    if (!isServer) document.addEventListener('pointerdown', this.onDocumentPointerDown, true);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('pointerdown', this.onDocumentPointerDown, true);
  }

  /**
   * Opens the search view. Resolves when the animation has finished. Does
   * nothing when disabled.
   */
  expand(): Promise<void> {
    if (this.disabled) return Promise.resolve();
    this.expanded = true;
    return this.settled();
  }

  /** Closes the search view. Resolves when the animation has finished. */
  collapse(): Promise<void> {
    this.expanded = false;
    return this.settled();
  }

  override focus(options?: FocusOptions) {
    this.input?.focus(options);
  }

  override blur() {
    this.input?.blur();
  }

  private async settled() {
    await this.updateComplete;
    await this.transitionDone;
  }

  protected override render() {
    const showClear = this.expanded && this.value !== '';
    const classes = {
      'shown': this.shown,
      'expanded': this.expanded,
      'has-trailing': this.hasTrailingSlot || showClear,
    };
    const ariaLabel = (this as ARIAMixinStrict).ariaLabel || this.placeholder || 'Search';
    return html`
      <div
        class="container ${classMap(classes)}"
        part="container"
        popover=${this.inTopLayer ? 'manual' : nothing}
        @click=${this.onContainerClick}
        @keydown=${this.onKeydown}>
        <petal-focus-ring
          part="focus-ring"
          for="input"
          inward></petal-focus-ring>
        <div class="header" part="header">
          <div class="leading" part="leading">
            ${this.expanded
              ? html`<petal-icon-button
                  class="icon-button back"
                  aria-label=${this.backLabel}
                  @click=${() => this.collapse()}>
                  <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                  </svg>
                </petal-icon-button>`
              : html`<slot name="leading">
                  <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                  </svg>
                </slot>`}
          </div>
          <input
            id="input"
            class="input"
            part="input"
            type="search"
            role="combobox"
            aria-expanded=${this.expanded ? 'true' : 'false'}
            aria-controls="results"
            aria-autocomplete="list"
            aria-label=${ariaLabel}
            autocomplete=${this.autocomplete || nothing}
            enterkeyhint=${this.enterKeyHint || 'search'}
            name=${this.name || nothing}
            placeholder=${this.placeholder || nothing}
            ?disabled=${this.disabled}
            .value=${live(this.value)}
            @input=${this.onInput}
            @change=${this.onChange} />
          <div
            class="trailing ${classMap({'has-content': classes['has-trailing']})}"
            part="trailing">
            ${showClear
              ? html`<petal-icon-button
                  class="icon-button clear"
                  aria-label=${this.clearLabel}
                  @click=${this.onClear}>
                  <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M6.4 19 5 17.6 10.6 12 5 6.4 6.4 5 12 10.6 17.6 5 19 6.4 13.4 12 19 17.6 17.6 19 12 13.4Z" />
                  </svg>
                </petal-icon-button>`
              : nothing}
            <slot name="trailing" @slotchange=${this.onTrailingSlotChange}></slot>
          </div>
        </div>
        <div
          id="results"
          class="content"
          part="content"
          role="region"
          aria-label=${this.resultsLabel}
          ?inert=${!this.expanded}>
          <div class="divider" part="divider"></div>
          <div class="results"><slot></slot></div>
        </div>
      </div>
    `;
  }

  protected override willUpdate(changed: PropertyValues<this>) {
    if (!changed.has('expanded')) return;
    if (!this.hasUpdated) {
      this.shown = this.expanded;
      return;
    }
    // Before the DOM changes: where the view is now, so a transition that
    // interrupts another one continues from there.
    this.start = this.measure();
    if (this.expanded) this.shown = true;
  }

  /**
   * The full screen view is a manual popover while it is shown, so it is in
   * the top layer: over everything else on the page (also a docked search
   * bar after it) and not inside a transformed ancestor.
   */
  private get inTopLayer() {
    return this.shown && this.layout === 'full-screen';
  }

  protected override updated(changed: PropertyValues<this>) {
    const container = this.container;
    if (this.inTopLayer && container && !container.matches(':popover-open')) {
      container.showPopover();
    }
    if (!changed.has('expanded') || !this.start) return;
    const start = this.start;
    this.start = undefined;
    this.transitionDone = this.transition(start);
    this.dispatchEvent(new Event(this.expanded ? 'open' : 'close'));
    if (this.expanded || start.hadFocus) this.input?.focus({preventScroll: true});
  }

  private measure(): Start {
    const container = this.container;
    const header = this.header;
    const content = this.content;
    const rect = container?.getBoundingClientRect() ?? new DOMRect();
    const wasShown = this.shown;
    const cssPx = (value?: string) => parseFloat(value ?? '') || 0;
    const containerStyle = container && getComputedStyle(container);
    const headerStyle = header && getComputedStyle(header);
    return {
      hadFocus: this.matches(':focus-within'),
      wasShown,
      rect,
      radius: Math.min(cssPx(containerStyle?.borderTopLeftRadius), rect.height / 2),
      headerTop: cssPx(headerStyle?.marginTop),
      headerBottom: cssPx(headerStyle?.marginBottom),
      contentOpacity: wasShown && content ? cssPx(getComputedStyle(content).opacity) : 0,
    };
  }

  /**
   * Animates the container between the bar and the view, on the springs of
   * `rememberSearchBarState`: the slow spatial spring to expand, the default
   * spatial spring to collapse.
   */
  private async transition(start: Start) {
    const id = ++this.transitionId;
    const container = this.container;
    this.cancelAnimations();
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (container && !reduced) {
      const spring = this.expanded
        ? springFromCss(this, 'slow-spatial', SLOW_SPATIAL)
        : springFromCss(this, 'default-spatial', DEFAULT_SPATIAL);
      const timing = {...springEasing(spring), fill: 'both'} as KeyframeAnimationOptions;
      if (this.layout === 'docked') {
        this.animateDocked(container, start, timing);
      } else {
        this.animateFullScreen(container, start, timing);
      }
    }

    await Promise.allSettled(this.animations.map((animation) => animation.finished));
    if (id !== this.transitionId) return;
    if (!this.expanded) {
      this.shown = false;
      await this.updateComplete;
    }
    this.cancelAnimations();
  }

  private cancelAnimations() {
    for (const animation of this.animations) animation.cancel();
    this.animations = [];
  }

  /**
   * ExpandedFullScreenSearchBar: the surface goes from the bar's bounds to the
   * window's, its corner radius from half the bar's height to the full screen
   * shape, the input field's padding above and below from 0 to
   * `SearchBarVerticalPadding`, and the results fade in with the same spring.
   */
  private animateFullScreen(
    container: HTMLElement,
    start: Start,
    timing: KeyframeAnimationOptions,
  ) {
    const doc = document.documentElement;
    const toInsets = (rect: DOMRect) => ({
      top: rect.top,
      left: rect.left,
      right: doc.clientWidth - rect.right,
      bottom: doc.clientHeight - rect.bottom,
    });
    const hostRect = this.getBoundingClientRect();
    const from = toInsets(start.rect);
    const to = this.expanded ? {top: 0, left: 0, right: 0, bottom: 0} : toInsets(hostRect);
    const hostStyle = getComputedStyle(this);
    // SearchBarCornerRadius is InputFieldHeight / 2; a larger shape (the
    // `full` corner) is the same.
    const barRadius = Math.min(
      pixels(hostStyle.getPropertyValue('--_bar-container-shape')) ?? Infinity,
      hostRect.height / 2,
    );
    const viewRadius =
      pixels(hostStyle.getPropertyValue('--_view-full-screen-container-shape')) ?? 0;
    const radius = this.expanded
      ? [`${start.wasShown ? start.radius : barRadius}px`, `${viewRadius}px`]
      : [`${start.radius}px`, `${barRadius}px`];
    const px = (a: number, b: number) => [`${a}px`, `${b}px`];
    this.run(container, {
      top: px(from.top, to.top),
      left: px(from.left, to.left),
      right: px(from.right, to.right),
      bottom: px(from.bottom, to.bottom),
      borderRadius: radius,
    }, timing);
    this.run(this.header, {
      marginTop: [`${start.headerTop}px`, this.expanded ? VIEW_PADDING_TOP : '0px'],
      marginBottom: [`${start.headerBottom}px`, this.expanded ? VIEW_PADDING_BOTTOM : '0px'],
    }, timing);
    this.run(this.content, {opacity: [start.contentOpacity, this.expanded ? 1 : 0]}, timing);
  }

  /**
   * ExpandedDockedSearchBar: the surface keeps the bar's width and grows
   * downward to the height its results need, between
   * `DockedExpandedTableMinHeight` and 2/3 of the window height.
   */
  private animateDocked(container: HTMLElement, start: Start, timing: KeyframeAnimationOptions) {
    const from = `${start.rect.height}px`;
    const style = getComputedStyle(container);
    const barHeight = `${this.getBoundingClientRect().height}px`;
    this.run(container, {
      minHeight: [from, this.expanded ? style.minHeight : barHeight],
      maxHeight: [from, this.expanded ? style.maxHeight : barHeight],
    }, timing);
  }

  private run(
    element: HTMLElement | null,
    keyframes: PropertyIndexedKeyframes,
    timing: KeyframeAnimationOptions,
  ) {
    if (element) this.animations.push(element.animate(keyframes, timing));
  }

  private onContainerClick(event: Event) {
    if (this.expanded || this.disabled) return;
    // Only clicks on the bar itself, not on slotted content such as an avatar
    // button.
    const origin = event.composedPath()[0] as Node;
    if (origin.getRootNode() !== this.shadowRoot) return;
    this.expand();
  }

  private onDocumentPointerDown = (event: Event) => {
    if (!this.expanded || this.layout !== 'docked') return;
    if (!event.composedPath().includes(this)) this.collapse();
  };

  private onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && this.expanded) {
      // Also keeps the browser from clearing the search input.
      event.preventDefault();
      event.stopPropagation();
      this.collapse();
      return;
    }
    if (event.composedPath()[0] !== this.input) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (this.expanded) this.focusResults();
      else this.expand();
    } else if (event.key === 'Enter' && !event.isComposing) {
      this.dispatchEvent(new Event('search', {bubbles: true, composed: true}));
    }
  }

  private onInput(event: Event) {
    this.value = (event.target as HTMLInputElement).value;
    // Typing opens the view, as Compose's InputField does.
    if (!this.expanded) this.expand();
  }

  private onChange(event: Event) {
    redispatchEvent(this, event);
  }

  private onClear() {
    const input = this.input;
    if (!input) return;
    input.value = '';
    input.dispatchEvent(
      new InputEvent('input', {bubbles: true, composed: true, inputType: 'deleteContentBackward'}),
    );
    this.dispatchEvent(new Event('change', {bubbles: true}));
    input.focus({preventScroll: true});
  }

  private onTrailingSlotChange(event: Event) {
    this.hasTrailingSlot = (event.target as HTMLSlotElement).assignedElements().length > 0;
  }

  /** Moves focus from the input to the first result you can focus. */
  private focusResults() {
    const elements = (this.resultsSlot?.assignedElements({flatten: true}) ?? []) as HTMLElement[];
    for (const element of elements) {
      // A petal-list: its first enabled item.
      const items = (element as {items?: Array<HTMLElement & {disabled?: boolean}>}).items;
      const item = Array.isArray(items) ? items.find((i) => !i.disabled) : undefined;
      const inside = element.matches(FOCUSABLE)
        ? element
        : element.querySelector<HTMLElement>(FOCUSABLE);
      const target = item ?? inside;
      if (target) {
        target.focus();
        return;
      }
    }
  }

  override [getFormValue]() {
    return this.value;
  }

  override formResetCallback() {
    this.value = '';
  }

  override formStateRestoreCallback(state: string) {
    this.value = state;
  }
}
