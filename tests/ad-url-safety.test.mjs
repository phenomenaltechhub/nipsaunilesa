import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
const require = createRequire(import.meta.url);

// Use the repository's TypeScript compiler rather than a separate test dependency.
function moduleUrl(source) {
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  });
  const resolved = outputText.replaceAll('"react/jsx-runtime"', JSON.stringify(pathToFileURL(require.resolve('react/jsx-runtime')).href));
  return `data:text/javascript;base64,${Buffer.from(resolved).toString('base64')}`;
}
const safetyModule = moduleUrl(readFileSync(new URL('../app/ads/url-safety.ts', import.meta.url), 'utf8'));
const { validateAdContactUrl, getAdUrlPlatform, sanitizeAdImage } = await import(safetyModule);
const catalogSource = readFileSync(new URL('../app/ads/data.ts', import.meta.url), 'utf8')
  .replace('"./url-safety"', JSON.stringify(safetyModule));
const { advertisements } = await import(moduleUrl(catalogSource));

for (const href of [
  'https://wa.me/2348146702412',
  'https://wa.me/2349115174619?text=Hello,%20I%20want%20to%20order%20Dodo%20Ikire',
  'https://www.instagram.com/oluwanifemivictoriamoyebi?stkn=MWRpbDdjZzJvOGhidw==',
  'https://www.facebook.com/profile.php?id=100073441203208',
  'mailto:admin@nipsaunilesa.com.ng?subject=PharmWear%20Enquiry',
  'mailto:officialpth.contact@gmail.com',
  'tel:09115174619',
  'tel:+2348146702412',
]) {
  test(`preserves supported ad contact: ${href.split('?')[0]}`, () => {
    assert.equal(validateAdContactUrl(href), href);
  });
}
for (const href of [
  undefined, null, {}, '', 'javascript:alert(1)', 'JaVaScRiPt:alert(1)',
  'java\nscript:alert(1)', 'data:text/html,<script>alert(1)</script>',
  'vbscript:msgbox(1)', '//evil.example', '/ads', 'http://example.com',
  'https:evil.example', 'https://good.example\\@evil.example',
  'https://user:password@example.com', 'https://instagram.com@evil.example',
  'https://example.com:8080', 'https://example.com/%0aheader',
  'https://example.com/%250d%250aheader', 'https://example.com/\u0000',
  'tel:123?body=hello', 'tel:123;ext=456', 'tel:not-a-number',
  'mailto:a@example.com,b@example.com', 'mailto:a@example.com?bcc=b@example.com',
  'mailto:a@example.com?subject=hi%0d%0aBcc:b@example.com',
  'mailto:a@example.com?%62cc=b@example.com',
  'mailto:a@example.com?subject=hello?&bcc=b@example.com',
  'mailto:a@example.com?body=question?&cc=b@example.com',
  'mailto:a@example.com?body=%250d%250aBcc:b@example.com',
  'https://example.com/' + 'a'.repeat(2048),
]) {
  test(`rejects unsafe or unsupported contact ${String(href).slice(0, 75)}`, () => {
    assert.equal(validateAdContactUrl(href), null);
  });
}
test('normalizes HTTPS scheme before external-link target decisions', () => {
  assert.equal(validateAdContactUrl('HTTPS://WWW.INSTAGRAM.COM/person'), 'https://www.instagram.com/person');
});
test('classifies social platforms by hostname boundaries', () => {
  for (const [href, platform] of [
    ['https://wa.me/123', 'whatsapp'], ['https://chat.whatsapp.com/group', 'whatsapp'],
    ['https://www.instagram.com/person', 'instagram'], ['https://www.facebook.com/person', 'facebook'],
    ['https://www.tiktok.com/@person', 'tiktok'], ['https://www.linkedin.com/in/person', 'linkedin'],
  ]) assert.equal(getAdUrlPlatform(href), platform);
  for (const href of ['https://instagram.com.evil.example', 'https://evil.example/instagram.com',
    'https://notinstagram.com', 'https://evil.example/?next=https://wa.me', 'mailto:whatsapp@example.com',
    'https://wa.me@evil.example']) assert.equal(getAdUrlPlatform(href), undefined);
});
test('only reviewed local ad image paths are permitted', () => {
  for (const image of ['/ads/wealthy-treats.jpg', '/ads/pharmwear.svg', '/ads/logo.PNG', '/ads/logo.webp']) {
    assert.equal(sanitizeAdImage(image), image);
  }
  for (const image of ['', undefined, '//evil.example/image.png', 'https://evil.example/image.png',
    'data:image/svg+xml,<svg onload="alert(1)"/>', '/ads/../image.png', '/ads/%2e%2e/image.png',
    '/ads/logo.svg?tracking=1', '/ads/logo.png#fragment', '/ads/logo.html', '/ads/a\\b.png']) {
    assert.equal(sanitizeAdImage(image), '/file.svg');
  }
});

