#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const FORCE = process.argv.includes('--force');

const CORE_DIR = path.join(ROOT, 'infrastructure', 'sheikha-training-core');
const CONFIG_PATH = path.join(ROOT, 'config', 'sheikha-training-core.json');

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
        console.error('[training-core] config not found: ' + CONFIG_PATH);
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

    // الأدلة المطلوبة
    const subdirs = ['sessions', 'datasets', 'pipelines', 'evaluation', 'registry', 'governance'];
    subdirs.forEach((d) => ensureDir(path.join(CORE_DIR, d)));

    // 1 — مواصفة نواة التدريب
    const specPath = path.join(CORE_DIR, 'training-core-spec.json');
    if (!shouldSkip(specPath)) {
        writeJson(specPath, {
            core: config.core,
            version: config.version,
            title: config.title,
            description: config.description,
            activatedAt: ts,
            governancePolicy: config.governancePolicy,
            trainingPhilosophy: config.trainingPhilosophy
        });
    }
    artifacts.push({ file: specPath, written: !shouldSkip(specPath) || FORCE });

    // 2 — كتالوج الجلسات التدريبية
    const sessionsPath = path.join(CORE_DIR, 'sessions', 'training-sessions-catalog.json');
    if (!shouldSkip(sessionsPath)) {
        writeJson(sessionsPath, {
            generatedAt: ts,
            sessions: [
                {
                    id: 'session-rag-v1',
                    modelTarget: 'sheikha-rag-reasoner-v1',
                    domain: 'metals-scrap-market',
                    status: 'pending',
                    epochs: config.trainingSessionConfig.defaultEpochs,
                    batchSize: config.trainingSessionConfig.batchSize
                },
                {
                    id: 'session-sharia-classifier-v1',
                    modelTarget: 'sharia-compliance-classifier',
                    domain: 'sharia-sciences',
                    status: 'pending',
                    epochs: config.trainingSessionConfig.defaultEpochs,
                    batchSize: config.trainingSessionConfig.batchSize
                },
                {
                    id: 'session-branch-autogenesis-v1',
                    modelTarget: 'branch-autogenesis-model',
                    domain: 'science-integration',
                    status: 'pending',
                    epochs: config.trainingSessionConfig.defaultEpochs,
                    batchSize: config.trainingSessionConfig.batchSize
                }
            ]
        });
    }
    artifacts.push({ file: sessionsPath, written: !shouldSkip(sessionsPath) || FORCE });

    // 3 — مانيفيست مجموعات البيانات
    const datasetsPath = path.join(CORE_DIR, 'datasets', 'training-datasets-manifest.json');
    if (!shouldSkip(datasetsPath)) {
        writeJson(datasetsPath, {
            generatedAt: ts,
            datasets: config.trainingDatasets.domains,
            governanceChecks: ['source-verification', 'sharia-filtering', 'deduplication', 'arabic-normalization']
        });
    }
    artifacts.push({ file: datasetsPath, written: !shouldSkip(datasetsPath) || FORCE });

    // 4 — خط أنابيب التدريب
    const pipelinePath = path.join(CORE_DIR, 'pipelines', 'training-pipeline.json');
    if (!shouldSkip(pipelinePath)) {
        writeJson(pipelinePath, {
            generatedAt: ts,
            pipeline: config.trainingPipeline,
            config: config.trainingSessionConfig,
            continuousLearning: config.continuousLearning
        });
    }
    artifacts.push({ file: pipelinePath, written: !shouldSkip(pipelinePath) || FORCE });

    // 5 — إطار التقييم
    const evalPath = path.join(CORE_DIR, 'evaluation', 'training-evaluation-framework.json');
    if (!shouldSkip(evalPath)) {
        writeJson(evalPath, {
            generatedAt: ts,
            promotionGates: config.modelRegistry.promotionGates,
            metrics: {
                shariaComplianceRate: { target: 1.0, description: 'صفر انتهاكات شرعية' },
                ragAnswerCoverage: { target: 0.92, description: 'تغطية الإجابات بالمصادر' },
                hallucinationRate: { target: 0.0, description: 'صفر معلومات مخترعة' },
                arabicNlpAccuracy: { target: 0.95, description: 'دقة معالجة العربية' }
            },
            shariaReviewSteps: config.trainingPipeline.stages.find((s) => s.id === 'sharia-review') || {}
        });
    }
    artifacts.push({ file: evalPath, written: !shouldSkip(evalPath) || FORCE });

    // 6 — حوكمة التدريب
    const govPath = path.join(CORE_DIR, 'governance', 'training-governance.json');
    if (!shouldSkip(govPath)) {
        writeJson(govPath, {
            generatedAt: ts,
            policySource: 'quran-and-sunnah',
            prohibitedTrainingData: config.trainingPhilosophy.forbiddenPatterns,
            modelRegistryPolicy: config.modelRegistry,
            continuousLearningPolicy: config.continuousLearning,
            ownerApprovalRequired: true
        });
    }
    artifacts.push({ file: govPath, written: !shouldSkip(govPath) || FORCE });

    const writtenCount = artifacts.filter((a) => a.written).length;

    console.log(JSON.stringify({
        success: true,
        message: 'تم تفعيل نواة التدريب لشيخة',
        data: {
            core: 'sheikha-training-core',
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
