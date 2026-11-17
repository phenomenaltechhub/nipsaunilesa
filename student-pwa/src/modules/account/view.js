import { element, emptyState, link, pageHeading } from '../../components/dom.js';
import { requestStudentServices } from '../../api/services.js';
import { avatarView } from './avatar-view.js';

/** @param {ReturnType<typeof import('./avatars.js').createAvatarPreference>} preference */
export function accountView(preference) {
  const root = element('div');
  root.append(pageHeading('PRIVACY BEFORE PERSONALISATION', 'Your student account', 'Verified names, levels and official positions will appear after secure activation and authentication. No student is signed in.'));
  root.append(avatarView(preference));
  const card = element('section', 'card');
  card.classList.add('account-service-card');
  card.append(element('h2', '', 'Student services'));
  card.append(emptyState('Account services are not connected', 'Activation, email ownership verification, administrator approval, sign-in and recovery require secure hosting. No credentials or identity information are collected here.', 'profile'));
  const check = document.createElement('button'); check.className = 'button subtle'; check.textContent = 'Check service availability';
  const status = element('p', 'search-status'); status.setAttribute('role', 'status');
  check.addEventListener('click', async () => {
    try { await requestStudentServices(); }
    catch { status.textContent = 'Student services are unavailable. No request was sent and no account was created.'; }
  });
  card.append(check, status);
  const steps = element('ul', 'text-list');
  for (const text of ['Departmental dues registration is separate from PWA activation; there is no email OTP during dues registration.', 'Future activation uses reconciled successful payments, institutional email ownership checks and administrator approval.', 'Positions must be verified and assigned by authorised administrators. Browser controls cannot grant privileges.', 'Recovery will use a single-use expiring reset process and revoke existing sessions. No shared default passwords.']) steps.append(element('li', '', text));
  card.append(steps, link('https://nipsaunilesa.com.ng/portal', 'Visit the public Student Portal ↗', 'button subtle'));
  root.append(card);
  return root;
}
