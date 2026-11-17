import fs from'node:fs/promises';
import path from'node:path';
import sharp from'sharp';
const input=path.resolve('design-review/m5/source/fictional-study-reference.jpg'),output=path.resolve('student-pwa/assets/hero');await fs.mkdir(output,{recursive:true});
const manifest=[];
for(const [layout,sizes,crop]of [['desktop',[960,1280],{left:0,top:0,width:1280,height:500}],['mobile',[480,720],{left:410,top:0,width:870,height:660}]])for(const width of sizes){const height=Math.round(width/(layout==='desktop'?3:1.6));for(const format of ['avif','webp']){const name=`study-${layout}-${width}.${format}`;let pipeline=sharp(input).extract(crop).resize(width,height,{fit:'cover',position:'north'});pipeline=format==='avif'?pipeline.avif({quality:43,effort:5}):pipeline.webp({quality:65,effort:5});await pipeline.toFile(path.join(output,name));manifest.push({name,width,height,bytes:(await fs.stat(path.join(output,name))).size});}}
await fs.writeFile(path.join(output,'provenance.json'),JSON.stringify({source:'Owner-supplied fictional-student illustration, 17 November 2026',institutionalPhoto:false,notes:'No real University of Ilesa students or official photo session are identified. Differently cropped derivatives are optional presentation assets; the offline shell has a dark fallback.',assets:manifest},null,2)+'\n');console.log(manifest);
