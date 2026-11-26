import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { isAbsolute, join, relative, resolve, sep } from 'node:path';
import sharp from 'sharp';

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
  for (const tag of markup.matchAll(/<(?:a|img|script|link|source|video|track)\b[^>]*>/gi)) {
    for (const attribute of tag[0].matchAll(/\b(href|src|poster)="([^"]*)"/gi)) {
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
  'executives.html', 'gallery.html', 'portal/tools.html', 'website-tour.html',
  'media/website-tour/walkthrough.mp4', 'media/website-tour/captions.vtt', 'media/website-tour/transcript.txt',
  'media/website-tour/poster.webp', '404.html', 'robots.txt', 'sitemap.xml'];
for (const file of required) assert.ok(existsSync(join(root, file)), `Missing expected output: ${file}`);
assert.ok(!existsSync('public/website-tour'),
  'Keep Tour media separate from its clean HTML route; generated Next.js RSC files are permitted');
const homeHtml = readFileSync(join(root, 'index.html'), 'utf8');
assert.ok(homeHtml.includes('Learn boldly.') && homeHtml.includes('GALLERY PREVIEW'),
  'Homepage hero and Gallery preview must be present in the static export');
for (const [label, html] of [
  ['homepage', homeHtml],
  ['Gallery', readFileSync(join(root, 'gallery.html'), 'utf8')],
]) {
  const dialogs = [...html.matchAll(/<dialog\b[^>]*>/gi)].map(([tag]) => tag);
  assert.ok(dialogs.length > 0, `${label} must include its image viewer dialog`);
  assert.ok(dialogs.every(tag => !/\bopen(?:\s|=|>)/i.test(tag)),
    `${label} must not server-render an unintentionally open image viewer`);
}
const cssFiles = walk(join(root, '_next', 'static', 'chunks')).filter(path => path.endsWith('.css'));
assert.ok(cssFiles.length > 0, 'No application stylesheet was exported');
const exportedCss = cssFiles.map(path => readFileSync(path, 'utf8')).join('\n');
assert.ok(exportedCss.includes('.gallery-lightbox:not([open])')
  && exportedCss.includes('display:none!important'),
  'Closed Gallery dialogs must be removed from layout');
const sitemap = readFileSync(join(root, 'sitemap.xml'), 'utf8');
assert.ok(sitemap.includes(`${site}/website-tour`), 'Tour must be discoverable in the sitemap');
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
assert.ok(orientationHtml.includes('1st December 2026'), 'Orientation event date must be displayed independently of the publication date');
assert.ok(!orientationHtml.includes('orientation-status-pill'), 'Duplicate hero status indicator must not be exported');
for (const value of [
  '1st December 2026',
  '11:00AM',
  'Basic Medical Sciences Hall (BMSH)',
  'Upcoming',
  '/resources#orientation-checklist',
  checklistPdf,
  'info@nipsaunilesa.com.ng',
]) {
  assert.ok(orientationHtml.includes(value), `Orientation detail is missing ${value}`);
}
// Executive social cards must be present in the exported files, not just referenced in metadata.
const executiveSource = readFileSync('app/executives/data.ts', 'utf8');
const executivePhotoRecords = [...executiveSource.matchAll(/\bslug:\s*"([^"]+)"[\s\S]*?\bimage:\s*"([^"]+)"/g)];
assert.ok(executivePhotoRecords.length > 0, 'No executive portraits found for social-card checks');
for (const [, slug, sourceImagePath] of executivePhotoRecords) {
  const imagePath = `/social/executives/${slug}-portrait.jpg`;
  const exportedImage = localFile(imagePath);
  assert.ok(exportedImage, `Missing executive social-card image: ${slug}`);
  const imageBytes = readFileSync(exportedImage);
  assert.ok(imageBytes.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff])),
    `Social-card image must be JPEG: ${slug}`);
  const dimensions = await sharp(imageBytes).metadata();
  const sourceDimensions = await sharp(readFileSync(join('public', sourceImagePath.slice(1)))).metadata();
  const rotated = [6, 8].includes(sourceDimensions.orientation ?? 1);
  assert.equal(dimensions.width, rotated ? sourceDimensions.height : sourceDimensions.width,
    `Executive social portrait must preserve the source's width: ${slug}`);
  assert.equal(dimensions.height, rotated ? sourceDimensions.width : sourceDimensions.height,
    `Executive social portrait must preserve the source's height: ${slug}`);
  const profileHtml = readFileSync(join(root, `executives/${slug}.html`), 'utf8');
  assert.ok(profileHtml.includes(`og:image`) && profileHtml.includes(`https://nipsaunilesa.com.ng${imagePath}`),
    `Executive social metadata must use its public JPEG: ${slug}`);
}
const portalHtml = readFileSync(join(root, 'portal.html'), 'utf8');
assert.ok(portalHtml.includes('/brand/pharmaideia/pharmaideia-logo-stacked.png')
  && portalHtml.includes('Introducing PHARMAIDEIA')
  && portalHtml.includes('Coming Soon'), 'Student Portal must include the approved PHARMAIDEIA introduction');
const portalToolsLinks = portalHtml.match(/href="\/portal\/tools(?:#[^"]*)?"/g) ?? [];
assert.equal(portalToolsLinks.length, 1, 'Student Portal must have one link to the combined study tools page');
assert.ok(portalHtml.includes('Open study tools'), 'Student Portal must label the combined study tools link');
const studyToolsHtml = readFileSync(join(root, 'portal/tools.html'), 'utf8');
for (const id of ['gpa-calculator', 'study-timetable', 'study-planner']) {
  assert.ok(studyToolsHtml.includes(`id="${id}"`), `Study tools route must render the ${id} anchor`);
}
assert.ok(studyToolsHtml.includes("not a verified University of Ilesa policy")
  && studyToolsHtml.includes("stored locally in this browser"),
  'Study tools must identify the sample scale and local data storage');
const galleryHtml = readFileSync(join(root, 'gallery.html'), 'utf8');
for (const value of [
  'gallery-physics-practical',
  'gallery-biology-practical',
  'PHENOMENAL Shot it',
  'Browse photo albums',
  'Download watermarked copy',
  'Zoom in',
]) {
  assert.ok(galleryHtml.includes(value), `Gallery is missing ${value}`);
}
const transparentLogo = readFileSync(join(root, 'nipsa-logo-watermark.png'));
assert.ok(transparentLogo.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])),
  'Transparent watermark logo must be an exported PNG');
assert.equal((await sharp(transparentLogo).metadata()).hasAlpha, true,
  'Watermark logo must preserve transparency');
for (const photo of [
  '100-level-physics-practical-01.jpg',
  '100-level-physics-practical-02.jpg',
  '100-level-physics-practical-03.jpg',
  '100-level-physics-practical-04.jpg',
  'chubenz.jpg',
]) {
  assert.ok(readFileSync(join(root, 'gallery', photo)).equals(readFileSync(join('public', 'gallery', photo))),
    `Exported original Gallery photo must remain unchanged: ${photo}`);
}
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
