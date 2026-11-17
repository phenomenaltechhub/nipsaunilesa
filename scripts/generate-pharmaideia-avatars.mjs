// Original, static vector illustrations. No third-party artwork or real faces.
import fs from 'node:fs/promises';
import path from 'node:path';
import { avatars } from '../student-pwa/src/modules/account/avatars.js';
const directory = path.resolve('student-pwa/assets/avatars'); await fs.mkdir(directory, { recursive: true });
const shapes = {
  molecule: '<path d="m30 33 20-10 20 14-4 25-26 12-17-20 7-21m20-10-4 28 20 11M23 54l23-3"/><g fill="#116d72"><circle cx="30" cy="33" r="7"/><circle cx="50" cy="23" r="7"/><circle cx="70" cy="37" r="7"/><circle cx="66" cy="62" r="7"/><circle cx="40" cy="74" r="7"/><circle cx="23" cy="54" r="7"/></g>',
  capsule: '<g transform="rotate(35 48 48)"><rect x="33" y="17" width="30" height="62" rx="15" fill="#fff"/><path d="M33 48h30v16a15 15 0 0 1-30 0z" fill="#42a58a"/><path d="M33 48h30m-22-19v10"/></g>',
  tablets: '<circle cx="38" cy="40" r="20" fill="#fff"/><path d="m24 54 28-28"/><circle cx="62" cy="63" r="17" fill="#8ed4bf"/><path d="m50 75 24-24"/>',
  flask: '<path d="M36 20h24m-19 0v24L24 70c-3 5 0 9 6 9h36c6 0 9-4 6-9L55 44V20" fill="#fff"/><path d="M34 58h28l10 16H24Z" fill="#8ed4bf"/><circle cx="45" cy="65" r="2"/><circle cx="54" cy="70" r="2"/>',
  beaker: '<path d="M27 22h45m-39 0v53h36V22" fill="#fff"/><path d="M33 51c12-6 23 5 36 0v24H33Z" fill="#8ed4bf"/><path d="M33 34h10m-10 9h7m-7 20h10"/>',
  microscope: '<path d="m43 19 19 11-16 28-19-11Z" fill="#fff"/><path d="m37 54-4 8m17-32 5-9m-31 43h31m-7-12c21 0 25 24 5 24H28m-5 3h51M61 40c20 9 14 35-4 36"/><circle cx="63" cy="52" r="5" fill="#8ed4bf"/>',
  book: '<path d="M48 31c-10-10-23-8-29-4v44c12-4 22-1 29 6 7-7 17-10 29-6V27c-6-4-19-6-29 4Z" fill="#fff"/><path d="M48 31v46M27 37c6-2 10 0 14 3m-14 9c6-2 10 0 14 3m14-12c4-3 8-5 14-3m-14 15c4-3 8-5 14-3"/>',
  books: '<path d="M26 23h49v15H26a7 7 0 0 1 0-15Z" fill="#8ed4bf"/><path d="M32 42h42a7 7 0 0 1 0 15H32Z" fill="#fff"/><path d="M26 61h49v15H26a7 7 0 0 1 0-15Z" fill="#8ed4bf"/><path d="M31 30h36m-27 20h29m-38 19h36"/>',
  atom: '<ellipse cx="48" cy="48" rx="31" ry="12"/><ellipse cx="48" cy="48" rx="31" ry="12" transform="rotate(60 48 48)"/><ellipse cx="48" cy="48" rx="31" ry="12" transform="rotate(120 48 48)"/><circle cx="48" cy="48" r="6" fill="#116d72"/><circle cx="19" cy="44" r="4" fill="#8ed4bf"/>',
  dna: '<path d="M32 18c0 25 32 35 32 60M64 18c0 25-32 35-32 60M34 25h28M40 37h16M40 59h16M34 71h28"/><circle cx="32" cy="18" r="3" fill="#116d72"/><circle cx="64" cy="78" r="3" fill="#116d72"/>',
  stethoscope: '<path d="M27 20v23a15 15 0 0 0 30 0V20M42 58v7a15 15 0 0 0 30 0V52"/><path d="M23 19h8m22 0h8"/><circle cx="72" cy="43" r="9" fill="#fff"/><circle cx="72" cy="43" r="3" fill="#8ed4bf"/>',
  heart: '<path d="M48 76 23 51C3 29 31 13 48 34 65 13 93 29 73 51Z" fill="#8ed4bf"/><path d="M19 49h18l7-13 8 25 7-12h18" stroke="#fff" stroke-width="4"/>',
  shield: '<path d="M48 17 73 28v22c0 15-13 25-25 31-12-6-25-16-25-31V28Z" fill="#fff"/><path d="M48 34v28M34 48h28" stroke="#116d72" stroke-width="7"/>',
  graduate: '<path d="m15 37 33-15 33 15-33 15Z" fill="#8ed4bf"/><path d="M28 45v20c13 10 27 10 40 0V45M80 38v25m0 0-4 9h8Z"/>',
  compound: '<path d="m48 21 24 14v28L48 77 24 63V35Zm0 8 16 10m0 20L48 69m-16-10V39"/><circle cx="48" cy="21" r="4" fill="#116d72"/><circle cx="72" cy="63" r="4" fill="#116d72"/><circle cx="24" cy="63" r="4" fill="#116d72"/>',
  pipette: '<path d="m59 20 17 17-9 9-17-17Z" fill="#8ed4bf"/><path d="M54 33 25 62l-4 14 14-4 29-29M29 61l8 8m14-23 7 7"/><path d="M70 64c-9 11-7 15 0 15s9-4 0-15Z" fill="#8ed4bf"/>',
};
function clinician(index) {
  const skin = index < 2 ? '#c98a64' : '#8b593f'; const hair = index % 2 ? '#163f37' : '#233c3b';
  return `${index % 2 ? `<path d="M29 49V31c0-24 38-24 38 0v23Z" fill="${hair}"/>` : ''}<path d="M20 82V70c0-15 56-15 56 0v12" fill="#fff"/><path d="m38 58 10 12 10-12" fill="#8ed4bf"/><ellipse cx="48" cy="37" rx="16" ry="20" fill="${skin}"/><path d="M31 31c-2-23 38-24 34 3-13-3-20-8-25-14-1 9-6 12-9 11Z" fill="${hair}"/><path d="M42 40h1m10 0h1m-11 9c3 2 7 2 10 0"/><path d="M36 62v9a5 5 0 0 0 10 0v-6m14-3v9"/><circle cx="60" cy="74" r="4" fill="#8ed4bf"/>`;
}
const definitions = []; const groups = []; const css = [];
for (const [index, avatar] of avatars.entries()) {
  const artwork = avatar.id.startsWith('clinician-') ? clinician(index - 16) : shapes[avatar.id];
  if (!artwork) throw new Error('Missing original avatar artwork');
  const content = `<circle cx="48" cy="48" r="46" fill="${index % 2 ? '#e3f1f2' : '#e4f3e9'}"/><g fill="none" stroke="#075b4b" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${artwork}</g>`;
  const title = avatar.name.replaceAll('&', '&amp;');
  await fs.writeFile(path.join(directory, avatar.id + '.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" role="img" aria-labelledby="title"><title id="title">${title}</title>${content}</svg>\n`);
  definitions.push(`<symbol id="${avatar.id}" viewBox="0 0 96 96">${content}</symbol>`);
  groups.push(`<use href="#${avatar.id}" x="${(index % 5) * 96}" y="${Math.floor(index / 5) * 96}" width="96" height="96"/>`);
  css.push(`.avatar-${avatar.id} { background-position: ${(index % 5) * 25}% ${Math.floor(index / 5) * 100 / 3}%; }`);
}
await fs.writeFile(path.join(directory, 'atlas.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 384"><title>PHARMAIDEIA curated academic avatars</title><defs>${definitions.join('')}</defs>${groups.join('')}</svg>\n`);
await fs.writeFile('student-pwa/styles/avatars.css', '/* Generated from original artwork; one public atlas request for 20 choices. */\n.avatar-art { display: inline-block; flex-shrink: 0; width: var(--avatar-size, 54px); height: var(--avatar-size, 54px); background-image: url("../assets/avatars/atlas.svg"); background-size: 500% 400%; }\n' + css.join('\n') + '\n');
console.log('Generated 20 original SVG avatars, a single-request atlas and static position classes.');
