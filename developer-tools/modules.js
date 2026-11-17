// Recorded implementation status, not a live health probe or authorization data.
export const moduleStatus = Object.freeze([
  ['UI-DASH-001', 'Dashboard and academic navigation', 'implemented', 'Manual device review pending'],
  ['ACA-001', 'Course metadata validation', 'local-tested', 'Reviewed courses and authorised APIs'],
  ['ACA-002', 'Resource categories and Drive links', 'local-tested', 'Rights review and protected delivery'],
  ['ACA-003', 'Schedule/deadline validation', 'local-tested', 'Official sources and server conflict checks'],
  ['ACA-004','Personal course progress','local-tested','Reviewed syllabus and authenticated sync before launch'],
  ['NOT-001','Notification centre','local-tested','Server targeting, sender verification, delivery and audit'],
  ['HELP-001','Settings and public Help','implemented','Authenticated account/private guidance and device review'],
  ['CBT-001','Pre-examination CBT','pre-launch-required','M6 workflow + M7 secure engine + M8 validation'],
  ['FILE-001', 'File descriptor checks', 'descriptor-only', 'Binary inspection, malware scanning, private storage'],
  ['AUTH-001', 'Activation, login, recovery and MFA', 'controlled-backend-tested', 'Production host, HTTPS, email and operational approval'],
  ['RBAC-001', 'Academic-level and role enforcement', 'controlled-backend-tested', 'Production load, complete module integration and approval'],
  ['PAY-001', 'Payment verification', 'approval-required', 'Approved merchant configuration and server verification'],
  ['EDT-001', 'Editorial integration', 'source-blocked', 'Owned Sites source/export and review'],
  ['MSG-001', 'General community', 'infrastructure-blocked', 'Server authorization and real-time infrastructure'],
  ['PWA-001', 'Public shell cache and updates', 'implemented', 'Physical-device installation review'],
]);
