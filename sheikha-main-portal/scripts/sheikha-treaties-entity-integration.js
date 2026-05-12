#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const LEGAL_REGISTRY_PATH = path.join(DATA_DIR, 'sheikha-legal-and-treaty-registry.json');
const UNIFIED_GOALS_PATH = path.join(DATA_DIR, 'sheikha-unified-sector-goals.json');
const OUT_PATH = path.join(DATA_DIR, 'sheikha-legal-treaty-entity-integration.json');

function readJson(filePath, fallback = null) {
    try {
        if (!fs.existsSync(filePath)) {
            return fallback;
        }
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
        console.warn(`Unable to read ${filePath}: ${error.message}`);
        return fallback;
    }
}

function collectAllInstruments(registryData) {
    return [
        ...(registryData?.saudiInternalLaw || []),
        ...(registryData?.internalAgreements || []),
        ...(registryData?.internationalLawFrameworks || []),
        ...(registryData?.internationalTreatiesCommercial || []),
        ...(registryData?.internationalTreatiesNonCommercial || [])
    ];
}

function matchInstruments(entity, instruments) {
    const scope = entity.scope || 'internal';
    const sector = entity.sectorType || 'mixed';

    return instruments.filter((instrument) => {
        if (scope === 'internal' && instrument.scope !== 'internal') {
            return false;
        }
        if (scope === 'external' && instrument.scope !== 'external') {
            return false;
        }
        if (scope === 'commercial' && !String(instrument.type).includes('commercial')) {
            return false;
        }
        if (scope === 'charitable' && String(instrument.type).includes('commercial')) {
            return false;
        }

        if (sector === 'charitable' && String(instrument.domain).includes('trade')) {
            return false;
        }

        return true;
    });
}

function main() {
    const legalRegistry = readJson(LEGAL_REGISTRY_PATH, { data: {} });
    const unified = readJson(UNIFIED_GOALS_PATH, { data: {} });

    const instruments = collectAllInstruments(legalRegistry.data || {});
    const entities = unified?.data?.unifiedEntities || [];

    const mappedEntities = entities.map((entity) => {
        const links = matchInstruments(entity, instruments)
            .slice(0, 8)
            .map((instrument) => ({
                instrumentId: instrument.id,
                title: instrument.title,
                type: instrument.type,
                status: instrument.status,
                domain: instrument.domain,
                shariaBasis: instrument?.sharia?.basis || 'الكتاب والسنة'
            }));

        return {
            entityName: entity.entityName,
            scope: entity.scope,
            sectorType: entity.sectorType,
            integratedInstruments: links,
            integrationStatus: links.length > 0 ? 'linked' : 'pending-link',
            reviewCycle: 'quarterly'
        };
    });

    const payload = {
        success: true,
        data: {
            generatedAt: new Date().toISOString(),
            covenant: {
                basis: 'الكتاب والسنة',
                declaration: 'ربط الجهات آلياً بالاتفاقيات والقوانين ذات الصلة لدعم التنفيذ المنضبط.'
            },
            statistics: {
                entities: mappedEntities.length,
                instruments: instruments.length,
                linkedEntities: mappedEntities.filter((x) => x.integrationStatus === 'linked').length
            },
            entities: mappedEntities
        },
        message: 'تم بناء مصفوفة التكامل الآلي بين الجهات والاتفاقيات والقوانين',
        timestamp: new Date().toISOString()
    };

    fs.writeFileSync(OUT_PATH, JSON.stringify(payload, null, 4), 'utf8');
    console.log(`Legal/treaty integration written: ${OUT_PATH}`);
    console.log(`Entities linked                : ${payload.data.statistics.linkedEntities}/${payload.data.statistics.entities}`);
}

main();