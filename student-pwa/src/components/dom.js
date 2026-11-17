/** @template {keyof HTMLElementTagNameMap} K @param {K} tag @param {string} [className] @param {string} [text] @returns {HTMLElementTagNameMap[K]} */
export function element(tag, className = '', text = '') {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

/** @param {string} href @param {string} text @param {string} [className] */
export function link(href, text, className = '') {
  const node = document.createElement('a');
  node.href = href;
  node.textContent = text;
  node.className = className;
  return node;
}

const paths = {
  home: 'M3 10 12 3l9 7v11h-6v-7H9v7H3Z',
  courses: 'M12 6v15M3 4c4-1 7 0 9 2 2-2 5-3 9-2v15c-4-1-7 0-9 2-2-2-5-3-9-2Z',
  planner: 'M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2Zm3 10h3m-3 4h6',
  glossary: 'M4 4h14a2 2 0 0 1 2 2v15H6a2 2 0 0 1 0-4h14M4 4v15M9 8h6m-6 4h4',
  notifications: 'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM9 21h6',
  community: 'M21 11a8 8 0 0 1-8 8H6l-4 3V11a9 9 0 0 1 19 0ZM7 10h10m-10 4h6',
  profile: 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM4 21v-2a8 8 0 0 1 16 0v2Z',
  lock: 'M7 10V7a5 5 0 0 1 10 0v3M5 10h14v11H5Zm7 4v3',
  more: 'M5 12h.01M12 12h.01M19 12h.01',
};

/** @param {string} name */
export function icon(name) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  for (const [key, value] of Object.entries({ viewBox: '0 0 24 24', width: '20', height: '20', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.7', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true' })) svg.setAttribute(key, value);
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', paths[/** @type {keyof typeof paths} */ (name)] ?? paths.courses);
  svg.append(path);
  return svg;
}

/** @param {string} title @param {string} copy @param {string} [symbol] */
export function emptyState(title, copy, symbol = 'courses') {
  const section = element('div', 'empty-state');
  const well = element('span', 'icon-well');
  well.append(icon(symbol));
  section.append(well, element('h3', '', title), element('p', '', copy));
  return section;
}

/** @param {string} eyebrow @param {string} title @param {string} description */
export function pageHeading(eyebrow, title, description) {
  const heading = element('header', 'page-heading');
  const h1 = element('h1', '', title);
  h1.id = 'page-title';
  heading.append(element('span', 'eyebrow', eyebrow), h1, element('p', '', description));
  return heading;
}
