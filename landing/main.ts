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
import 'petal-elements/card/elevated-card.js';
import 'petal-elements/card/filled-card.js';
import 'petal-elements/card/outlined-card.js';
import 'petal-elements/checkbox/checkbox.js';
import 'petal-elements/chips/chip-set.js';
import 'petal-elements/chips/filter-chip.js';
import 'petal-elements/dialog/dialog.js';
import 'petal-elements/fab/fab.js';
import 'petal-elements/fabmenu/fab-menu.js';
import 'petal-elements/fabmenu/fab-menu-item.js';
import 'petal-elements/fabmenu/toggle-fab.js';
import 'petal-elements/icon/icon.js';
import 'petal-elements/iconbutton/filled-icon-button.js';
import 'petal-elements/iconbutton/icon-button.js';
import 'petal-elements/list/list.js';
import 'petal-elements/list/list-item.js';
import 'petal-elements/loadingindicator/loading-indicator.js';
import 'petal-elements/menu/menu.js';
import 'petal-elements/menu/menu-group.js';
import 'petal-elements/menu/menu-item.js';
import 'petal-elements/navigationbar/navigation-bar.js';
import 'petal-elements/navigationbar/navigation-bar-item.js';
import 'petal-elements/navigationrail/navigation-rail.js';
import 'petal-elements/navigationrail/navigation-rail-item.js';
import 'petal-elements/progress/linear-progress.js';
import 'petal-elements/radio/radio.js';
import 'petal-elements/search/search-bar.js';
import 'petal-elements/select/outlined-select.js';
import 'petal-elements/select/select-option.js';
import 'petal-elements/slider/slider.js';
import 'petal-elements/snackbar/snackbar.js';
import 'petal-elements/splitbutton/split-button.js';
import 'petal-elements/switch/switch.js';
import 'petal-elements/tabs/primary-tab.js';
import 'petal-elements/tabs/secondary-tab.js';
import 'petal-elements/tabs/tabs.js';
import 'petal-elements/textfield/outlined-text-field.js';
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

// ---------- Spring demo ----------

// The springs are expressive by default; "Standard" switches the demo to the
// standard scheme.
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

// ---------- Example pages ----------
// Web pages in a browser frame, made of the real components.

interface Snackbar extends HTMLElement {
  action: string;
  show(): Promise<string>;
}
type Dialog = HTMLElement & {show(): void; close(): void; returnValue: string};
type Props = HTMLElement & Record<string, unknown>;

function byId<T extends HTMLElement = Props>(id: string) {
  return document.getElementById(id) as unknown as T;
}

const snackbar = byId<Snackbar>('page-snackbar');

/** Shows a message at the bottom of the example page. */
function notify(message: string, action = '') {
  snackbar.textContent = message;
  snackbar.action = action;
  return snackbar.show();
}

function slotted(tag: string, slot: string, text: string) {
  const element = document.createElement(tag);
  element.slot = slot;
  element.textContent = text;
  return element;
}

// ----- Page and width -----

const ADDRESSES: Record<string, string> = {
  dashboard: 'app.example.com/orders',
  form: 'example.com/signup',
  shop: 'shop.example.com/bouquets',
};
const pages = [...document.querySelectorAll<HTMLElement>('#viewport .page')];
const notes = [...document.querySelectorAll<HTMLElement>('.scene-notes .notes')];
const sceneTabs = byId<HTMLElement & {activeTab: HTMLElement | null}>('scene-tabs');
sceneTabs.addEventListener('change', () => {
  const scene = sceneTabs.activeTab?.dataset['scene'] ?? 'dashboard';
  for (const element of [...pages, ...notes]) {
    element.hidden = element.dataset['scene'] !== scene;
  }
  byId('address').textContent = ADDRESSES[scene];
});

const browser = byId('browser');
byId('width-toggle').addEventListener('change', (event) => {
  const width = (event.target as HTMLElement).dataset['width'];
  browser.classList.toggle('mobile', width === 'mobile');
});

// ----- Dashboard -----

