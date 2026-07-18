import assert from 'node:assert/strict';
import { access, readdir, readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const dist = join(root, 'dist');

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory() ? walk(path) : [path];
    }),
  );
  return nested.flat();
}

const htmlFiles = (await walk(dist)).filter((file) => extname(file) === '.html');
const missing = [];
let linksChecked = 0;

for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  const hrefs = [...html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)].map((match) => match[1]);
  for (const href of new Set(hrefs)) {
    if (!href.startsWith('/') || href.startsWith('//')) continue;
    const pathname = href.split(/[?#]/)[0];
    if (!pathname || pathname.startsWith('/_')) continue;
    linksChecked += 1;
    const target = pathname.endsWith('/')
      ? join(dist, pathname, 'index.html')
      : join(dist, `${pathname}.html`);
    try {
      await access(target);
    } catch {
      missing.push(`${file.replace(`${dist}/`, '')}: ${href}`);
    }
  }
}

assert.equal(missing.length, 0, `Broken internal links:\n${missing.join('\n')}`);
console.log(`Internal link check passed: ${linksChecked} links across ${htmlFiles.length} pages.`);
