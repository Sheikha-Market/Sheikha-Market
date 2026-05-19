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
    base.state.neural.mesh = bytecode.neuralProfile?.mesh || 'SHEIKHA_RADICAL_NEURAL_MESH_V2';
    base.state.neural.layers = bytecode.neuralProfile?.layers || {
        quranic: 19,
        sunnah: 11,
        maqasid: 11,
        fiqh: 8,
        tawheed: 1,
        governance: 7,
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
