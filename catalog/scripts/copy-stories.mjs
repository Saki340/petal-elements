/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import {cp, readdir} from 'fs/promises';
import {existsSync} from 'fs';
import {join, parse} from 'path';
import tinyGlob from 'tiny-glob';

// Glob(s) from which to copy story files
const storyDirectories = ['../*/demo'];
const dirPromises = storyDirectories.map(async (entry) => tinyGlob(entry));
const directories = (await Promise.all(dirPromises)).flat();

/**
 * The demos of one source directory. `<name>/demo` is the demo `<name>`; a
 * directory with several components has one folder each, so
 * `<name>/demo/<part>` is the demo `<name>-<part>`.
 */
async function demosOf(entry) {
  const componentName = parse(parse(entry).dir).base;
  if (existsSync(join(entry, 'project.json'))) {
    return [[entry, componentName]];
  }
  const parts = await readdir(entry, {withFileTypes: true});
  return parts
    .filter((part) => part.isDirectory())
    .map((part) => [join(entry, part.name), `${componentName}-${part.name}`]);
}

const demos = (await Promise.all(directories.map(demosOf))).flat();

await Promise.all(
  demos.map(([from, name]) => {
    // set the destination to /catalog/stories/<component name>
    const destination = join('.', 'stories', name);
    console.log(`Copying ${from} to ${destination}`);
    return cp(from, destination, {recursive: true});
  }),
);
