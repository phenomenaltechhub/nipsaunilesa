import { element, pageHeading } from '../../components/dom.js';
import { createFocus, durations, formatTime, pauseFocus, remainingTime, startFocus } from './focus.js';
import { academicNavigation } from '../../components/academic.js';
import { revisionView } from './revision-view.js';

/** @param {ReturnType<typeof import('./revision.js').createRevisionPlan>} plan */
export function plannerView(plan) {
  const root = element('div');
  root.append(pageHeading('ACADEMICS', 'Study planner', 'Organise your revision and make time to focus.'), academicNavigation('planner'));
  const layout = element('div', 'focus-layout');
  layout.dataset.mobileView = 'plan';
  const switches = element('div', 'planner-view-switch'); switches.setAttribute('role', 'group'); switches.setAttribute('aria-label', 'Planner view');
  const planButton = element('button', '', 'Personal plan'); planButton.type = 'button'; planButton.setAttribute('aria-controls', 'personal-revision-panel'); planButton.setAttribute('aria-pressed', 'true');
  const focusButton = element('button', '', 'Focus session'); focusButton.type = 'button'; focusButton.setAttribute('aria-controls', 'focus-session-panel'); focusButton.setAttribute('aria-pressed', 'false');
  /** @param {boolean} focus */
  function selectPanel(focus) { layout.dataset.mobileView = focus ? 'focus' : 'plan'; planButton.setAttribute('aria-pressed', String(!focus)); focusButton.setAttribute('aria-pressed', String(focus)); }
  planButton.addEventListener('click', () => selectPanel(false)); focusButton.addEventListener('click', () => selectPanel(true)); switches.append(planButton, focusButton);
  root.append(switches);
  const card = element('section', 'card focus-card');
  card.id = 'focus-session-panel';
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
  card.append(title, label, select, timer, status, controls, element('p', 'timer-privacy', 'Your timer resets when you leave this page.'));
  const revision = revisionView(plan); revision.id = 'personal-revision-panel';
  layout.append(revision, card); root.append(layout);
  const interval = window.setInterval(update, 500);
  return { node: root, dispose: () => window.clearInterval(interval) };
}
