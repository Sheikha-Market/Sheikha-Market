'use strict';

function createSheikhaApiClient({ baseUrl = 'http://localhost:8080', token = null } = {}) {
  return {
    name: 'SHEIKHA_API_SDK',
    baseUrl,
    hasToken: Boolean(token),
    endpoints: [
      '/api/health',
      '/api/runtime/introspection/routes',
      '/api/devops/ai-lab/status'
    ],
    requestDescriptor(path, method = 'GET') {
      return { method, url: `${baseUrl}${path}`, auth: token ? 'Bearer token configured' : 'none' };
    }
  };
}

module.exports = { createSheikhaApiClient };
