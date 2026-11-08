/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import type {PlaygroundPreview} from 'playground-elements/playground-preview.js';
import {PostDoc} from 'postdoc-lib';

import {PAGE_CHANGE} from '../utils/router.js';
import {getCurrentThemeString} from '../utils/theme.js';

/**
 * Gets the iframe of a playground preview, and updates the iframe communication
 * library to communicate with the new window on each iframe reload.
 *
 * @param postdoc The instance of the iframe communication library.
 * @param previewEl An element reference to the playground preview element.
 */
async function updateMessageTargetOnIframeLoad(
  postdoc: PostDoc,
  previewEl: PlaygroundPreview,
) {
  await previewEl.updateComplete;
  const iframe = previewEl.iframe!;

  iframe.addEventListener('load', (e: Event) => {
    postdoc.messageTarget = iframe.contentWindow;
  });
}

// Stops the listeners of the playground of the previous page.
let teardown: AbortController | undefined;

/**
 * Synchronizes the playground's theme with the material theme applied to the
 * current page every time the playground reloads.
 */
async function syncPlaygroundThemeWithPage() {
  teardown?.abort();
  const controller = new AbortController();
  teardown = controller;

  const previewEl = document.querySelector('playground-preview');

  if (!previewEl) {
    return;
  }

  async function onPlaygroundMessage(e: MessageEvent) {
    // if the playground is requesting a new theme, send it the current one
    // from localStorage
    if (e.data === 'request-theme') {
      await postdoc.handshake;
      postdoc.postMessage(getCurrentThemeString());
    }
  }

  // Initialize the iframe communication library
  const postdoc = new PostDoc({
    messageReceiver: window,
    onMessage: onPlaygroundMessage,
  });

  await customElements.whenDefined('playground-preview');
  await updateMessageTargetOnIframeLoad(postdoc, previewEl);
  await postdoc.handshake;

  // Whenever the theme changes, send it to the playground iframe.
  window.addEventListener(
    'theme-changed',
    async () => {
      await postdoc.handshake;
      postdoc.postMessage(getCurrentThemeString());
    },
    {signal: controller.signal},
  );
}

window.addEventListener(PAGE_CHANGE, () => void syncPlaygroundThemeWithPage());
void syncPlaygroundThemeWithPage();
