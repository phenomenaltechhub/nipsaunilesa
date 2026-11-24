import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
const viewer = readFileSync(new URL("../app/gallery/gallery-image-viewer.tsx", import.meta.url), "utf8");
const data = readFileSync(new URL("../app/gallery/data.ts", import.meta.url), "utf8");
const homepage = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");

test("closed Gallery dialogs cannot cover the homepage", () => {
  assert.match(css, /\.gallery-lightbox:not\(\[open\]\)\s*\{\s*display:\s*none!important\s*\}/);
  assert.match(css, /\.gallery-lightbox\[open\]\s*\{[^}]*display:grid/);
  assert.doesNotMatch(css, /\.gallery-lightbox\s*\{\s*display:block/);
  assert.match(viewer, /if \(isOpen && !dialog\.open\) dialog\.showModal\(\)/);
});

test("homepage previews stay on the homepage and open the original photograph", () => {
  assert.match(homepage, /image=\{image\}/);
  assert.match(viewer, /useState\(Boolean\(requestedImage\) \|\| initiallyOpen\)/);
  assert.match(viewer, /selectImage\(selectedImage, Boolean\(selectedImage && isGallery\)\)/);
  assert.match(viewer, /src=\{currentImage\?\.src \?\? src\}/);
});

test("watermark generation is bound to the explicit download action", () => {
  assert.match(viewer, /onClick=\{downloadWatermarkedImage\}/);
  assert.match(viewer, /loadImage\("\/nipsa-logo-watermark\.png", "transparent NIPSA watermark"\)/);
  assert.match(viewer, /context\.drawImage\(sourceImage, 0, 0, canvas\.width, canvas\.height\)/);
  assert.match(viewer, /context\.drawImage\(logo, logoX, logoY, watermarkWidth, watermarkHeight\)/);
  assert.match(viewer, /canvas\.toBlob\([\s\S]*"image\/png"\)/);
  assert.match(viewer, /link\.download = `\$\{baseName\}-nipsa\.png`/);
  assert.doesNotMatch(viewer, /context\.fillRect\(/);
  assert.match(viewer, /URL\.revokeObjectURL/);
});

test("Gallery supports the supplied exact credit and future photo metadata", () => {
  assert.equal((data.match(/credit: "PHENOMENAL Shot it"/g) ?? []).length, 5);
  assert.match(data, /title\?: string/);
  assert.match(data, /caption\?: string/);
  assert.match(data, /date\?: string/);
  assert.match(data, /location\?: string/);
  assert.match(data, /story\?: string/);
});

test("photo navigation keeps a single viewer history entry", () => {
  assert.match(viewer, /pushState\(\{ galleryViewer: true \}, "", imagePath\)/);
  assert.match(viewer, /replaceState\(window\.history\.state, "", `\/gallery\/\$\{nextImage\.slug\}`\)/);
  assert.match(viewer, /if \(viewerHistoryEntry\.current\) \{\s*window\.history\.back\(\)/);
  assert.match(viewer, /\.split\("\/"\)\.pop\(\)\?\.replace\(\/\\\.html\$\/, ""\)/);
  assert.match(viewer, /path\.endsWith\("\.html"\) \? "\/gallery\.html" : "\/gallery"/);
});
