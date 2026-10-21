/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

// Components used on the landing page, from this repository.
import 'petal-elements/appbar/bottom-app-bar.js';
import 'petal-elements/appbar/top-app-bar.js';
import 'petal-elements/badge/badge.js';
import 'petal-elements/button/elevated-button.js';
import 'petal-elements/button/filled-button.js';
import 'petal-elements/button/filled-tonal-button.js';
import 'petal-elements/button/outlined-button.js';
import 'petal-elements/button/text-button.js';
import 'petal-elements/buttongroup/button-group.js';
import 'petal-elements/card/elevated-card.js';
import 'petal-elements/card/filled-card.js';
import 'petal-elements/card/outlined-card.js';
import 'petal-elements/carousel/carousel.js';
import 'petal-elements/checkbox/checkbox.js';
import 'petal-elements/chips/assist-chip.js';
import 'petal-elements/chips/chip-set.js';
import 'petal-elements/chips/filter-chip.js';
import 'petal-elements/chips/input-chip.js';
import 'petal-elements/datepicker/date-picker-dialog.js';
import 'petal-elements/dialog/dialog.js';
import 'petal-elements/divider/divider.js';
import 'petal-elements/fab/fab.js';
import 'petal-elements/fabmenu/fab-menu-item.js';
import 'petal-elements/fabmenu/fab-menu.js';
import 'petal-elements/fabmenu/toggle-fab.js';
import 'petal-elements/floatingtoolbar/floating-toolbar.js';
import 'petal-elements/icon/icon.js';
import 'petal-elements/iconbutton/filled-icon-button.js';
import 'petal-elements/iconbutton/filled-tonal-icon-button.js';
import 'petal-elements/iconbutton/icon-button.js';
import 'petal-elements/iconbutton/outlined-icon-button.js';
import 'petal-elements/list/list-item.js';
import 'petal-elements/list/list.js';
import 'petal-elements/loadingindicator/loading-indicator.js';
import 'petal-elements/menu/menu-group.js';
import 'petal-elements/menu/menu-item.js';
import 'petal-elements/menu/menu.js';
import 'petal-elements/navigationbar/navigation-bar-item.js';
import 'petal-elements/navigationbar/navigation-bar.js';
import 'petal-elements/navigationdrawer/navigation-drawer-item.js';
import 'petal-elements/navigationdrawer/navigation-drawer.js';
import 'petal-elements/navigationrail/navigation-rail-item.js';
import 'petal-elements/navigationrail/navigation-rail.js';
import 'petal-elements/progress/circular-progress.js';
import 'petal-elements/progress/linear-progress.js';
import 'petal-elements/pulltorefresh/pull-to-refresh.js';
import 'petal-elements/radio/radio.js';
import 'petal-elements/search/search-bar.js';
import 'petal-elements/segmentedbutton/segmented-button-set.js';
import 'petal-elements/segmentedbutton/segmented-button.js';
import 'petal-elements/select/outlined-select.js';
import 'petal-elements/select/select-option.js';
import 'petal-elements/sheet/bottom-sheet.js';
import 'petal-elements/slider/slider.js';
import 'petal-elements/snackbar/snackbar.js';
import 'petal-elements/splitbutton/split-button.js';
import 'petal-elements/switch/switch.js';
import 'petal-elements/tabs/primary-tab.js';
import 'petal-elements/tabs/secondary-tab.js';
import 'petal-elements/tabs/tabs.js';
import 'petal-elements/textfield/filled-text-field.js';
import 'petal-elements/textfield/outlined-text-field.js';
import 'petal-elements/timepicker/time-picker-dialog.js';
import 'petal-elements/tooltip/rich-tooltip.js';
import 'petal-elements/tooltip/tooltip.js';

import {transitionTheme} from 'petal-elements/theme/theme-transition.js';

import {
  argbFromHex,
  hexFromArgb,
  Hct,
  MaterialDynamicColors,
  SchemeTonalSpot,
} from '@material/material-color-utilities';

const root = document.documentElement;

