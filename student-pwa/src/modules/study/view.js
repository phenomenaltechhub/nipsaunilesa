import { element, pageHeading } from '../../components/dom.js';
import { createFocus, durations, formatTime, pauseFocus, remainingTime, startFocus } from './focus.js';

export function plannerView() {
  const root = element('div');
  root.append(pageHeading('A LITTLE STRUCTURE GOES A LONG WAY', 'Make time for learning', 'Start with one focused session. Academic schedules and revision plans will connect once verified course information and secure student access are available.'));
  const layout = element('div', 'focus-layout');
  const card = element('section', 'card focus-card');
  card.append(element('span', 'local-label', 'WORKING LOCAL TOOL · NOT AN ACADEMIC RECORD'));
  const title = element('h2', 'focus-title', 'Focus session');
  const label = element('label', 'field-label', 'Session length'); label.htmlFor = 'focus-duration';
  const select = document.createElement('select'); select.id = label.htmlFor;
  for (const minutes of durations) select.add(new Option(`${minutes} minutes`, String(minutes), minutes === 25, minutes === 25));
  let state = createFocus();
  const timer = element('div', 'timer', formatTime(state.remaining)); timer.setAttribute('aria-label', 'Time remaining'); timer.setAttribute('role', 'timer');
  const status = element('p', 'muted', 'Ready when you are.'); status.setAttribute('role', 'status');
  const controls = element('div', 'button-row');
  const toggle = document.createElement('button'); toggle.className = 'button'; toggle.textContent = 'Start session';
  const reset = document.createElement('button'); reset.className = 'button subtle'; reset.textContent = 'Reset timer';
  function update() {
    const remaining = remainingTime(state, Date.now());
    timer.textContent = formatTime(remaining);
    if (state.deadline !== null && remaining === 0) {
      state = pauseFocus(state, Date.now()); status.textContent = 'Session finished. Take a moment to pause.'; toggle.textContent = 'Start session'; toggle.disabled = true; select.disabled = false;
    }
  }
  toggle.addEventListener('click', () => {
    if (state.deadline === null) { state = startFocus(state, Date.now()); status.textContent = 'Focus session in progress.'; toggle.textContent = 'Pause session'; }
    else { state = pauseFocus(state, Date.now()); status.textContent = 'Session paused.'; toggle.textContent = 'Resume session'; }
    select.disabled = state.deadline !== null;
    update();
  });
  function resetTimer() { state = createFocus(Number(select.value)); toggle.textContent = 'Start session'; toggle.disabled = false; select.disabled = false; status.textContent = 'Ready when you are.'; update(); }
  select.addEventListener('change', resetTimer); reset.addEventListener('click', resetTimer);
  controls.append(toggle, reset);
  card.append(title, label, select, timer, status, controls, element('p', 'timer-privacy', 'This timer stays in memory. Leaving this view resets it. It does not create a student record, track your device or request notifications.'));
  const notes = element('section', 'card');
  notes.append(element('h2', '', 'Choose your next small step'), element('p', 'card-copy', 'Use your own approved learning materials. This tool does not supply course content or measure academic performance.'));
  const list = element('ul', 'text-list');
  for (const text of ['Pick one topic from your verified course materials.', 'Choose a session length that suits you.', 'Pause when needed. Your timer uses elapsed time, even if the tab is briefly inactive.', 'After the session, decide what deserves another look.']) list.append(element('li', '', text));
  notes.append(list, element('p', 'muted', 'Timetables, assignments, topic checklists and saved revision plans are planned. They are not connected in this milestone.'));
  layout.append(card, notes); root.append(layout);
  const interval = window.setInterval(update, 500);
  return { node: root, dispose: () => window.clearInterval(interval) };
}
