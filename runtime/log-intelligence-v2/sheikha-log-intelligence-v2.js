'use strict';

function classifyEvent(line = '', health = {}) {
  const text = String(line);

  const serviceHealthy =
    health.localHealth === '200' &&
    health.publicHealth === '200' &&
    health.unifiedChatStatus === '200';

  if (/backend .* has no server available|Layer7 timeout|Server .* is DOWN/i.test(text)) {
    if (serviceHealthy) {
      return {
        severity: 'NOISE',
        category: 'HAPROXY_FALSE_POSITIVE',
        risk: 'LOW',
        action: 'SUPPRESS_WITH_AUDIT',
        reason: 'HAProxy warning exists while runtime health endpoints are healthy.'
      };
    }

    return {
      severity: 'WARNING',
      category: 'HAPROXY_HEALTH_CHECK',
      risk: 'SERVICE_HEALTH_FLAP',
      action: 'VERIFY_NODE_AND_HAPROXY',
      reason: 'HAProxy warning with unhealthy or unknown runtime health.'
    };
  }

  if (/ERROR|Exception|internal_error|ECONNRESET|ETIMEDOUT/i.test(text)) {
    return {
      severity: 'ERROR',
      category: 'RUNTIME_ERROR',
      risk: 'EXECUTION_FAILURE',
      action: 'REQUIRE_ROOT_CAUSE_ANALYSIS',
      reason: 'Runtime error detected.'
    };
  }

  return {
    severity: 'INFO',
    category: 'GENERAL',
    risk: 'NONE',
    action: 'OBSERVE',
    reason: 'General log event.'
  };
}

function aggregate(lines = [], health = {}) {
  const events = lines.map((line) => classifyEvent(line, health));

  const counts = events.reduce((acc, e) => {
    acc[e.severity] = (acc[e.severity] || 0) + 1;
    acc[e.category] = (acc[e.category] || 0) + 1;
    return acc;
  }, {});

  const realProblems = events.filter((e) => ['ERROR', 'CRITICAL', 'WARNING'].includes(e.severity));
  const decision = realProblems.length > 0 ? 'ATTENTION' : 'HEALTHY';

  return {
    success: true,
    engine: 'SHEIKHA_LOG_INTELLIGENCE_V2',
    status: 'ACTIVE',
    generatedAt: new Date().toISOString(),
    decision,
    health,
    counts,
    suppressedNoise: counts.NOISE || 0,
    realProblems: realProblems.slice(0, 30),
    governance: {
      noiseSuppressionWithAudit: true,
      noDestructiveAutoRepair: true,
      healthEvidenceRequiredBeforeSuppressing: true,
      highImpactRequiresHumanReview: true
    }
  };
}

module.exports = { classifyEvent, aggregate };
