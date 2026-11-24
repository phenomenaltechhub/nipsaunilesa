import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
import { configureCapture, go, loadReviewImages } from '../website-tour/browser-tools.mjs';
const { chromium } = createRequire(import.meta.url)('playwright');
const base='http://127.0.0.1:3420', output=resolve(process.argv[2]);
mkdirSync(output,{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const key='nipsa.student-safety.dismissed-version', token='student-safety:2026-11-24.1';
const results=[];
try {
 for (const width of [320,390,768,1440]) {
  const context=await browser.newContext({viewport:{width,height:width>=768?960:844},reducedMotion:width===320?'reduce':'no-preference'});
  await configureCapture(context,base,process.env.TOUR_FONT_DIR);
  const page=await context.newPage(),errors=[],requests=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  page.on('request',r=>requests.push({url:r.url(),method:r.method()}));
  await go(page,base,'/');
  const modal=page.getByRole('dialog',{name:'IMPORTANT STUDENT SAFETY NOTICE'});
  await modal.waitFor({state:'visible'});
  assert.equal(await page.locator('dialog[open]').count(),1);
  assert.equal(await page.locator('#student-safety-heading').evaluate(e=>document.activeElement===e),true);
  assert.equal(await page.evaluate(()=>document.documentElement.style.overflow),'hidden');
  const dimensions=await modal.evaluate(e=>({left:e.getBoundingClientRect().left,right:e.getBoundingClientRect().right,top:e.getBoundingClientRect().top,bottom:e.getBoundingClientRect().bottom,width:e.clientWidth,scroll:e.scrollWidth}));
  assert.ok(dimensions.left>=10&&dimensions.right<=width-10&&dimensions.top>=0&&dimensions.bottom<=(width>=768?960:844));
  assert.equal(dimensions.width,dimensions.scroll);
  await page.screenshot({path:resolve(output,`popup-${width}.png`),animations:'disabled'});
  await page.keyboard.press('Shift+Tab');assert.equal(await page.getByRole('link',{name:'Official Contacts',exact:true}).evaluate(e=>document.activeElement===e),true);
  await page.keyboard.press('Tab');assert.equal(await page.getByRole('button',{name:'Close Student Safety Notice'}).evaluate(e=>document.activeElement===e),true);
  const external=modal.getByRole('link',{name:/University of Ilesa Official Website/});
  assert.equal(await external.getAttribute('href'),'https://unilesa.edu.ng/');
  assert.equal(await external.getAttribute('rel'),'noopener noreferrer');
  await external.scrollIntoViewIfNeeded();await page.screenshot({path:resolve(output,`popup-${width}-bottom.png`)});
  if(process.env.TOUR_AXE_PATH){
   await page.addScriptTag({path:process.env.TOUR_AXE_PATH});
   const a=await page.evaluate(()=>window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}}));
   writeFileSync(resolve(output,`axe-${width}.json`),JSON.stringify(a,null,2));
   assert.deepEqual(a.violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)})),[]);
  }
  await page.getByRole('button',{name:'I Understand',exact:true}).click();
  await modal.waitFor({state:'hidden'});
  assert.equal(await page.evaluate(k=>localStorage.getItem(k),key),token);
  await page.waitForTimeout(100);
  assert.equal(await page.getByRole('button',{name:'Student Safety Notice',exact:true}).evaluate(e=>document.activeElement===e),true);
  assert.notEqual(await page.evaluate(()=>document.documentElement.style.overflow),'hidden');
  await page.reload({waitUntil:'networkidle'});await page.waitForTimeout(850);assert.equal(await page.locator('dialog:visible').count(),0);
  await loadReviewImages(page);
  await page.screenshot({path:resolve(output,`homepage-${width}-dismissed.png`),fullPage:true});
  const entry=page.getByRole('button',{name:'Student Safety Notice',exact:true});await entry.scrollIntoViewIfNeeded();
  await page.screenshot({path:resolve(output,`entry-${width}.png`)});
  await entry.click();await modal.waitFor({state:'visible'});await page.keyboard.press('Escape');await modal.waitFor({state:'hidden'});
  await entry.click();await page.getByRole('button',{name:'Close Student Safety Notice'}).click();await modal.waitFor({state:'hidden'});
  await page.getByRole('button',{name:/^View full-screen image:/}).first().click();
  assert.equal(await page.locator('dialog[open]').count(),1);assert.equal(await modal.isVisible(),false);await page.keyboard.press('Escape');await page.waitForTimeout(200);assert.equal(await page.locator('dialog:visible').count(),0);
  await entry.click();await page.getByRole('link',{name:'Official Contacts',exact:true}).click();await page.waitForURL(base+'/contact');
  assert.notEqual(await page.evaluate(()=>document.documentElement.style.overflow),'hidden');
  await go(page,base,'/website-tour');await page.getByRole('button',{name:'Play the narrated Website Tour',exact:true}).click();
  await page.waitForFunction(()=>{const v=document.querySelector('video');return v.readyState>=2&&!v.paused;});
  await page.locator('video').evaluate(v=>{v.pause();v.currentTime=99;});await page.waitForFunction(()=>!document.querySelector('video').seeking);
  await go(page,base,'/');await page.waitForTimeout(800);assert.equal(await modal.isVisible(),false);
  assert.deepEqual(errors,[]);assert.ok(requests.every(r=>r.method==='GET'||(r.method==='HEAD'&&r.url.startsWith(base+'/'))), JSON.stringify(requests.filter(r=>r.method!=='GET').map(r=>({method:r.method,path:new URL(r.url).origin+new URL(r.url).pathname}))));
  results.push({width,passed:true,requests:requests.length,physicalDevice:false});await context.close();
  console.log('PASS safety notice, keyboard/storage, Gallery and Tour',width);
 }
 // Old persisted version must be eligible again.
 const revised=await browser.newContext();await configureCapture(revised,base,process.env.TOUR_FONT_DIR);
 await revised.addInitScript(({key})=>localStorage.setItem(key,'student-safety:previous'),{key});
 let page=await revised.newPage();await go(page,base,'/');await page.getByRole('dialog',{name:'IMPORTANT STUDENT SAFETY NOTICE'}).waitFor({state:'visible'});await revised.close();
 // Storage denied: memory fallback prevents repeat interruption on client navigation.
 const denied=await browser.newContext();await configureCapture(denied,base,process.env.TOUR_FONT_DIR);
 await denied.addInitScript(()=>{Storage.prototype.getItem=()=>{throw new Error('Storage disabled for test')};Storage.prototype.setItem=()=>{throw new Error('Storage disabled for test')};});
 page=await denied.newPage();await go(page,base,'/');await page.getByRole('dialog',{name:'IMPORTANT STUDENT SAFETY NOTICE'}).waitFor({state:'visible'});
 await page.getByRole('button',{name:'I Understand'}).click();
 await page.getByRole('button',{name:'Menu',exact:true}).click();await page.locator('#site-navigation-overlay').getByRole('link',{name:'Contact',exact:true}).click();
 await page.waitForURL(base+'/contact');await page.getByRole('link',{name:'NIPSA-UNILESA',exact:false}).first().click();await page.waitForURL(base+'/');await page.waitForTimeout(850);
 assert.equal(await page.locator('dialog:visible').count(),0);await page.getByRole('button',{name:'Student Safety Notice',exact:true}).click();await page.getByRole('button',{name:'I Understand'}).click();await denied.close();
 const noJs=await browser.newContext({javaScriptEnabled:false});await configureCapture(noJs,base,process.env.TOUR_FONT_DIR);page=await noJs.newPage();await page.goto(base,{waitUntil:'networkidle'});assert.equal(await page.locator('dialog:visible').count(),0);assert.equal(await page.getByRole('heading',{name:/Learn boldly/}).isVisible(),true);await noJs.close();
 const queue=await browser.newContext();await configureCapture(queue,base,process.env.TOUR_FONT_DIR);await queue.addInitScript(()=>document.addEventListener('DOMContentLoaded',()=>{const d=document.createElement('dialog');d.id='other-dialog-fixture';d.textContent='Isolated modal coordination test';document.body.append(d);d.showModal();}));page=await queue.newPage();await go(page,base,'/');await page.waitForTimeout(850);assert.equal(await page.locator('dialog[open]').count(),1);assert.equal(await page.getByRole('dialog',{name:'IMPORTANT STUDENT SAFETY NOTICE'}).isVisible(),false);await page.locator('#other-dialog-fixture').evaluate(d=>{d.close();d.remove();});await page.getByRole('dialog',{name:'IMPORTANT STUDENT SAFETY NOTICE'}).waitFor({state:'visible'});await queue.close();
 writeFileSync(resolve(output,'results.json'),JSON.stringify({results,oldVersion:true,blockedStorage:true,closedWithoutJavaScript:true,otherDialogCoordination:true},null,2));
} finally {await browser.close();}
