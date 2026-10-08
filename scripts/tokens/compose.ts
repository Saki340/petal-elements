/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Reads the Jetpack Compose Material 3 token sources
 * (`*Tokens.kt` in androidx/androidx, at the commit pinned in
 * tokens/sources.json) into DTCG token trees, for cross-checking the web
 * tokens.
 *
 * System tokens get the same names as the web tokens (`ColorLightTokens.Primary`
 * -> `md.sys.color.primary`). Component tokens are named
 * `md.comp.<object>.<property>` (`ButtonSmallTokens.ContainerHeight` ->
 * `md.comp.button-small.container-height`); compare them by flattened name.
 *
 * Units: dp and sp become px (1dp = 1 CSS px at the default density, and sp
 * equals dp at the default font scale).
 *
 * Downloaded files are cached in .cache/compose/<commit>/.
 */

import * as fs from 'fs';
import {
  alias,
  color,
  dimension,
  duration,
  EXT,
  Group,
  header,
  kebab,
  number,
  setToken,
  SOURCES,
  Token,
} from './dtcg.js';

export interface ComposeFile {
  /** Kotlin object name, e.g. `ButtonSmallTokens`. */
  object: string;
  tokens: Group;
}

export interface ComposeTokens {
  files: ComposeFile[];
  /** `Object.Property` entries that were not converted, with the reason. */
  skipped: string[];
}

const SOURCE = SOURCES.compose;

/** Files that only define key enumerations or Kotlin structure. */
const STRUCTURAL = new Set([
  'ColorSchemeKeyTokens',
  'MotionSchemeKeyTokens',
  'ShapeKeyTokens',
  'TypographyKeyTokens',
  'TypographyTokens',
]);

export async function download(url: string): Promise<string> {
  const headers: Record<string, string> = {'User-Agent': 'petal-elements'};
  if (process.env['GITHUB_TOKEN'] && url.startsWith('https://api.github.com')) {
    headers['Authorization'] = `Bearer ${process.env['GITHUB_TOKEN']}`;
  }
  const response = await fetch(url, {headers});
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return response.text();
}

/** Returns {file name: source} for every token file, using the cache. */
export async function fetchComposeSources(commit = SOURCE.commit): Promise<Map<string, string>> {
  const cache = `.cache/compose/${commit}`;
  const index = `${cache}/files.json`;
  if (!fs.existsSync(index)) {
    const repo = SOURCE.repository.replace('https://github.com/', '');
    const list = JSON.parse(
      await download(
        `https://api.github.com/repos/${repo}/contents/${SOURCE.path}?ref=${commit}`,
      ),
    ) as Array<{name: string}>;
    const names = list.map((f) => f.name).filter((n) => n.endsWith('.kt')).sort();
    fs.mkdirSync(cache, {recursive: true});
    for (const name of names) {
      const file = `${cache}/${name}`;
      if (fs.existsSync(file)) continue;
      const raw = `https://raw.githubusercontent.com/${repo}/${commit}/${SOURCE.path}/${name}`;
      fs.writeFileSync(file, await download(raw));
    }
    fs.writeFileSync(index, JSON.stringify(names, null, 2) + '\n');
  }
  const names: string[] = JSON.parse(fs.readFileSync(index, 'utf8'));
  return new Map(names.map((n) => [n, fs.readFileSync(`${cache}/${n}`, 'utf8')]));
}

/** `val Name ... = expression` declarations of the first object in a file. */
function declarations(source: string, file: string) {
  const code = source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '');
  const start = /^internal object (\w+) \{$/m.exec(code);
  if (!start) return null;
  const end = code.indexOf('\n}', start.index);
  const body = code.slice(start.index + start[0].length, end);
  const result: Array<{name: string; expression: string}> = [];
  // Split before each declaration; an expression may span several lines.
  for (const chunk of body.split(/\n(?=\s*(?:(?:inline|const|private)\s+)*val\s)/)) {
    const m = /^\s*(?:(?:inline|const|private)\s+)*val\s+(\w+)\s*(?::[^=\n]*)?(?:\n\s*(?:inline\s+)?get\(\))?\s*=\s*([\s\S]*)$/.exec(
      chunk,
    );
    if (!m) {
      if (chunk.trim()) throw new Error(`${file}: cannot read "${chunk.trim().slice(0, 80)}"`);
      continue;
    }
    const expression = m[2]
      .replace(/\s+/g, ' ')
      .replace(/\(\s+/g, '(')
      .replace(/,?\s*\)/g, ')')
      .trim();
    result.push({name: m[1], expression});
  }
  return {object: start[1], declarations: result};
}

