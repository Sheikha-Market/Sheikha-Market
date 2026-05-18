'use strict';

const vscode = require('vscode');

const DIAGNOSTIC_SOURCE = 'Sheikha PHP Intelligence';
const DIAG_CODES = Object.freeze({
    TODO: 'sheikha.todo',
    UNUSED_IMPORT: 'sheikha.unusedImport',
    UNUSED_VARIABLE: 'sheikha.unusedVariable',
    DEPRECATED_API: 'sheikha.deprecatedApi',
    INVALID_REGEX: 'sheikha.invalidRegex',
    UNREACHABLE: 'sheikha.unreachable',
});

const DEPRECATED_FUNCTIONS = Object.freeze({
    each: 'PHP 8 removed each(), استخدم foreach بدلاً منها',
    split: 'split() deprecated, استخدم preg_split()',
    mysql_query: 'mysql_query removed, استخدم PDO أو mysqli',
});

function isSupportedDocument(document) {
    return document.languageId === 'php'
        || document.languageId === 'blade'
        || String(document.uri.fsPath || '').endsWith('.blade.php');
}

function registerPhpDiagnostics(context, indexer, capabilityRouter) {
    const diagnostics = vscode.languages.createDiagnosticCollection('sheikha-php-diagnostics');
    context.subscriptions.push(diagnostics);

    const updateDiagnostics = document => {
        if (!document || !isSupportedDocument(document)) {
            return;
        }

        capabilityRouter.routeCapability('diagnosticsRealtime', { language: document.languageId });

        const text = document.getText();
        const lines = text.split(/\r?\n/);
        const result = [];

        const addDiag = (line, start, end, message, severity, code, data) => {
            const diag = new vscode.Diagnostic(
                new vscode.Range(line, start, line, end),
                message,
                severity
            );
            diag.source = DIAGNOSTIC_SOURCE;
            diag.code = code;
            diag.data = data;
            result.push(diag);
        };

        // TODO/FIXME highlighting
        lines.forEach((lineText, line) => {
            const todoIndex = lineText.search(/TODO|FIXME/i);
            if (todoIndex >= 0) {
                addDiag(
                    line,
                    todoIndex,
                    todoIndex + 4,
                    'TODO/FIXME يحتاج متابعة',
                    vscode.DiagnosticSeverity.Information,
                    DIAG_CODES.TODO,
                    null
                );
            }
        });

        // Unused imports
        const importRegex = /^\s*use\s+([^;]+);/gm;
        let match;
        while ((match = importRegex.exec(text)) !== null) {
            const importName = match[1].trim();
            const simpleName = importName.split(' as ').pop().split('\\').pop();
            const occur = new RegExp(`\\b${escapeRegex(simpleName)}\\b`, 'g');
            const allMatches = text.match(occur) || [];
            if (allMatches.length <= 1) {
                const pos = document.positionAt(match.index);
                addDiag(
                    pos.line,
                    pos.character,
                    pos.character + match[0].length,
                    `Import غير مستخدم: ${simpleName}`,
                    vscode.DiagnosticSeverity.Warning,
                    DIAG_CODES.UNUSED_IMPORT,
                    { importName, lineText: match[0] }
                );
            }
        }

        // Unused variables
        const varAssignRegex = /\$([A-Za-z_][A-Za-z0-9_]*)\s*=/g;
        while ((match = varAssignRegex.exec(text)) !== null) {
            const variableName = match[1];
            const occur = new RegExp(`\\$${escapeRegex(variableName)}\\b`, 'g');
            const allMatches = text.match(occur) || [];
            if (allMatches.length <= 1) {
                const pos = document.positionAt(match.index);
                addDiag(
                    pos.line,
                    pos.character,
                    pos.character + variableName.length + 1,
                    `متغير غير مستخدم: $${variableName}`,
                    vscode.DiagnosticSeverity.Hint,
                    DIAG_CODES.UNUSED_VARIABLE,
                    { variableName }
                );
            }
        }

        // Deprecations
        for (const [deprecatedFn, message] of Object.entries(DEPRECATED_FUNCTIONS)) {
            const reg = new RegExp(`\\b${escapeRegex(deprecatedFn)}\\s*\\(`, 'g');
            while ((match = reg.exec(text)) !== null) {
                const pos = document.positionAt(match.index);
                addDiag(
                    pos.line,
                    pos.character,
                    pos.character + deprecatedFn.length,
                    message,
                    vscode.DiagnosticSeverity.Warning,
                    DIAG_CODES.DEPRECATED_API,
                    { functionName: deprecatedFn }
                );
            }
        }

        // Regex validation heuristic for preg_*('/.../') usage
        const regexCall = /preg_[a-z_]+\s*\(\s*(['"])(.+?)\1/gis;
        while ((match = regexCall.exec(text)) !== null) {
            const pattern = match[2];
            const delimiter = pattern[0];
            const lastDelimiter = pattern.lastIndexOf(delimiter);
            if (lastDelimiter > 0) {
                const body = pattern.slice(1, lastDelimiter);
                const flags = pattern.slice(lastDelimiter + 1);
                try {
                    // محاولة تحويل النمط إلى JS regex كتحقق مبدئي
                    new RegExp(body, flags.replace(/[^gimsuy]/g, ''));
                } catch (error) {
                    const pos = document.positionAt(match.index);
                    addDiag(
                        pos.line,
                        pos.character,
                        pos.character + String(match[0]).length,
                        `Regex غير صالح: ${error.message}`,
                        vscode.DiagnosticSeverity.Error,
                        DIAG_CODES.INVALID_REGEX,
                        { pattern }
                    );
                }
            }
        }

        // Reachability check: any non-empty statement after return in same block (simple heuristic)
        for (let i = 0; i < lines.length - 1; i += 1) {
            if (/\breturn\b/.test(lines[i])) {
                for (let j = i + 1; j < Math.min(lines.length, i + 5); j += 1) {
                    if (/^\s*[}\s]*$/.test(lines[j])) break;
                    if (!/^\s*(\/\/.*)?$/.test(lines[j])) {
                        const lineText = lines[j];
                        addDiag(
                            j,
                            0,
                            lineText.length,
                            'قد يكون هذا السطر غير قابل للوصول بعد return',
                            vscode.DiagnosticSeverity.Warning,
                            DIAG_CODES.UNREACHABLE,
                            null
                        );
                        break;
                    }
                }
            }
        }

        diagnostics.set(document.uri, result);
        indexer.indexDocument(document);
    };

    const codeActionsProvider = vscode.languages.registerCodeActionsProvider(
        [{ language: 'php', scheme: 'file' }, { language: 'blade', scheme: 'file' }],
        {
            provideCodeActions(document, range, context) {
                capabilityRouter.routeCapability('quickFixes', { language: document.languageId });

                const actions = [];

                for (const diag of context.diagnostics) {
                    if (diag.code === DIAG_CODES.UNUSED_IMPORT && diag.data && diag.data.lineText) {
                        const fix = new vscode.CodeAction('Remove unused import', vscode.CodeActionKind.QuickFix);
                        fix.diagnostics = [diag];
                        fix.edit = new vscode.WorkspaceEdit();
                        fix.edit.delete(document.uri, diag.range.with(diag.range.start, new vscode.Position(diag.range.end.line + 1, 0)));
                        actions.push(fix);
                    }

                    if (diag.code === DIAG_CODES.DEPRECATED_API && diag.data && diag.data.functionName) {
                        const map = {
                            each: 'foreach',
                            split: 'preg_split',
                            mysql_query: 'mysqli_query',
                        };
                        const replacement = map[diag.data.functionName];
                        if (replacement) {
                            const fix = new vscode.CodeAction(`Replace with ${replacement}`, vscode.CodeActionKind.QuickFix);
                            fix.diagnostics = [diag];
                            fix.edit = new vscode.WorkspaceEdit();
                            fix.edit.replace(document.uri, diag.range, replacement);
                            actions.push(fix);
                        }
                    }
                }

                // Organize uses action
                const organizeUses = new vscode.CodeAction('Organize Uses (sort imports)', vscode.CodeActionKind.SourceOrganizeImports);
                organizeUses.command = {
                    title: 'Organize Uses',
                    command: 'sheikha.organizeUses',
                    arguments: [document.uri]
                };
                actions.push(organizeUses);

                return actions;
            }
        },
        {
            providedCodeActionKinds: [
                vscode.CodeActionKind.QuickFix,
                vscode.CodeActionKind.SourceOrganizeImports,
            ]
        }
    );

    const organizeUsesCommand = vscode.commands.registerCommand('sheikha.organizeUses', async uri => {
        const document = await vscode.workspace.openTextDocument(uri);
        const text = document.getText();
        const lines = text.split(/\r?\n/);

        const importLines = [];
        const otherLines = [];
        for (const line of lines) {
            if (/^\s*use\s+[^;]+;\s*$/.test(line)) {
                importLines.push(line.trim());
            } else {
                otherLines.push(line);
            }
        }

        if (!importLines.length) return;

        const sortedImports = Array.from(new Set(importLines)).sort((a, b) => a.localeCompare(b, 'en'));
        const newText = [...sortedImports, '', ...otherLines.filter(Boolean)].join('\n');

        const edit = new vscode.WorkspaceEdit();
        const fullRange = new vscode.Range(
            new vscode.Position(0, 0),
            new vscode.Position(document.lineCount, 0)
        );
        edit.replace(document.uri, fullRange, newText);
        await vscode.workspace.applyEdit(edit);
    });

    const docWatcher = vscode.workspace.onDidOpenTextDocument(updateDiagnostics);
    const changeWatcher = vscode.workspace.onDidChangeTextDocument(event => updateDiagnostics(event.document));
    const saveWatcher = vscode.workspace.onDidSaveTextDocument(updateDiagnostics);
    const closeWatcher = vscode.workspace.onDidCloseTextDocument(document => diagnostics.delete(document.uri));

    context.subscriptions.push(codeActionsProvider, organizeUsesCommand, docWatcher, changeWatcher, saveWatcher, closeWatcher);

    if (vscode.window.activeTextEditor) {
        updateDiagnostics(vscode.window.activeTextEditor.document);
    }

    vscode.workspace.textDocuments.forEach(updateDiagnostics);

    return {
        refreshAll: () => vscode.workspace.textDocuments.forEach(updateDiagnostics),
        dispose: () => diagnostics.dispose(),
    };
}

function escapeRegex(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = {
    registerPhpDiagnostics,
};
