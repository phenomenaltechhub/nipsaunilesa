export const avatars = Object.freeze([
  { id: 'molecule', name: 'Molecular bonds', category: 'Science' },
  { id: 'capsule', name: 'Capsule', category: 'Pharmacology' },
  { id: 'tablets', name: 'Tablets', category: 'Pharmacology' },
  { id: 'flask', name: 'Laboratory flask', category: 'Laboratory' },
  { id: 'beaker', name: 'Beaker', category: 'Laboratory' },
  { id: 'microscope', name: 'Microscope', category: 'Laboratory' },
  { id: 'book', name: 'Open book', category: 'Academic' },
  { id: 'books', name: 'Study books', category: 'Academic' },
  { id: 'atom', name: 'Atomic orbit', category: 'Science' },
  { id: 'dna', name: 'Double helix', category: 'Science' },
  { id: 'stethoscope', name: 'Stethoscope', category: 'Healthcare' },
  { id: 'heart', name: 'Heart and pulse', category: 'Healthcare' },
  { id: 'shield', name: 'Care and safety', category: 'Healthcare' },
  { id: 'graduate', name: 'Graduation cap', category: 'Academic' },
  { id: 'compound', name: 'Compound ring', category: 'Science' },
  { id: 'pipette', name: 'Pipette', category: 'Laboratory' },
  { id: 'clinician-a', name: 'Male clinician · emerald', category: 'Clinicians' },
  { id: 'clinician-b', name: 'Female clinician · teal', category: 'Clinicians' },
  { id: 'clinician-c', name: 'Male clinician · teal', category: 'Clinicians' },
  { id: 'clinician-d', name: 'Female clinician · emerald', category: 'Clinicians' },
]);

export const avatarKey = 'pharmaideia.avatar.v1';
/** @param {unknown} id */
export function validAvatarId(id) { return typeof id === 'string' && avatars.some(avatar => avatar.id === id); }

/** Only one allowlisted avatar ID may be persisted. Never stores an identity,
 * role, level, password, token or personal plan.
 * @param {Pick<Storage,'getItem'|'setItem'|'removeItem'>|null} storage
 */
export function createAvatarPreference(storage) {
  let selected = 'book'; let remembered = false; let message = '';
  try {
    const stored = storage?.getItem(avatarKey);
    if (validAvatarId(stored)) { selected = /** @type {string} */ (stored); remembered = true; }
  } catch { message = 'Your selection is available for this visit.'; }
  function persist() {
    try {
      if (!storage) throw new Error('Storage unavailable');
      if (remembered) storage.setItem(avatarKey, selected); else storage.removeItem(avatarKey);
      message = remembered ? 'Saved on this device.' : 'Your selection is available for this visit.';
    } catch { remembered = false; message = 'This preference could not be saved or cleared. You can still use your selection.'; }
  }
  return {
    snapshot() { return { selected, remembered, message }; },
    /** @param {string} id */
    select(id) {
      if (!validAvatarId(id)) throw new RangeError('Choose a curated avatar.');
      selected = id;
      if (remembered) persist(); else message = 'Your selection is available for this visit.';
    },
    /** @param {boolean} value */
    remember(value) { remembered = value === true; persist(); },
  };
}
