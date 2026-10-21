/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import {html, isServer, nothing, PropertyValues, svg} from 'lit';
import {property, query} from 'lit/decorators.js';
import {styleMap} from 'lit/directives/style-map.js';

import {observeVisibility} from '../../internal/motion/visibility.js';

import {Progress} from './progress.js';
import {
  AMPLITUDE_DURATION_MS,
  DETERMINATE_WAVELENGTH,
  determinateAmplitude,
  drawWavy,
  EMPHASIZED_ACCELERATE,
  INDETERMINATE_WAVELENGTH,
  indeterminateFractions,
  STANDARD,
  stopIndicator,
  WAVE_HEIGHT,
  WAVE_PERIOD_MS,
} from './wavy.js';

// The heads and tails of the indeterminate lines, 0 to 1, as registered
// properties so that CSS keyframes animate them (the flat indicator).
if (!isServer && 'registerProperty' in CSS) {
  for (const line of ['head-1', 'tail-1', 'head-2', 'tail-2']) {
    try {
      CSS.registerProperty({
        name: `--petal-linear-progress-${line}`,
        syntax: '<number>',
        inherits: true,
        initialValue: '0',
      });
    } catch {
      // Already registered.
    }
  }
}

/**
 * A linear progress component, after Jetpack Compose Material 3
 * (`LinearProgressIndicator` and `LinearWavyProgressIndicator`).
 */
export class LinearProgress extends Progress {
  /**
   * Buffer amount to display, a fraction between 0 and `max`.
   * If the value is 0 or negative, the buffer is not displayed.
   */
  @property({type: Number}) buffer = 0;

  /**
   * Draws the indicator as a wave (Material 3 Expressive, Jetpack Compose
   * `LinearWavyProgressIndicator`). Determinate waves flatten below 10% and
   * from 95%. `buffer` and `four-color` do not apply.
   */
  @property({type: Boolean, reflect: true}) wavy = false;

  @query('.wavy') private readonly wavySvg!: SVGSVGElement | null;

  private frame = 0;
  private start = 0;
  private width = 0;
  private resizeObserver?: ResizeObserver;
  // The determinate amplitude animation.
  private amplitude = -1;
  private amplitudeFrom = 0;
  private amplitudeTo = 0;
  private amplitudeStart = 0;

  /** Whether the indicator is in the viewport; the wave moves only then. */
  private visible = true;
  private unobserve?: () => void;

  override connectedCallback() {
    super.connectedCallback();
    if (!isServer) {
      this.unobserve = observeVisibility(this, (visible) => {
        this.visible = visible;
        if (!this.wavy || !this.hasUpdated) return;
        if (visible) {
          this.startWavy();
        } else {
          cancelAnimationFrame(this.frame);
          this.frame = 0;
        }
      });
    }
    if (this.hasUpdated && this.wavy) this.startWavy();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.unobserve?.();
    this.stopWavy();
  }

  protected override updated(changed: PropertyValues<this>) {
    super.updated(changed);
    if (this.wavy) this.startWavy();
    else this.stopWavy();
  }

  // Note, the indeterminate animation is rendered with transform %'s
  // Previously, this was optimized to use px calculated with the resizeObserver
  // due to a now fixed Chrome bug: crbug.com/389359.
  protected override renderIndicator() {
    if (this.wavy) {
      return html`<svg class="wavy" aria-hidden="true">
        ${svg`<path class="wavy-track"></path>
          <path class="wavy-active"></path>
          <path class="wavy-active"></path>
          <circle class="wavy-stop" r="0"></circle>`}
      </svg>`;
    }
    if (this.indeterminate) {
      return html`
        <div class="segment track track-1"></div>
        <div class="segment active line-1"></div>
        <div class="segment track track-2"></div>
        <div class="segment active line-2"></div>
        <div class="segment track track-3"></div>
      `;
    }
    const progress = this.fraction;
    // The buffer (a petal-elements addition) ends the track; dots follow it.
    const buffer = this.buffer > 0 ? Math.min(1, this.buffer / this.max) : 1;
    const styles = {'--_p': String(progress), '--_b': String(buffer)};
    return html`
      <div class="lines" style=${styleMap(styles)}>
        ${buffer < 1 ? html`<div class="dots"></div>` : nothing}
        <div class="segment track"></div>
        ${progress > 0 ? html`<div class="segment active"></div>` : nothing}
        <div class="stop"></div>
      </div>
    `;
  }

