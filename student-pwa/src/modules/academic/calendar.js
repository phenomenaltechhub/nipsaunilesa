/** Local calendar math only. These dates are not an institutional timetable.
 * @param {string} value
 */
export function parseCalendarDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  if (year < 1900 || year > 2300) return null;
  const date = new Date(year, month - 1, day, 12);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null;
}

/** @param {Date} date */
export function calendarDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/** @param {string} value @param {number} offset */
export function shiftDate(value, offset) {
  const date = parseCalendarDate(value);
  if (!date || !Number.isInteger(offset) || Math.abs(offset) > 3660) throw new RangeError('Invalid calendar date or offset.');
  date.setDate(date.getDate() + offset);
  const result = calendarDate(date);
  if (!parseCalendarDate(result)) throw new RangeError('Date is outside the supported range.');
  return result;
}

/** @param {string} value */
export function weekDates(value) {
  const date = parseCalendarDate(value);
  if (!date) throw new RangeError('Invalid calendar date.');
  const monday = shiftDate(value, -((date.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, index) => shiftDate(monday, index));
}

/** @param {string} value @param {Intl.DateTimeFormatOptions} [options] */
export function formatCalendarDate(value, options = { day: 'numeric', month: 'short' }) {
  const date = parseCalendarDate(value);
  if (!date) throw new RangeError('Invalid calendar date.');
  return new Intl.DateTimeFormat('en-GB', options).format(date);
}
