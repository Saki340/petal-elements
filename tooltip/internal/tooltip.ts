/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import {html, isServer, LitElement} from 'lit';
import {property, state} from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';

/** Space between the anchor and the tooltip (SpacingBetweenTooltipAndAnchor). */
const SPACING = 4;

/** How long a long press shows the tooltip (BasicTooltipDefaults.TooltipDuration). */
const LONG_PRESS_SHOW_MS = 1500;

/** Touch long press before the tooltip shows: Android's long-press timeout. */
const LONG_PRESS_MS = 400;

/** The tooltip that is showing; showing another one hides it. */
let current: Tooltip | null = null;

let ids = 0;

/**
 * A Material 3 plain tooltip, after Jetpack Compose (`PlainTooltip`).
 *
 * Describes its anchor, the element with the id in `for`, or `anchor`. It
 * shows while the anchor is hovered or has keyboard focus, and for 1.5 s
 * after a touch long press. Only one tooltip shows at a time. Escape hides it.
 *
 * @fires open {Event} The tooltip was shown.
 * @fires close {Event} The tooltip was hidden.
 */
export class Tooltip extends LitElement {
  /** The id of the anchor element, in the same document or shadow root. */
  @property({reflect: true}) for = '';

  /** Whether the tooltip is showing. */
  @state() private open = false;
  @state() private closing = false;

  private anchorElement: HTMLElement | null = null;
  private pressTimer?: ReturnType<typeof setTimeout>;
  private hideTimer?: ReturnType<typeof setTimeout>;
  private pointerFocus = false;

  /** The anchor element. Set it to use an element instead of `for`. */
  get anchor(): HTMLElement | null {
    if (this.anchorElement) return this.anchorElement;
    if (!this.for || isServer) return null;
    const root = this.getRootNode() as Document | ShadowRoot;
    return root.getElementById?.(this.for) ?? null;
  }

  /** The anchor element. Set it to use an element instead of `for`. */
  set anchor(element: HTMLElement | null) {
    this.detach();
    this.anchorElement = element;
    if (this.isConnected) this.attach();
  }

  private attached: HTMLElement | null = null;

  override connectedCallback() {
    super.connectedCallback();
    if (isServer) return;
    if (!this.id) this.id = `petal-tooltip-${++ids}`;
    this.setAttribute('role', 'tooltip');
    this.setAttribute('popover', 'manual');
    // Wait for the anchor, which may come later in the document.
    queueMicrotask(() => this.attach());
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.detach();
    this.hide();
  }

  protected override updated(changed: Map<string, unknown>) {
    if (changed.has('for')) {
      this.detach();
      this.attach();
    }
  }

  /** Shows the tooltip next to its anchor. */
  show() {
    const anchor = this.anchor;
    if (!anchor || !this.isConnected) return;
    clearTimeout(this.hideTimer);
    if (current && current !== this) current.hide();
    current = this;
    if (!this.open) {
      this.showPopover?.();
      this.open = true;
      this.closing = false;
      this.dispatchEvent(new Event('open'));
      document.addEventListener('keydown', this.onKeydown);
    }
    this.position(anchor);
  }

  /** Hides the tooltip. */
  hide() {
    clearTimeout(this.pressTimer);
    clearTimeout(this.hideTimer);
    if (current === this) current = null;
    if (!this.open) return;
    this.open = false;
    this.closing = true;
    document.removeEventListener('keydown', this.onKeydown);
    this.dispatchEvent(new Event('close'));
  }

  protected override render() {
    return html`<div
      class="tooltip ${classMap({closing: this.closing})}"
      @animationend=${this.onAnimationEnd}>
      <slot></slot>
    </div>`;
  }

  /**
   * Above the anchor, centered; below it when there is no room above
   * (Compose's plain tooltip position provider). Kept inside the viewport.
   */
  private position(anchor: HTMLElement) {
    const box = anchor.getBoundingClientRect();
    const width = this.offsetWidth;
    const height = this.offsetHeight;
    let left = box.left + (box.width - width) / 2;
    left = Math.max(0, Math.min(left, document.documentElement.clientWidth - width));
    let top = box.top - height - SPACING;
    const below = top < 0;
    if (below) top = box.bottom + SPACING;
    this.style.left = `${left}px`;
    this.style.top = `${top}px`;
    this.style.setProperty('--_origin', below ? 'center top' : 'center bottom');
  }

  private attach() {
    const anchor = this.anchor;
    if (!anchor || anchor === this.attached) return;
    this.attached = anchor;
    anchor.addEventListener('pointerenter', this.onPointerEnter);
    anchor.addEventListener('pointerleave', this.onPointerLeave);
    anchor.addEventListener('pointerdown', this.onPointerDown);
    anchor.addEventListener('pointerup', this.onPointerUp);
    anchor.addEventListener('pointercancel', this.onPointerUp);
    anchor.addEventListener('focusin', this.onFocusIn);
    anchor.addEventListener('focusout', this.onFocusOut);
    const described = anchor.getAttribute('aria-describedby')?.split(/\s+/) ?? [];
    if (!described.includes(this.id)) {
      anchor.setAttribute('aria-describedby', [...described, this.id].join(' ').trim());
    }
  }

  private detach() {
    const anchor = this.attached;
    if (!anchor) return;
    this.attached = null;
    anchor.removeEventListener('pointerenter', this.onPointerEnter);
    anchor.removeEventListener('pointerleave', this.onPointerLeave);
    anchor.removeEventListener('pointerdown', this.onPointerDown);
    anchor.removeEventListener('pointerup', this.onPointerUp);
    anchor.removeEventListener('pointercancel', this.onPointerUp);
    anchor.removeEventListener('focusin', this.onFocusIn);
    anchor.removeEventListener('focusout', this.onFocusOut);
    const described = (anchor.getAttribute('aria-describedby') ?? '')
      .split(/\s+/)
      .filter((id) => id && id !== this.id);
    if (described.length) anchor.setAttribute('aria-describedby', described.join(' '));
    else anchor.removeAttribute('aria-describedby');
  }

  // Hover with a mouse or pen shows the tooltip until the pointer leaves.
  private readonly onPointerEnter = (event: PointerEvent) => {
    if (event.pointerType !== 'touch') this.show();
  };

  private readonly onPointerLeave = (event: PointerEvent) => {
    if (event.pointerType !== 'touch') this.hide();
  };

  // A touch long press shows it for LONG_PRESS_SHOW_MS.
  private readonly onPointerDown = (event: PointerEvent) => {
    this.pointerFocus = true;
    if (event.pointerType !== 'touch') return;
    clearTimeout(this.pressTimer);
    this.pressTimer = setTimeout(() => {
      this.show();
      this.hideTimer = setTimeout(() => this.hide(), LONG_PRESS_SHOW_MS);
    }, LONG_PRESS_MS);
  };

  private readonly onPointerUp = () => {
    clearTimeout(this.pressTimer);
  };

  // Keyboard focus shows it; focus from a click or tap does not.
  private readonly onFocusIn = () => {
    if (!this.pointerFocus) this.show();
    this.pointerFocus = false;
  };

  private readonly onFocusOut = () => {
    this.pointerFocus = false;
    this.hide();
  };

  private readonly onKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') this.hide();
  };

  private onAnimationEnd() {
    if (!this.closing) return;
    const running = this.shadowRoot
      ?.querySelector('.tooltip')
      ?.getAnimations()
      .some((animation) => animation.playState === 'running');
    if (running) return;
    this.closing = false;
    if (!this.open) this.hidePopover?.();
  }
}
