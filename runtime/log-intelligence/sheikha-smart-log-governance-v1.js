'use strict';

function classify(line = '') {
  const text = String(line);

  if (/backend .* has no server available|Layer7 timeout|Server .* is DOWN/i.test(text)) {
    return {
      severity: 'WARNING',
      category: 'HAPROXY_HEALTH_CHECK',
      risk: 'SERVICE_HEALTH_FLAP',
      recommendedAction: 'INCREASE_HAPROXY_CHECK_TIMEOUT_AND_VERIFY_NODE_HEALTH',
      autoRepairAllowed: true
    };
  }

  if (/DATA_ENCRYPTION_KEY.*غير مضبوط|DATA_ENCRYPTION_KEY.*missing/i.test(text)) {
    return {
      severity: 'CRITICAL',
      category: 'SECURITY_CONFIG',
      risk: 'MISSING_ENCRYPTION_KEY',
      recommendedAction: 'REQUIRE_SECRET_ROTATION_MANUAL_APPROVAL',
      autoRepairAllowed: false
    };
  }

  if (/internal_error|Empty reply from server|ECONNRESET/i.test(text)) {
    return {
      severity: 'ERROR',
      category: 'CHAT_RUNTIME',
      risk: 'CHAT_EXECUTION_FAILURE',
      recommendedAction: 'CHECK_MODEL_EXECUTOR_AND_RUNTIME_LOGS',
      autoRepairAllowed: false
    };
  }

  return {
    severity: 'INFO',
    category: 'GENERAL',
    risk: 'NONE',
    recommendedAction: 'OBSERVE',
    autoRepairAllowed: false
  };
}

function summarize(lines = []) {
  const findings = lines.map(classify);
  const counts = findings.reduce((acc, item) => {
    acc[item.severity] = (acc[item.severity] || 0) + 1;
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {});

  return {
    success: true,
    engine: 'SHEIKHA_SMART_LOG_GOVERNANCE_V1',
    status: 'ACTIVE',
    generatedAt: new Date().toISOString(),
    governance: {
      noDestructiveRepairWithoutReview: true,
      noSecretGenerationInLogs: true,
      humanReviewForSecuritySecrets: true,
      autoRepairScope: [
        'haproxy timeout tuning',
        'health-check verification',
        'report generation'
      ]
    },
    counts,
    findings
  };
}

module.exports = { classify, summarize };
