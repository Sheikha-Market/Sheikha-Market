'use strict';

const express = require('express');

const governance = require(
  '../../core/production-safety/'
  + 'sheikha-production-risk-to-safe-governance-v1'
);

const router = express.Router();

const CONTRACT =
  'SHEIKHA_PRODUCTION_RISK_TO_SAFE_HTTP_ADAPTER_V1';

const ASSESSMENT_SYSTEM =
  'SHEIKHA_PRODUCTION_RISK_TO_SAFE_HTTP_ASSESSMENT_V1';

const JSON_LIMIT = '32kb';

function setGovernedHeaders(_req, res, next) {
  res.setHeader(
    'X-Sheikha-Contract',
    CONTRACT
  );
  res.setHeader(
    'X-Sheikha-Decision-Authority',
    'HUMAN_ONLY'
  );
  res.setHeader(
    'Cache-Control',
    'no-store, max-age=0'
  );
  res.setHeader(
    'Pragma',
    'no-cache'
  );
  res.setHeader(
    'X-Content-Type-Options',
    'nosniff'
  );

  next();
}

function methodNotAllowed(allowed) {
  return (_req, res) => {
    res.setHeader('Allow', allowed);

    res.status(405).json({
      schemaVersion: '1.0.0',
      system:
        'SHEIKHA_PRODUCTION_RISK_TO_SAFE_HTTP_METHOD_POLICY_V1',
      status: 'METHOD_NOT_ALLOWED',
      allowed,
      externalMutationPerformed: false,
      productionDeploymentExecuted: false,
      servicesRestarted: false,
      cleanupAuthorized: false
    });
  };
}

function normalizeAssessmentInput(body) {
  const source = (
    body
    && typeof body === 'object'
    && !Array.isArray(body)
  )
    ? body
    : {};

  return {
    driftClassification:
      source.driftClassification,
    baselineVerified:
      source.baselineVerified === true,
    evidenceComplete:
      source.evidenceComplete === true,
    currentReleaseVerified:
      source.currentReleaseVerified === true,
    rollbackReleaseRetained:
      source.rollbackReleaseRetained === true,
    endpointsVerified:
      source.endpointsVerified === true,
    contractsVerified:
      source.contractsVerified === true,
    storageWithinLimit:
      source.storageWithinLimit === true,
    retentionPolicyVerified:
      source.retentionPolicyVerified === true,

    // External requests cannot grant approval.
    humanApproval: false
  };
}

router.use(setGovernedHeaders);

router.get('/status', (_req, res) => {
  const result = governance.status();

  res.status(200).json({
    ...result,
    httpAdapter: CONTRACT,
    assessmentEndpoint:
      '/api/sheikha/production-risk-to-safe/v1/assess',
    externalAssessmentMayGrantApproval: false
  });
});

router.all('/status', methodNotAllowed('GET'));

router.get('/verify', (_req, res) => {
  const result = governance.verify();

  res.status(
    result.passed ? 200 : 503
  ).json({
    ...result,
    httpAdapter: CONTRACT,
    externalAssessmentMayGrantApproval: false
  });
});

router.all('/verify', methodNotAllowed('GET'));

router.post(
  '/assess',
  express.json({
    limit: JSON_LIMIT,
    strict: true
  }),
  (req, res) => {
    const requestHumanApprovalIgnored = (
      req.body
      && typeof req.body === 'object'
      && Object.prototype.hasOwnProperty.call(
        req.body,
        'humanApproval'
      )
    );

    const input = normalizeAssessmentInput(
      req.body
    );

    const assessment =
      governance.assessProductionRisk(input);

    res.status(200).json({
      schemaVersion: '1.0.0',
      system: ASSESSMENT_SYSTEM,
      status: 'ASSESSED',
      contract: CONTRACT,
      approvalAuthority: 'HUMAN_ONLY',
      requestHumanApprovalIgnored,
      externalAssessmentMayGrantApproval: false,
      recommendationOnly: true,
      assessment
    });
  }
);

router.all('/assess', methodNotAllowed('POST'));

router.use((_req, res) => {
  res.status(404).json({
    schemaVersion: '1.0.0',
    system:
      'SHEIKHA_PRODUCTION_RISK_TO_SAFE_HTTP_NOT_FOUND_V1',
    status: 'NOT_FOUND',
    externalMutationPerformed: false,
    cleanupAuthorized: false
  });
});

router.use((error, _req, res, _next) => {
  const tooLarge = (
    error
    && error.type === 'entity.too.large'
  );

  res.status(
    tooLarge ? 413 : 400
  ).json({
    schemaVersion: '1.0.0',
    system:
      'SHEIKHA_PRODUCTION_RISK_TO_SAFE_HTTP_INPUT_POLICY_V1',
    status:
      tooLarge
        ? 'PAYLOAD_TOO_LARGE'
        : 'INVALID_JSON',
    externalMutationPerformed: false,
    cleanupAuthorized: false
  });
});

module.exports = router;
