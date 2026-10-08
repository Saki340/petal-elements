/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Compares token values between sources and writes Markdown
 * reports.
 *
 * Every source is flattened to `key -> value`:
 * - key: the token name without `md.`, dots as dashes, with a context prefix
 *   for non-default color schemes (`dark/sys-color-primary`). Web, Compose and
 *   v0.192 names line up this way (`md.comp.button.small.container.height` and
 *   `ButtonSmallTokens.ContainerHeight` both become
 *   `comp-button-small-container-height`).
 * - value: references resolved; lengths in px (1rem = 16px; 9999px and
 *   circles are "full"); numbers rounded to 4 decimals; a reference to a
 *   typescale is kept as `typescale(<name>)`.
 * - Compose `focused` / `hovered` count as `focus` / `hover`.
 */

import {EXT, Group, round, Token, walk} from './dtcg.js';

export type Flat = Map<string, string>;

export interface Tree {
  context: string;
  tokens: Group;
}

/** Compose says `focused` / `hovered` where the web tokens say `focus` / `hover`. */
const SYNONYMS: Record<string, string> = {focused: 'focus', hovered: 'hover'};

function key(context: string, path: string) {
  const name = path
    .replace(/^md\./, '')
    .replace(/\./g, '-')
    .split('-')
    .map((part) => SYNONYMS[part] ?? part)
    .join('-');
  return `${context ? `${context}/` : ''}${name}`;
}

function length(value: number, unit: string) {
  const px = unit === 'rem' ? value * 16 : value;
  return px >= 9999 ? 'full' : `${round(px, 4)}px`;
}

function normalizeCss(text: string) {
  if (text === '50%') return 'full';
  return text
    .split(' ')
    .map((part) => {
      const m = /^(-?[\d.]+)(px|rem)?$/.exec(part);
      return m ? length(Number(m[1]), m[2] ?? 'px') : part;
    })
    .join(' ');
}

/** Flattens DTCG trees; trees with a context override the default ones. */
export function flattenDtcg(trees: Tree[]): Flat {
  const base = new Map<string, Token>();
  const byContext = new Map<string, Map<string, Token>>();
  for (const {context, tokens} of trees) {
    const target = context ? new Map<string, Token>() : base;
    if (context) byContext.set(context, target);
    for (const [path, token] of walk(tokens)) target.set(path, token);
  }

  const resolveIn = (context: string) => {
    const own = byContext.get(context);
    const lookup = (path: string) => own?.get(path) ?? base.get(path);
    const value = (token: Token, depth = 0): string => {
      if (depth > 20) throw new Error('Reference loop');
      const v = token.$value;
      if (typeof v === 'string' && /^\{.*\}$/.test(v)) {
        const target = v.slice(1, -1);
        if (token.$type === 'typography' && target.startsWith('md.sys.typescale.')) {
          return `typescale(${target.slice('md.sys.typescale.'.length)})`;
        }
        const next = lookup(target);
        if (!next) return `unresolved(${target})`;
        return value(next, depth + 1);
      }
      switch (token.$type) {
        case 'color':
          return (v as {hex: string}).hex;
        case 'dimension': {
          const d = v as {value: number; unit: string};
          return length(d.value, d.unit);
        }
        case 'duration': {
          const d = v as {value: number; unit: string};
          return `${d.unit === 's' ? d.value * 1000 : d.value}ms`;
        }
        case 'number':
        case 'fontWeight':
          return String(round(v as number, 4));
        case 'cubicBezier':
          return `cubic-bezier(${(v as number[]).map((n) => round(n, 4)).join(', ')})`;
        case 'fontFamily':
          return [v].flat().join(', ');
        case 'typography': {
          const t = v as Record<string, string>;
          const part = (name: string) => {
            const ref = t[name].slice(1, -1);
            const next = lookup(ref);
            return next ? value(next, depth + 1) : `unresolved(${ref})`;
          };
          return `typography(${part('fontWeight')} ${part('fontSize')}/${part('lineHeight')} ${part('fontFamily')})`;
        }
        default: {
          const ext = token.$extensions?.[EXT] as {css?: boolean} | undefined;
          if (ext?.css && typeof v === 'string') return normalizeCss(v);
          return JSON.stringify(v);
        }
      }
    };
    return value;
  };

  const flat: Flat = new Map();
  for (const [path, token] of base) flat.set(key('', path), resolveIn('')(token));
  for (const [context, tokens] of byContext) {
    for (const [path, token] of tokens) flat.set(key(context, path), resolveIn(context)(token));
  }
  return flat;
}

