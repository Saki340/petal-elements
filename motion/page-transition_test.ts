/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import {transitionTheme} from '../theme/theme-transition.js';

import {transitionPage} from './page-transition.js';

const root = document.documentElement;
const ACTIVE = 'data-petal-page-transition';
const nameOf = (element: HTMLElement) => element.style.viewTransitionName;

describe('transitionPage()', () => {
  let page: HTMLElement;

  beforeEach(() => {
    page = document.createElement('main');
    document.body.append(page);
  });

  afterEach(() => {
    page.remove();
  });

  it('runs update at once with reduced motion', async () => {
    spyOn(window, 'matchMedia').and.returnValue({matches: true} as MediaQueryList);
    const spy = spyOn(document, 'startViewTransition').and.callThrough();
    let updated = false;
    await transitionPage(() => {
      updated = true;
    });
    expect(updated).toBeTrue();
    expect(spy).not.toHaveBeenCalled();
  });

  it('marks the page with its type only while it runs', async () => {
    let type: string | null = '';
    await transitionPage(
      () => {
        type = root.getAttribute(ACTIVE);
      },
      {type: 'forward', page},
    );
    expect(type as string | null).toBe('forward');
    expect(root.hasAttribute(ACTIVE)).toBeFalse();
    expect(root.style.getPropertyValue('--petal-page-transition-spatial')).toBe('');
  });

  it('fades by default, and animates the whole page without `page`', async () => {
    let name = '';
    let type: string | null = '';
    await transitionPage(() => {
      name = root.style.viewTransitionName;
      type = root.getAttribute(ACTIVE);
    });
    expect(name).toBe('petal-page');
    expect(type as string | null).toBe('fade');
    expect(root.style.viewTransitionName).toBe('');
  });

  it('mirrors the axis right to left', async () => {
    root.dir = 'rtl';
    let type: string | null = '';
    try {
      await transitionPage(
        () => {
          type = root.getAttribute(ACTIVE);
        },
        {type: 'forward', page},
      );
    } finally {
      root.removeAttribute('dir');
    }
    expect(type as string | null).toBe('back');
  });

  it('finds a replaced page again, from a selector', async () => {
    page.className = 'petal-test-page';
    const next = document.createElement('main');
    next.className = 'petal-test-page';
    const done = transitionPage(
      () => {
        page.replaceWith(next);
      },
      {page: '.petal-test-page'},
    );
    expect(nameOf(page)).toBe('petal-page');
    while (!nameOf(next)) {
      await new Promise((resolve) => requestAnimationFrame(resolve));
    }
    expect(nameOf(page)).toBe('');
    await done;
    next.remove();
    expect(nameOf(next)).toBe('');
  });

  it('moves the name when the old element stays on the page', async () => {
    const card = document.createElement('div');
    const photo = document.createElement('div');
    const title = document.createElement('div');
    const detail = document.createElement('div');
    page.append(card, photo, title);
    let cardName = 'unset';
    await transitionPage(
      () => {
        page.append(detail);
      },
      {
        type: 'container',
        from: {container: card, media: photo, title},
        to: () => {
          cardName = nameOf(card);
          return {container: detail};
        },
      },
    );
    // `to` runs after update, once the old names are gone: two elements with
    // one name would skip the transition.
    expect(cardName).toBe('');
    expect(nameOf(detail)).toBe('');
    expect(nameOf(photo)).toBe('');
  });

  it('moves the corners of the container and of the media it cuts', async () => {
    const box = (radius: string) => {
      const element = document.createElement('div');
      element.style.cssText = `width: 200px; height: 200px; overflow: hidden; border-radius: ${radius}`;
      const media = document.createElement('div');
      media.style.height = '100px';
      element.append(media);
      page.append(element);
      return {element, media};
    };
    const card = box('16px');
    const detail = box('28px');
    const from = '--petal-page-media-radius-from';
    const to = '--petal-page-media-radius-to';
    const done = transitionPage(() => {}, {
      type: 'container',
      from: {container: card.element, media: card.media},
      to: {container: detail.element, media: detail.media},
    });
    expect(root.style.getPropertyValue('--petal-page-container-radius-from')).toBe('16px 16px 16px 16px');
    // In the top corners only.
    expect(root.style.getPropertyValue(from)).toBe('16px 16px 0px 0px');
    while (!root.style.getPropertyValue(to)) {
      await new Promise((resolve) => requestAnimationFrame(resolve));
    }
    expect(root.style.getPropertyValue(to)).toBe('28px 28px 0px 0px');
    await done;
    expect(root.style.getPropertyValue(from)).toBe('');
    expect(root.style.getPropertyValue(to)).toBe('');
  });

  it('keeps the corners the media has of its own', async () => {
    const card = document.createElement('div');
    card.style.cssText = 'width: 200px; height: 200px; border-radius: 16px';
    const media = document.createElement('div');
    media.style.cssText = 'height: 100px; border-radius: 8px';
    card.append(media);
    page.append(card);
    const done = transitionPage(() => {}, {
      type: 'container',
      from: {container: card, media},
    });
    expect(root.style.getPropertyValue('--petal-page-media-radius-from')).toBe('8px 8px 8px 8px');
    await done;
  });

  it('puts back a name the element had', async () => {
    page.style.viewTransitionName = 'mine';
    await transitionPage(() => {}, {page});
    expect(nameOf(page)).toBe('mine');
  });

  it('rejects if update does, and cleans up', async () => {
    const error = new Error('update failed');
    await expectAsync(
      transitionPage(
        () => {
          throw error;
        },
        {page},
      ),
    ).toBeRejectedWith(error);
    expect(root.hasAttribute(ACTIVE)).toBeFalse();
    expect(nameOf(page)).toBe('');
  });

  it('skips the running transition, whose update still runs', async () => {
    const updates: string[] = [];
    const first = transitionPage(
      () => {
        updates.push('first');
      },
      {type: 'forward', page},
    );
    const second = transitionPage(
      () => {
        updates.push('second');
      },
      {type: 'back', page},
    );
    expect(root.getAttribute(ACTIVE)).toBe('back');
    expect(nameOf(page)).toBe('petal-page');
    await first;
    // The first one leaves the second one's state alone.
    expect(updates).toContain('first');
    await second;
    expect(updates).toEqual(['first', 'second']);
    expect(root.hasAttribute(ACTIVE)).toBeFalse();
    expect(nameOf(page)).toBe('');
  });

  it('and transitionTheme() stop each other and clean up', async () => {
    const animate = spyOn(root, 'animate').and.callThrough();
    const theme = transitionTheme(() => {}, {x: 0, y: 0});
    while (!animate.calls.count()) {
      await new Promise((resolve) => requestAnimationFrame(resolve));
    }
    const animation = animate.calls.mostRecent().returnValue;
    const pageChange = transitionPage(() => {}, {page});
    expect(animation.playState).toBe('idle');
    expect(root.classList.contains('petal-theme-transition')).toBeFalse();
    await theme;
    expect(root.hasAttribute(ACTIVE)).toBeTrue();

    const themeAgain = transitionTheme(() => {}, {x: 0, y: 0});
    expect(root.hasAttribute(ACTIVE)).toBeFalse();
    expect(nameOf(page)).toBe('');
    await Promise.all([pageChange, themeAgain]);
    expect(root.classList.contains('petal-theme-transition')).toBeFalse();
  });
});
