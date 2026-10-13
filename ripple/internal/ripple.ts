/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import {html, isServer, LitElement, PropertyValues} from 'lit';
import {property, query, state} from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';

import {
  Attachable,
  AttachableController,
} from '../../internal/controller/attachable-controller.js';
import {EASING} from '../../internal/motion/animation.js';

// The press ripple, as on the original cny-jpy-rate site: each press adds a
// circle twice the element's diagonal, centered on the pointer, that grows
// from 20% to full size in 450ms and fades out in 150ms when released, still
// growing. Waves of quick presses overlap. No ripple with reduced motion.
const PRESS_GROW_MS = 450;
const RELEASE_FADE_MS = 150;
const INITIAL_ORIGIN_SCALE = 0.2;
const ANIMATION_FILL = 'forwards';

/**
 * Interaction states for the ripple: `INACTIVE -> WAITING_FOR_CLICK ->
 * INACTIVE`. The ripple starts on pointer down and fades out on click,
 * pointer cancel or when the pointer leaves.
 */
enum State {
  /** No press in progress. */
  INACTIVE,
  /** Pressed; the ripple fades out on click. */
  WAITING_FOR_CLICK,
}

/**
 * Events that the ripple listens to.
 */
const EVENTS = [
  'click',
  'contextmenu',
  'pointercancel',
  'pointerdown',
  'pointerenter',
  'pointerleave',
  'pointerup',
];

/**
 * Used to detect if HCM is active. Events do not process during HCM when the
 * ripple is not displayed.
 */
const FORCED_COLORS = isServer
  ? null
  : window.matchMedia('(forced-colors: active)');

/**
 * A ripple component.
 */
export class Ripple extends LitElement implements Attachable {
  /**
   * Disables the ripple.
   */
  @property({type: Boolean, reflect: true}) disabled = false;

  get htmlFor() {
    return this.attachableController.htmlFor;
  }

  set htmlFor(htmlFor: string | null) {
    this.attachableController.htmlFor = htmlFor;
  }

  get control() {
    return this.attachableController.control;
  }
  set control(control: HTMLElement | null) {
    this.attachableController.control = control;
  }

  @state() private hovered = false;
  @state() private pressed = false;

  @query('.surface') private readonly mdRoot!: HTMLElement | null;
  private rippleSize = '';
  private initialSize = 0;
  /** The wave of the current press. */
  private wave?: HTMLElement;
  private state = State.INACTIVE;
  private rippleStartEvent?: PointerEvent;
  private readonly attachableController = new AttachableController(
    this,
    this.onControlChange.bind(this),
  );

  attach(control: HTMLElement) {
    this.attachableController.attach(control);
  }

  detach() {
    this.attachableController.detach();
  }

  override connectedCallback() {
    super.connectedCallback();
    // Needed for VoiceOver, which will create a "group" if the element is a
    // sibling to other content.
    this.setAttribute('aria-hidden', 'true');
  }

  protected override render() {
    const classes = {
      'hovered': this.hovered,
      'pressed': this.pressed,
    };

    return html`<div class="surface ${classMap(classes)}"></div>`;
  }

  protected override update(changedProps: PropertyValues<Ripple>) {
    if (changedProps.has('disabled') && this.disabled) {
      this.hovered = false;
      this.pressed = false;
    }
    super.update(changedProps);
  }

  /**
   * TODO(b/269799771): make private
   * @private only public for slider
   */
  handlePointerenter(event: PointerEvent) {
    if (!this.shouldReactToEvent(event)) {
      return;
    }

    this.hovered = true;
  }

  /**
   * TODO(b/269799771): make private
   * @private only public for slider
   */
  handlePointerleave(event: PointerEvent) {
    if (!this.shouldReactToEvent(event)) {
      return;
    }

    this.hovered = false;

    // release a held mouse or pen press that moves outside the element
    if (this.state !== State.INACTIVE) {
      this.endPressAnimation();
    }
  }

  private handlePointerup(event: PointerEvent) {
    if (!this.shouldReactToEvent(event)) {
      return;
    }
    // The click that follows ends the press.
  }

  private handlePointerdown(event: PointerEvent) {
    if (!this.shouldReactToEvent(event)) {
      return;
    }

    // Touches start at once too; if the touch becomes a scroll, the browser
    // cancels the pointer and the ripple fades out.
    this.rippleStartEvent = event;
    this.state = State.WAITING_FOR_CLICK;
    this.startPressAnimation(event);
  }

  private handleClick() {
    // Click is a MouseEvent in Firefox and Safari, so we cannot use
    // `shouldReactToEvent`
    if (this.disabled) {
      return;
    }

    if (this.state === State.WAITING_FOR_CLICK) {
      this.endPressAnimation();
      return;
    }

    if (this.state === State.INACTIVE) {
      // keyboard synthesized click event
      this.startPressAnimation();
      this.endPressAnimation();
    }
  }

  private handlePointercancel(event: PointerEvent) {
    if (!this.shouldReactToEvent(event)) {
      return;
    }

    this.endPressAnimation();
  }

