import test from'node:test';import assert from'node:assert/strict';import{randomUUID}from'node:crypto';
import{operationEnvironment,publishedCourse}from'../testing/operations-fixtures.mjs';import{startBackend}from'../src/http.mjs';import{client}from'../testing/client.mjs';
async function setup(){const e=await operationEnvironment(),rep=await e.member('representative'),reviewer=await e.member('reviewer'),student=await e.member(),peer=await e.member(),other=await e.member('student',100),course=await publishedCourse(e,rep,reviewer);return {e,rep,reviewer,student,peer,other,course};}
const resource=(course,kind='flashcard')=>({kind,courseId:course?.id??null,title:'Synthetic study aid — not academic content',sourceUrl:'https://example.invalid/reviewed-synthetic-content',licence:'Synthetic fixture; not instructional content',...(kind==='flashcard'?{front:'Synthetic fixture prompt',back:'Synthetic fixture answer'}:kind==='practice'?{question:'Choose the first synthetic option',options:['First synthetic choice','Second synthetic choice'],correctIndex:0,explanation:'Synthetic comparison only.'}:{definition:'Synthetic glossary definition for isolated validation only.',mechanism:'',applications:'',category:'Synthetic validation',relatedIds:[]})});
async function publish(author,reviewer,input){let r=await author.c.request('/api/v1/study/manage','POST',input);assert.equal(r.status,200);const id=r.data.id;r=await author.c.request('/api/v1/study/manage/'+id,'PATCH',{revision:r.data.revision,action:'submit'});assert.equal(r.status,200);r=await reviewer.c.request('/api/v1/study/manage/'+id,'PATCH',{revision:r.data.revision,action:'publish'});assert.equal(r.status,200);return r.data;}
const day=86400000;
test('M9 authenticated calendar: level/selected-course scope, conflicting dates, correction, withdrawal and safe private ICS',async()=>{const{e,rep,reviewer,student,other,course}=await setup();try{
 const entry={courseId:course.id,kind:'class',title:'Synthetic class, not an institutional timetable',description:'Plain text\nBEGIN:VEVENT is escaped',startsAt:new Date(e.now()+day).toISOString(),endsAt:new Date(e.now()+day+3600000).toISOString(),sourceUrl:course.sourceUrl};
 assert.equal((await student.c.request('/api/v1/academic/calendar','POST',entry)).status,403);assert.equal((await reviewer.c.request('/api/v1/academic/calendar','POST',entry)).status,403);
 assert.equal((await other.c.request('/api/v1/academic/calendar','POST',entry)).status,403);
 let created=await rep.c.request('/api/v1/academic/calendar','POST',entry);assert.equal(created.status,200);
 assert.equal((await rep.c.request('/api/v1/academic/calendar','POST',entry)).data.error.code,'TIMETABLE_CONFLICT');
 assert.equal((await rep.c.request('/api/v1/academic/calendar','POST',{...entry,endsAt:entry.startsAt})).status,400);
 assert.equal((await other.c.request('/api/v1/academic/calendar')).data.entries.length,0);
 const calendar=await student.c.request('/api/v1/academic/calendar');assert.equal(calendar.data.entries[0].id,created.data.id);assert.match(calendar.headers.get('cache-control'),/no-store/);
 const exported=await student.c.request('/api/v1/academic/calendar/export');assert.equal(exported.status,200);assert.ok(exported.data.content.split('\r\n').every(line=>Buffer.byteLength(line)<=75));assert.equal(exported.data.content.split('\r\nBEGIN:VEVENT').length,2);assert.ok(exported.data.content.includes('Plain text\\nBEGIN:VEVENT'));assert.ok(!exported.data.content.includes(student.user.id));
 const corrected=await rep.c.request('/api/v1/academic/calendar/'+created.data.id,'PUT',{...entry,revision:created.data.revision,title:'Synthetic correction'});assert.equal(corrected.status,200);
 assert.equal((await rep.c.request('/api/v1/academic/calendar/'+created.data.id,'PUT',{...entry,revision:created.data.revision})).status,409);
 assert.equal((await rep.c.request('/api/v1/academic/calendar/'+created.data.id,'DELETE',{revision:corrected.data.revision})).status,200);
 assert.equal((await student.c.request('/api/v1/academic/calendar')).data.entries.length,0);
 }finally{await e.cleanup();}});
