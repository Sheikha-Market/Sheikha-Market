#!/usr/bin/env node
'use strict';

/**
 * Sheikha Entity-Specific Goals Builder
 * يبني الأهداف المحددة لكل مؤسسة من أهداف الوزارات والأهداف الوطنية
 * 
 * المستوى الثالث من هيكل الأهداف الهرمي
 * - كل مؤسسة تحصل على أهداف محددة لها
 * - ربط كل هدف مؤسسي بأهداف وزاري ووطني
 * - تحديد مسؤول وميزانية وجدول زمني
 */

const fs = require('node:fs');
const path = require('node:path');

const dataDir = path.join(__dirname, '..', 'data');

function loadRegistry() {
    try {
        const registryPath = path.join(dataDir, 'sheikha-public-sector-registry.json');
        if (fs.existsSync(registryPath)) {
            const raw = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
            return Array.isArray(raw?.data?.entities)
                ? raw.data.entities
                : [];
        }
    } catch (error) {
        console.warn(`Registry not found, building entity goals independently: ${error.message}`);
    }
    return [];
}

function slugify(text) {
    return text
        .toLowerCase()
    .replaceAll(/\s+/g, '-')
    .replaceAll(/[^\w-]/g, '')
    .replaceAll(/-+/g, '-')
        .trim('-');
}

function buildEntityGoals() {
    const timestamp = new Date().toISOString();
    const registryEntities = loadRegistry();

    const entityGoals = {
        covenant: {
            title: 'ميثاق الأهداف المؤسسية',
            basis: 'ترجمة العهود الوطنية إلى التزامات مؤسسية قابلة للقياس',
            principle: 'كل مؤسسة مسؤولة عن تحقيق أجزاء من الأهداف الوطنية'
        },
        entities: [],
        statistics: {
            totalEntities: 0,
            totalGoals: 0,
            averageGoalsPerEntity: 0
        }
    };

    // Sample goal templates for different entity types
    const goalsByType = {
        'delegated-authority': [
            {
                template: 'strategic-coordination',
                title: 'تنسيق استراتيجي موحد',
                metrics: ['coordination-index', 'response-time', 'decision-quality']
            },
            {
                template: 'policy-implementation',
                title: 'تنفيذ السياسات الوطنية',
                metrics: ['implementation-rate', 'compliance-score', 'outcome-quality']
            }
        ],
        'ministry': [
            {
                template: 'service-delivery',
                title: 'تحسين تقديم الخدمات',
                metrics: ['service-quality', 'access-equity', 'citizen-satisfaction']
            },
            {
                template: 'digital-transformation',
                title: 'التحول الرقمي القطاعي',
                metrics: ['digitization-rate', 'system-uptime', 'user-adoption']
            },
            {
                template: 'stakeholder-integration',
                title: 'تكامل المستفيدين والشركاء',
                metrics: ['partner-count', 'process-efficiency', 'shared-value']
            }
        ],
        'state-owned-company': [
            {
                template: 'economic-value',
                title: 'توليد القيمة الاقتصادية',
                metrics: ['revenue-growth', 'roi', 'market-share']
            },
            {
                template: 'public-benefit',
                title: 'تحقيق المنفعة العامة',
                metrics: ['public-service-metrics', 'accessibility', 'affordability']
            }
        ],
        'university': [
            {
                template: 'academic-excellence',
                title: 'تحقيق التميز الأكاديمي',
                metrics: ['research-output', 'faculty-quality', 'student-outcomes']
            },
            {
                template: 'community-engagement',
                title: 'المشاركة المجتمعية الفعّالة',
                metrics: ['community-projects', 'partner-institutions', 'social-impact']
            }
        ],
        'authority': [
            {
                template: 'regulatory-excellence',
                title: 'تحقيق التميز التنظيمي',
                metrics: ['compliance-rate', 'clarity-index', 'dispute-resolution']
            }
        ]
    };

    // Build goals for each entity in registry if available
    if (registryEntities.length > 0) {
        registryEntities.forEach((entity) => {
            const entityGoalSet = {
                id: `EG-${entity.slug}-001`,
                entity: entity.sheikhaName,
                slug: entity.slug,
                category: entity.category,
                linkedMinistryGoal: generateMinistryLink(entity),
                linkedNationalGoals: generateNationalLinks(entity),
                goals: [],
                responsibleParty: {
                    entity: entity.sheikhaName,
                    entityCategory: entity.category,
                    reportingTo: entity.parent || 'Custodian',
                    delegationPath: entity.delegationPath
                },
                budget: generateBudgetEstimate(entity),
                timeline: {
                    start: '2026-03-21',
                    end: '2026-12-31',
                    milestones: [
                        { quarter: 'Q2-2026', target: '25%' },
                        { quarter: 'Q3-2026', target: '60%' },
                        { quarter: 'Q4-2026', target: '100%' }
                    ]
                },
                refreshDates: {
                    quarterlyReview: ['2026-06-30', '2026-09-30', '2026-12-31'],
                    annualRenewal: '2027-01-01'
                }
            };

            // Add goals based on entity type
            const goalTemplates = goalsByType[entity.category] || goalsByType['authority'];
            goalTemplates.forEach((template, tIdx) => {
                const goal = {
                    id: `${entity.slug}-G-${tIdx + 1}`.toUpperCase(),
                    sequence: tIdx + 1,
                    title: template.title,
                    description: `${template.title} خاصة بـ ${entity.sheikhaName}`,
                    owner: entity.sheikhaName,
                    linkedToMinistry: generateMinistryLink(entity),
                    linkedToNational: generateNationalLinks(entity)[0] || 'KG-2026-001',
                    impact: getImpactLevel(entity),
                    metrics: buildMetrics(template.metrics, entity, tIdx),
                    sharia: {
                        basis: 'الكتاب والسنة',
                        controls: entity.goals?.sharia?.controls || ['العدل', 'الأمانة']
                    },
                    status: 'planning',
                    lastUpdated: timestamp,
                    nextReview: '2026-06-30'
                };
                entityGoalSet.goals.push(goal);
            });

            entityGoals.entities.push(entityGoalSet);
        });
    } else {
        // Fallback: create minimal entity goals
        console.log('Creating sample entity goals without registry...');
        const sampleEntities = [
            'Sheikha-Royal-Court',
            'Sheikha-MoI',
            'Sheikha-MoH',
            'Sheikha-SDAIA'
        ];

        sampleEntities.forEach((entityName, idx) => {
            entityGoals.entities.push({
                id: `EG-${slugify(entityName)}-001`,
                entity: entityName,
                slug: slugify(entityName),
                goals: [
                    {
                        id: `${slugify(entityName)}-G-1`,
                        title: 'تحسين الخدمات والتكامل',
                        status: 'planning'
                    }
                ]
            });
        });
    }

    // Calculate statistics
    entityGoals.statistics.totalEntities = entityGoals.entities.length;
    entityGoals.statistics.totalGoals = entityGoals.entities.reduce((sum, e) => sum + e.goals.length, 0);
    entityGoals.statistics.averageGoalsPerEntity = 
        entityGoals.statistics.totalGoals / entityGoals.statistics.totalEntities;

    entityGoals.metadata = {
        generatedAt: timestamp,
        version: '1.0.0',
        buildScript: 'sheikha-entity-goals-build.js',
        purpose: 'رقمنة الأهداف المؤسسية والربط بالأهداف الوطنية والقطاعية',
        refreshCycle: 'quarterly'
    };

    // Write entity goals file
    const outputPath = path.join(dataDir, 'sheikha-entity-specific-goals.json');
    fs.writeFileSync(outputPath, JSON.stringify(entityGoals, null, 2));
    console.log(`Entity-specific goals written: ${outputPath}`);
    console.log(`Total entities: ${entityGoals.statistics.totalEntities}`);
    console.log(`Total goals: ${entityGoals.statistics.totalGoals}`);
    console.log(`Average goals per entity: ${entityGoals.statistics.averageGoalsPerEntity.toFixed(1)}`);

    return entityGoals;
}

