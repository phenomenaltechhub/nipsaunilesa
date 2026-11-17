import path from'node:path';
import {startBackend}from'./src/http.mjs';
const key=name=>{const value=process.env[name];if(!value||!/^[a-f0-9]{64}$/i.test(value))throw new Error(`${name} must be a private 32-byte hex key.`);return Buffer.from(value,'hex');};
const app=await startBackend({mode:process.env.PHARMAIDEIA_MODE,database:path.resolve(process.env.PHARMAIDEIA_DATABASE??'/tmp/pharmaideia-private/accounts.sqlite'),sessionKey:key('PHARMAIDEIA_SESSION_KEY'),encryptionKey:key('PHARMAIDEIA_ENCRYPTION_KEY'),auditKey:key('PHARMAIDEIA_AUDIT_KEY')},{port:Number(process.env.PHARMAIDEIA_PORT??4175),logger:event=>process.stderr.write(JSON.stringify(event)+'\n')});
process.stdout.write('Controlled backend running on loopback only. No real account or public activation is enabled.\n');
for(const event of ['SIGINT','SIGTERM'])process.once(event,async()=>{await app.close();process.exit(0);});