  private startWavy() {
    if (isServer || !this.isConnected) return;
    if (!this.resizeObserver) {
      this.resizeObserver = new ResizeObserver(() => {
        this.width = this.getBoundingClientRect().width;
        this.drawWavy(performance.now());
      });
      this.resizeObserver.observe(this);
    }
    if (this.frame || !this.visible) return;
    this.start = performance.now();
    const tick = () => {
      this.drawWavy(performance.now());
      // A flat determinate bar does not move: stop until the next update.
      if (!this.indeterminate && this.amplitude === 0 && this.amplitudeTo === 0) {
        this.frame = 0;
        return;
      }
      this.frame = requestAnimationFrame(tick);
    };
    this.frame = requestAnimationFrame(tick);
  }

  private stopWavy() {
    cancelAnimationFrame(this.frame);
    this.frame = 0;
    this.resizeObserver?.disconnect();
    this.resizeObserver = undefined;
  }

  /** Draws the wavy indicator at time `now`. */
  private drawWavy(now: number) {
    const svgEl = this.wavySvg;
    if (!svgEl || !this.width) return;
    const ms = now - this.start;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let fractions: number[];
    let amplitude: number;
    let wavelength: number;
    if (this.indeterminate) {
      fractions = indeterminateFractions(ms);
      amplitude = 1;
      wavelength = INDETERMINATE_WAVELENGTH;
    } else {
      const progress = this.fraction;
      fractions = [0, progress];
      amplitude = this.determinateAmplitude(progress, now);
      wavelength = DETERMINATE_WAVELENGTH;
    }
    // With reduced motion the wave stays still (a petal-elements choice).
    const offset = reduced ? 0 : (ms % WAVE_PERIOD_MS) / WAVE_PERIOD_MS;
    const drawing = drawWavy(this.width, WAVE_HEIGHT, fractions, amplitude, offset, wavelength);
    svgEl.setAttribute('viewBox', `0 0 ${this.width} ${WAVE_HEIGHT}`);
    const [track, ...active] = Array.from(svgEl.querySelectorAll('path'));
    track.setAttribute('d', drawing.track);
    active.forEach((path, i) => {
      path.setAttribute('d', drawing.progress[i] ?? '');
    });
    const stop = svgEl.querySelector('circle')!;
    const dot = this.indeterminate
      ? {cx: 0, cy: 0, r: 0}
      : stopIndicator(this.width, WAVE_HEIGHT, fractions[1]);
    stop.setAttribute('cx', String(dot.cx));
    stop.setAttribute('cy', String(dot.cy));
    stop.setAttribute('r', String(dot.r));
  }

  /** The amplitude (0 to 1), animating toward its target over 500ms. */
  private determinateAmplitude(progress: number, now: number) {
    const target = determinateAmplitude(progress);
    if (this.amplitude < 0) {
      this.amplitude = this.amplitudeFrom = this.amplitudeTo = target;
    }
    if (target !== this.amplitudeTo) {
      this.amplitudeFrom = this.amplitude;
      this.amplitudeTo = target;
      this.amplitudeStart = now;
    }
    const t = Math.min(1, (now - this.amplitudeStart) / AMPLITUDE_DURATION_MS);
    const easing = this.amplitudeTo > this.amplitudeFrom ? STANDARD : EMPHASIZED_ACCELERATE;
    this.amplitude =
      this.amplitudeFrom + (this.amplitudeTo - this.amplitudeFrom) * easing(t);
    return this.amplitude;
  }
}