type Order = [id: string, customer: string, amount: number, status: string, when: string];
const ORDERS: Order[] = [
  ['#1048', 'Aiko Tanaka', 12800, 'Paid', 'Today 10:42'],
  ['#1047', 'Lucas Martin', 4500, 'Pending', 'Today 9:15'],
  ['#1046', 'Mei Chen', 23600, 'Paid', 'Yesterday'],
  ['#1045', 'Sam Rivera', 7200, 'Refunded', 'Yesterday'],
  ['#1044', 'Noah Weber', 15900, 'Paid', 'Mon'],
  ['#1043', 'Hana Suzuki', 3300, 'Pending', 'Mon'],
  ['#1042', 'Omar Haddad', 9800, 'Paid', 'Sun'],
  ['#1041', 'Lina Park', 18400, 'Paid', 'Sat'],
];
const STATUS_ICON: Record<string, string> = {
  Paid: 'check_circle',
  Pending: 'schedule',
  Refunded: 'undo',
};
const yen = (amount: number) => `¥${amount.toLocaleString('en-US')}`;

const orderList = byId('dash-orders');
function orderItem([id, customer, amount, status, when]: Order) {
  const item = document.createElement('petal-list-item');
  item.setAttribute('type', 'button');
  item.dataset['status'] = status;
  item.dataset['search'] = `${id} ${customer} ${status}`.toLowerCase();
  const icon = slotted('petal-icon', 'start', STATUS_ICON[status]);
  icon.className = `status ${status.toLowerCase()}`;
  item.append(
    icon,
    slotted('div', 'headline', `${customer} · ${id}`),
    slotted('div', 'supporting-text', `${status} · ${when}`),
    slotted('div', 'trailing-supporting-text', yen(amount)),
  );
  item.addEventListener('click', () => void notify(`Order ${id} opened`));
  return item;
}
ORDERS.forEach((order) => orderList.append(orderItem(order)));

// Filters and search together.
const statusChips = [
  ...document.querySelectorAll<HTMLElement & {selected: boolean}>('#dash-filters petal-filter-chip'),
];
const dashSearch = byId<HTMLElement & {value: string}>('dash-search');
let status = '';
function filterOrders() {
  const query = dashSearch.value.trim().toLowerCase();
  for (const item of orderList.querySelectorAll<HTMLElement>('petal-list-item')) {
    item.hidden =
      (!!status && item.dataset['status'] !== status) ||
      (!!query && !item.dataset['search']!.includes(query));
  }
}
// The chips act as one choice; the chip toggles itself after the click.
for (const chip of statusChips) {
  chip.addEventListener('click', () => {
    setTimeout(() => {
      status = chip.dataset['status'] ?? '';
      for (const other of statusChips) other.selected = other === chip;
      filterOrders();
    });
  });
}
dashSearch.addEventListener('input', filterOrders);

// The rail's menu button expands it.
const rail = byId<HTMLElement & {expanded: boolean}>('dash-rail');
const railToggle = byId('dash-rail-toggle');
railToggle.addEventListener('click', () => {
  rail.expanded = !rail.expanded;
  railToggle.setAttribute('aria-label', rail.expanded ? 'Collapse navigation' : 'Expand navigation');
  railToggle.querySelector('petal-icon')!.textContent = rail.expanded ? 'menu_open' : 'menu';
});

// Account menu.
const accountMenu = byId<HTMLElement & {open: boolean}>('dash-account-menu');
byId('dash-account').addEventListener('click', () => {
  accountMenu.open = !accountMenu.open;
});
byId('dash-sign-out').addEventListener('click', () => void notify('Signed out (not really)'));

// New order dialog.
const orderDialog = byId<Dialog>('order-dialog');
let nextOrder = 1049;
byId('dash-new').addEventListener('click', () => orderDialog.show());
orderDialog.addEventListener('close', () => {
  if (orderDialog.returnValue !== 'save') return;
  const customer = byId<HTMLInputElement>('order-customer').value.trim() || 'New customer';
  const amount = Number(byId<HTMLInputElement>('order-amount').value) || 0;
  const orderStatus = byId<HTMLElement & {value: string}>('order-status').value;
  const id = `#${nextOrder++}`;
  orderList.prepend(orderItem([id, customer, amount, orderStatus, 'Just now']));
  filterOrders();
  const count = byId('dash-count');
  count.textContent = String(Number(count.textContent) + 1);
  void notify(`Order ${id} saved`);
});

