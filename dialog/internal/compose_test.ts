/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

// The dialog's layout against Jetpack Compose's AlertDialog (AlertDialog.kt,
// DialogTokens).

import '../dialog.js';
import '../../button/text-button.js';

import {html} from 'lit';

import {Environment} from '../../testing/environment.js';
import {PetalDialog} from '../dialog.js';

describe('<petal-dialog> (Compose)', () => {
  const env = new Environment();

  async function setup(actions = html`<petal-text-button>Cancel</petal-text-button
    ><petal-text-button>Delete</petal-text-button>`) {
    const root = env.render(html`
      <petal-dialog quick>
        <div slot="headline">Delete file?</div>
        <div slot="content">This file will be deleted.</div>
        <div slot="actions">${actions}</div>
      </petal-dialog>
    `);
    const dialog = root.querySelector('petal-dialog') as PetalDialog;
    await env.waitForStability();
    return {
      dialog,
      headline: root.querySelector<HTMLElement>('[slot=headline]')!,
      content: root.querySelector<HTMLElement>('[slot=content]')!,
      actions: root.querySelector<HTMLElement>('[slot=actions]')!,
    };
  }

  it('has 24dp around, 16dp under the title and 24dp above the buttons', async () => {
    const {headline, content, actions} = await setup();
    const head = getComputedStyle(headline);
    const text = getComputedStyle(content);
    const buttons = getComputedStyle(actions);
    // dialogPadding: 24dp on all sides.
    expect([head.paddingTop, head.paddingLeft, head.paddingRight]).toEqual(['24px', '24px', '24px']);
    expect([buttons.paddingRight, buttons.paddingBottom]).toEqual(['24px', '24px']);
    // TitlePadding: 16dp under the title.
    expect(text.paddingTop).toBe('16px');
    // textPadding: 24dp under the text (8px here, 16px above the buttons).
    expect(parseFloat(text.paddingBottom) + parseFloat(buttons.paddingTop)).toBe(24);
  });

  it('scales from 80% and fades on the motion scheme springs', async () => {
    const {dialog} = await setup();
    const open = dialog.getOpenAnimation();
    const [[scaleKeyframes, scaleTiming], [fadeKeyframes]] = open.dialog!;
    expect(scaleKeyframes).toEqual([{transform: 'scale(0.8)'}, {transform: 'none'}]);
    expect(fadeKeyframes).toEqual([{opacity: 0}, {opacity: 1}]);
    // The expressive default spatial spring, as a linear() easing.
    expect(String((scaleTiming as KeyframeAnimationOptions).easing)).toMatch(/^linear\(/);
    const close = dialog.getCloseAnimation();
    const [[, closeTiming]] = close.dialog!;
    // Kept at the end until the dialog closes.
    expect((closeTiming as KeyframeAnimationOptions).fill).toBe('forwards');
  });

  it('wraps the buttons with the confirm button on top', async () => {
    const {actions} = await setup();
    const style = getComputedStyle(actions);
    // AlertDialogFlowRow: 8dp apart, at the end, the last (confirm) button
    // first when stacked.
    expect(style.flexWrap).toBe('wrap-reverse');
    expect(style.justifyContent).toBe('flex-end');
    expect(style.columnGap).toBe('8px');
    expect(style.rowGap).toBe('8px');
  });
});
