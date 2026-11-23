'use strict';

const crypto = require('node:crypto');
const path = require('node:path');

const TARGETS = new Set(['php', 'javascript', 'python', 'json-ir', 'bytecode', 'freestanding-c11']);

function resolveTarget(target, outputPath) {
    const explicit = String(target || '').trim().toLowerCase();
    if (explicit) {
        if (!TARGETS.has(explicit)) {
            throw new Error(`Unsupported compile target: ${target}`);
        }
        return explicit;
    }

    const ext = path.extname(String(outputPath || '')).toLowerCase();
    if (ext === '.js' || ext === '.mjs' || ext === '.cjs') {
        return 'javascript';
    }
    if (ext === '.py') {
        return 'python';
    }
    if (ext === '.json') {
        return 'json-ir';
    }
    return 'php';
}

function listTargets() {
    return Array.from(TARGETS);
}

function generateTarget(target, context) {
    if (target === 'php') {
        return renderPhp(context);
    }
    if (target === 'javascript') {
        return renderJavaScript(context);
    }
    if (target === 'python') {
        return renderPython(context);
    }
    if (target === 'json-ir') {
        return `${JSON.stringify(context.ir, null, 2)}\n`;
    }
    if (target === 'bytecode') {
        return `${JSON.stringify(context.bytecode, null, 2)}\n`;
    }
    if (target === 'freestanding-c11') {
        return renderFreestandingC11(context);
    }
    throw new Error(`Unsupported compile target: ${target}`);
}

function cString(value) {
    return JSON.stringify(String(value)).replace(/\\u2028|\\u2029/g, '');
}

function renderFreestandingC11(context) {
    const sourceSha256 = crypto.createHash('sha256')
        .update(context.sourceProgram.source || '')
        .digest('hex');
    const entities = (context.ast.body || [])
        .filter((node) => node.type === 'EntityDeclaration')
        .map((node) => node.name);
    const policies = (context.ast.body || [])
        .filter((node) => node.type === 'GovernancePolicyDeclaration')
        .map((node) => node.name);
    const methodologies = (context.ast.body || [])
        .filter((node) => node.type === 'ReasoningMethodologyDeclaration')
        .map((node) => node.name);
    const procedures = (context.ast.body || [])
        .filter((node) => node.type === 'ProcedureDeclaration')
        .map((node) => node.name);
    const hasBootGuard = procedures.includes('حارس_تسليم_UEFI');
    const hasKernelMode = procedures.includes('اختيار_وضع_النواة');
    return `/* Generated from governed Arabic Sheikha source. */
#include <stdint.h>

#if defined(__GNUC__)
#define SHEIKHA_USED __attribute__((used, section(".sheikha.meta")))
#else
#define SHEIKHA_USED
#endif

SHEIKHA_USED const char sheikha_language_contract[] = "SHEIKHA_LANGUAGE_BOOT_CONTRACT_V1";
SHEIKHA_USED const char sheikha_source_sha256[] = "${sourceSha256}";
SHEIKHA_USED const char sheikha_source_language[] = "sheikha-arabic";
SHEIKHA_USED const char sheikha_values_boundary[] = "VALUES_REFERENCE_NON_EXECUTABLE";
SHEIKHA_USED const char sheikha_fatwa_boundary[] = "AUTOMATED_FATWA_DENIED";
SHEIKHA_USED const char sheikha_entities[] = ${cString(entities.join('|'))};
SHEIKHA_USED const char sheikha_policies[] = ${cString(policies.join('|'))};
SHEIKHA_USED const char sheikha_methodologies[] = ${cString(methodologies.join('|'))};

uint32_t sheikha_native_contract_version(void) { return UINT32_C(1); }
uint32_t sheikha_native_governance_ready(void) {
    return UINT32_C(${policies.length > 0 && methodologies.length > 0 ? 1 : 0});
}
uint32_t sheikha_native_kernel_handoff_allowed(uint32_t boot_services_exited) {
    return UINT32_C(${hasBootGuard ? 1 : 0}) && boot_services_exited == UINT32_C(1);
}
uint32_t sheikha_native_kernel_mode(void) {
    return UINT32_C(${hasKernelMode ? 1 : 0});
}
`;
}

