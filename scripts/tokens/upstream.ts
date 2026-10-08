/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Checks whether the token sources changed upstream since the
 * commits pinned in tokens/sources.json. Run by the scheduled CI job.
 *
 *     node scripts/tokens/upstream.js
 *
 * - Compose: finds the latest androidx commit touching the token directory,
 *   reads the tokens there and lists added, removed and changed values.
 * - Web: reads the token version on material-web's main branch. These files
 *   arrive by merging upstream; then update tokens/sources.json and run
 *   "npm run tokens".
 *
 * Prints a Markdown report (also to $GITHUB_STEP_SUMMARY when set) and exits
 * with 1 when anything changed, so the scheduled run shows up as failed.
 */

import * as fs from 'fs';
import {compare, flattenDtcg} from './compare.js';
import {download, readComposeTokens} from './compose.js';
import {SOURCES} from './dtcg.js';

function repoName(url: string) {
  return url.replace('https://github.com/', '');
}

async function latestCommit(repository: string, path: string, branch?: string) {
  const query = new URLSearchParams({path, per_page: '1', ...(branch ? {sha: branch} : {})});
  const commits = JSON.parse(
    await download(`https://api.github.com/repos/${repoName(repository)}/commits?${query}`),
  ) as Array<{sha: string; commit: {committer: {date: string}; message: string}}>;
  if (!commits.length) throw new Error(`No commits for ${repository} ${path}`);
  return commits[0];
}

const lines: string[] = ['# Upstream token check', ''];
let changed = false;

// ---------- Compose ----------
const compose = SOURCES.compose;
const latest = await latestCommit(compose.repository, compose.path);
lines.push('## Jetpack Compose', '');
if (latest.sha === compose.commit) {
  lines.push(`Up to date with ${compose.commit}.`, '');
} else {
  // The pinned commit may be newer than the last change to the token
  // directory, so compare the tokens, not the commit ids.
  const flat = (tokens: Awaited<ReturnType<typeof readComposeTokens>>) =>
    flattenDtcg(
      tokens.files.map((f) => ({
        context: f.object === 'ColorDarkTokens' ? 'dark' : '',
        tokens: f.tokens,
      })),
    );
  const before = flat(await readComposeTokens());
  const after = flat(await readComposeTokens(latest.sha));
  const c = compare(before, after);
  const changes = [...c.different, ...c.otherKind];
  if (changes.length || c.onlyA.length || c.onlyB.length) changed = true;
  lines.push(
    `Pinned: ${compose.commit}`,
    `Latest: ${latest.sha} (${latest.commit.committer.date}): ${latest.commit.message.split('\n')[0]}`,
    '',
    `${changes.length} changed, ${c.onlyB.length} added, ${c.onlyA.length} removed tokens.`,
    '',
  );
  if (changes.length) {
    lines.push('| Token | Pinned | Latest |', '| --- | --- | --- |');
    for (const [k, a, b] of changes) lines.push(`| \`${k}\` | ${a} | ${b} |`);
    lines.push('');
  }
  for (const [title, keys] of [
    ['Added', c.onlyB],
    ['Removed', c.onlyA],
  ] as const) {
    if (keys.length) lines.push(`${title}:`, '', ...keys.map((k) => `- \`${k}\``), '');
  }
  if (changed) {
    lines.push(
      'To update: set `compose.commit` in tokens/sources.json, run `npm run tokens`,',
      'and review tokens/reports/web-vs-compose.md.',
      '',
    );
  }
}

// ---------- Web ----------
const web = SOURCES.web;
const webLatest = await latestCommit(web.repository, web.path, 'main');
const header = await download(
  `https://raw.githubusercontent.com/${repoName(web.repository)}/main/${web.path}/_md-sys-color.scss`,
);
const version = /^\/\/ Version: (\S+)$/m.exec(header)?.[1];
lines.push('## Material Design web tokens (material-web)', '');
if (webLatest.sha === web.commit && version === web.version) {
  lines.push(`Up to date with version ${web.version} (${web.commit}).`, '');
} else {
  changed = true;
  lines.push(
    `Pinned: version ${web.version}, ${web.commit}`,
    `Latest on main: version ${version}, ${webLatest.sha} (${webLatest.commit.committer.date}): ` +
      webLatest.commit.message.split('\n')[0],
    '',
    'To update: merge upstream (git fetch upstream && git merge upstream/main),',
    'run `node scripts/rebrand.js`, set `web` in tokens/sources.json and run',
    '`npm run tokens`.',
    '',
  );
}

const output = lines.join('\n');
console.log(output);
if (process.env['GITHUB_STEP_SUMMARY']) {
  fs.appendFileSync(process.env['GITHUB_STEP_SUMMARY'], output + '\n');
}
process.exit(changed ? 1 : 0);
