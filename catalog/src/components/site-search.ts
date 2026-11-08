/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

import 'petal-elements/dialog/dialog.js';
import 'petal-elements/icon/icon.js';
import 'petal-elements/list/list.js';
import 'petal-elements/list/list-item.js';
import 'petal-elements/textfield/outlined-text-field.js';

import type {PetalDialog} from 'petal-elements/dialog/dialog.js';
import type {PetalOutlinedTextField} from 'petal-elements/textfield/outlined-text-field.js';
import {css, html, LitElement, nothing} from 'lit';
import {customElement, query, state} from 'lit/decorators.js';

import {withBase} from '../utils/base.js';
import {navigateTo} from '../utils/router.js';

interface SearchEntry {
  name: string;
  kind: string;
  url: string;
  description: string;
}

/**
 * Orders the page by how well it matches: the start of the name, then a word
 * of the name, then anywhere in the name, then the description. 0 is no match.
 */
function score(entry: SearchEntry, query: string) {
  const name = entry.name.toLowerCase();
  if (name.startsWith(query)) return 4;
  if (name.includes(` ${query}`)) return 3;
  if (name.includes(query)) return 2;
  return entry.description.toLowerCase().includes(query) ? 1 : 0;
}

/**
 * The search palette: a dialog that filters the pages of the site as you type.
 * Created on first use, with an index the build writes (search-index.json).
 */
@customElement('site-search')
export class SiteSearch extends LitElement {
  @state() private entries: SearchEntry[] = [];
  @state() private query = '';

  @query('petal-dialog') private dialog!: PetalDialog;
  @query('petal-outlined-text-field') private field!: PetalOutlinedTextField;

  /** Opens the palette, empty. */
  async open() {
    if (!this.entries.length) {
      const response = await fetch(withBase('/search-index.json'));
      this.entries = (await response.json()) as SearchEntry[];
    }
    this.query = '';
    await this.updateComplete;
    this.field.value = '';
    await this.dialog.show();
    this.field.focus();
  }

  private get results() {
    const query = this.query.trim().toLowerCase();
    if (!query) return this.entries;
    return this.entries
      .map((entry) => ({entry, value: score(entry, query)}))
      .filter(({value}) => value > 0)
      .sort((a, b) => b.value - a.value)
      .map(({entry}) => entry);
  }

  private go(entry: SearchEntry) {
    void this.dialog.close();
    void navigateTo(new URL(withBase(entry.url), location.href));
  }

  private onKeydown(event: KeyboardEvent) {
    const first = this.results[0];
    if (event.key === 'Enter' && first) {
      event.preventDefault();
      this.go(first);
    }
  }

  private onInput() {
    this.query = this.field.value;
  }

  render() {
    const results = this.results;
    return html`
      <petal-dialog aria-label="Search the docs">
        <div slot="content" class="content">
          <petal-outlined-text-field
            label="Search components and guides"
            autocomplete="off"
            enterkeyhint="go"
            @input=${this.onInput}
            @keydown=${this.onKeydown}>
            <petal-icon slot="leading-icon">search</petal-icon>
          </petal-outlined-text-field>
          ${results.length
            ? html`<petal-list aria-label="Results">
                ${results.map(
                  (entry) => html`
                    <petal-list-item
                      type="button"
                      @click=${() => {
                        this.go(entry);
                      }}>
                      <div slot="headline">${entry.name}</div>
                      <div slot="supporting-text">${entry.description}</div>
                      <div slot="trailing-supporting-text">${entry.kind}</div>
                    </petal-list-item>
                  `,
                )}
              </petal-list>`
            : this.entries.length
              ? html`<p class="empty">No results</p>`
              : nothing}
        </div>
      </petal-dialog>
    `;
  }

  static styles = css`
    petal-dialog {
      width: min(640px, calc(100vw - 32px));
      max-width: none;
      max-height: min(640px, calc(100dvh - 48px));
    }

    .content {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding-block-start: 24px;
    }

    petal-outlined-text-field {
      display: block;
    }

    petal-list {
      --md-list-container-color: transparent;
      --md-list-item-container-color: transparent;
      --md-list-item-supporting-text-size: 13px;
      min-height: 280px;
    }

    petal-list-item [slot='supporting-text'] {
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 1;
      overflow: hidden;
    }

    .empty {
      margin: 0;
      padding: 48px 0;
      text-align: center;
      color: var(--md-sys-color-on-surface-variant);
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'site-search': SiteSearch;
  }
}
