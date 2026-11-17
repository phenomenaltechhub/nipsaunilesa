// Approved Knowledge Nexus Classic STANDARD only. Review masters stay immutable.
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
const directory=path.resolve('student-pwa/assets/brand');
const source=path.resolve('design-review/knowledge-nexus/masters');
await fs.mkdir(directory,{recursive:true});
async function master(name){return (await fs.readFile(path.join(source,`a-classic-${name}.svg`),'utf8')).replace(/<title>[^<]*<\/title>/,'<title>PHARMAIDEIA · NIPSA UNILESA — Knowledge Nexus Classic Standard</title>');}
const normal=await master('emblem-light'),dark=await master('emblem-dark'),app=await master('app-icon');
const body=dark.replace(/^.*?<title>[^<]*<\/title>/s,'').replace(/<\/svg>\s*$/,'');
const maskable=`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><title>PHARMAIDEIA Classic Standard maskable icon</title><rect width="512" height="512" fill="#075443"/><g transform="translate(96 96) scale(${320/240})">${body}</g></svg>\n`;
const files={'symbol.svg':normal,'symbol-dark.svg':dark,'symbol-mono.svg':await master('emblem-mono'),'symbol-mono-light.svg':await master('emblem-white'),'logo-primary.svg':await master('horizontal-light'),'logo-dark.svg':await master('horizontal-dark'),'logo-stacked.svg':await master('stacked-light'),'favicon.svg':app,'app-icon-master.svg':app,'maskable-master.svg':maskable};
for(const [name,data]of Object.entries(files))await fs.writeFile(path.join(directory,name),data);
for(const size of [16,24,32,48,64,192,512])await sharp(Buffer.from(app)).resize(size,size).png().toFile(path.join(directory,`icon-${size}.png`));
for(const size of [192,512])await sharp(Buffer.from(maskable)).resize(size,size).png().toFile(path.join(directory,`maskable-${size}.png`));
await sharp(Buffer.from(app)).resize(32,32).png().toFile(path.join(directory,'favicon-32.png'));
await sharp(Buffer.from(app)).resize(180,180).png().toFile(path.join(directory,'apple-touch-icon.png'));
console.log('Generated approved Classic Standard branding; no optical substitution. Original masters/review assets preserved.');
