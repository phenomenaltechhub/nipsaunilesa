import { element, emptyState, link, pageHeading } from '../../components/dom.js';
import { academicNavigation, availabilityNote, sectionHeading } from '../../components/academic.js';
import { calendarDate, formatCalendarDate, shiftDate, weekDates } from './calendar.js';

export function timetableView() {
  const root = element('div');
  root.append(pageHeading('YOUR ACADEMIC WORKSPACE', 'A clearer view of your week', 'Browse dates and switch views. Verified classes, course-linked deadlines and examination notices are not connected yet.'), academicNavigation('timetable'));
  root.append(availabilityNote('No verified timetable is available.', 'Dates below use your device calendar. They do not show an official academic session, assigned level or confirmed classes.'));
  const card = element('section', 'card');
  card.append(sectionHeading('Timetable', 'Academic data unavailable'));
  const toolbar = element('div', 'calendar-toolbar');
  const controls = element('div', 'calendar-controls');
  const previous = element('button', 'button subtle', '←'); previous.setAttribute('aria-label', 'Previous week');
  const next = element('button', 'button subtle', '→'); next.setAttribute('aria-label', 'Next week');
  const today = element('button', 'button subtle', 'This week');
  const title = element('h3'); title.id = 'week-title';
  const viewLabel = element('label', 'calendar-view-label', 'View');
  const view = element('select'); view.id = 'calendar-view'; viewLabel.htmlFor = view.id;
  view.add(new Option('Week', 'week')); view.add(new Option('Agenda', 'agenda'));
  view.value = window.matchMedia('(max-width: 760px)').matches ? 'agenda' : 'week';
  const viewControl = element('div'); viewControl.append(viewLabel, view);
  controls.append(previous, today, next); toolbar.append(controls, title, viewControl);
  const content = element('div'); content.setAttribute('aria-labelledby', title.id);
  const status = element('p', 'search-status'); status.setAttribute('role', 'status');
  let selected = calendarDate(new Date());
  /** @param {number} offset */
  function canShift(offset) { try { weekDates(shiftDate(selected, offset)); return true; } catch { return false; } }
  function render() {
    const days = weekDates(selected);
    previous.disabled = !canShift(-7); next.disabled = !canShift(7);
    title.textContent = `${formatCalendarDate(days[0])} – ${formatCalendarDate(days[6], { day: 'numeric', month: 'short', year: 'numeric' })}`;
    const dates = element('ol', view.value === 'week' ? 'calendar-week' : 'calendar-agenda');
    for (const date of days) {
      const item = element('li', date === calendarDate(new Date()) ? 'calendar-day is-today' : 'calendar-day');
      const time = element('time', '', formatCalendarDate(date, { weekday: 'short', day: 'numeric', month: 'short' })); time.dateTime = date;
      item.append(time, element('span', '', 'Not connected'));
      dates.append(item);
    }
    content.replaceChildren(dates);
    status.textContent = `${view.value === 'week' ? 'Week' : 'Agenda'} view. ${title.textContent}. No institutional schedule has been loaded.`;
  }
  previous.addEventListener('click', () => { selected = shiftDate(selected, -7); render(); });
  next.addEventListener('click', () => { selected = shiftDate(selected, 7); render(); });
  today.addEventListener('click', () => { selected = calendarDate(new Date()); render(); });
  view.addEventListener('change', render);
  card.append(toolbar, content, status, emptyState('Classes need verified information', 'Authorised representatives will maintain schedules for their assigned level. Personal revision tasks are separate from official departmental deadlines.', 'timetable'), link('#/planner', 'Open your personal study planner →', 'button subtle'));
  root.append(card); render();
  return root;
}
