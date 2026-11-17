import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { publicAssets } from '../student-pwa/src/pwa/cache-policy.js';
import { avatars } from '../student-pwa/src/modules/account/avatars.js';

const root = path.resolve('student-pwa');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.webmanifest'), 'utf8'));
assert.equal(manifest.start_url, './');
assert.equal(manifest.scope, './');
assert.equal(manifest.display, 'standalone');
assert.ok(!publicAssets.some(asset => /developer|preparation|diagnostic/i.test(asset)), 'Developer interfaces must not be shipped in the student offline cache');
for (const name of ['developer-tools', 'design-review','backend']) assert.ok(!fs.existsSync(path.resolve('out', name)), 'Development tooling must stay out of the website export');
let publicBytes = 0; let javascriptBytes = 0;
for (const asset of publicAssets) {
  const file = path.resolve(root, asset === './' ? 'index.html' : asset);
  assert.ok(file.startsWith(root + path.sep));
  assert.ok(fs.statSync(file).isFile(), `Missing public shell asset: ${asset}`);
  publicBytes += fs.statSync(file).size;
  if (file.endsWith('.js')) javascriptBytes += fs.statSync(file).size;
}
const cached = new Set(publicAssets.map(asset => path.resolve(root,asset==='./'?'index.html':asset)));
for(const file of cached) if(file.endsWith('.js')) {
  const source=fs.readFileSync(file,'utf8');
  for(const match of source.matchAll(/\bfrom\s*['"]([^'"]+)['"]/g)) {
    assert.ok(match[1].startsWith('.'),'PWA runtime imports must remain local');
    assert.ok(cached.has(path.resolve(path.dirname(file),match[1])),`Uncached runtime dependency: ${match[1]}`);
  }
}
assert.ok(publicBytes <= 200_000, `Public offline shell exceeds 200 KB: ${publicBytes}`);
assert.ok(javascriptBytes <= 80_000, `PWA JavaScript exceeds 80 KB: ${javascriptBytes}`);
assert.equal(avatars.length, 20); assert.equal(new Set(avatars.map(avatar => avatar.id)).size, 20);
for (const name of ['atlas', ...avatars.map(avatar => avatar.id)]) {
  const svg = fs.readFileSync(path.join(root, 'assets/avatars', name + '.svg'), 'utf8');
  assert.ok(!/<script\b|<foreignObject\b|\son[a-z]+\s*=|(?:href|src)=["'](?:https?:|\/\/|data:|javascript:)/i.test(svg), `Active/external avatar content: ${name}`);
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
console.log(`PWA integrity passed: ${publicAssets.length} public assets (${publicBytes} bytes, ${javascriptBytes} bytes JS), 20 safe SVG avatars, 4 icon dimensions, 7 contrast pairs, isolated scope/document policy. Budgets: 200 KB shell / 80 KB JS.`);
