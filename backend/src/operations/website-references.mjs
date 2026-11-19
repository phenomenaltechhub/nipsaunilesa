import fs from 'node:fs';
import {fail,list,plain} from './common.mjs';
import {matchWebsiteReferences,referenceLabelRanges} from '../../ui/operations/website-reference-data.mjs';
import {WebsiteCache,catalogueEndpoint,catalogueHash} from './website-cache.mjs';
const validator=value=>typeof value==='string'&&value.length<=200&&!/[\r\n]/.test(value)?value:null;
async function downloadFeed(url,headers,signal){
 const response=await fetch(url,{headers,redirect:'error',signal,credentials:'omit',cache:'no-store'});
 const metadata={etag:validator(response.headers.get('etag')),lastModified:validator(response.headers.get('last-modified'))};
 if(response.status===304)return {status:304,...metadata};
 if(response.status!==200){await response.body?.cancel().catch(()=>{});return {status:response.status};}
 if(!String(response.headers.get('content-type')).toLowerCase().includes('application/json')){await response.body?.cancel().catch(()=>{});throw new Error('FEED_TYPE');}
 if(Number(response.headers.get('content-length'))>1048576){await response.body?.cancel().catch(()=>{});throw new Error('FEED_SIZE');}
 const parts=[];let size=0;for await(const chunk of response.body){size+=chunk.length;if(size>1048576)throw new Error('FEED_SIZE');parts.push(chunk);}
 return {status:200,...metadata,body:Buffer.concat(parts)};
}
export class WebsiteReferences {
 constructor(service){
  this.s=service;this.cache=new WebsiteCache(service);this.enabled=service.config.websiteFeedRefresh===true;
  this.transport=service.config.mode==='test'&&service.config.websiteFeedFetch?service.config.websiteFeedFetch:downloadFeed;
  this.controller=new AbortController();this.inflight=null;this.next=0;this.failures=0;this.closed=false;this.checkedAt=null;this.lastError=null;this.boot=true;
  const configured=service.config.websiteFreshMs??900000;if(!Number.isSafeInteger(configured)||configured<60000||configured>3600000)throw new Error('Invalid website freshness window.');this.freshMs=configured;
  const stored=this.cache.load();this.validatedAt=null;this.etag=null;this.lastModified=null;this.representationVerified=false;
  if(stored&&!stored.corrupt){this.feed=stored.feed;this.etag=stored.etag;this.lastModified=stored.lastModified;this.validatedAt=stored.validatedAt;this.representationVerified=true;this.status='cached';}
  else if(stored?.corrupt){this.feed={schemaVersion:1,version:catalogueHash('[]'),generatedAt:new Date(0).toISOString(),items:[]};this.status='unavailable';this.lastError='CACHE_INTEGRITY';}
  else{this.feed=this.validate(JSON.parse(fs.readFileSync(new URL('../../public-data/website-content.json',import.meta.url),'utf8')));this.status='bundled';}
 }
 validate(input){return this.cache.validate(input);}
 state(){const current=this.status==='live'&&!this.boot&&this.representationVerified&&this.validatedAt<=this.s.now()&&this.validatedAt+this.freshMs>this.s.now();const state=current?'current':this.representationVerified?'cached':this.feed.items.length?'unverified':'unavailable';return {state,transport:this.status==='unavailable'?'unreachable':this.status==='blocked'?'blocked':this.status,representationVerified:this.representationVerified,lastValidatedAt:this.validatedAt===null?null:new Date(this.validatedAt).toISOString(),freshUntil:this.validatedAt===null?null:new Date(this.validatedAt+this.freshMs).toISOString(),revision:this.feed.version+':'+state+':'+this.status+':'+String(this.validatedAt)};}
 item(item,label=item.title){const catalogue=this.state();return {...item,label,available:true,referenceState:item.verification==='candidate'?'unverified':catalogue.state,sourceStatus:catalogue.transport,lastValidatedAt:catalogue.lastValidatedAt};}
 catalogue(session){this.s.requireUser(session);return {...this.feed,catalogueStatus:this.state(),items:this.feed.items.map(item=>this.item(item))};}
 search(session,query=''){const user=this.s.requireUser(session);this.s.rate('website-search:'+user.id,60);const q=plain(query,120,true).normalize('NFC').toLocaleLowerCase(),terms=q.split(/\s+/u).filter(Boolean),matches=this.feed.items.filter(x=>terms.every(t=>(x.title+' '+x.description+' '+x.kind).toLocaleLowerCase().includes(t)));matches.sort((a,b)=>Number(b.title.toLocaleLowerCase().startsWith(q))-Number(a.title.toLocaleLowerCase().startsWith(q))||Number(b.kind==='announcement')-Number(a.kind==='announcement')||a.title.localeCompare(b.title)||a.id.localeCompare(b.id));return {version:this.feed.version,catalogueRevision:this.state().revision,catalogueStatus:this.state(),items:matches.slice(0,5).map(item=>this.item(item))};}
 prepare(body,selected=[],excluded=[],previous=[]){list(selected,3);list(excluded,3);for(const id of [...selected,...excluded])if(typeof id!=='string'||id.length>300)fail(400,'INVALID_REFERENCE');const blocked=new Set(excluded),matches=matchWebsiteReferences(body,this.feed.items),refs=[];const add=(id,label,historical=false)=>{if(blocked.has(id)||refs.some(x=>x.id===id))return;const item=this.feed.items.find(x=>x.id===id),old=historical?this.cache.entry(id):null;if(!item&&!(old&&!old.corrupt))fail(400,'REFERENCE_UNAVAILABLE','This website item is no longer listed. Choose another reference.');refs.push({id,label:label??item?.title??old.title});};for(const id of selected)add(id);for(const old of previous){if(refs.length>=3)break;const item=this.feed.items.find(x=>x.id===old.id)??this.cache.entry(old.id);if(item&&!item.corrupt&&referenceLabelRanges(body,old.label??item.title).length)add(old.id,old.label??item.title,true);}for(const match of matches)if(refs.length<3)add(match.id,match.label);return refs.slice(0,3);}
 resolve(refs){return refs.map(ref=>{const item=this.feed.items.find(x=>x.id===ref.id);if(item)return this.item(item,ref.label);const previous=this.cache.entry(ref.id);return {id:ref.id,label:ref.label,...(previous&&!previous.corrupt?{title:previous.title,description:previous.description,kind:previous.kind,verification:previous.verification,withdrawnAt:previous.withdrawnAt===null?null:new Date(previous.withdrawnAt).toISOString()}:{}),available:false,referenceState:previous?.withdrawn?'withdrawn':'unknown',sourceStatus:this.state().transport,lastValidatedAt:this.state().lastValidatedAt};});}
 diagnostics(){return {refreshEnabled:this.enabled,source:this.status,checkedAt:this.checkedAt,version:this.feed.version,publicEntries:this.feed.items.length,endpoint:catalogueEndpoint,...this.state(),lastError:this.lastError,sourceRevision:this.feed.sourceRevision??null,lastModified:this.lastModified,storage:this.cache.counts()};}
 maybeRefresh(){if(this.closed||!this.enabled||this.inflight||this.next>this.s.now())return;this.refresh().catch(()=>{});}
 async refresh(){
  if(this.status==='blocked')return {refreshed:false,reason:'blocked'};
  if(this.closed||!this.enabled)return {refreshed:false,reason:'disabled'};if(this.inflight)return this.inflight;
  this.inflight=(async()=>{try{
   const headers={'Accept':'application/json'};if(this.etag&&this.representationVerified)headers['If-None-Match']=this.etag;
   const result=await this.transport(catalogueEndpoint,headers,AbortSignal.any([this.controller.signal,AbortSignal.timeout(5000)]));if(this.closed)return {refreshed:false};
   this.checkedAt=new Date(this.s.now()).toISOString();
   if(result.status===403){this.status='blocked';this.lastError='FEED_BLOCKED';this.next=Infinity;return {refreshed:false,reason:'blocked'};}
   if(result.status===304){if(!headers['If-None-Match']||result.etag&&result.etag!==this.etag)throw new Error('UNEXPECTED_NOT_MODIFIED');this.feed=this.cache.validated304(this.feed.version,this.etag,this.s.now());this.validatedAt=this.s.now();this.status='live';this.boot=false;this.lastError=null;this.failures=0;this.next=this.s.now()+300000;return {refreshed:false,notModified:true};}
   if(result.status!==200||!Buffer.isBuffer(result.body)||result.body.length>1048576)throw new Error('FEED_RESPONSE');
   const next=this.validate(JSON.parse(result.body.toString('utf8')));if(!next.items.length)throw new Error('EMPTY_FEED');
   const changed=next.version!==this.feed.version,etag=validator(result.etag),lastModified=validator(result.lastModified);
   this.cache.save(next,{etag,lastModified,now:this.s.now()});this.feed=next;this.etag=etag;this.lastModified=lastModified;this.validatedAt=this.s.now();this.representationVerified=true;this.status='live';this.boot=false;this.lastError=null;this.failures=0;this.next=this.s.now()+300000;return {refreshed:changed};
  }catch(error){if(!this.closed){this.status='unavailable';this.checkedAt=new Date(this.s.now()).toISOString();const codes=['CACHE_INTEGRITY','FEED_INTEGRITY','UNEXPECTED_NOT_MODIFIED','EMPTY_FEED','ROLLBACK_REJECTED','CATALOGUE_HISTORY_LIMIT','CATALOGUE_ENTRY_LIMIT','CATALOGUE_STORAGE_LIMIT','FEED_SIZE','FEED_TYPE','FEED_RESPONSE'];this.lastError=codes.includes(error.message)?error.message:'FEED_UNAVAILABLE';this.failures++;this.next=this.s.now()+Math.min(3600000,300000*3**Math.min(this.failures,3));}return {refreshed:false,reason:'unavailable'};}finally{this.inflight=null;}})();return this.inflight;
 }
 close(){this.closed=true;this.controller.abort();}
}
