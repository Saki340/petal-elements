/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import '../../focus/md-focus-ring.js';
import '../../ripple/ripple.js';

import {html, isServer, LitElement, PropertyValues} from 'lit';
import {property, query} from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';

import {isActivationClick} from '../../internal/events/form-label-activation.js';
import {
  FAST_SPATIAL,
  springEasing,
  springFromCss,
} from '../../internal/motion/spring.js';
import {
  createValidator,
  getValidityAnchor,
  mixinConstraintValidation,
} from '../../behaviors/constraint-validation.js';
import {
  internals,
  mixinElementInternals,
} from '../../behaviors/element-internals.js';
import {mixinFocusable} from '../../behaviors/focusable.js';
import {
  getFormState,
  getFormValue,
  mixinFormAssociated,
} from '../../behaviors/form-associated.js';
import {RadioValidator} from '../../behaviors/validators/radio-validator.js';

import {SingleSelectionController} from './single-selection-controller.js';

const CHECKED = Symbol('checked');

/**
 * Compose's RadioButtonDotSize / 2 (6dp) and RadioStrokeWidth (2dp): the dot
 * is drawn with its animated radius minus half the stroke width, so it is 5dp
 * when selected and shows from a radius of 1dp.
 */
const DOT_RADIUS = 6;
const STROKE = 2;

// Separate variable needed for closure.
const radioBaseClass = mixinConstraintValidation(
  mixinFormAssociated(mixinElementInternals(mixinFocusable(LitElement))),
);

/**
 * A radio component.
 *
 * @fires input {InputEvent} Dispatched when the value changes from user
 * interaction. --bubbles
 * @fires change {Event} Dispatched when the value changes from user
 * interaction. --bubbles --composed
 */
export class Radio extends radioBaseClass {
  /**
   * Whether or not the radio is selected.
   */
  @property({type: Boolean})
  get checked() {
    return this[CHECKED];
  }
  set checked(checked: boolean) {
    const wasChecked = this.checked;
    if (wasChecked === checked) {
      return;
    }

    this[CHECKED] = checked;
    this.requestUpdate('checked', wasChecked);
    this.selectionController.handleCheckedChange();
  }

  [CHECKED] = false;

  /**
   * Whether or not the radio is required. If any radio is required in a group,
   * all radios are implicitly required.
   */
  @property({type: Boolean}) required = false;

  /**
   * The element value to use in form submission when checked.
   */
  @property() value = 'on';

  @query('.container') private readonly container!: HTMLElement;
  @query('.dot') private readonly dot!: SVGCircleElement | null;
  private dotAnimation?: Animation;
  private dotReady = false;
  private readonly selectionController = new SingleSelectionController(this);

  constructor() {
    super();
    this.addController(this.selectionController);
    if (!isServer) {
      this[internals].role = 'radio';
      this.addEventListener('click', this.handleClick.bind(this));
      this.addEventListener('keydown', this.handleKeydown.bind(this));
    }
  }

  protected override render() {
    const classes = {'checked': this.checked};
    return html`
      <div class="container ${classMap(classes)}" aria-hidden="true">
        <petal-ripple
          part="ripple"
          .control=${this}
          ?disabled=${this.disabled}></petal-ripple>
        <petal-focus-ring part="focus-ring" .control=${this}></petal-focus-ring>
        <svg class="icon" viewBox="0 0 20 20">
          <circle class="ring" cx="10" cy="10" r="9" />
          <circle class="dot" cx="10" cy="10" r="5" />
        </svg>

        <div class="touch-target"></div>
      </div>
    `;
  }

  protected override updated(changed: PropertyValues<Radio>) {
    this[internals].ariaChecked = String(this.checked);
    // Not on the first render: a radio that starts checked has its dot.
    if (changed.has('checked') && this.dotReady) {
      this.animateDot();
    }
    this.dotReady = true;
  }

  /**
   * Compose's RadioButtonImpl animates the dot's radius (0 to 6dp) with the
   * fast spatial spring; the dot is drawn 1dp smaller, so it shows once the
   * radius is above 1dp. A spring overshoots, so the keyframes are linear in
   * the spring's progress: the dot grows from 0 at the progress where its
   * radius reaches 1dp, to its full size at 1 (and beyond, as the spring
   * overshoots).
   */
  private animateDot() {
    this.dotAnimation?.cancel();
    this.dotAnimation = undefined;
    const dot = this.dot;
    if (
      !dot?.animate ||
      this.disabled ||
      matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    const {easing, duration} = springEasing(
      springFromCss(this, 'fast-spatial', FAST_SPATIAL),
    );
    // The progress at which the drawn radius is 0.
    const appear = STROKE / 2 / DOT_RADIUS;
    this.dotAnimation = dot.animate(
      this.checked
        ? [
            {transform: 'scale(0)', offset: 0},
            {transform: 'scale(0)', offset: appear},
            {transform: 'scale(1)', offset: 1},
          ]
        : [
            {transform: 'scale(1)', offset: 0},
            {transform: 'scale(0)', offset: 1 - appear},
            {transform: 'scale(0)', offset: 1},
          ],
      {duration, easing},
    );
  }

  private async handleClick(event: Event) {
    if (this.disabled) {
      return;
    }

    // allow event to propagate to user code after a microtask.
    await 0;
    if (event.defaultPrevented) {
      return;
    }

    if (isActivationClick(event)) {
      this.focus();
    }

    // Per spec, clicking on a radio input always selects it.
    this.checked = true;
    this.dispatchEvent(new Event('change', {bubbles: true}));
    this.dispatchEvent(
      new InputEvent('input', {bubbles: true, composed: true}),
    );
  }

  private async handleKeydown(event: KeyboardEvent) {
    // allow event to propagate to user code after a microtask.
    await 0;
    if (event.key !== ' ' || event.defaultPrevented) {
      return;
    }

    this.click();
  }

  override [getFormValue]() {
    return this.checked ? this.value : null;
  }

  override [getFormState]() {
    return String(this.checked);
  }

  override formResetCallback() {
    // The checked property does not reflect, so the original attribute set by
    // the user is used to determine the default value.
    this.checked = this.hasAttribute('checked');
  }

  override formStateRestoreCallback(state: string) {
    this.checked = state === 'true';
  }

  override [createValidator]() {
    return new RadioValidator(() => {
      if (!this.selectionController) {
        // Validation runs on superclass construction, so selection controller
        // might not actually be ready until this class constructs.
        return [this];
      }

      return this.selectionController.controls as [Radio, ...Radio[]];
    });
  }

  override [getValidityAnchor]() {
    return this.container;
  }
}
