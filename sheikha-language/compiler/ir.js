'use strict';

function lowerToIR(ast) {
    const steps = [];

    for (const node of ast.body || []) {
        if (node.type === 'Directive') {
            steps.push({ op: 'DIRECTIVE', name: node.name, loc: node.loc });
            continue;
        }

        if (node.type === 'EntityDeclaration') {
            steps.push({ op: 'ENTITY_BEGIN', name: node.name, loc: node.loc });
            for (const property of node.properties || []) {
                steps.push({
                    op: 'ENTITY_PROPERTY',
                    entity: node.name,
                    key: property.key,
                    value: property.value,
                    loc: property.loc,
                });
            }
            steps.push({ op: 'ENTITY_END', name: node.name, loc: node.loc });
            continue;
        }

        if (node.type === 'ProcedureDeclaration') {
            steps.push({ op: 'PROCEDURE_BEGIN', name: node.name, loc: node.loc });
            pushStatements(steps, node.body || [], node.name);
            steps.push({ op: 'PROCEDURE_END', name: node.name, loc: node.loc });
        }
    }

    return {
        type: 'SheikhaIR',
        version: '0.2.0',
        meta: {
            nodes: ast.body?.length || 0,
            generatedAt: new Date().toISOString(),
        },
        steps,
    };
}

function pushStatements(steps, statements, procedureName) {
    for (const stmt of statements) {
        if (stmt.type === 'PropertyAssignment') {
            steps.push({
                op: 'PROCEDURE_PROPERTY',
                procedure: procedureName,
                key: stmt.key,
                value: stmt.value,
                loc: stmt.loc,
            });
            continue;
        }

        if (stmt.type === 'CommandStatement') {
            steps.push({
                op: 'COMMAND',
                procedure: procedureName,
                command: stmt.command,
                argument: stmt.argument,
                loc: stmt.loc,
            });
            continue;
        }

        if (stmt.type === 'IfStatement') {
            steps.push({
                op: 'IF',
                procedure: procedureName,
                condition: stmt.condition,
                thenSteps: mapInlineStatements(stmt.consequent || [], procedureName),
                elseSteps: mapInlineStatements(stmt.alternate || [], procedureName),
                loc: stmt.loc,
            });
        }
    }
}

function mapInlineStatements(statements, procedureName) {
    const out = [];
    for (const stmt of statements) {
        if (stmt.type === 'CommandStatement') {
            out.push({
                op: 'COMMAND',
                procedure: procedureName,
                command: stmt.command,
                argument: stmt.argument,
                loc: stmt.loc,
            });
            continue;
        }
        if (stmt.type === 'PropertyAssignment') {
            out.push({
                op: 'PROCEDURE_PROPERTY',
                procedure: procedureName,
                key: stmt.key,
                value: stmt.value,
                loc: stmt.loc,
            });
        }
    }
    return out;
}

module.exports = {
    lowerToIR,
};
