/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import '../../elevation/elevation.js';

import {html, isServer, nothing} from 'lit';
import {property, state} from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';

import {Tooltip} from './tooltip.js';

/** Space between the anchor and the tooltip (SpacingBetweenTooltipAndAnchor). */
const SPACING = 4;

/** TooltipDefaults.caretSize: 16 by 8dp. */
const CARET_WIDTH = 16;

/** How long the pointer may take to move from the anchor onto the tooltip. */
const LEAVE_DELAY = 150;

/**
 * A Material 3 rich tooltip, after Jetpack Compose (`RichTooltip` and
 * `TooltipDefaults` in Tooltip.kt, `RichTooltipTokens`): a title, supporting
 * text and an action, in a card next to its anchor.
 *
 * It shows like a plain tooltip (hover, keyboard focus, touch long press, or
 * `show()`). A `persistent` tooltip stays until something outside it is
 * pressed, Escape is pressed, or `hide()` is called, so its action can be
 * reached; give it one when it has an action.
 *
 * @fires open {Event} The tooltip was shown.
 * @fires close {Event} The tooltip was hidden.
 */
export class RichTooltip extends Tooltip {
  /** Keeps the tooltip shown until it is dismissed (Compose's `isPersistent`). */
  @property({type: Boolean, reflect: true}) persistent = false;

  /** Draws a caret pointing at the anchor (TooltipDefaults.caretShape()). */
  @property({type: Boolean, reflect: true}) caret = false;

  @state() private hasTitle = false;
  @state() private hasAction = false;
  @state() private below = false;

  private leaveTimer?: number;

  protected override get hidesOnLeave() {
    return !this.persistent;
  }

  override connectedCallback() {
    super.connectedCallback();
    if (isServer) return;
    this.addEventListener('pointerenter', this.onTooltipEnter);
    this.addEventListener('pointerleave', this.onTooltipLeave);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('pointerenter', this.onTooltipEnter);
    this.removeEventListener('pointerleave', this.onTooltipLeave);
    document.removeEventListener('pointerdown', this.onDocumentPointerDown, true);
  }

  protected override updated(changed: Map<string, unknown>) {
    super.updated(changed);
    // An interactive, persistent tooltip is a non-modal dialog; a tooltip
    // cannot hold controls.
    if (changed.has('persistent')) {
      this.setAttribute('role', this.persistent ? 'dialog' : 'tooltip');
    }
  }

  protected override render() {
    const classes = {
      closing: this.closing,
      'has-title': this.hasTitle,
      'has-action': this.hasAction,
      below: this.below,
    };
    return html`<div class="tooltip ${classMap(classes)}" @animationend=${this.onAnimationEnd}>
      <petal-elevation part="elevation"></petal-elevation>
      <div class="content">
        <div class="title" ?hidden=${!this.hasTitle}
          ><span class="strut"></span
          ><span class="lines"><span class="flow"><slot name="title" @slotchange=${this.handleTitleChange}></slot></span></span
        ></div>
        <div class="text"
          ><span class="strut"></span><span class="lines"><span class="flow"><slot></slot></span></span
        ></div>
        <div class="action" ?hidden=${!this.hasAction}>
          <slot name="action" @slotchange=${this.handleActionChange} @click=${this.handleActionClick}></slot>
        </div>
      </div>
      ${this.caret ? html`<span class="caret" aria-hidden="true"></span>` : nothing}
    </div>`;
  }

  private handleTitleChange(event: Event) {
    this.hasTitle = (event.target as HTMLSlotElement).assignedNodes({flatten: true}).length > 0;
  }

  private handleActionChange(event: Event) {
    this.hasAction = (event.target as HTMLSlotElement).assignedElements({flatten: true}).length > 0;
  }

  // An action dismisses the tooltip, as in Compose's samples.
  private handleActionClick() {
    this.hide();
  }

  /**
   * TooltipPositionProviderImpl with TooltipAnchorPosition.Above: centered on
   * the anchor, else aligned with its start or end at the viewport's edges;
   * above it, else below.
   */
  protected override position(anchor: HTMLElement) {
    const box = anchor.getBoundingClientRect();
    const width = this.offsetWidth;
    const height = this.offsetHeight;
    const viewport = document.documentElement.clientWidth;
    let left = box.left + (box.width - width) / 2;
    if (left < 0) left = box.left;
    else if (left + width > viewport) left = box.right - width;
    left = Math.max(0, Math.min(left, viewport - width));
    const caret = this.caret ? CARET_WIDTH / 2 : 0;
    let top = box.top - height - SPACING - caret;
    const below = top < 0;
    if (below) top = box.bottom + SPACING + caret;
    this.style.left = `${left}px`;
    this.style.top = `${top}px`;
    this.style.setProperty('--_origin', below ? 'center top' : 'center bottom');
    // The caret points at the anchor's middle, kept off the rounded corners.
    const caretX = Math.max(16, Math.min(width - 16, box.left + box.width / 2 - left));
    this.style.setProperty('--_caret-x', `${caretX}px`);
    this.below = below;
  }

  protected override opened() {
    if (this.persistent) {
      document.addEventListener('pointerdown', this.onDocumentPointerDown, true);
    }
  }

  protected override closed() {
    clearTimeout(this.leaveTimer);
    document.removeEventListener('pointerdown', this.onDocumentPointerDown, true);
  }

  // The pointer can cross from the anchor onto the tooltip.
  protected override leave() {
    clearTimeout(this.leaveTimer);
    this.leaveTimer = window.setTimeout(() => this.hide(), LEAVE_DELAY);
  }

  private readonly onTooltipEnter = () => {
    clearTimeout(this.leaveTimer);
  };

  private readonly onTooltipLeave = (event: PointerEvent) => {
    if (event.pointerType !== 'touch' && this.hidesOnLeave) this.leave();
  };

  // A persistent tooltip goes when something outside it is pressed
  // (the popup's onDismissRequest).
  private readonly onDocumentPointerDown = (event: PointerEvent) => {
    const path = event.composedPath();
    if (path.includes(this) || (this.anchor && path.includes(this.anchor))) return;
    this.hide();
  };
}
