/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generates tokens/versions/v34/: Sass modules with the same
 * functions and keys as tokens/versions/v0_192/, filled with the web v34
 * values. The token wrappers in tokens/*.scss switch to them by changing one
 * `@use` line, and keep their validation and custom-property handling.
 *
 * Each module calls its v0.192 counterpart and overrides every key that the
 * v34 tokens define:
 *
 *     @return map.merge(v0.values($deps, ...), ('container-color': ..., ...));
 *
 * Keys v34 does not define keep their v0.192 value (listed in the report);
 * keys only v34 defines are left out, because the wrappers accept a fixed set.
 *
 * A reference to a system token stays a `map.get($deps, module, key)` lookup
 * when the module is one of the function's dependencies, so components still
 * read `var(--md-sys-...)`; otherwise the resolved value is written out.
 */

import * as fs from 'fs';
import {isToken, SOURCES, Token, walk} from './dtcg.js';
import type {WebFile} from './web.js';

const V0 = 'tokens/versions/v0_192';

/**
 * v34 sets to read first for some modules.
 *
 * In v34 the deprecated md.comp.fab.primary set (and secondary, tertiary,
 * extended) was changed to the filled "primary" colors, but only partly: the
 * container is primary while the hover and focus icon colors are still
 * on-primary-container. The tonal colors the `primary` variant has always had
 * moved to the *-container sets, which are consistent. Use those, so the
 * existing variants keep their look; sizes and shapes still come from the
 * set of the same name. Filled FABs are a separate, new variant.
 *
 * Likewise md.comp.icon-button became the base of the new size-based icon
 * buttons (selected = filled primary, so a selected standard icon button
 * would get a white icon); the standard icon button is now
 * md.comp.icon-button.standard.
 */
const PREFERRED: Record<string, string> = {
  'md-comp-fab-primary': 'md-comp-fab-primary-container',
  'md-comp-fab-secondary': 'md-comp-fab-secondary-container',
  'md-comp-fab-tertiary': 'md-comp-fab-tertiary-container',
  'md-comp-extended-fab-primary': 'md-comp-extended-fab-primary-container',
  'md-comp-extended-fab-secondary': 'md-comp-extended-fab-secondary-container',
  'md-comp-extended-fab-tertiary': 'md-comp-extended-fab-tertiary-container',
  'md-comp-icon-button': 'md-comp-icon-button-standard',
};

interface Info {
  module: string;
  variable: string;
  token: Token;
}

interface FunctionInfo {
  name: string;
  signature: string;
  /** Names of the dependency modules in the default `$deps` map. */
  deps: Set<string>;
  hasExclude: boolean;
  /** Call forwarding the parameters, e.g. `v0.values($deps, $exclude-hardcoded-values)`. */
  call: string;
}

export interface CompatReport {
  module: string;
  /** '' when switched, otherwise why the module only forwards to v0.192. */
  forwarded: string;
  replaced: number;
  kept: string[];
  unused: number;
}

/** token name -> where it is defined, for the default (non-context) files. */
function indexTokens(files: WebFile[]) {
  const index = new Map<string, Info>();
  for (const file of files) {
    if (file.context) continue;
    const byName = new Map<string, Token>(walk(file.tokens));
    for (const [variable, name] of file.variables) {
      index.set(name, {module: file.module, variable, token: byName.get(name)!});
    }
  }
  return index;
}

function parseV0(module: string) {
  const text = fs.readFileSync(`${V0}/_${module}.scss`, 'utf8');
  const uses = [...text.matchAll(/^@use '(\.\/)?([\w-]+)';$/gm)].map((m) => m[2]);
  const defaults = new Map<string, {text: string; deps: Set<string>}>();
  for (const m of text.matchAll(/^(\$_default[\w-]*): \(\n([\s\S]*?)\n\);$/gm)) {
    const deps = new Set([...m[2].matchAll(/^\s*'([\w-]+)':/gm)].map((d) => d[1]));
    defaults.set(m[1], {text: m[0], deps});
  }
  const functions: FunctionInfo[] = [];
  for (const m of text.matchAll(/^@function ([\w-]+)\(([^)]*)\) \{$/gm)) {
    const params = m[2].split(',').map((p) => p.trim()).filter(Boolean);
    const names = params.map((p) => p.split(':')[0].trim());
    const defaultVar = params.find((p) => p.startsWith('$deps'))?.split(':')[1]?.trim();
    functions.push({
      name: m[1],
      signature: m[0],
      deps: defaultVar ? defaults.get(defaultVar)?.deps ?? new Set() : new Set(),
      hasExclude: names.includes('$exclude-hardcoded-values'),
      call: `v0.${m[1]}(${names.join(', ')})`,
    });
  }
  if (!functions.length) throw new Error(`${module}: no @function found`);
  return {uses, defaults, functions};
}

