import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
const root=path.resolve('student-pwa/assets/brand');const artifact='/workspace/artifacts/pharmaideia-m4';await fs.mkdir(artifact,{recursive:true});
const pieces=[];let x=30;
for(const size of [16,24,32,48,64,192,512]){const input=await fs.readFile(path.join(root,`icon-${size}.png`));const m=await sharp(input).metadata();assert.equal(m.width,size);assert.equal(m.height,size);pieces.push({input,left:x,top:90});x+=size+24;}
const width=x+10;const caption=Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="680"><rect width="${width}" height="680" fill="#f4f8f6"/><text x="30" y="42" font-family="sans-serif" font-size="24" fill="#073d32">Approved Classic Standard · actual 16 / 24 / 32 / 48 / 64 / 192 / 512px icons</text><text x="30" y="650" font-family="sans-serif" font-size="20" fill="#075443">No optical substitution. Fine molecular details soften at the smallest sizes.</text></svg>`);
await sharp(caption).composite(pieces).png().toFile(path.join(artifact,'approved-standard-icon-sizes.png'));
for(const size of [192,512]){const {data,info}=await sharp(path.join(root,`maskable-${size}.png`)).ensureAlpha().raw().toBuffer({resolveWithObject:true});for(let y=0;y<size;y++)for(let x=0;x<size;x++){const i=(y*size+x)*info.channels;assert.equal(data[i+3],255,'Maskable canvas is fully opaque');if(Math.abs(data[i]-7)+Math.abs(data[i+1]-84)+Math.abs(data[i+2]-67)>40)assert.ok(Math.hypot(x+.5-size/2,y+.5-size/2)<=size*.4,'Standard artwork remains in maskable safe circle');}}
console.log('Approved Standard icons: seven dimensions/render/decode checks; both opaque maskable icons retain artwork within the safe circle.');