/** Reads localStorage without failing where it is blocked. */
function load(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function save(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // Not available; the choice lasts for this page only.
  }
}

// ---------- Light / dark ----------
// tokens/css/sys.css uses light-dark(), so the scheme is just color-scheme.

const toggle = document.getElementById('scheme-toggle')!;

function isDark() {
  const scheme = root.style.colorScheme;
  if (scheme === 'dark') return true;
  if (scheme === 'light') return false;
  return matchMedia('(prefers-color-scheme: dark)').matches;
}

function applyScheme(scheme: string | null) {
  root.style.colorScheme = scheme ?? '';
  const dark = isDark();
  // For what CSS cannot tell from color-scheme, like the screenshots.
  root.dataset['scheme'] = dark ? 'dark' : 'light';
  const label = dark ? 'Switch to light mode' : 'Switch to dark mode';
  toggle.setAttribute('aria-label', label);
  toggle.setAttribute('title', label);
  toggle.querySelector('petal-icon')!.textContent = dark ? 'light_mode' : 'dark_mode';
}

applyScheme(load('scheme'));
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  applyScheme(load('scheme'));
});
// The new scheme grows in a circle from the toggle.
toggle.addEventListener('click', (event) => {
  const next = isDark() ? 'light' : 'dark';
  save('scheme', next);
  transitionTheme(() => applyScheme(next), event);
});

// ---------- Theme from a source color ----------
// Material color utilities generate the light and dark schemes; each role is
// set as light-dark(light, dark), like in sys.css.

const ROLES = Object.entries({
  'primary': MaterialDynamicColors.primary,
  'on-primary': MaterialDynamicColors.onPrimary,
  'primary-container': MaterialDynamicColors.primaryContainer,
  'on-primary-container': MaterialDynamicColors.onPrimaryContainer,
  'inverse-primary': MaterialDynamicColors.inversePrimary,
  'secondary': MaterialDynamicColors.secondary,
  'on-secondary': MaterialDynamicColors.onSecondary,
  'secondary-container': MaterialDynamicColors.secondaryContainer,
  'on-secondary-container': MaterialDynamicColors.onSecondaryContainer,
  'tertiary': MaterialDynamicColors.tertiary,
  'on-tertiary': MaterialDynamicColors.onTertiary,
  'tertiary-container': MaterialDynamicColors.tertiaryContainer,
  'on-tertiary-container': MaterialDynamicColors.onTertiaryContainer,
  'error': MaterialDynamicColors.error,
  'on-error': MaterialDynamicColors.onError,
  'error-container': MaterialDynamicColors.errorContainer,
  'on-error-container': MaterialDynamicColors.onErrorContainer,
  'background': MaterialDynamicColors.background,
  'on-background': MaterialDynamicColors.onBackground,
  'surface': MaterialDynamicColors.surface,
  'surface-dim': MaterialDynamicColors.surfaceDim,
  'surface-bright': MaterialDynamicColors.surfaceBright,
  'surface-container-lowest': MaterialDynamicColors.surfaceContainerLowest,
  'surface-container-low': MaterialDynamicColors.surfaceContainerLow,
  'surface-container': MaterialDynamicColors.surfaceContainer,
  'surface-container-high': MaterialDynamicColors.surfaceContainerHigh,
  'surface-container-highest': MaterialDynamicColors.surfaceContainerHighest,
  'on-surface': MaterialDynamicColors.onSurface,
  'surface-variant': MaterialDynamicColors.surfaceVariant,
  'on-surface-variant': MaterialDynamicColors.onSurfaceVariant,
  'inverse-surface': MaterialDynamicColors.inverseSurface,
  'inverse-on-surface': MaterialDynamicColors.inverseOnSurface,
  'outline': MaterialDynamicColors.outline,
  'outline-variant': MaterialDynamicColors.outlineVariant,
  'surface-tint': MaterialDynamicColors.surfaceTint,
});

