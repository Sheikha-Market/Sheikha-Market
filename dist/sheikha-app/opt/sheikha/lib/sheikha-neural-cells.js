/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * بسم الله الرحمن الرحيم
 * SHEIKHA NEURAL CELLS — واجهة موحّدة لخلايا الشبكة العصبية الجذرية
 * ═══════════════════════════════════════════════════════════════════════════════
 * يُعيد تصدير خلايا الشبكة الجذرية للاستخدام المباشر في أي مكان
 */

'use strict';

const rootNeuralNetwork = require('./sheikha-root-neural-network');

module.exports = {
    // الشبكة الجذرية الكاملة
    rootNeuralNetwork,

    // دوال الاستخدام المباشر
    shariaCheck:        (f) => rootNeuralNetwork.shariaCheck(f),
    riskAnalysis:       (f) => rootNeuralNetwork.riskAnalysis(f),
    marketIntelligence: (f) => rootNeuralNetwork.marketIntelligence(f),
    governanceDecision: (f) => rootNeuralNetwork.governanceDecision(f),
    analyzeText:        (t) => rootNeuralNetwork.analyzeText(t),
    textSimilarity:     (t1, t2) => rootNeuralNetwork.textSimilarity(t1, t2),
    similarWords:       (w, k) => rootNeuralNetwork.similarWords(w, k),
    orchestrate:        (ctx) => rootNeuralNetwork.orchestrate(ctx),
    getStatus:          ()    => rootNeuralNetwork.getStatus(),
    ensureBooted:       ()    => rootNeuralNetwork.ensureBooted()
};
