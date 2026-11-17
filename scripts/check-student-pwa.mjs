import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { publicAssets } from '../student-pwa/src/pwa/cache-policy.js';

const root = path.resolve('student-pwa');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.webmanifest'), 'utf8'));
assert.equal(manifest.start_url, './');
assert.equal(manifest.scope, './');
assert.equal(manifest.display, 'standalone');
for (const asset of publicAssets) {
  const file = path.resolve(root, asset === './' ? 'index.html' : asset);
  assert.ok(file.startsWith(root + path.sep));
  assert.ok(fs.statSync(file).isFile(), `Missing public shell asset: ${asset}`);
}
for (const icon of manifest.icons) {
  const meta = await sharp(path.join(root, icon.src)).metadata();
  assert.equal(`${meta.width}x${meta.height}`, icon.sizes);
  assert.equal(meta.format, 'png');
}
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
assert.match(html, /Content-Security-Policy/);
assert.match(html, /form-action 'none'/);
assert.match(html, /name="robots" content="noindex, nofollow"/);
assert.ok(!html.includes('unsafe-inline') && !html.includes('unsafe-eval'));
const tokens = fs.readFileSync(path.join(root, 'styles/tokens.css'), 'utf8');
function color(name) {
  const value = tokens.match(new RegExp(`--color-${name}: (#[a-f0-9]+);`, 'i'))?.[1];
  assert.ok(value, `Missing design color: ${name}`);
  return value.length === 4 ? value.slice(1).split('').map(char => char + char).join('') : value.slice(1);
}
function luminance(value) {
  const channels = value.match(/../g).map(pair => parseInt(pair, 16) / 255).map(channel => channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4);
  return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
}
for (const [foreground, background] of [['text', 'bg'], ['text', 'surface'], ['muted', 'surface'], ['muted', 'bg'], ['surface', 'brand'], ['warning-text', 'warning-bg'], ['brand-strong', 'mint']]) {
  const values = [luminance(color(foreground)), luminance(color(background))].sort((a, b) => a - b);
  assert.ok((values[1] + .05) / (values[0] + .05) >= 4.5, `Insufficient text contrast: ${foreground}/${background}`);
}
console.log(`PWA integrity passed: ${publicAssets.length} explicit public assets, 4 manifest icon dimensions, 7 text-contrast pairs, isolated scope and restrictive document policy.`);
