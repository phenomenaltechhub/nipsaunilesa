// Original, review-only vectors. Never reads the supplied JPEG as artwork and
// never writes student-pwa/assets/brand. Brand lettering is also original paths.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
const root = path.resolve('design-review/milestone-3/identity-refinement');
const brand = path.join(root, 'brand'), exports = path.join(root, 'exports');
await fs.mkdir(brand, { recursive: true }); await fs.mkdir(exports, { recursive: true });
const colors = { emerald: '#075443', teal: '#117c79', mint: '#8ee3c2', ink: '#073d32', paper: '#f2f7f4', muted: '#4d6b62' };
const names = ['Molecular Monogram', 'Knowledge Nexus', 'Scientific Insignia'];
const meanings = [
  ['A recognisable P with an interlocking page fold.', 'A four-node bond structure occupies the counter.'],
  ['Angular book wings meet a six-sided knowledge cell.', 'The open spine becomes a branching molecular nexus.'],
  ['An open hexagonal frame anchors an academic insignia.', 'Book leaves and a molecular spine form one emblem.'],
];
const svg = (body, width, height, title = 'PHARMAIDEIA identity exploration — unselected') => `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img"><title>${title}</title>${body}</svg>`;
const rect = (x, y, width, height, fill, r = 0) => `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${r}" fill="${fill}"/>`;
const text = (x, y, content, size = 24, color = colors.ink, weight = 400) => `<text x="${x}" y="${y}" font-family="DejaVu Sans,sans-serif" font-size="${size}" font-weight="${weight}" fill="${color}">${content}</text>`;
// All emblem geometry is authored here on a 240-unit viewBox. Even-odd
// counters are transparent in every colour mode; no background-colour cutouts.
function symbol(index, mode = 'light', micro = false) {
  const main = mode === 'light' ? colors.emerald : mode === 'mono' ? colors.ink : '#fff';
  const accent = mode === 'light' ? colors.teal : mode === 'dark' ? colors.mint : main;
  const path = (d, fill = main) => `<path d="${d}" fill="${fill}" fill-rule="evenodd"/>`;
  const bonds = (d, points, weight = 6) => `<path d="${d}" fill="none" stroke="${accent}" stroke-width="${weight}" stroke-linejoin="round"/>${points.map(([x,y]) => `<circle cx="${x}" cy="${y}" r="${micro ? 7 : 6}" fill="${accent}"/>`).join('')}`;
  if (index === 0) return path('M88 24H152C196 24 224 52 224 96C224 136 196 160 152 160H128V192L88 216ZM128 64V128H152C176 128 188 116 188 96C188 76 176 64 152 64Z')
    + path(micro ? 'M16 56C44 54 68 66 88 84V216C64 198 40 196 16 208Z' : 'M16 56C44 54 68 66 88 84V216C64 198 40 196 16 208ZM32 76V88C48 88 60 94 72 104V188L80 192V96C64 82 48 76 32 76Z', accent)
    + (micro ? bonds('M140 112L174 82', [[140,112],[174,82]], 8) : bonds('M140 86L160 78L176 96L156 114L140 106V86', [[140,86],[160,78],[176,96],[156,114]]));
  if (index === 1) return path('M16 64L72 48L120 80L168 48L224 64V200L168 184L120 216L72 184L16 200ZM40 92V168L72 160L104 182V108L72 88ZM136 108V182L168 160L200 168V92L168 88Z')
    + path('M120 16L156 36V76L120 96L84 76V36ZM104 48V64L120 74L136 64V48L120 38Z', accent)
    + bonds(micro ? 'M120 96V184' : 'M120 96V184M120 156L84 132M120 156L156 132', micro ? [[120,184]] : [[120,184],[84,132],[156,132]], micro ? 10 : 8);
  return `<path d="M40 120V64L120 18L200 64V120" fill="none" stroke="${main}" stroke-width="16" stroke-linejoin="miter"/>`
    + path('M16 128C56 120 92 132 120 160C148 132 184 120 224 128V188C184 180 152 192 120 224C88 192 56 180 16 188ZM36 148V166C68 164 96 174 120 194C144 174 172 164 204 166V148C172 144 144 156 120 180C96 156 68 144 36 148Z')
    + (micro ? bonds('M120 64V144M120 96L88 80M120 96L152 80', [[120,64],[88,80],[152,80]], 9) : bonds('M120 48L148 64V96L120 112L92 96V64ZM120 112V144', [[120,48],[148,96],[92,96]], 8));
}
// Custom geometric lettering, not converted/copied font outlines. Main cap
// height 64; the narrow I receives deliberate side bearings, not a full cell.
const glyphs = {
  P: [44, 'M0 64V0H25C38 0 44 8 44 21C44 34 37 42 24 42H10V64ZM10 10V32H24C31 32 34 28 34 21C34 14 31 10 24 10Z'],
  H: [44, 'M0 0H10V26H34V0H44V64H34V36H10V64H0Z'],
  A: [48, 'M0 64L18 0H30L48 64H37L33 48H15L11 64ZM18 38H30L24 14Z'],
  R: [46, 'M0 64V0H25C38 0 44 8 44 21C44 31 39 38 31 41L46 64H34L20 42H10V64ZM10 10V32H24C31 32 34 28 34 21C34 14 31 10 24 10Z'],
  M: [54, 'M0 64V0H11L27 32L43 0H54V64H44V20L30 47H24L10 20V64Z'],
  I: [10, 'M0 0H10V64H0Z'],
  D: [46, 'M0 0H20C38 0 46 12 46 32C46 52 38 64 20 64H0ZM10 10V54H20C31 54 36 46 36 32C36 18 31 10 20 10Z'],
  E: [40, 'M0 0H40V10H10V26H35V36H10V54H40V64H0Z'],
  N: [46, 'M0 64V0H10L36 44V0H46V64H36L10 20V64Z'],
  S: [44, 'M42 3V14C34 10 29 9 23 9C14 9 10 12 10 18C10 23 15 25 24 28C38 32 44 38 44 47C44 59 36 65 22 65C13 65 6 63 0 60V49C8 54 14 56 22 56C30 56 34 53 34 48C34 43 29 40 20 37C6 33 0 27 0 18C0 6 9 -1 23 -1C30 -1 36 0 42 3Z'],
  U: [44, 'M0 0H10V41C10 51 14 55 22 55C30 55 34 51 34 41V0H44V42C44 58 36 65 22 65C8 65 0 58 0 42Z'],
  L: [38, 'M0 0H10V54H38V64H0Z'],
};
function lettering(value, x, y, width, color, spacing = 7) {
  const count = [...value].reduce((n, char) => n + (char === ' ' ? 24 : glyphs[char][0] + spacing), -spacing);
  let at = 0; let body = '';
  for (const char of value) { if (char === ' ') { at += 24; continue; } const [w, d] = glyphs[char]; body += `<path transform="translate(${at} 0)" d="${d}" fill-rule="evenodd"/>`; at += w + spacing; }
  return `<g transform="translate(${x} ${y}) scale(${width / count})" fill="${color}">${body}</g>`;
}
function mark(index, x, y, size, mode = 'light', micro = false) { return `<g transform="translate(${x} ${y}) scale(${size / 240})">${symbol(index, mode, micro)}</g>`; }
function lockup(index, x, y, width, mode = 'light') {
  const color = mode === 'light' ? colors.ink : mode === 'mono' ? colors.ink : '#fff';
  const minor = mode === 'light' ? colors.teal : mode === 'dark' ? colors.mint : color;
  return `<g transform="translate(${x} ${y}) scale(${width / 740})">${mark(index, 0, 0, 128, mode)}${lettering('PHARMAIDEIA', 156, 14, 576, color)}${lettering('NIPSA UNILESA', 158, 100, 292, minor, 15)}</g>`;
}
function icon(index, x, y, size, mono = false) { return rect(x,y,size,size,colors.emerald,size * .23) + mark(index,x+size*.1,y+size*.1,size*.8,mono ? 'white' : 'dark',size<=32); }
async function vector(name, body, width, height) {
  const data = svg(body,width,height);
  assert.ok(!/<script\b|<foreignObject\b|\son[a-z]+\s*=|(?:href|src)=/i.test(data), 'SVG masters contain only passive original vector content');
  await fs.writeFile(path.join(brand,name+'.svg'),data+'\n');
}
async function png(name, body, width, height) { await sharp(Buffer.from(svg(body,width,height))).png().toFile(path.join(exports,name+'.png')); }
let comparison = rect(0,0,1080,2440,colors.paper) + lettering('PHARMAIDEIA',48,44,640,colors.ink) + text(48,163,'NIPSA UNILESA · IDENTITY EXPLORATION 02',23,colors.teal,600) + text(48,203,'Original vector studies · review only · existing app identity preserved',20,colors.muted);
for (let i=0;i<3;i++) {
  const stem = `0${i+1}-${names[i].toLowerCase().replaceAll(' ','-')}`;
  for (const [suffix,mode] of [['light','light'],['dark','dark'],['mono','mono'],['mono-white','white']]) {
    await vector(stem+'-'+suffix,symbol(i,mode),240,240);
    await vector(stem+'-wordmark-'+suffix,lockup(i,0,0,740,mode),740,148);
  }
  await vector(stem+'-micro',symbol(i,'light',true),240,240);
  await vector(stem+'-app-icon',icon(i,0,0,512),512,512);
  await png(stem+'-app-icon',icon(i,0,0,512),512,512);
  const y=248+i*700;
  comparison += rect(28,y,1024,674,'#fff',24)+text(56,y+50,`0${i+1}  ${names[i]}`,30,colors.ink,700);
  comparison += mark(i,60,y+86,214)+lettering('PHARMAIDEIA',322,y+133,652,colors.ink)+lettering('NIPSA UNILESA',326,y+231,328,colors.teal,15);
  comparison += text(56,y+343,meanings[i][0],21,colors.muted)+text(56,y+376,meanings[i][1],21,colors.muted);
  comparison += rect(56,y+402,450,138,colors.ink,16)+lockup(i,74,y+424,414,'dark')+rect(526,y+402,498,138,colors.paper,16)+mark(i,542,y+418,108,'mono')+mark(i,672,y+418,108,'light')+icon(i,840,y+418,108);
  comparison += text(56,y+581,'Optical small-size variants',18,colors.muted);
  [16,24,32,48,64].forEach((size,k)=>{ const x=376+k*126; comparison += mark(i,x,y+553,size,'light',size<=24)+text(x,y+644,`${size}px`,16,colors.muted); });
  const phone = (x,py,title,body) => text(x+4,py-22,title,24,colors.ink,700)+rect(x,py,466,744,'#152c27',42)+rect(x+10,py+10,446,724,colors.paper,34)+text(x+28,py+44,'9:41',15,colors.ink,600)+rect(x+178,py+20,110,21,'#152c27',11)+body+rect(x+164,py+711,138,5,'#294b40',3);
  let contexts=rect(0,0,1080,2410,colors.paper)+text(42,62,`0${i+1}  ${names[i]}`,36,colors.ink,700)+text(42,103,'Application studies · not live authentication or an applied identity',20,colors.teal);
  let home=rect(68,245,414,566,'#dfede5',22)+text(92,294,'Your academic day',22,colors.ink,600)+rect(92,322,366,117,'#fff',18)+text(115,365,'Make room for learning.',19)+text(115,398,'Keep your next step clear.',17,colors.muted)+icon(i,118,490,106)+text(104,624,'PHARMAIDEIA',16,colors.ink,600);
  [[270,490],[118,670],[270,670]].forEach(([x,py])=>{home+=rect(x,py,76,76,'#c2d7cd',18)+rect(x+19,py+22,38,30,'#8cae9f',7);});
  contexts+=phone(42,178,'Smartphone home screen',home);
  contexts+=phone(572,178,'PWA splash screen',mark(i,715,388,180)+lettering('PHARMAIDEIA',626,616,356,colors.ink)+lettering('NIPSA UNILESA',696,686,214,colors.teal,15)+text(674,831,'A student companion',19,colors.muted));
  contexts+=phone(42,1000,'Student login · branding mockup',lockup(i,86,1090,378)+text(84,1265,'Welcome to your workspace',24,colors.ink,700)+text(84,1312,'Institutional email',18)+rect(84,1331,382,54,'#fff',9)+text(102,1365,'Enter your email',17,colors.muted)+text(84,1432,'Password',18)+rect(84,1450,382,54,'#fff',9)+text(102,1484,'Enter your password',17,colors.muted)+rect(84,1540,382,54,colors.emerald,10)+text(234,1575,'Sign in',18,'#fff',600)+text(116,1658,'Static branding study · no account access',15,colors.muted));
  // Actual running Dashboard, cropped into a generic phone. Proposed logo is
  // overlaid only in this exported review image; app source/assets are untouched.
  const dashboard=await sharp(path.resolve('design-review/milestone-3/exports/pharmaideia-mobile.png')).resize({width:390}).extract({left:0,top:0,width:390,height:760}).png().toBuffer();
  const embedded=`<image x="585" y="1056" width="440" height="666" preserveAspectRatio="xMidYMin slice" href="data:image/png;base64,${dashboard.toString('base64')}"/>`;
  contexts+=phone(572,1000,'Academic dashboard',embedded+rect(585,1056,440,70,'#fff')+lockup(i,609,1070,360));
  contexts+=rect(42,1822,996,458,colors.ink,28)+text(76,1876,'PROMOTIONAL PRESENTATION · CONCEPT ONLY',18,colors.mint,600)+lockup(i,80,1942,884,'dark')+text(82,2160,'A student companion for NIPSA UNILESA.',29,'#fff',600)+text(82,2211,'Academic clarity. Connected knowledge.',23,colors.mint);
  contexts+=text(42,2349,'REVIEW ONLY · No logo selection, deployment or account activation.',21,colors.teal);
  await png(stem+'-application-previews',contexts,1080,2410);
}
comparison+=text(48,2396,'Three directions for owner review. None replaces the active Pharmaideia logo.',21,colors.teal);
await png('refined-three-concept-comparison',comparison,1080,2440);
let icons=rect(0,0,1080,1330,colors.paper)+text(46,64,'App icon and monochrome review',36,colors.ink,700)+text(46,107,'Normal and optical small-size symbols · no selection applied',21,colors.teal);
for(let i=0;i<3;i++){const y=156+i*366;icons+=text(46,y+27,`0${i+1} ${names[i]}`,26,colors.ink,700)+icon(i,48,y+60,224)+icon(i,312,y+60,224,true)+rect(578,y+60,224,224,'#fff',26)+mark(i,588,y+70,204,'mono')+rect(840,y+60,180,224,colors.ink,26)+mark(i,850,y+80,160,'white');}
icons+=text(46,1290,'Flat colour, transparent counters and original path-based lettering.',21,colors.teal);
await png('refined-app-icon-comparison',icons,1080,1330);
let construction=rect(0,0,1080,1430,colors.paper)+text(44,64,'01 Molecular Monogram · construction',35,colors.ink,700)+text(44,111,'240-unit master · P counter + academic page fold + bonded nodes',21,colors.teal);
construction+=rect(42,154,636,636,'#fff',20);
for(let v=0;v<=240;v+=8){construction+=`<path d="M${60+v*2.5} 172V772M60 ${172+v*2.5}H660" stroke="#d8e6df" stroke-width="${v%40===0?1.2:.5}"/>`;}
construction+=mark(0,60,172,600)+text(719,230,'Geometric decisions',24,colors.ink,700)+text(719,286,'Clear P silhouette',20)+text(719,330,'Open book fold',20)+text(719,374,'Transparent counter',20)+text(719,418,'Four-node bond path',20)+text(719,462,'Flat two-colour master',20)+text(719,540,'Optical micro variant:',20,colors.teal,600)+text(719,580,'two nodes, fewer cuts',19)+text(719,618,'for 16px and 24px use',19);
construction+=text(44,866,'Actual-size legibility · optical variant at 16px / 24px',24,colors.ink,600);
[16,24,32,48,64].forEach((size,k)=>{const x=52+k*200;construction+=mark(0,x,903,size,'light',size<=24)+text(x,1010,`${size}px`,20,colors.muted);});
construction+=text(44,1083,'One-colour reduction · same transparent silhouette',24,colors.ink,600)+rect(44,1110,472,206,'#fff',18)+mark(0,60,1116,190,'mono')+rect(548,1110,488,206,colors.ink,18)+mark(0,564,1116,190,'white')+text(44,1383,'Review direction, not final artwork approval. M1/M2 identity is preserved.',21,colors.teal);
await png('molecular-monogram-construction',construction,1080,1430);
await fs.writeFile(path.join(root,'README.md'),`# PHARMAIDEIA identity exploration 02\n\nPrepared 17 November 2026. Three new original Book–Molecule executions respond to the owner's supplied comparison: 01 Molecular Monogram, 02 Knowledge Nexus, 03 Scientific Insignia. The supplied raster is a visual direction only; it is neither embedded nor traced into final assets. No National logo, artwork, code or interface was copied. The previous studies remain in their existing folder and the active M1/M2 app identity is unchanged. **No concept is final or approved for application.**\n\nEach concept has transparent light/dark/one-colour SVG symbols, original path-based PHARMAIDEIA/NIPSA UNILESA lettering, an app-icon SVG/PNG and a simplified optical micro symbol. Colours are flat emerald/teal/mint; molecular paths are abstract symbolism, not a claim to represent a particular drug. The monogram uses a P counter and interlocking page fold. The nexus uses angular book wings and a molecular spine. The insignia uses an open hexagonal frame, book leaves and a bonded centre; it is not an official university seal.\n\nPNG application sheets cover a generic smartphone home screen, splash, static login branding, actual empty-state Dashboard layout and a promotional presentation. Login images are illustrations, not connected authentication. Dashboard imagery is taken from the actual running app and overlaid only within the review image, never applied to source. Generic phone/icons are original unbranded geometry. Actual 16/24/32/48/64px samples are supplied; legibility still needs owner/device review and is not proven by automated dimension checks. The 16/24px optical symbols intentionally remove fine cuts/bonds, retaining the same identity.\n\nRun \`npm run review:m3:identity\` after \`npm run review:m3:design\`. Masters are passive original SVG paths with no external font, raster, script, link or active content dependency. SVG title metadata is accessible; small comparison-sheet annotations use system sans typography only. Never replace the active logo, manifest icons or website identity without the owner's selection and review.\n`);
console.log('Generated three original refined SVG identity families, optical masters, comparison/construction sheets and five-context application PNGs. Existing app identity untouched.');
