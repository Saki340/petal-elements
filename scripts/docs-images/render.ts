/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Renders the images in docs/components and docs/theming from
 * our own components. Run from the repository root after `npm run build`:
 *
 *     npm run docs:images                 # all docs
 *     npm run docs:images -- button fab   # docs/components/button.md, fab.md
 *
 * Each image in a doc (`![alt](images/...)`) is rendered from its figure:
 * `figures/<dir>/<name>.html` for `images/<dir>/<name>.webp` if that file
 * exists, otherwise the first catalog figure after the image (a
 * `<!-- catalog-only-start -->` block with a `<figure>`, or a
 * `<!-- catalog-include "figures/..." -->` file). The hero image (the `<img>`
 * in `<catalog-component-header>`) falls back to the doc's first figure; its
 * alt text and title are taken from the figure.
 *
 * Images are written as WebP. An image in another format (GIF) is replaced by
 * a WebP file and the doc is updated. Images without a figure are listed and
 * left alone.
 */

import {startDevServer} from '@web/dev-server';
import * as fs from 'fs';
import * as path from 'path';
import {chromium, Page} from 'playwright';

/** Directories of docs with images. */
const DOCS = ['docs/components', 'docs/theming'];
const PORT = 8772;

/** Finishes all running animations and transitions. */
async function finishAnimations(page: Page) {
  await page.evaluate(async () => {
    await new Promise(requestAnimationFrame);
    await new Promise(requestAnimationFrame);
    for (const animation of document.getAnimations()) {
      // Endless animations cannot finish.
      if (animation.effect?.getComputedTiming().endTime === Infinity) continue;
      animation.finish();
    }
  });
}

/** Stops the endless animations at their start, so images do not vary. */
async function pauseAnimations(page: Page) {
  await page.evaluate(() => {
    for (const animation of document.getAnimations()) {
      animation.pause();
      animation.currentTime = 0;
    }
  });
}

/** Opens a menu by clicking its button, with room below the figure for it. */
function openMenu(button = '#root petal-filled-button', room = 240) {
  return async (page: Page) => {
    await page.evaluate((room) => {
      document.querySelector<HTMLElement>('#root figure')!.style.paddingBlockEnd = `${room}px`;
    }, room);
    await page.click(button);
    await page.waitForTimeout(500);
    await finishAnimations(page);
  };
}

/** Presses the figure's ripple container and captures the ripple mid-way. */
function press(target: string) {
  return async (page: Page) => {
    const box = (await page.locator(target).boundingBox())!;
    await page.mouse.move(box.x + box.width * 0.35, box.y + box.height * 0.4);
    await page.mouse.down();
    await page.waitForTimeout(90);
  };
}

/** Shows a modal dialog in a small viewport and captures the viewport. */
async function showDialog(page: Page) {
  await page.setViewportSize({width: 480, height: 320});
  await page.waitForTimeout(500);
  // No focus ring on the first button.
  await page.evaluate(() => {
    let active = document.activeElement;
    while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement;
    (active as HTMLElement | null)?.blur();
  });
  await finishAnimations(page);
  return 'viewport' as const;
}

/**
 * Extra steps for figures whose interesting state needs interaction, by image
 * path. Run after the figure is rendered and its animations finished. Return
 * `'viewport'` to capture the whole viewport instead of the figure.
 */
const SETUP: Record<string, (page: Page) => Promise<void | 'viewport'>> = {
  'images/dialog/hero.webp': showDialog,
  'images/ripple/hero.webp': press('.ripple-container'),
  'images/ripple/usage.webp': press('.ripple-container'),
  'images/ripple/theming.webp': press('.ripple-container'),
  'images/ripple/usage-unbounded.webp': press('.ripple-unbounded-container'),
  'images/menu/hero.webp': openMenu(),
  'images/menu/usage.webp': openMenu(),
  'images/menu/usage-document.webp': openMenu(),
  'images/menu/usage-fixed.webp': openMenu(),
  'images/menu/usage-popover.webp': openMenu(),
  'images/menu/usage-submenu.webp': openMenu(),
  'images/menu/usage-groups.webp': openMenu(),
  'images/pulltorefresh/hero.webp': pauseAnimations,
  'images/pulltorefresh/usage.webp': pauseAnimations,
  'images/menu/theming.webp': openMenu(),
};

interface Figure {
  index: number;
  html: string;
}

interface Image {
  doc: string;
  /** Path relative to docs/components, e.g. `images/button/usage.webp`. */
  src: string;
  figure: Figure;
  hero: boolean;
}

function figuresOf(doc: string, text: string): Figure[] {
  const figures: Figure[] = [];
  const inline =
    /<!-- catalog-only-start -->\s*<!--([\s\S]*?)-->\s*<!-- catalog-only-end -->/g;
  for (const m of text.matchAll(inline)) {
    if (m[1].includes('<figure')) figures.push({index: m.index!, html: m[1]});
  }
  for (const m of text.matchAll(/<!-- catalog-include "([^"]+)" -->/g)) {
    const file = path.join(path.dirname(doc), m[1]);
    figures.push({index: m.index!, html: fs.readFileSync(file, 'utf8')});
  }
  return figures.sort((a, b) => a.index - b.index);
}

/**
 * A figure written for an image: `figures/<dir>/<name>.html` for
 * `images/<dir>/<name>.<ext>`.
 */
