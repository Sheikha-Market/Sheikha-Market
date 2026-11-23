'use strict';

const schema = require('./registry.schema.json');
const { randomUUID } = require('node:crypto');
const COLLECTIONS = ['sources', 'nodes', 'relationships', 'appointments', 'roles',
  'modelProfiles', 'assistantProfiles', 'products', 'countryAdapters', 'officeTemplates', 'roleObservations'];
const ORGS = new Set(['ministry', 'agency', 'department', 'office', 'international_organization']);
const MAX_BYTES = 8 * 1024 * 1024;
const dateValid = value => /^\d{4}-\d{2}-\d{2}$/.test(value)
  && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;

// Small offline validator for the exact Draft-07 keywords used by our schema.
// The schema is also consumable by independent standard JSON Schema validators.
function validateRegistry(registry) {
  const errors = [];
  const error = (code, at) => { if (errors.length < 100) errors.push({ code, path: at }); };
  function shape(value, rule, at) {
    if (rule.$ref) return shape(value, schema.definitions[rule.$ref.split('/').at(-1)], at);
    if ('const' in rule && value !== rule.const) error('SCHEMA_CONST', at);
    if (rule.enum && !rule.enum.includes(value)) error('SCHEMA_ENUM', at);
    const type = value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value;
    if (rule.type && !(Array.isArray(rule.type) ? rule.type : [rule.type]).includes(type)) {
      error('SCHEMA_TYPE', at); return;
    }
    if (type === 'object') {
      for (const key of rule.required || []) if (!Object.hasOwn(value, key)) error('SCHEMA_REQUIRED', `${at}/${key}`);
      for (const key of Object.keys(value)) {
        if (!Object.hasOwn(rule.properties || {}, key)) error('SCHEMA_ADDITIONAL_PROPERTY', `${at}/${key}`);
        else shape(value[key], rule.properties[key], `${at}/${key}`);
      }
    }
    if (type === 'array') {
      if (value.length > rule.maxItems) error('SCHEMA_MAX_ITEMS', at);
      for (let i = 0; i < Math.min(value.length, 10000); i++) shape(value[i], rule.items, `${at}/${i}`);
    }
    if (type === 'string') {
      if (value.length < (rule.minLength || 0) || value.length > (rule.maxLength || 100000)) error('SCHEMA_LENGTH', at);
      if (rule.pattern && !new RegExp(rule.pattern).test(value)) error('SCHEMA_PATTERN', at);
      if (rule.format === 'date' && !dateValid(value)) error('SCHEMA_DATE', at);
    }
  }
  try {
    if (Buffer.byteLength(JSON.stringify(registry)) > MAX_BYTES) return { valid: false, errors: [{ code: 'REGISTRY_SIZE_LIMIT', path: '/' }] };
    shape(registry, schema, '');
  } catch (_) { return { valid: false, errors: [{ code: 'REGISTRY_NOT_JSON', path: '/' }] }; }
  if (errors.length) return { valid: false, errors };
  const all = new Map(), indexes = {};
  for (const collection of COLLECTIONS) {
    indexes[collection] = new Map();
    for (const row of registry[collection]) {
      if (all.has(row.id)) error('DUPLICATE_ID', `/${collection}/${row.id}`);
      all.set(row.id, row); indexes[collection].set(row.id, row);
    }
  }
  const get = (id, collection, at) => {
    const found = indexes[collection].get(id);
    if (!found) error('DANGLING_REFERENCE', at);
    return found;
  };
  const sources = (ids, at, official = false) => {
    if (official && !ids.length) error('PUBLIC_SOURCE_REQUIRED', at);
    for (const id of ids) {
      const source = get(id, 'sources', at);
      if (official && source && source.kind !== 'official_public') error('OFFICIAL_SOURCE_REQUIRED', at);
    }
  };
  for (const source of registry.sources) {
    if (source.observedAt > registry.observedAt) error('SOURCE_OBSERVED_IN_FUTURE', source.id);
    if ((source.rights.knowledgeUse === 'licensed' || source.rights.trainingLicense === 'documented')
      && !source.rights.licenseEvidenceUrls.length) error('LICENSE_EVIDENCE_REQUIRED', source.id);
  }
  for (const node of registry.nodes) {
    sources(node.sourceIds, node.id, node.recordStatus === 'public_sourced');
    if (node.type === 'country') {
      if (node.countryId !== null || node.legalNature !== 'jurisdiction') error('COUNTRY_TYPE_MISMATCH', node.id);
    } else if (node.countryId !== null && get(node.countryId, 'nodes', node.id)?.type !== 'country') error('COUNTRY_TYPE_MISMATCH', node.id);
    if (node.type === 'person' && node.legalNature !== 'natural_person') error('PERSON_LEGAL_NATURE_MISMATCH', node.id);
    if (node.type !== 'person' && node.legalNature === 'natural_person') error('PERSON_LEGAL_NATURE_MISMATCH', node.id);
    const legalNatures = { ministry: ['public_institution'], agency: ['public_institution'],
      department: ['organizational_unit'], international_organization: ['public_institution'] };
    if (legalNatures[node.type] && !legalNatures[node.type].includes(node.legalNature)) error('INSTITUTION_LEGAL_NATURE_MISMATCH', node.id);
    if (node.type === 'person') sources(node.sourceIds, node.id, true);
    if (node.type === 'office' && !['organizational_unit', 'public_office'].includes(node.legalNature)) error('OFFICE_LEGAL_NATURE_MISMATCH', node.id);
    if (node.type === 'committee') {
      if (!node.committeeScope || node.legalNature !== 'committee') error('COMMITTEE_SCOPE_REQUIRED', node.id);
      if (node.committeeScope === 'internal' && !ORGS.has(get(node.hostInstitutionId, 'nodes', node.id)?.type)) error('COMMITTEE_HOST_REQUIRED', node.id);
    } else if (node.committeeScope || node.hostInstitutionId) error('COMMITTEE_FIELDS_ON_NON_COMMITTEE', node.id);
  }
  const hierarchy = new Map();
  for (const edge of registry.relationships) {
    const from = get(edge.from, 'nodes', edge.id), to = get(edge.to, 'nodes', edge.id);
    sources(edge.sourceIds, edge.id, registry.scope !== 'country_template');
    if (!from || !to) continue;
    if (edge.type === 'partOf') {
      if (!ORGS.has(from.type) || !(ORGS.has(to.type) || to.type === 'country')
        || from.countryId !== (to.type === 'country' ? to.id : to.countryId)) error('INVALID_HIERARCHY_TYPES', edge.id);
      const parents = hierarchy.get(from.id) || [];
      if (parents.length) error('MULTIPLE_HIERARCHY_PARENTS', edge.id);
      parents.push(to.id); hierarchy.set(from.id, parents);
    }
    if (edge.type === 'memberOf' && to.type !== 'committee') error('MEMBERSHIP_TARGET_NOT_COMMITTEE', edge.id);
    if (edge.type === 'cooperatesWith' && (from.type === 'person' || to.type === 'person')) error('INSTITUTIONAL_RELATION_REQUIRES_ORGANIZATIONS', edge.id);
  }
  // Only organizational hierarchy is acyclic. Committee membership is a
  // separate relation and must not be mistaken for a reporting chain.
  const degree = new Map(), children = new Map();
  for (const [child, parents] of hierarchy) {
    if (!degree.has(child)) degree.set(child, 0);
    for (const parent of parents) {
      degree.set(child, degree.get(child) + 1);
      if (!degree.has(parent)) degree.set(parent, 0);
      children.set(parent, [...(children.get(parent) || []), child]);
    }
  }
  const queue = [...degree].filter(([, count]) => count === 0).map(([id]) => id);
  for (let offset = 0; offset < queue.length; offset++) {
    for (const child of children.get(queue[offset]) || []) {
      degree.set(child, degree.get(child) - 1);
      if (degree.get(child) === 0) queue.push(child);
    }
  }
  if (queue.length !== degree.size) error('HIERARCHY_CYCLE', '/relationships');
  const terms = new Map();
  for (const term of registry.appointments) {
    const person = get(term.personId, 'nodes', term.id), office = get(term.officeId, 'nodes', term.id);
    if (person?.type !== 'person' || office?.type !== 'office' || office?.legalNature !== 'public_office') error('APPOINTMENT_REQUIRES_PERSON_AND_PUBLIC_OFFICE', term.id);
    if (person && office && person.countryId !== office.countryId) error('APPOINTMENT_COUNTRY_MISMATCH', term.id);
    sources(term.sourceIds, term.id, true);
    if (!term.sourceIds.includes(term.dateSourceId) || get(term.dateSourceId, 'sources', term.id)?.kind !== 'official_public') error('APPOINTMENT_DATE_SOURCE_REQUIRED', term.id);
    if (term.currentObservationSourceId !== null && !term.sourceIds.includes(term.currentObservationSourceId)) error('CURRENT_OBSERVATION_SOURCE_REQUIRED', term.id);
    if (term.termStartDate > registry.observedAt || (term.termEndDate !== null && term.termEndDate < term.termStartDate)) error('INVALID_APPOINTMENT_INTERVAL', term.id);
    const previous = terms.get(term.officeId) || [];
    for (const other of previous) {
      if (term.termStartDate <= (other.termEndDate || '9999-12-31') && other.termStartDate <= (term.termEndDate || '9999-12-31')) error('OVERLAPPING_OFFICE_APPOINTMENTS', term.id);
    }
    previous.push(term); terms.set(term.officeId, previous);
  }
  for (const role of registry.roles) if (!ORGS.has(get(role.institutionId, 'nodes', role.id)?.type)) error('ROLE_INSTITUTION_REQUIRED', role.id);
  for (const model of registry.modelProfiles) sources(model.licenseEvidenceSourceIds, model.id);
  for (const assistant of registry.assistantProfiles) {
    get(assistant.roleId, 'roles', assistant.id); get(assistant.modelProfileId, 'modelProfiles', assistant.id);
  }
  for (const product of registry.products) {
    for (const id of product.assistantProfileIds) get(id, 'assistantProfiles', product.id);
    sources(product.licenseEvidenceSourceIds, product.id);
    if (product.licenseEvidenceStatus === 'documented' && (!product.licenseEvidenceSourceIds.length
      || product.licenseEvidenceSourceIds.some(id => !indexes.sources.get(id)?.rights.licenseEvidenceUrls.length))) error('LICENSE_EVIDENCE_REQUIRED', product.id);
  }
  for (const adapter of registry.countryAdapters) if (get(adapter.countryId, 'nodes', adapter.id)?.type !== 'country') error('ADAPTER_COUNTRY_REQUIRED', adapter.id);
  for (const template of registry.officeTemplates) sources(template.sourceIds, template.id);
  for (const observation of registry.roleObservations) {
    const person = get(observation.personId, 'nodes', observation.id), office = get(observation.officeId, 'nodes', observation.id);
    if (person?.type !== 'person' || office?.type !== 'office' || office?.legalNature !== 'public_office') error('OBSERVATION_REQUIRES_PERSON_AND_PUBLIC_OFFICE', observation.id);
    sources(observation.sourceIds, observation.id, true);
    if (observation.observedAt > registry.observedAt) error('ROLE_OBSERVATION_IN_FUTURE', observation.id);
    if (observation.appointmentDateStatus === 'separately_sourced' && !registry.appointments.some(term => term.personId === observation.personId && term.officeId === observation.officeId)) error('DATED_APPOINTMENT_MISSING', observation.id);
  }
  return { valid: errors.length === 0, errors };
}

