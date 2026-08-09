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
    const foundation = normalized ===
        registry.architecturePolicy?.firstPartyFoundationLanguage;
    return {
        ...profile,
        name: normalized,
        role: foundation
            ? 'first-party-foundation-language'
            : 'tool-adapter',
        foundation,
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
    return registry.languages.map((entry) => {
        const profile = getLanguageProfile(entry.name);
        return {
            name: profile.name,
            family: profile.family,
            inputKinds: profile.inputKinds || [],
            role: profile.role,
            foundation: profile.foundation,
        };
    });
}

module.exports = {
    registry,
    getLanguageProfile,
    mustGetLanguageProfile,
    inferSourceLanguageFromPath,
    listSupportedLanguages,
    normalizeLanguageName,
};