function generateMinistryLink(entity) {
    // Link entities to their parent ministry
    const parentMap = {
        'Sheikha-MoI': 'MOI-GOALS-001',
        'Sheikha-MoH': 'MOH-GOALS-001',
        'Sheikha-MoE': 'MOE-GOALS-001',
        'Sheikha-MoF': 'MOF-GOALS-001',
        'Sheikha-MoT': 'MOT-GOALS-001',
        'Sheikha-MoC': 'MOC-GOALS-001',
        'Sheikha-SDAIA': 'SDAIA-GOALS-001'
    };
    return parentMap[entity.sheikhaName] || 'GENERAL-GOALS-001';
}

function generateNationalLinks(entity) {
    // Map entities to relevant national goals
    const linkMap = {
        'technology': ['KG-2026-002', 'CPG-2026-002'],
        'health': ['SG-2026-001', 'SG-2026-003'],
        'education': ['SG-2026-001', 'SG-2026-003'],
        'economic': ['KG-2026-003', 'SG-2026-002'],
        'default': ['KG-2026-001', 'SG-2026-001']
    };

    if (entity.category.includes('ministry')) return linkMap['default'];
    if (entity.sheikhaName.includes('SDAIA') || entity.sheikhaName.includes('Data')) return linkMap['technology'];
    if (entity.sheikhaName.includes('MoH')) return linkMap['health'];
    return linkMap['default'];
}

function getImpactLevel(entity) {
    const highImpact = ['delegated-authority', 'ministry'];
    return highImpact.includes(entity.category) ? 'strategic' : 'operational';
}

function generateBudgetEstimate(entity) {
    const budgetByCategory = {
        'delegated-authority': '500M-2B SAR',
        'ministry': '1B-5B SAR',
        'authority': '200M-1B SAR',
        'state-owned-company': '500M-3B SAR',
        'university': '100M-500M SAR',
        'semi-government': '50M-200M SAR'
    };
    return budgetByCategory[entity.category] || '100M-500M SAR';
}

function buildMetrics(metricTemplates, entity, sequence) {
    return metricTemplates.map((template, idx) => ({
        id: `M-${entity.slug}-${sequence + 1}-${idx + 1}`,
        name: template,
        unit: 'percentage',
        target: deterministicTarget(entity.slug, idx),
        current: 0,
        deadline: '2026-12-31',
        measurement: 'quarterly'
    }));
}

function deterministicTarget(seed, idx) {
    const text = `${seed}-${idx}`;
    let hash = 0;
    for (let i = 0; i < text.length; i += 1) {
        hash = Math.trunc(((hash << 5) - hash) + (text.codePointAt(i) || 0));
    }
    const normalized = Math.abs(hash % 11);
    return 90 + normalized;
}

buildEntityGoals();
