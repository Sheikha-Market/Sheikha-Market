'use strict';

const cellModules = {};

function registerCellModule(cellId, module) {
    if (!cellId || !module) {
        return false;
    }
    cellModules[cellId] = module;
    return true;
}

function getCellModule(cellId) {
    return cellModules[cellId] || null;
}

function listCellModules() {
    return Object.keys(cellModules);
}

function getNeuralCellsStatus(rootDir = process.cwd()) {
    return {
        status: 'active',
        activeCells: listCellModules().length,
        loadedCells: listCellModules(),
        message: 'Root neural cells registry active',
        rootDir
    };
}

function evaluateCell(cellId, input) {
    const cell = getCellModule(cellId);
    if (cell && typeof cell.evaluate === 'function') {
        return cell.evaluate(input);
    }

    return {
        id: cellId,
        status: 'missing',
        message: 'Cell module not found or cannot evaluate'
    };
}

function evaluateAll(input) {
    return listCellModules().map(cellId => evaluateCell(cellId, input));
}

module.exports = {
    registerCellModule,
    getCellModule,
    listCellModules,
    getNeuralCellsStatus,
    evaluateCell,
    evaluateAll
};
