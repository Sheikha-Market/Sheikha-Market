'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ADAPTER_METHODS = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);
const PM2_ACTIONS = new Set(['status', 'restart', 'start', 'stop', 'logs']);
const DOCKER_ACTIONS = new Set(['ps', 'images', 'inspect', 'logs', 'start', 'stop']);
const PYTHON_PERMISSIONS = new Set(['score', 'analyze', 'summarize']);

function typeCheckAst(ast) {
    const diagnostics = [];
    const symbols = {
        entities: {},
        procedures: {},
    };

    for (const node of ast.body || []) {
        if (node.type === 'EntityDeclaration') {
            checkEntity(node, diagnostics, symbols);
            continue;
        }
        if (node.type === 'ProcedureDeclaration') {
            checkProcedure(node, diagnostics, symbols);
        }
    }

    return {
        ok: diagnostics.every((d) => d.severity !== 'error'),
        diagnostics,
        symbols,
    };
}

function checkEntity(node, diagnostics, symbols) {
    const props = {};
    for (const property of node.properties || []) {
        const inferredType = inferType(property.value);
        props[property.key] = inferredType;

        if (property.key === 'الوزن' && inferredType !== 'number') {
            diagnostics.push(diag('error', 'SHK-TYPE-001', 'الحقل الوزن يجب أن يكون رقمًا.', property.loc));
        }

        if (property.key === 'منع' && inferredType !== 'list') {
            diagnostics.push(diag('warning', 'SHK-TYPE-002', 'الحقل منع يفضل أن يكون قائمة مفصولة بفواصل.', property.loc));
        }
    }

    symbols.entities[node.name] = {
        properties: props,
    };
}

function checkProcedure(node, diagnostics, symbols) {
    const proc = {
        commands: [],
    };

    for (const statement of node.body || []) {
        if (statement.type === 'CommandStatement') {
            proc.commands.push(statement.command);
            checkCommand(statement, diagnostics);
            continue;
        }

        if (statement.type === 'IfStatement') {
            if (!String(statement.condition || '').trim()) {
                diagnostics.push(diag('error', 'SHK-TYPE-003', 'جملة إذا تحتاج شرطًا صالحًا.', statement.loc));
            }
            checkInlineCommands(statement.consequent || [], diagnostics);
            checkInlineCommands(statement.alternate || [], diagnostics);
        }
    }

    symbols.procedures[node.name] = proc;
}

function checkInlineCommands(statements, diagnostics) {
    for (const statement of statements) {
        if (statement.type === 'CommandStatement') {
            checkCommand(statement, diagnostics);
        }
    }
}

function checkCommand(statement, diagnostics) {
    const command = statement.command;
    const args = parseArgs(statement.argument);

    if (command === 'API' || command === 'نداء_api') {
        const method = String(args[0] || '').toUpperCase();
        const url = args[1] || '';
        if (!ADAPTER_METHODS.has(method)) {
            diagnostics.push(diag('error', 'SHK-TYPE-101', 'أمر API يتطلب method صالحًا مثل GET/POST.', statement.loc));
        }
        if (!/^https?:\/\//.test(String(url))) {
            diagnostics.push(diag('error', 'SHK-TYPE-102', 'أمر API يتطلب رابطًا صحيحًا يبدأ بـ http:// أو https://.', statement.loc));
        }
        return;
    }

    if (command === 'PM2' || command === 'تحكم_pm2') {
        const action = String(args[0] || '').toLowerCase();
        if (!PM2_ACTIONS.has(action)) {
            diagnostics.push(diag('error', 'SHK-TYPE-103', 'أمر PM2 يحتوي إجراء غير مدعوم.', statement.loc));
        }
        return;
    }

    if (command === 'DOCKER' || command === 'تحكم_docker') {
        const action = String(args[0] || '').toLowerCase();
        if (!DOCKER_ACTIONS.has(action)) {
            diagnostics.push(diag('error', 'SHK-TYPE-104', 'أمر Docker يحتوي إجراء غير مدعوم.', statement.loc));
        }
        return;
    }

    if (command === 'PYTHON') {
        const scriptPath = String(args[0] || '');
        const contractPath = String(args[1] || '');
        if (!scriptPath.endsWith('.py')) {
            diagnostics.push(diag('error', 'SHK-TYPE-106', 'أمر PYTHON يتطلب مسار ملف ‎.py صالحًا.', statement.loc));
        }
        if (!contractPath.endsWith('.json')) {
            diagnostics.push(diag('error', 'SHK-TYPE-107', 'أمر PYTHON يتطلب ملف عقد ‎.json صالحًا.', statement.loc));
            return;
        }

        const resolvedContractPath = path.resolve(process.cwd(), contractPath);
        if (!fs.existsSync(resolvedContractPath)) {
            diagnostics.push(diag('error', 'SHK-TYPE-108', `ملف عقد PYTHON غير موجود: ${contractPath}`, statement.loc));
            return;
        }

        let parsedPayload = null;
        try {
            parsedPayload = JSON.parse(fs.readFileSync(resolvedContractPath, 'utf8'));
        } catch (_) {
            diagnostics.push(diag('error', 'SHK-TYPE-109', 'أمر PYTHON يتطلب عقد JSON صالحًا.', statement.loc));
            return;
        }

        if (!parsedPayload || Array.isArray(parsedPayload) || typeof parsedPayload !== 'object') {
            diagnostics.push(diag('error', 'SHK-TYPE-110', 'عقد PYTHON يجب أن يكون كائن JSON.', statement.loc));
            return;
        }

        if (!parsedPayload.input || Array.isArray(parsedPayload.input) || typeof parsedPayload.input !== 'object') {
            diagnostics.push(diag('error', 'SHK-TYPE-111', 'عقد PYTHON يجب أن يحتوي input ككائن JSON.', statement.loc));
        }

        if (!Array.isArray(parsedPayload.permissions) || parsedPayload.permissions.length === 0) {
            diagnostics.push(diag('error', 'SHK-TYPE-112', 'عقد PYTHON يجب أن يحتوي permissions كمصفوفة غير فارغة.', statement.loc));
            return;
        }

        for (const permission of parsedPayload.permissions) {
            if (!PYTHON_PERMISSIONS.has(String(permission))) {
                diagnostics.push(diag('error', 'SHK-TYPE-113', `صلاحية PYTHON غير مدعومة: ${permission}`, statement.loc));
            }
        }
        return;
    }

    if ((command === 'اعرض' || command === 'ارفض' || command === 'أجز') && String(statement.argument || '').trim() === '') {
        diagnostics.push(diag('error', 'SHK-TYPE-105', `الأمر ${command} يحتاج قيمة نصية.`, statement.loc));
    }
}

function inferType(value) {
    const text = String(value || '').trim();
    if (/^[0-9]+(?:\.[0-9]+)?(?:\s+\S+)?$/.test(text)) {
        return 'number';
    }
    if (text.includes('،') || text.includes(',')) {
        return 'list';
    }
    return 'string';
}

function parseArgs(argument) {
    const input = String(argument || '').trim();
    if (!input) {
        return [];
    }
    const parts = input.match(/"[^"]*"|\S+/g) || [];
    return parts.map((part) => part.replace(/^"|"$/g, ''));
}

function diag(severity, code, message, loc) {
    return {
        severity,
        code,
        message,
        loc,
    };
}

module.exports = {
    typeCheckAst,
};