// ----- Sign-up form -----

type Field = HTMLElement & {
  value: string;
  type: string;
  error: boolean;
  checkValidity(): boolean;
  reportValidity(): boolean;
};

const signup = byId<HTMLFormElement>('signup');
const showPassword = byId<HTMLElement & {selected: boolean}>('signup-show');
const password = byId<Field>('signup-password');
showPassword.addEventListener('change', () => {
  password.type = showPassword.selected ? 'text' : 'password';
});
const teamSize = byId<HTMLElement & {value: number}>('signup-team');
teamSize.addEventListener('input', () => {
  byId('team-size-value').textContent = String(teamSize.value);
});
signup.addEventListener('reset', () => {
  setTimeout(() => (byId('team-size-value').textContent = String(teamSize.value)));
});
const progress = byId('signup-progress');
const submit = byId<HTMLElement & {disabled: boolean}>('signup-submit');
signup.addEventListener('submit', (event) => {
  event.preventDefault();
  const fields = [...signup.querySelectorAll<Field>('petal-outlined-text-field')];
  // Shows every error, and focuses the first one.
  const valid = fields.map((field) => field.reportValidity()).every(Boolean);
  if (!valid) {
    fields.find((field) => !field.checkValidity())?.focus();
    return;
  }
  progress.hidden = false;
  submit.disabled = true;
  setTimeout(() => {
    progress.hidden = true;
    submit.disabled = false;
    const name = byId<Field>('signup-name').value.trim().split(/\s+/)[0];
    byId('welcome-title').textContent = `Welcome, ${name}!`;
    byId<Dialog>('welcome-dialog').show();
  }, 1600);
});

// ----- Shop -----

type Product = [name: string, price: number, colors: string[], note: string];
const PRODUCTS: Record<string, Product[]> = {
  Bouquets: [
    ['Rose bouquet', 4800, ['#F48FB1', '#EC407A', '#F06292', '#F8BBD0'], 'Same-day delivery'],
    ['Sunny tulips', 3600, ['#FFD54F', '#FFB300', '#FFCA28', '#FFE082'], 'Eco packaging'],
    ['Lavender mix', 5200, ['#CE93D8', '#AB47BC', '#BA68C8', '#E1BEE7'], 'Same-day delivery'],
    ['Peony cloud', 6800, ['#F8BBD0', '#F48FB1', '#FCE4EC', '#F06292'], 'Limited'],
  ],
  Plants: [
    ['Monstera', 7400, ['#81C784', '#43A047', '#66BB6A', '#A5D6A7'], 'Eco packaging'],
    ['Olive tree', 9800, ['#AED581', '#7CB342', '#9CCC65', '#C5E1A5'], 'Large'],
    ['Cactus trio', 2400, ['#80CBC4', '#26A69A', '#4DB6AC', '#B2DFDB'], 'Same-day delivery'],
  ],
  Gifts: [
    ['Flower box', 5600, ['#FFAB91', '#FF7043', '#FF8A65', '#FFCCBC'], 'Gift card included'],
    ['Dried wreath', 4200, ['#BCAAA4', '#8D6E63', '#A1887F', '#D7CCC8'], 'Eco packaging'],
    ['Candle & bloom', 3900, ['#90CAF9', '#42A5F5', '#64B5F6', '#BBDEFB'], 'Same-day delivery'],
  ],
};

function flower(colors: string[]) {
  const [a, b, c, d] = colors;
  return `<svg viewBox="0 0 120 120" aria-hidden="true"><ellipse cx="60" cy="34" rx="16" ry="26" fill="${a}"/><ellipse cx="86" cy="60" rx="26" ry="16" fill="${b}"/><ellipse cx="60" cy="86" rx="16" ry="26" fill="${c}"/><ellipse cx="34" cy="60" rx="26" ry="16" fill="${d}"/><circle cx="60" cy="60" r="13" fill="#FFD54F"/></svg>`;
}

