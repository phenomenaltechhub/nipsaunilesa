import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("native sharing sends only the URL for announcements, events, executives, ads and gallery", () => {
  for (const path of [
    "app/components/share-page-button.tsx",
    "app/ads/ad-share-button.tsx",
    "app/gallery/gallery-image-viewer.tsx",
  ]) {
    const code = source(path);
    assert.match(code, /navigator\.share\(\{ url \}\)/, `${path} must share the URL only`);
    assert.doesNotMatch(code, /navigator\.share\(\{[^}]*\b(?:title|text|description)\s*:/, `${path} must not repeat preview copy`);
  }
});

test("individual pages retain distinct static social metadata", () => {
  for (const path of [
    "app/announcements/[slug]/page.tsx",
    "app/events/[slug]/page.tsx",
    "app/executives/[slug]/page.tsx",
    "app/ads/[slug]/page.tsx",
    "app/gallery/[slug]/page.tsx",
  ]) {
    assert.match(source(path), /createPageMetadata\(\{/, `${path} needs page-level metadata`);
  }
  const seo = source("app/seo.ts");
  assert.match(seo, /const socialImage = absoluteSiteUrl\(image\)/);
  assert.match(seo, /images: \[\{ url: socialImage, alt: imageAlt \}\]/);
  assert.match(seo, /images: \[socialImage\]/);
});
