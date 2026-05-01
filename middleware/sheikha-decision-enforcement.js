const decisionFlow = require('../lib/sheikha-decision-flow-engine');

module.exports = function sheikhaDecisionEnforcement(req, res, next) {
  try {
    const input = {
      ...(req.body || {}),
      path: req.path,
      method: req.method,
      module: req.baseUrl || req.originalUrl,
      type: req.body?.type || 'operation'
    };

    const decision = decisionFlow.decide(input);
    req.sheikhaDecision = decision;

    if (!decision.allowed) {
      return res.status(403).json({
        success: false,
        error: 'SHEIKHA_DECISION_BLOCK',
        message: 'تم إيقاف العملية بواسطة محرك القرار الحاكم',
        decision
      });
    }

    next();
  } catch (e) {
    return res.status(500).json({
      success: false,
      error: 'DECISION_ENFORCEMENT_ERROR',
      message: e.message
    });
  }
};