function applySeed(seed: string | null) {
  for (const [role] of ROLES) root.style.removeProperty(`--md-sys-color-${role}`);
  if (!seed) return;
  const source = Hct.fromInt(argbFromHex(seed));
  const light = new SchemeTonalSpot(source, false, 0);
  const dark = new SchemeTonalSpot(source, true, 0);
  for (const [role, color] of ROLES) {
    root.style.setProperty(
      `--md-sys-color-${role}`,
      `light-dark(${hexFromArgb(color.getArgb(light))}, ${hexFromArgb(color.getArgb(dark))})`,
    );
  }
}

const picker = document.getElementById('theme-picker')!;
const custom = document.getElementById('custom-seed') as HTMLInputElement;
const swatches = [...picker.querySelectorAll<HTMLButtonElement>('.swatch')];

function selectSeed(seed: string | null) {
  applySeed(seed);
  save('seed', seed);
  for (const swatch of swatches) {
    const checked = (swatch.dataset['seed'] || null) === seed;
    swatch.setAttribute('aria-checked', String(checked));
    swatch.tabIndex = checked ? 0 : -1;
  }
  const isCustom = !!seed && !swatches.some((s) => s.dataset['seed'] === seed);
  custom.parentElement!.classList.toggle('selected', isCustom);
  if (isCustom) custom.value = seed!;
  if (!swatches.some((s) => s.tabIndex === 0)) swatches[0].tabIndex = 0;
}

selectSeed(load('seed'));
for (const swatch of swatches) {
  swatch.addEventListener('click', () => {
    selectSeed(swatch.dataset['seed'] || null);
  });
}
custom.addEventListener('input', () => {
  selectSeed(custom.value);
});
// Arrow keys move between swatches (radio group pattern).
picker.addEventListener('keydown', (event) => {
  const index = swatches.indexOf(document.activeElement as HTMLButtonElement);
  if (index < 0) return;
  const step = {ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1}[event.key];
  if (!step) return;
  event.preventDefault();
  const next = swatches[(index + step + swatches.length) % swatches.length];
  next.focus();
  next.click();
});

// ---------- Copy buttons ----------

for (const button of document.querySelectorAll<HTMLElement>('.code .copy')) {
  button.addEventListener('click', async () => {
    const code = button.parentElement!.querySelector('code')!.textContent!;
    const icon = button.querySelector('petal-icon')!;
    try {
      await navigator.clipboard.writeText(code);
      icon.textContent = 'check';
      button.setAttribute('aria-label', 'Copied');
    } catch {
      icon.textContent = 'error';
    }
    setTimeout(() => {
      icon.textContent = 'content_copy';
      button.setAttribute('aria-label', 'Copy');
    }, 2000);
  });
}

// ---------- Every component ----------

