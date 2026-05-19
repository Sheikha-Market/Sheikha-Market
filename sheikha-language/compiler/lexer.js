'use strict';

function isWhitespace(ch) {
    return ch === ' ' || ch === '\t' || ch === '\r';
}

function isNumber(ch) {
    return ch >= '0' && ch <= '9';
}

function isIdentifierChar(ch) {
    if (!ch) {
        return false;
    }
    if (isWhitespace(ch)) {
        return false;
    }
    return ch !== ':' && ch !== ',' && ch !== '،' && ch !== '"' && ch !== '\n';
}

function createToken(type, value, line, column) {
    return { type, value, line, column };
}

function handleIndent(tokens, indentStack, indent, lineNumber) {
    const currentIndent = indentStack.at(-1);
    if (indent > currentIndent) {
        indentStack.push(indent);
        tokens.push(createToken('INDENT', '', lineNumber, 1));
        return;
    }

    if (indent < currentIndent) {
        while (indent < indentStack.at(-1)) {
            indentStack.pop();
            tokens.push(createToken('DEDENT', '', lineNumber, 1));
        }
        if (indent !== indentStack.at(-1)) {
            throw new Error(`خطأ مسافات بادئة في السطر ${lineNumber}`);
        }
    }
}

function readString(line, i, lineNumber) {
    const start = i;
    i++;
    let value = '';
    while (i < line.length && line[i] !== '"') {
        if (line[i] === '\\' && i + 1 < line.length) {
            i++;
        }
        value += line[i];
        i++;
    }
    if (i >= line.length) {
        throw new Error(`نهاية غير مغلقة للسلسلة النصية في السطر ${lineNumber}`);
    }
    return {
        token: createToken('STRING', value, lineNumber, start + 1),
        next: i + 1,
    };
}

function readNumber(line, i, lineNumber) {
    const start = i;
    let value = line[i];
    i++;
    while (i < line.length && /[0-9.]/.test(line[i])) {
        value += line[i];
        i++;
    }
    return {
        token: createToken('NUMBER', value, lineNumber, start + 1),
        next: i,
    };
}

function readIdentifier(line, i, lineNumber) {
    const start = i;
    let value = line[i];
    i++;
    while (i < line.length && isIdentifierChar(line[i])) {
        value += line[i];
        i++;
    }
    return {
        token: createToken('IDENT', value, lineNumber, start + 1),
        next: i,
    };
}

function tokenizeLineContent(tokens, line, lineNumber, startIndex) {
    let i = startIndex;
    while (i < line.length) {
        const ch = line[i];
        if (isWhitespace(ch)) {
            i++;
            continue;
        }

        if (ch === ':') {
            tokens.push(createToken('COLON', ':', lineNumber, i + 1));
            i++;
            continue;
        }

        if (ch === ',' || ch === '،') {
            tokens.push(createToken('COMMA', ch, lineNumber, i + 1));
            i++;
            continue;
        }

        if (ch === '"') {
            const stringResult = readString(line, i, lineNumber);
            tokens.push(stringResult.token);
            i = stringResult.next;
            continue;
        }

        if (isNumber(ch)) {
            const numberResult = readNumber(line, i, lineNumber);
            tokens.push(numberResult.token);
            i = numberResult.next;
            continue;
        }

        if (isIdentifierChar(ch)) {
            const identResult = readIdentifier(line, i, lineNumber);
            tokens.push(identResult.token);
            i = identResult.next;
            continue;
        }

        throw new Error(`رمز غير مدعوم '${ch}' في السطر ${lineNumber}`);
    }
}

function lex(source) {
    const tokens = [];
    const lines = String(source).replaceAll('\r\n', '\n').split('\n');
    const indentStack = [0];

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
        const lineNumber = lineIndex + 1;
        const rawLine = lines[lineIndex];
        const line = rawLine.replaceAll('\t', '    ');

        if (/^\s*$/.test(line) || /^\s*#/.test(line)) {
            continue;
        }

        const indentMatch = /^\s*/.exec(line);
        const indent = indentMatch ? indentMatch[0].length : 0;
        handleIndent(tokens, indentStack, indent, lineNumber);
        tokenizeLineContent(tokens, line, lineNumber, indent);

        tokens.push(createToken('NEWLINE', '', lineNumber, line.length + 1));
    }

    while (indentStack.length > 1) {
        indentStack.pop();
        tokens.push(createToken('DEDENT', '', lines.length, 1));
    }

    tokens.push(createToken('EOF', '', lines.length + 1, 1));
    return tokens;
}

module.exports = {
    lex,
};
