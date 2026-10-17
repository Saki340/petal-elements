/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import '../../focus/md-focus-ring.js';
import '../../ripple/ripple.js';

import {html, isServer, LitElement, nothing, PropertyValues} from 'lit';
import {property, query, state} from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';

import {ARIAMixinStrict} from '../../internal/aria/aria.js';
import {mixinDelegatesAria} from '../../internal/aria/delegate.js';
import {
  dispatchActivationClick,
  isActivationClick,
} from '../../internal/events/form-label-activation.js';
import {redispatchEvent} from '../../internal/events/redispatch-event.js';
import {
  DEFAULT_SPATIAL,
  Spring,
  springFromCss,
} from '../../internal/motion/spring.js';
import {
  createValidator,
  getValidityAnchor,
  mixinConstraintValidation,
} from '../../labs/behaviors/constraint-validation.js';
import {mixinElementInternals} from '../../labs/behaviors/element-internals.js';
import {
  getFormState,
  getFormValue,
  mixinFormAssociated,
} from '../../labs/behaviors/form-associated.js';
import {CheckboxValidator} from '../../labs/behaviors/validators/checkbox-validator.js';

/** The mark's state (Compose's ToggleableState). */
type MarkState = 'off' | 'on' | 'indeterminate';

/**
 * Compose's SnapAnimationDelay: unchecking keeps the mark for 100ms (while
 * the box fades out), then removes it at once.
 */
const SNAP_DELAY_MS = 100;

// The checkmark path in Compose's drawCheck, in the 20 unit box of
// CheckboxSize (the checkbox is 20dp in the default configuration): a polyline
// from the left end through the cross to the right end. The indeterminate dash
// is the same path with its cross and right end moved to the middle line
// ("center gravitation").
const VIEW = 20;
const LEFT_X = 0.2;
const LEFT_Y = 0.5;
const CROSS_X = 0.4;
const CROSS_Y = 0.7;
const RIGHT_X = 0.8;
const RIGHT_Y = 0.3;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * The checkmark path for a draw fraction (how much of the path is stroked)
 * and a gravitation (0: checkmark, 1: indeterminate dash).
 *
 * @internal
 */
export function checkmarkGeometry(draw: number, gravitation: number) {
  const left = [LEFT_X * VIEW, lerp(LEFT_Y, 0.5, gravitation) * VIEW];
  const cross = [
    lerp(CROSS_X, 0.5, gravitation) * VIEW,
    lerp(CROSS_Y, 0.5, gravitation) * VIEW,
  ];
  const right = [RIGHT_X * VIEW, lerp(RIGHT_Y, 0.5, gravitation) * VIEW];
  const length =
    Math.hypot(cross[0] - left[0], cross[1] - left[1]) +
    Math.hypot(right[0] - cross[0], right[1] - cross[1]);
  // Compose's PathMeasure.getSegment(0, length * fraction).
  const visible = length * Math.min(Math.max(draw, 0), 1);
  return {
    d: `M${left[0]} ${left[1]}L${cross[0]} ${cross[1]}L${right[0]} ${right[1]}`,
    length,
    visible,
  };
}

// Separate variable needed for closure.
const checkboxBaseClass = mixinDelegatesAria(
  mixinConstraintValidation(
    mixinFormAssociated(mixinElementInternals(LitElement)),
  ),
);

/**
 * A checkbox component.
 *
 *
 * @fires change {Event} The native `change` event on
 * [`<input>`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event)
 * --bubbles
 * @fires input {InputEvent} The native `input` event on
 * [`<input>`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/input_event)
 * --bubbles --composed
 */
export class Checkbox extends checkboxBaseClass {
  /** @nocollapse */
  static override shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  /**
   * Whether or not the checkbox is selected.
   */
  @property({type: Boolean}) checked = false;

  /**
   * Whether or not the checkbox is indeterminate.
   *
   * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/checkbox#indeterminate_state_checkboxes
   */
  @property({type: Boolean}) indeterminate = false;

  /**
   * When true, require the checkbox to be selected when participating in
   * form submission.
   *
   * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/checkbox#validation
   */
  @property({type: Boolean}) required = false;

  /**
   * The value of the checkbox that is submitted with a form when selected.
   *
   * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/checkbox#value
   */
  @property() value = 'on';

  @state() private prevDisabled = false;
  @query('input') private readonly input!: HTMLInputElement | null;
  @query('.mark') private readonly mark!: SVGPathElement | null;

  /** What the mark is drawn for (it follows `checked` and `indeterminate`). */
  private markState: MarkState = 'off';
  private markReady = false;
  /** The draw progress of the mark: 0 hidden, 1 fully drawn. */
  private readonly draw = new Spring(DEFAULT_SPATIAL);
  /** 0 for the checkmark, 1 for the indeterminate dash. */
  private readonly gravitation = new Spring(DEFAULT_SPATIAL);
  private markFrame = 0;
  private markTime = 0;
  private markFrames = 0;
  private markDelay?: ReturnType<typeof setTimeout>;

  constructor() {
    super();
    if (!isServer) {
      this.addEventListener('click', (event: MouseEvent) => {
        if (!isActivationClick(event) || !this.input) {
          return;
        }
        this.focus();
        dispatchActivationClick(this.input);
      });
    }
  }

  protected override update(changed: PropertyValues<Checkbox>) {
    if (
      changed.has('checked') ||
      changed.has('disabled') ||
      changed.has('indeterminate')
    ) {
      this.prevDisabled = changed.get('disabled') ?? this.disabled;
    }

    super.update(changed);
  }