{
  // The filter chips choose one kind at a time; "All" shows every tile.
  const filter = document.getElementById('gallery-filter')!;
  const chips = [...filter.querySelectorAll<HTMLElement & {selected: boolean}>('petal-filter-chip')];
  const tiles = [...document.querySelectorAll<HTMLElement>('#tiles .tile')];
  filter.addEventListener('click', (event) => {
    const chip = (event.target as HTMLElement).closest<HTMLElement & {selected: boolean}>('petal-filter-chip');
    if (!chip) return;
    for (const other of chips) other.selected = other === chip;
    const kind = chip.dataset['kind'];
    for (const tile of tiles) tile.hidden = kind !== 'all' && tile.dataset['kind'] !== kind;
  });

  const byId = <T extends HTMLElement = HTMLElement & Record<string, unknown>>(id: string) =>
    document.getElementById(id) as unknown as T;
  type Opens = HTMLElement & {show(): unknown; open: boolean; value: string};

  // Buttons that open things.
  const opener = (button: string, target: string) =>
    byId(button).addEventListener('click', () => void byId<Opens>(target).show());
  opener('tile-snackbar-button', 'tile-snackbar');
  opener('tile-dialog-button', 'tile-dialog');
  opener('tile-sheet-button', 'tile-sheet');
  opener('tile-drawer-button', 'tile-drawer');
  opener('tile-date-button', 'tile-date');
  opener('tile-time-button', 'tile-time');
  const menu = byId<Opens>('tile-menu');
  byId('tile-menu-button').addEventListener('click', () => (menu.open = !menu.open));

  // The split button's arrow opens its menu.
  const split = byId<HTMLElement & {checked: boolean}>('tile-split');
  const splitMenu = byId<Opens>('tile-split-menu');
  split.addEventListener('change', () => (splitMenu.open = split.checked));
  splitMenu.addEventListener('closed', () => (split.checked = false));

  // Picked dates and times show on their buttons.
  const date = byId<Opens>('tile-date');
  date.addEventListener('change', () => {
    const [y, m, d] = date.value.split('-').map(Number);
    byId('tile-date-label').textContent = new Date(y, m - 1, d).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  });
  const time = byId<Opens>('tile-time');
  time.addEventListener('change', () => {
    const [h, m] = time.value.split(':').map(Number);
    byId('tile-time-label').textContent = new Date(2000, 0, 1, h, m).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  });

  // Pull to refresh: a pretend reload.
  const refresh = byId<HTMLElement & {refreshing: boolean}>('tile-refresh');
  refresh.addEventListener('refresh', () => {
    setTimeout(() => (refresh.refreshing = false), 1500);
  });

  // Carousel items: places in tonal colors, the name fading with the mask.
  const carousel = byId('tile-carousel');
  const tones = ['primary', 'secondary', 'tertiary'];
  ['Kyoto', 'Nara', 'Osaka', 'Kobe', 'Nagoya', 'Tokyo'].forEach((name, i) => {
    const item = document.createElement('div');
    item.className = 'color-item';
    item.style.setProperty('--tone', `var(--md-sys-color-${tones[i % 3]}-container)`);
    item.style.setProperty('--on-tone', `var(--md-sys-color-on-${tones[i % 3]}-container)`);
    item.append(Object.assign(document.createElement('span'), {textContent: name}));
    carousel.append(item);
  });
}

// ---------- Made for AI coding assistants ----------

{
  const copy = document.getElementById('copy-llms')!;
  copy.addEventListener('click', async () => {
    const url = new URL('llms.txt', location.href).href;
    try {
      await navigator.clipboard.writeText(url);
      copy.lastChild!.textContent = 'Copied';
    } catch {
      copy.lastChild!.textContent = url;
    }
  });

  // The assistant types its answer once the window scrolls into view.
  const PROMPT =
    'Read https://petal.anontokyo.vip/llms.txt, then build a settings page with Wi-Fi, a dark theme switch and the language.';
  const CODE = `<petal-list aria-label="Settings">
  <petal-list-item>
    <petal-icon slot="start">wifi</petal-icon>
    <div slot="headline">Wi-Fi</div>
    <div slot="supporting-text">Home network</div>
    <petal-switch slot="end" selected aria-label="Wi-Fi"></petal-switch>
  </petal-list-item>
  <petal-list-item>
    <petal-icon slot="start">dark_mode</petal-icon>
    <div slot="headline">Dark theme</div>
    <petal-switch slot="end" aria-label="Dark theme"></petal-switch>
  </petal-list-item>
  <petal-list-item type="button">
    <petal-icon slot="start">language</petal-icon>
    <div slot="headline">Language</div>
    <div slot="supporting-text">English</div>
  </petal-list-item>
</petal-list>`;
  const promptText = document.getElementById('agent-prompt-text')!;
  const code = document.getElementById('agent-code')!;
  const demo = document.querySelector('.agent-demo')!;

  // Every line is there from the start, hidden, so the window keeps its
  // height while the lines appear; the result has its place too.
  const lines = CODE.split('\n').map((text) =>
    Object.assign(document.createElement('span'), {className: 'line', textContent: `${text}\n`}),
  );
  code.replaceChildren(...lines);

  const finish = () => {
    promptText.textContent = PROMPT;
    for (const line of lines) line.classList.add('shown');
    demo.classList.add('done');
  };

  const play = async () => {
    const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
    for (let i = 1; i <= PROMPT.length; i++) {
      promptText.textContent = PROMPT.slice(0, i);
      await wait(18);
    }
    await wait(400);
    for (const line of lines) {
      line.classList.add('shown');
      await wait(70);
    }
    await wait(300);
    finish();
  };

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    finish();
  } else {
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      void play();
    }, {threshold: 0.4});
    observer.observe(demo);
  }
}