function buildPayload(context, target) {
    const valuesReferences = (context.ast.body || [])
        .filter((node) => node.type === 'ValuesReferenceDeclaration')
        .map((node) => ({ name: node.name, executable: false }));
    const governancePolicies = (context.ast.body || [])
        .filter((node) => node.type === 'GovernancePolicyDeclaration')
        .map((node) => ({ name: node.name, controls: (node.properties || []).length }));
    const reasoningMethodologies = (context.ast.body || [])
        .filter((node) => node.type === 'ReasoningMethodologyDeclaration')
        .map((node) => ({ name: node.name, controls: (node.properties || []).length }));
    const procedures = (context.ast.body || [])
        .filter((node) => node.type === 'ProcedureDeclaration')
        .map((node) => ({ name: node.name, statements: (node.body || []).length }));

    return {
        basmala: 'بسم الله الرحمن الرحيم',
        language: 'Sheikha Language',
        compiler: 'sheikha-language/compiler/sheikha-compiler.js',
        source_language: context.sourceProgram.sourceLanguage,
        source_family: context.sourceProgram.sourceFamily,
        source_kind: context.sourceProgram.sourceKind,
        source_file: context.sourceProgram.sourceFile,
        output_file: context.outputPath,
        supported_targets: listTargets(),
        ast_summary: {
            nodes: context.ast.body.length,
            values_references: valuesReferences,
            governance_policies: governancePolicies,
            reasoning_methodologies: reasoningMethodologies,
            procedures,
        },
        ir_summary: {
            version: context.ir.version,
            steps: context.ir.steps.length,
        },
        type_summary: {
            ok: context.typeCheck.ok,
            diagnostics: context.typeCheck.diagnostics.length,
        },
        bytecode_summary: {
            version: context.bytecode.version,
            instructions: context.bytecode.instructions.length,
            neural_cells: context.bytecode.neuralProfile?.cells || 0,
        },
        status: `compiled_to_${target}`,
    };
}

function renderPhp(context) {
    const payload = buildPayload(context, 'php');
    return `<?php
// Generated by Sheikha Language Compiler
// لغة شيخة: طبقة حكم وتشغيل موحدة

final class SheikhaGeneratedRule
{
    public function run(): array
    {
        return ${exportPhpValue(payload)};
    }
}
`;
}

function renderJavaScript(context) {
    const payload = buildPayload(context, 'javascript');
    return `'use strict';
// Generated by Sheikha Language Compiler

const payload = ${JSON.stringify(payload, null, 2)};

console.log(JSON.stringify(payload, null, 2));
`;
}

function renderPython(context) {
    const payload = buildPayload(context, 'python');
    return `#!/usr/bin/env python3
# Generated by Sheikha Language Compiler
import json

payload = ${exportPythonValue(payload, 0)}

print(json.dumps(payload, ensure_ascii=False, indent=2))
`;
}

function exportPhpValue(value, depth = 2) {
    if (Array.isArray(value)) {
        const lines = value.map((item) => `${' '.repeat(depth + 4)}${exportPhpValue(item, depth + 4)},`);
        return `[\n${lines.join('\n')}\n${' '.repeat(depth)}]`;
    }

    if (value && typeof value === 'object') {
        const lines = Object.entries(value).map(([key, item]) => (
            `${' '.repeat(depth + 4)}${JSON.stringify(key)} => ${exportPhpValue(item, depth + 4)},`
        ));
        return `[\n${lines.join('\n')}\n${' '.repeat(depth)}]`;
    }

    if (typeof value === 'boolean') {
        return value ? 'true' : 'false';
    }

    if (typeof value === 'number') {
        return String(value);
    }

    if (value === null) {
        return 'null';
    }

    return JSON.stringify(String(value));
}

function exportPythonValue(value, depth) {
    const indent = ' '.repeat(depth);
    const childIndent = ' '.repeat(depth + 4);

    if (Array.isArray(value)) {
        const lines = value.map((item) => `${childIndent}${exportPythonValue(item, depth + 4)},`);
        return `[\n${lines.join('\n')}\n${indent}]`;
    }

    if (value && typeof value === 'object') {
        const lines = Object.entries(value).map(([key, item]) => (
            `${childIndent}${JSON.stringify(key)}: ${exportPythonValue(item, depth + 4)},`
        ));
        return `{\n${lines.join('\n')}\n${indent}}`;
    }

    if (typeof value === 'boolean') {
        return value ? 'True' : 'False';
    }

    if (typeof value === 'number') {
        return String(value);
    }

    if (value === null) {
        return 'None';
    }

    return JSON.stringify(String(value));
}

module.exports = {
    generateTarget,
    listTargets,
    resolveTarget,
};
