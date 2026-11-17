// Original editable geometry inspired by the owner's Knowledge Nexus reference.
// All three refinements share a 240-unit construction and central cap/bond/spine.
export const nexusOptions = Object.freeze([
  { id: 'a-classic', name: 'Classic', number: '01', summary: 'Flowing pages, a molecular spine and an integrated scholar cap.' },
  { id: 'b-institutional', name: 'Institutional', number: '02', summary: 'Shared cap-and-cover rails give the Nexus an insignia-like structure.' },
  { id: 'c-essential', name: 'Essential', number: '03', summary: 'Fewer page bands and wider apertures strengthen the small icon.' },
]);
export const nexusColors = Object.freeze({ emerald: '#075443', teal: '#117c79', mint: '#8ee3c2', ink: '#073d32', paper: '#f2f7f4', muted: '#4d6b62' });
export const nexusModes = Object.freeze(['light', 'dark', 'mono', 'white']);
/** All counters are genuine transparency. No colour-matched white cutouts. */
export function nexusSymbol(option, mode = 'light', optical = false) {
  if (!nexusOptions.some(item => item.id === option) || !nexusModes.includes(mode)) throw new RangeError('Unknown identity review option or colour mode.');
  const main = mode === 'light' ? nexusColors.emerald : mode === 'mono' ? nexusColors.ink : '#fff';
  const accent = mode === 'light' ? nexusColors.teal : mode === 'dark' ? nexusColors.mint : main;
  const institutional = option === 'b-institutional'; const simple = optical || option === 'c-essential';
  const path = (d, fill = main) => `<path d="${d}" fill="${fill}"/>`;
  const reflect = body => body + `<g transform="translate(240 0) scale(-1 1)">${body}</g>`;
  // Board and band meet the molecular vertex at the same optical axis. The
  // plate is a mortarboard chevron, not a detached hat pasted over a book.
  const board = path(institutional ? 'M120 16L220 58L200 70L120 38L40 70L20 58Z' : simple ? 'M120 16L216 56L192 68L120 40L48 68L24 56Z' : 'M120 16L216 56L192 66L120 38L48 66L24 56Z');
  const band = path('M64 76L120 54L176 76V100L154 110L120 92L86 110L64 100Z');
  const cover = path(institutional
    ? 'M20 58L36 67.6V190C68 188 96 200 120 220C144 200 172 188 204 190V67.6L220 58V214C180 204 152 214 120 236C88 214 60 204 20 214Z'
    : 'M16 116H32V192C64 190 94 198 120 220C146 198 176 190 208 192V116H224V216C184 206 152 212 120 236C88 212 56 206 16 216Z');
  const upperPage = path('M40 104C60 106 76 112 90 124V142C76 128 60 122 40 122Z');
  const lowerPages = simple
    ? path('M40 116C60 118 76 124 90 138V148C100 160 108 172 112 182V202C92 178 70 158 40 156Z')
    : path('M40 140C72 142 96 158 112 180V196C92 170 70 158 40 158ZM40 170C72 172 96 188 112 204V216C92 196 70 184 40 184Z');
  const bondWidth = simple ? 12 : 8;
  const bonds = `<path d="M120 94L150 112V144L120 162L90 144V112ZM120 162V222" fill="none" stroke="${accent}" stroke-width="${bondWidth}" stroke-linejoin="round"/>`;
  const nodes = [[120,94],[120,162],[120,222]].map(([x,y]) => `<circle cx="${x}" cy="${y}" r="${simple ? 9 : 7}" fill="${accent}"/>`).join('');
  // Tassel at normal sizes only: micro variant deliberately suppresses it.
  const tassel = simple ? '' : `<path d="M192 66V98" fill="none" stroke="${main}" stroke-width="6"/><circle cx="192" cy="103" r="6" fill="${main}"/>`;
  // Institutional rails start at the cap corners and finish as the book cover,
  // so the authority comes from redesigned shared geometry, not a nested frame.
  return `<g transform="translate(0 -6)">${cover + reflect((simple ? '' : upperPage) + lowerPages) + board + band + bonds + nodes + tassel}</g>`;
}
export function nexusMark(option, x, y, size, mode = 'light', optical = false) {
  return `<g transform="translate(${x} ${y}) scale(${size / 240})">${nexusSymbol(option,mode,optical)}</g>`;
}
export function nexusIcon(option, size = 512, optical = size <= 24) {
  return `<rect width="${size}" height="${size}" rx="${size*.23}" fill="${nexusColors.emerald}"/>` + nexusMark(option,size*.09,size*.09,size*.82,'dark',optical);
}
export function nexusSvg(body, width, height, title = 'PHARMAIDEIA Knowledge Nexus — candidate for review') {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img"><title>${title}</title>${body}</svg>`;
}
