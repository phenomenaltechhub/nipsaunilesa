import {element,icon} from '../student-pwa/src/components/dom.js';
/** @param {string} title @param {string} detail */
export function availabilityNote(title, detail) {
  const aside = element('aside', 'availability-note');
  const copy = element('div');
  copy.append(element('strong', '', title), element('p', '', detail));
  aside.append(icon('lock'), copy);
  return aside;
}
