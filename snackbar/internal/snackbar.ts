/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import '../../button/text-button.js';
import '../../elevation/elevation.js';
import '../../iconbutton/icon-button.js';

import {html, isServer, LitElement, nothing, PropertyValues} from 'lit';
import {property, query} from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';

/**
 * How long a snackbar stays open, as Compose's `SnackbarDuration`: `short`
 * 4 s, `long` 10 s, `indefinite` until it is closed.
 */
export type SnackbarDuration = 'short' | 'long' | 'indefinite';

/** Why a snackbar closed. */
export type SnackbarCloseReason = 'timeout' | 'action' | 'dismiss' | 'close';

const DURATION_MS: Record<SnackbarDuration, number> = {
  short: 4000,
  long: 10000,
  indefinite: Infinity,
};

/**
 * A Material 3 snackbar, after Jetpack Compose (`Snackbar`, `SnackbarHost`).
 *
 * The message goes in the default slot. `action` adds a text button, and
 * `dismissible` a close button. Show it with `show()` or the `open`
 * attribute; it closes by itself after `duration`.
 *
 * @fires open {Event} The snackbar opened.
 * @fires close {CustomEvent<{reason: SnackbarCloseReason}>} The snackbar is
 * closing: `timeout`, `action` (the action button was clicked), `dismiss`
 * (the close button) or `close` (`close()` was called).
 * @fires action {Event} The action button was clicked. Cancel it to keep the
 * snackbar open.
 */
export class Snackbar extends LitElement {
  /** Whether the snackbar is shown. */
  @property({type: Boolean, reflect: true}) open = false;

  /** Label of the action button; no button when empty. */
  @property() action = '';

  /** Shows a close button. */
  @property({type: Boolean}) dismissible = false;

  /** Accessible label of the close button. */
  @property({attribute: 'dismiss-label'}) dismissLabel = 'Dismiss';

  /**
   * How long the snackbar stays open. Defaults to `short`, or `indefinite`
   * with an action, like Compose's `SnackbarHostState.showSnackbar`.
   */
  @property() duration?: SnackbarDuration;

  /** Places the action below the message, for long action labels. */
  @property({type: Boolean, attribute: 'action-on-new-line'})
  actionOnNewLine = false;

  @query('.snackbar') private readonly container!: HTMLElement | null;

  private timer?: ReturnType<typeof setTimeout>;
  private closing = false;
  private closedByMethod = false;
  private result?: Promise<SnackbarCloseReason>;
  private closed?: (reason: SnackbarCloseReason) => void;

  override connectedCallback() {
    super.connectedCallback();
    // Announced politely, like Compose's live region.
    if (!this.hasAttribute('role')) this.setAttribute('role', 'status');
    if (!this.hasAttribute('aria-live')) this.setAttribute('aria-live', 'polite');
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    clearTimeout(this.timer);
  }

  /**
   * Shows the snackbar. Resolves with the close reason when it closes. If it
   * is already open, its timer starts again.
   */
  show(): Promise<SnackbarCloseReason> {
    if (!this.result) {
      this.result = new Promise<SnackbarCloseReason>((resolve) => {
        this.closed = resolve;
      });
    }
    this.open = true;
    this.startTimer();
    return this.result;
  }

  /** Closes the snackbar. */
  close(reason: SnackbarCloseReason = 'close') {
    if (!this.open) return;
    this.open = false;
    this.closedByMethod = true;
    this.finishClose(reason);
  }

  private finishClose(reason: SnackbarCloseReason) {
    clearTimeout(this.timer);
    this.timer = undefined;
    this.dispatchEvent(new CustomEvent('close', {detail: {reason}}));
    this.closed?.(reason);
    this.closed = undefined;
    this.result = undefined;
  }

  protected override render() {
    const classes = {
      'closing': this.closing,
      'has-dismiss': this.dismissible,
      'new-line': this.actionOnNewLine && !!this.action,
    };
    return html`
      <div class="snackbar ${classMap(classes)}" @animationend=${this.onAnimationEnd}>
        <petal-elevation part="elevation"></petal-elevation>
        <div class="label"><slot></slot></div>
        ${this.action || this.dismissible
          ? html`<div class="actions">
              ${this.action
                ? html`<petal-text-button class="action" @click=${this.onAction}
                    >${this.action}</petal-text-button
                  >`
                : nothing}
              ${this.dismissible
                ? html`<petal-icon-button
                    class="dismiss"
                    aria-label=${this.dismissLabel}
                    @click=${() => this.close('dismiss')}>
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        d="M6.4 19 5 17.6 10.6 12 5 6.4 6.4 5 12 10.6 17.6 5 19 6.4 13.4 12 19 17.6 17.6 19 12 13.4Z" />
                    </svg>
                  </petal-icon-button>`
                : nothing}
            </div>`
          : nothing}
      </div>
    `;
  }

  protected override willUpdate(changed: PropertyValues<this>) {
    if (!changed.has('open')) return;
    // Opening cancels an exit animation; closing starts one.
    this.closing = !this.open && changed.get('open') === true;
  }

  protected override updated(changed: PropertyValues<this>) {
    if (!changed.has('open') || isServer) return;
    const wasOpen = changed.get('open') === true;
    if (this.open) {
      this.startTimer();
      if (changed.get('open') === false) this.dispatchEvent(new Event('open'));
    } else if (wasOpen && !this.closedByMethod) {
      // `open` was removed from outside.
      this.finishClose('close');
    }
    this.closedByMethod = false;
  }

  private startTimer() {
    clearTimeout(this.timer);
    const duration = this.duration ?? (this.action ? 'indefinite' : 'short');
    const ms = DURATION_MS[duration];
    if (ms !== Infinity) this.timer = setTimeout(() => this.close('timeout'), ms);
  }

  private onAction(event: Event) {
    event.stopPropagation();
    const action = new Event('action', {cancelable: true});
    if (this.dispatchEvent(action)) this.close('action');
  }

  private onAnimationEnd() {
    const running = this.container
      ?.getAnimations()
      .some((animation) => animation.playState === 'running');
    if (this.closing && !this.open && !running) {
      this.closing = false;
      this.requestUpdate();
    }
  }
}