// ---------- Header: menu, search, GitHub ----------

{
  // On small screens the links move into a modal navigation drawer.
  const drawer = document.getElementById('menu-drawer') as HTMLElement & {
    show(): void;
    close(): Promise<void>;
  };
  document.getElementById('menu-button')!.addEventListener('click', () => drawer.show());
  drawer.addEventListener('click', async (event) => {
    const item = (event.target as HTMLElement).closest('petal-navigation-drawer-item');
    if (!item) return;
    const href = item.getAttribute('href') ?? '';
    if (!href.startsWith('#')) {
      void drawer.close();
      return;
    }
    // The open modal drawer would keep the page from scrolling: close it,
    // then go to the section.
    event.preventDefault();
    await drawer.close();
    history.pushState(null, '', href);
    document.querySelector(href)?.scrollIntoView();
  });

  // Search: a palette of the docs pages, filtered as you type.
  const COMPONENTS = [
    'Badge', 'Bottom app bar', 'Bottom sheet', 'Button', 'Button group', 'Card', 'Carousel',
    'Checkbox', 'Chip', 'Date picker', 'Dialog', 'Divider', 'Elevation', 'FAB', 'FAB menu',
    'Floating toolbar', 'Focus ring', 'Icon', 'Icon button', 'List', 'Loading indicator', 'Menu',
    'Navigation bar', 'Navigation drawer', 'Navigation rail', 'Progress', 'Pull to refresh',
    'Radio', 'Ripple', 'Search', 'Segmented button', 'Select', 'Slider', 'Snackbar',
    'Split button', 'Switch', 'Tabs', 'Text field', 'Time picker', 'Tooltip', 'Top app bar',
  ];
  const PAGES: Array<[title: string, kind: string, href: string]> = [
    ['Introduction', 'Guide', 'catalog/about/intro/'],
    ['Quick start', 'Guide', 'catalog/about/quick-start/'],
    ['Building pages', 'Guide', 'catalog/about/building-pages/'],
    ['Material 3 Expressive', 'Guide', 'catalog/about/expressive/'],
    ['Motion', 'Guide', 'catalog/about/motion/'],
    ['Using in an existing site', 'Guide', 'catalog/about/migrating/'],
    ['Theming', 'Theming', 'catalog/theming/material-theming/'],
    ['Color', 'Theming', 'catalog/theming/color/'],
    ['Typography', 'Theming', 'catalog/theming/typography/'],
    ['Shape', 'Theming', 'catalog/theming/shape/'],
    ['llms.txt', 'For AI assistants', 'llms.txt'],
    ['llms-full.txt', 'For AI assistants', 'llms-full.txt'],
    ...COMPONENTS.map((name): [string, string, string] => [
      name,
      'Component',
      `catalog/components/${name.toLowerCase().replaceAll(' ', '-')}/`,
    ]),
  ];
  const dialog = document.getElementById('search-dialog') as HTMLElement & {
    show(): Promise<void>;
  };
  const field = document.getElementById('search-field') as HTMLElement & {value: string};
  const results = document.getElementById('search-results')!;

  const render = () => {
    const query = field.value.trim().toLowerCase();
    const matches = PAGES.filter(([title, kind]) =>
      `${title} ${kind}`.toLowerCase().includes(query),
    );
    if (!matches.length) {
      results.replaceChildren(
        Object.assign(document.createElement('p'), {className: 'no-results', textContent: 'No results'}),
      );
      return;
    }
    // One line each, the kind at the end, as in a command palette.
    results.replaceChildren(
      ...matches.map(([title, kind, href]) => {
        const item = document.createElement('petal-list-item');
        item.setAttribute('type', 'link');
        item.setAttribute('href', href);
        item.append(
          Object.assign(document.createElement('div'), {slot: 'headline', textContent: title}),
          Object.assign(document.createElement('div'), {
            slot: 'trailing-supporting-text',
            textContent: kind,
          }),
        );
        return item;
      }),
    );
    results.scrollTop = 0;
  };
  const open = async () => {
    field.value = '';
    render();
    await dialog.show();
    field.focus();
  };
  document.getElementById('search-button')!.addEventListener('click', () => void open());
  document.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      void open();
    }
  });
  field.addEventListener('input', render);
  // Enter opens the first result.
  field.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    const first = results.querySelector('petal-list-item');
    if (first) location.href = first.getAttribute('href')!;
  });
  if (/Mac|iPhone|iPad/.test(navigator.platform)) {
    document.querySelector('.search-button kbd')!.textContent = '⌘K';
  }

  // The repository's star count, kept for the session.
  const stars = document.getElementById('github-stars')!;
  // A count only once there is something to show.
  const show = (count: number) => {
    if (count < 100) return;
    stars.textContent = count >= 1000 ? `${(count / 1000).toFixed(1)}k` : String(count);
  };
  let cached: string | null = null;
  try {
    cached = sessionStorage.getItem('stars');
  } catch {
    // Storage is blocked.
  }
  if (cached) {
    show(Number(cached));
  } else {
    fetch('https://api.github.com/repos/Saki340/petal-elements')
      .then((response) => (response.ok ? response.json() : null))
      .then((repo: {stargazers_count?: number} | null) => {
        if (typeof repo?.stargazers_count !== 'number') return;
        show(repo.stargazers_count);
        try {
          sessionStorage.setItem('stars', String(repo.stargazers_count));
        } catch {
          // Storage is blocked.
        }
      })
      .catch(() => {});
  }
}

