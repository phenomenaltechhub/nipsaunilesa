// Review-only original vector concepts. Never writes the active M1/M2 identity.
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
const root = path.resolve('design-review/milestone-3');
await fs.mkdir(path.join(root, 'brand'), { recursive: true }); await fs.mkdir(path.join(root, 'exports'), { recursive: true });
const emerald = '#075b4b', teal = '#116d72', ink = '#043e34', mint = '#78e4bb', bg = '#f4f8f6';
const names = ['Open Folio', 'Bonded Spine', 'Scholar Lattice'];
const descriptions = ['Open pages meet a branching molecular edge.', 'A molecular spine holds two balanced book wings.', 'A compact book and bond lattice within one silhouette.'];
const wrap = (body, width, height) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}"><title>PHARMAIDEIA unselected concept review</title>${body}</svg>`;
const text = (x, y, value, size = 24, fill = ink, weight = 400) => `<text x="${x}" y="${y}" fill="${fill}" font-family="Arial,sans-serif" font-size="${size}" font-weight="${weight}">${value}</text>`;
const box = (x, y, w, h, fill = '#fff', radius = 22) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}" fill="${fill}"/>`;
function symbol(index, book = emerald, bond = teal) {
  const common = `fill="none" stroke-linecap="round" stroke-linejoin="round"`;
  if (index === 0) return `<g ${common}><path d="M63 39C49 27 33 27 20 34v61c16-7 30-4 43 8 13-12 27-15 45-8V60" stroke="${book}" stroke-width="6"/><path d="M63 42v61M30 45c9-2 16 0 24 5M30 60c9-2 16 0 24 5M30 75c9-2 16 0 24 5" stroke="${book}" stroke-width="4"/><path d="m66 39 20-13 22 13-4 26-20 12-18-12m18 12v15" stroke="${bond}" stroke-width="5"/><g fill="${bond}"><circle cx="66" cy="39" r="6"/><circle cx="86" cy="26" r="6"/><circle cx="108" cy="39" r="6"/><circle cx="104" cy="65" r="6"/><circle cx="84" cy="77" r="6"/></g></g>`;
  if (index === 1) return `<g ${common}><path d="M53 48C39 35 27 34 16 38v54c15-5 28-2 48 12 20-14 33-17 48-12V38c-11-4-23-3-37 10M64 65v39" stroke="${book}" stroke-width="7"/><path d="M27 52c7-1 14 2 21 6M27 67c7-1 14 2 21 6m32-15c7-4 14-7 21-6m-21 21c7-4 14-7 21-6" stroke="${book}" stroke-width="4"/><path d="m64 17 16 10v20L64 57 48 47V27Z" stroke="${bond}" stroke-width="5"/><g fill="${bond}"><circle cx="64" cy="17" r="6"/><circle cx="80" cy="47" r="6"/><circle cx="48" cy="47" r="6"/></g></g>`;
  return `<g ${common}><path d="M20 31h36l8 9 8-9h36v65H76l-12 10-12-10H20Z" stroke="${book}" stroke-width="8"/><path d="M64 44v62M32 48h17m-17 16h17m-17 16h17" stroke="${book}" stroke-width="5"/><path d="m76 50 17-10 16 10m-33 0v21l17 11 16-11m-16-31v22l-17 9m17-9 16 9" stroke="${bond}" stroke-width="5"/><g fill="${bond}"><circle cx="76" cy="50" r="6"/><circle cx="93" cy="40" r="6"/><circle cx="93" cy="62" r="6"/><circle cx="93" cy="82" r="6"/></g></g>`;
}
const mark = (index, x, y, size, dark = false) => `<g transform="translate(${x} ${y}) scale(${size / 128})">${symbol(index, dark ? '#fff' : emerald, dark ? mint : teal)}</g>`;
function wordmark(index, x, y, width = 680, dark = false) {
  return `<g transform="translate(${x} ${y}) scale(${width / 680})">${mark(index, 0, 0, 112, dark)}${text(138, 58, 'PHARMAIDEIA', 43, dark ? '#fff' : ink, 700)}${text(140, 87, 'NIPSA UNILESA', 17, dark ? mint : teal, 600)}</g>`;
}
const icon = (index, x, y, size) => box(x, y, size, size, emerald, size * .23) + mark(index, x + size * .06, y + size * .06, size * .88, true);
async function output(name, body, w, h, vector = false) {
  const svg = wrap(body, w, h);
  if (vector) await fs.writeFile(path.join(root, 'brand', name + '.svg'), svg);
  else await sharp(Buffer.from(svg)).png().toFile(path.join(root, 'exports', name + '.png'));
}
let comparison = box(0, 0, 1080, 2060, bg, 0) + text(48, 66, 'PHARMAIDEIA', 42, ink, 700) + text(48, 111, 'Book–Molecule Interlock · three original variations', 25) + text(48, 149, 'REVIEW ONLY · No selection made · M1/M2 identity remains active', 18, teal, 600);
for (let index = 0; index < 3; index++) {
  const n = index + 1, y = 190 + index * 600;
  await output(`variation-${n}-symbol`, symbol(index), 128, 128, true);
  await output(`variation-${n}-wordmark-light`, wordmark(index, 0, 0), 680, 128, true);
  await output(`variation-${n}-wordmark-dark`, wordmark(index, 0, 0, 680, true), 680, 128, true);
  await output(`variation-${n}-app-icon`, icon(index, 0, 0, 512), 512, 512, true);
  await output(`variation-${n}-app-icon`, icon(index, 0, 0, 512), 512, 512);
  comparison += box(32, y, 1016, 568) + box(56, y + 28, 50, 50, emerald, 25) + text(72, y + 63, String(n), 28, '#fff', 700) + text(126, y + 62, names[index], 31, ink, 700) + text(56, y + 111, descriptions[index], 22, '#526c63');
  comparison += wordmark(index, 62, y + 139, 760) + box(56, y + 300, 968, 146, ink, 18) + wordmark(index, 80, y + 315, 720, true);
  comparison += text(56, y + 486, 'Actual-size glyphs:', 18, '#526c63');
  [16, 24, 32, 48, 64].forEach((size, position) => { const x = 300 + position * 130; comparison += mark(index, x, y + 460, size) + text(x, y + 547, size + ' px', 17, '#526c63'); });
  const phone = (x, py, title, content) => text(x + 8, py - 18, title, 26, ink, 700) + box(x, py, 470, 690, '#183b33', 38) + box(x + 12, py + 12, 446, 666, '#f4f8f6', 28) + content;
  let context = box(0, 0, 1080, 1770, bg, 0) + text(42, 60, `${n}. ${names[index]}`, 38, ink, 700) + text(42, 105, 'Unselected original concept · illustrative screens, not live services', 21, teal);
  context += phone(42, 174, 'Home-screen icon', text(75, 235, '9:41', 19) + icon(index, 205, 335, 132) + text(169, 511, 'PHARMAIDEIA', 25, ink, 600) + text(91, 755, 'Generic device frame · no OS logos', 17, '#526c63'));
  context += phone(568, 174, 'PWA splash', mark(index, 724, 342, 160) + text(643, 559, 'PHARMAIDEIA', 32, ink, 700) + text(700, 600, 'NIPSA UNILESA', 18, teal, 600) + text(689, 758, 'Splash concept only', 18, '#526c63'));
  context += phone(42, 960, 'Login branding study', wordmark(index, 79, 1035, 375) + text(80, 1214, 'Student sign-in', 28, ink, 700) + text(80, 1260, 'Institutional email', 19) + box(78, 1278, 370, 55, '#e5eeea', 10) + text(80, 1375, 'Password', 19) + box(78, 1393, 370, 55, '#e5eeea', 10) + text(80, 1547, 'Branding preview', 20, teal, 600));
  context += text(576, 943, 'Dashboard-header study', 26, ink, 700) + box(568, 960, 470, 300) + wordmark(index, 588, 982, 420) + text(591, 1170, 'Dashboard', 24, ink, 600) + text(591, 1210, 'Your academic workspace', 20, '#526c63') + text(576, 1320, 'Standalone icon variants', 25, ink, 700) + icon(index, 589, 1370, 140) + box(775, 1353, 230, 200, ink) + mark(index, 813, 1370, 150, true) + text(42, 1720, 'REVIEW ONLY · No login, hosting or final identity is activated.', 22, teal, 600);
  await output(`variation-${n}-contexts`, context, 1080, 1770);
}
comparison += text(48, 2030, 'Choose a number only after review. No concept has replaced the current app logo.', 21, teal);
await output('three-logo-comparison', comparison, 1080, 2060);
let icons = box(0, 0, 1080, 760, bg, 0) + text(45, 68, 'PHARMAIDEIA · app icon comparison', 34, ink, 700) + text(45, 112, 'Three unselected original Book–Molecule concepts', 23, teal);
for (let index = 0; index < 3; index++) icons += icon(index, 65 + index * 345, 205, 260) + text(76 + index * 345, 525, `${index + 1}. ${names[index]}`, 25, ink, 600);
icons += text(45, 658, 'Emerald + teal · M1/M2 production assets preserved · review only', 21, teal);
await output('app-icon-comparison', icons, 1080, 760);
console.log('Generated 3 original SVG concept families, numbered comparison, app icons and all requested application-context PNGs. Active identity untouched.');