function assertValid(registry) {
  const result = validateRegistry(registry);
  if (!result.valid) { const error = new Error('INVALID_INSTITUTIONAL_REGISTRY'); error.details = result.errors; throw error; }
}
function buildGraph(registry) {
  assertValid(registry);
  return { schemaVersion: registry.schemaVersion, datasetId: registry.datasetId,
    nodes: structuredClone(registry.nodes),
    edges: [...structuredClone(registry.relationships), ...registry.appointments.map(term => ({
      id: term.id, type: 'appointedTo', from: term.personId, to: term.officeId,
      termStartDate: term.termStartDate, termEndDate: term.termEndDate,
      sourceIds: [...term.sourceIds], dateSourceId: term.dateSourceId
    })), ...registry.roleObservations.map(observation => ({
      id: observation.id, type: 'observedInOffice', from: observation.personId, to: observation.officeId,
      observedAt: observation.observedAt, sourceIds: [...observation.sourceIds],
      appointmentDateStatus: observation.appointmentDateStatus
    }))], executionEnabled: false, officialRepresentation: false };
}
function summary(registry) {
  assertValid(registry);
  const counts = Object.fromEntries(COLLECTIONS.map(key => [key, registry[key].length]));
  const nodeTypes = {};
  for (const node of registry.nodes) nodeTypes[node.type] = (nodeTypes[node.type] || 0) + 1;
  return { status: 'VALID', datasetId: registry.datasetId, scope: registry.scope, counts, nodeTypes,
    observedAt: registry.observedAt, worldRosterComplete: false, trainedWeightsPresent: false,
    executionEnabled: false, officialRepresentation: false };
}
function proposeTask(registry, { assistantId, task, request }) {
  assertValid(registry);
  const assistant = registry.assistantProfiles.find(item => item.id === assistantId);
  const role = registry.roles.find(item => item.id === assistant?.roleId);
  if (!role || !role.tasks.includes(task) || typeof request !== 'string' || !request.trim() || request.length > 4000) throw new Error('TASK_NOT_ALLOWED');
  return { id: `proposal.${randomUUID()}`, assistantId, institutionId: role.institutionId, task, request,
    status: 'DRAFT_REQUIRES_HUMAN_REVIEW', realActionsRequireExplicitApproval: true,
    executionEnabled: false, actionExecution: 'NOT_IMPLEMENTED', officialRepresentation: false };
}
module.exports = { schema, validateRegistry, buildGraph, summary, proposeTask, MAX_BYTES };
