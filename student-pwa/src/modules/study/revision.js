import { parseCalendarDate } from '../academic/calendar.js';

export const planLimit = 30;
/** Session-memory personal reminders only; not a student/academic record store. */
export function createRevisionPlan() {
  /** @type {{id:number,title:string,dueDate:string,done:boolean}[]} */
  let items = [];
  let nextId = 1;
  return {
    list() { return items.map(item => ({ ...item })); },
    /** @param {string} title @param {string} [dueDate] */
    add(title, dueDate = '') {
      if (typeof title !== 'string' || /[\u0000-\u001f\u007f]/.test(title)) throw new TypeError('Use a single line of plain text.');
      const normalized = title.trim().replace(/\s+/g, ' ');
      if (!normalized || normalized.length > 120) throw new RangeError('Enter a study task of 1–120 characters.');
      if (typeof dueDate !== 'string' || (dueDate && (!parseCalendarDate(dueDate) || dueDate < '2000-01-01' || dueDate > '2200-12-31'))) throw new RangeError('Choose a valid date between 2000 and 2200.');
      if (items.length >= planLimit) throw new RangeError(`Keep your personal plan to ${planLimit} tasks or fewer.`);
      items = [...items, { id: nextId++, title: normalized, dueDate, done: false }];
    },
    /** @param {number} id */
    toggle(id) { items = items.map(item => item.id === id ? { ...item, done: !item.done } : item); },
    /** @param {number} id */
    remove(id) { items = items.filter(item => item.id !== id); },
    clear() { items = []; },
  };
}
