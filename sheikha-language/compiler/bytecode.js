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
            mesh: 'SHEIKHA_GOVERNED_COMPILED_VM_V1',
            cells: 57,
            metricKind: 'compatibility_profile_not_intelligence_claim',
            layers: {
                lexer: true,
                parser: true,
                types: true,
                ir: true,
                bytecode: true,
                governance: true,
                sandbox: true,
            },
            valuesReference: {
                basis: 'QURAN_AND_AUTHENTIC_SUNNAH',
                executable: false,
                automatedFatwaAllowed: false,
                religiousAuthorityClaimed: false,
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
        VALUES_REFERENCE_BEGIN: 'OPEN_VALUES_REFERENCE',
        VALUES_REFERENCE_PROPERTY: 'SET_VALUES_REFERENCE_PROP',
        VALUES_REFERENCE_END: 'CLOSE_VALUES_REFERENCE',
        GOVERNANCE_POLICY_BEGIN: 'OPEN_GOVERNANCE_POLICY',
        GOVERNANCE_POLICY_PROPERTY: 'SET_GOVERNANCE_POLICY_PROP',
        GOVERNANCE_POLICY_END: 'CLOSE_GOVERNANCE_POLICY',
        REASONING_METHODOLOGY_BEGIN: 'OPEN_REASONING_METHODOLOGY',
        REASONING_METHODOLOGY_PROPERTY: 'SET_REASONING_METHODOLOGY_PROP',
        REASONING_METHODOLOGY_END: 'CLOSE_REASONING_METHODOLOGY',
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
