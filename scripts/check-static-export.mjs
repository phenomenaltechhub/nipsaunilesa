import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { isAbsolute, join, relative, resolve, sep } from 'node:path';

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
  const relativePath = relative(root, path);
  if (isAbsolute(relativePath) || relativePath === '..' || relativePath.startsWith(`..${sep}`)) return null;
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
  'executives.html', 'gallery.html', 'portal/tools.html', '404.html', 'robots.txt', 'sitemap.xml'];
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
const checklistPdf = '/resources/department-orientation-checklist.pdf';
const resourcesHtml = readFileSync(join(root, 'resources.html'), 'utf8');
assert.ok(readFileSync(join(root, checklistPdf)).subarray(0, 5).equals(Buffer.from('%PDF-')),
  'Orientation checklist must export as an actual PDF');
assert.ok(readFileSync(join(root, checklistPdf)).equals(readFileSync('public' + checklistPdf)),
  'Exported checklist must preserve the supplied PDF bytes');
assert.ok(resourcesHtml.includes('id="orientation-checklist"') && resourcesHtml.includes(checklistPdf)
  && resourcesHtml.includes('Open checklist (PDF)'), 'Orientation PDF and navigation anchor must be exported');
const orientationHtml = readFileSync(join(root, 'announcements/departmental-orientation.html'), 'utf8');
for (const [label, html] of [
  ['homepage', readFileSync(join(root, 'index.html'), 'utf8')],
  ['announcements archive', readFileSync(join(root, 'announcements.html'), 'utf8')],
  ['orientation detail', orientationHtml],
]) {
  assert.ok(html.includes('22 Nov 2026'), `${label} must show the publication date`);
  assert.ok(!html.includes('1st Dec 2026'), `${label} must not use the former date`);
}
assert.ok(orientationHtml.includes('2026-11-22T00:00:00.000Z')
  && orientationHtml.includes('article:published_time'), 'Orientation metadata must use the publication date');
assert.ok(orientationHtml.includes('1 December 2026'), 'Orientation event date must be displayed independently');
assert.ok(!orientationHtml.includes('orientation-status-pill'), 'Duplicate hero status indicator must not be exported');
for (const value of [
  'To be confirmed',
  'To be communicated by the department',
  'Upcoming',
  '/resources#orientation-checklist',
  checklistPdf,
  'info@nipsaunilesa.com.ng',
]) {
  assert.ok(orientationHtml.includes(value), `Orientation detail is missing ${value}`);
}
const portalHtml = readFileSync(join(root, 'portal.html'), 'utf8');
assert.ok(portalHtml.includes('/brand/pharmaideia/pharmaideia-logo-stacked.png')
  && portalHtml.includes('Introducing PHARMAIDEIA')
  && portalHtml.includes('Coming Soon'), 'Student Portal must include the approved PHARMAIDEIA introduction');
for (const tool of [
  ['/portal/tools#gpa-calculator', 'GPA and CGPA'],
  ['/portal/tools#study-timetable', 'Study timetable'],
  ['/portal/tools#study-planner', 'What should I study today?'],
]) {
  assert.ok(portalHtml.includes(tool[0]) && portalHtml.includes(tool[1]),
    `Student Portal is missing the ${tool[1]} entry link`);
}
const studyToolsHtml = readFileSync(join(root, 'portal/tools.html'), 'utf8');
for (const id of ['gpa-calculator', 'study-timetable', 'study-planner']) {
  assert.ok(studyToolsHtml.includes(`id="${id}"`), `Study tools route must render the ${id} anchor`);
}
assert.ok(studyToolsHtml.includes("not a verified University of Ilesa policy")
  && studyToolsHtml.includes("stored locally in this browser"),
  'Study tools must identify the sample scale and local data storage');
for (const slug of [
  'welcome-to-the-new-nipsa-student-resource-hub',
  'meet-your-student-community',
]) {
  const announcementHtml = readFileSync(join(root, `announcements/${slug}.html`), 'utf8');
  assert.ok(announcementHtml.includes('Related resources'), `${slug} must include related links`);
  assert.ok(announcementHtml.includes('Student Portal'), `${slug} must explain its Portal connection`);
}
assert.ok(structuredData > 0, 'No JSON-LD was checked');
assert.equal(failures.size, 0, [...failures].join('\n'));
console.log(`Static export verified: ${pages.length} HTML documents, ${assets.size} local assets, ${structuredData} valid JSON-LD blocks; no missing internal references.`);