  private handleContextmenu() {
    if (this.disabled) {
      return;
    }

    this.endPressAnimation();
  }

  private determineRippleSize() {
    const {height, width} = this.getBoundingClientRect();
    // `?? 1` may be removed once `currentCSSZoom` is widely available.
    const zoom = this.currentCSSZoom ?? 1;
    const size = (Math.hypot(width, height) * 2) / zoom;
    this.initialSize = size;
    this.rippleSize = `${size}px`;
  }

  private getNormalizedPointerEventCoords(pointerEvent: PointerEvent): {
    x: number;
    y: number;
  } {
    const {scrollX, scrollY} = window;
    const {left, top} = this.getBoundingClientRect();
    const documentX = scrollX + left;
    const documentY = scrollY + top;
    const {pageX, pageY} = pointerEvent;
    // `?? 1` may be removed once `currentCSSZoom` is widely available.
    const zoom = this.currentCSSZoom ?? 1;
    return {
      x: (pageX - documentX) / zoom,
      y: (pageY - documentY) / zoom,
    };
  }

  /** Where the ripple's box starts: centered on the pointer. */
  private getStartPoint(positionEvent?: Event) {
    const {height, width} = this.getBoundingClientRect();
    // `?? 1` may be removed once `currentCSSZoom` is widely available.
    const zoom = this.currentCSSZoom ?? 1;
    const point =
      positionEvent instanceof PointerEvent
        ? this.getNormalizedPointerEventCoords(positionEvent)
        : {x: width / zoom / 2, y: height / zoom / 2};
    return {
      x: point.x - this.initialSize / 2,
      y: point.y - this.initialSize / 2,
    };
  }

  private startPressAnimation(positionEvent?: Event) {
    if (!this.mdRoot) {
      return;
    }

    this.pressed = true;
    // The previous wave fades out while the new one grows.
    this.releaseWave();
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    this.determineRippleSize();
    const start = this.getStartPoint(positionEvent);
    const wave = document.createElement('span');
    wave.className = 'wave';
    Object.assign(wave.style, {
      width: this.rippleSize,
      height: this.rippleSize,
      left: `${start.x}px`,
      top: `${start.y}px`,
    });
    this.mdRoot.append(wave);
    this.wave = wave;
    wave.animate(
      [{transform: `scale(${INITIAL_ORIGIN_SCALE})`}, {transform: 'scale(1)'}],
      {
        duration: PRESS_GROW_MS,
        easing: EASING.STANDARD,
        fill: ANIMATION_FILL,
      },
    );
  }

  /** Ends the press: the wave fades out (it keeps growing while it fades). */
  private endPressAnimation() {
    this.rippleStartEvent = undefined;
    this.state = State.INACTIVE;
    this.pressed = false;
    this.releaseWave();
  }

  private releaseWave() {
    const wave = this.wave;
    if (!wave) return;
    this.wave = undefined;
    wave
      .animate({opacity: 0}, {duration: RELEASE_FADE_MS, easing: 'linear', fill: 'forwards'})
      .finished.then(
        () => wave.remove(),
        () => wave.remove(),
      );
  }

  /**
   * Returns `true` if
   *  - the ripple element is enabled
   *  - the pointer is primary for the input type
   *  - the pointer is the pointer that started the interaction, or will start
   * the interaction
   *  - the pointer is a touch, or the pointer state has the primary button
   * held, or the pointer is hovering
   */
  private shouldReactToEvent(event: PointerEvent) {
    if (this.disabled || !event.isPrimary) {
      return false;
    }

    if (
      this.rippleStartEvent &&
      this.rippleStartEvent.pointerId !== event.pointerId
    ) {
      return false;
    }

    if (event.type === 'pointerenter' || event.type === 'pointerleave') {
      return !this.isTouch(event);
    }

    const isPrimaryButton = event.buttons === 1;
    return this.isTouch(event) || isPrimaryButton;
  }

  private isTouch({pointerType}: PointerEvent) {
    return pointerType === 'touch';
  }

  /** @private */
  async handleEvent(event: Event) {
    if (FORCED_COLORS?.matches) {
      // Skip event logic since the ripple is `display: none`.
      return;
    }

    switch (event.type) {
      case 'click':
        this.handleClick();
        break;
      case 'contextmenu':
        this.handleContextmenu();
        break;
      case 'pointercancel':
        this.handlePointercancel(event as PointerEvent);
        break;
      case 'pointerdown':
        await this.handlePointerdown(event as PointerEvent);
        break;
      case 'pointerenter':
        this.handlePointerenter(event as PointerEvent);
        break;
      case 'pointerleave':
        this.handlePointerleave(event as PointerEvent);
        break;
      case 'pointerup':
        this.handlePointerup(event as PointerEvent);
        break;
      default:
        break;
    }
  }

  private onControlChange(prev: HTMLElement | null, next: HTMLElement | null) {
    if (isServer) return;

    for (const event of EVENTS) {
      prev?.removeEventListener(event, this);
      next?.addEventListener(event, this);
    }
  }
}