// ---------- Examples ----------

{
  type Picker = HTMLElement & {value: string; show(): void};
  const byId = <T extends HTMLElement = HTMLElement & Record<string, unknown>>(id: string) =>
    document.getElementById(id) as unknown as T;
  const snackbar = byId<HTMLElement & {show(): Promise<string>}>('block-snackbar');
  const notify = (message: string) => {
    snackbar.textContent = message;
    return snackbar.show();
  };

  // Reserve a table: the date and time come from the picker dialogs.
  const dateDialog = byId<Picker>('block-date-dialog');
  const timeDialog = byId<Picker>('block-time-dialog');
  const dateField = byId<HTMLElement & {value: string}>('block-date');
  const timeField = byId<HTMLElement & {value: string}>('block-time');
  byId('block-date-button').addEventListener('click', () => dateDialog.show());
  byId('block-time-button').addEventListener('click', () => timeDialog.show());
  dateDialog.addEventListener('change', () => {
    const [y, m, d] = dateDialog.value.split('-').map(Number);
    dateField.value = new Date(y, m - 1, d).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  });
  timeDialog.addEventListener('change', () => {
    const [h, m] = timeDialog.value.split(':').map(Number);
    timeField.value = new Date(2000, 0, 1, h, m).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  });
  byId('block-reserve').addEventListener('click', () =>
    notify(`Table reserved for ${dateField.value}, ${timeField.value}`),
  );

  // Trip ideas: places in tonal colors, the names fading with the mask.
  const carousel = byId('block-carousel');
  const tones = ['tertiary', 'primary', 'secondary'];
  ['Hakodate', 'Otaru', 'Furano', 'Biei', 'Niseko'].forEach((name, i) => {
    const item = document.createElement('div');
    item.className = 'color-item';
    item.style.setProperty('--tone', `var(--md-sys-color-${tones[i % 3]}-container)`);
    item.style.setProperty('--on-tone', `var(--md-sys-color-on-${tones[i % 3]}-container)`);
    item.append(Object.assign(document.createElement('span'), {textContent: name}));
    carousel.append(item);
  });

  // Chat: sent messages join the thread.
  const chat = byId('block-chat');
  const message = byId<HTMLElement & {value: string}>('block-message');
  byId('block-send').addEventListener('submit', (event) => {
    event.preventDefault();
    const text = message.value.trim();
    if (!text) return;
    chat.append(Object.assign(document.createElement('p'), {className: 'bubble mine', textContent: text}));
    message.value = '';
    chat.scrollTop = chat.scrollHeight;
  });

  // Account security: show or hide the password.
  const password = byId<HTMLElement & {type: string}>('block-password');
  const toggle = byId<HTMLElement & {selected: boolean}>('block-password-toggle');
  toggle.addEventListener('change', () => {
    password.type = toggle.selected ? 'text' : 'password';
    toggle.setAttribute('aria-label', toggle.selected ? 'Hide password' : 'Show password');
  });

  // Rating: the stars up to the chosen one are on.
  const stars = [
    ...byId('block-stars').querySelectorAll<HTMLElement & {selected: boolean}>('petal-icon-button'),
  ];
  stars.forEach((star, index) => {
    star.addEventListener('click', (event) => {
      event.preventDefault(); // The rating sets the stars, not each toggle.
      stars.forEach((other, i) => (other.selected = i <= index));
    });
  });

  byId('block-pay').addEventListener('click', () => void notify('Payment sent'));
  byId('block-feedback').addEventListener('click', () => void notify('Thanks for your feedback'));
}

