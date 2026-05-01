#!/usr/bin/env node

const {
    activateSheikhaUltimateIntelligence
} = require('../lib/sheikha-civilian-research-hpc.js');

function parseArgs(argv) {
    const args = {
        agentName: 'SHEIKHA_CODE_AGENT_MESH',
        activationMode: 'advanced-specialist-mesh',
        runtime: 'terminal',
        animate: true,
        agents: ['orchestrator', 'backend', 'frontend', 'security', 'performance', 'devops', 'data', 'shariaCompliance']
    };

    argv.forEach(item => {
        if (item.startsWith('--agent=')) args.agentName = item.split('=').slice(1).join('=') || args.agentName;
        if (item.startsWith('--mode=')) args.activationMode = item.split('=').slice(1).join('=') || args.activationMode;
        if (item === '--no-animate') args.animate = false;
    });

    return args;
}

(async () => {
    try {
        const options = parseArgs(process.argv.slice(2));
        const result = await activateSheikhaUltimateIntelligence(options);

        console.log('');
        console.log('✅ Agent Activation Result');
        console.log(JSON.stringify({
            success: result.success,
            mode: result.mode,
            activationMode: result.mesh && result.mesh.identity && result.mesh.identity.activation && result.mesh.identity.activation.mode,
            signature: result.mesh && result.mesh.identity && result.mesh.identity.digitalSignature && result.mesh.identity.digitalSignature.short,
            agentName: result.mesh && result.mesh.identity && result.mesh.identity.digitalIdentity && result.mesh.identity.digitalIdentity.agentName,
            codeSpecialists: result.mesh && result.mesh.specialist && result.mesh.specialist.activatedCount,
            productionSpecialists: result.production && result.production.activatedCount,
            intelligenceMerged: result.intelligence && result.intelligence.mergedCount,
            timestamp: result.timestamp
        }, null, 2));

        process.exit(result.success ? 0 : 1);
    } catch (error) {
        console.error('❌ فشل تشغيل شبكة الوكلاء المتخصصة:', error && error.message ? error.message : error);
        process.exit(1);
    }
})();
