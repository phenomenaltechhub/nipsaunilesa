// Original PHARMAIDEIA path lettering reused from the M3 identity studies.
// No external typeface, raster or font outlines are embedded.
const glyphs = {
  P: [44, 'M0 64V0H25C38 0 44 8 44 21C44 34 37 42 24 42H10V64ZM10 10V32H24C31 32 34 28 34 21C34 14 31 10 24 10Z'],
  H: [44, 'M0 0H10V26H34V0H44V64H34V36H10V64H0Z'],
  A: [48, 'M0 64L18 0H30L48 64H37L33 48H15L11 64ZM18 38H30L24 14Z'],
  R: [46, 'M0 64V0H25C38 0 44 8 44 21C44 31 39 38 31 41L46 64H34L20 42H10V64ZM10 10V32H24C31 32 34 28 34 21C34 14 31 10 24 10Z'],
  M: [54, 'M0 64V0H11L27 32L43 0H54V64H44V20L30 47H24L10 20V64Z'],
  I: [10, 'M0 0H10V64H0Z'],
  D: [46, 'M0 0H20C38 0 46 12 46 32C46 52 38 64 20 64H0ZM10 10V54H20C31 54 36 46 36 32C36 18 31 10 20 10Z'],
  E: [40, 'M0 0H40V10H10V26H35V36H10V54H40V64H0Z'],
  N: [46, 'M0 64V0H10L36 44V0H46V64H36L10 20V64Z'],
  S: [44, 'M42 3V14C34 10 29 9 23 9C14 9 10 12 10 18C10 23 15 25 24 28C38 32 44 38 44 47C44 59 36 65 22 65C13 65 6 63 0 60V49C8 54 14 56 22 56C30 56 34 53 34 48C34 43 29 40 20 37C6 33 0 27 0 18C0 6 9 -1 23 -1C30 -1 36 0 42 3Z'],
  U: [44, 'M0 0H10V41C10 51 14 55 22 55C30 55 34 51 34 41V0H44V42C44 58 36 65 22 65C8 65 0 58 0 42Z'],
  L: [38, 'M0 0H10V54H38V64H0Z'],
};
export function lettering(value, x, y, width, color, spacing = 7) {
  const count = [...value].reduce((n, char) => n + (char === ' ' ? 24 : glyphs[char][0] + spacing), -spacing);
  let at = 0; let body = '';
  for (const char of value) { if (char === ' ') { at += 24; continue; } const [w, d] = glyphs[char]; body += `<path transform="translate(${at} 0)" d="${d}" fill-rule="evenodd"/>`; at += w + spacing; }
  return `<g transform="translate(${x} ${y}) scale(${width / count})" fill="${color}">${body}</g>`;
}
