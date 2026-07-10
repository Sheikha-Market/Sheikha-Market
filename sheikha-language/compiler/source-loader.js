'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { lex } = require('./lexer');
const { parse } = require('./parser');
const {
    inferSourceLanguageFromPath,
    mustGetLanguageProfile,
    normalizeLanguageName,
} = require('./language-registry');

function loadSourceProgram(inputPath, options = {}) {
    const resolvedPath = path.resolve(process.cwd(), inputPath);
    const sourceLanguage = normalizeLanguageName(options.sourceLanguage || inferSourceLanguageFromPath(inputPath));
    if (path.extname(resolvedPath).toLowerCase() === '.shk') {
        return loadSheikhaProgram(resolvedPath, inputPath, sourceLanguage);
    }
    return loadSemanticManifest(resolvedPath, inputPath, sourceLanguage);
}

function loadSheikhaProgram(resolvedPath, displayPath, sourceLanguage) {
    const profile = mustGetLanguageProfile(sourceLanguage || 'sheikha');
    const source = fs.readFileSync(resolvedPath, 'utf8');
    const ast = parse(lex(source));
    ast.meta = {
        ...(ast.meta || {}),
        sourceLanguage: profile.name,
        sourceFamily: profile.family,
        sourceKind: 'shk',
        sourceFile: displayPath,
    };

    return {
        source,
        ast,
        sourceFile: displayPath,
        sourceKind: 'shk',
        sourceLanguage: profile.name,
        sourceFamily: profile.family,
        manifest: null,
    };
}

function loadSemanticManifest(resolvedPath, displayPath, fallbackLanguage) {
    const source = fs.readFileSync(resolvedPath, 'utf8');
    const manifest = JSON.parse(source);
    const manifestLanguage = normalizeLanguageName(manifest.sourceLanguage || fallbackLanguage);
    const profile = mustGetLanguageProfile(manifestLanguage);
    const ast = manifest.program?.type === 'Program'
        ? attachAstMeta(manifest.program, profile, displayPath)
        : buildAstFromManifest(manifest, profile, displayPath);

    return {
        source,
        ast,
        sourceFile: manifest.sourceFile || displayPath,
        sourceKind: 'semantic-manifest',
        sourceLanguage: profile.name,
        sourceFamily: profile.family,
        manifest,
    };
}

function buildAstFromManifest(manifest, profile, displayPath) {
    const nextLoc = createLocFactory();
    const directives = Array.isArray(manifest.program?.directives) ? manifest.program.directives : [];
    const entities = Array.isArray(manifest.program?.entities) ? manifest.program.entities : [];
    const valuesReferences = Array.isArray(manifest.program?.valuesReferences)
        ? manifest.program.valuesReferences
        : [];
    const governancePolicies = Array.isArray(manifest.program?.governancePolicies)
        ? manifest.program.governancePolicies
        : [];
    const reasoningMethodologies = Array.isArray(manifest.program?.reasoningMethodologies)
        ? manifest.program.reasoningMethodologies
        : [];
    const procedures = Array.isArray(manifest.program?.procedures) ? manifest.program.procedures : [];

    const body = [];
    for (const directive of directives) {
        body.push({
            type: 'Directive',
            name: String(directive),
            loc: nextLoc(),
        });
    }

    for (const entity of entities) {
        const entityLoc = nextLoc();
        body.push({
            type: 'EntityDeclaration',
            name: String(entity.name || 'كيان_موحد'),
            properties: normalizeProperties(entity.properties, nextLoc),
            loc: entityLoc,
        });
    }

    for (const reference of valuesReferences) {
        body.push(buildPropertyDeclaration(
            'ValuesReferenceDeclaration',
            reference,
            'مرجعية_قيم',
            nextLoc
        ));
    }

    for (const policy of governancePolicies) {
        body.push(buildPropertyDeclaration(
            'GovernancePolicyDeclaration',
            policy,
            'سياسة_حوكمة',
            nextLoc
        ));
    }

    for (const methodology of reasoningMethodologies) {
        body.push(buildPropertyDeclaration(
            'ReasoningMethodologyDeclaration',
            methodology,
            'منهج_استدلال',
            nextLoc
        ));
    }

    for (const procedure of procedures) {
        const procedureLoc = nextLoc();
        body.push({
            type: 'ProcedureDeclaration',
            name: String(procedure.name || 'إجراء_موحد'),
            body: normalizeStatements(procedure.body, nextLoc),
            loc: procedureLoc,
        });
    }

    return attachAstMeta({
        type: 'Program',
        body,
        loc: { start: { line: 1, column: 1 }, end: { line: body.length + 1, column: 1 } },
    }, profile, manifest.sourceFile || displayPath);
}

function buildPropertyDeclaration(type, descriptor, fallbackName, nextLoc) {
    return {
        type,
        name: String(descriptor.name || fallbackName),
        properties: normalizeProperties(descriptor.properties, nextLoc),
        loc: nextLoc(),
    };
}

function attachAstMeta(ast, profile, sourceFile) {
    return {
        ...ast,
        meta: {
            ...(ast.meta || {}),
            sourceLanguage: profile.name,
            sourceFamily: profile.family,
            sourceKind: 'semantic-manifest',
            sourceFile,
        },
    };
}

function normalizeProperties(properties, nextLoc) {
    if (Array.isArray(properties)) {
        return properties.map((entry) => ({
            type: 'PropertyAssignment',
            key: String(entry.key || 'خاصية'),
            value: stringifyValue(entry.value),
            loc: nextLoc(),
        }));
    }

    return Object.entries(properties || {}).map(([key, value]) => ({
        type: 'PropertyAssignment',
        key,
        value: stringifyValue(value),
        loc: nextLoc(),
    }));
}

function normalizeStatements(statements, nextLoc) {
    return (statements || []).map((statement) => normalizeStatement(statement, nextLoc));
}

function normalizeStatement(statement, nextLoc) {
    if (statement.type === 'CommandStatement' || Object.prototype.hasOwnProperty.call(statement, 'command')) {
        return {
            type: 'CommandStatement',
            command: String(statement.command),
            argument: stringifyValue(statement.argument),
            loc: nextLoc(),
        };
    }

    if (statement.type === 'PropertyAssignment' || Object.prototype.hasOwnProperty.call(statement, 'key')) {
        return {
            type: 'PropertyAssignment',
            key: String(statement.key),
            value: stringifyValue(statement.value),
            loc: nextLoc(),
        };
    }

    if (statement.type === 'IfStatement' || statement.if) {
        const descriptor = statement.if || statement;
        return {
            type: 'IfStatement',
            condition: String(descriptor.condition || ''),
            consequent: normalizeStatements(descriptor.then || descriptor.consequent || [], nextLoc),
            alternate: normalizeStatements(descriptor.else || descriptor.alternate || [], nextLoc),
            loc: nextLoc(),
        };
    }

    throw new Error(`Unsupported semantic statement in manifest: ${JSON.stringify(statement)}`);
}

function stringifyValue(value) {
    if (typeof value === 'string') {
        return value;
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value);
    }
    if (Array.isArray(value)) {
        return value.map((item) => stringifyValue(item)).join('، ');
    }
    if (!value || typeof value !== 'object') {
        return '';
    }
    return JSON.stringify(value);
}

function createLocFactory() {
    let line = 1;
    return () => ({
        start: { line, column: 1 },
        end: { line: line++, column: 1 },
    });
}

module.exports = {
    loadSourceProgram,
};
