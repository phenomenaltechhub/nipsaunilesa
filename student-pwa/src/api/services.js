/** A fail-closed integration boundary, not authentication or authorization. */
export class InfrastructureUnavailableError extends Error {
  constructor() {
    super('Secure student services are not connected. No request was sent.');
    this.name = 'InfrastructureUnavailableError';
  }
}

/** No configurable endpoint, credential input, browser token storage or simulated success. */
export async function requestStudentServices() {
  throw new InfrastructureUnavailableError();
}

export const availability = Object.freeze({
  authentication: 'infrastructure-blocked',
  payments: 'approval-and-infrastructure-blocked',
  academicRecords: 'infrastructure-blocked',
  roleManagement: 'infrastructure-blocked',
  community: 'closed-infrastructure-blocked',
  editorial: 'source-and-integration-blocked',
});
