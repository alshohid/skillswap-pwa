/**
 * Builds the production service worker AFTER `next build` has emitted assets.
 *
 * Pipeline:
 *   1. esbuild bundles src/sw.ts (TypeScript + Workbox modules, tree-shaken,
 *      minified) → .sw-tmp/sw.raw.js. NEXT_PUBLIC_API_URL is inlined here via
 *      a define, replacing the old "?api=" query-param trick.
 *   2. workbox-build injectManifest() scans the built output, generates the
 *      precache manifest, injects it at `self.__WB_MANIFEST`, writes public/sw.js.
 *   3. Verifies the injection actually happened and prints a summary.
 *
 * Any failure exits non-zero so a broken deploy can never ship without its
 * expected service worker (spec §36).
 */

import { build } from 'esbuild';
import { injectManifest } from 'workbox-build';
import { rm, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const tmpDir = path.join(root, '.sw-tmp');
const swRaw = path.join(tmpDir, 'sw.raw.js');
const swDest = path.join(root, 'public', 'sw.js');

const MAX_PRECACHE_FILE_BYTES = 3 * 1024 * 1024; // warn on anything larger

const apiBase = (
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api'
).replace(/\/+$/, '');

try {
  console.log('[build-sw] bundling src/sw.ts …');
  await rm(tmpDir, { recursive: true, force: true });
  await build({
    entryPoints: [path.join(root, 'src', 'sw.ts')],
    outfile: swRaw,
    bundle: true,
    format: 'iife',
    target: ['es2020'],
    minify: true,
    define: {
      'process.env.NODE_ENV': '"production"',
      __API_BASE__: JSON.stringify(apiBase),
    },
    logLevel: 'warning',
  });

  console.log('[build-sw] injecting precache manifest …');
  const { count, size, warnings } = await injectManifest({
    swSrc: swRaw,
    swDest,
    globDirectory: root,
    globPatterns: ['public/**/*', '.next/static/**/*'],
    // Never precache the generated service worker itself or source maps.
    globIgnores: ['public/sw.js', '**/*.map'],
    // Map on-disk relative paths (as reported by workbox-build) to their
    // served URLs: public/icons/x.png → /icons/x.png, .next/static/… → /_next/static/…
    modifyURLPrefix: {
      'public/': '/',
      '.next/static/': '/_next/static/',
    },
    // _next/static filenames already contain content hashes → skip revisions.
    dontCacheBustURLsMatching: /[\\/]static[\\/]/,
    maximumFileSizeToCacheInBytes: MAX_PRECACHE_FILE_BYTES,
  });

  if (warnings.length > 0) {
    console.warn('[build-sw] ⚠️  workbox warnings:');
    for (const warning of warnings) console.warn(`  - ${warning}`);
  }

  // Hard verification that the injection point was replaced (§36).
  const output = await readFile(swDest, 'utf8');
  if (output.includes('__WB_MANIFEST')) {
    throw new Error('Precache manifest was not injected into public/sw.js');
  }
  if (!output.includes('workbox')) {
    throw new Error('Generated sw.js does not appear to contain Workbox');
  }

  const { size: destBytes } = await stat(swDest);
  console.log(
    `[build-sw] ✔ public/sw.js generated — ${count} files precached, ` +
      `${(size / 1024).toFixed(1)} KiB of assets, ` +
      `${(destBytes / 1024).toFixed(1)} KiB worker`,
  );
} finally {
  await rm(tmpDir, { recursive: true, force: true });
}