const SHAPE = /^Corner(Value)?(None|ExtraSmall|Small|Medium|LargeIncreased|Large|ExtraLargeIncreased|ExtraLarge|ExtraExtraLarge|Full)(Top|Start|End|Bottom)?$/;

function shapePath(name: string) {
  const m = SHAPE.exec(name);
  if (!m) throw new Error(`Unknown shape token ${name}`);
  const base = m[1] ? 'corner-value' : 'corner';
  return `md.sys.shape.${base}.${kebab(m[2])}${m[3] ? `.${m[3].toLowerCase()}` : ''}`;
}

function typescalePath(name: string) {
  const m = /^(\w+?)(Emphasized)?$/.exec(name)!;
  return `md.sys.typescale.${m[2] ? 'emphasized.' : ''}${kebab(m[1])}`;
}

/** Token path for `object.name`. */
function tokenPath(object: string, name: string): string {
  let m: RegExpExecArray | null;
  switch (object) {
    case 'PaletteTokens':
      return `md.ref.palette.${kebab(name)}`;
    case 'ColorLightTokens':
    case 'ColorDarkTokens':
      return `md.sys.color.${kebab(name)}`;
    case 'TypefaceTokens':
      return `md.ref.typeface.${kebab(name)}`;
    case 'ShapeTokens':
      return shapePath(name);
    case 'ElevationTokens':
      return `md.sys.elevation.${kebab(name)}`;
    case 'StateTokens':
      m = /^(\w+)StateLayerOpacity$/.exec(name);
      if (!m) break;
      return `md.sys.state.${kebab(m[1])}.state-layer-opacity`;
    case 'TypeScaleTokens':
      m = /^(\w+?)(Emphasized)?(Font|LineHeight|Size|Tracking|Weight)$/.exec(name);
      if (!m) break;
      return `md.sys.typescale.${m[2] ? 'emphasized.' : ''}${kebab(m[1])}.${kebab(m[3])}`;
    case 'MotionTokens':
      if ((m = /^Duration(\w+)$/.exec(name))) return `md.sys.motion.duration.${kebab(m[1])}`;
      if ((m = /^Easing(\w+)CubicBezier$/.exec(name))) {
        return `md.sys.motion.easing.${kebab(m[1]).replace(/-/g, '.')}`;
      }
      break;
    case 'ExpressiveMotionTokens':
    case 'StandardMotionTokens':
      m = /^Spring(Default|Fast|Slow)(Spatial|Effects)(Damping|Stiffness)$/.exec(name);
      if (!m) break;
      // The web tokens' md.sys.motion.spring.* are the standard motion
      // scheme. The expressive scheme exists only in Compose.
      return `md.sys.motion.${object === 'ExpressiveMotionTokens' ? 'expressive-spring' : 'spring'}.${kebab(m[1])}.${kebab(m[2])}.${kebab(m[3])}`;
    default:
      return `md.comp.${kebab(object.replace(/Tokens$/, ''))}.${kebab(name)}`;
  }
  throw new Error(`${object}.${name}: no token name`);
}

function px(text: string) {
  const m = /^(-?[\d.]+)\.(dp|sp)$/.exec(text.trim());
  if (!m) throw new Error(`Not a dp/sp value: ${text}`);
  return Number(m[1]);
}

const FONT_WEIGHTS: Record<string, number> = {Normal: 400, Medium: 500, Bold: 700};

class Skip extends Error {}

