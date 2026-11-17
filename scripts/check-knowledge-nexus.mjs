// Asset integrity and actual browser rendering checks, not visual certification.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import sharp from 'sharp';
import { startStaticServer } from './lib/static-server.mjs';
import { nexusOptions, nexusColors } from './lib/knowledge-nexus-artwork.mjs';
const { chromium }=createRequire(import.meta.url)('playwright');
const root=path.resolve('design-review/knowledge-nexus');
const artifact='/workspace/artifacts/pharmaideia-knowledge-nexus';await fs.mkdir(artifact,{recursive:true});
const masters=(await fs.readdir(path.join(root,'masters'))).filter(name=>name.endsWith('.svg')).sort();assert.equal(masters.length,54);
const catalog=JSON.parse(await fs.readFile(path.join(root,'size-catalog.json'),'utf8'));assert.equal(catalog.length,42);
const box=(body,mode)=>`<div class="swatch ${mode==='dark'||mode==='white'?'dark':''}">${body}</div>`;
let html='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; style-src \'self\'; img-src \'self\'; base-uri \'none\'; form-action \'none\'"><title>Knowledge Nexus candidate review</title><link rel="stylesheet" href="review.css"></head><body><main><p class="eyebrow">PHARMAIDEIA · NIPSA UNILESA</p><h1>Knowledge Nexus identity review</h1><p>Three refinements of the approved direction. No final identity is applied. This is a read-only artwork review, not an operational student service.</p><p><a href="exports/knowledge-nexus-numbered-comparison.png">Open numbered comparison</a> · <a href="exports/knowledge-nexus-native-size-comparison.png">Open size comparison</a></p>';
for(const option of nexusOptions) {
 html+=`<section><h2>${option.number} — ${option.name}</h2><p>${option.summary}</p><div class="variants">`;
 for(const mode of ['light','dark','mono','white'])html+=box(`<img class="symbol" src="masters/${option.id}-emblem-${mode}.svg" width="192" height="192" alt="${option.name}, ${mode} emblem">`,mode);
 html+=`</div><p><a href="exports/${option.id}-detail.png">Detailed presentation</a> · <a href="exports/${option.id}-application-previews.png">Six application previews</a> · <a href="masters/${option.id}-horizontal-light.svg">Horizontal SVG</a> · <a href="masters/${option.id}-stacked-light.svg">Stacked SVG</a></p><details open><summary>Actual-size checks: standard and optical</summary>`;
 for(const optical of [false,true]) {
  html+=`<h3>${optical?'Optical':'Standard'} geometry</h3><div class="native">`;
  for(const size of [16,24,32,48,64,192,512])html+=`<figure><img src="exports/sizes/${option.id}-${size}-${optical?'optical':'standard'}.png" width="${size}" height="${size}" alt="${option.name} ${size}px ${optical?'optical':'standard'}"><figcaption>${size}px${size===512?' export; scales to fit on phones':''}</figcaption></figure>`;
  html+='</div>';
 }
 html+='</details></section>';
}
html+='<p>At 16px, cap/book recognition takes priority over individual molecular nodes. Classic and Essential intentionally share optical geometry. Institutional rails remain heavier. Review on a physical phone before approval; automated asset checks do not certify accessibility or recognition.</p></main></body></html>';
await fs.writeFile(path.join(root,'index.html'),html+'\n');
await fs.writeFile(path.join(root,'review.css'),'body{margin:0;background:#f2f7f4;color:#073d32;font:16px/1.65 system-ui,sans-serif}main{max-width:1080px;margin:auto;padding:24px}h1{font-size:clamp(28px,5vw,42px);line-height:1.2}h2{font-size:28px;line-height:1.3}a{color:#075443;text-underline-offset:4px}a:focus-visible,summary:focus-visible{outline:3px solid #117c79;outline-offset:4px}.eyebrow{color:#117c79;font-size:13px;letter-spacing:.12em;font-weight:700}section{margin:32px 0;padding:22px;background:white;border:1px solid #c9ddd4;border-radius:18px}.variants{display:flex;flex-wrap:wrap;gap:12px}.swatch{display:grid;place-items:center;background:#f2f7f4;padding:12px;border-radius:14px}.dark{background:#073d32}.symbol{width:192px;height:192px}.native{display:flex;flex-wrap:wrap;align-items:start;gap:20px}figure{margin:8px 0;max-width:100%}figure img{display:block;max-width:100%;height:auto}figcaption{font-size:13px;color:#4d6b62;max-width:260px;margin-top:8px}summary{cursor:pointer;font-weight:600}details{border-top:1px solid #c9ddd4;padding-top:16px;margin-top:16px}@media(max-width:600px){main{padding:16px}section{padding:14px}.symbol{width:136px;height:136px}.swatch{padding:4px}}\n');
const {server,base}=await startStaticServer(root);
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const report={date:'2026-11-17',xmlAndPassiveChecks:0,chromiumMasterRenders:0,sharpMasterRenders:0,nativePngChecks:0,reviewPngChecks:0,reviewViewports:[],contrast:{},limits:'Automated XML/raster/layout/contrast checks do not establish human recognition, physical-phone legibility or accessibility conformance.'};
try {
 const page=await browser.newPage();
 for(const file of masters) {
  const data=await fs.readFile(path.join(root,'masters',file),'utf8');
  assert.ok(!/<!DOCTYPE|<!ENTITY|<script\b|<foreignObject\b|<image\b|<text\b|\bon[a-z]+\s*=|(?:href|src)=|url\(|@import/i.test(data));
  const parsed=await page.evaluate(value=>{const doc=new DOMParser().parseFromString(value,'image/svg+xml');const svg=doc.documentElement;return {error:doc.querySelector('parsererror')?.textContent??null,namespace:svg.namespaceURI,tags:[...doc.querySelectorAll('*')].map(node=>node.localName),width:Number(svg.getAttribute('width')),height:Number(svg.getAttribute('height'))};},data);
  assert.equal(parsed.error,null);assert.equal(parsed.namespace,'http://www.w3.org/2000/svg');assert.ok(parsed.tags.every(tag=>['svg','title','g','path','rect','circle'].includes(tag)));report.xmlAndPassiveChecks++;
  assert.equal((await page.goto(`${base}/masters/${file}`,{waitUntil:'load'})).status(),200);
  const bounds=await page.evaluate(()=>{const b=document.documentElement.getBBox();return {x:b.x,y:b.y,width:b.width,height:b.height};});
  assert.ok(bounds.width>0&&bounds.height>0&&bounds.x>=-.01&&bounds.y>=-.01&&bounds.x+bounds.width<=parsed.width+.01&&bounds.y+bounds.height<=parsed.height+.01,`Clipped/empty SVG: ${file}`);report.chromiumMasterRenders++;
  const raster=await sharp(Buffer.from(data)).png().toBuffer();const meta=await sharp(raster).metadata();assert.equal(meta.width,parsed.width);assert.equal(meta.height,parsed.height);assert.ok((await sharp(raster).stats()).channels.some(channel=>channel.max>0));report.sharpMasterRenders++;
  if(/-(?:mono|white)\.svg$/.test(file)){const fills=[...data.matchAll(/(?:fill|stroke)="(#[a-f0-9]+)"/gi)].map(match=>match[1]);assert.equal(new Set(fills).size,1,'Monochrome masters use one colour');}
 }
 for(const record of catalog)for(const key of ['file','icon']){const meta=await sharp(path.join(root,'exports',record[key])).metadata();assert.equal(meta.width,record.size);assert.equal(meta.height,record.size);assert.equal(meta.format,'png');await sharp(path.join(root,'exports',record[key])).raw().toBuffer();report.nativePngChecks++;}
 for(const file of (await fs.readdir(path.join(root,'exports'))).filter(name=>name.endsWith('.png'))){const image=sharp(path.join(root,'exports',file));const meta=await image.metadata();const width=file.includes('dashboard-mobile')?390:file.includes('dashboard-desktop')?1440:1080;assert.equal(meta.width,width);assert.equal(meta.format,'png');assert.ok(meta.height>0);await image.raw().toBuffer();report.reviewPngChecks++;}
 assert.equal(report.reviewPngChecks,14);
 for(const viewport of [{width:390,height:844},{width:1440,height:1000}]) {
  const context=await browser.newContext({viewport,deviceScaleFactor:1});const p=await context.newPage();const errors=[],requests=[];
  p.on('pageerror',error=>errors.push(error.message));p.on('request',request=>{if(!request.url().startsWith(base))requests.push(request.url());});
  await p.goto(base,{waitUntil:'networkidle'});assert.equal(await p.getByRole('heading',{name:'Knowledge Nexus identity review',exact:true}).count(),1);
  assert.equal(await p.locator('form,script,input,button').count(),0,'Review is passive, with no application service controls');
  assert.equal(await p.evaluate(()=>[...document.images].every(img=>img.complete&&img.naturalWidth>0)),true);
  assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  const actual=await p.locator('.native img').evaluateAll(images=>images.filter(img=>Number(img.getAttribute('width'))<=64).map(img=>({declared:Number(img.getAttribute('width')),rendered:img.getBoundingClientRect().width})));
  assert.equal(actual.length,30);for(const item of actual)assert.equal(item.declared,item.rendered,'Small samples render at actual CSS pixel dimensions');
  await p.screenshot({path:path.join(artifact,`browser-native-size-review-${viewport.width}.png`),fullPage:true});
  assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);report.reviewViewports.push({viewport,smallSamplesAtNativeCssSize:actual.length,brokenImages:0,runtimeErrors:errors,externalRequests:requests});await context.close();
 }
 const lum=hex=>{const v=hex.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return v[0]*.2126+v[1]*.7152+v[2]*.0722;};
 for(const [fg,bg] of [['emerald','paper'],['teal','paper'],['mint','ink']]){const a=lum(nexusColors[fg]),b=lum(nexusColors[bg]);const ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);assert.ok(ratio>=4.5);report.contrast[`${fg}/${bg}`]=Number(ratio.toFixed(2));}
 const whiteRatio=1.05/(lum(nexusColors.emerald)+.05);assert.ok(whiteRatio>=4.5);report.contrast['white/emerald']=Number(whiteRatio.toFixed(2));
 await fs.writeFile(path.join(root,'validation.json'),JSON.stringify(report,null,2)+'\n');
 const names=[];async function walk(dir){for(const entry of(await fs.readdir(dir,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name))){const file=path.join(dir,entry.name);if(entry.isDirectory())await walk(file);else if(entry.name!=='SHA256SUMS')names.push(file);}}await walk(root);
 await fs.writeFile(path.join(root,'SHA256SUMS'),(await Promise.all(names.map(async file=>`${createHash('sha256').update(await fs.readFile(file)).digest('hex')}  ${path.relative(root,file)}`))).join('\n')+'\n');
 console.log(`PASS Knowledge Nexus: ${report.xmlAndPassiveChecks} valid passive SVGs, ${report.chromiumMasterRenders} Chromium and ${report.sharpMasterRenders} Sharp renders, ${report.nativePngChecks} native and ${report.reviewPngChecks} review PNG checks, mobile/desktop native-size layout, 4 colour pairs. Not an accessibility or visual-recognition certification.`);
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
