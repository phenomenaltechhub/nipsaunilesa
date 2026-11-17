import { element, emptyState, pageHeading } from '../../components/dom.js';

export function communityView() {
  const root = element('div');
  root.append(pageHeading('GENERAL DEPARTMENTAL COMMUNITY', 'One department. One community.', 'A shared space for 100, 200 and 300 Level students, with verified identities and appropriate moderation.'));
  const card = element('section', 'card locked-community');
  card.append(element('span', 'local-label', 'CLOSED · INFRASTRUCTURE UNAVAILABLE'), emptyState('The community is not open', 'Messaging, member records, reactions and moderation are unavailable until secure authentication and real-time infrastructure are operational. No messages or student profiles are loaded.', 'lock'), element('p', 'muted', 'An authorised PWA administrator will be able to open or close this one community. The server must enforce and audit every change.'));
  root.append(card);
  return root;
}
