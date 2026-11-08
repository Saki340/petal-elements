/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

/**
 * Will render a playground example with a project.json in the
 * `/catalog/stories/${dirname}/` directory: the preview, always there, and the
 * code behind a disclosure.
 *
 * This shorcode takes the following arguments:
 * - dirname: (required) The name of the directory where the project.json is
 *   located
 * - id: (optional) The id of the project. This is used to identify the project on pages
 *   with multiple playground examples.
 * - previewHeight: (optional) The height of the preview window. Defaults to `480`.
 * - editorHeight: (optional) The height of the editor window. Defaults to `500`.
 *
 * @example
 * ```html
 * {% playgroundexample dirname="checkbox", id="example2", previewHeight="400", editorHeight="500" %}
 * ```
 *
 * @param eleventyConfig The 11ty config in which to attach this shortcode.
 */
function playgroundExample(eleventyConfig) {
  eleventyConfig.addShortcode('playgroundexample', (config) => {
    let {id, dirname} = config;
    if (!dirname) {
      throw new Error('No dirname provided to playgroundexample shortcode');
    }

    id ||= 'project';

    const previewHeight = `height: ${config.previewHeight || 480}px`;
    const editorHeight = `height: ${config.editorHeight || 500}px`;

    return `
      <section class="playground" aria-label="Interactive demo">
        <lit-island on:visible import="/js/hydration-entrypoints/playground-elements.js" class="example">
          <playground-project id="${id}" project-src="/assets/stories/${dirname}/project.json"></playground-project>
          <playground-preview style="${previewHeight}" project="${id}">
            <petal-circular-progress indeterminate></petal-circular-progress>
          </playground-preview>
          <details class="playground-code">
            <summary>
              <petal-icon aria-hidden="true">code</petal-icon>
              <span>View code</span>
              <a class="playground-open" href="./stories/" target="_blank">Open in the editor
                <petal-icon aria-hidden="true">open_in_new</petal-icon></a>
            </summary>
            <playground-file-editor style="${editorHeight}" project="${id}" filename="stories.ts" line-numbers>
              <petal-circular-progress indeterminate></petal-circular-progress>
            </playground-file-editor>
          </details>
        </lit-island>
      </section>
    `;
  });
}

module.exports = playgroundExample;
