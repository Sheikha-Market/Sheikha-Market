'use strict';

function createSheikhaApiClient({
  baseUrl = 'http://localhost:8080',
  token = null,
  apiKey = null,
  actorId = null,
  role = null,
  tenantId = null,
  humanApproved = false,
  fetchImpl = globalThis.fetch
} = {}) {
  const normalizedBase = String(baseUrl).replace(/\/$/, '');

  function headers(extra = {}) {
    return {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(apiKey ? { Authorization: `Sheikha ${apiKey}` } : {}),
      ...(actorId ? { 'x-sheikha-actor-id': actorId } : {}),
      ...(role ? { 'x-sheikha-role': role } : {}),
      ...(tenantId ? { 'x-sheikha-tenant-id': tenantId } : {}),
      ...(humanApproved ? { 'x-sheikha-human-approved': 'true' } : {}),
      ...extra
    };
  }

  async function request(path, method = 'GET', body = null, options = {}) {
    if (typeof fetchImpl !== 'function') {
      throw new Error('A Fetch API implementation is required.');
    }
    const response = await fetchImpl(`${normalizedBase}${path}`, {
      method,
      headers: headers(options.headers),
      ...(body === null ? {} : { body: JSON.stringify(body) })
    });
    const payload = await response.json();
    if (!response.ok || payload.success === false) {
      const error = new Error(payload.message || `Sheikha API request failed with ${response.status}.`);
      error.code = payload.error || 'SHEIKHA_API_ERROR';
      error.statusCode = response.status;
      error.payload = payload;
      throw error;
    }
    return payload;
  }

  const client = {
    name: 'SHEIKHA_API_SDK',
    version: '2.0.0',
    baseUrl: normalizedBase,
    hasToken: Boolean(token),
    hasApiKey: Boolean(apiKey),
    endpoints: [
      '/api/health',
      '/api/runtime/introspection/routes',
      '/api/devops/ai-lab/status',
      '/api/saas/v2/status',
      '/api/tenancy/snapshot',
      '/api/subscriptions/usage',
      '/api/security/api-keys/status'
    ],
    requestDescriptor(path, method = 'GET') {
      return {
        method,
        url: `${normalizedBase}${path}`,
        auth: apiKey ? 'Scoped Sheikha API key configured' : token ? 'Bearer token configured' : 'none',
        tenantId
      };
    },
    request
  };

  client.saas = {
    status: () => request('/api/saas/v2/status'),
    tenantSnapshot: () => request('/api/tenancy/snapshot'),
    createOrganization: input => request('/api/tenancy/organizations', 'POST', input),
    createWorkspace: input => request('/api/tenancy/workspaces', 'POST', input),
    createProject: input => request('/api/tenancy/projects', 'POST', input),
    addUser: input => request('/api/tenancy/users', 'POST', input),
    createSubscription: input => request('/api/subscriptions', 'POST', input),
    addSeat: input => request('/api/subscriptions/seats', 'POST', input),
    issueProductEntitlement: input => request('/api/subscriptions/product-entitlements', 'POST', input),
    recordUsage: input => request('/api/subscriptions/usage', 'POST', input),
    usage: () => request('/api/subscriptions/usage'),
    billingPreview: () => request('/api/subscriptions/billing-preview'),
    apiKeys: () => request('/api/security/api-keys'),
    issueApiKey: input => request('/api/security/api-keys', 'POST', input),
    rotateApiKey: (keyId, input = {}) => request(`/api/security/api-keys/${keyId}/rotate`, 'POST', input),
    revokeApiKey: keyId => request(`/api/security/api-keys/${keyId}/revoke`, 'POST', {}),
    audit: (limit = 100) => request(`/api/saas/v2/audit?limit=${encodeURIComponent(limit)}`)
  };

  return client;
}

module.exports = { createSheikhaApiClient };
