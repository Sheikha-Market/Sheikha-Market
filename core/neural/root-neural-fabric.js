'use strict';

const governance = require('../root-governance/sheikha-root-governance');

module.exports = {
    fabric: 'Sheikha Root Neural Fabric',

    governance,

    cells: [
        'root',
        'governance',
        'languages',
        'platforms',
        'packages',
        'production',
        'industrial',
        'ai',
        'git',
        'runtime'
    ],

    status: 'ACTIVE'
};
