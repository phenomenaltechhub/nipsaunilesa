// Original Book–Molecule Interlock artwork. No source images or external fonts.
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const directory = path.resolve('student-pwa/assets/brand');
await fs.mkdir(directory, { recursive: true });
const palette = { emerald: '#075b4b', ink: '#043e34', teal: '#116d72', mint: '#78e4bb', white: '#ffffff' };

function artwork(book, bond) {
  return `<g fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M64 44C51 32 37 30 24 35V88C39 82 51 86 64 98C77 86 89 82 104 88V61" stroke="${book}" stroke-width="6"/><path d="M64 47V98M33 48C42 46 50 49 55 53M33 60C42 58 50 61 55 65M33 72C42 70 50 73 55 77" stroke="${book}" stroke-width="4"/><path d="M65 44L84 32L104 43L84 56V78L66 89M84 56L66 46" stroke="${bond}" stroke-width="4.5"/><g fill="${bond}" stroke="${bond}" stroke-width="2"><circle cx="65" cy="44" r="5"/><circle cx="84" cy="32" r="6"/><circle cx="104" cy="43" r="5"/><circle cx="84" cy="56" r="5"/><circle cx="84" cy="78" r="5"/></g></g>`;
}
const wrap = (content, width = 128, height = 128) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="brand-title"><title id="brand-title">PHARMAIDEIA — Book–Molecule Interlock</title>${content}</svg>\n`;
const symbol = wrap(artwork(palette.emerald, palette.teal));
const dark = wrap(artwork(palette.white, palette.mint));
const mono = wrap(artwork('#111111', '#111111'));
const monoLight = wrap(artwork('#ffffff', '#ffffff'));
const appIcon = wrap(`<rect width="128" height="128" rx="27" fill="${palette.emerald}"/>${artwork(palette.white, palette.mint)}`);
const maskable = wrap(`<path fill="${palette.emerald}" d="M0 0h128v128H0z"/><g transform="translate(12 12) scale(.8125)">${artwork(palette.white, palette.mint)}</g>`);
function wordmark(light) {
  const ink = light ? palette.white : palette.ink;
  return wrap(`<g transform="translate(0 -4) scale(.8)">${artwork(ink, light ? palette.mint : palette.teal)}</g><text x="116" y="45" fill="${ink}" font-family="Arial, sans-serif" font-size="27" font-weight="700" letter-spacing="1">PHARMAIDEIA</text><text x="118" y="68" fill="${light ? palette.mint : palette.teal}" font-family="Arial, sans-serif" font-size="10" font-weight="600" letter-spacing="2.5">NIPSA UNILESA · STUDENT COMPANION</text>`, 370, 100);
}
for (const [name, svg] of Object.entries({ 'symbol.svg': symbol, 'symbol-dark.svg': dark, 'symbol-mono.svg': mono, 'symbol-mono-light.svg': monoLight, 'logo-primary.svg': wordmark(false), 'logo-dark.svg': wordmark(true), 'favicon.svg': appIcon, 'maskable-master.svg': maskable })) await fs.writeFile(path.join(directory, name), svg);
for (const [name, size, svg] of [['icon-192.png', 192, appIcon], ['icon-512.png', 512, appIcon], ['maskable-192.png', 192, maskable], ['maskable-512.png', 512, maskable], ['favicon-32.png', 32, appIcon], ['apple-touch-icon.png', 180, appIcon]]) {
  await sharp(Buffer.from(svg)).resize(Number(size), Number(size)).png().toFile(path.join(directory, String(name)));
}
console.log('Generated editable original SVG identity and 6 raster app/favicon assets.');
