#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const BASE_DIR = path.join(ROOT, 'infrastructure', 'sheikha-generative-rag-core');

function exists(relPath) {
    return fs.existsSync(path.join(BASE_DIR, relPath));
}

function main() {
    const checks = [
        { name: 'generative-rag-core-spec.json', exists: exists('generative-rag-core-spec.json') },
        { name: 'models/model-router.json', exists: exists('models/model-router.json') },
        { name: 'rag/rag-retrieval-pipeline.json', exists: exists('rag/rag-retrieval-pipeline.json') },
        { name: 'knowledge/knowledge-sources-map.json', exists: exists('knowledge/knowledge-sources-map.json') },
        { name: 'integration/computing-rag-integration.json', exists: exists('integration/computing-rag-integration.json') },
        { name: 'innovation/smart-model-blueprint.json', exists: exists('innovation/smart-model-blueprint.json') },
        { name: 'governance/generative-rag-governance.json', exists: exists('governance/generative-rag-governance.json') }
    ];

    const score = Math.round((checks.filter((c) => c.exists).length / checks.length) * 100);

    console.log(JSON.stringify({
        success: true,
        data: {
            baseDir: BASE_DIR,
            readinessScore: score,
            checks
        },
        message: score === 100
            ? 'نواة الذكاء التوليدي وRAG مفعلة بالكامل'
            : 'نواة الذكاء التوليدي وRAG غير مكتملة',
        timestamp: new Date().toISOString()
    }, null, 4));
}

main();