  protected override updated(changed: PropertyValues<Checkbox>) {
    super.updated(changed);
    this.setMark(this.markTarget());
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.stopMark();
  }

  private markTarget(): MarkState {
    return this.indeterminate ? 'indeterminate' : this.checked ? 'on' : 'off';
  }

  /**
   * Moves the mark to the state, like Compose's CheckboxImpl: the draw
   * progress is a default spatial spring, and so is the morph between the
   * checkmark and the indeterminate dash. From unchecked the morph is already
   * done, and to unchecked both snap after SnapAnimationDelay.
   */
  private setMark(next: MarkState) {
    const first = !this.markReady;
    this.markReady = true;
    const previous = this.markState;
    if (!first && previous === next) return;
    this.markState = next;

    const draw = next === 'off' ? 0 : 1;
    const gravitation = next === 'indeterminate' ? 1 : 0;
    this.stopMark();
    if (first || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.snapMark(draw, gravitation);
      return;
    }

    const spec = springFromCss(this, 'default-spatial', DEFAULT_SPATIAL);
    this.draw.spec = spec;
    this.gravitation.spec = spec;
    if (next === 'off') {
      // Keep the mark as it is, remove it after the delay.
      this.draw.target = this.draw.value;
      this.gravitation.target = this.gravitation.value;
      this.markDelay = setTimeout(() => {
        this.markDelay = undefined;
        this.snapMark(0, 0);
      }, SNAP_DELAY_MS);
      return;
    }
    this.draw.target = draw;
    if (previous === 'off') {
      // The mark appears in its final shape and is drawn from the start.
      this.gravitation.value = this.gravitation.target = gravitation;
      this.gravitation.velocity = 0;
    } else {
      this.gravitation.target = gravitation;
    }
    this.syncMark();
    this.runMark();
  }

  private snapMark(draw: number, gravitation: number) {
    for (const [spring, value] of [
      [this.draw, draw],
      [this.gravitation, gravitation],
    ] as const) {
      spring.value = spring.target = value;
      spring.velocity = 0;
    }
    this.syncMark();
  }

  private stopMark() {
    if (this.markFrame) cancelAnimationFrame(this.markFrame);
    this.markFrame = 0;
    clearTimeout(this.markDelay);
    this.markDelay = undefined;
  }

  private runMark() {
    this.markTime = performance.now();
    this.markFrames = 0;
    const tick = () => {
      const now = performance.now();
      // At most a few frames' worth, so a background tab does not jump.
      const ms = Math.min(now - this.markTime, 64);
      this.markTime = now;
      this.draw.step(ms);
      this.gravitation.step(ms);
      this.syncMark();
      if (
        (this.draw.atRest && this.gravitation.atRest) ||
        ++this.markFrames > 600
      ) {
        this.snapMark(this.draw.target, this.gravitation.target);
        this.markFrame = 0;
        return;
      }
      this.markFrame = requestAnimationFrame(tick);
    };
    this.markFrame = requestAnimationFrame(tick);
  }

  /** Draws the mark for the current draw progress and gravitation. */
  private syncMark() {
    const mark = this.mark;
    if (!mark) return;
    const {d, length, visible} = checkmarkGeometry(
      this.draw.value,
      this.gravitation.value,
    );
    mark.setAttribute('d', d);
    // A zero length dash with square caps would still show a dot.
    mark.style.display = visible > 0.001 ? '' : 'none';
    mark.style.strokeDasharray = `${visible} ${length}`;
  }

  protected override render() {
    const isChecked = this.checked && !this.indeterminate;
    const isIndeterminate = this.indeterminate;

    const containerClasses = classMap({
      'disabled': this.disabled,
      'selected': isChecked || isIndeterminate,
      'unselected': !isChecked && !isIndeterminate,
      'checked': isChecked,
      'indeterminate': isIndeterminate,
      'prev-disabled': this.prevDisabled,
    });

    // Needed for closure conformance
    const {ariaLabel, ariaInvalid} = this as ARIAMixinStrict;
    // Note: <input> needs to be rendered before the <svg> for
    // form.reportValidity() to work in Chrome.
    return html`
      <div class="container ${containerClasses}">
        <input
          type="checkbox"
          id="input"
          aria-checked=${isIndeterminate ? 'mixed' : nothing}
          aria-label=${ariaLabel || nothing}
          aria-invalid=${ariaInvalid || nothing}
          ?disabled=${this.disabled}
          ?required=${this.required}
          .indeterminate=${this.indeterminate}
          .checked=${this.checked}
          @input=${this.handleInput}
          @change=${this.handleChange} />

        <div class="box"></div>
        <petal-focus-ring part="focus-ring" for="input"></petal-focus-ring>
        <petal-ripple for="input" ?disabled=${this.disabled}></petal-ripple>
        <svg class="icon" viewBox="0 0 20 20" aria-hidden="true">
          <path class="mark" />
        </svg>
      </div>
    `;
  }

  private handleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.checked = target.checked;
    this.indeterminate = target.indeterminate;
    // <input> 'input' event bubbles and is composed, don't re-dispatch it.
  }

  private handleChange(event: Event) {
    // <input> 'change' event is not composed, re-dispatch it.
    redispatchEvent(this, event);
  }

  override [getFormValue]() {
    if (!this.checked || this.indeterminate) {
      return null;
    }

    return this.value;
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
    return new CheckboxValidator(() => this);
  }

  override [getValidityAnchor]() {
    return this.input;
  }
}