// ---------- Motion ----------
// The page's own motion (styles.css, "Motion"): only transforms and opacity,
// pointer effects only with a mouse, nothing with reduced motion.

declare global {
  interface Window {
    landingReady?: boolean;
  }
}
window.landingReady = true;

{
  const motion = document.documentElement.classList.contains('motion');
  const mouse = matchMedia('(hover: hover) and (pointer: fine)').matches;

  // Cards, tiles and sections rise into view, a little after one another.
  const targets = [
    ...document.querySelectorAll<HTMLElement>(
      '.block, .tile, .section > h2, .section > .section-lead, .gallery-filter, .agents-text, .agent-demo, .theme-picker, .theme-preview, .steps, .cta',
    ),
  ];
  for (const column of document.querySelectorAll('.blocks-column')) {
    [...column.children].forEach((card, i) => (card as HTMLElement).style.setProperty('--i', String(i)));
  }
  document.querySelectorAll<HTMLElement>('#tiles .tile').forEach((tile, i) => {
    tile.style.setProperty('--i', String(i % 3));
  });
  if (motion) {
    const reveal = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('in');
          reveal.unobserve(entry.target);
        }
      },
      {rootMargin: '0px 0px -8% 0px'},
    );
    for (const target of targets) reveal.observe(target);
  } else {
    for (const target of targets) target.classList.add('in');
  }

  // The component count runs up the first time it is seen.
  const count = document.querySelector<HTMLElement>('[data-count]')!;
  if (motion) {
    const to = Number(count.dataset['count']);
    count.textContent = '0';
    const counter = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      counter.disconnect();
      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / 900);
        // Ease out: fast at first, settling on the number.
        count.textContent = String(Math.round(to * (1 - (1 - t) ** 3)));
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
    counter.observe(count);
  }

  // The hero's petals and light, which follow and flee the mouse.
  const art = document.getElementById('hero-art')!;
  const petals = [...art.querySelectorAll<HTMLElement>('.petal')];
  // Pause the drifting while the hero is out of view.
  new IntersectionObserver((entries) => {
    art.classList.toggle('paused', !entries[0].isIntersecting);
  }).observe(art);

  if (motion && mouse) {
    let frame = 0;
    let pointer: {x: number; y: number} | null = null;
    // Each petal's resting place as fractions of the hero.
    const rests = petals.map((petal) => ({
      petal,
      x: parseFloat(petal.style.getPropertyValue('--x')) / 100,
      y: parseFloat(petal.style.getPropertyValue('--y')) / 100,
    }));
    // How far each blob of light follows the mouse, in px at the hero's edge.
    const blobs = [...art.querySelectorAll<HTMLElement>('.blob')].map((blob, i) => ({
      blob,
      depth: [40, -56, 28][i],
    }));
    // Transforms are set on the moving elements themselves, not through
    // inherited custom properties, so a move restyles only those elements.
    const update = () => {
      frame = 0;
      if (!pointer) {
        for (const {blob} of blobs) blob.style.translate = '';
        for (const {petal} of rests) petal.style.translate = '';
        return;
      }
      const box = art.getBoundingClientRect();
      // The light leans toward the mouse: -1 to 1 across the hero.
      const mx = ((pointer.x - box.left) / box.width) * 2 - 1;
      const my = ((pointer.y - box.top) / box.height) * 2 - 1;
      for (const {blob, depth} of blobs) {
        blob.style.translate = `${(mx * depth).toFixed(1)}px ${(my * depth).toFixed(1)}px`;
      }
      // Petals within 160px move away from the mouse, the nearest the most.
      // Where a petal rests comes from its place in the hero (no layout
      // reads per petal).
      for (const {petal, x, y} of rests) {
        const dx = box.left + x * box.width - pointer.x;
        const dy = box.top + y * box.height - pointer.y;
        const distance = Math.hypot(dx, dy);
        if (distance > 160 || distance === 0) {
          petal.style.translate = '';
          continue;
        }
        const push = ((160 - distance) / 160) * 56;
        petal.style.translate = `${((dx / distance) * push).toFixed(1)}px ${((dy / distance) * push).toFixed(1)}px`;
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    // The light and petals span the window, so follow the mouse anywhere,
    // while the hero is in view.
    document.addEventListener('pointermove', (event) => {
      if (event.pointerType !== 'mouse' || art.classList.contains('paused')) return;
      pointer = {x: event.clientX, y: event.clientY};
      schedule();
    });
    document.documentElement.addEventListener('pointerleave', () => {
      pointer = null;
      schedule();
    });
  }

  // Buttons pulled a little toward the mouse.
  if (motion && mouse) {
    for (const button of document.querySelectorAll<HTMLElement>('[data-magnetic]')) {
      button.addEventListener('pointermove', (event) => {
        if (event.pointerType !== 'mouse') return;
        const box = button.getBoundingClientRect();
        const x = (event.clientX - box.left - box.width / 2) * 0.18;
        const y = (event.clientY - box.top - box.height / 2) * 0.3;
        button.style.translate = `${x.toFixed(1)}px ${y.toFixed(1)}px`;
      });
      button.addEventListener('pointerleave', () => {
        button.style.translate = '';
      });
    }
  }

  // Example cards lean toward the mouse, at most 3 degrees; not while a
  // button is held (dragging a slider).
  if (motion && mouse) {
    for (const card of document.querySelectorAll<HTMLElement>('.block')) {
      let frame = 0;
      let last: PointerEvent | null = null;
      const lean = () => {
        frame = 0;
        if (!last) return;
        const box = card.getBoundingClientRect();
        const x = (last.clientX - box.left) / box.width - 0.5;
        const y = (last.clientY - box.top) / box.height - 0.5;
        card.style.transform = `perspective(900px) rotateX(${(-y * 6).toFixed(2)}deg) rotateY(${(x * 6).toFixed(2)}deg)`;
      };
      card.addEventListener('pointermove', (event) => {
        if (event.pointerType !== 'mouse') return;
        if (event.buttons) {
          card.classList.remove('leaning');
          card.style.transform = '';
          return;
        }
        card.classList.add('leaning');
        last = event;
        if (!frame) frame = requestAnimationFrame(lean);
      });
      card.addEventListener('pointerleave', () => {
        last = null;
        cancelAnimationFrame(frame);
        frame = 0;
        card.classList.remove('leaning');
        card.style.transform = '';
      });
    }
  }
}
