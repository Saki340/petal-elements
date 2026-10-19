/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Renders one component as a grid of variants (rows) and
 * states (columns) for the visual regression tests.
 *
 *     /tests/visual/index.html?component=button&scheme=dark
 *
 * Hover, focus and pressed are simulated with the component harnesses
 * (testing/harness.ts), so all states show at once. `document.body` gets
 * `data-ready` when the grid is fully rendered.
 */

import '../../all.js';

import {html, nothing, render, TemplateResult} from 'lit';

import {ButtonHarness} from '../../button/harness.js';
import {CheckboxHarness} from '../../checkbox/harness.js';
import {ChipHarness} from '../../chips/harness.js';
import {FabHarness} from '../../fab/harness.js';
import {IconButtonHarness} from '../../iconbutton/harness.js';
import {RadioHarness} from '../../radio/harness.js';
import {SwitchHarness} from '../../switch/harness.js';
import {TabHarness} from '../../tabs/harness.js';
import {Harness} from '../../testing/harness.js';
import {TextFieldHarness} from '../../textfield/harness.js';

type State = 'default' | 'hover' | 'focus' | 'pressed' | 'disabled';

const INTERACTIVE: State[] = ['default', 'hover', 'focus', 'pressed', 'disabled'];

interface Row {
  name: string;
  render: (state: State) => TemplateResult;
}