/** Converts one Kotlin expression. */
function toToken(object: string, name: string, expression: string): Token {
  const e = expression;
  let m: RegExpExecArray | null;
  if ((m = /^ColorSchemeKeyTokens\.(\w+)$/.exec(e))) return alias(`md.sys.color.${kebab(m[1])}`);
  if ((m = /^PaletteTokens\.(\w+)$/.exec(e))) return alias(`md.ref.palette.${kebab(m[1])}`);
  if ((m = /^(?:ShapeKeyTokens|ShapeTokens)\.(\w+)$/.exec(e))) return alias(shapePath(m[1]));
  if ((m = /^ElevationTokens\.(\w+)$/.exec(e))) return alias(`md.sys.elevation.${kebab(m[1])}`);
  if ((m = /^TypographyKeyTokens\.(\w+)$/.exec(e))) return alias(typescalePath(m[1]), 'typography');
  if ((m = /^TypefaceTokens\.(\w+)$/.exec(e))) return alias(`md.ref.typeface.${kebab(m[1])}`);
  if ((m = /^MotionSchemeKeyTokens\.(\w+)$/.exec(e))) {
    // The web side has no value for spring composites either.
    throw new Skip(`motion scheme reference ${m[1]}`);
  }
  if ((m = /^Color\(red = (\d+), green = (\d+), blue = (\d+)\)$/.exec(e))) {
    const hex = [m[1], m[2], m[3]].map((v) => Number(v).toString(16).padStart(2, '0')).join('');
    return color(`#${hex}`);
  }
  if (/^-?[\d.]+\.(dp|sp)$/.test(e)) return dimension(px(e), 'px');
  if ((m = /^(?:RoundedCornerShape|CornerSize)\((-?[\d.]+\.dp)\)$/.exec(e))) {
    return dimension(px(m[1]), 'px');
  }
  if ((m = /^RoundedCornerShape\(topStart = ([^,]+), topEnd = ([^,]+), bottomEnd = ([^,]+), bottomStart = ([^,)]+)\)$/.exec(e))) {
    // CSS border-radius order: top-left, top-right, bottom-right, bottom-left.
    const css = [m[1], m[2], m[3], m[4]].map((v) => `${px(v)}px`).join(' ');
    return {$value: css, $extensions: {[EXT]: {css: true}}};
  }
  if (e === 'CircleShape') {
    return {$value: '50%', $extensions: {[EXT]: {css: true, shape: 'circle'}}};
  }
  if (e === 'RectangleShape') return dimension(0, 'px');
  if ((m = /^CubicBezierEasing\(([^)]*)\)$/.exec(e))) {
    return {$type: 'cubicBezier', $value: m[1].split(',').map((v) => Number(v.trim().replace(/f$/, '')))};
  }
  if (e === 'FontFamily.SansSerif') return {$type: 'fontFamily', $value: 'sans-serif'};
  if ((m = /^FontWeight\.(\w+)$/.exec(e)) && FONT_WEIGHTS[m[1]]) {
    return {$type: 'fontWeight', $value: FONT_WEIGHTS[m[1]]};
  }
  if ((m = /^FontWeight\((\d+)\)$/.exec(e))) return {$type: 'fontWeight', $value: Number(m[1])};
  if ((m = /^(-?[\d.]+)f?$/.exec(e))) {
    const value = Number(m[1]);
    if (object === 'MotionTokens' && name.startsWith('Duration')) return duration(value, 'ms');
    return number(value);
  }
  if (/^[A-Z]\w*$/.test(e)) {
    // A reference within the same object, e.g. `SurfaceTint = Primary`.
    return alias(tokenPath(object, e));
  }
  throw new Error(`${object}.${name}: cannot convert "${e}"`);
}

/** Reads the tokens at the pinned commit, or at `commit` (see upstream.ts). */
export async function readComposeTokens(commit = SOURCE.commit): Promise<ComposeTokens> {
  const sources = await fetchComposeSources(commit);
  const files: ComposeFile[] = [];
  const skipped: string[] = [];
  for (const [file, source] of sources) {
    if (STRUCTURAL.has(file.replace(/\.kt$/, ''))) {
      skipped.push(`${file}: structural file`);
      continue;
    }
    const parsed = declarations(source, file);
    if (!parsed) throw new Error(`${file}: no "internal object"`);
    // The object name can differ from the file name
    // (IconButtonTokens.kt defines StandardIconButtonTokens).
    const {object} = parsed;
    const copyright = /Copyright (\d{4}) The Android Open Source Project/.exec(source);
    const version = /^\/\/ VERSION: (\S+)$/m.exec(source)?.[1];
    if (!copyright) throw new Error(`${file}: no AOSP copyright line`);
    const tokens: Group = header(
      {...SOURCE, commit, copyright: copyright[0]},
      file,
      version ? {tokenVersion: version} : {},
    );
    for (const {name, expression} of parsed.declarations) {
      let token: Token;
      try {
        token = toToken(object, name, expression);
      } catch (e) {
        if (!(e instanceof Skip)) throw e;
        skipped.push(`${object}.${name}: ${e.message}`);
        continue;
      }
      setToken(tokens, tokenPath(object, name), token);
    }
    files.push({object, tokens});
  }
  return {files, skipped: skipped.sort()};
}
