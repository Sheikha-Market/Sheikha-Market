'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { schema, validateRegistry, buildGraph, summary, proposeTask } = require('../../core/institutional-governance/index.cjs');
const samplePath = path.resolve(__dirname, '../../tools/institutional-governance/saudi-sample.v1.json');
const template = require('../../tools/institutional-governance/country-template.v1.json');
const fresh = () => JSON.parse(fs.readFileSync(samplePath, 'utf8'));
const codes = registry => validateRegistry(registry).errors.map(error => error.code);
const committee = id => ({ id, type: 'committee', name: { ar: 'لجنة اختبار', en: 'Test committee' },
  countryId: 'country.sa', legalNature: 'committee', sourceIds: ['src.mc.structure'],
  recordStatus: 'public_sourced', committeeScope: 'interagency' });

test('sample and global template validate, including independent Draft-07 validation', () => {
  const ajv = new (require('ajv'))({ allErrors: true });
  const validate = ajv.compile(schema);
  for (const data of [fresh(), template]) {
    assert.deepEqual(validateRegistry(data), { valid: true, errors: [] });
    assert.equal(validate(data), true, JSON.stringify(validate.errors));
  }
  const report = summary(fresh());
  assert.equal(report.nodeTypes.ministry, 24);
  assert.equal(report.nodeTypes.person, 6);
  assert.equal(report.worldRosterComplete, false);
  assert.equal(report.trainedWeightsPresent, false);
});
test('rejects duplicate IDs and dangling institutional or source references', () => {
  let data = fresh(); data.nodes.push(structuredClone(data.nodes[0]));
  assert.ok(codes(data).includes('DUPLICATE_ID'));
  data = fresh(); data.relationships[0].to = 'missing.institution';
  assert.ok(codes(data).includes('DANGLING_REFERENCE'));
  data = fresh(); data.nodes[0].sourceIds = ['missing.source'];
  assert.ok(codes(data).includes('DANGLING_REFERENCE'));
});
test('hierarchy cycles fail but committee membership cycles are separate valid relations', () => {
  let data = fresh();
  data.relationships.find(edge => edge.from === 'sa.mc').to = 'sa.mc.governance';
  assert.ok(codes(data).includes('HIERARCHY_CYCLE'));
  data = fresh(); data.nodes.push(committee('committee.one'), committee('committee.two'));
  data.relationships.push(...[['committee.one', 'committee.two'], ['committee.two', 'committee.one']].map(([from, to], index) => ({
    id: `membership.${index}`, type: 'memberOf', from, to, sourceIds: ['src.mc.structure']
  })));
  assert.equal(validateRegistry(data).valid, true);
  data.relationships.at(-1).to = 'sa.mc';
  assert.ok(codes(data).includes('MEMBERSHIP_TARGET_NOT_COMMITTEE'));
});
test('natural persons, legal institutions, offices and appointments are not interchangeable', () => {
  let data = fresh(); data.nodes.find(node => node.type === 'person').legalNature = 'public_institution';
  assert.ok(codes(data).includes('PERSON_LEGAL_NATURE_MISMATCH'));
  data = fresh(); data.appointments[0].officeId = 'sa.mc';
  assert.ok(codes(data).includes('APPOINTMENT_REQUIRES_PERSON_AND_PUBLIC_OFFICE'));
  data = fresh(); data.relationships.push({ id: 'person.parent.invalid', type: 'partOf',
    from: data.appointments[0].personId, to: 'sa.mc', sourceIds: ['src.mc.structure'] });
  assert.ok(codes(data).includes('INVALID_HIERARCHY_TYPES'));
});
test('appointments require valid dates, dated public provenance and nonoverlapping office terms', () => {
  let data = fresh(); data.appointments[0].termStartDate = '2021-02-30';
  assert.ok(codes(data).includes('SCHEMA_DATE'));
  data = fresh(); data.appointments[0].termEndDate = '2020-01-01';
  assert.ok(codes(data).includes('INVALID_APPOINTMENT_INTERVAL'));
  data = fresh(); data.appointments[0].dateSourceId = 'missing.source';
  assert.ok(codes(data).includes('APPOINTMENT_DATE_SOURCE_REQUIRED'));
  data = fresh(); data.appointments.push({ ...data.appointments[0], id: 'appointment.overlap' });
  assert.ok(codes(data).includes('OVERLAPPING_OFFICE_APPOINTMENTS'));
  const graph = buildGraph(fresh());
  assert.equal(graph.edges.filter(edge => edge.type === 'appointedTo').length, 3);
  assert.equal(graph.edges.filter(edge => edge.type === 'observedInOffice').length, 6);
});
test('advisory task proposals grant no execution, mandate, training artifact or reward', () => {
  const data = fresh(), assistantId = data.assistantProfiles[0].id;
  const proposal = proposeTask(data, { assistantId, task: 'draft_policy_proposal', request: 'Draft an evidence checklist.' });
  assert.equal(proposal.executionEnabled, false);
  assert.equal(proposal.actionExecution, 'NOT_IMPLEMENTED');
  assert.equal(proposal.realActionsRequireExplicitApproval, true);
  assert.throws(() => proposeTask(data, { assistantId, task: 'make_payment', request: 'Pay.' }), /TASK_NOT_ALLOWED/);
  data.modelProfiles[0].weightsPresent = true;
  assert.ok(codes(data).includes('SCHEMA_CONST'));
  const other = fresh(); other.products[0].licenseEvidenceStatus = 'documented';
  assert.ok(codes(other).includes('LICENSE_EVIDENCE_REQUIRED'));
  other.products[0].licenseEvidenceStatus = 'pending'; other.shkReward = 100;
  assert.ok(codes(other).includes('SCHEMA_ADDITIONAL_PROPERTY'));
});
test('CLI writes only explicitly requested new outputs and refuses overwrite', t => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'institutional-cli-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const cli = path.resolve(__dirname, '../../tools/institutional-governance/registry-cli.cjs');
  const env = { ...process.env };
  delete env.NODE_TEST_CONTEXT;
  delete env.NODE_OPTIONS;
  const run = (...args) => {
    const result = spawnSync(process.execPath, [cli, ...args], { cwd: directory, encoding: 'utf8', env });
    assert.ifError(result.error);
    return result;
  };
  let result = run('summary', '--input', samplePath);
  assert.equal(result.status, 0, result.stderr); assert.equal(JSON.parse(result.stdout).nodeTypes.ministry, 24);
  assert.deepEqual(fs.readdirSync(directory), []);
  const output = path.join(directory, 'summary.json');
  result = run('summary', '--input', samplePath, '--output', output);
  assert.equal(result.status, 0, result.stderr);
  const before = fs.readFileSync(output, 'utf8');
  result = run('graph', '--input', samplePath, '--output', output);
  assert.equal(result.status, 1); assert.equal(fs.readFileSync(output, 'utf8'), before);
  assert.equal(JSON.parse(result.stderr).code, 'OUTPUT_ALREADY_EXISTS');
});
