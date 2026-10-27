import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const root = resolve('out');
const site = 'https://nipsaunilesa.com.ng';
function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}
assert.ok(existsSync(root), 'Build first: out/ is missing');
const pages = walk(root).filter(path => path.endsWith('.html'));
assert.ok(pages.length > 0, 'No HTML pages were exported');
const failures = new Set();
const assets = new Set();
let structuredData = 0;
function localFile(pathname) {
  const path = resolve(root, `.${decodeURIComponent(pathname)}`);
  if (path !== root && !path.startsWith(`${root}/`)) return null;
  return [path, `${path}.html`, join(path, 'index.html')]
    .find(candidate => existsSync(candidate) && statSync(candidate).isFile());
}
for (const page of pages) {
  const html = readFileSync(page, 'utf8');
  const route = relative(root, page).replace(/index\.html$/, '').replace(/\.html$/, '');
  const base = new URL(`/${route}`, site);
  // Inspect exported markup only; inline scripts and JSON strings are not HTML tags.
  const markup = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, (script) => {
    const opening = script.slice(0, script.indexOf('>') + 1);
    if (/type="application\/ld\+json"/i.test(opening)) {
      JSON.parse(script.slice(script.indexOf('>') + 1, script.lastIndexOf('</script>')));
      structuredData++;
    }
    return opening;
  });
  for (const tag of markup.matchAll(/<(?:a|img|script|link|source)\b[^>]*>/gi)) {
    for (const attribute of tag[0].matchAll(/\b(href|src)="([^"]*)"/gi)) {
      const value = attribute[2].replaceAll('&amp;', '&');
      if (!value || value === '#') continue;
      let url;
      try { url = new URL(value, base); } catch {
        failures.add(`${relative(root, page)}: malformed ${attribute[1]}`);
        continue;
      }
      if (url.origin !== site) continue;
      const target = localFile(url.pathname);
      if (!target) failures.add(`${relative(root, page)}: missing ${url.pathname}`);
      if (target?.endsWith('.html') && url.hash && /^<a\b/i.test(tag[0])) {
        const fragment = decodeURIComponent(url.hash.slice(1));
        const ids = new Set([...readFileSync(target, 'utf8').matchAll(/\b(?:id|name)="([^"]*)"/g)].map(match => match[1]));
        if (!ids.has(fragment)) failures.add(`${relative(root, page)}: missing anchor ${url.pathname}${url.hash}`);
      }
      if (attribute[1] === 'src' || /^<link\b/i.test(tag[0])) assets.add(url.pathname);
    }
  }
}
const required = ['index.html', 'ads.html', 'resources.html', 'campus-navigator.html', 'events.html',
  'executives.html', 'gallery.html', '404.html', 'robots.txt', 'sitemap.xml'];
for (const file of required) assert.ok(existsSync(join(root, file)), `Missing expected output: ${file}`);
const sitemap = readFileSync(join(root, 'sitemap.xml'), 'utf8');
for (const location of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) {
  const url = new URL(location[1]);
  assert.equal(url.origin, site, 'Unexpected sitemap origin');
  if (!localFile(url.pathname)) failures.add(`sitemap: missing ${url.pathname}`);
}
assert.ok(readFileSync(join(root, 'robots.txt'), 'utf8').includes(`${site}/sitemap.xml`));
assert.ok(readFileSync(join(root, 'resources/nipsa-study-skills-guide.pdf')).subarray(0, 5).equals(Buffer.from('%PDF-')),
  'Study guide must be an actual PDF');
assert.ok(readFileSync(join(root, 'resources.html'), 'utf8').includes('/resources/nipsa-study-skills-guide.pdf'));
assert.ok(structuredData > 0, 'No JSON-LD was checked');
assert.equal(failures.size, 0, [...failures].join('\n'));
console.log(`Static export verified: ${pages.length} HTML documents, ${assets.size} local assets, ${structuredData} valid JSON-LD blocks; no missing internal references.`);
