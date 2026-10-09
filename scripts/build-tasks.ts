/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Cross-platform replacements for the shell pipelines that the
 * wireit build used (`find`, `xargs`, `ls`), so the build also runs on
 * Windows. Usage:
 *
 *     node scripts/build-tasks.js sass-meta
 *     node scripts/build-tasks.js sass
 *     node scripts/build-tasks.js css-to-ts
 */

import {spawn} from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const SKIP_DIRS = new Set(['node_modules', 'catalog', 'landing', '_site', '.cache', '.wireit', '.git']);

/** Lists files under `dir` (relative paths, forward slashes). */
function listFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const full = dir === '.' ? entry.name : `${dir}/${entry.name}`;
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) files.push(...listFiles(full));
    } else {
      files.push(full);
    }
  }
  return files;
}

function run(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, {stdio: 'inherit'});
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`exit code ${code}: node ${args.join(' ')}`));
    });
  });
}

/** Runs `node <script> <file> ...extra` for each file, a few at a time. */
async function runEach(script: string, files: string[], extra: string[] = []) {
  const queue = [...files];
  const worker = async () => {
    for (let file = queue.shift(); file; file = queue.shift()) {
      await run([script, file, ...extra]);
    }
  };
  await Promise.all(Array.from({length: 8}, worker));
}

const tasks: Record<string, () => Promise<void>> = {
  // Was: find tokens/versions/ -type f -name '_md-*.scss' ! -name '*-meta.scss'
  //        -print0 | xargs -0 node scripts/generate-sass-token-meta.js
  async 'sass-meta'() {
    const files = listFiles('tokens/versions').filter((file) => {
      const name = path.posix.basename(file);
      return (
        name.startsWith('_md-') &&
        name.endsWith('.scss') &&
        !name.endsWith('-meta.scss')
      );
    });
    await run(['scripts/generate-sass-token-meta.js', ...files]);
  },

  // Was: sass --style=compressed --load-path=... $(ls -d */ | grep -vE ...)
  async 'sass'() {
    const dirs = fs
      .readdirSync('.', {withFileTypes: true})
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .filter((name) => !name.startsWith('.') && !SKIP_DIRS.has(name));
    await run([
      // The sass package does not export its CLI entry point.
      'node_modules/sass/sass.js',
      '--style=compressed',
      '--load-path=node_modules',
      '--load-path=node_modules/sass-true/sass',
      ...dirs.map((dir) => `${dir}/`),
    ]);
  },

  // Was: find . ( -path ./.wireit -o -path ./node_modules -o -path ./catalog )
  //        -prune -o -name '*.css' -print
  //        | xargs -L1 node scripts/css-to-ts.js --suffix=.cssresult
  async 'css-to-ts'() {
    const files = listFiles('.').filter((file) => file.endsWith('.css'));
    await runEach('scripts/css-to-ts.js', files, ['--suffix=.cssresult']);
  },
};

const task = tasks[process.argv[2]];
if (!task) {
  console.error(`Usage: node scripts/build-tasks.js <${Object.keys(tasks).join('|')}>`);
  process.exit(1);
}
await task();
