import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createServer} from 'node:http';
import {operationEnvironment} from '../testing/operations-fixtures.mjs';

test('M8 office changes roll back when protected audit storage rejects the event', async () => {
 const e=await operationEnvironment();
 try {
  const admin=await e.member('administrator'),executive=await e.member('executive');
  const route='/api/v1/admin/community/offices/'+executive.user.id;
  assert.equal((await admin.c.request(route,'PUT',{title:'Synthetic approved office',precedence:10})).status,200);
  e.service.db.exec("CREATE TRIGGER synthetic_office_audit_failure BEFORE INSERT ON audit WHEN NEW.action='community.office_updated' BEGIN SELECT RAISE(ABORT,'SYNTHETIC_AUDIT_FAILURE'); END;");
  const rejected=await admin.c.request(route,'PUT',{title:'Synthetic unrecorded replacement',precedence:1});assert.ok(rejected.status>=500&&rejected.status<600);
  const office=e.service.db.prepare('SELECT title,precedence FROM community_offices WHERE account_id=?').get(executive.user.id);
  assert.equal(office.title,'Synthetic approved office');
  assert.equal(office.precedence,10);
 } finally {await e.cleanup();}
});

test('M8 executive revocation clears the approved-office label so reappointment cannot revive a stale identity', async () => {
 const e=await operationEnvironment();
 try {
  const admin=await e.member('administrator'),executive=await e.member('executive'),student=await e.member();
  assert.equal((await admin.c.request('/api/v1/admin/community/offices/'+executive.user.id,'PUT',{title:'Synthetic approved office',precedence:10})).status,200);
  const route='/api/v1/admin/accounts/'+executive.user.id+'/roles';
  const appointment={role:'executive',level:null,permissions:[],reason:'policy_change'};
  assert.equal((await admin.c.request(route,'POST',{...appointment,remove:true})).status,200);
  assert.equal(e.service.db.prepare('SELECT count(*) AS n FROM community_offices WHERE account_id=?').get(executive.user.id).n,0);
  assert.equal((await admin.c.request(route,'POST',{...appointment,remove:false})).status,200);
  const members=(await student.c.request('/api/v1/community/members')).data.members;
  assert.equal(members.find(member=>member.id===executive.user.id).position,null);
  assert.equal((await admin.c.request('/api/v1/admin/community/offices/'+executive.user.id,'PUT',{title:'Synthetic newly approved office',precedence:20})).status,200);
  assert.equal((await student.c.request('/api/v1/community/members')).data.members.find(member=>member.id===executive.user.id).position,'Synthetic newly approved office');
 } finally {await e.cleanup();}
});

test('M8 native feed adapter enforces real HTTP metadata, redirects and streamed size bounds', async t => {
 const snapshot=JSON.parse(fs.readFileSync(new URL('../public-data/website-content.json',import.meta.url),'utf8'));
 let mode='valid',trap=false;const requests=[];
 const server=createServer((req,res)=>{
  requests.push({path:req.url,conditional:req.headers['if-none-match']});
  if(req.url==='/trap'){trap=true;res.end('{}');return;}
  if(mode==='redirect'){res.writeHead(302,{Location:'/trap'});res.end();return;}
  if(mode==='wrong-type'){res.writeHead(200,{'Content-Type':'text/html'});res.end('<p>Synthetic invalid feed</p>');return;}
  if(mode==='large-header'){res.writeHead(200,{'Content-Type':'application/json','Content-Length':1048577});res.end();return;}
  if(mode==='large-stream'){res.writeHead(200,{'Content-Type':'application/json'});res.write(Buffer.alloc(600000));res.end(Buffer.alloc(600000));return;}
  if(mode==='conditional'){res.writeHead(304);res.end();return;}
  res.writeHead(200,{'Content-Type':'application/json','ETag':'"synthetic-native-feed"'});res.end(JSON.stringify(snapshot));
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const originalFetch=globalThis.fetch,origin='http://127.0.0.1:'+server.address().port;
 // Test-only mapping executes the actual native download adapter against a real
 // local HTTP server. It does not verify external DNS/TLS/proxy infrastructure.
 t.mock.method(globalThis,'fetch',async (url,options)=>{
  assert.equal(url,'https://nipsaunilesa.com.ng/pharmaideia-content.json');
  assert.equal(options.redirect,'error');assert.equal(options.credentials,'omit');
  assert.equal(Object.keys(options.headers).some(key=>/cookie|authorization/i.test(key)),false);
  return originalFetch(origin+'/pharmaideia-content.json',options);
 });
 const e=await operationEnvironment({websiteFeedRefresh:true});
 try {
  assert.equal((await e.operations.website.refresh()).reason,undefined);
  assert.equal(e.operations.website.diagnostics().source,'live');
  mode='conditional';assert.equal((await e.operations.website.refresh()).notModified,true);
  assert.equal(requests.at(-1).conditional,'"synthetic-native-feed"');
  for(mode of ['wrong-type','large-header','large-stream','redirect']){
   assert.equal((await e.operations.website.refresh()).reason,'unavailable',mode);
   assert.equal(e.operations.website.feed.version,snapshot.version);
  }
  assert.equal(trap,false);assert.ok(requests.every(req=>req.path==='/pharmaideia-content.json'));
 } finally {await e.cleanup();server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
});

test('M8 an unsolicited 304 cannot label the bundled catalogue as a verified live feed', async () => {
 const e=await operationEnvironment({websiteFeedRefresh:true,websiteFeedFetch:async()=>({status:304})});
 try {assert.equal((await e.operations.website.refresh()).reason,'unavailable');assert.equal(e.operations.website.diagnostics().source,'unavailable');}
 finally {await e.cleanup();}
});
