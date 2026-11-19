import {createHash} from 'node:crypto';
import {validateWebsiteFeed} from '../../ui/operations/website-reference-data.mjs';
export const catalogueEndpoint='https://nipsaunilesa.com.ng/pharmaideia-content.json';
export const catalogueHash=value=>createHash('sha256').update(value).digest('hex');
const size=value=>Buffer.byteLength(value,'utf8');
const problem=code=>{throw new Error(code);};
export class WebsiteCache {
 constructor(service){this.s=service;this.db=service.db;}
 validate(value){const feed=validateWebsiteFeed(value);if(feed.version!==catalogueHash(JSON.stringify(feed.items)))problem('FEED_INTEGRITY');return feed;}
 load(){const row=this.db.prepare('SELECT * FROM website_catalogue_cache WHERE id=1').get();const footprint=this.db.prepare('SELECT count(*) AS n FROM website_catalogue_entries').get().n+this.db.prepare('SELECT count(*) AS n FROM website_catalogue_history').get().n;if(!row)return footprint?{corrupt:true}:null;try{if(row.source_url!==catalogueEndpoint||size(row.payload)>1048576||catalogueHash(row.payload)!==row.payload_hash)problem('CACHE_INTEGRITY');const feed=this.validate(JSON.parse(row.payload));if(feed.version!==row.version||!Number.isSafeInteger(row.validated_at))problem('CACHE_INTEGRITY');return {feed,etag:row.etag,lastModified:row.last_modified,validatedAt:row.validated_at};}catch{return {corrupt:true};}}
 entry(id){const row=this.db.prepare('SELECT * FROM website_catalogue_entries WHERE id=?').get(id);if(!row)return null;try{if(catalogueHash(row.payload)!==row.payload_hash)problem('ENTRY_INTEGRITY');const item=JSON.parse(row.payload),validated=validateWebsiteFeed({schemaVersion:1,version:'0'.repeat(64),generatedAt:new Date(0).toISOString(),items:[item]}).items[0];if(validated.id!==id)problem('ENTRY_INTEGRITY');return {...validated,withdrawn:row.state==='withdrawn',withdrawnAt:row.withdrawn_at,sourceVersion:row.source_version};}catch{return {id,corrupt:true};}}
 save(feed,{etag=null,lastModified=null,now}){
  const payload=JSON.stringify(feed);if(size(payload)>1048576)problem('CACHE_SIZE');
  return this.s.tx(()=>{
   const current=this.load(),latest=this.db.prepare('SELECT * FROM website_catalogue_history ORDER BY accepted_at DESC,rowid DESC LIMIT 1').get();
   const previous=current&&!current.corrupt?current.feed:latest?{version:latest.version,generatedAt:new Date(latest.generated_at).toISOString(),publicationSequence:latest.publication_sequence}:null;
   const highwater=this.db.prepare('SELECT max(publication_sequence) AS sequence FROM website_catalogue_history').get().sequence;
   if(Number.isSafeInteger(highwater)&&(!Number.isSafeInteger(feed.publicationSequence)||feed.publicationSequence<highwater))problem('ROLLBACK_REJECTED');
   if(previous&&previous.version!==feed.version){
    const old=this.db.prepare('SELECT * FROM website_catalogue_history WHERE version=?').get(feed.version),ceiling=this.db.prepare('SELECT max(generated_at) AS generated_at,max(publication_sequence) AS sequence FROM website_catalogue_history').get();
    const sequence=feed.publicationSequence,prior=ceiling.sequence??previous.publicationSequence;
    const ordered=Number.isSafeInteger(sequence)&&(!Number.isSafeInteger(prior)||sequence>prior);
    if((old||Date.parse(feed.generatedAt)<Math.max(ceiling.generated_at??0,Date.parse(previous.generatedAt)))&&!ordered)problem('ROLLBACK_REJECTED');
    if(Number.isSafeInteger(prior)&&(!Number.isSafeInteger(sequence)||sequence<=prior))problem('ROLLBACK_REJECTED');
   }
   const history=this.db.prepare('SELECT count(*) AS n FROM website_catalogue_history').get().n;
   if(history>=256&&!this.db.prepare('SELECT 1 FROM website_catalogue_history WHERE version=?').get(feed.version))problem('CATALOGUE_HISTORY_LIMIT');
   const existing=this.db.prepare('SELECT id FROM website_catalogue_entries').all(),ids=new Set([...existing.map(x=>x.id),...feed.items.map(x=>x.id)]);
   if(ids.size>5000)problem('CATALOGUE_ENTRY_LIMIT');
   // Never delete historical withdrawals to make room. Operators must review
   // bounded compaction/retention before a full catalogue can accept new data.
   this.db.prepare("UPDATE website_catalogue_entries SET state='withdrawn',withdrawn_at=coalesce(withdrawn_at,?),source_version=?,updated_at=? WHERE state='published'").run(now,feed.version,now);
   const put=this.db.prepare("INSERT INTO website_catalogue_entries VALUES(?,?,?,'published',?,?,NULL) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload,payload_hash=excluded.payload_hash,state='published',source_version=excluded.source_version,updated_at=excluded.updated_at,withdrawn_at=NULL");
   for(const item of feed.items){const value=JSON.stringify(item);put.run(item.id,value,catalogueHash(value),feed.version,now);}
   if(this.db.prepare('SELECT coalesce(sum(length(CAST(payload AS BLOB))),0) AS n FROM website_catalogue_entries').get().n>8388608)problem('CATALOGUE_STORAGE_LIMIT');
   this.db.prepare('INSERT INTO website_catalogue_cache VALUES(1,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET source_url=excluded.source_url,version=excluded.version,payload=excluded.payload,payload_hash=excluded.payload_hash,etag=excluded.etag,last_modified=excluded.last_modified,validated_at=excluded.validated_at').run(catalogueEndpoint,feed.version,payload,catalogueHash(payload),etag,lastModified,now);
   this.db.prepare('INSERT INTO website_catalogue_history VALUES(?,?,?,?,?) ON CONFLICT(version) DO UPDATE SET generated_at=max(website_catalogue_history.generated_at,excluded.generated_at),source_revision=coalesce(excluded.source_revision,website_catalogue_history.source_revision),publication_sequence=CASE WHEN excluded.publication_sequence IS NULL THEN website_catalogue_history.publication_sequence WHEN website_catalogue_history.publication_sequence IS NULL THEN excluded.publication_sequence ELSE max(website_catalogue_history.publication_sequence,excluded.publication_sequence) END,accepted_at=excluded.accepted_at').run(feed.version,Date.parse(feed.generatedAt),feed.sourceRevision??null,feed.publicationSequence??null,now);
   if(previous?.version!==feed.version)this.s.audit(null,'website.feed_updated',null,{version:feed.version,count:feed.items.length});
   return {changed:previous?.version!==feed.version};
  });
 }
 validated304(expectedVersion,etag,now){return this.s.tx(()=>{const stored=this.load();if(!stored||stored.corrupt||stored.feed.version!==expectedVersion||!etag||stored.etag!==etag)problem('UNEXPECTED_NOT_MODIFIED');this.db.prepare('UPDATE website_catalogue_cache SET validated_at=? WHERE id=1 AND version=?').run(now,expectedVersion);return stored.feed;});}
 counts(){return {entries:this.db.prepare('SELECT count(*) AS n FROM website_catalogue_entries').get().n,withdrawn:this.db.prepare("SELECT count(*) AS n FROM website_catalogue_entries WHERE state='withdrawn'").get().n,versions:this.db.prepare('SELECT count(*) AS n FROM website_catalogue_history').get().n};}
}
