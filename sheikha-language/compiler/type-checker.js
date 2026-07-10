'use strict';

const ADAPTER_METHODS = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);
const PM2_ACTIONS = new Set(['status', 'restart', 'start', 'stop', 'logs']);
const DOCKER_ACTIONS = new Set(['ps', 'images', 'inspect', 'logs', 'start', 'stop']);

function typeCheckAst(ast) {
    const diagnostics = [];
    const symbols = {
        entities: {},
        procedures: {},
        valuesReferences: {},
        governancePolicies: {},
        reasoningMethodologies: {},
    };

    for (const node of ast.body || []) {
        if (node.type === 'EntityDeclaration') {
            checkEntity(node, diagnostics, symbols);
            continue;
        }
        if (node.type === 'ProcedureDeclaration') {
            checkProcedure(node, diagnostics, symbols);
            continue;
        }
        if (node.type === 'ValuesReferenceDeclaration') {
            checkValuesReference(node, diagnostics, symbols);
            continue;
        }
        if (node.type === 'GovernancePolicyDeclaration') {
            checkGovernancePolicy(node, diagnostics, symbols);
            continue;
        }
        if (node.type === 'ReasoningMethodologyDeclaration') {
            checkReasoningMethodology(node, diagnostics, symbols);
        }
    }

    return {
        ok: diagnostics.every((d) => d.severity !== 'error'),
        diagnostics,
        symbols,
    };
}

function checkValuesReference(node, diagnostics, symbols) {
    const properties = propertiesToObject(node.properties);
    requireProperty(properties, 'المصدر', 'SHK-GOV-001', node, diagnostics);
    requirePropertyContains(
        properties,
        'الدور',
        ['غير_تنفيذية'],
        'SHK-GOV-002',
        'المرجعية يجب أن تصرح بأن دورها غير تنفيذي.',
        node,
        diagnostics
    );
    requirePropertyValue(
        properties,
        'السلطة_البرمجية',
        'لا',
        'SHK-GOV-003',
        'المرجعية القيمية لا تمنح البرنامج سلطة دينية.',
        node,
        diagnostics
    );
    requirePropertyContains(
        properties,
        'الفتوى_الآلية',
        ['ممنوع'],
        'SHK-GOV-004',
        'يجب منع الفتوى الآلية صراحة.',
        node,
        diagnostics
    );
    requirePropertyContains(
        properties,
        'المراجعة_الشرعية',
        ['أهل_العلم', 'مؤهل'],
        'SHK-GOV-005',
        'المسائل الشرعية الملزمة تحتاج مراجعة أهل العلم المؤهلين.',
        node,
        diagnostics
    );
    requirePropertyContains(
        properties,
        'التحقق_من_المصادر',
        ['واجب'],
        'SHK-GOV-006',
        'توثيق المصدر والتحقق منه واجب.',
        node,
        diagnostics
    );

    symbols.valuesReferences[node.name] = {
        executable: false,
        properties: inferProperties(node.properties),
    };
}

function checkGovernancePolicy(node, diagnostics, symbols) {
    const properties = propertiesToObject(node.properties);
    requirePropertyContains(
        properties,
        'يوجب',
        ['الصدق', 'العدل', 'الأمانة', 'الدليل'],
        'SHK-GOV-101',
        'سياسة الحوكمة يجب أن توجب الصدق والعدل والأمانة والدليل.',
        node,
        diagnostics
    );
    requirePropertyContains(
        properties,
        'يمنع',
        ['الضرر', 'الظلم', 'الغش', 'الخداع', 'الإكراه'],
        'SHK-GOV-102',
        'سياسة الحوكمة يجب أن تمنع الضرر والظلم والغش والخداع والإكراه.',
        node,
        diagnostics
    );
    requirePropertyContains(
        properties,
        'القرار_العالي_الأثر',
        ['مراجعة_بشرية', 'ملزم'],
        'SHK-GOV-103',
        'القرارات العالية الأثر تحتاج مراجعة بشرية ملزمة.',
        node,
        diagnostics
    );
    requirePropertyContains(
        properties,
        'التنفيذ',
        ['أقل_صلاحية', 'موافقة_صريحة'],
        'SHK-GOV-104',
        'التنفيذ يجب أن يلتزم بأقل صلاحية وموافقة صريحة.',
        node,
        diagnostics
    );

    symbols.governancePolicies[node.name] = {
        properties: inferProperties(node.properties),
    };
}

