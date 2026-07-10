'use strict';

const { runIR } = require('./vm');

function runBytecode(bytecode, options = {}) {
    const ir = bytecodeToIR(bytecode);
    const runtimeOptions = {
        ...options,
        profile: options.profile || 'production',
        strictIsolation: typeof options.strictIsolation === 'boolean' ? options.strictIsolation : true,
    };
    const base = runIR(ir, runtimeOptions);

    base.state.neural.cells = bytecode.neuralProfile?.cells || 57;
    base.state.neural.status = 'hyper-online';
    base.state.neural.mesh = bytecode.neuralProfile?.mesh || 'SHEIKHA_GOVERNED_COMPILED_VM_V1';
    base.state.neural.layers = bytecode.neuralProfile?.layers || {
        lexer: true,
        parser: true,
        types: true,
        ir: true,
        bytecode: true,
        governance: true,
        sandbox: true,
    };
    base.state.neural.valuesReference = bytecode.neuralProfile?.valuesReference || {
        basis: 'QURAN_AND_AUTHENTIC_SUNNAH',
        executable: false,
        automatedFatwaAllowed: false,
        religiousAuthorityClaimed: false,
    };
    base.state.neural.mode = 'compiled-bytecode-runtime';

    return base;
}

function bytecodeToIR(bytecode) {
    const steps = [];
    for (const instruction of bytecode.instructions || []) {
        steps.push(...instructionToSteps(instruction));
    }
    return {
        type: 'SheikhaIR',
        version: '0.3.0-bytecode-bridge',
        steps,
    };
}

function instructionToSteps(instruction) {
    if (instruction.code === 'IF_INLINE') {
        return [
            {
                op: 'IF',
                condition: instruction.condition,
                procedure: instruction.procedure,
                thenSteps: flattenNested(instruction.thenInstructions || []),
                elseSteps: flattenNested(instruction.elseInstructions || []),
                loc: instruction.loc,
            },
        ];
    }

    const mapping = {
        PUSH_DIRECTIVE: 'DIRECTIVE',
        OPEN_VALUES_REFERENCE: 'VALUES_REFERENCE_BEGIN',
        SET_VALUES_REFERENCE_PROP: 'VALUES_REFERENCE_PROPERTY',
        CLOSE_VALUES_REFERENCE: 'VALUES_REFERENCE_END',
        OPEN_GOVERNANCE_POLICY: 'GOVERNANCE_POLICY_BEGIN',
        SET_GOVERNANCE_POLICY_PROP: 'GOVERNANCE_POLICY_PROPERTY',
        CLOSE_GOVERNANCE_POLICY: 'GOVERNANCE_POLICY_END',
        OPEN_REASONING_METHODOLOGY: 'REASONING_METHODOLOGY_BEGIN',
        SET_REASONING_METHODOLOGY_PROP: 'REASONING_METHODOLOGY_PROPERTY',
        CLOSE_REASONING_METHODOLOGY: 'REASONING_METHODOLOGY_END',
        OPEN_ENTITY: 'ENTITY_BEGIN',
        SET_ENTITY_PROP: 'ENTITY_PROPERTY',
        CLOSE_ENTITY: 'ENTITY_END',
        OPEN_PROCEDURE: 'PROCEDURE_BEGIN',
        SET_PROC_PROP: 'PROCEDURE_PROPERTY',
        CALL_COMMAND: 'COMMAND',
        CLOSE_PROCEDURE: 'PROCEDURE_END',
        NOOP: 'NOOP',
    };

    const op = mapping[instruction.code] || 'NOOP';
    if (op === 'NOOP') {
        return [];
    }

    const clone = { ...instruction };
    delete clone.code;
    return [{ op, ...clone }];
}

function flattenNested(instructions) {
    const steps = [];
    for (const instruction of instructions) {
        steps.push(...instructionToSteps(instruction));
    }
    return steps;
}

module.exports = {
    runBytecode,
};
