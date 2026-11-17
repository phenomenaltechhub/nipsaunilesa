import { element, pageHeading } from '../../components/dom.js';
import { avatarView } from './avatar-view.js';

/** @param {ReturnType<typeof import('./avatars.js').createAvatarPreference>} preference */
export function accountView(preference) {
  const root = element('div');
  root.append(pageHeading('YOUR SPACE', 'Preferences', 'Personalise your study space.'), avatarView(preference));
  return root;
}
