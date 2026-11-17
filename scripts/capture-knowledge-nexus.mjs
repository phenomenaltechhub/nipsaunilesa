// Identity previews modify only disposable copies, never the application source.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import sharp from 'sharp';
import { startStaticServer } from './lib/static-server.mjs';
import { nexusOptions, nexusColors as c, nexusMark as mark, nexusIcon, nexusSvg as svg } from './lib/knowledge-nexus-artwork.mjs';
import { lettering } from './lib/pharmaideia-lettering.mjs';
const { chromium }=createRequire(import.meta.url)('playwright');
const root=path.resolve('design-review/knowledge-nexus'), exports=path.join(root,'exports');
const temporary=await fs.mkdtemp(path.join(os.tmpdir(),'knowledge-nexus-review-'));
async function treeHash(directory) { let records=''; for(const name of (await fs.readdir(directory)).sort()) { const file=path.join(directory,name); records+=name+((await fs.stat(file)).isDirectory()?await treeHash(file):createHash('sha256').update(await fs.readFile(file)).digest('hex')); } return createHash('sha256').update(records).digest('hex'); }
const original=await treeHash(path.resolve('student-pwa'));
for(const option of nexusOptions) {
 const copy=path.join(temporary,option.id);await fs.cp(path.resolve('student-pwa'),copy,{recursive:true});
 await fs.copyFile(path.join(root,'masters',option.id+'-horizontal-light.svg'),path.join(copy,'assets/brand/review-horizontal.svg'));
 const index=path.join(copy,'index.html');let html=await fs.readFile(index,'utf8');
 html=html.replace('<link rel="stylesheet" href="./styles/avatars.css">','<link rel="stylesheet" href="./styles/avatars.css"><link rel="stylesheet" href="./styles/identity-review.css">');
 html=html.replace('<img src="./assets/brand/symbol.svg" width="44" height="44" alt="">\n          <span><strong>PHARMAIDEIA</strong><small>NIPSA UNILESA</small></span>','<img src="./assets/brand/review-horizontal.svg" width="210" height="44" alt="PHARMAIDEIA · NIPSA UNILESA">');
 html=html.replace('<img src="./assets/brand/symbol.svg" width="34" height="34" alt=""><strong>PHARMAIDEIA</strong>','<img src="./assets/brand/review-horizontal.svg" width="220" height="46" alt="PHARMAIDEIA · NIPSA UNILESA">');
 assert.ok(html.includes('review-horizontal.svg'));await fs.writeFile(index,html);
 await fs.writeFile(path.join(copy,'styles/identity-review.css'),'.brand{gap:0}.brand img{width:210px;height:auto;max-width:100%}.mobile-brand img{width:220px;height:auto}\n');
}
const {server,base}=await startStaticServer(temporary);
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const captures=[];
const box=(x,y,w,h,fill='#fff',r=0)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"/>`;
const text=(x,y,value,size=24,fill=c.ink,weight=400)=>`<text x="${x}" y="${y}" font-family="DejaVu Sans,sans-serif" font-size="${size}" fill="${fill}" font-weight="${weight}">${value}</text>`;
function horizontal(id,x,y,width,dark=false) { const main=dark?'#fff':c.ink;return `<g transform="translate(${x} ${y}) scale(${width/760})">${mark(id,0,6,144,dark?'dark':'light')}${lettering('PHARMAIDEIA',176,20,576,main,8)}${lettering('NIPSA UNILESA',179,108,292,dark?c.mint:c.teal,16)}</g>`; }
function icon(id,x,y,size) { return `<g transform="translate(${x} ${y})">${nexusIcon(id,size)}</g>`; }
function image(bytes,x,y,width,height) { return `<image x="${x}" y="${y}" width="${width}" height="${height}" href="data:image/png;base64,${bytes.toString('base64')}"/>`; }
function phone(x,y,title,body) {return text(x+4,y-24,title,23,c.ink,700)+box(x,y,466,880,'#18382e',42)+box(x+10,y+10,446,860,c.paper,32)+text(x+29,y+44,'9:41',15,c.ink,600)+box(x+178,y+20,110,21,'#18382e',11)+body+box(x+164,y+848,138,5,'#294b40',3);}
try {
 for(const option of nexusOptions) {
  const views={};
  for(const viewport of [{width:390,height:844},{width:1440,height:1000}]) {
   const context=await browser.newContext({viewport,reducedMotion:'reduce'});const page=await context.newPage();const errors=[],external=[];
   page.on('pageerror',error=>errors.push(error.message));page.on('request',request=>{if(!request.url().startsWith(base))external.push(request.url());});
   assert.equal((await page.goto(`${base}/${option.id}/`,{waitUntil:'networkidle'})).status(),200);
   await page.getByRole('heading',{name:'Dashboard',exact:true}).waitFor();
   assert.equal(await page.getByRole('heading',{name:'No courses available',exact:true}).count(),1);
   assert.equal(await page.locator('input[type=email],input[type=password]').count(),0,'Preview is the actual inactive-account academic shell');
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
   const screenshot=await page.screenshot({fullPage:true,animations:'disabled'});views[viewport.width]=screenshot;
   const metadata=await sharp(screenshot).metadata();const header=svg(box(0,0,viewport.width,66,'#fff')+text(16,26,`Knowledge Nexus ${option.name} · branding preview`,viewport.width<600?15:19,c.ink,600)+text(16,50,'Candidate applied to disposable copy only · current PWA unchanged',viewport.width<600?11:15,c.teal),viewport.width,66);
   const file=option.id+`-dashboard-${viewport.width===390?'mobile':'desktop'}-review.png`;
   await sharp({create:{width:viewport.width,height:metadata.height+66,channels:4,background:'#fff'}}).composite([{input:Buffer.from(header),left:0,top:0},{input:screenshot,left:0,top:66}]).png().toFile(path.join(exports,file));
   await page.evaluate(()=>{location.hash='/planner';});await page.getByRole('heading',{name:'Study planner',exact:true}).waitFor();
   if(viewport.width<760)await page.getByRole('button',{name:'Focus session',exact:true}).click();
   await page.getByRole('button',{name:'Start session',exact:true}).click();await page.getByRole('button',{name:'Pause session',exact:true}).click();
   assert.deepEqual(errors,[]);assert.deepEqual(external,[]);captures.push({option:option.id,viewport,errors,external,file});await context.close();
  }
  const mobile=await sharp(views[390]).extract({left:0,top:0,width:390,height:680}).resize(440,767).png().toBuffer();
  const desktop=await sharp(views[1440]).extract({left:0,top:0,width:1440,height:350}).resize(996,242).png().toBuffer();
  let body=box(0,0,1080,3160,c.paper)+text(42,66,`${option.number} Knowledge Nexus — ${option.name}`,35,c.ink,700)+text(42,111,'Identity application studies · candidates for review only',22,c.teal);
  const home=box(68,250,414,646,'#dfede5',22)+text(92,302,'Your academic workspace',22,c.ink,600)+box(92,332,366,120,'#fff',18)+text(112,378,'Make room for learning.',19)+text(112,415,'Keep your next step clear.',17,c.muted)+icon(option.id,117,512,110)+text(101,656,'PHARMAIDEIA',16,c.ink,600)+box(286,512,86,86,'#b9d2c5',19)+box(117,730,86,86,'#b9d2c5',19)+box(286,730,86,86,'#b9d2c5',19);
  body+=phone(42,178,'Smartphone home-screen icon',home);
  body+=phone(572,178,'PWA splash screen',mark(option.id,714,401,184)+lettering('PHARMAIDEIA',624,645,358,c.ink,8)+lettering('NIPSA UNILESA',699,718,210,c.teal,16)+text(677,913,'A student companion',19,c.muted));
  body+=phone(42,1140,'Student login · static branding',horizontal(option.id,84,1254,378)+text(82,1452,'Welcome to your workspace',24,c.ink,700)+text(82,1504,'Institutional email',18)+box(82,1524,382,56,'#fff',9)+text(102,1560,'Enter your email',17,c.muted)+text(82,1636,'Password',18)+box(82,1656,382,56,'#fff',9)+text(102,1692,'Enter your password',17,c.muted)+box(82,1760,382,56,c.emerald,10)+text(230,1796,'Sign in',18,'#fff',600)+text(108,1910,'Branding mockup · no account access',16,c.muted));
  body+=phone(572,1140,'Dashboard · actual layout study',image(mobile,585,1196,440,767));
  body+=text(42,2090,'Desktop application header · actual layout study',28,c.ink,700)+box(42,2122,996,266,'#fff',18)+image(desktop,42,2134,996,242);
  body+=box(42,2460,996,516,c.ink,28)+text(76,2517,'PROMOTIONAL PRESENTATION · IDENTITY CANDIDATE',18,c.mint,600)+horizontal(option.id,80,2592,884,true)+text(82,2808,'A student companion for NIPSA UNILESA.',29,'#fff',600)+text(82,2860,'Knowledge. Science. Academic advancement.',23,c.mint)+text(82,2922,'Review artwork · not an announcement of a live service.',18,c.mint);
  body+=text(42,3080,'REVIEW ONLY · No active logo, icon, account or hosting change.',21,c.teal,600);
  await sharp(Buffer.from(svg(body,1080,3160))).png().toFile(path.join(exports,option.id+'-application-previews.png'));
 }
 assert.equal(await treeHash(path.resolve('student-pwa')),original,'Every student PWA source and active asset remains unchanged');
 await fs.writeFile(path.join(root,'preview-validation.json'),JSON.stringify({date:'2026-11-17',method:'Chromium; modified disposable copies only',studentPwaUnchanged:true,captures},null,2)+'\n');
 console.log('Captured six disposable-copy Dashboard views, exercised focus controls, and generated three six-context PNG sheets. Original PWA tree hash unchanged.');
}finally {await browser.close();await new Promise(resolve=>server.close(resolve));await fs.rm(temporary,{recursive:true,force:true});}
