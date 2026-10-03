import { readFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
const root = new URL('../apps/web/dist/', import.meta.url);
const manifest = JSON.parse(await readFile(new URL('.vite/manifest.json', root), 'utf8'));
const visited = new Set();
async function walk(key) {
  if (visited.has(key)) return 0;
  visited.add(key);
  const entry = manifest[key];
  if (!entry) throw new Error(`Missing manifest entry: ${key}`);
  if (/interactive-world|three/i.test(key))
    throw new Error('Three.js leaked into the initial route.');
  const bytes = await readFile(new URL(entry.file, root));
  if (/WebGLRenderer|REVISION\s*=\s*["']18[0-9]/.test(bytes.toString()))
    throw new Error('Three.js was found in an initial chunk.');
  const sizes = await Promise.all((entry.imports || []).map(walk));
  return gzipSync(bytes).length + sizes.reduce((sum, size) => sum + size, 0);
}
const bytes = await walk('index.html');
if (bytes > 190 * 1024)
  throw new Error(`Initial JS ${Math.round(bytes / 1024)} KB exceeds 190 KB gzip budget.`);
console.log(`Initial JS: ${(bytes / 1024).toFixed(1)} KB gzip; Three.js is lazy.`);
