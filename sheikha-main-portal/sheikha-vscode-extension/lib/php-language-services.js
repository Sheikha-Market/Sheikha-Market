'use strict';

const vscode = require('vscode');

const SUPPORTED_LANGUAGES = ['php', 'blade'];

function isSupportedDocument(document) {
    return SUPPORTED_LANGUAGES.includes(document.languageId)
        || String(document.uri.fsPath || '').endsWith('.blade.php');
}

function registerPhpLanguageServices(context, indexer, capabilityRouter) {
    const selector = [
        { language: 'php', scheme: 'file' },
        { language: 'blade', scheme: 'file' },
    ];

    const documentSymbolProvider = vscode.languages.registerDocumentSymbolProvider(selector, {
        provideDocumentSymbols(document) {
            if (!isSupportedDocument(document)) return [];
            capabilityRouter.routeCapability('workspaceSymbolSearch', { language: document.languageId });
            return indexer.getDocumentSymbols(document.uri);
        }
    });

    const definitionProvider = vscode.languages.registerDefinitionProvider(selector, {
        provideDefinition(document, position) {
            const range = document.getWordRangeAtPosition(position);
            if (!range) return null;
            const word = document.getText(range);
            capabilityRouter.routeCapability('goToDefinition', { language: document.languageId, context: word });
            const def = indexer.findDefinition(word);
            if (!def) return null;
            return new vscode.Location(def.uri, def.range);
        }
    });

    const referenceProvider = vscode.languages.registerReferenceProvider(selector, {
        provideReferences(document, position) {
            const range = document.getWordRangeAtPosition(position);
            if (!range) return [];
            const word = document.getText(range);
            capabilityRouter.routeCapability('findReferences', { language: document.languageId, context: word });
            return indexer.findReferences(word).map(ref => new vscode.Location(ref.uri, ref.range));
        }
    });

    const hoverProvider = vscode.languages.registerHoverProvider(selector, {
        provideHover(document, position) {
            const range = document.getWordRangeAtPosition(position);
            if (!range) return null;
            const word = document.getText(range);
            capabilityRouter.routeCapability('tooltips', { language: document.languageId, context: word });
            const info = indexer.getHoverInfo(word);
            if (!info) return null;

            const markdown = new vscode.MarkdownString();
            markdown.appendMarkdown(`**${info.name}**  \n`);
            markdown.appendMarkdown(`Kind: \`${info.kind}\`  \n`);
            markdown.appendMarkdown(`Line: \`${info.line}\``);
            if (info.templates && info.templates.length) {
                markdown.appendMarkdown(`  \nTemplates: \`${info.templates.join(', ')}\``);
            }
            markdown.isTrusted = false;

            return new vscode.Hover(markdown, range);
        }
    });

    const completionProvider = vscode.languages.registerCompletionItemProvider(selector, {
        provideCompletionItems(document, position) {
            const range = document.getWordRangeAtPosition(position);
            const word = range ? document.getText(range) : '';
            capabilityRouter.routeCapability('semanticCompletion', { language: document.languageId, context: word });
            return indexer.getCompletionItems(word).map(item => {
                const completion = new vscode.CompletionItem(item.label, item.kind);
                completion.detail = item.detail;
                return completion;
            });
        }
    }, ':', '$', '\\');

    const workspaceSymbolProvider = vscode.languages.registerWorkspaceSymbolProvider({
        provideWorkspaceSymbols(query) {
            capabilityRouter.routeCapability('workspaceSymbolSearch', { language: 'php', context: query });
            const defs = indexer.findReferences(query || '');
            return defs.slice(0, 200).map(ref => new vscode.SymbolInformation(
                ref.word,
                vscode.SymbolKind.Variable,
                '',
                new vscode.Location(ref.uri, ref.range)
            ));
        }
    });

    const foldingProvider = vscode.languages.registerFoldingRangeProvider(selector, {
        provideFoldingRanges(document) {
            capabilityRouter.routeCapability('codeFolding', { language: document.languageId });
            const ranges = [];
            const text = document.getText();
            const lines = text.split(/\r?\n/);

            const stack = [];
            lines.forEach((line, idx) => {
                if (line.includes('{')) stack.push(idx);
                if (line.includes('}') && stack.length) {
                    const start = stack.pop();
                    if (idx > start + 1) {
                        ranges.push(new vscode.FoldingRange(start, idx, vscode.FoldingRangeKind.Region));
                    }
                }
                if (line.includes('/**')) {
                    const end = lines.slice(idx + 1).findIndex(next => next.includes('*/'));
                    if (end >= 0) {
                        ranges.push(new vscode.FoldingRange(idx, idx + end + 1, vscode.FoldingRangeKind.Comment));
                    }
                }
            });

            return ranges.slice(0, 500);
        }
    });

    const codeLensProvider = vscode.languages.registerCodeLensProvider(selector, {
        provideCodeLenses(document) {
            capabilityRouter.routeCapability('codeLenses', { language: document.languageId });
            const lenses = [];
            const text = document.getText();
            const todoMatches = text.match(/TODO|FIXME/gi) || [];
            if (todoMatches.length > 0) {
                lenses.push(new vscode.CodeLens(
                    new vscode.Range(0, 0, 0, 0),
                    { title: `TODO/FIXME: ${todoMatches.length}`, command: 'sheikha.showStatus' }
                ));
            }
            return lenses;
        }
    });

    const inlayHintsProvider = vscode.languages.registerInlayHintsProvider(selector, {
        provideInlayHints(document, range) {
            capabilityRouter.routeCapability('inlayHints', { language: document.languageId });
            const hints = [];
            for (let line = range.start.line; line <= Math.min(range.end.line, document.lineCount - 1); line += 1) {
                const lineText = document.lineAt(line).text;
                const match = lineText.match(/\$([A-Za-z_][A-Za-z0-9_]*)\s*=\s*new\s+([A-Za-z_][A-Za-z0-9_]*)/);
                if (match) {
                    const variableName = match[1];
                    const className = match[2];
                    const char = lineText.indexOf(`$${variableName}`) + variableName.length + 1;
                    hints.push(new vscode.InlayHint(
                        new vscode.Position(line, Math.max(char, 0)),
                        `: ${className}`,
                        vscode.InlayHintKind.Type
                    ));
                }
            }
            return hints;
        }
    });

    context.subscriptions.push(
        documentSymbolProvider,
        definitionProvider,
        referenceProvider,
        hoverProvider,
        completionProvider,
        workspaceSymbolProvider,
        foldingProvider,
        codeLensProvider,
        inlayHintsProvider
    );
}

module.exports = {
    registerPhpLanguageServices,
};
