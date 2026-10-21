/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import {
  createPackageAnalyzer,
  type AbsolutePath,
} from '@lit-labs/analyzer/package-analyzer.js';
import {generateManifest} from '@lit-labs/gen-manifest';
import {writeFileTree} from '@lit-labs/gen-utils/lib/file-utils.js';
import type {Package as Manifest, Module} from 'custom-elements-manifest';

const ROOT = process.cwd() as AbsolutePath;

const mainManifest = await generateManifestFromTsconfig(ROOT);

function includedModules(module: Module) {
  const isTestFile =
    module.path.includes('_test') ||
    module.path.includes('test/') ||
    module.path.includes('testing/');
  // Include all non-test files.
  if (!isTestFile) return true;
  // Only include these test files.
  return (
    module.path.includes('harness') ||
    module.path.includes('transform-pseudo-classes')
  );
}
const manifest = {
  ...mainManifest,
  modules: mainManifest.modules.filter(includedModules),
};

// The analyzer reads `@slot - description` as a slot named "-"; the default
// slot has the empty name in the manifest schema.
for (const module of manifest.modules) {
  for (const declaration of module.declarations ?? []) {
    for (const slot of (declaration as {slots?: Array<{name: string}>}).slots ?? []) {
      if (slot.name === '-') slot.name = '';
    }
  }
}

await writeFileTree(ROOT, {
  'custom-elements.json': JSON.stringify(manifest, null, 2),
});
console.log('Generated custom-elements.json');

async function generateManifestFromTsconfig(basePath: AbsolutePath) {
  const analyzer = createPackageAnalyzer(basePath);
  const pkg = analyzer.getPackage();
  const files = await generateManifest(pkg);
  const manifestContent = files['custom-elements.json'];
  if (typeof manifestContent !== 'string') {
    throw new Error(
      `Expected 'custom-elements.json': '<string>' from @lit-labs/gen-manifest, but got ${typeof manifestContent}`,
    );
  }
  return JSON.parse(manifestContent) as Manifest;
}
