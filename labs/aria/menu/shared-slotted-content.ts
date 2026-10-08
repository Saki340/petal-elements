/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import {css} from 'lit';

/**
 * Shared styles used by `<petal-aria-menulist>` and `<petal-aria-fieldset>`, to
 * simulate the descendant combinator in UA styles for `<menuitem>`.
 */
export const sharedSlottedContentStyles = css`
  ::slotted(petal-aria-menuitem) {
    display: flex;
    align-items: center;
    user-select: none;
    min-inline-size: 24px;
    min-block-size: max(24px, 1lh);
    font-weight: inherit;
    gap: 0.5em;
    padding-inline: 0.5em;
  }

  ::slotted(petal-aria-menuitem:state(enabled):hover) {
    background-color: color-mix(in lab, currentColor 10%, transparent);
  }

  ::slotted(petal-aria-menuitem:state(disabled)) {
    color: color-mix(in lab, currentColor 50%, transparent);
  }

  ::slotted(petal-aria-fieldset) {
    margin-inline: 0;
    border: none;
    padding-block: 0;
    padding-inline: 0;
  }

  ::slotted(hr) {
    color: inherit;
    margin-inline: 0;
    border: none;
    border-block-start: 1px solid currentColor;
    border-image: none;
  }

  ::slotted(a:any-link),
  ::slotted(img[usemap]) {
    display: none;
  }
`;
