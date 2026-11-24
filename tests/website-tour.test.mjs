import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, statSync } from 'node:fs';
import ts from 'typescript';
import { createHash } from 'node:crypto';

const media = JSON.parse(readFileSync('app/website-tour/media.json'));
const script = JSON.parse(readFileSync('scripts/website-tour/narration.json'));
const source = readFileSync('app/website-tour/content.ts', 'utf8').replace('import media from "./media.json";', `const media = ${JSON.stringify(media)};`);
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 } });
const { tourDestinations, tourPathways, filterTourDestinations } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);

test('Tour discovery filters compose and treat markup/regex as literal text', () => {
  assert.equal(filterTourDestinations(' gPa ').length, 1);
  assert.equal(filterTourDestinations('', 'Academic').length, 2);
  assert.equal(filterTourDestinations('gallery', 'Chapter').length, 0);
  for (const query of ['<img src=x onerror=alert(1)>', '.*', '[']) assert.deepEqual(filterTourDestinations(query), []);
  assert.equal(filterTourDestinations('').length, 11);
});

test('Tour destinations and pathways point to existing public routes and actual images', () => {
  assert.equal(new Set(tourDestinations.map(item => item.id)).size, tourDestinations.length);
  for (const destination of [...tourDestinations, ...tourPathways]) {
    for (const href of [destination.href, destination.secondary?.href].filter(Boolean)) {
      assert.ok(href.startsWith('/') && !href.startsWith('//'));
      const path = href.split('#')[0];
      assert.ok(existsSync(`app${path === '/' ? '' : path}/page.tsx`), `Missing route ${path}`);
    }
    if (destination.image) assert.ok(statSync('public' + destination.image).size > 1000);
  }
});

test('Media timeline covers all authored chapters and transcript exactly', () => {
  assert.equal(media.chapters.length, 9);
  assert.ok(media.durationSeconds >= 180 && media.durationSeconds <= 360);
  assert.equal(media.sourceCommit, script.recordedSourceCommit);
  let end = 0;
  const transcript = readFileSync('public/media/website-tour/transcript.txt', 'utf8');
  media.chapters.forEach((chapter, index) => {
    assert.equal(chapter.start, end);
    assert.ok(chapter.end > chapter.start);
    assert.equal(chapter.id, script.chapters[index].id);
    assert.deepEqual(chapter.paragraphs, script.chapters[index].cues.map(cue => cue.text));
    chapter.paragraphs.forEach(text => assert.ok(transcript.includes(text)));
    end = chapter.end;
  });
  assert.equal(end, media.durationSeconds);
});

test('VTT cues are ordered, nonoverlapping, bounded by measured media and contain every narration cue', () => {
  const vtt = readFileSync('public/media/website-tour/captions.vtt', 'utf8');
  assert.ok(vtt.startsWith('WEBVTT\n'));
  const seconds = value => value.split(':').reduce((sum, part) => sum * 60 + Number(part), 0);
  let end = 0;
  const blocks = vtt.trim().split(/\n\n/).slice(1);
  const texts = [];
  for (const block of blocks) {
    const [timing, ...lines] = block.split('\n');
    const [from, to] = timing.split(' --> ').map(seconds);
    assert.ok(from >= end && to > from && to <= media.durationSeconds);
    texts.push(lines.join(' '));
    end = to;
  }
  assert.deepEqual(texts, script.chapters.flatMap(chapter => chapter.cues.map(cue => cue.text)));
});

test('Tour ships a real bounded-size MP4 and no unsafe remote media dependency', () => {
  for (const asset of [media.src, media.poster, media.captions]) {
    assert.ok(asset.startsWith('/media/website-tour/'));
    assert.ok(statSync('public' + asset).size > 100);
  }
  const mp4 = readFileSync('public' + media.src);
  assert.equal(mp4.toString('ascii', 4, 8), 'ftyp');
  assert.ok(mp4.length < 25 * 1024 * 1024, 'Reassess hosting before shipping a larger movie');
  assert.ok(mp4.indexOf(Buffer.from('moov')) < mp4.indexOf(Buffer.from('mdat')), 'MP4 must support fast-start playback');
});

