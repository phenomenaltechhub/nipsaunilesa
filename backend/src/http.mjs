import {createServer as createSecureServer} from 'node:https';
import {createOperations,operationRoute}from'./operations/index.mjs';
import {mediaRange}from'../../scripts/lib/media-range.mjs';
import {createServer}from'node:http';
import fs from'node:fs/promises';
import path from'node:path';
import {randomUUID}from'node:crypto';
import {fileURLToPath}from'node:url';
import {AccountService,ApiError,fields}from'./service.mjs';
const repository=fileURLToPath(new URL('../../',import.meta.url));
const mime={'.html':'text/html; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.avif':'image/avif','.jpg':'image/jpeg','.webmanifest':'application/manifest+json','.mp4':'video/mp4','.vtt':'text/vtt; charset=utf-8','.txt':'text/plain; charset=utf-8'};
function json(res,status,value){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'private, no-store','Pragma':'no-cache','Vary':'Cookie'});res.end(JSON.stringify(value));}
async function readBody(req,maximum=16384){if(!String(req.headers['content-type']??'').startsWith('application/json'))throw new ApiError(415,'JSON_REQUIRED');if(Number(req.headers['content-length'])>maximum){req.resume();throw new ApiError(413,'BODY_TOO_LARGE');}return new Promise((resolve,reject)=>{let size=0,parts=[],failed=false;req.on('data',part=>{size+=part.length;if(size>maximum){if(!failed)reject(new ApiError(413,'BODY_TOO_LARGE'));failed=true;parts=[];}else if(!failed)parts.push(part);});req.on('error',()=>reject(new ApiError(400,'BAD_REQUEST')));req.on('end',()=>{if(failed)return;try{const data=JSON.parse(Buffer.concat(parts).toString('utf8'));if(!data||typeof data!=='object'||Array.isArray(data))throw new Error();resolve(data);}catch{reject(new ApiError(400,'INVALID_JSON'));}});});}
function cookie(req){const found=String(req.headers.cookie??'').split(';').map(s=>s.trim()).filter(s=>s.startsWith('pharmaideia_session='));if(found.length!==1)return null;return found[0].slice('pharmaideia_session='.length);}
export async function startBackend(config,{port=0,logger=()=>{}}={}){
 const service=await AccountService.create(config),operations=createOperations(service);let origin='';
 const makeServer=config.tls?(handler)=>createSecureServer(config.tls,handler):createServer;
 const server=makeServer(async(req,res)=>{
  const requestId=randomUUID();res.setHeader('X-Request-ID',requestId);res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');res.setHeader('X-Frame-Options','DENY');res.setHeader('Permissions-Policy','camera=(), microphone=(), geolocation=()');
  res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' blob:; media-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'");
  try{
   if(req.headers.host!==new URL(origin).host||req.headers['sec-fetch-site']==='cross-site'||(req.headers.origin&&req.headers.origin!==origin))throw new ApiError(403,'ORIGIN_DENIED');
   if(req.url.length>2048)throw new ApiError(400,'BAD_REQUEST');const url=new URL(req.url,origin),route=url.pathname;const api=route.startsWith('/api/');
   if(api){service.rate('api-global',1000);service.rate('api:'+req.socket.remoteAddress,300);if(req.method==='POST'&&route==='/api/v1/payments/webhook'){const parts=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>20000)throw new ApiError(413,'BODY_TOO_LARGE');parts.push(chunk);}json(res,200,await operations.payments.webhook(Buffer.concat(parts),req.headers['x-paystack-signature']));return;}const raw=cookie(req);let session=service.session(raw);const setSession=token=>{const age=Math.floor((service.session(token).expires_at-service.now())/1000);res.setHeader('Set-Cookie',`pharmaideia_session=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${age}${config.tls?'; Secure':''}`);};
    if(req.method==='GET'&&route==='/api/v1/health'){service.db.prepare('SELECT 1').get();json(res,200,{status:'ok',mode:service.config.mode,publicActivation:false});return;}
    if(req.method==='GET'&&route==='/api/v1/session'){if(!session){const token=service.createSession();setSession(token);session=service.session(token);}json(res,200,service.snapshot(session));return;}
    let body=null;if(!['GET','HEAD'].includes(req.method)){if(req.headers.origin!==origin)throw new ApiError(403,'ORIGIN_DENIED');if(!session)throw new ApiError(401,'SESSION_EXPIRED');service.checkCsrf(raw,req.headers['x-csrf-token']);if(/^\/api\/v1\/academic\/resources\/[a-f0-9-]{36}\/file$/.test(route)){const user=service.requireUser(session);service.requireLevel(session,user.level,true);service.rate('resource-upload-http:'+user.id,10,3600000);}if(route==='/api/v1/community/images'){const user=service.checkChatWrite(session);service.rate('community-image-http:'+user.id,10,3600000);}body=await readBody(req,route==='/api/v1/community/images'?1450000:/^\/api\/v1\/academic\/resources\/[a-f0-9-]{36}\/file$/.test(route)?1500000:16384);}
    let output=await operationRoute(operations,service,session,req.method,url,body),status=200;
    if(output!==undefined){}
    else if(req.method==='POST'&&route==='/api/v1/auth/login'){output=await service.login(body,raw,req.socket.remoteAddress);if(output.failed)throw new ApiError(401,'AUTH_FAILED');}
    else if(req.method==='POST'&&route==='/api/v1/auth/logout'){fields(body,[]);service.logout(session);res.setHeader('Set-Cookie','pharmaideia_session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0'+(config.tls?'; Secure':''));output={signedOut:true};}
    else if(req.method==='POST'&&route==='/api/v1/auth/recovery/start')output=await service.issue(body,'recovery',req.socket.remoteAddress);
    else if(req.method==='POST'&&route==='/api/v1/auth/activation/start')output=await service.issue(body,'activation',req.socket.remoteAddress);
    else if(req.method==='POST'&&route==='/api/v1/auth/mfa-recovery/start')output=await service.issue(body,'mfa_recovery',req.socket.remoteAddress);
    else if(req.method==='POST'&&route==='/api/v1/auth/mfa-recovery/complete')output=await service.complete(body,'mfa_recovery',raw);
    else if(req.method==='POST'&&route==='/api/v1/auth/recovery/complete')output=await service.complete(body,'recovery',raw);
    else if(req.method==='POST'&&route==='/api/v1/auth/activation/complete')output=await service.complete(body,'activation',raw);
    else if(req.method==='POST'&&route==='/api/v1/auth/password')output=await service.changePassword(session,body);
    else if(req.method==='POST'&&route==='/api/v1/mfa/enroll')output=await service.enrollMfa(session,body);
    else if(req.method==='POST'&&route==='/api/v1/mfa/confirm')output=service.verifyMfa(session,body,true);
    else if(req.method==='POST'&&route==='/api/v1/mfa/verify')output=service.verifyMfa(session,body);
    else if(req.method==='POST'&&route==='/api/v1/auth/role')output=service.switchRole(session,body);
    else if(req.method==='GET'&&route==='/api/v1/admin/accounts')output={accounts:service.accounts(session,Number(url.searchParams.get('offset')??0)),total:service.db.prepare('SELECT count(*) AS n FROM accounts').get().n,offset:Number(url.searchParams.get('offset')??0),limit:100};
    else if(req.method==='GET'&&route==='/api/v1/admin/audit')output=service.auditLog(session);
    else if(req.method==='GET'&&route==='/api/v1/admin/config'){service.requireAdmin(session);output={mode:service.config.mode,backend:'Node 24 / SQLite',publicActivation:false,emailDelivery:service.config.mailMode,websiteFeed:operations.website.diagnostics(),sessionMs:service.config.sessionMs,idleMs:service.config.idleMs};}
    else if(req.method==='POST'&&route==='/api/v1/admin/deletion/run'){fields(body,[]);output=service.deleteDue(session);}
    else if(req.method==='PATCH'&&/^\/api\/v1\/admin\/accounts\/[a-f0-9-]{36}$/.test(route))output=service.updateAccount(session,route.split('/').at(-1),body);
    else if(req.method==='POST'&&/^\/api\/v1\/admin\/accounts\/[a-f0-9-]{36}\/roles$/.test(route))output=service.assignRole(session,route.split('/').at(-2),body);
    else if(req.method==='POST'&&/^\/api\/v1\/admin\/accounts\/[a-f0-9-]{36}\/recovery$/.test(route))output=await service.adminRecovery(session,route.split('/').at(-2),body);
    else if(req.method==='POST'&&/^\/api\/v1\/admin\/accounts\/[a-f0-9-]{36}\/chat-suspension$/.test(route))output=service.chatSuspension(session,route.split('/').at(-2),body);
    else if(req.method==='POST'&&/^\/api\/v1\/admin\/accounts\/[a-f0-9-]{36}\/mfa-recovery$/.test(route))output=service.approveMfaRecovery(session,route.split('/').at(-2),body);
    else if(req.method==='GET'&&/^\/api\/v1\/accounts\/[a-f0-9-]{36}\/profile$/.test(route))output=service.profile(session,route.split('/').at(-2));
    else if(req.method==='GET'&&route==='/api/v1/academic/drafts')output={drafts:service.drafts(session,Number(url.searchParams.get('level')))};
    else if(req.method==='POST'&&route==='/api/v1/academic/drafts'){output=service.createDraft(session,body);status=201;}
    else if(req.method==='PATCH'&&route==='/api/v1/admin/community')output=service.setCommunity(session,body);
    else throw new ApiError(404,'NOT_FOUND');
    if(output?.inlineImage){res.writeHead(200,{'Content-Type':'image/png','Cache-Control':'private, no-store','Vary':'Cookie','Content-Length':output.bytes.length});res.end(output.bytes);return;}
    if(output?.download){res.writeHead(200,{'Content-Type':output.mediaType,'Content-Disposition':'attachment; filename="'+output.filename+'"','Cache-Control':'private, no-store','Content-Length':output.bytes.length,'X-Content-Type-Options':'nosniff'});res.end(output.bytes);return;}
    if(output?.raw){setSession(output.raw);delete output.raw;}json(res,status,output);return;
   }
   if(!['GET','HEAD'].includes(req.method))throw new ApiError(405,'METHOD_NOT_ALLOWED');
   let root,relative;
   if(route.startsWith('/access/')){root=path.join(repository,'backend/ui');relative=route.slice('/access/'.length)||'access.html';}
   else if(route==='/access'){res.writeHead(302,{Location:'/access/','Cache-Control':'no-store'});res.end();return;}
   else if(route.startsWith('/operations/')){service.requireUser(service.session(cookie(req)));root=path.join(repository,'backend/ui/operations');relative=route.slice('/operations/'.length);if(!/^[a-z-]+\.(mjs|css)$/.test(relative))throw new ApiError(404,'NOT_FOUND');}
   else if(route.startsWith('/admin')){const session=service.session(cookie(req));try{service.requireAdmin(session);}catch{res.writeHead(302,{Location:'/access/','Cache-Control':'no-store'});res.end();return;}root=path.join(repository,'backend/ui');relative=route==='/admin'||route==='/admin/'?'admin.html':route.slice('/admin/'.length);}
   else{root=path.join(repository,'student-pwa');relative=route==='/'?'index.html':decodeURIComponent(route.slice(1));}
   if(root.endsWith('/ui')&&!(route.startsWith('/access/')?['access.html','access.mjs','api.mjs','ui.css','bridge.mjs']:['admin.html','admin.mjs','api.mjs','ui.css']).includes(relative))throw new ApiError(404,'NOT_FOUND');
   if(relative.split('/').some(p=>p.startsWith('.')||p==='..')||relative.includes('\\'))throw new ApiError(404,'NOT_FOUND');const file=path.resolve(root,relative);if(!file.startsWith(root+path.sep))throw new ApiError(404,'NOT_FOUND');const real=await fs.realpath(file).catch(()=>null);if(!real||!real.startsWith(root+path.sep))throw new ApiError(404,'NOT_FOUND');const stat=await fs.stat(file);if(!stat.isFile())throw new ApiError(404,'NOT_FOUND');let bytes=await fs.readFile(file);if(root.endsWith('student-pwa')&&relative==='index.html')bytes=Buffer.from(bytes.toString().replace('<html lang="en">','<html lang="en" data-account-service="controlled">').replace('</head>','<script type="module" src="/access/bridge.mjs"></script></head>'));const headers={'Content-Type':mime[path.extname(file)]??'application/octet-stream','Cache-Control':root.includes('/backend/ui')?'private, no-store':'no-cache','Content-Length':bytes.length};const range=path.extname(file)==='.mp4'?mediaRange(req.headers.range,bytes.length):null;if(path.extname(file)==='.mp4')headers['Accept-Ranges']='bytes';if(range===false){res.writeHead(416,{'Content-Range':`bytes */${bytes.length}`});res.end();return;}if(range){headers['Content-Range']=`bytes ${range.start}-${range.end}/${bytes.length}`;bytes=bytes.subarray(range.start,range.end+1);headers['Content-Length']=bytes.length;}res.writeHead(range?206:200,headers);res.end(req.method==='HEAD'?undefined:bytes);
  }catch(error){const known=error instanceof ApiError;const status=known?error.status:error?.code==='ENOENT'?404:503;logger({requestId,code:known?error.code:'SERVICE_UNAVAILABLE'});if(!res.headersSent)json(res,status,{error:{code:known?error.code:status===404?'NOT_FOUND':'SERVICE_UNAVAILABLE',message:known?error.message:'The service is temporarily unavailable.',requestId}});else res.end();}
 });
 server.requestTimeout=15000;server.headersTimeout=10000;await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',resolve);});origin=`${config.tls?'https':'http'}://127.0.0.1:${server.address().port}`;
 const maintenance=setInterval(()=>{try{operations.maintenance();}catch{logger({code:'MAINTENANCE_UNAVAILABLE'});}},5000);maintenance.unref();
 return{service,operations,server,origin,async close(){operations.website.close();clearInterval(maintenance);await new Promise(resolve=>server.close(resolve));service.close();}};
}
