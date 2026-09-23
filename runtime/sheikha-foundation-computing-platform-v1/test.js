'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const foundationManifest = require('./foundation-manifest-v1.json');
const {
  ugoSchema,
  createGovernedObject,
  validateGovernedObject
} = require('./universal-governed-object-v1');
const { governanceScope } = require('./universal-governance-scope-v1');
const { eventFabric } = require('./governance-event-fabric-v1');
const { universalLifecycle } = require('./universal-lifecycle-engine-v1');
const { productCatalog } = require('./product-catalog-v1');
const { releaseGates } = require('./release-gates-v1');
const { eightStageProgram } = require('./eight-stage-execution-program-v1');
const { sourceCatalog, sourceCatalogSummary } = require('./quran-sunnah-source-catalog-v1');
const { semanticIntegrationContract } = require('./semantic-integration-contract-v1');
const { mappingReviewSchema } = require('./sharia-policy-mapping-review-v1');
const { validateShariaBindings } = require('./sharia-source-validator-v1');
const {
  authorize,
  canUse
} = require('./authorization-engine-v1');
const {
  deriveHighImpact,
  govern
} = require('./living-governance-kernel-v1');
const {
  buildPostgresAuthorizationClaimStore
} = require('./postgres-authorization-claim-store-v1');
const {
  BOOTSTRAP_MIGRATION_ID,
  loadMigration,
  provisionSchema
} = require('../../tools/database/postgresql/sheikha-foundation-computing-platform-v1/sheikha-postgres-schema-provisioner-v1');
const { routes } = require('./server');

function listFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory() ? listFiles(entryPath) : [entryPath];
  });
}

