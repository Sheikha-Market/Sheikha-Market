'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const configDir = path.resolve(__dirname, '../../mcp-servers/config');
function policy(surface = 'legacy') {
  // Missing or malformed configuration fails closed.
  if (!['legacy', 'federation'].includes(surface)) throw Error('UNKNOWN_POLICY_SURFACE');
  return Object.fromEntries(['policies', 'allowlist', 'denylist'].map(name => {
    const file = name === 'allowlist' && surface === 'federation' ? 'federation-allowlist' : name;
    return [name, JSON.parse(fs.readFileSync(path.join(configDir, file + '.json'), 'utf8'))];
  }));
}
function redact(value, depth = 0) {
  if (depth > 16) return '[TRUNCATED]';
  if (typeof value === 'string') return value
    .replace(/Bearer\s+[^\s"'\\]+|Sheikha\s+skh_v2_[A-Za-z0-9_-]+/gi, '[REDACTED]')
    .replace(/\b(?:skh_v2_|sk_live_|sk-|ghp_)[A-Za-z0-9_-]+/g, '[REDACTED]')
    .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, '[REDACTED]');
  if (Array.isArray(value)) return value.map(item => redact(item, depth + 1));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) =>
    [key, /token|password|secret|api.?key|authorization|cookie|email|phone|legalname|owner|username|commercial.?registration/i.test(key)
      ? '[REDACTED]' : redact(item, depth + 1)]));
  return value;
}
function sanitizeResult(result) {
  const safe = redact(result);
  for (const field of ['content', 'contents']) {
  if (Array.isArray(safe?.[field])) safe[field] = safe[field].map((block, index) => {
    if (typeof block.text !== 'string') return block;
    // Parse the original JSON before redacting bearer strings that may contain its closing quote.
    try { return { ...block, text: JSON.stringify(redact(JSON.parse(result[field][index].text))) }; }
    catch (_) { return { ...block, text: redact(block.text) }; }
  });
  }
  return safe;
}
function decision(name, args = {}, config = policy()) {
  if (!validPolicy(config)) return { allowed: false, code: 'UNSAFE_POLICY_CONFIGURATION' };
  const limits = config.policies.payload_limits;
  if (typeof name !== 'string' || !args || typeof args !== 'object' || Array.isArray(args))
    return { allowed: false, code: 'INVALID_TOOL_REQUEST' };
  let bytes;
  try { bytes = Buffer.byteLength(JSON.stringify(args)); }
  catch (_) { return { allowed: false, code: 'INVALID_TOOL_REQUEST' }; }
  if (bytes > limits.max_request_bytes)
    return { allowed: false, code: 'REQUEST_TOO_LARGE' };
  const entry = Object.hasOwn(config.allowlist.tools || {}, name) ? config.allowlist.tools[name] : null;
  if ((config.denylist.blocked_tools || []).includes(name) || !entry || entry.access !== 'read' || entry.risk !== 'low')
    return { allowed: false, code: 'TOOL_NOT_ADMITTED' };
  if (entry.arguments === 'empty' && Reflect.ownKeys(args).length)
    return { allowed: false, code: 'ARGUMENTS_NOT_ADMITTED' };
  return { allowed: true, code: 'READ_ADMITTED' };
}
function validPolicy(config) {
  const p = config?.policies;
  const bounded = (value, max) => Number.isSafeInteger(value) && value > 0 && value <= max;
  return p?.mode?.deny_by_default === true && p?.mode?.allowlist_required === true &&
    p?.audit?.enabled === true && config?.allowlist?.default === 'deny' &&
    config?.denylist?.filesystem_write === true && config?.denylist?.process_exec === true &&
    config?.denylist?.destructive_git === true && config?.denylist?.network_side_effects_without_approval === true &&
    Array.isArray(config.denylist.blocked_tools) &&
    bounded(p.payload_limits?.max_request_bytes, 262144) &&
    bounded(p.payload_limits?.max_response_bytes, 1048576) &&
    bounded(p.rate_limit?.window_ms, 60000) && bounded(p.rate_limit?.max_requests, 120);
}
const allowedResources = new Set(['sheikha://system/status', 'sheikha://engines/list', 'sheikha://pages/list', 'sheikha://sharia/principles', 'sheikha://docs/api', 'sheikha://sdk/catalog']);
function resourceAllowed(uri, surface = 'legacy') {
  try {
    const config = policy(surface);
    return admittedResource(uri, surface, config);
  } catch (_) { return false; }
}
function admittedResource(uri, surface, config) {
  return validPolicy(config) && typeof uri === 'string' && (surface === 'legacy' ? allowedResources.has(uri) :
    Array.isArray(config.allowlist.resources) && config.allowlist.resources.includes(uri));
}
function toolCatalog(tools, surface = 'legacy') {
  let config;
  try { config = policy(surface); } catch (_) { return []; }
  return tools.filter(tool => decision(tool.name, {}, config).allowed).map(tool => ({ ...tool,
    annotations: { ...tool.annotations, readOnlyHint: true, destructiveHint: false } }));
}
function createToolGate({ audit = () => {}, now = Date.now, surface = 'legacy' } = {}) {
  const calls = [];
  const dispatch = async (request, execute, resource = false) => {
    const tool = resource ? request?.params?.uri : request?.params?.name;
    let admission;
    let config;
    try {
      config = policy(surface);
      admission = resource ? { allowed: admittedResource(tool, surface, config),
        code: admittedResource(tool, surface, config) ? 'READ_ADMITTED' : 'RESOURCE_NOT_ADMITTED' } :
        decision(tool, request?.params?.arguments === undefined ? {} : request.params.arguments, config);
    }
    catch (_) { admission = { allowed: false, code: 'POLICY_UNAVAILABLE' }; }
    if (admission.allowed) {
      const time = now();
      while (calls.length && time - calls[0] >= config.policies.rate_limit.window_ms) calls.shift();
      if (calls.length >= config.policies.rate_limit.max_requests) admission = { allowed: false, code: 'RATE_LIMITED' };
      else calls.push(time);
    }
    // Store no arguments, identity fields, result bodies or credentials.
    const known = resource ? config && admittedResource(tool, surface, config) :
      typeof tool === 'string' && Object.hasOwn(config?.allowlist?.tools || {}, tool);
    const receipt = { id: crypto.randomUUID(), tool: known ? tool : 'UNKNOWN', kind: resource ? 'resource' : 'tool',
      surface, decision: admission.code, at: new Date(now()).toISOString() };
    try { await audit(receipt); } catch (_) { return { isError: true, content: [{ type: 'text', text: 'AUDIT_UNAVAILABLE' }] }; }
    if (!admission.allowed) return { isError: true, content: [{ type: 'text', text: admission.code }] };
    try {
      const result = sanitizeResult(await execute());
      if (Buffer.byteLength(JSON.stringify(result)) > config.policies.payload_limits.max_response_bytes)
        return { isError: true, content: [{ type: 'text', text: 'RESPONSE_TOO_LARGE' }] };
      return result;
    } catch (_) { return { isError: true, content: [{ type: 'text', text: 'TOOL_EXECUTION_FAILED' }] }; }
  };
  const gate = (request, execute) => dispatch(request, execute);
  gate.resource = (request, execute) => dispatch(request, execute, true);
  return gate;
}
function federationStatus() {
  const config = policy('federation');
  if (!validPolicy(config)) throw Error('UNSAFE_POLICY_CONFIGURATION');
  return {
    schemaVersion: 1, mode: 'READ_ONLY_AND_IN_MEMORY_SIMULATION',
    policySha256: crypto.createHash('sha256').update(JSON.stringify(config)).digest('hex'),
    tools: Object.keys(config.allowlist.tools).filter(name => decision(name, {}, config).allowed),
    resources: config.allowlist.resources,
    effectivePermissionBoundary: 'HOST_PERMISSION_INTERSECT_SERVER_POLICY',
    clientIdentity: 'NOT_AUTHENTICATED_BY_STDIO_CLIENT_NAME',
    activationTransfersPermissions: false, automaticCrossEnvironmentSync: false,
    externalChatgptConnection: 'NOT_VERIFIED', credentialsShared: false,
    mutationDispatchAvailable: false, approvalHeadersTrusted: false,
    audit: 'BOUNDED_PROCESS_MEMORY_NOT_DURABLE', rateLimitScope: 'PER_SERVER_PROCESS',
    projectGuidance: 'docs/canonical/environment/SHEIKHA-ASSISTANT-GOVERNANCE.md'
  };
}
function authenticateRequest(req, requiredScope = 'runtime:read', authenticate) {
  // Identity and approval headers supplied by the client are never trusted.
  const authorization = String(req.headers?.authorization || '');
  const match = authorization.match(/^(?:Sheikha|Bearer)\s+(skh_v2_[A-Za-z0-9_-]+)$/i);
  if (!match) return null;
  const verify = authenticate || require('../../runtime/security/api-keys/api-key-manager').authenticate;
  const actor = verify(match[1], requiredScope);
  if (!actor?.trusted || !actor.scopes?.includes(requiredScope)) return null;
  return { ...actor, humanApproved: false };
}
module.exports = { policy, redact, sanitizeResult, decision, toolCatalog, createToolGate, authenticateRequest, resourceAllowed, federationStatus };