function ownFigure(doc: string, src: string): Figure | undefined {
  const file = path.join(path.dirname(doc), src.replace(/^images\//, 'figures/').replace(/\.\w+$/, '.html'));
  return fs.existsSync(file) ? {index: -1, html: fs.readFileSync(file, 'utf8')} : undefined;
}

/** Images of a doc with their figures; logs the ones without a figure. */
function imagesOf(doc: string): Image[] {
  const text = fs.readFileSync(doc, 'utf8');
  const figures = figuresOf(doc, text);
  const refs = [...text.matchAll(/!\[[^\]]*\]\((images\/[^\s)]+)/g)].map((m) => ({
    index: m.index!,
    src: m[1],
  }));
  const images: Image[] = [];
  refs.forEach((ref, i) => {
    const end = refs[i + 1]?.index ?? text.length;
    const figure =
      ownFigure(doc, ref.src) ?? figures.find((f) => f.index > ref.index && f.index < end);
    if (figure) {
      images.push({doc, src: ref.src, figure, hero: false});
    } else {
      console.log(`  no figure: ${doc} ${ref.src}`);
    }
  });
  // The hero is the image in the catalog header.
  const header = text.match(/<catalog-component-header[\s\S]*?<\/catalog-component-header>/)?.[0];
  const hero = header?.match(/<img\b[^>]*\ssrc="(images\/[^"]+)"/)?.[1];
  if (hero) {
    const figure = ownFigure(doc, hero) ?? figures[0];
    if (figure) {
      images.push({doc, src: hero, figure, hero: true});
    } else {
      console.log(`  no figure: ${doc} ${hero}`);
    }
  }
  return images;
}

async function render(page: Page, image: Image): Promise<Buffer> {
  await page.goto(`http://localhost:${PORT}/scripts/docs-images/page.html`);
  await page.evaluate(async (html) => {
    const root = document.getElementById('root')!;
    root.innerHTML = html;
    // innerHTML does not run scripts.
    for (const old of root.querySelectorAll('script')) {
      const script = document.createElement('script');
      for (const {name, value} of old.attributes) script.setAttribute(name, value);
      script.textContent = old.textContent;
      old.replaceWith(script);
    }
    const custom = [...root.querySelectorAll('*')].filter((el) => el.localName.includes('-'));
    await Promise.all(custom.map((el) => customElements.whenDefined(el.localName)));
    await Promise.all(custom.map((el) => (el as {updateComplete?: Promise<unknown>}).updateComplete));
    await document.fonts.ready;
  }, image.figure.html);
  await finishAnimations(page);
  const capture = await SETUP[image.src]?.(page);
  const target = (await page.$('#root figure')) ?? (await page.$('#root'))!;
  const png =
    capture === 'viewport'
      ? await page.screenshot({caret: 'hide'})
      : await target.screenshot({caret: 'hide'});
  // PNG -> WebP with the browser's encoder.
  const webp = await page.evaluate(async (data) => {
    const img = new Image();
    img.src = `data:image/png;base64,${data}`;
    await img.decode();
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    canvas.getContext('2d')!.drawImage(img, 0, 0);
    return canvas.toDataURL('image/webp', 0.9).split(',')[1];
  }, png.toString('base64'));
  return Buffer.from(webp, 'base64');
}

/** The figure's label, for the hero's alt text and title. */
function labelOf(html: string, attribute: 'aria-label' | 'title') {
  return html.match(new RegExp(`<figure[^>]*\\s${attribute}="([^"]*)"`))?.[1];
}

async function main() {
  if (!fs.existsSync('all.js')) throw new Error('Run "npm run build" first.');
  const only = process.argv.slice(2);
  const docs = DOCS.flatMap((dir) =>
    fs
      .readdirSync(dir)
      .filter((name) => name.endsWith('.md'))
      .filter((name) => !only.length || only.includes(name.replace(/\.md$/, '')))
      .map((name) => `${dir}/${name}`),
  );

  const server = await startDevServer({
    config: {rootDir: '.', port: PORT, nodeResolve: true},
    readCliArgs: false,
    readFileConfig: false,
    logStartMessage: false,
  });
  const browser = await chromium.launch({
    args: ['--disable-lcd-text', '--font-render-hinting=none', '--force-color-profile=srgb'],
  });
  let count = 0;
  try {
    for (const doc of docs) {
      let text = fs.readFileSync(doc, 'utf8');
      for (const image of imagesOf(doc)) {
        const webp = image.src.replace(/\.\w+$/, '.webp');
        // A new page each time, so no figure affects the next one.
        const page = await browser.newPage({
          viewport: {width: 1280, height: 800},
          deviceScaleFactor: 2,
        });
        try {
          const file = path.join(path.dirname(doc), webp);
          fs.mkdirSync(path.dirname(file), {recursive: true});
          fs.writeFileSync(file, await render(page, image));
        } catch (error) {
          throw new Error(`${doc} ${image.src}: ${error}`);
        } finally {
          await page.close();
        }
        count++;
        if (webp !== image.src) {
          fs.rmSync(path.join(path.dirname(doc), image.src), {force: true});
          text = text.split(image.src).join(webp);
        }
        if (image.hero) {
          // Alt text and title from the figure.
          const alt = labelOf(image.figure.html, 'aria-label');
          const title = labelOf(image.figure.html, 'title');
          text = text.replace(new RegExp(`<img\\b[^>]*\\ssrc="${webp}"[^>]*>`), (tag) => {
            const cls = tag.match(/\sclass="[^"]*"/)?.[0].trim();
            return [
              '<img',
              ...(cls ? [`    ${cls}`] : []),
              ...(alt ? [`    alt="${alt}"`] : []),
              ...(title ? [`    title="${title}"`] : []),
              `    src="${webp}">`,
            ].join('\n');
          });
        }
      }
      fs.writeFileSync(doc, text);
    }
  } finally {
    await browser.close();
    await server.stop();
  }
  console.log(`Rendered ${count} images.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
