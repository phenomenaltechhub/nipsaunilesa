import { element, icon, link } from './dom.js';

/** @param {string} active */
export function academicNavigation(active) {
  const nav = element('nav', 'workspace-nav');
  nav.setAttribute('aria-label', 'Academic workspace');
  for (const [id, title] of [['courses', 'Courses'], ['timetable', 'Timetable'], ['planner', 'Study planner'], ['glossary', 'Glossary']]) {
    const item = link(`#/${id}`, title);
    if (active === id) item.setAttribute('aria-current', 'page');
    nav.append(item);
  }
  return nav;
}

/** @param {string} title @param {string} [status] */
export function sectionHeading(title, status = '') {
  const header = element('div', 'card-heading');
  header.append(element('h2', '', title));
  if (status) header.append(element('span', 'card-tag', status));
  return header;
}

/** @param {string} title @param {string} detail */
export function availabilityNote(title, detail) {
  const aside = element('aside', 'availability-note');
  const copy = element('div');
  copy.append(element('strong', '', title), element('p', '', detail));
  aside.append(icon('lock'), copy);
  return aside;
}

/** Native buttons with roving focus and WAI-ARIA tabs keyboard behavior.
 * @param {string} id @param {string} label
 * @param {{id:string,title:string,render:()=>HTMLElement}[]} entries
 */
export function tabs(id, label, entries) {
  const root = element('div');
  const list = element('div', 'tab-list'); list.setAttribute('role', 'tablist'); list.setAttribute('aria-label', label);
  const panel = element('div', 'tab-panel'); panel.id = `${id}-panel`; panel.setAttribute('role', 'tabpanel'); panel.tabIndex = 0;
  const buttons = entries.map((entry, index) => {
    const button = element('button', '', entry.title);
    button.type = 'button'; button.id = `${id}-${entry.id}`;
    button.setAttribute('role', 'tab'); button.setAttribute('aria-controls', panel.id);
    button.addEventListener('click', () => select(index));
    button.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % entries.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + entries.length) % entries.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = entries.length - 1;
      if (next !== undefined) { event.preventDefault(); select(next); buttons[next].focus(); }
    });
    return button;
  });
  /** @param {number} selected */
  function select(selected) {
    buttons.forEach((button, index) => { button.setAttribute('aria-selected', String(index === selected)); button.tabIndex = index === selected ? 0 : -1; });
    panel.setAttribute('aria-labelledby', buttons[selected].id);
    panel.replaceChildren(entries[selected].render());
  }
  list.append(...buttons); root.append(list, panel); select(0);
  return root;
}