test('all current catalog contact links and images remain usable', () => {
  for (const ad of advertisements) {
    for (const href of [ad.contactHref, ad.socialHref, ...(ad.socialLinks ?? []).map(link => link.href),
      ad.phone ? `tel:${ad.phone.replace(/\s+/g, '')}` : undefined,
      ad.email ? `mailto:${ad.email}` : undefined].filter(Boolean)) {
      assert.equal(validateAdContactUrl(href), href, `${ad.id}: existing contact changed`);
    }
    assert.equal(sanitizeAdImage(ad.image), ad.image, `${ad.id}: existing image rejected`);
    assert.ok(readFileSync(new URL(`../public${ad.image}`, import.meta.url)).length > 0);
  }
});

const socialModule = moduleUrl(readFileSync(new URL('../app/components/social-links.tsx', import.meta.url), 'utf8'));
const actionsSource = readFileSync(new URL('../app/ads/ad-action-links.tsx', import.meta.url), 'utf8')
  .replace('"../components/social-links"', JSON.stringify(socialModule))
  .replace('"./url-safety"', JSON.stringify(safetyModule));
const { AdActionLinks } = await import(moduleUrl(actionsSource));

test('ad rendering omits dangerous destinations and escapes display text', () => {
  const html = renderToStaticMarkup(createElement(AdActionLinks, { ad: {
    ...advertisements[0], businessName: '<img src=x onerror=alert(1)>',
    contactHref: 'javascript:alert(1)', socialHref: 'data:text/html,hello',
    phone: '123?body=hello', email: 'a@example.com?bcc=b@example.com',
    socialLinks: [{ label: 'Instagram', href: 'https://www.instagram.com/person' }],
  }}));
  assert.equal((html.match(/<a /g) ?? []).length, 1);
  assert.ok(html.includes('href="https://www.instagram.com/person"'));
  assert.ok(html.includes('rel="noopener noreferrer"'));
  assert.ok(html.includes('&lt;img'));
  assert.ok(!html.includes('<img'));
  assert.ok(!html.includes('javascript:'));
  assert.ok(!html.includes('data:text/html'));
});
test('deceptive social URL renders a generic Visit action', () => {
  const html = renderToStaticMarkup(createElement(AdActionLinks, { ad: {
    ...advertisements[0], contactHref: 'https://evil.example/instagram.com',
    socialHref: undefined, phone: undefined, email: undefined, socialLinks: [],
  }}));
  assert.ok(html.includes('title="Visit"'));
  assert.ok(!html.includes('is-icon-only'));
});
const seoModule = moduleUrl(readFileSync(new URL('../app/seo.ts', import.meta.url), 'utf8'));
const jsonLdSource = readFileSync(new URL('../app/components/seo-json-ld.tsx', import.meta.url), 'utf8')
  .replace('"../seo"', JSON.stringify(seoModule));
const { StructuredData } = await import(moduleUrl(jsonLdSource));
test('JSON-LD cannot close its script element with hostile ad or page copy', () => {
  const payload = '</script><script>alert(1)</script><img src=x onerror=alert(1)>';
  const html = renderToStaticMarkup(createElement(StructuredData, { data: { name: payload } }));
  assert.equal((html.match(/<script/g) ?? []).length, 1);
  assert.equal((html.match(/<\/script>/g) ?? []).length, 1);
  assert.ok(!html.includes('<img'));
  assert.deepEqual(JSON.parse(html.slice(html.indexOf('>') + 1, html.lastIndexOf('</script>'))), { name: payload });
});

test('mailto preserves question marks inside an allowed subject', () => {
  const href = 'mailto:a@example.com?subject=Question?&body=Hello';
  assert.equal(validateAdContactUrl(href), href);
});
