'use strict';

const vscode = require('vscode');

class PhpWorkspaceIndexer {
    constructor(capabilityRouter) {
        this.capabilityRouter = capabilityRouter;
        this.fileIndex = new Map();
        this.symbolIndex = new Map();
        this.referenceIndex = new Map();
        this.composerPackages = new Set();
        this.ready = false;
        this.lastIndexedAt = null;
    }

    async initialize() {
        await this.rebuild();
        this.ready = true;
        return this;
    }

    async rebuild() {
        this.fileIndex.clear();
        this.symbolIndex.clear();
        this.referenceIndex.clear();
        this.composerPackages.clear();

        const files = await vscode.workspace.findFiles('**/*.{php,blade.php,inc}', '**/node_modules/**', 2000);
        await Promise.all(files.map(async uri => {
            try {
                const doc = await vscode.workspace.openTextDocument(uri);
                this.indexDocument(doc);
            } catch (_) {
                // تجاهل الملفات غير المقروءة
            }
        }));

        const composerFiles = await vscode.workspace.findFiles('**/composer.json', '**/node_modules/**', 20);
        for (const composerUri of composerFiles) {
            try {
                const doc = await vscode.workspace.openTextDocument(composerUri);
                const parsed = JSON.parse(doc.getText());
                const allDeps = {
                    ...(parsed.require || {}),
                    ...(parsed['require-dev'] || {}),
                };
                for (const dep of Object.keys(allDeps)) {
                    this.composerPackages.add(dep);
                }
            } catch (_) {
                // تجاهل composer.json غير الصالح
            }
        }

        this.lastIndexedAt = new Date().toISOString();
        if (this.capabilityRouter) {
            this.capabilityRouter.routeCapability('workspaceSymbolSearch', { language: 'php', context: 'rebuild-index' });
        }
    }

    indexDocument(document) {
        if (!document || !this._isSupportedLanguage(document.languageId, document.uri.fsPath)) {
            return;
        }

        const text = document.getText();
        const info = this._parseDocument(document, text);

        this.fileIndex.set(document.uri.toString(), info);

        for (const symbol of info.symbols) {
            const key = symbol.name.toLowerCase();
            if (!this.symbolIndex.has(key)) {
                this.symbolIndex.set(key, []);
            }
            this.symbolIndex.get(key).push(symbol);
        }

        for (const reference of info.references) {
            const key = reference.word.toLowerCase();
            if (!this.referenceIndex.has(key)) {
                this.referenceIndex.set(key, []);
            }
            this.referenceIndex.get(key).push(reference);
        }
    }

    removeDocument(documentUri) {
        this.fileIndex.delete(documentUri.toString());
    }

    _isSupportedLanguage(languageId, fsPath) {
        return languageId === 'php' || languageId === 'blade' || String(fsPath || '').endsWith('.blade.php');
    }

    _parseDocument(document, text) {
        const lines = text.split(/\r?\n/);
        const symbols = [];
        const references = [];
        const imports = [];
        const phpdocTemplates = [];

        const symbolRegex = /(class|interface|trait|function)\s+([A-Za-z_][A-Za-z0-9_]*)/g;
        const importRegex = /^\s*use\s+([^;]+);/gm;
        const templateRegex = /@template\s+([A-Za-z_][A-Za-z0-9_]*)/g;
        const wordRegex = /[A-Za-z_][A-Za-z0-9_]*/g;

        let match;
        while ((match = symbolRegex.exec(text)) !== null) {
            const kindText = match[1];
            const name = match[2];
            const pos = document.positionAt(match.index);
            const range = new vscode.Range(pos, new vscode.Position(pos.line, pos.character + match[0].length));
            symbols.push({
                name,
                kindText,
                kind: this._symbolKind(kindText),
                uri: document.uri,
                range,
                selectionRange: range,
                line: pos.line,
            });
        }

        while ((match = importRegex.exec(text)) !== null) {
            const importName = match[1].trim();
            const pos = document.positionAt(match.index);
            imports.push({
                importName,
                range: new vscode.Range(pos, new vscode.Position(pos.line, pos.character + match[0].length)),
                line: pos.line,
            });
        }

        while ((match = templateRegex.exec(text)) !== null) {
            phpdocTemplates.push(match[1]);
        }

        for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
            const lineText = lines[lineIndex];
            let lineMatch;
            while ((lineMatch = wordRegex.exec(lineText)) !== null) {
                references.push({
                    word: lineMatch[0],
                    uri: document.uri,
                    range: new vscode.Range(
                        new vscode.Position(lineIndex, lineMatch.index),
                        new vscode.Position(lineIndex, lineMatch.index + lineMatch[0].length)
                    ),
                });
            }
        }

