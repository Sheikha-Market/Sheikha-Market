#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const FORCE = process.argv.includes('--force');
const CORE_DIR = path.join(ROOT, 'infrastructure', 'sheikha-open-markets-core');
const CONFIG_PATH = path.join(ROOT, 'config', 'sheikha-open-markets-core.json');
const REGISTRY_PATH = path.join(ROOT, 'data', 'sheikha-open-markets.json');

function ensureDir(d) {
    if (!fs.existsSync(d)) {
        fs.mkdirSync(d, { recursive: true });
    }
}

function writeJson(filePath, payload) {
    fs.writeFileSync(filePath, JSON.stringify(payload, null, 4) + '\n', 'utf8');
}

function readJson(filePath, fallback) {
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (_) {
        return fallback;
    }
}

function shouldSkip(filePath) {
    return !FORCE && fs.existsSync(filePath);
}

function main() {
    if (!fs.existsSync(CONFIG_PATH)) {
        console.error('[open-markets-core] config not found: ' + CONFIG_PATH);
        process.exit(1);
    }

    const config = readJson(CONFIG_PATH, null);
    if (!config) {
        console.error('[open-markets-core] invalid config json');
        process.exit(1);
    }

    const ts = new Date().toISOString();
    const artifacts = [];

    ['markets', 'innovation', 'projects', 'sharia', 'governance'].forEach((d) => ensureDir(path.join(CORE_DIR, d)));

    const coreSpecPath = path.join(CORE_DIR, 'open-markets-core-spec.json');
    if (!shouldSkip(coreSpecPath)) {
        writeJson(coreSpecPath, {
            core: config.core,
            title: config.title,
            version: config.version,
            activatedAt: ts,
            philosophy: config.philosophy,
            builtInCount: (config.builtInMarkets || []).length
        });
    }
    artifacts.push(coreSpecPath);

    const specializationPath = path.join(CORE_DIR, 'markets', 'specialization-framework.json');
    if (!shouldSkip(specializationPath)) {
        writeJson(specializationPath, {
            generatedAt: ts,
            specializationRule: 'كل سوق له تخصصه حسب الحالة دون وضع حدود بشرية على التوسع',
            builtInMarkets: config.builtInMarkets || [],
            openMarketCategories: config.openMarketCategories || []
        });
    }
    artifacts.push(specializationPath);

    const innovationPath = path.join(CORE_DIR, 'innovation', 'innovation-without-artificial-limits.json');
    if (!shouldSkip(innovationPath)) {
        writeJson(innovationPath, {
            generatedAt: ts,
            innovationEngine: config.innovationEngine || {},
            principle: 'لا حدود إلا حدود الله',
            expansionPolicy: 'يُسمح بفتح سوق/تخصص/مشروع جديد ما لم يخالف الشريعة'
        });
    }
    artifacts.push(innovationPath);

    const projectsPath = path.join(CORE_DIR, 'projects', 'new-projects-blueprint.json');
    if (!shouldSkip(projectsPath)) {
        writeJson(projectsPath, {
            generatedAt: ts,
            allowed: [
                'مشاريع تجارية حلال',
                'مشاريع علمية نافعة',
                'مشاريع تعليم وتعلم',
                'مشاريع بحث واستكشاف',
                'مشاريع ابتكار تقني وصناعي'
            ],
            specializationPolicy: 'التخصص حسب الحالة والقطاع',
            governance: 'الالتزام الكامل بالأحكام الشرعية'
        });
    }
    artifacts.push(projectsPath);

    const shariaPath = path.join(CORE_DIR, 'sharia', 'open-markets-sharia-filter.json');
    if (!shouldSkip(shariaPath)) {
        writeJson(shariaPath, {
            generatedAt: ts,
            shariaFilter: config.shariaFilter || {},
            source: 'القرآن والسنة',
            enforcement: 'mandatory'
        });
    }
    artifacts.push(shariaPath);

    const governancePath = path.join(CORE_DIR, 'governance', 'open-markets-governance.json');
    if (!shouldSkip(governancePath)) {
        writeJson(governancePath, {
            generatedAt: ts,
            ownerApprovalRequired: true,
            policySource: 'quran-and-sunnah',
            noArtificialLimits: true,
            scope: ['markets', 'knowledge', 'science', 'learning', 'education', 'research', 'innovation']
        });
    }
    artifacts.push(governancePath);

    if (!fs.existsSync(REGISTRY_PATH) || FORCE) {
        const initialRegistry = {
            version: '1.0.0',
            createdAt: ts,
            updatedAt: ts,
            philosophy: 'لا حدود إلا حدود الله — الأصل في الأشياء الإباحة',
            markets: (config.builtInMarkets || []).map((m) => ({
                ...m,
                source: 'built-in',
                createdAt: ts,
                updatedAt: ts
            })),
            innovations: [],
            projects: []
        };
        writeJson(REGISTRY_PATH, initialRegistry);
        artifacts.push(REGISTRY_PATH);
    }

    console.log(JSON.stringify({
        success: true,
        data: {
            core: config.core,
            activatedAt: ts,
            force: FORCE,
            artifacts: artifacts.map((a) => path.relative(ROOT, a)),
            builtInMarkets: (config.builtInMarkets || []).length
        },
        message: 'تم تفعيل نواة الأسواق المفتوحة بنجاح',
        timestamp: ts
    }, null, 4));
}

main();
