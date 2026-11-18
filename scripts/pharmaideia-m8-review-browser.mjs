import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
import {randomUUID} from 'node:crypto';
import {communityEnvironment} from '../backend/testing/community-fixtures.mjs';
const require=createRequire(import.meta.url),{chromium}=require('playwright');
const dir='/workspace/artifacts/pharmaideia-m8-review';await fs.mkdir(dir+'/screenshots',{recursive:true});
const e=await communityEnvironment({history:3}),browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']}),geometry=[];
try{
 const long='Synthetic long-message review fixture.\n'+('A safe synthetic line, not academic content.\n'.repeat(50));
 const received=await e.peer.c.request('/api/v1/community/messages','POST',{requestId:randomUUID(),body:long.slice(0,2000),replyTo:null,mentions:[]});assert.equal(received.status,200);
 const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,reducedMotion:'reduce'});
 await context.addCookies([{name:'pharmaideia_session',value:e.student.c.cookie.split('=')[1],url:e.origin,httpOnly:true,sameSite:'Strict'}]);
 const page=await context.newPage();page.setDefaultTimeout(15000);const errors=[];page.on('pageerror',error=>errors.push(error.message));await page.goto(e.origin+'/#/community',{waitUntil:'networkidle'});await page.getByLabel('Your message',{exact:true}).waitFor();
 const row=page.locator('[data-message-id="'+received.data.id+'"]');await row.scrollIntoViewIfNeeded();
 const observed=await row.evaluate(el=>{const t=document.querySelector('.chat-timeline'),r=el.getBoundingClientRect(),b=t.getBoundingClientRect();return {messageHeight:r.height,timelineHeight:b.height,visibleHeight:Math.max(0,Math.min(r.bottom,b.bottom)-Math.max(r.top,b.top))};});
 assert.ok(observed.messageHeight>observed.timelineHeight,'Actual long bubble exceeds the phone timeline');
 await page.waitForTimeout(1000);
 assert.ok(e.service.db.prepare('SELECT 1 FROM community_reads WHERE message_id=? AND account_id=?').get(received.data.id,e.student.user.id),'An oversized message visible across most of the timeline receives an actual acknowledgement');
 const draft=page.getByLabel('Your message',{exact:true}),own=('Synthetic 2000-character layout fixture. '+('word '.repeat(400))).slice(0,2000);assert.equal(Array.from(own).length,2000);await draft.fill(own);await page.getByRole('button',{name:'Send message',exact:true}).click();await page.getByText('Message saved.',{exact:true}).waitFor();assert.equal(await page.locator('.chat-own').last().locator('.chat-text').textContent(),own);
 for(const size of[{width:390,height:844},{width:390,height:540},{width:568,height:320}]){
  await page.setViewportSize(size);await draft.fill('Synthetic keyboard line one');await draft.focus();const before=e.service.db.prepare('SELECT count(*) AS n FROM community_messages').get().n;await page.keyboard.press('Enter');await page.keyboard.type('Line two');assert.equal(e.service.db.prepare('SELECT count(*) AS n FROM community_messages').get().n,before,'Enter does not send');
  const state=await page.evaluate(()=>{const t=document.querySelector('.chat-timeline'),dock=document.querySelector('.chat-dock').getBoundingClientRect(),nav=document.getElementById('mobile-nav'),limit=getComputedStyle(nav).display==='none'?innerHeight:nav.getBoundingClientRect().top;return {width:innerWidth,height:innerHeight,timelineHeight:t.clientHeight,composerBottom:dock.bottom,bottomLimit:limit,overflow:document.documentElement.scrollWidth>innerWidth};});assert.equal(state.overflow,false);assert.ok(state.composerBottom<=state.bottomLimit+2);assert.ok(state.timelineHeight>30);geometry.push(state);await page.screenshot({path:dir+'/screenshots/'+size.width+'x'+size.height+'-long-message.png',animations:'disabled'});
 }
 assert.deepEqual(errors,[]);await context.close();await fs.writeFile(dir+'/mobile-emulation.json',JSON.stringify({scope:'Chromium touch/viewport emulation only; no physical Android, actual IME or installed-PWA certification',longMessage:observed,geometry},null,2));console.log('PASS actual 2000-character send/oversized-message acknowledgement, touch viewport/landscape composer geometry and Enter behavior; physical devices remain untested.');
}finally{await browser.close();await e.cleanup();}
