// Review-only generator. No production/app sources or selected assets are written.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { nexusOptions, nexusColors as c, nexusSymbol, nexusMark as mark, nexusIcon, nexusSvg as svg } from './lib/knowledge-nexus-artwork.mjs';
import { lettering } from './lib/pharmaideia-lettering.mjs';
const root = path.resolve('design-review/knowledge-nexus');
const masters = path.join(root,'masters'), exports = path.join(root,'exports'), sizes = path.join(exports,'sizes');
for (const dir of [masters,exports,sizes]) await fs.mkdir(dir,{recursive:true});
const box = (x,y,w,h,fill='#fff',r=0) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"/>`;
const text = (x,y,value,size=24,fill=c.ink,weight=400) => `<text x="${x}" y="${y}" font-family="DejaVu Sans,sans-serif" font-size="${size}" fill="${fill}" font-weight="${weight}">${value}</text>`;
function lockup(id,x,y,width,mode='light') {
  const main = ['light','mono'].includes(mode) ? c.ink : '#fff';
  const minor = mode==='light' ? c.teal : mode==='dark' ? c.mint : main;
  return `<g transform="translate(${x} ${y}) scale(${width/760})">${mark(id,0,6,144,mode)}${lettering('PHARMAIDEIA',176,20,576,main,8)}${lettering('NIPSA UNILESA',179,108,292,minor,16)}</g>`;
}
function stacked(id,mode='light') {
  const main = ['light','mono'].includes(mode) ? c.ink : '#fff';
  const minor = mode==='light' ? c.teal : mode==='dark' ? c.mint : main;
  return mark(id,180,12,280,mode)+lettering('PHARMAIDEIA',40,334,560,main,8)+lettering('NIPSA UNILESA',164,432,312,minor,16);
}
function icon(id,x,y,size,optical=size<=24) { return `<g transform="translate(${x} ${y})">${nexusIcon(id,size,optical)}</g>`; }
async function master(name,body,w,h) {
  const value=svg(body,w,h,`PHARMAIDEIA ${name} — Knowledge Nexus candidate`);
  assert.ok(!/<script\b|<foreignObject\b|<image\b|<text\b|\bon[a-z]+\s*=|(?:href|src)=|url\(|@import|<!DOCTYPE/i.test(value),'Masters must be passive paths without fonts or rasters');
  await fs.writeFile(path.join(masters,name+'.svg'),value+'\n');
}
async function png(name,body,w,h) { await sharp(Buffer.from(svg(body,w,h))).png().toFile(path.join(exports,name+'.png')); }
let comparison=box(0,0,1080,2740,c.paper)+lettering('PHARMAIDEIA',44,42,704,c.ink,8)+text(46,170,'KNOWLEDGE NEXUS · ONE FAMILY, THREE REFINEMENTS',22,c.teal,600)+text(46,211,'Book + molecular spine + graduation cap · original editable vectors',21,c.muted);
const catalog = [];
for (const [i,option] of nexusOptions.entries()) {
  const id=option.id; const y=250+i*790;
  for(const mode of ['light','dark','mono','white']) {
    await master(`${id}-emblem-${mode}`,nexusSymbol(id,mode),240,240);
    await master(`${id}-optical-${mode}`,nexusSymbol(id,mode,true),240,240);
    await master(`${id}-horizontal-${mode}`,lockup(id,0,0,760,mode),760,156);
    await master(`${id}-stacked-${mode}`,stacked(id,mode),640,494);
  }
  await master(`${id}-app-icon`,nexusIcon(id,512,false),512,512);
  await master(`${id}-app-icon-optical`,nexusIcon(id,512,true),512,512);
  for(const size of [16,24,32,48,64,192,512]) {
    for(const optical of [false,true]) {
      const suffix=optical?'optical':'standard';
      const file=`${id}-${size}-${suffix}.png`;
      await sharp(Buffer.from(svg(nexusSymbol(id,'light',optical),240,240))).resize(size,size).png().toFile(path.join(sizes,file));
      await sharp(Buffer.from(svg(nexusIcon(id,size,optical),size,size))).png().toFile(path.join(sizes,`${id}-icon-${size}-${suffix}.png`));
      catalog.push({option:id,size,optical,file:`sizes/${file}`,icon:`sizes/${id}-icon-${size}-${suffix}.png`});
    }
  }
  comparison+=box(26,y,1028,758,'#fff',24)+text(54,y+49,`${option.number}  Knowledge Nexus — ${option.name}`,30,c.ink,700);
  comparison+=mark(id,48,y+80,242)+lettering('PHARMAIDEIA',326,y+132,650,c.ink,8)+lettering('NIPSA UNILESA',330,y+236,338,c.teal,16);
  comparison+=text(54,y+373,option.summary,20,c.muted);
  comparison+=box(54,y+403,510,150,c.ink,16)+lockup(id,68,y+420,478,'dark')+box(586,y+403,440,150,c.paper,16)+mark(id,596,y+415,126,'mono')+icon(id,738,y+416,126)+mark(id,888,y+432,96,'light');
  comparison+=text(54,y+600,'ACTUAL PIXELS · optical 16/24px, standard 32px+',18,c.teal,600);
  [16,24,32,48,64].forEach((size,k)=>{const x=78+k*193;comparison+=mark(id,x,y+630,size,'light',size<=24)+text(x,y+726,`${size}px`,17,c.muted);});
  // Smartphone-friendly detail sheets include construction, light/dark/mono,
  // actual pixel sizes, and 192/512 exports in their native sizes.
  let detail=box(0,0,1080,2360,c.paper)+text(42,68,`${option.number} Knowledge Nexus — ${option.name}`,36,c.ink,700)+text(42,115,'Original vector candidate · not applied to the PWA',22,c.teal)+box(32,150,1016,580,'#fff',24)+mark(id,358,165,364)+lettering('PHARMAIDEIA',168,546,744,c.ink,8)+lettering('NIPSA UNILESA',330,654,420,c.teal,16);
  detail+=box(32,748,600,202,c.ink,18)+lockup(id,48,783,564,'dark')+box(652,748,396,202,'#fff',18)+mark(id,672,766,164,'mono')+mark(id,860,784,128,'light',true);
  detail+=text(42,1009,'Actual-size samples · no enlargement',25,c.ink,600);
  [16,24,32,48,64].forEach((size,k)=>{const x=52+k*200;detail+=mark(id,x,1040,size,'light',size<=24)+text(x,1140,`${size}px`,18,c.muted);});
  detail+=text(42,1210,'192px app icon',24,c.ink,600)+icon(id,42,1244,192,false)+text(354,1210,'512px app icon',24,c.ink,600)+icon(id,354,1244,512,false);
  const notes = option.id==='a-classic' ? ['Keeps the layered, flowing pages of the approved direction.', 'Cap band and hexagonal bond share the same central vertex.', 'Fine page gaps and the tassel need the optical variant at 16/24px.'] : option.id==='b-institutional' ? ['Cap corners continue into the outer book-cover rails.', 'The lower book fold supplies the insignia base; no extra crest.', 'The stronger side rails cost space at 16px; review alongside Essential.'] : ['One flowing inner leaf replaces multiple narrow page bands.', 'Tassel omitted; wider bonds and openings retain the family structure.', 'At 16px, book and cap lead; individual molecular nodes are secondary.'];
  detail+=text(42,1835,'Construction and trade-offs',28,c.ink,700);
  notes.forEach((line,k)=>{detail+=text(42,1892+k*48,line,21,c.muted);});
  detail+=text(42,2095,'One-colour artwork uses genuine transparent apertures.',21,c.teal)+text(42,2141,'Molecular geometry is symbolic, not a particular drug structure.',21,c.muted)+text(42,2240,'CANDIDATE ONLY · final selection and active-asset approval are pending.',21,c.teal,600);
  await png(`${id}-detail`,detail,1080,2360);
}
comparison+=text(44,2695,'REVIEW ONLY · Choose a refinement before any active logo or icon replacement.',21,c.teal);
await png('knowledge-nexus-numbered-comparison',comparison,1080,2740);
let sizesSheet=box(0,0,1080,1570,c.paper)+text(42,65,'Small-size review · actual pixels first',36,c.ink,700)+text(42,110,'Standard vs optical · 16 / 24 / 32 / 48 / 64px',23,c.teal);
for(const [i,option] of nexusOptions.entries()) {
 const y=160+i*430;sizesSheet+=box(28,y,1024,398,'#fff',20)+text(48,y+45,`${option.number} ${option.name}`,28,c.ink,700)+text(48,y+110,'Standard',19,c.muted)+text(48,y+230,'Optical',19,c.muted);
 [16,24,32,48,64].forEach((size,k)=>{const x=270+k*145;sizesSheet+=mark(option.id,x,y+75,size)+mark(option.id,x,y+195,size,'light',true)+text(x,y+319,`${size}px`,17,c.muted);});
 sizesSheet+=text(48,y+366,'Optical variants remove the tassel and extra leaf bands; they do not add content.',17,c.teal);
}
sizesSheet+=text(42,1518,'Inspect native PNGs on your device. Enlarged art alone cannot prove legibility.',21,c.teal);
await png('knowledge-nexus-native-size-comparison',sizesSheet,1080,1570);
await fs.writeFile(path.join(root,'size-catalog.json'),JSON.stringify(catalog,null,2)+'\n');
console.log('Generated Knowledge Nexus Classic, Institutional and Essential: 54 passive SVG masters, 84 exact-size PNGs and 5 review sheets. Active app assets untouched.');