test('M9 reviewed study aids: independent review, question secrecy, scoped practice marking, own bookmarks and withdrawal',async()=>{const{e,rep,reviewer,student,peer,other,course}=await setup();try{
 assert.equal((await student.c.request('/api/v1/study/manage','POST',resource(course))).status,403);
 let draft=await rep.c.request('/api/v1/study/manage','POST',resource(course));const id=draft.data.id;draft=await rep.c.request('/api/v1/study/manage/'+id,'PATCH',{revision:draft.data.revision,action:'submit'});
 assert.equal((await rep.c.request('/api/v1/study/manage/'+id,'PATCH',{revision:draft.data.revision,action:'publish'})).status,403);
 const published=await reviewer.c.request('/api/v1/study/manage/'+id,'PATCH',{revision:draft.data.revision,action:'publish'});assert.equal(published.status,200);
 assert.equal((await other.c.request('/api/v1/study/content?courseId='+course.id)).status,404);
 assert.equal((await student.c.request('/api/v1/study/content/'+id+'/bookmark','PUT',{saved:true})).status,200);
 assert.equal((await student.c.request('/api/v1/study/content/'+id+'/visit','POST',{})).status,200);
 assert.deepEqual((await peer.c.request('/api/v1/study/personal')).data.bookmarks,[]);
 assert.deepEqual((await student.c.request('/api/v1/study/personal')).data.bookmarks,[id]);
 const practice=await publish(rep,reviewer,resource(course,'practice'));const feed=await student.c.request('/api/v1/study/content');const question=feed.data.items.find(x=>x.id===practice.id);assert.equal(question.correctIndex,undefined);assert.equal(question.explanation,undefined);
 const attempt={requestId:randomUUID(),revision:question.revision,answer:0};let r=await student.c.request('/api/v1/study/content/'+practice.id+'/practice','POST',attempt);assert.equal(r.status,200);assert.equal(r.data.correct,true);
 assert.equal((await student.c.request('/api/v1/study/content/'+practice.id+'/practice','POST',attempt)).status,200);
 assert.equal((await student.c.request('/api/v1/study/content/'+practice.id+'/practice','POST',{...attempt,answer:1})).status,409);
 assert.equal((await other.c.request('/api/v1/study/content/'+practice.id+'/practice','POST',attempt)).status,404);
 await reviewer.c.request('/api/v1/study/manage/'+id,'PATCH',{revision:published.data.revision,action:'withdraw'});
 assert.deepEqual((await student.c.request('/api/v1/study/personal')).data.bookmarks,[]);
 assert.equal((await student.c.request('/api/v1/study/content/'+id+'/visit','POST',{})).status,404);
 }finally{await e.cleanup();}});
test('M9 glossary: reviewed global content, search and stable UTC daily selection; withdrawal does not silently substitute a term',async()=>{const e=await operationEnvironment();try{const author=await e.member('administrator'),reviewer=await e.member('administrator'),student=await e.member();
 assert.equal((await student.c.request('/api/v1/study/manage','POST',resource(null,'glossary'))).status,403);
 let first=await publish(author,reviewer,resource(null,'glossary'));const daily=(await student.c.request('/api/v1/study/daily')).data;assert.equal(daily.term.id,first.id);
 await publish(author,reviewer,{...resource(null,'glossary'),title:'Another synthetic glossary fixture'});assert.equal((await student.c.request('/api/v1/study/daily')).data.term.id,first.id);
 assert.equal((await student.c.request('/api/v1/study/content?kind=glossary&q=ANOTHER')).data.items.length,1);let corrected=await author.c.request('/api/v1/study/manage/'+first.id,'PUT',{revision:first.revision,content:{...resource(null,'glossary'),definition:'Synthetic corrected definition; not medical content.'}});assert.equal(corrected.status,200);corrected=await author.c.request('/api/v1/study/manage/'+first.id,'PATCH',{revision:corrected.data.revision,action:'submit'});corrected=await reviewer.c.request('/api/v1/study/manage/'+first.id,'PATCH',{revision:corrected.data.revision,action:'publish'});assert.equal(corrected.status,200);first=corrected.data;const dailyCorrected=(await student.c.request('/api/v1/study/daily')).data;assert.equal(dailyCorrected.term.id,first.id);assert.equal(dailyCorrected.term.definition,'Synthetic corrected definition; not medical content.');assert.equal(dailyCorrected.corrected,true);
 await reviewer.c.request('/api/v1/study/manage/'+first.id,'PATCH',{revision:first.revision,action:'withdraw'});const removed=(await student.c.request('/api/v1/study/daily')).data;assert.equal(removed.term,null);assert.equal(removed.withdrawn,true);
 e.advance(day);await student.c.login(student.user);assert.ok((await student.c.request('/api/v1/study/daily')).data.term);
 }finally{await e.cleanup();}});
