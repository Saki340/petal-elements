/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

// Opening a dialog while it closes, with real timers (the animations run).

import '../dialog.js';

import {html, render} from 'lit';

import {PetalDialog} from '../dialog.js';

describe('<petal-dialog> opened while closing', () => {
  it('opens again once the close animation is done', async () => {
    const root = document.createElement('div');
    document.body.append(root);
    render(html`<petal-dialog><div slot="content">Hello</div></petal-dialog>`, root);
    const dialog = root.querySelector('petal-dialog') as PetalDialog;
    await dialog.show();

    const closing = dialog.close();
    await new Promise((resolve) => setTimeout(resolve, 20));
    const opening = dialog.show();
    await closing;
    await opening;

    expect(dialog.open).toBeTrue();
    expect(dialog.shadowRoot!.querySelector('dialog')!.open).toBeTrue();
    await dialog.close();
    root.remove();
  });

  it('stays open when open is set back to true while closing', async () => {
    const root = document.createElement('div');
    document.body.append(root);
    render(html`<petal-dialog><div slot="content">Hello</div></petal-dialog>`, root);
    const dialog = root.querySelector('petal-dialog') as PetalDialog;
    await dialog.show();

    dialog.open = false;
    await new Promise((resolve) => setTimeout(resolve, 20));
    dialog.open = true;
    await new Promise((resolve) => setTimeout(resolve, 800));

    expect(dialog.open).toBeTrue();
    expect(dialog.shadowRoot!.querySelector('dialog')!.open).toBeTrue();
    await dialog.close();
    root.remove();
  });
});
