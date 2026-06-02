'use strict';

const path = require('node:path');
const registry = require('../specifications/language-spec-registry.json');

const ALIASES = new Map([
    ['js', 'javascript'],
    ['node', 'javascript'],
    ['ts', 'typescript'],
    ['py', 'python'],
    ['rb', 'ruby'],
    ['golang', 'go'],
    ['c++', 'cpp'],
    ['cs', 'csharp'],
    ['dotnet', 'csharp'],
]);

const languages = new Map(registry.languages.map((entry) => [entry.name, entry]));
const extensions = new Map();
for (const entry of registry.languages) {
    for (const ext of entry.extensions || []) {
        extensions.set(ext, entry.name);
    }
}

function normalizeLanguageName(name) {
    const value = String(name || '').trim().toLowerCase();
    if (!value) {
        return registry.defaultSourceLanguage;
    }
    return ALIASES.get(value) || value;
}

function getLanguageProfile(name) {
    const normalized = normalizeLanguageName(name);
    const profile = languages.get(normalized);
    if (!profile) {
        return null;
    }
    return {
        ...profile,
        name: normalized,
    };
}

function mustGetLanguageProfile(name) {
    const profile = getLanguageProfile(name);
    if (!profile) {
        throw new Error(`Unsupported source language: ${name}`);
    }
    return profile;
}

function inferSourceLanguageFromPath(filePath) {
    const ext = path.extname(String(filePath || '')).toLowerCase();
    if (!ext) {
        return registry.defaultSourceLanguage;
    }
    return extensions.get(ext) || registry.defaultSourceLanguage;
}

function listSupportedLanguages() {
    return registry.languages.map((entry) => ({
        name: entry.name,
        family: entry.family,
        inputKinds: entry.inputKinds || [],
    }));
}

module.exports = {
    registry,
    getLanguageProfile,
    mustGetLanguageProfile,
    inferSourceLanguageFromPath,
    listSupportedLanguages,
    normalizeLanguageName,
};