test('M9 own preferences, encrypted planner and topic bookmarks use optimistic versions and current access after restart',async()=>{const{e,rep,student,peer,course}=await setup();let app,stopped=false;try{
 const prefs={revision:0,avatar:'book',theme:'dark'};assert.equal((await student.c.request('/api/v1/study/preferences','PUT',prefs)).status,200);assert.equal((await student.c.request('/api/v1/study/preferences','PUT',prefs)).status,409);
 assert.equal((await student.c.request('/api/v1/study/preferences','PUT',{...prefs,revision:1,avatar:'../../private'})).status,400);assert.equal((await student.c.request('/api/v1/study/preferences','PUT',{...prefs,revision:1,level:300})).status,400);
 const plan={revision:0,tasks:[{title:'Synthetic private personal study plan',dueDate:'2026-12-01',done:false}]};assert.equal((await student.c.request('/api/v1/study/plan','PUT',plan)).status,200);assert.equal((await student.c.request('/api/v1/study/plan','PUT',plan)).status,409);assert.deepEqual((await peer.c.request('/api/v1/study/plan')).data.tasks,[]);assert.ok(!e.service.db.prepare('SELECT encrypted_payload FROM study_plans').get().encrypted_payload.includes(plan.tasks[0].title));
 const target={kind:'topic',targetId:course.topics[0].id,courseId:course.id,saved:true};assert.equal((await student.c.request('/api/v1/study/bookmarks','PUT',target)).status,200);assert.equal((await peer.c.request('/api/v1/study/bookmarks')).data.items.length,0);
 const config=e.service.config;await e.close();stopped=true;app=await startBackend(config);const c=client(app.origin);await c.login(student.user);assert.deepEqual((await c.request('/api/v1/study/plan')).data.tasks,plan.tasks);assert.equal((await c.request('/api/v1/study/bookmarks')).data.items[0].targetId,target.targetId);assert.equal((await c.request('/api/v1/study/preferences')).data.theme,'dark');void rep;
 }finally{await app?.close();if(!stopped)await e.close();await import('node:fs/promises').then(fs=>fs.rm(e.directory,{recursive:true,force:true}));}});
test('M9 study updates are atomic with audited publication and reject dangerous URLs, forged fields and stale revisions',async()=>{const{e,rep,reviewer,student,course}=await setup();try{
 assert.equal((await rep.c.request('/api/v1/study/manage','POST',{...resource(course),sourceUrl:'javascript:alert(1)'})).status,400);
 assert.equal((await rep.c.request('/api/v1/study/manage','POST',{...resource(course),published:true})).status,400);
 const draft=await rep.c.request('/api/v1/study/manage','POST',resource(course));const id=draft.data.id;const sub=await rep.c.request('/api/v1/study/manage/'+id,'PATCH',{revision:1,action:'submit'});
 e.service.db.exec("CREATE TRIGGER synthetic_study_failure BEFORE INSERT ON audit WHEN NEW.action='study.content_publish' BEGIN SELECT RAISE(ABORT,'SYNTHETIC_FAILURE');END");
 assert.equal((await reviewer.c.request('/api/v1/study/manage/'+id,'PATCH',{revision:sub.data.revision,action:'publish'})).status,503);assert.equal((await student.c.request('/api/v1/study/content')).data.items.length,0);assert.equal(e.service.db.prepare('SELECT revision FROM study_content WHERE id=?').get(id).revision,sub.data.revision);
 }finally{await e.cleanup();}});
