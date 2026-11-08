/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * The miniature of each component on the components page. Rendered on the
 * server and never hydrated: components that show nothing until they are
 * opened are drawn with the `.m-*` boxes of components-index.css instead.
 */

const icon = (name) => `<petal-icon>${name}</petal-icon>`;
const line = (width) => `<i class="m-line" style="width:${width}"></i>`;
const icons = (...names) => names.map(icon).join('');

module.exports = {
  button: `<petal-filled-button>Button</petal-filled-button>`,
  'button-group': `<petal-button-group connected>
    <petal-filled-tonal-button>Day</petal-filled-tonal-button>
    <petal-filled-button>Week</petal-filled-button>
    <petal-filled-tonal-button>Year</petal-filled-tonal-button>
  </petal-button-group>`,
  'icon-button': `<petal-filled-icon-button>${icon('favorite')}</petal-filled-icon-button>
    <petal-filled-tonal-icon-button>${icon('bookmark')}</petal-filled-tonal-icon-button>
    <petal-outlined-icon-button>${icon('share')}</petal-outlined-icon-button>`,
  fab: `<petal-fab variant="primary"><petal-icon slot="icon">add</petal-icon></petal-fab>`,
  'fab-menu': `<div class="m-column end">
    <span class="m-pill tonal">${icon('edit')}Note</span>
    <span class="m-pill tonal">${icon('checklist')}List</span>
    <span class="m-round primary">${icon('close')}</span>
  </div>`,
  'split-button': `<petal-split-button>Save</petal-split-button>`,
  'segmented-button': `<div class="m-segments">
    <span class="on">${icon('check')}Day</span><span>Week</span><span>Month</span>
  </div>`,

  badge: `<petal-icon-button>${icon('mail')}<petal-badge slot="badge" value="3"></petal-badge></petal-icon-button>
    <petal-icon-button>${icon('notifications')}<petal-badge slot="badge"></petal-badge></petal-icon-button>`,
  'loading-indicator': `<petal-shape class="m-48" shape="cookie-9-sided"></petal-shape>`,
  progress: `<div class="m-column stretch">
    <petal-linear-progress value="0.62"></petal-linear-progress>
    <petal-linear-progress value="0.3"></petal-linear-progress>
  </div>`,
  'pull-to-refresh': `<div class="m-window">
    <petal-shape class="m-32 float" shape="flower"></petal-shape>
    ${line('80%')}${line('62%')}${line('74%')}
  </div>`,
  snackbar: `<span class="m-snackbar">Message sent <b>Undo</b></span>`,
  tooltip: `<div class="m-column"><span class="m-tip">Bookmark</span>
    <petal-icon-button>${icon('bookmark')}</petal-icon-button></div>`,

  'bottom-sheet': `<div class="m-window"><div class="m-sheet"><i></i>${line('70%')}${line('50%')}</div></div>`,
  card: `<div class="m-card"><div class="m-media"></div>${line('70%')}${line('46%')}</div>`,
  carousel: `<div class="m-carousel"><i></i><i></i><i></i><i></i></div>`,
  dialog: `<div class="m-card dialog"><b>Discard draft?</b>${line('90%')}${line('60%')}
    <span class="m-actions"><u>Cancel</u><u>Discard</u></span></div>`,
  divider: `<div class="m-column stretch">${line('74%')}<petal-divider></petal-divider>${line('56%')}<petal-divider></petal-divider>${line('68%')}</div>`,
  list: `<div class="m-list">
    <span><i class="m-dot"></i>${line('66%')}</span>
    <span class="on"><i class="m-dot"></i>${line('50%')}</span>
    <span><i class="m-dot"></i>${line('60%')}</span>
  </div>`,

  'top-app-bar': `<div class="m-window"><div class="m-bar">${icon('menu')}<b>Inbox</b>${icon('search')}</div></div>`,
  'bottom-app-bar': `<div class="m-window end"><div class="m-bar">${icons('check_box', 'edit', 'mic')}<span class="m-square">${icon('add')}</span></div></div>`,
  'navigation-bar': `<div class="m-window end"><div class="m-nav">
    <span class="on">${icon('home')}</span><span>${icon('search')}</span><span>${icon('bookmark')}</span>
  </div></div>`,
  'navigation-drawer': `<div class="m-window row"><div class="m-drawer">
    <span class="on">${line('70%')}</span><span>${line('54%')}</span><span>${line('62%')}</span>
  </div></div>`,
  'navigation-rail': `<div class="m-window row"><div class="m-rail">
    <span class="on">${icon('home')}</span><span>${icon('search')}</span><span>${icon('person')}</span>
  </div></div>`,
  'floating-toolbar': `<div class="m-toolbar">${icons('format_bold', 'format_italic', 'format_underlined')}</div>`,
  tabs: `<div class="m-tabs"><span class="on">Photos</span><span>Videos</span><span>Music</span></div>`,
  menu: `<div class="m-card menu"><span class="on">Copy</span><span>Paste</span><span>Delete</span></div>`,

  checkbox: `<petal-checkbox checked></petal-checkbox><petal-checkbox></petal-checkbox><petal-checkbox indeterminate></petal-checkbox>`,
  chip: `<div class="m-chips"><span class="on">${icon('check')}Filter</span><span>Assist</span></div>`,
  radio: `<petal-radio checked></petal-radio><petal-radio></petal-radio>`,
  select: `<div class="m-field">Fruit ${icon('arrow_drop_down')}</div>`,
  slider: `<petal-slider value="60" class="m-stretch"></petal-slider>`,
  switch: `<petal-switch selected></petal-switch><petal-switch></petal-switch>`,
  'date-picker': `<div class="m-calendar">${Array.from({length: 21}, (_, i) => `<i${i === 9 ? ' class="on"' : ''}></i>`).join('')}</div>`,
  'time-picker': `<div class="m-dial"><i></i></div>`,

  'text-field': `<div class="m-field">Name</div>`,
  search: `<div class="m-search">${icon('search')}Search${icon('mic')}</div>`,

  shape: `<petal-shape class="m-72" shape="flower"></petal-shape>`,
  icon: icons('home', 'favorite', 'star'),
  elevation: `<div class="m-lift one"></div><div class="m-lift two"></div><div class="m-lift three"></div>`,
  ripple: `<div class="m-ripple"><i></i></div>`,
  'focus-ring': `<span class="m-focus"><petal-filled-tonal-button>Focus</petal-filled-tonal-button></span>`,
};