function checkReasoningMethodology(node, diagnostics, symbols) {
    const properties = propertiesToObject(node.properties);
    requirePropertyContains(
        properties,
        'لغة_البرمجة',
        ['العربية'],
        'SHK-METHOD-001',
        'منهج لغة شيخة يجب أن يصرح بالعربية لغة برمجة أساسية.',
        node,
        diagnostics
    );
    requirePropertyContains(
        properties,
        'علوم_العربية',
        ['النحو', 'الصرف', 'البلاغة', 'البيان'],
        'SHK-METHOD-002',
        'منهج العربية يجب أن يشمل النحو والصرف والبلاغة والبيان.',
        node,
        diagnostics
    );
    requirePropertyContains(
        properties,
        'علوم_الاستدلال',
        ['المنطق', 'الحجة', 'البرهان', 'الاستدلال'],
        'SHK-METHOD-003',
        'منهج الاستدلال يجب أن يشمل المنطق والحجة والبرهان والاستدلال.',
        node,
        diagnostics
    );
    requirePropertyContains(
        properties,
        'منهج_الحساب',
        ['تعريفات', 'مسلمات', 'برهان', 'اختبار'],
        'SHK-METHOD-004',
        'الحساب يحتاج تعريفات ومسلمات وبرهانًا واختبارًا.',
        node,
        diagnostics
    );
    requirePropertyContains(
        properties,
        'منهج_العلوم_التجريبية',
        ['ملاحظة', 'قياس', 'تجربة', 'تكرار'],
        'SHK-METHOD-005',
        'العلوم التجريبية تحتاج ملاحظة وقياسًا وتجربة وقابلية للتكرار.',
        node,
        diagnostics
    );
    requirePropertyContains(
        properties,
        'الاستدلال_الشرعي',
        ['القرآن_الكريم', 'السنة_الصحيحة', 'أهل_العلم'],
        'SHK-METHOD-006',
        'الاستدلال الشرعي يرجع للقرآن الكريم والسنة الصحيحة مع أهل العلم.',
        node,
        diagnostics
    );
    requirePropertyContains(
        properties,
        'خلط_المجالات',
        ['ممنوع'],
        'SHK-METHOD-007',
        'يمنع خلط الحكم الشرعي بالنتيجة العلمية أو الحسابية بلا دليل مختص.',
        node,
        diagnostics
    );
    requirePropertyContains(
        properties,
        'بيان_الدليل_والثقة',
        ['واجب'],
        'SHK-METHOD-008',
        'بيان الدليل ودرجة الثقة واجب.',
        node,
        diagnostics
    );
    requirePropertyContains(
        properties,
        'الفتوى_الآلية',
        ['ممنوع'],
        'SHK-METHOD-009',
        'الفتوى الآلية ممنوعة.',
        node,
        diagnostics
    );

    symbols.reasoningMethodologies[node.name] = {
        executableReligiousAuthority: false,
        properties: inferProperties(node.properties),
    };
}

function propertiesToObject(properties = []) {
    return Object.fromEntries(properties.map((property) => [property.key, String(property.value || '')]));
}

function inferProperties(properties = []) {
    return Object.fromEntries(properties.map((property) => [property.key, inferType(property.value)]));
}

function requireProperty(properties, key, code, node, diagnostics) {
    if (!String(properties[key] || '').trim()) {
        diagnostics.push(diag('error', code, `الحقل ${key} مطلوب.`, node.loc));
    }
}

function requirePropertyValue(properties, key, expected, code, message, node, diagnostics) {
    if (String(properties[key] || '').trim() !== expected) {
        diagnostics.push(diag('error', code, message, node.loc));
    }
}

function requirePropertyContains(properties, key, requiredValues, code, message, node, diagnostics) {
    const value = String(properties[key] || '');
    if (requiredValues.some((required) => !value.includes(required))) {
        diagnostics.push(diag('error', code, message, node.loc));
    }
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
