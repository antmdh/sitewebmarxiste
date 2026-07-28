import assert from 'node:assert/strict';
import { readdir, readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import test from 'node:test';

const root = new URL('..', import.meta.url).pathname;
const read = (path) => readFile(join(root, path), 'utf8');

async function filesIn(directory) {
  const entries = await readdir(join(root, directory));
  return entries.filter((name) => name.endsWith('.md')).map((name) => join(directory, name));
}

test('all required route source files exist', async () => {
  const routes = [
    'src/pages/[locale]/index.astro',
    'src/pages/[locale]/jeux/index.astro',
    'src/pages/[locale]/jeux/[slug].astro',
    'src/pages/[locale]/articles/index.astro',
    'src/pages/[locale]/articles/[slug].astro',
    'src/pages/[locale]/articles/categories/[category].astro',
    'src/pages/[locale]/commander-un-jeu.astro',
    'src/pages/[locale]/communaute.astro',
    'src/pages/[locale]/a-propos.astro',
    'src/pages/[locale]/contact.astro',
    'src/pages/[locale]/newsletter.astro',
    'src/pages/[locale]/mentions-legales.astro',
    'src/pages/[locale]/confidentialite.astro',
  ];
  for (const route of routes) assert.equal((await stat(join(root, route))).isFile(), true, route);
});

test('content frontmatter includes shared localisation and publication fields', async () => {
  const files = (
    await Promise.all(
      ['games', 'articles', 'pages', 'authors'].map((name) => filesIn(`src/content/${name}`)),
    )
  ).flat();
  assert.ok(files.length >= 12, 'expected representative content entries');
  for (const file of files) {
    const source = await read(file);
    const frontmatter = source.match(/^---\n([\s\S]*?)\n---/)?.[1];
    assert.ok(frontmatter, `${file}: missing frontmatter`);
    for (const field of [
      'locale',
      'translationKey',
      'slug',
      'description',
      'publishedAt',
      'category',
      'draft',
    ]) {
      assert.match(frontmatter, new RegExp(`^${field}:`, 'm'), `${file}: missing ${field}`);
    }
    assert.match(frontmatter, /^locale: ['"](fr|en|es|de|nl|it)['"]$/m, `${file}: invalid locale`);
  }
});

test('forms have explicit labels, consent and honeypot fields', async () => {
  const contact = await read('src/components/ContactForm.astro');
  const newsletter = await read('src/components/NewsletterForm.astro');
  assert.match(contact, /<label for="name">/);
  assert.match(contact, /<label for="email">/);
  assert.match(contact, /name="consent"/);
  assert.match(contact, /name="website"/);
  assert.match(newsletter, /name="consent"/);
  assert.match(newsletter, /name="website"/);
  assert.match(newsletter, /cf-turnstile/);
  assert.match(newsletter, /confidentialite/);
  assert.match(newsletter, /aria-live="polite"/);
});

test('newsletter subscriptions are protected and stored by the Worker', async () => {
  const endpoint = await read('src/pages/api/newsletter.ts');
  const store = await read('src/lib/newsletter-store.ts');
  const wrangler = await read('wrangler.jsonc');
  assert.match(endpoint, /CF-Connecting-IP/);
  assert.match(endpoint, /NEWSLETTER_RATE_LIMITER/);
  assert.match(endpoint, /verifyNewsletterTurnstile/);
  assert.match(store, /RSASSA-PKCS1-v1_5/);
  assert.match(store, /valueInputOption/);
  assert.match(store, /RAW/);
  assert.match(store, /HMAC/);
  assert.match(store, /google-oauth-http/);
  assert.match(store, /google-sheets-http/);
  assert.match(endpoint, /newsletter_store_failed/);
  assert.match(wrangler, /"ratelimits"/);
  assert.doesNotMatch(wrangler, /GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY/);
});

test('SEO layout sets language, title, description, canonical and alternates', async () => {
  const layout = await read('src/layouts/BaseLayout.astro');
  const seo = await read('src/components/SeoHead.astro');
  assert.match(layout, /<html lang=\{locale\}>/);
  assert.match(seo, /<title>/);
  assert.match(seo, /name="description"/);
  assert.match(seo, /rel="canonical"/);
  assert.match(seo, /hreflang=/);
});

test('mobile CSS avoids fixed viewport widths and exposes reduced-motion handling', async () => {
  const css = await read('src/styles/global.css');
  assert.doesNotMatch(css, /width:\s*[3-9]\d{2}px/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /overflow-x:\s*hidden/);
  assert.match(css, /:focus-visible/);
});

test('every related article points to an existing game translation key', async () => {
  const games = await filesIn('src/content/games');
  const articles = await filesIn('src/content/articles');
  const gameKeys = new Set();
  for (const file of games) {
    const source = await read(file);
    gameKeys.add(source.match(/^translationKey: "([^"]+)"$/m)?.[1]);
  }
  for (const file of articles) {
    const source = await read(file);
    const related = source.match(/^relatedGame: "([^"]+)"$/m)?.[1];
    if (related) assert.ok(gameKeys.has(related), `${file}: unknown related game ${related}`);
  }
});
