/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import {Carousel} from './internal/carousel.js';
import {styles} from './internal/carousel-styles.cssresult.js';

export {Carousel, type CarouselVariant} from './internal/carousel.js';

declare global {
  interface HTMLElementTagNameMap {
    'petal-carousel': PetalCarousel;
  }
}

/**
 * @summary Carousels show a collection of items that scroll on and off the
 * screen.
 *
 * @description
 * A carousel, after Jetpack Compose Material 3's
 * `HorizontalMultiBrowseCarousel`, `HorizontalUncontainedCarousel` and
 * `HorizontalCenteredHeroCarousel`. Its children are the items. Items grow as
 * they reach the large place and shrink as they leave it.
 *
 * @final
 * @suppress {visibility}
 */
@customElement('petal-carousel')
export class PetalCarousel extends Carousel {
  static override styles: CSSResultOrNative[] = [styles];
}