async function main() {
  const foundationFiles = listFiles(__dirname);
  assert.equal(foundationManifest.design, 'V5_AUTHORIZATION_GOVERNANCE_REPAIR_V1');
  assert.equal(foundationManifest.targetFileCount, foundationFiles.length);
  assert.equal(
    foundationManifest.jsFileCount,
    foundationFiles.filter((file) => file.endsWith('.js')).length
  );
  assert.equal(
    foundationManifest.postgresMigrationFileCount,
    foundationFiles.filter((file) => file.endsWith('.sql')).length
  );
  assert.equal(ugoSchema.fieldCount, 40);
  assert.equal(governanceScope.count, 40);
  assert.equal(eventFabric.count, 28);
  assert.equal(universalLifecycle.count, 13);
  assert.equal(productCatalog.count, 36);
  assert.equal(releaseGates.count, 15);
  assert.equal(eightStageProgram.count, 8);
  assert.equal(sourceCatalogSummary.recordCount, 17);
  assert.equal(sourceCatalogSummary.quranRecordCount, 13);
  assert.equal(sourceCatalogSummary.sunnahRecordCount, 4);
  assert.equal(semanticIntegrationContract.kernelRequiredDependencies.length, 11);
  assert.equal(semanticIntegrationContract.kernelFlow.length, 12);
  assert.equal(mappingReviewSchema.fieldCount, 18);
  assert.equal(routes.length, 37);

  const quran = sourceCatalog.filter((record) => record.sourceType === 'QURAN');
  const sunnah = sourceCatalog.filter((record) => record.sourceType === 'AUTHENTIC_SUNNAH');

  assert.equal(quran.length, 13);
  assert.equal(quran.every((record) => record.referenceEligible === true), true);
  assert.equal(quran.every((record) => record.enforcementEligible === false), true);
  assert.equal(quran.every((record) => record.policyMappingReviewRequired === true), true);
  assert.equal(quran.every((record) => record.policyMappingReviewed === false), true);

  assert.equal(sunnah.length, 4);
  assert.equal(sunnah.every((record) => record.referenceEligible === false), true);
  assert.equal(sunnah.every((record) => record.enforcementEligible === false), true);

  const policy = {
    id: 'POLICY_TEST_BALANCE',
    version: '1',
    shariaApplies: true,
    shariaBindings: [{
      sourceId: 'QURAN_55_7_9',
      mappingReview: {
        mappingId: 'MAP_TEST_001',
        policyId: 'POLICY_TEST_BALANCE',
        policyVersion: '1',
        sourceId: 'QURAN_55_7_9',
        sourceType: 'QURAN',
        mappingStatementHash: 'test-hash-not-production-evidence',
        status: 'APPROVED',
        reviewedBy: 'TEST_REVIEWER',
        reviewedAt: '2026-09-03T00:00:00Z',
        reviewEvidence: 'TEST_EVIDENCE_ONLY',
        reviewAuthorityClass: 'DOCUMENTED_HUMAN_REVIEW'
      }
    }]
  };

  assert.equal(
    validateShariaBindings({
      ...policy,
      shariaBindings: [{
        sourceId: 'QURAN_55_7_9',
        mappingReview: { status: 'PENDING' }
      }]
    }).ok,
    false
  );

  assert.equal(validateShariaBindings(policy).ok, true);

  assert.equal(
    validateShariaBindings({
      ...policy,
      shariaBindings: [{
        ...policy.shariaBindings[0],
        sourceId: 'HADITH_NO_HARM',
        mappingReview: {
          ...policy.shariaBindings[0].mappingReview,
          sourceId: 'HADITH_NO_HARM',
          sourceType: 'AUTHENTIC_SUNNAH'
        }
      }]
    }).ok,
    false
  );

  assert.equal(
    validateShariaBindings({
      id: 'LEGACY',
      version: '1',
      shariaApplies: true,
      sourceIds: ['QURAN_55_7_9']
    }).ok,
    false
  );

  const candidate = createGovernedObject({
    id: 'example',
    type: 'RESOURCE',
    owner: 'OWNER',
    rights: 'OWNED',
    source: 'PRIMARY',
    provenance: 'EVIDENCE'
  });
  assert.equal(validateGovernedObject(candidate).ok, true);
  assert.equal(validateGovernedObject(candidate).productionEligible, true);

  // P2: blank required identifiers fail as UGO_INVALID, not downstream event failure.
  const blankId = createGovernedObject({
    id: '   ',
    type: 'RESOURCE',
    owner: 'OWNER',
    rights: 'OWNED',
    source: 'PRIMARY',
    provenance: 'EVIDENCE'
  });
  assert.equal(validateGovernedObject(blankId).ok, false);
  assert.equal(
    (await govern({
      object: blankId,
      policy: { shariaApplies: false },
      context: { evidenceVerified: true }
    })).reason,
    'UGO_INVALID'
  );

  const blankType = createGovernedObject({
    id: 'blank-type',
    type: '',
    owner: 'OWNER',
    rights: 'OWNED',
    source: 'PRIMARY',
    provenance: 'EVIDENCE'
  });
  assert.equal(validateGovernedObject(blankType).ok, false);

  // Existing decision-evidence boundary remains enforced.
  const deniedForMissingEvidence = await govern({
    object: candidate,
    policy: { shariaApplies: false },
    context: { evidenceVerified: true, requiresRightsValidation: true }
  });
  assert.equal(deniedForMissingEvidence.allowed, false);
  assert.equal(deniedForMissingEvidence.reason, 'DECISION_EVIDENCE_REQUIRED');

  // P1: caller false may never downgrade governed high impact.
  const derivedImpact = deriveHighImpact({
    object: { classification: 'HIGH' },
    policy: {},
    action: {},
    context: { highImpact: false }
  });
  assert.equal(derivedImpact.governedHighImpact, true);
  assert.equal(derivedImpact.highImpact, true);
  assert.equal(derivedImpact.callerMayDowngradeGovernedImpact, false);

  // Caller true may elevate a lower-impact request.
  assert.equal(
    deriveHighImpact({
      object: { classification: 'LOW' },
      policy: {},
      action: {},
      context: { highImpact: true }
    }).highImpact,
    true
  );

  const reusableAuthorization = authorize({
    authorizationId: 'AUTH-BOUND-001',
    objectId: 'example',
    action: 'RUN',
    scope: ['beta', 'alpha', 'alpha'],
    approvedBy: 'TEST_REVIEWER'
  });

  assert.equal(
    canUse(reusableAuthorization, {
      objectId: 'example',
      action: 'RUN',
      scope: ['alpha', 'beta']
    }),
    true
  );
  assert.equal(
    canUse(reusableAuthorization, {
      objectId: 'other-object',
      action: 'RUN',
      scope: ['alpha', 'beta']
    }),
    false
  );
  assert.equal(
    canUse(reusableAuthorization, {
      objectId: 'example',
      action: 'OTHER',
      scope: ['alpha', 'beta']
    }),
    false
  );
  assert.equal(
    canUse(reusableAuthorization, {
      objectId: 'example',
      action: 'RUN',
      scope: ['alpha']
    }),
    false
  );

  assert.throws(
    () => authorize({
      authorizationId: 'AUTH-BAD-EXPIRY',
      objectId: 'example',
      action: 'RUN',
      scope: [],
      approvedBy: 'TEST_REVIEWER',
      expiresAt: 'not-a-date'
    }),
    /INVALID_AUTHORIZATION_EXPIRY/
  );

  const expiredAuthorization = authorize({
    authorizationId: 'AUTH-EXPIRED-001',
    objectId: 'example',
    action: 'RUN',
    scope: [],
    approvedBy: 'TEST_REVIEWER',
    expiresAt: '2026-01-01T00:00:00Z'
  });
  assert.equal(
    canUse(expiredAuthorization, {
      objectId: 'example',
      action: 'RUN',
      scope: [],
      now: Date.parse('2026-09-18T00:00:00Z')
    }),
    false
  );
  assert.equal(
    canUse(expiredAuthorization, {
      objectId: 'example',
      action: 'RUN',
      scope: [],
      now: '2026-09-18T00:00:00Z'
    }),
    false
  );
  assert.equal(
    canUse(expiredAuthorization, {
      objectId: 'example',
      action: 'RUN',
      scope: [],
      now: 'invalid-evaluation-time'
    }),
    false
  );

  // P1: non-production-eligible executable objects never reach PEP.
  let productionActionCalls = 0;
  const nonEligible = createGovernedObject({
    id: 'not-prod',
    type: 'PRODUCT'
  });
  const productionDenied = await govern({
    object: nonEligible,
    policy: { shariaApplies: false },
    context: {
      evidenceVerified: true,
      evidenceId: 'EVIDENCE-PROD-1',
      evidenceSource: 'TEST'
    },
    action: {
      id: 'RUN',
      scope: ['production'],
      executable: true,
      execute() {
        productionActionCalls += 1;
      }
    }
  });
  assert.equal(productionDenied.reason, 'PRODUCTION_ELIGIBILITY_REQUIRED');
  assert.equal(productionDenied.executed, false);
  assert.equal(productionActionCalls, 0);

  // P1: exact object/action/scope binding is enforced in the kernel.
  const governedHighImpactObject = createGovernedObject({
    id: 'high-impact-object',
    type: 'PRODUCT',
    owner: 'OWNER',
    rights: 'OWNED',
    source: 'PRIMARY',
    provenance: 'EVIDENCE',
    classification: 'HIGH'
  });

  const boundAuth = authorize({
    authorizationId: 'AUTH-HIGH-001',
    objectId: 'high-impact-object',
    action: 'EXECUTE',
    scope: ['production'],
    approvedBy: 'TEST_REVIEWER'
  });

  const baseHighImpactContext = {
    evidenceVerified: true,
    evidenceId: 'EVIDENCE-HIGH-1',
    evidenceSource: 'TEST',
    highImpact: false
  };

  let highImpactExecutionCalls = 0;
  const highImpactAction = {
    id: 'EXECUTE',
    scope: ['production'],
    executable: true,
    execute() {
      highImpactExecutionCalls += 1;
      return 'EXECUTED';
    }
  };

  const wrongObjectAuth = authorize({
    authorizationId: 'AUTH-WRONG-OBJECT',
    objectId: 'other-object',
    action: 'EXECUTE',
    scope: ['production'],
    approvedBy: 'TEST_REVIEWER'
  });
  assert.equal(
    (await govern({
      object: governedHighImpactObject,
      policy: { shariaApplies: false },
      context: { ...baseHighImpactContext, authorization: wrongObjectAuth },
      action: highImpactAction
    })).allowed,
    false
  );

  const wrongActionAuth = authorize({
    authorizationId: 'AUTH-WRONG-ACTION',
    objectId: 'high-impact-object',
    action: 'OTHER',
    scope: ['production'],
    approvedBy: 'TEST_REVIEWER'
  });
  assert.equal(
    (await govern({
      object: governedHighImpactObject,
      policy: { shariaApplies: false },
      context: { ...baseHighImpactContext, authorization: wrongActionAuth },
      action: highImpactAction
    })).allowed,
    false
  );

  const wrongScopeAuth = authorize({
    authorizationId: 'AUTH-WRONG-SCOPE',
    objectId: 'high-impact-object',
    action: 'EXECUTE',
    scope: ['read'],
    approvedBy: 'TEST_REVIEWER'
  });
  assert.equal(
    (await govern({
      object: governedHighImpactObject,
      policy: { shariaApplies: false },
      context: { ...baseHighImpactContext, authorization: wrongScopeAuth },
      action: highImpactAction
    })).allowed,
    false
  );
  assert.equal(highImpactExecutionCalls, 0);

  // Correct reusable authorization succeeds after all gates.
  const allowedReusable = await govern({
    object: governedHighImpactObject,
    policy: { shariaApplies: false },
    context: { ...baseHighImpactContext, authorization: boundAuth },
    action: highImpactAction
  });
  assert.equal(allowedReusable.allowed, true);
  assert.equal(allowedReusable.executed, true);
  assert.equal(highImpactExecutionCalls, 1);

  // P1: single-use authorization requires persistent atomic consumption.
  const singleUseAuth = authorize({
    authorizationId: 'AUTH-SINGLE-001',
    objectId: 'high-impact-object',
    action: 'EXECUTE',
    scope: ['production'],
    approvedBy: 'TEST_REVIEWER',
    singleUse: true
  });

  const missingStore = await govern({
    object: governedHighImpactObject,
    policy: { shariaApplies: false },
    context: { ...baseHighImpactContext, authorization: singleUseAuth },
    action: highImpactAction
  });
  assert.equal(missingStore.allowed, false);
  assert.equal(missingStore.reason, 'PERSISTENT_CLAIM_STORE_REQUIRED');

  let databaseWinnerAvailable = true;
  const fakeClient = {
    async query(sql) {
      assert.equal(
        sql.includes('UPDATE sheikha_foundation.authorization_claims'),
        true
      );
      if (!databaseWinnerAvailable) return { rows: [] };
      databaseWinnerAvailable = false;
      return { rows: [{ authorization_id: 'AUTH-SINGLE-001' }] };
    }
  };
  const atomicStore = buildPostgresAuthorizationClaimStore(fakeClient);

  const firstSingleUse = await govern({
    object: governedHighImpactObject,
    policy: { shariaApplies: false },
    context: {
      ...baseHighImpactContext,
      authorization: singleUseAuth,
      authorizationClaimStore: atomicStore
    },
    action: highImpactAction
  });
  assert.equal(firstSingleUse.allowed, true);
  assert.equal(firstSingleUse.executed, true);
  assert.equal(firstSingleUse.authorizationDecision.consumed, true);

  const replaySingleUse = await govern({
    object: governedHighImpactObject,
    policy: { shariaApplies: false },
    context: {
      ...baseHighImpactContext,
      authorization: singleUseAuth,
      authorizationClaimStore: atomicStore
    },
    action: highImpactAction
  });
  assert.equal(replaySingleUse.allowed, false);
  assert.equal(replaySingleUse.executed, false);
  assert.equal(highImpactExecutionCalls, 2);

  const unavailableStore = buildPostgresAuthorizationClaimStore({
    async query() {
      throw new Error('database unavailable');
    }
  });
  const unavailableDenied = await govern({
    object: governedHighImpactObject,
    policy: { shariaApplies: false },
    context: {
      ...baseHighImpactContext,
      authorization: authorize({
        authorizationId: 'AUTH-DB-DOWN',
        objectId: 'high-impact-object',
        action: 'EXECUTE',
        scope: ['production'],
        approvedBy: 'TEST_REVIEWER',
        singleUse: true
      }),
      authorizationClaimStore: unavailableStore
    },
    action: highImpactAction
  });
  assert.equal(unavailableDenied.allowed, false);
  assert.equal(unavailableDenied.executed, false);

  // Low-impact read-only compatibility remains intact.
  const readOnlyObject = createGovernedObject({
    id: 'read-only',
    type: 'REPORT'
  });
  const readOnlyResult = await govern({
    object: readOnlyObject,
    policy: { shariaApplies: false },
    context: {
      evidenceVerified: true,
      evidenceId: 'EVIDENCE-READ-1',
      evidenceSource: 'TEST',
      highImpact: false
    }
  });
  assert.equal(readOnlyResult.allowed, true);
  assert.equal(readOnlyResult.executed, false);

  // A pristine PostgreSQL database must create the immutable ledger before
  // the provisioner attempts its first ledger lookup.
  const schemaDirectory = path.join(__dirname, 'schema', 'postgresql');
  const migrationPlan = [
    loadMigration({
      id: BOOTSTRAP_MIGRATION_ID,
      path: path.join(schemaDirectory, '000_sheikha_schema_migrations_v1.sql'),
      appliedBy: 'TEST_OPERATOR',
      evidenceRef: 'TEST_EVIDENCE_000'
    }),
    loadMigration({
      id: '001_sheikha_authorization_claims_v1',
      path: path.join(schemaDirectory, '001_sheikha_authorization_claims_v1.sql'),
      appliedBy: 'TEST_OPERATOR',
      evidenceRef: 'TEST_EVIDENCE_001'
    })
  ];
  const provisionTrace = [];
  const migrationLedger = new Map();
  let ledgerExists = false;
  const provisionClient = {
    async query(sql, parameters = []) {
      provisionTrace.push({ sql, parameters });
      if (sql === 'BEGIN' || sql === 'COMMIT' || sql === 'ROLLBACK') return { rows: [] };
      if (sql.includes('pg_advisory_xact_lock')) return { rows: [] };
      if (sql.startsWith('SELECT to_regclass')) {
        return { rows: [{ ledger: ledgerExists ? parameters[0] : null }] };
      }
      if (sql === migrationPlan[0].sql) {
        ledgerExists = true;
        return { rows: [] };
      }
      if (sql.startsWith('SELECT checksum_sha256')) {
        assert.equal(ledgerExists, true);
        const checksum = migrationLedger.get(parameters[0]);
        return { rows: checksum ? [{ checksum_sha256: checksum }] : [] };
      }
      if (sql === migrationPlan[1].sql) {
        assert.equal(ledgerExists, true);
        return { rows: [] };
      }
      if (sql.includes('INSERT INTO sheikha_foundation.schema_migrations')) {
        migrationLedger.set(parameters[0], parameters[1]);
        return { rows: [] };
      }
      throw new Error('UNEXPECTED_PROVISIONING_QUERY');
    }
  };

  const firstProvision = await provisionSchema({
    client: provisionClient,
    operatorAuthorized: true,
    migrations: migrationPlan
  });
  assert.equal(firstProvision.ok, true);
  assert.equal(migrationLedger.size, 2);
  assert.equal(
    provisionTrace.findIndex(({ sql }) => sql === migrationPlan[0].sql) <
      provisionTrace.findIndex(({ sql }) => sql.startsWith('SELECT checksum_sha256')),
    true
  );

  const secondProvision = await provisionSchema({
    client: provisionClient,
    operatorAuthorized: true,
    migrations: migrationPlan
  });
  assert.equal(secondProvision.ok, true);
  assert.equal(
    provisionTrace.filter(({ sql }) => sql === migrationPlan[0].sql).length,
    1
  );
  assert.equal(
    provisionTrace.filter(({ sql }) => sql === migrationPlan[1].sql).length,
    1
  );

  const checksumConflict = await provisionSchema({
    client: provisionClient,
    operatorAuthorized: true,
    migrations: [{
      ...migrationPlan[0],
      checksum: 'tampered-bootstrap-checksum',
      sql: 'DANGEROUS_BOOTSTRAP_SQL_MUST_NOT_EXECUTE'
    }, migrationPlan[1]]
  });
  assert.equal(checksumConflict.ok, false);
  assert.equal(checksumConflict.reason, 'MIGRATION_CHECKSUM_CONFLICT');
  assert.equal(
    provisionTrace.some(({ sql }) => sql === 'DANGEROUS_BOOTSTRAP_SQL_MUST_NOT_EXECUTE'),
    false
  );

  const missingBootstrap = await provisionSchema({
    client: provisionClient,
    operatorAuthorized: true,
    migrations: [migrationPlan[1]]
  });
  assert.equal(missingBootstrap.ok, false);
  assert.equal(missingBootstrap.reason, 'BOOTSTRAP_MIGRATION_MUST_BE_FIRST');

  process.stdout.write(
    'SHEIKHA_FOUNDATION_V5_AUTHORIZATION_GOVERNANCE_REPAIR_STATIC_TEST_TARGET_READY=true\n'
  );
  // Keep the previous marker for workflow/backward compatibility.
  process.stdout.write(
    'SHEIKHA_FOUNDATION_V4_QURAN_POLICY_MAPPING_GATE_REPAIR_STATIC_TEST_TARGET_READY=true\n'
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
