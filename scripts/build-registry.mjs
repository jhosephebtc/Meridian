/**
 * Builds shadcn-compatible registry items under public/r/
 * Usage: node scripts/build-registry.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'public', 'r');
mkdirSync(outDir, { recursive: true });

const catalogSrc = readFileSync(join(root, 'src', 'component-catalog.ts'), 'utf8');
const ids = [...catalogSrc.matchAll(/id: '([^']+)'/g)].map((m) => m[1]);

const SOURCE_MAP = {
  button: ['registry/meridian/button.tsx', 'registry/meridian/utils.ts', 'registry/meridian/meridian-ui.css'],
  slider: ['registry/meridian/slider.tsx', 'registry/meridian/utils.ts', 'registry/meridian/meridian-ui.css'],
  dial: ['registry/meridian/dial.tsx', 'registry/meridian/utils.ts', 'registry/meridian/meridian-ui.css'],
  'detent-dial': ['registry/meridian/dial.tsx', 'registry/meridian/utils.ts', 'registry/meridian/meridian-ui.css'],
  'camera-dial': ['registry/meridian/dial.tsx', 'registry/meridian/utils.ts', 'registry/meridian/meridian-ui.css'],
  'camera-wheel': ['registry/meridian/dial.tsx', 'registry/meridian/utils.ts', 'registry/meridian/meridian-ui.css'],
  switch: ['registry/meridian/switch.tsx', 'registry/meridian/utils.ts', 'registry/meridian/meridian-ui.css'],
};

function fileType(path) {
  if (path.endsWith('.css')) return 'registry:file';
  if (path.includes('utils')) return 'registry:lib';
  return 'registry:ui';
}

function targetFor(path) {
  if (path.endsWith('.css')) return 'styles/meridian-ui.css';
  if (path.includes('utils')) return 'lib/utils.ts';
  const base = path.split('/').pop();
  return `components/meridian/${base}`;
}

function stubTsx(id) {
  const name = id
    .split('-')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join('');
  return `import * as React from "react";

/** Meridian line component — ${id}. Pair with styles/meridian-ui.css (DS tokens --ds-*). */
export function ${name}(props: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="ml-plate-empty" data-meridian-component="${id}" {...props}>
      Meridian · ${id}
    </div>
  );
}
`;
}

function buildItem(id) {
  const paths = SOURCE_MAP[id] ?? null;
  const files = [];

  if (paths) {
    for (const p of paths) {
      const abs = join(root, p);
      if (!existsSync(abs)) continue;
      files.push({
        path: p,
        type: fileType(p),
        target: targetFor(p),
        content: readFileSync(abs, 'utf8'),
      });
    }
  } else {
    files.push({
      path: `registry/meridian/${id}.tsx`,
      type: 'registry:ui',
      target: `components/meridian/${id}.tsx`,
      content: stubTsx(id),
    });
    const cssPath = join(root, 'registry/meridian/meridian-ui.css');
    if (existsSync(cssPath)) {
      files.push({
        path: 'registry/meridian/meridian-ui.css',
        type: 'registry:file',
        target: 'styles/meridian-ui.css',
        content: readFileSync(cssPath, 'utf8'),
      });
    }
  }

  return {
    $schema: 'https://ui.shadcn.com/schema/registry-item.json',
    name: id,
    type: 'registry:ui',
    title: `Meridian ${id}`,
    description: `Meridian Design System line component (${id}). Tactile gestures, SVG-line visual, --ds-* tokens.`,
    dependencies: id === 'button' ? ['class-variance-authority', 'clsx', 'tailwind-merge'] : ['clsx', 'tailwind-merge'],
    registryDependencies: [],
    files,
  };
}

const items = ids.map((id) => {
  const item = buildItem(id);
  writeFileSync(join(outDir, `${id}.json`), JSON.stringify(item, null, 2));
  return { name: id, type: 'registry:ui', title: item.title };
});

const registry = {
  $schema: 'https://ui.shadcn.com/schema/registry.json',
  name: 'meridian',
  homepage: 'https://github.com/jhosephebtc/Meridian',
  items,
};

writeFileSync(join(outDir, 'registry.json'), JSON.stringify(registry, null, 2));
console.log(`Wrote ${items.length} registry items → public/r/`);