function literal(token: Token): string {
  const v = token.$value as never;
  switch (token.$type) {
    case 'color':
      return (v as {hex: string}).hex;
    case 'dimension':
    case 'duration': {
      const d = v as {value: number; unit: string};
      return `${d.value}${d.unit}`;
    }
    case 'cubicBezier':
      return `cubic-bezier(${(v as number[]).join(', ')})`;
    case 'fontFamily':
      return `(${[v].flat().map((f: string) => (/\s/.test(f) ? `'${f}'` : f)).join(', ')})`;
    case 'number':
    case 'fontWeight':
      return String(v);
    default:
      if (typeof v === 'string') return v;
      throw new Error(`No Sass literal for ${JSON.stringify(v)}`);
  }
}

/** Sass expression for a token, as seen from a function with `deps`. */
function expression(info: Info, index: Map<string, Info>, fn: FunctionInfo, depth = 0): string {
  if (depth > 20) throw new Error('Reference loop');
  const {token} = info;
  const value = token.$value;
  if (typeof value === 'string' && /^\{.*\}$/.test(value)) {
    const target = index.get(value.slice(1, -1));
    if (!target) throw new Error(`Unresolved reference ${value}`);
    if (fn.deps.has(target.module)) {
      return `map.get($deps, '${target.module}', '${target.variable.replace(/^@/, '')}')`;
    }
    return expression(target, index, fn, depth + 1);
  }
  if (token.$type === 'typography') {
    const t = value as Record<string, string>;
    const part = (key: string) => {
      const target = index.get(t[key].slice(1, -1));
      if (!target) throw new Error(`Unresolved reference ${t[key]}`);
      return expression(target, index, fn, depth + 1);
    };
    return `${part('fontWeight')} ${part('fontSize')} #{'/'} ${part('lineHeight')} ${part('fontFamily')}`;
  }
  const css = literal(token);
  return fn.hasExclude ? `if($exclude-hardcoded-values, null, ${css})` : css;
}

function header(module: string) {
  const web = SOURCES.web;
  return [
    '//',
    `// ${web.copyright}`,
    '// SPDX-License-Identifier: Apache-2.0',
    '//',
    '// Generated by petal-elements ("npm run tokens"). Do not edit.',
    `// Same functions and keys as ../v0_192/_${module}.scss, with the values of`,
    `// the Material Design web tokens version ${web.version}`,
    `// (${web.repository}/tree/${web.commit}/${web.path}).`,
    '//',
    '',
  ].join('\n');
}

/**
 * @param files web token files
 * @param legacyKeys v0.192 keys: module -> context (light/dark) -> keys
 */
