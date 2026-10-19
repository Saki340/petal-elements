/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

// Checks the chips against Jetpack Compose Material 3 (Chip.kt,
// AssistChipTokens, FilterChipTokens, InputChipTokens, SuggestionChipTokens
// and ChipsTokens at androidx commit df73c24).

import {html} from 'lit';

import {Environment} from '../testing/environment.js';

import './assist-chip.js';
import './filter-chip.js';
import './input-chip.js';
import './suggestion-chip.js';

import type {Chip} from './internal/chip.js';

// Fallbacks of the light scheme (no theme on the test page).
const ON_SURFACE = 'rgb(29, 27, 32)';
const ON_SURFACE_VARIANT = 'rgb(73, 69, 79)';
const ON_SECONDARY_CONTAINER = 'rgb(74, 68, 88)';
const PRIMARY = 'rgb(103, 80, 164)';

const ICON = html`<svg slot="icon" viewBox="0 0 18 18"></svg>`;

describe('chips after Compose', () => {
  const env = new Environment();

  async function setup(template: ReturnType<typeof html>) {
    const root = env.render(template);
    await env.waitForStability();
    return [...root.querySelectorAll('[label]')] as Chip[];
  }

  function part(chip: Chip, selector: string) {
    return chip.renderRoot.querySelector(selector) as HTMLElement;
  }

  /** The space before and after the label, and the trailing icon's gaps. */
  function layout(chip: Chip) {
    const host = chip.getBoundingClientRect();
    const label = part(chip, '.label-text').getBoundingClientRect();
    const trailing = part(chip, '.trailing.icon')?.getBoundingClientRect();
    return {
      start: Math.round(label.left - host.left),
      end: Math.round(host.right - label.right),
      gap: trailing ? Math.round(trailing.left - label.right) : undefined,
      trailingEnd: trailing ? Math.round(host.right - trailing.right) : undefined,
    };
  }

  const radius = (chip: Chip) => getComputedStyle(chip).borderTopLeftRadius;

  describe('layout (ContentPadding and the 8dp between the elements)', () => {
    it('pads assist, suggestion and filter chips by 16px, 8px next to an icon', async () => {
      const [assist, assistIcon, suggestion, filter, removable] = await setup(html`
        <petal-assist-chip label="Assist"></petal-assist-chip>
        <petal-assist-chip label="Assist">${ICON}</petal-assist-chip>
        <petal-suggestion-chip label="Suggestion"></petal-suggestion-chip>
        <petal-filter-chip label="Filter"></petal-filter-chip>
        <petal-filter-chip label="Filter" removable></petal-filter-chip>
      `);
      expect(layout(assist)).toEqual(jasmine.objectContaining({start: 16, end: 16}));
      // 8 + 18 + 8.
      expect(layout(assistIcon)).toEqual(jasmine.objectContaining({start: 34, end: 16}));
      expect(layout(suggestion)).toEqual(jasmine.objectContaining({start: 16, end: 16}));
      expect(layout(filter)).toEqual(jasmine.objectContaining({start: 16, end: 16}));
      expect(layout(removable)).toEqual(
        jasmine.objectContaining({start: 16, gap: 8, trailingEnd: 8}),
      );
    });

    it('makes room for the checkmark of a selected filter chip', async () => {
      const [selected] = await setup(html`
        <petal-filter-chip label="Filter" selected></petal-filter-chip>
      `);
      expect(layout(selected)).toEqual(jasmine.objectContaining({start: 34, end: 16}));
    });

    it('pads input chips by 12px (inputChipPadding: 4dp + 8dp)', async () => {
      const [input, withIcon, avatar] = await setup(html`
        <petal-input-chip label="Input"></petal-input-chip>
        <petal-input-chip label="Input">${ICON}</petal-input-chip>
        <petal-input-chip label="Input" avatar>${ICON}</petal-input-chip>
      `);
      expect(layout(input)).toEqual(
        jasmine.objectContaining({start: 12, gap: 8, trailingEnd: 8}),
      );
      expect(layout(withIcon).start).toBe(34);
      // 4 + 24 + 8.
      expect(layout(avatar).start).toBe(36);
    });
  });

  describe('shape', () => {
    it('is corner.small, also with an avatar', async () => {
      const chips = await setup(html`
        <petal-assist-chip label="Assist"></petal-assist-chip>
        <petal-filter-chip label="Filter" selected></petal-filter-chip>
        <petal-input-chip label="Input" avatar>${ICON}</petal-input-chip>
        <petal-suggestion-chip label="Suggestion"></petal-suggestion-chip>
      `);
      for (const chip of chips) {
        expect(radius(chip)).withContext(chip.localName).toBe('8px');
      }
    });
  });

  describe('colors', () => {
    function ripple(chip: Chip) {
      const style = getComputedStyle(part(chip, 'petal-ripple'));
      return [
        style.getPropertyValue('--md-ripple-hover-color').trim(),
        style.getPropertyValue('--md-ripple-pressed-color').trim(),
      ];
    }

    function color(value: string) {
      const probe = document.createElement('div');
      probe.style.color = value;
      document.body.append(probe);
      const result = getComputedStyle(probe).color;
      probe.remove();
      return result;
    }

    it('gives the ripple the content color of the Surface', async () => {
      const [assist, suggestion, filter, selected, input] = await setup(html`
        <petal-assist-chip label="Assist"></petal-assist-chip>
        <petal-suggestion-chip label="Suggestion"></petal-suggestion-chip>
        <petal-filter-chip label="Filter"></petal-filter-chip>
        <petal-filter-chip label="Filter" selected></petal-filter-chip>
        <petal-input-chip label="Input"></petal-input-chip>
      `);
      for (const chip of [assist, suggestion, filter, input]) {
        expect(ripple(chip).map(color)).withContext(chip.localName).toEqual([ON_SURFACE, ON_SURFACE]);
      }
      expect(ripple(selected).map(color)).toEqual([
        ON_SECONDARY_CONTAINER,
        ON_SECONDARY_CONTAINER,
      ]);
    });

    it('uses the primary leading icon color', async () => {
      const [filter] = await setup(html`
        <petal-filter-chip label="Filter">${ICON}</petal-filter-chip>
      `);
      expect(getComputedStyle(part(filter, '.leading.icon')).color).toBe(PRIMARY);
    });

    it('has the LabelLarge letter spacing', async () => {
      const [assist] = await setup(html`
        <petal-assist-chip label="Assist"></petal-assist-chip>
      `);
      expect(getComputedStyle(part(assist, '.label')).letterSpacing).toBe('0.1px');
    });
  });

  describe('filter chip', () => {
    it('raises a flat chip to level 1 while hovered', async () => {
      const [filter] = await setup(html`
        <petal-filter-chip label="Filter"></petal-filter-chip>
      `);
      expect(part(filter, 'petal-elevation')).not.toBeNull();
      expect(
        getComputedStyle(filter).getPropertyValue('--_flat-hover-container-elevation').trim(),
      ).toBe('1');
    });

    it('keeps the checkmark rendered and shows it while selected', async () => {
      const [filter, selected] = await setup(html`
        <petal-filter-chip label="Filter"></petal-filter-chip>
        <petal-filter-chip label="Filter" selected></petal-filter-chip>
      `);
      expect(part(filter, '.checkmark')).not.toBeNull();
      expect(getComputedStyle(part(filter, '.selected-icon')).opacity).toBe('0');
      expect(getComputedStyle(part(selected, '.selected-icon')).opacity).toBe('1');
    });

    it('expands the icon on the fast spatial spring and shrinks it on the default effects spring', async () => {
      const [filter, selected] = await setup(html`
        <petal-filter-chip label="Filter"></petal-filter-chip>
        <petal-filter-chip label="Filter" selected></petal-filter-chip>
      `);
      expect(getComputedStyle(part(selected, '.leading.icon')).transitionDuration).toBe('0.359s');
      expect(getComputedStyle(part(filter, '.leading.icon')).transitionDuration).toBe('0.23s');
      expect(getComputedStyle(part(selected, '.selected-icon')).transitionDuration).toBe('0.326s');
      expect(getComputedStyle(part(filter, '.selected-icon')).transitionDuration).toBe('0.149s');
    });
  });

  describe('expressive', () => {
    it('morphs from corner.medium to fully rounded when selected', async () => {
      const [filter, selected, input, inputSelected] = await setup(html`
        <petal-filter-chip label="Filter" expressive></petal-filter-chip>
        <petal-filter-chip label="Filter" expressive selected></petal-filter-chip>
        <petal-input-chip label="Input" expressive></petal-input-chip>
        <petal-input-chip label="Input" expressive selected></petal-input-chip>
      `);
      expect(radius(filter)).toBe('12px');
      expect(radius(selected)).toBe('16px');
      expect(radius(input)).toBe('12px');
      expect(radius(inputSelected)).toBe('16px');
      expect(getComputedStyle(filter).transitionDuration).toContain('0.359s');
    });

    it('uses CompactHorizontalSpacing next to the icons', async () => {
      const [selected, removable, removableSelected, input, inputIcon] = await setup(html`
        <petal-filter-chip label="Filter" expressive selected></petal-filter-chip>
        <petal-filter-chip label="Filter" expressive removable></petal-filter-chip>
        <petal-filter-chip label="Filter" expressive removable selected></petal-filter-chip>
        <petal-input-chip label="Input" expressive></petal-input-chip>
        <petal-input-chip label="Input" expressive>${ICON}</petal-input-chip>
      `);
      // 8 + 18 + 4.
      expect(layout(selected)).toEqual(jasmine.objectContaining({start: 30, end: 16}));
      expect(layout(removable)).toEqual(jasmine.objectContaining({start: 12, gap: 8}));
      expect(layout(removableSelected)).toEqual(jasmine.objectContaining({start: 30, gap: 4}));
      expect(layout(input)).toEqual(jasmine.objectContaining({start: 8, gap: 8}));
      expect(layout(inputIcon)).toEqual(jasmine.objectContaining({start: 30, gap: 4}));
    });

    it('has an on-surface-variant leading icon', async () => {
      const [filter] = await setup(html`
        <petal-filter-chip label="Filter" expressive>${ICON}</petal-filter-chip>
      `);
      expect(getComputedStyle(part(filter, '.leading.icon')).color).toBe(ON_SURFACE_VARIANT);
    });
  });
});
