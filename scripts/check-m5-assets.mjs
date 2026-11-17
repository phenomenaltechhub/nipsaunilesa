import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import sharp from 'sharp';
import {publicAssets} from '../student-pwa/src/pwa/cache-policy.js';
const root='student-pwa',provenance=JSON.parse(await fs.readFile(path.join(root,'assets/hero/provenance.json'),'utf8'));
assert.equal(provenance.institutionalPhoto,false);assert.equal(provenance.assets.length,8);
for(const asset of provenance.assets){assert.match(asset.name,/^study-(desktop|mobile)-\d+\.(avif|webp)$/);const file=path.join(root,'assets/hero',asset.name),metadata=await sharp(file).metadata();assert.equal(metadata.width,asset.width);assert.equal(metadata.height,asset.height);assert.equal((await fs.stat(file)).size,asset.bytes);assert.ok(!metadata.exif&&!metadata.xmp);assert.ok(asset.bytes<33000);}
assert.ok(!publicAssets.some(p=>p.startsWith('./media/')||p.startsWith('./assets/hero/')),'Optional presentation assets are not mandatory shell downloads');
const video=JSON.parse(execFileSync('/usr/bin/ffprobe',['-v','error','-show_streams','-show_format','-of','json',path.join(root,'media/study-tools.mp4')],{encoding:'utf8'}));
assert.equal(video.streams.filter(s=>s.codec_type==='video').length,1);assert.equal(video.streams.filter(s=>s.codec_type==='audio').length,0);assert.equal(video.streams[0].codec_name,'h264');assert.equal(video.streams[0].width,390);assert.equal(video.streams[0].height,844);assert.ok(Number(video.format.duration)>40&&Number(video.format.duration)<60);assert.ok(Number(video.format.size)<500000);
const captions=await fs.readFile(path.join(root,'media/study-tools.en.vtt'),'utf8');assert.ok(captions.startsWith('WEBVTT'));assert.equal((captions.match(/ --> /g)||[]).length,10);assert.ok((await fs.readFile(path.join(root,'media/study-tools-transcript.txt'),'utf8')).includes('actual development application'));
const poster=await sharp(path.join(root,'media/walkthrough-poster.webp')).metadata();assert.equal(poster.width,390);assert.equal(poster.height,844);
console.log(`Verified eight safe responsive hero assets, silent H.264 walkthrough (${video.format.size} bytes, ${Number(video.format.duration).toFixed(1)}s), 10 caption cues, transcript and poster. No optional media in mandatory shell cache.`);
