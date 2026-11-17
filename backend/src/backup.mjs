import fs from'node:fs/promises';
import path from'node:path';
import {randomUUID}from'node:crypto';
import {seal,unseal}from'./security.mjs';
import {openStore,verifyAudit,privateDirectory}from'./store.mjs';
export async function encryptedBackup(service,directory){directory=privateDirectory(directory);const temporary=path.join(directory,randomUUID()+'.sqlite');try{service.db.prepare('VACUUM INTO ?').run(temporary);await fs.chmod(temporary,0o600);const bytes=await fs.readFile(temporary);const file=path.join(directory,randomUUID()+'.backup');await fs.writeFile(file,seal(service.config.encryptionKey,bytes.toString('base64')),{mode:0o600,flag:'wx'});return file;}finally{await fs.rm(temporary,{force:true});}}
export async function restoreBackup(file,destination,config){privateDirectory(path.dirname(destination));const data=Buffer.from(unseal(config.encryptionKey,await fs.readFile(file,'utf8')),'base64');await fs.writeFile(destination,data,{mode:0o600,flag:'wx'});let db;try{db=openStore(destination);if(db.prepare('PRAGMA integrity_check').get().integrity_check!=='ok'||db.prepare('PRAGMA foreign_key_check').all().length||!verifyAudit(db,config.auditKey))throw new Error('Backup verification failed');}catch(error){db?.close();db=null;for(const suffix of ['', '-wal', '-shm'])await fs.rm(destination+suffix,{force:true});throw error;}finally{db?.close();}}