        return {
            uri: document.uri,
            symbols,
            references,
            imports,
            phpdocTemplates,
            lineCount: lines.length,
            text,
        };
    }

    _symbolKind(kindText) {
        if (kindText === 'class') return vscode.SymbolKind.Class;
        if (kindText === 'interface') return vscode.SymbolKind.Interface;
        if (kindText === 'trait') return vscode.SymbolKind.Module;
        return vscode.SymbolKind.Function;
    }

    getDocumentSymbols(uri) {
        const info = this.fileIndex.get(uri.toString());
        if (!info) return [];

        return info.symbols.map(symbol => new vscode.DocumentSymbol(
            symbol.name,
            symbol.kindText,
            symbol.kind,
            symbol.range,
            symbol.selectionRange
        ));
    }

    findDefinition(name) {
        if (!name) return null;
        const defs = this.symbolIndex.get(String(name).toLowerCase()) || [];
        return defs[0] || null;
    }

    findReferences(name) {
        if (!name) return [];
        return this.referenceIndex.get(String(name).toLowerCase()) || [];
    }

    getHoverInfo(name) {
        if (!name) return null;
        const def = this.findDefinition(name);
        if (!def) return null;

        const info = this.fileIndex.get(def.uri.toString());
        return {
            name,
            kind: def.kindText,
            line: def.line + 1,
            templates: info ? info.phpdocTemplates : [],
        };
    }

    getCompletionItems(prefix = '') {
        const normalized = String(prefix || '').toLowerCase();
        const items = [];

        for (const [key, symbols] of this.symbolIndex.entries()) {
            if (!normalized || key.startsWith(normalized)) {
                const top = symbols[0];
                items.push({
                    label: top.name,
                    detail: `Indexed ${top.kindText}`,
                    kind: top.kind === vscode.SymbolKind.Function ? vscode.CompletionItemKind.Function : vscode.CompletionItemKind.Class,
                });
            }
        }

        const laravelHints = ['Route', 'Controller', 'Model', 'Livewire', 'view', 'config', 'auth'];
        laravelHints.forEach(hint => {
            if (!normalized || hint.toLowerCase().startsWith(normalized)) {
                items.push({
                    label: hint,
                    detail: 'Laravel Hint',
                    kind: vscode.CompletionItemKind.Keyword,
                });
            }
        });

        for (const dep of this.composerPackages) {
            if (!normalized || dep.toLowerCase().includes(normalized)) {
                items.push({
                    label: dep,
                    detail: 'Composer package',
                    kind: vscode.CompletionItemKind.Module,
                });
            }
        }

        return items.slice(0, 200);
    }

    getStats() {
        return {
            ready: this.ready,
            filesIndexed: this.fileIndex.size,
            symbolsIndexed: Array.from(this.symbolIndex.values()).reduce((sum, list) => sum + list.length, 0),
            referencesIndexed: Array.from(this.referenceIndex.values()).reduce((sum, list) => sum + list.length, 0),
            composerPackages: this.composerPackages.size,
            lastIndexedAt: this.lastIndexedAt,
        };
    }
}

module.exports = {
    PhpWorkspaceIndexer,
};