export function buildCompatSass(
  files: WebFile[],
  legacyKeys: Map<string, Map<string, Map<string, string>>>,
) {
  const index = indexTokens(files);
  const byModule = new Map(files.map((f) => [f.module, f]));
  const output = new Map<string, string>();
  const reports: CompatReport[] = [];

  const v0Modules = fs
    .readdirSync(V0)
    .filter((f) => /^_md-.*\.scss$/.test(f) && !f.endsWith('-meta.scss'))
    .map((f) => f.slice(1, -'.scss'.length))
    .sort();

  for (const module of v0Modules) {
    const name = `_${module}.scss`;
    // A few v34 files lack "comp-" (_md-outlined-icon-button.scss).
    const v34 = byModule.has(module) ? module : module.replace(/^md-comp-/, 'md-');
    if (!byModule.has(v34)) {
      output.set(name, header(module) + `@forward '../v0_192/${module}';\n`);
      reports.push({module, forwarded: 'no v34 module', replaced: 0, kept: [], unused: 0});
      continue;
    }

    const v0 = parseV0(module);
    const lines = [header(module), "@use 'sass:map';", `@use '../v0_192/${module}' as v0;`];
    for (const use of v0.uses) if (use !== 'sass:map') lines.push(`@use '${use}';`);
    lines.push('');
    for (const {text} of v0.defaults.values()) lines.push(text, '');

    let replaced = 0;
    const kept: string[] = [];
    const used = new Set<string>();
    for (const fn of v0.functions) {
      const context = fn.name === 'values-dark' ? 'dark' : 'light';
      const source = byModule.get(context === 'dark' ? `${v34}__dark` : v34);
      if (!source) throw new Error(`${module}: no v34 file for ${fn.name}`);
      const keys = [...(legacyKeys.get(module)?.get(context)?.keys() ?? [])].sort();
      if (!keys.length) throw new Error(`${module}: no v0.192 keys for ${fn.name}`);

      const preferred = byModule.get(PREFERRED[module] ?? '');
      const entries: string[] = [];
      for (const key of keys) {
        // Look in the preferred set first (new names: focused-, hovered-),
        // then in the module of the same name.
        const newName = key.replace(/(^|-)focus-/, '$1focused-').replace(/(^|-)hover-/, '$1hovered-');
        const found =
          [key, newName]
            .filter(() => preferred)
            .map((variable) => ({file: preferred!, variable}))
            .find(({file, variable}) => file.variables.has(variable)) ??
          [key, `@${key}`]
            .map((variable) => ({file: source, variable}))
            .find(({file, variable}) => file.variables.has(variable));
        if (!found) {
          kept.push(context === 'dark' ? `${key} (dark)` : key);
          continue;
        }
        const {file, variable} = found;
        if (file === source) used.add(variable);
        const tokenName = file.variables.get(variable)!;
        const token = new Map(walk(file.tokens)).get(tokenName);
        if (!token || !isToken(token)) throw new Error(`${module}: ${tokenName} not found`);
        const info: Info = {module: file.module, variable, token};
        entries.push(`      '${key}': ${expression(info, index, fn)},`);
        replaced++;
      }
      lines.push(
        fn.signature,
        '  @return map.merge(',
        `    ${fn.call},`,
        '    (',
        ...entries,
        '    )',
        '  );',
        '}',
        '',
      );
    }
    const unused = [...byModule.get(v34)!.variables.keys()].filter((v) => !used.has(v)).length;
    output.set(name, lines.join('\n'));
    reports.push({module, forwarded: '', replaced, kept, unused});
  }
  return {output, reports};
}

export function compatReport(reports: CompatReport[]): string {
  const switched = reports.filter((r) => !r.forwarded);
  return [
    '# tokens/versions/v34',
    '',
    '<!-- Generated by "npm run tokens". Do not edit. -->',
    '',
    `Sass modules with the v0.192 functions and keys, filled with the web v${SOURCES.web.version} values.`,
    'See scripts/tokens/sass.ts.',
    '',
    '- Replaced: keys that take the v34 value.',
    '- Kept: v0.192 keys that v34 does not define; they keep the v0.192 value.',
    '- Not used: v34 tokens with no v0.192 key (new in v34).',
    '',
    '| Module | Replaced | Kept | Not used |',
    '| --- | --- | --- | --- |',
    ...switched.map((r) => `| \`${r.module}\` | ${r.replaced} | ${r.kept.length} | ${r.unused} |`),
    '',
    '## Kept from v0.192',
    '',
    ...switched
      .filter((r) => r.kept.length)
      .flatMap((r) => [`- \`${r.module}\`: ${r.kept.map((k) => `\`${k}\``).join(', ')}`]),
    '',
    '## Forwarded to v0.192 (no v34 module)',
    '',
    ...reports.filter((r) => r.forwarded).map((r) => `- \`${r.module}\``),
    '',
  ].join('\n');
}

