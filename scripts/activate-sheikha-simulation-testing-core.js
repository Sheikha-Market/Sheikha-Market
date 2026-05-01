#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const FORCE = process.argv.includes('--force');

const CORE_DIR = path.join(ROOT, 'infrastructure', 'sheikha-simulation-testing-core');
const CONFIG_PATH = path.join(ROOT, 'config', 'sheikha-simulation-testing-core.json');

function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

function writeJson(filePath, payload) {
    fs.writeFileSync(filePath, JSON.stringify(payload, null, 4) + '\n', 'utf8');
}

function readConfig() {
    if (!fs.existsSync(CONFIG_PATH)) {
        console.error('[simulation-testing-core] config not found: ' + CONFIG_PATH);
        process.exit(1);
    }
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
}

function shouldSkip(filePath) {
    return !FORCE && fs.existsSync(filePath);
}

function main() {
    const config = readConfig();
    const ts = new Date().toISOString();
    const artifacts = [];

    const subdirs = ['scenarios', 'queries', 'benchmarks', 'results', 'regression', 'governance'];
    subdirs.forEach((d) => ensureDir(path.join(CORE_DIR, d)));

    // 1 — مواصفة نواة التجربة
    const specPath = path.join(CORE_DIR, 'simulation-testing-core-spec.json');
    if (!shouldSkip(specPath)) {
        writeJson(specPath, {
            core: config.core,
            version: config.version,
            title: config.title,
            description: config.description,
            activatedAt: ts,
            governancePolicy: config.governancePolicy,
            testingPhilosophy: config.testingPhilosophy
        });
    }
    artifacts.push({ file: specPath, written: !shouldSkip(specPath) || FORCE });

    // 2 — كتالوج السيناريوهات
    const scenariosPath = path.join(CORE_DIR, 'scenarios', 'test-scenarios-catalog.json');
    if (!shouldSkip(scenariosPath)) {
        writeJson(scenariosPath, {
            generatedAt: ts,
            engine: config.simulationEngine,
            ragScenarios: config.testScenarios.ragQueries,
            stressTests: config.testScenarios.stressTests,
            regressionSuite: config.testScenarios.regressionSuite
        });
    }
    artifacts.push({ file: scenariosPath, written: !shouldSkip(scenariosPath) || FORCE });

    // 3 — بنك استعلامات RAG
    const queriesPath = path.join(CORE_DIR, 'queries', 'rag-query-simulation-bank.json');
    if (!shouldSkip(queriesPath)) {
        writeJson(queriesPath, {
            generatedAt: ts,
            queries: config.testScenarios.ragQueries.map((q) => ({
                id: q.id,
                categoryAr: q.categoryAr,
                query: q.query,
                expectedOutputKeys: q.expectedOutputKeys,
                acceptanceCriteria: q.acceptanceCriteria,
                lastRunAt: null,
                lastResult: null
            }))
        });
    }
    artifacts.push({ file: queriesPath, written: !shouldSkip(queriesPath) || FORCE });

    // 4 — معايير الأداء
    const benchmarksPath = path.join(CORE_DIR, 'benchmarks', 'performance-benchmarks.json');
    if (!shouldSkip(benchmarksPath)) {
        writeJson(benchmarksPath, {
            generatedAt: ts,
            benchmarks: config.benchmarks,
            stressTestProfiles: config.testScenarios.stressTests
        });
    }
    artifacts.push({ file: benchmarksPath, written: !shouldSkip(benchmarksPath) || FORCE });

    // 5 — سجل نتائج المحاكاة
    const resultsPath = path.join(CORE_DIR, 'results', 'simulation-results-log.json');
    if (!shouldSkip(resultsPath)) {
        writeJson(resultsPath, {
            generatedAt: ts,
            runs: [],
            lastRun: null,
            reportingPolicy: config.reportingPolicy
        });
    }
    artifacts.push({ file: resultsPath, written: !shouldSkip(resultsPath) || FORCE });

    // 6 — حوكمة التجربة
    const govPath = path.join(CORE_DIR, 'governance', 'simulation-governance.json');
    if (!shouldSkip(govPath)) {
        writeJson(govPath, {
            generatedAt: ts,
            policySource: 'quran-and-sunnah',
            mandatoryChecks: config.testingPhilosophy.mandatoryChecks,
            reportingPolicy: config.reportingPolicy,
            blockPromotionOnCriticalFailure: config.reportingPolicy.blockPromotionOnCriticalFailure,
            ownerApprovalRequired: true
        });
    }
    artifacts.push({ file: govPath, written: !shouldSkip(govPath) || FORCE });

    const writtenCount = artifacts.filter((a) => a.written).length;

    console.log(JSON.stringify({
        success: true,
        message: 'تم تفعيل نواة التجربة والمحاكاة لشيخة',
        data: {
            core: 'sheikha-simulation-testing-core',
            activatedAt: ts,
            force: FORCE,
            artifacts: artifacts.map((a) => ({
                file: path.relative(ROOT, a.file),
                written: a.written
            })),
            writtenCount
        },
        timestamp: ts
    }, null, 4));
}

main();
