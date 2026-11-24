import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, statSync } from 'node:fs';
import ts from 'typescript';

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
