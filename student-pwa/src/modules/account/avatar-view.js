import { element } from '../../components/dom.js';
import { avatars } from './avatars.js';
import { sectionHeading } from '../../components/academic.js';

/** @param {ReturnType<typeof import('./avatars.js').createAvatarPreference>} preference */
export function avatarView(preference) {
  const section = element('section', 'card');
  section.append(sectionHeading('Choose your study avatar', 'Appearance only'), element('p', 'card-copy', 'Choose from 20 original academic and healthcare illustrations. This is a local appearance preview, not a signed-in identity or verified professional status. No photo uploads are supported.'));
  const preview = element('div', 'avatar-preview');
  const image = element('span', 'avatar-art'); image.setAttribute('role', 'img');
  const name = element('strong'); const text = element('div'); text.append(name, element('p', 'muted', 'Not connected to a student account'));
  preview.append(image, text);
  const fieldset = element('fieldset', 'avatar-fieldset');
  fieldset.append(element('legend', 'field-label', 'Curated avatar choices'));
  const grid = element('div', 'avatar-grid');
  const filterField = element('div', 'avatar-filter');
  const filterLabel = element('label', 'field-label', 'Avatar category'); filterLabel.htmlFor = 'avatar-category';
  const filter = element('select'); filter.id = filterLabel.htmlFor; filter.add(new Option('All illustrations', 'all'));
  for (const category of new Set(avatars.map(avatar => avatar.category))) filter.add(new Option(category, category));
  filterField.append(filterLabel, filter);
  /** @type {HTMLInputElement[]} */
  const inputs = [];
  const message = element('p', 'search-status'); message.setAttribute('role', 'status');
  const rememberLabel = element('label', 'preference-check');
  const remember = element('input'); remember.type = 'checkbox'; remember.id = 'remember-avatar';
  rememberLabel.append(remember, element('span', '', 'Remember this avatar on this device'));
  function update() {
    const state = preference.snapshot();
    const selected = avatars.find(avatar => avatar.id === state.selected);
    image.className = `avatar-art avatar-${state.selected}`; image.setAttribute('aria-label', selected?.name ?? 'Curated avatar');
    name.textContent = selected?.name ?? 'Curated avatar'; remember.checked = state.remembered;
    for (const input of inputs) input.checked = input.value === state.selected;
    message.textContent = state.message || 'Choose an avatar for this visit. Device saving is optional.';
  }
  for (const avatar of avatars) {
    const label = element('label', 'avatar-option');
    label.dataset.category = avatar.category;
    const input = element('input'); input.type = 'radio'; input.name = 'curated-avatar'; input.value = avatar.id;
    const art = element('span', `avatar-art avatar-${avatar.id}`); art.setAttribute('aria-hidden', 'true');
    label.append(input, art, element('span', 'avatar-name', avatar.name));
    input.addEventListener('change', () => { preference.select(avatar.id); update(); });
    inputs.push(input); grid.append(label);
  }
  remember.addEventListener('change', () => { preference.remember(remember.checked); update(); });
  filter.addEventListener('change', () => {
    for (const label of grid.children) { if (label instanceof HTMLElement) label.hidden = filter.value !== 'all' && label.dataset.category !== filter.value; }
  });
  fieldset.append(grid); section.append(preview, filterField, fieldset, rememberLabel, message); update();
  return section;
}
