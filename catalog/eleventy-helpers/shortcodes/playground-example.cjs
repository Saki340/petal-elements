/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

/**
 * Will render a playground example with a project.json in the
 * `/catalog/stories/${dirname}/` directory.
 *
 * This shorcode takes the following arguments:
 * - dirname: (required) The name of the directory where the project.json is
 *   located
 * - id: (optional) The id of the project. This is used to identify the project on pages
 *   with multiple playground examples.
 * - previewHeight: (optional) The height of the preview window. Defaults to `400`.
 * - editorHeight: (optional) The height of the editor window. Defaults to `500`.
 *
 * @example
 * ```html
 * <!--
 *   Will generate a playground example located at
 *   /catalog/stories/checkbox/project.json
 *   and give the project the id "example1"
 * -->
 * {% playgroundexample dirname="checkbox", id="example2", previewHeight="400", editorHeight="500" %}
 * ```
 *
 * @param eleventyConfig The 11ty config in which to attach this shortcode.
 */
function playgroundExample(eleventyConfig) {
  eleventyConfig.addShortcode('playgroundexample', (config) => {
    let { id, dirname } = config;
    if (!dirname) {
      throw new Error('No dirname provided to playgroundexample shortcode');
    }

    id ||= 'project';

    const previewHeight = config.previewHeight
      ? `height: ${config.previewHeight}px`
      : 'height: 400px;';
    const editorHeight = config.editorHeight
      ? `height: ${config.editorHeight}px`
      : 'height: 500px;';

    return `
      <details>
        <summary>
          <petal-outlined-icon-button toggle tabindex="-1" aria-hidden="true">
            <petal-icon aria-hidden="true">expand_more</petal-icon>
            <petal-icon aria-hidden="true" slot="selected">expand_less</petal-icon>
          </petal-outlined-icon-button>
          View interactive demo inline.
        </summary>
        <lit-island on:visible import="/js/hydration-entrypoints/playground-elements.js" class="example" aria-hidden="true">
          <playground-project
              id="${id}" project-src="/assets/stories/${dirname}/project.json">
          <playground-preview
              style="${previewHeight}"
              project="${id}"
          ><petal-circular-progress indeterminate></petal-circular-progress></playground-preview>
          <playground-file-editor
            style="${editorHeight}"
            project="${id}"
            filename="stories.ts"
            line-numbers
          ><petal-circular-progress indeterminate></petal-circular-progress></playground-file-editor>
        </lit-island>
      </details>
      <p><a href="./stories/" target="_blank">Open interactive demo in new tab.</a></p>
    `;
  });
}

module.exports = playgroundExample;
