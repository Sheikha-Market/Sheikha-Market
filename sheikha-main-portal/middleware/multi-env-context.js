'use strict';

const blueprint = require('../lib/sheikha-multi-env-blueprint');

function contextLoader(req, res, next) {
    const environmentHeader = req.headers['x-runtime-environment'] || req.query.environment;
    const sectorHeader = req.headers['x-platform-sector'] || req.query.sector;
    const criticalityHeader = req.headers['x-platform-criticality'] || req.query.criticality;

    const environment = blueprint.normalizeEnvironmentName(environmentHeader);
    const sector = blueprint.normalizeSector(sectorHeader);

    if (environmentHeader && !environment) {
        return res.status(400).json({
            success: false,
            error: 'invalid_environment',
            message: 'قيمة X-Runtime-Environment غير مدعومة',
            timestamp: new Date().toISOString()
        });
    }

    if (sectorHeader && !sector) {
        return res.status(400).json({
            success: false,
            error: 'invalid_sector',
            message: 'قيمة X-Platform-Sector غير مدعومة',
            timestamp: new Date().toISOString()
        });
    }

    req.multiEnvContext = {
        environment: environment || blueprint.normalizeEnvironmentName(''),
        sector: sector || blueprint.normalizeSector(''),
        criticality: String(criticalityHeader || '').trim().toLowerCase() || undefined
    };

    return next();
}

module.exports = {
    contextLoader
};
