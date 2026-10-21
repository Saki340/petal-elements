/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import {html, isServer, nothing, PropertyValues, svg} from 'lit';
import {property, query} from 'lit/decorators.js';

import {observeVisibility} from '../../internal/motion/visibility.js';

import {
  determinateArcs,
  indeterminateFrame,
  MeasuredPath,
  outlinePath,
  wavyDashes,
  wavyShapes,
  WAVY_SIZE,
} from './circular-wavy.js';
import {Progress} from './progress.js';
import {
  AMPLITUDE_DURATION_MS,
  determinateAmplitude,
  EMPHASIZED_ACCELERATE,
  STANDARD,
} from './wavy.js';

/** One wave around a 9-point star per second (waveSpeed = wavelength). */
const WAVE_PERIOD_MS_PER_VERTEX = 1000;

/**
 * A circular progress component, after Jetpack Compose Material 3
 * (`CircularProgressIndicator` and `CircularWavyProgressIndicator`).
 */
export class CircularProgress extends Progress {
  /**
   * Whether the indicator is wavy (`CircularWavyProgressIndicator`): 48px, the
   * active indicator a wave that moves around the circle.
   */
  @property({type: Boolean, reflect: true}) wavy = false;

  @query('.wavy') private readonly wavySvg!: SVGSVGElement | null;

  private frame = 0;
  private start = 0;
  private amplitude = -1;
  private amplitudeFrom = 0;
  private amplitudeTo = 0;
  private amplitudeStart = 0;
  private outlines = new Map<number, MeasuredPath>();

  /** Whether the indicator is in the viewport; the wave moves only then. */
  private visible = true;
  private unobserve?: () => void;

  override connectedCallback() {
    super.connectedCallback();
    if (!isServer) {
      this.unobserve = observeVisibility(this, (visible) => {
        this.visible = visible;
        if (visible && this.wavy && this.hasUpdated) this.startWavy();
        else if (!visible) this.stopWavy();
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

  protected override renderIndicator() {
    if (this.wavy) {
      return html`<svg class="wavy" viewBox="0 0 ${WAVY_SIZE} ${WAVY_SIZE}" aria-hidden="true">
        ${svg`<g class="spin"><path class="track"></path><path class="active-track"></path></g>`}
      </svg>`;
    }
    if (this.indeterminate) {
      return html`<div class="spin-global">
        <div class="spin-step">
          <svg viewBox="0 0 40 40" aria-hidden="true">
            <circle class="active-track" cx="20" cy="20" r="18" pathLength="360"></circle>
          </svg>
        </div>
      </div>`;
    }
    const {active, track} = determinateArcs(this.fraction);
    // Dashes in degrees (pathLength 360), clockwise from 3 o'clock.
    return html`<svg viewBox="0 0 40 40" aria-hidden="true">
      ${track.sweep > 0
        ? svg`<circle class="track" cx="20" cy="20" r="18" pathLength="360"
            stroke-dasharray=${`${track.sweep} ${360 - track.sweep}`}
            stroke-dashoffset=${-(track.start % 360)}></circle>`
        : nothing}
      ${active.sweep > 0
        ? svg`<circle class="active-track" cx="20" cy="20" r="18" pathLength="360"
            stroke-dasharray=${`${active.sweep} ${360 - active.sweep}`}
            stroke-dashoffset=${-(active.start % 360)}></circle>`
        : nothing}
    </svg>`;
  }

  private startWavy() {
    if (isServer || !this.isConnected || !this.visible) return;
    if (this.frame) return;
    this.start = performance.now();
    const tick = () => {
      this.drawWavy(performance.now());
      // A flat determinate indicator does not move: stop until the next update.
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
  }

  /** The outline for an amplitude (0 is the circle, 1 the star). */
  private outline(amplitude: number) {
    const key = Math.round(amplitude * 1000) / 1000;
    let path = this.outlines.get(key);
    if (!path) {
      path = outlinePath(wavyShapes().morph.asCubics(key), WAVY_SIZE);
      // Keep the flat and the full outlines; drop the ones of an animation.
      if (key === 0 || key === 1) this.outlines.set(key, path);
    }
    return path;
  }

  /** Draws the wavy indicator at time `now`. */
  private drawWavy(now: number) {
    const svgEl = this.wavySvg;
    if (!svgEl) return;
    const ms = now - this.start;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let progress: number;
    let amplitude: number;
    let rotation = 0;
    if (this.indeterminate) {
      const frame = indeterminateFrame(ms);
      progress = frame.sweep;
      // The path starts at 12 o'clock; Compose turns it a quarter more.
      rotation = frame.rotation + 90;
      amplitude = 1;
    } else {
      progress = this.fraction;
      amplitude = this.determinateAmplitude(progress, now);
    }
    const period = WAVE_PERIOD_MS_PER_VERTEX * wavyShapes().vertices;
    // With reduced motion the wave stays still (a petal-elements choice).
    const offset = amplitude > 0 && !reduced ? (ms % period) / period : 0;
    const active = this.outline(amplitude);
    const track = this.outline(0);
    const dashes = wavyDashes(progress, offset, active, track);
    const [trackPath, activePath] = Array.from(svgEl.querySelectorAll('path'));
    const center = WAVY_SIZE / 2;
    svgEl
      .querySelector('.spin')!
      .setAttribute('transform', `rotate(${rotation} ${center} ${center})`);
    trackPath.setAttribute('d', track.d);
    trackPath.setAttribute('pathLength', String(track.length));
    this.setDash(trackPath, dashes.track);
    activePath.setAttribute('d', active.d);
    activePath.setAttribute('pathLength', String(active.length));
    // The shifted dash turns back by the shift, so it starts at 12 o'clock.
    activePath.setAttribute('transform', `rotate(${-offset * 360} ${center} ${center})`);
    this.setDash(activePath, dashes.active);
  }

  private setDash(path: SVGPathElement, dash: {dasharray: string; dashoffset: string} | null) {
    path.style.visibility = dash ? '' : 'hidden';
    if (!dash) return;
    path.setAttribute('stroke-dasharray', dash.dasharray);
    path.setAttribute('stroke-dashoffset', dash.dashoffset);
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