const cart: Product[] = [];
const products = byId('shop-products');
let tooltipId = 0;
function showProducts(category: string) {
  products.replaceChildren();
  for (const product of PRODUCTS[category]) {
    const [name, price, colors, note] = product;
    const card = document.createElement('petal-elevated-card');
    card.className = 'product';
    const save = `save-${tooltipId++}`;
    card.innerHTML = `
      <div class="product-image">${flower(colors)}</div>
      <div class="product-body">
        <div class="product-title"><b></b><span class="price">${yen(price)}</span></div>
        <span class="muted"></span>
        <div class="product-actions">
          <petal-filled-tonal-button class="add" aria-label="Add to cart"><petal-icon slot="icon">add_shopping_cart</petal-icon><span class="add-label">Add to cart</span></petal-filled-tonal-button>
          <petal-icon-button id="${save}" toggle aria-label="Save">
            <petal-icon>favorite</petal-icon>
            <petal-icon slot="selected" class="filled">favorite</petal-icon>
          </petal-icon-button>
          <petal-tooltip for="${save}">Save for later</petal-tooltip>
        </div>
      </div>`;
    card.querySelector('b')!.textContent = name;
    card.querySelector('.muted')!.textContent = note;
    card.querySelector('.add')!.addEventListener('click', async () => {
      cart.push(product);
      updateCart();
      const reason = await notify(`${name} added to the cart`, 'View cart');
      if (reason === 'action') openCart();
    });
    products.append(card);
  }
}
const shopTabs = byId<HTMLElement & {activeTab: HTMLElement | null}>('shop-tabs');
shopTabs.addEventListener('change', () => {
  const category = shopTabs.activeTab?.textContent?.trim() ?? 'Bouquets';
  byId('address').textContent = `shop.example.com/${category.toLowerCase()}`;
  showProducts(category);
});
showProducts('Bouquets');

const count = byId('shop-count');
function updateCart() {
  count.textContent = String(cart.length);
  count.hidden = cart.length === 0;
}

const cartDialog = byId<Dialog>('cart-dialog');
const cartList = byId('cart-list');
function openCart() {
  cartList.replaceChildren(
    ...cart.map(([name, price]) => {
      const item = document.createElement('petal-list-item');
      item.append(slotted('div', 'headline', name), slotted('div', 'trailing-supporting-text', yen(price)));
      return item;
    }),
  );
  const total = cart.reduce((sum, [, price]) => sum + price, 0);
  byId('cart-total').textContent = cart.length ? `Total ${yen(total)}` : 'Your cart is empty.';
  cartDialog.show();
}
byId('shop-cart').addEventListener('click', openCart);
byId('cart-close').addEventListener('click', () => cartDialog.close());

// Checkout: the split button pays, its arrow picks how.
const checkout = byId<HTMLElement & {checked: boolean}>('cart-checkout');
const payMenu = byId<HTMLElement & {open: boolean}>('cart-pay-menu');
checkout.addEventListener('change', () => {
  payMenu.open = checkout.checked;
});
payMenu.addEventListener('closed', () => {
  checkout.checked = false;
});
checkout.addEventListener('click', () => {
  cartDialog.close();
  if (!cart.length) return;
  cart.length = 0;
  updateCart();
  void notify('Order placed. Thank you!');
});

// ---------- Split button and progress demo ----------

{
  const split = document.getElementById('demo-split') as HTMLElement & {checked: boolean};
  const menu = document.getElementById('demo-split-menu') as HTMLElement & {open: boolean};
  const loading = document.getElementById('demo-loading')!;
  const progress = document.getElementById('demo-progress') as HTMLElement & {value: number};
  split.addEventListener('change', () => {
    menu.open = split.checked;
  });
  menu.addEventListener('closed', () => {
    split.checked = false;
  });
  // The main action: a download that takes two seconds.
  split.addEventListener('click', () => {
    if (!loading.hidden) return;
    loading.hidden = false;
    const start = performance.now();
    const step = (now: number) => {
      progress.value = Math.min(1, (now - start) / 2000);
      if (progress.value < 1) {
        requestAnimationFrame(step);
        return;
      }
      loading.hidden = true;
      setTimeout(() => (progress.value = 0), 800);
    };
    requestAnimationFrame(step);
  });
}
