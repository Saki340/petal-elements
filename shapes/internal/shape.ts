/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import {html, isServer, LitElement, PropertyValues} from 'lit';
import {property, query} from 'lit/decorators.js';

import {Spring, springFromCss, SpringName} from '../../internal/motion/spring.js';
import {Morph} from '../../internal/shapes/morph.js';
import {morphOutline, morphPath, shapePath} from '../../internal/shapes/path.js';
import {isShapeName, materialShape, ShapeName} from '../shapes.js';

/** How close to its end a morph's progress counts as there. */
const PROGRESS_THRESHOLD = 0.001;

/**
 * A container clipped to one of the 35 Material shapes, that morphs to
 * another shape on a spring when `shape` changes, while a mouse hovers it
 * (`hover-shape`) and while it is pressed (`pressed-shape`). Its content is
 * clipped with it.
 */
export class Shape extends LitElement {
  /** The shape at rest: one of the 35 shape names. */
  @property({reflect: true}) shape: ShapeName = 'circle';

  /** The shape while a mouse hovers the element. */
  @property({attribute: 'hover-shape', reflect: true}) hoverShape?: ShapeName;

  /** The shape while the element is pressed. */
  @property({attribute: 'pressed-shape', reflect: true}) pressedShape?: ShapeName;

  @query('.shape') private readonly shapeElement!: HTMLElement | null;

  private hovered = false;
  private pressed = false;
  private width = 0;
  private height = 0;

  /**
   * The morph on screen, from `from` (a shape, or where an interrupted morph
   * was) to `to`, and the spring driving its progress.
   */
  private morph?: Morph;
  private from?: ShapeName;
  private to?: ShapeName;
  private readonly progress = new Spring({dampingRatio: 1, stiffness: 1}, PROGRESS_THRESHOLD);
  private frame = 0;
  private lastTime = 0;
  /** The shape shown when no morph runs. */
  private current?: ShapeName;
  private resizeObserver?: ResizeObserver;

  constructor() {
    super();
    if (!isServer) {
      this.addEventListener('pointerenter', this.onPointerEnter);
      this.addEventListener('pointerleave', this.onPointerLeave);
      this.addEventListener('pointerdown', this.onPointerDown);
    }
  }

  override connectedCallback() {
    super.connectedCallback();
    if (this.shapeElement) this.resizeObserver?.observe(this.shapeElement);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.resizeObserver?.disconnect();
    this.stopFrames();
    this.release();
  }

  protected override render() {
    return html`<div class="shape" part="shape"><slot></slot></div>`;
  }

  protected override firstUpdated() {
    this.resizeObserver = new ResizeObserver(([entry]) => {
      const box = entry.borderBoxSize?.[0];
      this.width = box ? box.inlineSize : entry.contentRect.width;
      this.height = box ? box.blockSize : entry.contentRect.height;
      this.draw();
    });
    this.resizeObserver.observe(this.shapeElement!);
  }

  protected override updated(changed: PropertyValues<this>) {
    if (changed.has('shape') || changed.has('hoverShape') || changed.has('pressedShape')) {
      // Entering hover or press is quick; everything else moves at the
      // default speed.
      this.morphTo(this.target(), 'default-spatial');
    }
  }

  /** The shape for the current state. */
  private target(): ShapeName {
    const valid = (name?: string) => (name && isShapeName(name) ? name : undefined);
    return (
      (this.pressed ? valid(this.pressedShape) : undefined) ??
      (this.hovered ? valid(this.hoverShape) : undefined) ??
      valid(this.shape) ??
      'circle'
    );
  }

  private morphTo(target: ShapeName, spring: SpringName) {
    if (!this.current && !this.morph) {
      // The first shape: no morph.
      this.current = target;
      this.draw();
      return;
    }
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      this.stopFrames();
      this.morph = undefined;
      this.current = target;
      this.draw();
      return;
    }
    this.progress.spec = springFromCss(this, spring);
    if (this.morph) {
      // A morph is running: turn it back, keep it going, or morph on from
      // where it is.
      if (target === this.from) {
        this.progress.target = 0;
      } else if (target === this.to) {
        this.progress.target = 1;
      } else {
        const outline = morphOutline(this.morph, this.progress.value);
        this.morph = new Morph(outline, materialShape(target));
        this.from = undefined;
        this.to = target;
        this.progress.value = 0;
        this.progress.velocity = Math.abs(this.progress.velocity);
        this.progress.target = 1;
      }
    } else {
      if (target === this.current) return;
      this.morph = new Morph(materialShape(this.current!), materialShape(target));
      this.from = this.current;
      this.to = target;
      this.progress.value = 0;
      this.progress.velocity = 0;
      this.progress.target = 1;
    }
    this.current = undefined;
    if (!this.frame) {
      this.lastTime = performance.now();
      this.frame = requestAnimationFrame(this.step);
    }
  }

  private readonly step = (time: number) => {
    // Long gaps (a hidden tab) count as one frame.
    this.progress.step(Math.min(time - this.lastTime, 64));
    this.lastTime = time;
    if (this.progress.atRest) {
      this.current = this.progress.target === 0 ? this.from : this.to;
      this.morph = undefined;
      this.frame = 0;
    } else {
      this.frame = requestAnimationFrame(this.step);
    }
    this.draw();
  };

  private stopFrames() {
    cancelAnimationFrame(this.frame);
    this.frame = 0;
    if (this.morph) {
      this.current = this.progress.target === 0 && this.from ? this.from : this.to;
      this.morph = undefined;
    }
  }

  /** Clips the shape element to the shape on screen. */
  private draw() {
    const element = this.shapeElement;
    if (!element || !this.width || !this.height) return;
    let d: string;
    if (this.morph) {
      d = morphPath(this.morph, this.progress.value, this.width, this.height);
    } else {
      d = shapePath(materialShape(this.current ?? 'circle'), this.width, this.height);
    }
    element.style.clipPath = `path('${d}')`;
  }

  private readonly onPointerEnter = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return;
    this.hovered = true;
    this.morphTo(this.target(), 'fast-spatial');
  };

  private readonly onPointerLeave = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return;
    this.hovered = false;
    this.morphTo(this.target(), 'default-spatial');
  };

  private readonly onPointerDown = (event: PointerEvent) => {
    if (event.button !== 0) return;
    this.pressed = true;
    window.addEventListener('pointerup', this.onPointerUp);
    window.addEventListener('pointercancel', this.onPointerUp);
    this.morphTo(this.target(), 'fast-spatial');
  };

  private readonly onPointerUp = () => {
    this.release();
    this.morphTo(this.target(), 'default-spatial');
  };

  private release() {
    this.pressed = false;
    window.removeEventListener('pointerup', this.onPointerUp);
    window.removeEventListener('pointercancel', this.onPointerUp);
  }
}
