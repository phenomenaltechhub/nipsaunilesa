import { element } from '../../components/dom.js';
import { sectionHeading } from '../../components/academic.js';
import { formatCalendarDate } from '../academic/calendar.js';

/** @param {ReturnType<typeof import('./revision.js').createRevisionPlan>} plan */
export function revisionView(plan) {
  const section = element('section', 'card revision-card');
  section.append(sectionHeading('Revision plan'), element('p', 'card-copy', 'Add a study task and a target date. Your plan stays in this tab and resets on reload.'));
  const form = element('form', 'revision-form');
  const titleLabel = element('label', 'field-label', 'Study task'); titleLabel.htmlFor = 'revision-title';
  const title = element('input'); title.id = titleLabel.htmlFor; title.maxLength = 120; title.required = true; title.placeholder = 'What will you review?'; title.autocomplete = 'off';
  const dateLabel = element('label', 'field-label', 'Target date (optional)'); dateLabel.htmlFor = 'revision-date';
  const date = element('input'); date.id = dateLabel.htmlFor; date.type = 'date'; date.min = '2000-01-01'; date.max = '2200-12-31';
  const submit = element('button', 'button', 'Add study task'); submit.type = 'submit';
  const error = element('p', 'field-error'); error.id = 'revision-error'; error.setAttribute('role', 'alert');
  title.setAttribute('aria-describedby', error.id); date.setAttribute('aria-describedby', error.id);
  const titleField = element('div'); titleField.append(titleLabel, title);
  const dateField = element('div'); dateField.append(dateLabel, date);
  form.append(titleField, dateField, submit, error);
  const summary = element('p', 'search-status'); summary.setAttribute('role', 'status');
  const filterLabel = element('label', 'field-label', 'Show study tasks'); filterLabel.htmlFor = 'revision-filter';
  const filter = element('select'); filter.id = filterLabel.htmlFor;
  for (const [value, text] of [['all', 'All tasks'], ['open', 'To do'], ['done', 'Completed']]) filter.add(new Option(text, value));
  const progressLabel = element('label', 'field-label', 'Personal task progress'); progressLabel.htmlFor = 'revision-progress';
  const progress = element('progress'); progress.id = progressLabel.htmlFor; progress.max = 1; progress.value = 0;
  const list = element('ul', 'revision-list'); list.setAttribute('aria-label', 'Personal study tasks');
  const empty = element('p', 'inline-note');
  function render() {
    const items = plan.list(); const completed = items.filter(item => item.done).length;
    summary.textContent = `${items.length} ${items.length === 1 ? 'task' : 'tasks'} · ${completed} completed`;
    progress.max = Math.max(1, items.length); progress.value = completed; progress.textContent = `${completed} of ${items.length} completed`;
    const visible = items.filter(item => filter.value === 'all' || (filter.value === 'done' ? item.done : !item.done));
    list.replaceChildren();
    for (const item of visible) {
      const row = element('li', 'revision-task');
      const label = element('label', 'task-check');
      const checkbox = element('input'); checkbox.type = 'checkbox'; checkbox.id = `revision-task-${item.id}`; checkbox.checked = item.done;
      const text = element('span', item.done ? 'task-text is-complete' : 'task-text', item.title);
      label.append(checkbox, text);
      checkbox.addEventListener('change', () => { plan.toggle(item.id); render(); const current = list.querySelector(`#revision-task-${item.id}`); if (current instanceof HTMLElement) current.focus(); else filter.focus(); });
      const meta = element('div', 'task-meta');
      if (item.dueDate) { const time = element('time', '', formatCalendarDate(item.dueDate, { day: 'numeric', month: 'short', year: 'numeric' })); time.dateTime = item.dueDate; meta.append(time); }
      const remove = element('button', 'button subtle small', 'Remove'); remove.type = 'button'; remove.setAttribute('aria-label', `Remove task: ${item.title}`);
      remove.addEventListener('click', () => { plan.remove(item.id); render(); title.focus(); });
      meta.append(remove); row.append(label, meta); list.append(row);
    }
    empty.textContent = !items.length ? 'No personal revision tasks yet. Start with one small study goal.' : !visible.length ? 'No tasks match this filter.' : '';
  }
  form.addEventListener('submit', event => {
    event.preventDefault();
    try { plan.add(title.value, date.value); title.value = ''; date.value = ''; error.textContent = ''; title.removeAttribute('aria-invalid'); date.removeAttribute('aria-invalid'); render(); title.focus(); }
    catch (failure) { error.textContent = failure instanceof Error ? failure.message : 'The task could not be added.'; title.setAttribute('aria-invalid', 'true'); }
  });
  filter.addEventListener('change', render);
  const tools = element('div', 'revision-tools'); const filterField = element('div'); filterField.append(filterLabel, filter); const progressField = element('div'); progressField.append(progressLabel, progress); tools.append(filterField, progressField);
  section.append(form, summary, tools, list, empty); render();
  return section;
}
