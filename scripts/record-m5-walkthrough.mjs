import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import sharp from 'sharp';
import {startStaticServer} from './lib/static-server.mjs';
const require=createRequire(import.meta.url);
const metadata=JSON.parse(await fs.readFile(path.join(path.dirname(require.resolve('playwright-core/package.json')),'browsers.json'),'utf8'));
const revision=metadata.browsers.find(item=>item.name==='ffmpeg').revision;
const tools=await fs.mkdtemp(path.join(os.tmpdir(),'pharmaideia-m5-encoder-'));
await fs.mkdir(path.join(tools,`ffmpeg-${revision}`));await fs.symlink('/usr/bin/ffmpeg',path.join(tools,`ffmpeg-${revision}`,'ffmpeg-linux'));
process.env.PLAYWRIGHT_BROWSERS_PATH=tools;
const {chromium}=require('playwright');
const directory='/workspace/artifacts/pharmaideia-m5';await fs.mkdir(directory,{recursive:true});await fs.mkdir('student-pwa/media',{recursive:true});
const {server,base}=await startStaticServer(path.resolve('student-pwa'));
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
let context;
try{
 context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce',recordVideo:{dir:path.join(directory,'recording'),size:{width:390,height:844}}});
 const page=await context.newPage(),video=page.video(),steps=[];const started=performance.now();
 async function show(text,action,seconds=4){await action();steps.push({start:(performance.now()-started)/1000,text});await page.waitForTimeout(seconds*1000);}
 await show('Welcome to Pharmaideia. The approved identity and compact Home bring your academic tools together.',async()=>{await page.goto(base,{waitUntil:'networkidle'});await page.getByRole('heading',{name:'Dashboard',exact:true}).waitFor();});
 await page.screenshot({path:path.join(directory,'390-dashboard-viewport.png')});
 await sharp(await page.screenshot()).resize({width:390}).webp({quality:70}).toFile('student-pwa/media/walkthrough-poster.webp');
 await show('Courses stay empty until reviewed institutional content is supplied. No sample academic records are presented.',async()=>{await page.locator('#mobile-nav [data-route=courses]').click();});
 await show('Planner works now. Add a personal study task. These reminders stay in this tab and clear on reload.',async()=>{await page.locator('#mobile-nav [data-route=planner]').click();await page.getByLabel('Study task',{exact:true}).fill('Review my approved notes');await page.getByRole('button',{name:'Add study task',exact:true}).click();});
 await show('Start or pause a focus session. Leaving Planner resets the timer.',async()=>{await page.getByRole('button',{name:'Focus session',exact:true}).click();await page.getByRole('button',{name:'Start session',exact:true}).click();});
 await page.getByRole('button',{name:'Pause session',exact:true}).click();
 await show('Personal progress is separate from official academic records. Create your own non-confidential outline and topic.',async()=>{await page.evaluate(()=>location.hash='/progress');await page.getByLabel('Outline name',{exact:true}).fill('My personal revision outline');await page.getByRole('button',{name:'Create outline',exact:true}).click();await page.getByLabel('Topic name',{exact:true}).fill('Review my approved notes');await page.getByRole('button',{name:'Add topic',exact:true}).click();},5);
 await show('Mark a topic covered and record your confidence. Coverage does not demonstrate mastery.',async()=>{await page.getByRole('checkbox',{name:'Covered: Review my approved notes',exact:true}).check();await page.getByLabel('Understanding: Review my approved notes',{exact:true}).selectOption('developing');await page.locator('.progress-workspace').scrollIntoViewIfNeeded();},5);
 await show('Announcements support search and reading filters. There are no live notices in this development view.',async()=>{await page.evaluate(()=>location.hash='/notifications');await page.getByLabel('Search announcements').fill('');});
 await show('Community remains discoverable while messaging is restricted. Secure messaging must be completed before public launch.',async()=>{await page.locator('#mobile-nav [data-route=community]').click();});
 await show('Find Timetable, Settings and Help through More. Appearance controls work locally without collecting account information.',async()=>{await page.getByRole('button',{name:'More',exact:true}).click();await page.getByRole('dialog').getByRole('link',{name:'Settings',exact:true}).click();await page.getByText('Appearance',{exact:true}).click();});
 await show('Help is searchable and includes this optional captioned video and a written transcript. Account services are not publicly activated.',async()=>{await page.evaluate(()=>location.hash='/help');await page.getByLabel('Search help').fill('security');});
 const end=(performance.now()-started)/1000;await context.close();context=null;
 const raw=await video.path(),destination=path.resolve('student-pwa/media/study-tools.mp4');
 execFileSync('/usr/bin/ffmpeg',['-hide_banner','-loglevel','error','-y','-i',raw,'-an','-vf','fps=12','-c:v','libx264','-preset','slow','-crf','25','-pix_fmt','yuv420p','-movflags','+faststart',destination]);
 await fs.copyFile(destination,path.join(directory,'study-tools-walkthrough.mp4'));
 const stamp=s=>{const ms=Math.round(s*1000);return `${String(Math.floor(ms/3600000)).padStart(2,'0')}:${String(Math.floor(ms/60000)%60).padStart(2,'0')}:${String(Math.floor(ms/1000)%60).padStart(2,'0')}.${String(ms%1000).padStart(3,'0')}`;};
 const captions='WEBVTT\n\n'+steps.map((s,i)=>`${i+1}\n${stamp(s.start)} --> ${stamp(steps[i+1]?.start??end)}\n${s.text}\n`).join('\n');
 const transcript='PHARMAIDEIA — M5 study-tools introduction\n\nSilent recording of the actual development application. Captions describe all demonstrated actions. Personal example reminders are not institutional academic data.\n\n'+steps.map(s=>s.text).join('\n\n')+'\n\nThis introduction must be updated to cover all completed services before first public launch.\n';
 for(const [name,content]of [['study-tools.en.vtt',captions],['study-tools-transcript.txt',transcript]]){await fs.writeFile(path.join('student-pwa/media',name),content);await fs.writeFile(path.join(directory,name),content);}
 await fs.writeFile(path.join(directory,'walkthrough-timing.json'),JSON.stringify({durationSeconds:end,steps,bytes:(await fs.stat(destination)).size},null,2)+'\n');
 console.log('Recorded real study-tool interactions; encoded captioned optional MP4, poster and transcript.');
}finally{await context?.close();await browser.close();await new Promise(resolve=>server.close(resolve));await fs.rm(tools,{recursive:true,force:true});delete process.env.PLAYWRIGHT_BROWSERS_PATH;}