interface Gallery {
  states: State[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  harness?: new (element: any) => Harness;
  rows: Row[];
}

const disabled = (state: State) => state === 'disabled';

/** A plain plus sign, so no icon font is needed. */
const plus = html`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11 5h2v14h-2zM5 11h14v2H5z" /></svg>`;
/** A plain square outline. */
const square = html`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 5h14v14H5zm2 2v10h10V7z" /></svg>`;
const icon = (slot?: string, svg = plus) =>
  html`<petal-icon slot=${slot ?? nothing}>${svg}</petal-icon>`;

const buttons = ['filled', 'outlined', 'text', 'elevated', 'filled-tonal'];

const galleries: Record<string, Gallery> = {
  button: {
    states: INTERACTIVE,
    harness: ButtonHarness,
    rows: buttons.flatMap((variant) => [
      {
        name: variant,
        render: (state) => {
          switch (variant) {
            case 'filled':
              return html`<petal-filled-button data-subject ?disabled=${disabled(state)}>Label</petal-filled-button>`;
            case 'outlined':
              return html`<petal-outlined-button data-subject ?disabled=${disabled(state)}>Label</petal-outlined-button>`;
            case 'text':
              return html`<petal-text-button data-subject ?disabled=${disabled(state)}>Label</petal-text-button>`;
            case 'elevated':
              return html`<petal-elevated-button data-subject ?disabled=${disabled(state)}>Label</petal-elevated-button>`;
            default:
              return html`<petal-filled-tonal-button data-subject ?disabled=${disabled(state)}>Label</petal-filled-tonal-button>`;
          }
        },
      },
      {
        name: `${variant} + icon`,
        render: (state) => {
          const content = html`${icon('icon')}Label`;
          switch (variant) {
            case 'filled':
              return html`<petal-filled-button data-subject has-icon ?disabled=${disabled(state)}>${content}</petal-filled-button>`;
            case 'outlined':
              return html`<petal-outlined-button data-subject has-icon ?disabled=${disabled(state)}>${content}</petal-outlined-button>`;
            case 'text':
              return html`<petal-text-button data-subject has-icon ?disabled=${disabled(state)}>${content}</petal-text-button>`;
            case 'elevated':
              return html`<petal-elevated-button data-subject has-icon ?disabled=${disabled(state)}>${content}</petal-elevated-button>`;
            default:
              return html`<petal-filled-tonal-button data-subject has-icon ?disabled=${disabled(state)}>${content}</petal-filled-tonal-button>`;
          }
        },
      },
    ]),
  },

  // Material 3 Expressive sizes. The pressed column shows the pressed shape.
  'button-sizes': {
    states: INTERACTIVE,
    harness: ButtonHarness,
    rows: [
      ...['xsmall', 'small', 'medium', 'large', 'xlarge'].flatMap((size) =>
        ['round', 'square'].map((shape) => ({
          name: `${size} ${shape}`,
          render: (state: State) =>
            html`<petal-filled-button data-subject size=${size} shape=${shape} ?disabled=${disabled(state)}>${icon('icon')}Label</petal-filled-button>`,
        })),
      ),
      ...['xsmall', 'medium', 'large', 'xlarge'].map((size) => ({
        name: `outlined ${size}`,
        render: (state: State) =>
          html`<petal-outlined-button data-subject size=${size} ?disabled=${disabled(state)}>Label</petal-outlined-button>`,
      })),
    ],
  },

  'toggle-button': {
    states: INTERACTIVE,
    harness: ButtonHarness,
    rows: ['filled', 'filled-tonal', 'outlined', 'elevated'].flatMap((variant) =>
      [
        ['off', false, 'round'],
        ['on', true, 'round'],
        ['on, square', true, 'square'],
      ].map(([suffix, selected, shape]) => ({
        name: `${variant} ${suffix}`,
        render: (state: State) => {
          const d = disabled(state);
          const content = html`${icon('icon')}Label`;
          switch (variant) {
            case 'filled':
              return html`<petal-filled-button data-subject toggle ?selected=${selected} size="small" shape=${shape} ?disabled=${d}>${content}</petal-filled-button>`;
            case 'filled-tonal':
              return html`<petal-filled-tonal-button data-subject toggle ?selected=${selected} size="small" shape=${shape} ?disabled=${d}>${content}</petal-filled-tonal-button>`;
            case 'outlined':
              return html`<petal-outlined-button data-subject toggle ?selected=${selected} size="small" shape=${shape} ?disabled=${d}>${content}</petal-outlined-button>`;
            default:
              return html`<petal-elevated-button data-subject toggle ?selected=${selected} size="small" shape=${shape} ?disabled=${d}>${content}</petal-elevated-button>`;
          }
        },
      })),
    ),
  },

  // The state is applied to the middle button. Pressed: in a standard group
  // the middle button widens and its neighbors give way; in a connected group
  // its inner corners shrink.
  'button-group': {
    states: ['default', 'hover', 'focus', 'pressed'],
    harness: ButtonHarness,
    rows: [
      {
        name: 'standard',
        render: () =>
          html`<petal-button-group><petal-filled-tonal-button>One</petal-filled-tonal-button><petal-filled-tonal-button data-subject>Two</petal-filled-tonal-button><petal-filled-tonal-button>Three</petal-filled-tonal-button></petal-button-group>`,
      },
      {
        name: 'standard medium',
        render: () =>
          html`<petal-button-group size="medium"><petal-filled-button>One</petal-filled-button><petal-filled-button data-subject>Two</petal-filled-button><petal-filled-button>Three</petal-filled-button></petal-button-group>`,
      },
      {
        name: 'connected',
        render: () =>
          html`<petal-button-group connected single-select><petal-filled-tonal-button toggle selected>One</petal-filled-tonal-button><petal-filled-tonal-button toggle data-subject>Two</petal-filled-tonal-button><petal-filled-tonal-button toggle>Three</petal-filled-tonal-button></petal-button-group>`,
      },
      {
        name: 'connected, middle on',
        render: () =>
          html`<petal-button-group connected><petal-outlined-button toggle>One</petal-outlined-button><petal-outlined-button toggle selected data-subject>Two</petal-outlined-button><petal-outlined-button toggle>Three</petal-outlined-button></petal-button-group>`,
      },
      {
        name: 'connected medium',
        render: () =>
          html`<petal-button-group connected size="medium"><petal-filled-button toggle>One</petal-filled-button><petal-filled-button toggle data-subject>Two</petal-filled-button><petal-filled-button toggle>Three</petal-filled-button></petal-button-group>`,
      },
    ],
  },

  'icon-button': {
    states: INTERACTIVE,
    harness: IconButtonHarness,
    rows: ['standard', 'filled', 'filled-tonal', 'outlined'].flatMap((variant) =>
      [
        ['', false, false],
        [' toggle off', true, false],
        [' toggle on', true, true],
      ].map(([suffix, toggle, selected]) => ({
        name: `${variant}${suffix}`,
        render: (state: State) => {
          const content = html`${icon()}${icon('selected', square)}`;
          const d = disabled(state);
          switch (variant) {
            case 'standard':
              return html`<petal-icon-button data-subject ?toggle=${toggle} ?selected=${selected} ?disabled=${d}>${content}</petal-icon-button>`;
            case 'filled':
              return html`<petal-filled-icon-button data-subject ?toggle=${toggle} ?selected=${selected} ?disabled=${d}>${content}</petal-filled-icon-button>`;
            case 'filled-tonal':
              return html`<petal-filled-tonal-icon-button data-subject ?toggle=${toggle} ?selected=${selected} ?disabled=${d}>${content}</petal-filled-tonal-icon-button>`;
            default:
              return html`<petal-outlined-icon-button data-subject ?toggle=${toggle} ?selected=${selected} ?disabled=${d}>${content}</petal-outlined-icon-button>`;
          }
        },
      })),
    ),
  },

  fab: {
    states: ['default', 'hover', 'focus', 'pressed'],
    harness: FabHarness,
    rows: [
      ...['surface', 'primary', 'secondary', 'tertiary'].map((variant) => ({
        name: variant,
        render: () => html`<petal-fab data-subject variant=${variant}>${icon('icon')}</petal-fab>`,
      })),
      ...['small', 'medium', 'large'].map((size) => ({
        name: `primary ${size}`,
        render: () => html`<petal-fab data-subject variant="primary" size=${size}>${icon('icon')}</petal-fab>`,
      })),
      {
        name: 'extended',
        render: () => html`<petal-fab data-subject variant="primary" label="Label">${icon('icon')}</petal-fab>`,
      },
      ...['small', 'medium', 'large'].map((size) => ({
        name: `extended ${size}`,
        render: () =>
          html`<petal-fab data-subject size=${size} label="Label">${icon('icon')}</petal-fab>`,
      })),
      {
        name: 'collapsed',
        render: () =>
          html`<petal-fab data-subject label="Label" .expanded=${false}>${icon('icon')}</petal-fab>`,
      },
      {
        name: 'lowered',
        render: () => html`<petal-fab data-subject lowered>${icon('icon')}</petal-fab>`,
      },
    ],
  },

  'fab-filled': {
    states: ['default', 'hover', 'focus', 'pressed'],
    harness: FabHarness,
    rows: [
      ...['primary', 'secondary', 'tertiary'].map((color) => ({
        name: color,
        render: () => html`<petal-fab data-subject variant=${`filled-${color}`}>${icon('icon')}</petal-fab>`,
      })),
      ...['small', 'large'].map((size) => ({
        name: `primary ${size}`,
        render: () => html`<petal-fab data-subject variant="filled-primary" size=${size}>${icon('icon')}</petal-fab>`,
      })),
      ...['primary', 'secondary', 'tertiary'].map((color) => ({
        name: `${color} extended`,
        render: () => html`<petal-fab data-subject variant=${`filled-${color}`} label="Label">${icon('icon')}</petal-fab>`,
      })),
    ],
  },

  checkbox: {
    states: INTERACTIVE,
    harness: CheckboxHarness,
    rows: [
      ['unchecked', false, false],
      ['checked', true, false],
      ['indeterminate', false, true],
    ].map(([name, checked, indeterminate]) => ({
      name: name as string,
      render: (state) =>
        html`<petal-checkbox data-subject ?checked=${checked} ?indeterminate=${indeterminate} ?disabled=${disabled(state)}></petal-checkbox>`,
    })),
  },

  radio: {
    states: INTERACTIVE,
    harness: RadioHarness,
    rows: [
      ['unchecked', false],
      ['checked', true],
    ].map(([name, checked]) => ({
      name: name as string,
      render: (state) =>
        html`<petal-radio data-subject name=${`r-${name}-${state}`} ?checked=${checked} ?disabled=${disabled(state)}></petal-radio>`,
    })),
  },

  switch: {
    states: INTERACTIVE,
    harness: SwitchHarness,
    rows: [
      ['off', false, ''],
      ['on', true, ''],
      ['off, icons', false, 'icons'],
      ['on, icons', true, 'icons'],
      ['on, selected icon only', true, 'selected'],
    ].map(([name, selected, icons]) => ({
      name: name as string,
      render: (state) =>
        html`<petal-switch data-subject ?selected=${selected} ?icons=${icons !== ''} ?show-only-selected-icon=${icons === 'selected'} ?disabled=${disabled(state)}></petal-switch>`,
    })),
  },

  'text-field': {
    states: ['default', 'hover', 'focus', 'disabled'],
    harness: TextFieldHarness,
    rows: ['filled', 'outlined'].flatMap((variant) =>
      [
        {name: 'empty', props: {}},
        {name: 'value', props: {value: 'Value'}},
        {name: 'supporting text', props: {value: 'Value', supportingText: 'Supporting text'}},
        {name: 'error', props: {value: 'Value', error: true, errorText: 'Error text'}},
        {name: 'icons', props: {value: 'Value', icons: true}},
      ].map(({name, props}) => ({
        name: `${variant} ${name}`,
        render: (state: State) => {
          const p = props as {value?: string; supportingText?: string; error?: boolean; errorText?: string; icons?: boolean};
          const content = p.icons ? html`${icon('leading-icon')}${icon('trailing-icon', square)}` : nothing;
          return variant === 'filled'
            ? html`<petal-filled-text-field data-subject label="Label" .value=${p.value ?? ''} supporting-text=${p.supportingText ?? nothing} ?error=${p.error} error-text=${p.errorText ?? nothing} ?disabled=${disabled(state)}>${content}</petal-filled-text-field>`
            : html`<petal-outlined-text-field data-subject label="Label" .value=${p.value ?? ''} supporting-text=${p.supportingText ?? nothing} ?error=${p.error} error-text=${p.errorText ?? nothing} ?disabled=${disabled(state)}>${content}</petal-outlined-text-field>`;
        },
      })),
    ),
  },

  chips: {
    states: INTERACTIVE,
    harness: ChipHarness,
    rows: [
      {name: 'assist', render: (s: State) => html`<petal-assist-chip data-subject label="Assist" ?disabled=${disabled(s)}>${icon('icon')}</petal-assist-chip>`},
      {name: 'assist elevated', render: (s: State) => html`<petal-assist-chip data-subject elevated label="Assist" ?disabled=${disabled(s)}>${icon('icon')}</petal-assist-chip>`},
      {name: 'filter', render: (s: State) => html`<petal-filter-chip data-subject label="Filter" ?disabled=${disabled(s)}></petal-filter-chip>`},
      {name: 'filter selected', render: (s: State) => html`<petal-filter-chip data-subject selected label="Filter" ?disabled=${disabled(s)}></petal-filter-chip>`},
      {name: 'filter removable', render: (s: State) => html`<petal-filter-chip data-subject removable selected label="Filter" ?disabled=${disabled(s)}></petal-filter-chip>`},
      {name: 'filter expressive', render: (s: State) => html`<petal-filter-chip data-subject expressive selected label="Filter" ?disabled=${disabled(s)}></petal-filter-chip>`},
      {name: 'input', render: (s: State) => html`<petal-input-chip data-subject label="Input" ?disabled=${disabled(s)}></petal-input-chip>`},
      {name: 'suggestion', render: (s: State) => html`<petal-suggestion-chip data-subject label="Suggestion" ?disabled=${disabled(s)}></petal-suggestion-chip>`},
    ],
  },

  // Top app bars stick to the top of the page; here each is in its own cell.
  'top-app-bar': {
    states: ['default'],
    rows: [
      ['small', 'headline="Inbox"', ''],
      ['small subtitle', 'headline="Inbox" subtitle="12 unread"', ''],
      ['medium', 'size="medium" headline="Inbox"', ''],
      ['medium subtitle', 'size="medium" headline="Inbox" subtitle="12 unread"', ''],
      ['medium centered', 'size="medium" centered headline="Inbox" subtitle="12 unread"', ''],
      ['large', 'size="large" headline="Inbox"', ''],
      ['large subtitle', 'size="large" headline="Inbox" subtitle="12 unread"', ''],
    ].map(([name, attributes, style]) => ({
      name,
      render: () => {
        const bar = document.createElement('petal-top-app-bar');
        for (const attribute of attributes.match(/[\w-]+(="[^"]*")?/g) ?? []) {
          const [key, value = ''] = attribute.split('=');
          bar.setAttribute(key, value.replace(/"/g, ''));
        }
        bar.style.cssText = `position: static; width: 400px; ${style}`;
        const button = (slot: string, label: string) => {
          const element = document.createElement('petal-icon-button');
          element.slot = slot;
          element.setAttribute('aria-label', label);
          render(icon(undefined, square), element);
          return element;
        };
        bar.append(button('navigation', 'Menu'), button('actions', 'Search'));
        return html`${bar}`;
      },
    })),
  },

  card: {
    states: ['default'],
    rows: (['filled', 'elevated', 'outlined'] as const).flatMap((variant) => {
      const card = (attributes: string, text: string) => {
        const element = document.createElement(`petal-${variant}-card`);
        for (const name of attributes.split(' ').filter(Boolean)) element.setAttribute(name, '');
        element.style.cssText = 'width: 220px; padding: 16px; font: 400 14px/20px Roboto';
        element.textContent = text;
        return html`${element}`;
      };
      return [
        {name: variant, render: () => card('', 'Card content')},
        {name: `${variant} dragged`, render: () => card('dragged', 'Dragged')},
        {name: `${variant} disabled`, render: () => card('clickable disabled', 'Disabled')},
      ];
    }),
  },

  // The indeterminate indicator moves with time; the gallery shows
  // determinate values.
  'loading-indicator': {
    states: ['default'],
    rows: ['0', '0.25', '0.5', '0.75', '1'].flatMap((value) => [
      {name: value, render: () => html`<petal-loading-indicator value=${value}></petal-loading-indicator>`},
      {name: `${value} contained`, render: () => html`<petal-loading-indicator contained value=${value}></petal-loading-indicator>`},
    ]),
  },

  // Snackbars are fixed to the bottom of the page; here they sit in the grid.
  snackbar: {
    states: ['default'],
    rows: [
      ['message', ''],
      ['action', 'action="Undo"'],
      ['dismiss', 'dismissible'],
      ['action and dismiss', 'action="Undo" dismissible'],
      ['two lines', 'action="Undo"', 'Photo saved to the album. It will be backed up the next time the device is charging.'],
      ['action on new line', 'action="Open settings" action-on-new-line dismissible', 'Storage is almost full.'],
    ].map(([name, attributes, text = 'Message sent']) => ({
      name,
      render: () => {
        const snackbar = document.createElement('petal-snackbar');
        snackbar.innerHTML = text;
        for (const attribute of attributes.match(/[\w-]+(="[^"]*")?/g) ?? []) {
          const [key, value = ''] = attribute.split('=');
          snackbar.setAttribute(key, value.replace(/"/g, ''));
        }
        snackbar.setAttribute('open', '');
        snackbar.style.cssText = 'position: static; display: block; width: 480px; padding: 0';
        return html`${snackbar}`;
      },
    })),
  },

  // Tooltips are popovers next to their anchor; here they show in place.
  tooltip: {
    states: ['default'],
    rows: [
      ['short', 'Save'],
      ['long', 'Copies the link to this page, so you can share it in a message.'],
    ].map(([name, text]) => ({
      name,
      render: () => html`<petal-tooltip style="display: block; position: static">${text}</petal-tooltip>`,
    })),
  },

  badge: {
    states: ['default'],
    rows: [
      {name: 'dot', render: () => html`<petal-badge></petal-badge>`},
      {name: 'value', render: () => html`<petal-badge value="3"></petal-badge>`},
      {name: 'long value', render: () => html`<petal-badge value="999+"></petal-badge>`},
      {name: 'icon button dot', render: () => html`<petal-icon-button aria-label="Icon">${icon()}<petal-badge slot="badge"></petal-badge></petal-icon-button>`},
      {name: 'icon button value', render: () => html`<petal-icon-button aria-label="Icon">${icon()}<petal-badge slot="badge" value="12"></petal-badge></petal-icon-button>`},
      {name: 'navigation item', render: () => html`<petal-navigation-bar style="width: 120px"><petal-navigation-bar-item selected>${icon('icon')}<petal-badge slot="badge" value="5"></petal-badge>Inbox</petal-navigation-bar-item></petal-navigation-bar>`},
    ],
  },

  progress: {
    states: ['default'],
    rows: [
      {name: 'linear 40%', render: () => html`<petal-linear-progress value="0.4"></petal-linear-progress>`},
      {name: 'linear buffer', render: () => html`<petal-linear-progress value="0.4" buffer="0.7"></petal-linear-progress>`},
      {name: 'linear indeterminate', render: () => html`<petal-linear-progress indeterminate></petal-linear-progress>`},
      {name: 'circular 40%', render: () => html`<petal-circular-progress value="0.4"></petal-circular-progress>`},
      {name: 'circular indeterminate', render: () => html`<petal-circular-progress indeterminate></petal-circular-progress>`},
    ],
  },

  tabs: {
    states: ['default', 'hover', 'focus', 'pressed'],
    harness: TabHarness,
    // The state is applied to the second, inactive tab.
    rows: [
      {
        name: 'primary',
        render: () => html`<petal-tabs><petal-primary-tab>One</petal-primary-tab><petal-primary-tab data-subject>Two</petal-primary-tab><petal-primary-tab>Three</petal-primary-tab></petal-tabs>`,
      },
      {
        name: 'primary + icon',
        render: () => html`<petal-tabs><petal-primary-tab has-icon>${icon('icon')}One</petal-primary-tab><petal-primary-tab data-subject has-icon>${icon('icon')}Two</petal-primary-tab><petal-primary-tab has-icon>${icon('icon')}Three</petal-primary-tab></petal-tabs>`,
      },
      {
        name: 'secondary',
        render: () => html`<petal-tabs><petal-secondary-tab>One</petal-secondary-tab><petal-secondary-tab data-subject>Two</petal-secondary-tab><petal-secondary-tab>Three</petal-secondary-tab></petal-tabs>`,
      },
    ],
  },
};

async function settle() {
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
}

/** Waits for every Lit element in the tree, including shadow roots. */
async function updateAll(root: ParentNode) {
  for (const element of root.querySelectorAll('*')) {
    const update = (element as {updateComplete?: Promise<unknown>}).updateComplete;
    if (update) await update;
    if (element.shadowRoot) await updateAll(element.shadowRoot);
  }
}

async function main() {
  const params = new URLSearchParams(location.search);
  const name = params.get('component') ?? '';
  const gallery = galleries[name];
  if (!gallery) throw new Error(`Unknown component "${name}"`);
  document.documentElement.style.colorScheme = params.get('scheme') ?? 'light';

  const root = document.getElementById('gallery')!;
  render(
    html`<table>
      <thead><tr><th></th>${gallery.states.map((s) => html`<th>${s}</th>`)}</tr></thead>
      <tbody>
        ${gallery.rows.map(
          (row) => html`<tr>
            <th>${row.name}</th>
            ${gallery.states.map((state) => html`<td data-state=${state}>${row.render(state)}</td>`)}
          </tr>`,
        )}
      </tbody>
    </table>`,
    root,
  );

  await Promise.all([document.fonts.load('400 16px Roboto'), document.fonts.load('500 16px Roboto')]);
  await updateAll(root);

  if (gallery.harness) {
    for (const cell of root.querySelectorAll<HTMLElement>('td[data-state]')) {
      const subject = cell.querySelector<HTMLElement>('[data-subject]');
      if (!subject) throw new Error(`No [data-subject] in ${name}`);
      const harness = new gallery.harness(subject);
      switch (cell.dataset['state']) {
        case 'hover':
          await harness.startHover();
          break;
        case 'focus':
          await harness.focusWithKeyboard();
          break;
        case 'pressed':
          await harness.startClickWithMouse();
          break;
        default:
          break;
      }
    }
  }

  await updateAll(root);
  await document.fonts.ready;
  await settle();
  // End every animation and transition (shadow roots included): finite ones
  // jump to their end state, infinite ones (indeterminate progress) are
  // removed, so each run renders the same frame.
  for (const animation of document.getAnimations()) {
    if (animation.effect?.getComputedTiming().endTime === Infinity) {
      animation.cancel();
    } else {
      animation.finish();
    }
  }
  await settle();
  document.body.dataset['ready'] = '';
}

main().catch((error: Error) => {
  document.body.dataset['error'] = error.message;
  throw error;
});
