/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * The groups of the component pages, in the order of the navigation and the
 * components page. `items` are the file names in docs/components; the build
 * fails if a page is in no group, so a new page cannot go missing.
 */
module.exports = [
  {
    id: 'actions',
    name: 'Actions',
    blurb: 'Start something: buttons, in every size and grouping.',
    shape: 'cookie-9-sided',
    tint: 'primary',
    items: [
      'button',
      'button-group',
      'icon-button',
      'fab',
      'fab-menu',
      'split-button',
      'segmented-button',
    ],
  },
  {
    id: 'communication',
    name: 'Communication',
    blurb: 'Tell people what is happening and what just changed.',
    shape: 'sunny',
    tint: 'tertiary',
    items: [
      'badge',
      'loading-indicator',
      'progress',
      'pull-to-refresh',
      'snackbar',
      'tooltip',
    ],
  },
  {
    id: 'containment',
    name: 'Containment',
    blurb: 'Hold and separate related content.',
    shape: 'arch',
    tint: 'secondary',
    items: ['bottom-sheet', 'card', 'carousel', 'dialog', 'divider', 'list'],
  },
  {
    id: 'navigation',
    name: 'Navigation',
    blurb: 'Move between the places of an app.',
    shape: 'arrow',
    tint: 'primary',
    items: [
      'top-app-bar',
      'bottom-app-bar',
      'navigation-bar',
      'navigation-drawer',
      'navigation-rail',
      'floating-toolbar',
      'tabs',
      'menu',
    ],
  },
  {
    id: 'selection',
    name: 'Selection',
    blurb: 'Pick options, values, dates and times.',
    shape: 'flower',
    tint: 'tertiary',
    items: [
      'checkbox',
      'chip',
      'radio',
      'select',
      'slider',
      'switch',
      'date-picker',
      'time-picker',
    ],
  },
  {
    id: 'text-input',
    name: 'Text input',
    blurb: 'Type and find.',
    shape: 'pill',
    tint: 'secondary',
    items: ['text-field', 'search'],
  },
  {
    id: 'foundations',
    name: 'Foundations',
    blurb: 'The pieces every other component is built from.',
    shape: 'gem',
    tint: 'primary',
    items: ['shape', 'icon', 'elevation', 'ripple', 'focus-ring'],
  },
];
