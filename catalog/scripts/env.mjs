/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Runs a command with NODE_ENV set, on any platform (wireit runs commands with
 * cmd.exe on Windows, which has no `NODE_ENV=... command` syntax).
 *
 *     node scripts/env.mjs PROD eleventy
 */

import {spawn} from 'child_process';

const [mode, ...command] = process.argv.slice(2);
const child = spawn(command.join(' '), {
  env: {...process.env, NODE_ENV: mode},
  shell: true,
  stdio: 'inherit',
});
child.on('exit', (code) => process.exit(code ?? 1));