test('the actual MP4 AudioSpecificConfig declares 48 kHz AAC-LC, not only its metadata', () => {
  const mp4 = readFileSync('public' + media.src);
  function boxes(start = 0, end = mp4.length) {
    const result = [];
    for (let offset = start; offset + 8 <= end;) {
      const size = mp4.readUInt32BE(offset);
      assert.ok(size >= 8 && offset + size <= end, 'Invalid MP4 box');
      result.push({ type: mp4.toString('ascii', offset + 4, offset + 8), payload: offset + 8, end: offset + size });
      offset += size;
    }
    return result;
  }
  function child(parent, type, skip = 0) {
    const box = boxes(parent.payload + skip, parent.end).find(box => box.type === type);
    assert.ok(box, `Missing ${type}`);
    return box;
  }
  const moov = boxes().find(box => box.type === 'moov');
  const track = boxes(moov.payload, moov.end).filter(box => box.type === 'trak').find(track => {
    const handler = child(child(track, 'mdia'), 'hdlr');
    return mp4.toString('ascii', handler.payload + 8, handler.payload + 12) === 'soun';
  });
  const sample = child(child(child(child(child(track, 'mdia'), 'minf'), 'stbl'), 'stsd'), 'mp4a', 8);
  const esds = child(sample, 'esds', 28);
  function descriptor(offset, expected) {
    assert.equal(mp4[offset++], expected);
    let size = 0, byte;
    do { byte = mp4[offset++]; size = size * 128 + (byte & 127); } while (byte & 128);
    assert.ok(offset + size <= esds.end);
    return offset;
  }
  const es = descriptor(esds.payload + 4, 3);
  assert.equal(mp4[es + 2], 0, 'Unexpected ES descriptor flags');
  const decoder = descriptor(es + 3, 4);
  const config = descriptor(decoder + 13, 5);
  const bits = mp4.readUInt16BE(config);
  assert.equal(bits >>> 11, 2, 'AAC object type must be Low Complexity');
  assert.equal((bits >>> 7) & 15, 3, 'AAC sample-rate index must be 48 kHz');
  assert.equal(media.encoding.audioSampleRateHz, 48000);
  assert.equal(media.encoding.audioProfile, 'LC');
});

test('the review media metadata and unchanged timed text match shipped file integrity', () => {
  const metadata = JSON.parse(readFileSync('docs/website-tour-review/media-metadata.json'));
  const digest = path => createHash('sha256').update(readFileSync(path)).digest('hex');
  assert.equal(metadata.encoding.sha256, digest('public' + media.src));
  assert.equal(metadata.encoding.bytes, statSync('public' + media.src).size);
  assert.equal(metadata.captionsSha256, digest('public' + media.captions));
  assert.equal(metadata.transcriptSha256, digest('public/media/website-tour/transcript.txt'));
  assert.deepEqual(metadata.chapters, media.chapters);
  assert.ok(Math.abs(metadata.encoding.durationSeconds - media.durationSeconds) < .05);
});

test('the actual video stream fills all chapter slots without drifting behind captions', () => {
  const mp4 = readFileSync('public' + media.src);
  function children(start, end) {
    const result = [];
    for (let offset = start; offset + 8 <= end;) {
      const size = mp4.readUInt32BE(offset);
      assert.ok(size >= 8 && offset + size <= end);
      result.push({ type: mp4.toString('ascii', offset + 4, offset + 8), payload: offset + 8, end: offset + size });
      offset += size;
    }
    return result;
  }
  const box = (parent, type) => {
    const result = children(parent.payload, parent.end).find(item => item.type === type);
    assert.ok(result, `Missing ${type}`);
    return result;
  };
  const moov = box({ payload: 0, end: mp4.length }, 'moov');
  const track = children(moov.payload, moov.end).filter(item => item.type === 'trak').find(track => {
    const handler = box(box(track, 'mdia'), 'hdlr');
    return mp4.toString('ascii', handler.payload + 8, handler.payload + 12) === 'vide';
  });
  const mdia = box(track, 'mdia'), header = box(mdia, 'mdhd');
  assert.equal(mp4[header.payload], 0, 'Expected the generated version-0 media header');
  const timescale = mp4.readUInt32BE(header.payload + 12);
  const duration = mp4.readUInt32BE(header.payload + 16) / timescale;
  assert.equal(duration, media.durationSeconds);
  const samples = box(box(box(mdia, 'minf'), 'stbl'), 'stsz');
  assert.equal(mp4.readUInt32BE(samples.payload + 8), Math.round(media.durationSeconds * 24));
});
