export const durations = Object.freeze([15, 25, 45]);

/** @param {number} minutes */
export function createFocus(minutes = 25) {
  if (!durations.includes(minutes)) throw new RangeError('Choose a supported focus duration.');
  return { minutes, remaining: minutes * 60_000, deadline: /** @type {number|null} */ (null) };
}

/** @param {ReturnType<typeof createFocus>} state @param {number} now */
export function remainingTime(state, now) {
  return state.deadline === null ? state.remaining : Math.max(0, state.deadline - now);
}

/** @param {ReturnType<typeof createFocus>} state @param {number} now */
export function startFocus(state, now) {
  return state.deadline === null && state.remaining > 0 ? { ...state, deadline: now + state.remaining } : state;
}

/** @param {ReturnType<typeof createFocus>} state @param {number} now */
export function pauseFocus(state, now) {
  return { ...state, remaining: remainingTime(state, now), deadline: null };
}

/** @param {number} milliseconds */
export function formatTime(milliseconds) {
  const seconds = Math.ceil(Math.max(0, milliseconds) / 1000);
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}
