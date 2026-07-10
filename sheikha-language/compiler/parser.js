'use strict';

class TokenStream {
    constructor(tokens) {
        this.tokens = tokens;
        this.pos = 0;
    }

    current() {
        return this.tokens[this.pos];
    }

    peek(offset = 1) {
        return this.tokens[this.pos + offset];
    }

    is(type, value) {
        const token = this.current();
        return Boolean(token) && token.type === type && (value === undefined || token.value === value);
    }

    consume(type, value) {
        const token = this.current();
        if (!token || token.type !== type || (value !== undefined && token.value !== value)) {
            const found = token ? `${token.type}:${token.value}` : 'EOF';
            const expected = value === undefined ? type : `${type}:${value}`;
            throw new Error(`خطأ نحوي: متوقع ${expected} لكن وُجد ${found} في السطر ${token ? token.line : 'EOF'}`);
        }
        this.pos++;
        return token;
    }

    maybe(type, value) {
        if (this.is(type, value)) {
            return this.consume(type, value);
        }
        return null;
    }

    skipNewlines() {
        while (this.is('NEWLINE')) {
            this.consume('NEWLINE');
        }
    }
}

const COMMAND_KEYWORDS = new Set([
    'اعرض',
    'ارفض',
    'أجز',
    'API',
    'PM2',
    'DOCKER',
    'نداء_api',
    'تحكم_pm2',
    'تحكم_docker',
]);

function node(type, fields, startToken, endToken) {
    return {
        type,
        ...fields,
        loc: {
            start: { line: startToken.line, column: startToken.column },
            end: { line: endToken.line, column: endToken.column },
        },
    };
}

function parse(tokens) {
    const stream = new TokenStream(tokens);
    const body = [];
    stream.skipNewlines();

    while (!stream.is('EOF')) {
        body.push(parseTopLevel(stream));
        stream.skipNewlines();
    }

    const eof = stream.consume('EOF');
    return {
        type: 'Program',
        body,
        loc: {
            start: { line: 1, column: 1 },
            end: { line: eof.line, column: eof.column },
        },
    };
}

function parseTopLevel(stream) {
    const current = stream.current();
    if (current?.type !== 'IDENT') {
        throw new Error(`خطأ نحوي في السطر ${current ? current.line : 'EOF'}: عبارة عليا غير صالحة`);
    }

    if (current.value === 'بسم_الله') {
        const start = stream.consume('IDENT', 'بسم_الله');
        const end = consumeLineEnd(stream, start);
        return node('Directive', { name: 'بسم_الله' }, start, end);
    }

    if (current.value === 'كيان') {
        return parseEntity(stream);
    }

    if (current.value === 'مرجعية') {
        return parseNamedPropertyDeclaration(
            stream,
            'مرجعية',
            'ValuesReferenceDeclaration'
        );
    }

    if (current.value === 'سياسة') {
        return parseNamedPropertyDeclaration(
            stream,
            'سياسة',
            'GovernancePolicyDeclaration'
        );
    }

    if (current.value === 'منهج') {
        return parseNamedPropertyDeclaration(
            stream,
            'منهج',
            'ReasoningMethodologyDeclaration'
        );
    }

    if (current.value === 'إجراء') {
        return parseProcedure(stream);
    }

    throw new Error(`كلمة عليا غير مدعومة '${current.value}' في السطر ${current.line}`);
}

function parseEntity(stream) {
    return parseNamedPropertyDeclaration(stream, 'كيان', 'EntityDeclaration');
}

function parseNamedPropertyDeclaration(stream, keyword, declarationType) {
    const start = stream.consume('IDENT', keyword);
    const name = collectTextUntil(stream, 'COLON');
    stream.consume('COLON');
    stream.consume('NEWLINE');
    stream.consume('INDENT');

    const properties = [];
    stream.skipNewlines();
    while (!stream.is('DEDENT') && !stream.is('EOF')) {
        properties.push(parseProperty(stream));
        stream.skipNewlines();
    }

    const end = stream.consume('DEDENT');
    return node(declarationType, { name, properties }, start, end);
}

function parseProcedure(stream) {
    const start = stream.consume('IDENT', 'إجراء');
    const name = collectTextUntil(stream, 'COLON');
    stream.consume('COLON');
    stream.consume('NEWLINE');
    stream.consume('INDENT');

    const body = parseBlock(stream);
    const end = stream.consume('DEDENT');
    return node('ProcedureDeclaration', { name, body }, start, end);
}

function parseBlock(stream) {
    const statements = [];
    stream.skipNewlines();
    while (!stream.is('DEDENT') && !stream.is('EOF')) {
        statements.push(parseStatement(stream));
        stream.skipNewlines();
    }
    return statements;
}

function parseStatement(stream) {
    const current = stream.current();
    if (current?.type !== 'IDENT') {
        throw new Error(`عبارة غير صالحة في السطر ${current ? current.line : 'EOF'}`);
    }

    if (current.value === 'إذا') {
        return parseIfStatement(stream);
    }

    if (COMMAND_KEYWORDS.has(current.value)) {
        return parseCommand(stream);
    }

    return parseProperty(stream);
}

function parseIfStatement(stream) {
    const start = stream.consume('IDENT', 'إذا');
    const condition = collectTextUntil(stream, 'COLON');
    stream.consume('COLON');
    stream.consume('NEWLINE');
    stream.consume('INDENT');
    const consequent = parseBlock(stream);
    const dedent = stream.consume('DEDENT');

    let alternate = [];
    stream.skipNewlines();

    if (stream.is('IDENT', 'وإلا')) {
        stream.consume('IDENT', 'وإلا');
        stream.consume('COLON');
        stream.consume('NEWLINE');
        stream.consume('INDENT');
        alternate = parseBlock(stream);
        stream.consume('DEDENT');
    }

    return node('IfStatement', { condition, consequent, alternate }, start, dedent);
}

function parseCommand(stream) {
    const keyword = stream.consume('IDENT');
    const argument = collectTextUntil(stream, 'NEWLINE');
    const end = stream.consume('NEWLINE');
    return node('CommandStatement', { command: keyword.value, argument }, keyword, end);
}

function parseProperty(stream) {
    const start = stream.current();
    const key = collectTextUntil(stream, 'COLON');
    stream.consume('COLON');
    const value = collectTextUntil(stream, 'NEWLINE');
    const end = stream.consume('NEWLINE');
    return node('PropertyAssignment', { key, value }, start, end);
}

function collectTextUntil(stream, boundaryType) {
    const parts = [];
    while (!stream.is(boundaryType) && !stream.is('EOF')) {
        const t = stream.current();
        if (t.type === 'NEWLINE' || t.type === 'INDENT' || t.type === 'DEDENT') {
            break;
        }
        stream.consume(t.type);
        if (t.type === 'COMMA') {
            parts.push('،');
        } else if (t.type === 'STRING') {
            parts.push(`"${t.value}"`);
        } else {
            parts.push(t.value);
        }
    }
    return normalizeSpaces(parts.join(' '));
}

function consumeLineEnd(stream, fallbackToken) {
    if (stream.is('NEWLINE')) {
        return stream.consume('NEWLINE');
    }
    return fallbackToken;
}

function normalizeSpaces(value) {
    return value
        .replace(/\s+،/g, '،')
        .replace(/\s+/g, ' ')
        .trim();
}

module.exports = {
    parse,
};
