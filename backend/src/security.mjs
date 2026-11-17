import {randomBytes,scrypt as callbackScrypt,timingSafeEqual,createHmac,createCipheriv,createDecipheriv}from'node:crypto';
import {promisify}from'node:util';
const scrypt=promisify(callbackScrypt);
export const randomToken=()=>randomBytes(32).toString('base64url');
export const digest=(key,value)=>createHmac('sha256',key).update(value).digest('hex');
export function equal(a,b){const x=Buffer.from(String(a)),y=Buffer.from(String(b));return x.length===y.length&&timingSafeEqual(x,y);}
export function passwordPolicy(value){if(typeof value!=='string'||!value.isWellFormed()||value.length>256)throw new Error('PASSWORD_POLICY');const password=value.normalize('NFC'),length=Array.from(password).length;if(length<15||length>128||Buffer.byteLength(password)>512||password.includes('\0')||!password.trim()||['passwordpassword','123456789012345','qwertyuiopasdfgh','letmeinletmeinletmein'].includes(password.toLowerCase()))throw new Error('PASSWORD_POLICY');return password;}
export async function hashPassword(value){const password=passwordPolicy(value),salt=randomBytes(16);const key=await scrypt(password,salt,64,{N:131072,r:8,p:1,maxmem:256*1024*1024});return `scrypt$131072$8$1$${salt.toString('base64url')}$${key.toString('base64url')}`;}
export async function verifyPassword(value,encoded){if(typeof value!=='string'||value.length>256||!value.isWellFormed()||Array.from(value.normalize('NFC')).length>128)return false;const parts=String(encoded).split('$');if(parts.length!==6||parts.slice(0,4).join('$')!=='scrypt$131072$8$1')return false;const salt=Buffer.from(parts[4],'base64url'),expected=Buffer.from(parts[5],'base64url');if(salt.length!==16||expected.length!==64)return false;const actual=await scrypt(value.normalize('NFC'),salt,64,{N:131072,r:8,p:1,maxmem:256*1024*1024});return timingSafeEqual(actual,expected);}
export function seal(key,value){const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',key,iv);const ciphertext=Buffer.concat([cipher.update(value,'utf8'),cipher.final()]);return [iv,cipher.getAuthTag(),ciphertext].map(b=>b.toString('base64url')).join('.');}
export function unseal(key,value){const [iv,tag,data]=value.split('.').map(v=>Buffer.from(v,'base64url'));const cipher=createDecipheriv('aes-256-gcm',key,iv);cipher.setAuthTag(tag);return Buffer.concat([cipher.update(data),cipher.final()]).toString('utf8');}
const alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
export function base32(bytes){let bits=0,value=0,out='';for(const b of bytes){value=(value<<8)|b;bits+=8;while(bits>=5){bits-=5;out+=alphabet[(value>>>bits)&31];}}if(bits)out+=alphabet[(value<<(5-bits))&31];return out;}
export function decode32(value){let bits=0,n=0;const out=[];for(const c of value){const p=alphabet.indexOf(c);if(p<0)throw new Error('INVALID_MFA_SECRET');n=(n<<5)|p;bits+=5;if(bits>=8){bits-=8;out.push((n>>>bits)&255);}}return Buffer.from(out);}
// RFC 6238 HMAC-SHA1 TOTP. Verified against published independent vectors.
export function totp(secret,time=Date.now(),digits=6){const step=Math.floor(time/30000),counter=Buffer.alloc(8);counter.writeBigUInt64BE(BigInt(step));const h=createHmac('sha1',decode32(secret)).update(counter).digest(),offset=h.at(-1)&15;return String((h.readUInt32BE(offset)&0x7fffffff)%10**digits).padStart(digits,'0');}
export function verifyTotp(secret,code,time,lastStep=-1){if(typeof code!=='string'||!/^\d{6}$/.test(code))return null;for(const offset of [-1,0,1]){const when=time+offset*30000,step=Math.floor(when/30000);if(step>lastStep&&equal(totp(secret,when),code))return step;}return null;}
export const restrictionSeconds=Object.freeze([0,0,0,300,900,1800,3600,86400]);
export function nextRestriction(failures){return restrictionSeconds[Math.min(failures,7)];}
