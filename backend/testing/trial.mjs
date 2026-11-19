// Local isolated trial tooling. Never imported by the public app or production startup.
import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID,randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { AccountService } from '../src/service.mjs';
import { syntheticAccount } from './fixtures.mjs';
const names=['trial.json','credentials.json','trial.sqlite','trial.sqlite-wal','trial.sqlite-shm'];
function isolated(service,config){if(service.db.prepare('SELECT count(*)AS n FROM trial_environment').get().n!==1||service.db.prepare('SELECT count(*)AS n FROM accounts WHERE id NOT IN(SELECT account_id FROM trial_members WHERE trial_id=?)').get(config.trialId).n)throw new Error('Mixed database: preserve unrelated records and review before trial cleanup.');}
async function privateFile(file){const stat=await fs.lstat(file);if(!stat.isFile()||stat.isSymbolicLink()||(stat.mode&0o077)!==0)throw new Error('Private regular trial files are required.');}
export async function trialConfiguration(directory){directory=path.resolve(directory);const stat=await fs.lstat(directory);if(stat.isSymbolicLink()||!stat.isDirectory()||(stat.mode&0o077)!==0||await fs.realpath(directory)!==directory)throw new Error('Private non-symlink trial directory required.');const file=path.join(directory,'trial.json');await privateFile(file);const value=JSON.parse(await fs.readFile(file,'utf8'));if(value.schemaVersion!==1||value.mode!=='test'||!/^m9-[a-f0-9-]{36}$/.test(value.trialId)||value.database!==path.join(directory,'trial.sqlite')||!Number.isSafeInteger(value.expiresAt))throw new Error('Invalid trial manifest.');for(const key of ['sessionKey','encryptionKey','auditKey']){if(!/^[a-f0-9]{64}$/.test(value[key]))throw new Error('Invalid private test key.');value[key]=Buffer.from(value[key],'hex');}return {...value,websiteFeedRefresh:false};}
export async function seedTrial(directory,{hours=8}={}){
    if(!Number.isInteger(hours)||hours<1||hours>72)throw new Error('Trial duration must be 1–72 hours.');directory=path.resolve(directory);
    const repository=path.resolve(fileURLToPath(new URL('../../',import.meta.url)));if(directory===repository||directory.startsWith(repository+path.sep)||directory.split(path.sep).some(p=>['.git','public','student-pwa','out','design-review'].includes(p)))throw new Error('Trial secrets must remain outside the source repository and public assets.');
    // Exclusive creation: never reuse or seed an existing database/directory.
    await fs.mkdir(directory,{mode:0o700});let service;
    try{
        const trialId='m9-'+randomUUID(),expiresAt=Date.now()+hours*3600000,config={schemaVersion:1,mode:'test',trialId,expiresAt,database:path.join(directory,'trial.sqlite'),sessionKey:randomBytes(32),encryptionKey:randomBytes(32),auditKey:randomBytes(32)};
        service=await AccountService.create(config);service.db.prepare('INSERT INTO trial_environment(id,expires_at)VALUES(?,?)').run(trialId,expiresAt);
        const accounts=[];
        for(const [role,level]of [['student',100],['student',200],['student',300],['representative',200],['executive',200],['reviewer',200],['support',200],['administrator',200]]){
            const user=await syntheticAccount(service,{role,level,name:`Synthetic trial ${role} ${level} · ${randomUUID().slice(0,6)}`});
            service.tx(()=>{if(role==='representative')service.db.prepare("UPDATE roles SET permissions='[\"notices.publish.level\"]' WHERE account_id=? AND role=?").run(user.id,role);if(role==='support')service.db.prepare("UPDATE roles SET permissions='[\"support.manage\"]' WHERE account_id=? AND role=?").run(user.id,role);service.db.prepare('INSERT INTO trial_members(account_id,trial_id,expires_at)VALUES(?,?,?)').run(user.id,trialId,expiresAt);});accounts.push(user);
        }
        await fs.writeFile(path.join(directory,'trial.json'),JSON.stringify({...config,sessionKey:config.sessionKey.toString('hex'),encryptionKey:config.encryptionKey.toString('hex'),auditKey:config.auditKey.toString('hex')},null,2),{mode:0o600,flag:'wx'});
        await fs.writeFile(path.join(directory,'credentials.json'),JSON.stringify({warning:'PRIVATE SYNTHETIC TEST ACCESS ONLY. Never commit or publish this file. MFA must be enrolled by privileged testers.',trialId,expiresAt,accounts},null,2),{mode:0o600,flag:'wx'});
        service.audit(null,'trial.created',trialId,{count:accounts.length,expiresAt});return {trialId,count:accounts.length,expiresAt,manifest:path.join(directory,'trial.json'),credentialsFile:path.join(directory,'credentials.json'),production:false};
    }finally{service?.close();}
}
export async function revokeTrial(directory){const config=await trialConfiguration(directory);await privateFile(config.database);const service=await AccountService.create(config);try{return service.tx(()=>{isolated(service,config);const env=service.db.prepare('SELECT * FROM trial_environment WHERE id=?').get(config.trialId);if(!env)throw new Error('Trial manifest does not match database.');service.db.prepare('UPDATE trial_environment SET revoked_at=coalesce(revoked_at,?)WHERE id=?').run(service.now(),config.trialId);service.db.prepare('UPDATE trial_members SET revoked_at=coalesce(revoked_at,?)WHERE trial_id=?').run(service.now(),config.trialId);service.db.prepare('DELETE FROM sessions').run();service.audit(null,'trial.revoked',config.trialId);return {revoked:true};});}finally{service.close();}}
export async function destroyTrial(directory){directory=path.resolve(directory);const config=await trialConfiguration(directory);await privateFile(config.database);const files=await fs.readdir(directory);if(files.some(n=>!names.includes(n)))throw new Error('Unexpected files: preserve them and review before cleanup.');for(const name of files)await privateFile(path.join(directory,name));await revokeTrial(directory);for(const name of names)await fs.rm(path.join(directory,name),{force:true});await fs.rmdir(directory);return {destroyed:true,trialId:config.trialId};}
