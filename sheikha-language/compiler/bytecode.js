'use strict';

function compileIRToBytecode(ir) {
    const instructions = [];
    for (const step of ir.steps || []) {
        instructions.push(toInstruction(step));
    }

    return {
        type: 'SheikhaBytecode',
        version: '0.1.0',
        neuralProfile: {
            mesh: 'SHEIKHA_RADICAL_NEURAL_MESH_V2',
            cells: 57,
            layers: {
                quranic: 19,
                sunnah: 11,
                maqasid: 11,
                fiqh: 8,
                tawheed: 1,
                governance: 7,
            },
        },
        instructions,
    };
}

function toInstruction(step) {
    if (step.op === 'IF') {
        return {
            code: 'IF_INLINE',
            condition: step.condition,
            thenInstructions: (step.thenSteps || []).map(toInstruction),
            elseInstructions: (step.elseSteps || []).map(toInstruction),
            procedure: step.procedure,
            loc: step.loc,
        };
    }

    const mapping = {
        DIRECTIVE: 'PUSH_DIRECTIVE',
        ENTITY_BEGIN: 'OPEN_ENTITY',
        ENTITY_PROPERTY: 'SET_ENTITY_PROP',
        ENTITY_END: 'CLOSE_ENTITY',
        PROCEDURE_BEGIN: 'OPEN_PROCEDURE',
        PROCEDURE_PROPERTY: 'SET_PROC_PROP',
        COMMAND: 'CALL_COMMAND',
        PROCEDURE_END: 'CLOSE_PROCEDURE',
    };

    return {
        code: mapping[step.op] || 'NOOP',
        ...step,
    };
}

module.exports = {
    compileIRToBytecode,
};
