/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

// Components used on the landing page, from this repository.
import 'petal-elements/button/elevated-button.js';
import 'petal-elements/button/filled-button.js';
import 'petal-elements/button/filled-tonal-button.js';
import 'petal-elements/button/outlined-button.js';
import 'petal-elements/button/text-button.js';
import 'petal-elements/buttongroup/button-group.js';
import 'petal-elements/fab/fab.js';
import 'petal-elements/icon/icon.js';
import 'petal-elements/iconbutton/filled-icon-button.js';
import 'petal-elements/iconbutton/icon-button.js';
import 'petal-elements/switch/switch.js';

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
  const label = dark ? 'Switch to light mode' : 'Switch to dark mode';
  toggle.setAttribute('aria-label', label);
  toggle.setAttribute('title', label);
  toggle.querySelector('petal-icon')!.textContent = dark ? 'light_mode' : 'dark_mode';
}

applyScheme(load('scheme'));
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  applyScheme(load('scheme'));
});
toggle.addEventListener('click', () => {
  const next = isDark() ? 'light' : 'dark';
  save('scheme', next);
  applyScheme(next);
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

// ---------- Spring demo ----------

// The page uses the expressive springs; "Standard" sets the demo back to the
// components' defaults.
const springs = document.getElementById('springs')!;
document.getElementById('scheme')!.addEventListener('change', (event) => {
  const scheme = (event.target as HTMLElement).dataset['scheme'];
  springs.classList.toggle('standard', scheme === 'standard');
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
