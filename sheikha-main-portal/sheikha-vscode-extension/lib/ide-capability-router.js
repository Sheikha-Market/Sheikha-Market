'use strict';

const CELL_MAPPING = Object.freeze({
    editor: { activationType: 'analysis', cells: [1, 6, 7] },
    intellisense: { activationType: 'learning', cells: [1, 6, 7, 11] },
    navigation: { activationType: 'analysis', cells: [1, 7, 11] },
    diagnostics: { activationType: 'security', cells: [1, 2, 3, 10] },
    refactoring: { activationType: 'quality', cells: [1, 10, 11] },
    formatting: { activationType: 'quality', cells: [1, 10] },
    laravel: { activationType: 'trade', cells: [1, 3, 7] },
    testing: { activationType: 'monitoring', cells: [1, 8, 10] },
    debugging: { activationType: 'monitoring', cells: [1, 8, 11] },
    profiling: { activationType: 'monitoring', cells: [1, 8, 12] },
    tooling: { activationType: 'general', cells: [1, 5, 12] },
});

const FEATURE_MATRIX = Object.freeze({
    syntaxHighlighting: { category: 'editor', state: 'available' },
    semanticHighlighting: { category: 'editor', state: 'indexed' },
    codeFolding: { category: 'editor', state: 'available' },
    regexValidation: { category: 'diagnostics', state: 'available' },
    mixedHtmlJsCss: { category: 'editor', state: 'planned' },
    inlayHints: { category: 'intellisense', state: 'indexed' },
    phpdocSupport: { category: 'intellisense', state: 'available' },
    codeLenses: { category: 'editor', state: 'available' },
    highlightOccurrences: { category: 'editor', state: 'available' },
    breadcrumbs: { category: 'navigation', state: 'available' },
    highlightTodo: { category: 'diagnostics', state: 'available' },
    highlightUnused: { category: 'diagnostics', state: 'available' },
    typeHierarchy: { category: 'intellisense', state: 'planned' },
    semanticCompletion: { category: 'intellisense', state: 'available' },
    autoImport: { category: 'intellisense', state: 'available' },
    signatureHelp: { category: 'intellisense', state: 'indexed' },
    tooltips: { category: 'intellisense', state: 'available' },
    goToDefinition: { category: 'navigation', state: 'available' },
    findReferences: { category: 'navigation', state: 'available' },
    workspaceSymbolSearch: { category: 'navigation', state: 'available' },
    diagnosticsRealtime: { category: 'diagnostics', state: 'available' },
    typeMismatch: { category: 'diagnostics', state: 'planned' },
    deprecations: { category: 'diagnostics', state: 'available' },
    reachability: { category: 'diagnostics', state: 'available' },
    overrideValidation: { category: 'diagnostics', state: 'indexed' },
    quickFixes: { category: 'refactoring', state: 'available' },
    renameRefactor: { category: 'refactoring', state: 'indexed' },
    organizeUses: { category: 'refactoring', state: 'available' },
    generatePhpDoc: { category: 'refactoring', state: 'indexed' },
    laravelMagic: { category: 'laravel', state: 'indexed' },
    bladeCompletion: { category: 'laravel', state: 'available' },
    phpInBlade: { category: 'laravel', state: 'indexed' },
    composerIntellisense: { category: 'tooling', state: 'available' },
    phpunitExplorer: { category: 'testing', state: 'planned' },
    xdebugIntegration: { category: 'debugging', state: 'planned' },
    profiling: { category: 'profiling', state: 'planned' },
});

function inferCategory(capabilityName) {
    const lower = String(capabilityName || '').toLowerCase();
    if (lower.includes('diagnostic') || lower.includes('regex') || lower.includes('todo') || lower.includes('unused')) return 'diagnostics';
    if (lower.includes('definition') || lower.includes('reference') || lower.includes('symbol') || lower.includes('navigation')) return 'navigation';
    if (lower.includes('format')) return 'formatting';
    if (lower.includes('refactor') || lower.includes('rename') || lower.includes('code action') || lower.includes('quick fix')) return 'refactoring';
    if (lower.includes('laravel') || lower.includes('blade') || lower.includes('eloquent')) return 'laravel';
    if (lower.includes('test') || lower.includes('phpunit')) return 'testing';
    if (lower.includes('debug') || lower.includes('xdebug')) return 'debugging';
    if (lower.includes('profile')) return 'profiling';
    if (lower.includes('tool') || lower.includes('composer') || lower.includes('project')) return 'tooling';
    if (lower.includes('completion') || lower.includes('hover') || lower.includes('signature') || lower.includes('inlay') || lower.includes('intellisense')) return 'intellisense';
    return 'editor';
}

class IDECapabilityRouter {
    constructor(options = {}) {
        this.neuralCells = options.neuralCells || null;
        this.stats = {
            totalRoutes: 0,
            byCategory: {},
            lastRouteAt: null,
            lastError: null,
        };
        this.health = {
            states: this._buildStateSummary(),
            neuralConnected: Boolean(this.neuralCells),
        };
    }

    _buildStateSummary() {
        const counts = { planned: 0, indexed: 0, available: 0, degraded: 0 };
        for (const feature of Object.values(FEATURE_MATRIX)) {
            counts[feature.state] = (counts[feature.state] || 0) + 1;
        }
        return counts;
    }

    getFeatureMatrix() {
        return FEATURE_MATRIX;
    }

    getHealth() {
        return {
            ...this.health,
            stats: this.stats,
        };
    }

    routeCapability(capabilityName, payload = {}) {
        const feature = FEATURE_MATRIX[capabilityName] || null;
        const category = feature ? feature.category : inferCategory(capabilityName);
        const mapping = CELL_MAPPING[category] || CELL_MAPPING.editor;

        this.stats.totalRoutes += 1;
        this.stats.byCategory[category] = (this.stats.byCategory[category] || 0) + 1;
        this.stats.lastRouteAt = new Date().toISOString();

        let neural = {
            connected: Boolean(this.neuralCells),
            activationType: mapping.activationType,
            cells: mapping.cells,
            readiness: null,
            processed: null,
        };

        try {
            if (this.neuralCells && typeof this.neuralCells.status === 'function') {
                neural.readiness = this.neuralCells.status();
            }
            if (this.neuralCells && typeof this.neuralCells.process === 'function') {
                neural.processed = this.neuralCells.process({
                    type: mapping.activationType,
                    data: {
                        capabilityName,
                        language: payload.language || 'unknown',
                    },
                    context: payload.context || '',
                });
            }
        } catch (error) {
            this.stats.lastError = String(error && error.message ? error.message : error);
            neural = { ...neural, error: this.stats.lastError };
        }

        return {
            capability: capabilityName,
            state: feature ? feature.state : 'indexed',
            category,
            neural,
        };
    }
}

function createCapabilityRouter() {
    let neuralCells = null;
    try {
        neuralCells = require('../../core/neural/neural-cells');
    } catch (_) {
        neuralCells = null;
    }

    return new IDECapabilityRouter({ neuralCells });
}

module.exports = {
    IDECapabilityRouter,
    createCapabilityRouter,
    FEATURE_MATRIX,
};