/** Flattens v0.192 values read by legacy.ts. */
export function flattenLegacy(modules: Map<string, Map<string, Map<string, string>>>): Flat {
  const flat: Flat = new Map();
  for (const [module, contexts] of modules) {
    for (const [context, values] of contexts) {
      for (const [name, raw] of values) {
        // md-comp-filled-button + container-color -> comp-filled-button-container-color
        const k = key(context === 'dark' ? 'dark' : '', `md.${module.slice(3)}.${name}`);
        let value = raw;
        let m: RegExpExecArray | null;
        if ((m = /^#([0-9a-f]{3})$/i.exec(raw))) {
          value = `#${[...m[1]].map((c) => c + c).join('')}`.toLowerCase();
        } else if (/^#[0-9a-f]{6}$/i.test(raw)) {
          value = raw.toLowerCase();
        } else if (/^-?[\d.]+(px|rem)( -?[\d.]+(px|rem)?){0,3}$/.test(raw)) {
          value = normalizeCss(raw);
        } else if ((m = /^-?[\d.]+$/.exec(raw))) {
          // v0.192 elevations are unitless dp; the web tokens use px.
          value = /elevation(-level\d)?$/.test(k) ? length(Number(raw), 'px') : String(round(Number(raw), 4));
        } else if ((m = /^(\d+) (-?[\d.]+(?:px|rem)) \/ (-?[\d.]+(?:px|rem)) (.+)$/.exec(raw))) {
          // Typescale shorthand: `500 0.875rem / 1.25rem Roboto`.
          value = `typography(${m[1]} ${normalizeCss(m[2])}/${normalizeCss(m[3])} ${m[4]})`;
        } else if ((m = /^(-?[\d.]+)ms$/.exec(raw))) {
          value = `${Number(m[1])}ms`;
        } else if ((m = /^cubic-bezier\((.*)\)$/.exec(raw))) {
          value = `cubic-bezier(${m[1].split(',').map((n) => round(Number(n), 4)).join(', ')})`;
        }
        flat.set(k, value);
      }
    }
  }
  return flat;
}

export interface Comparison {
  equal: string[];
  different: Array<[string, string, string]>;
  /** Same name but different kinds, e.g. a font family and a typescale. */
  otherKind: Array<[string, string, string]>;
  onlyA: string[];
  onlyB: string[];
}

export function compare(a: Flat, b: Flat): Comparison {
  const result: Comparison = {equal: [], different: [], otherKind: [], onlyA: [], onlyB: []};
  const isTypescale = (v: string) => v.startsWith('typescale(');
  for (const [k, va] of a) {
    const vb = b.get(k);
    if (vb === undefined) result.onlyA.push(k);
    else if (va === vb) result.equal.push(k);
    else if (isTypescale(va) !== isTypescale(vb)) result.otherKind.push([k, va, vb]);
    else result.different.push([k, va, vb]);
  }
  for (const k of b.keys()) if (!a.has(k)) result.onlyB.push(k);
  result.equal.sort();
  result.different.sort(([x], [y]) => (x < y ? -1 : 1));
  result.onlyA.sort();
  result.onlyB.sort();
  return result;
}

// ---------- report ----------

/** `comp-button-small-container-height` -> `comp-button-small` style groups. */
function groupOf(k: string) {
  const [context, rest] = k.includes('/') ? k.split('/') : ['', k];
  const parts = rest.split('-');
  const group = parts[0] === 'comp' ? parts.slice(0, 3).join('-') : parts.slice(0, 2).join('-');
  return context ? `${context}/${group}` : group;
}

function table(rows: string[][], header: string[]) {
  const escape = (cell: string) => cell.replace(/\|/g, '\\|');
  return [
    `| ${header.join(' | ')} |`,
    `| ${header.map(() => '---').join(' | ')} |`,
    ...rows.map((row) => `| ${row.map(escape).join(' | ')} |`),
  ].join('\n');
}

function countByGroup(keys: string[]) {
  const counts = new Map<string, number>();
  for (const k of keys) counts.set(groupOf(k), (counts.get(groupOf(k)) ?? 0) + 1);
  return [...counts].sort(([x], [y]) => (x < y ? -1 : 1));
}

export function report(options: {
  title: string;
  intro: string[];
  nameA: string;
  nameB: string;
  comparison: Comparison;
  notes?: string[];
}): string {
  const {title, intro, nameA, nameB, comparison: c} = options;
  const isSystem = (k: string) => !k.replace(/^[\w-]+\//, '').startsWith('comp-');
  const diffRows = (rows: Array<[string, string, string]>) =>
    rows.length ? table(rows.map((r) => [`\`${r[0]}\``, r[1], r[2]]), ['Token', nameA, nameB]) : 'None.';
  // Counts only; the names are in the DTCG files.
  const onlyList = (keys: string[]) =>
    table(countByGroup(keys).map(([g, n]) => [`\`${g}\``, String(n)]), ['Group', 'Tokens']);

  return [
    `# ${title}`,
    '',
    '<!-- Generated by "npm run tokens". Do not edit. -->',
    '',
    ...intro,
    '',
    table(
      [
        ['Same value', String(c.equal.length)],
        ['Different value', String(c.different.length)],
        ['Different kind (not compared)', String(c.otherKind.length)],
        [`Only in ${nameA}`, String(c.onlyA.length)],
        [`Only in ${nameB}`, String(c.onlyB.length)],
      ],
      ['', 'Tokens'],
    ),
    '',
    ...(options.notes?.length ? [...options.notes, ''] : []),
    '## Different values: system tokens',
    '',
    diffRows(c.different.filter(([k]) => isSystem(k))),
    '',
    '## Different values: component tokens',
    '',
    diffRows(c.different.filter(([k]) => !isSystem(k))),
    '',
    `## Only in ${nameA}`,
    '',
    c.onlyA.length ? onlyList(c.onlyA) : 'None.',
    '',
    `## Only in ${nameB}`,
    '',
    c.onlyB.length ? onlyList(c.onlyB) : 'None.',
    '',
  ].join('\n');
}

export function sourceLine(name: string, source: {repository: string; commit: string; path: string}) {
  return `- ${name}: ${source.repository}/tree/${source.commit}/${source.path}`;
}
