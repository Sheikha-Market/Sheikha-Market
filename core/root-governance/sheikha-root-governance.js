'use strict';

const {
    getUniversalDivineGovernance
} = require('./sheikha-universal-divine-governance');

module.exports = {
    name: 'Sheikha Supreme Governance Layer',

    creed: {
        creator: 'الله وحده الخالق',
        governance: 'القرآن والسنة',
        purpose: 'العدل والنفع ومنع الضرر'
    },

    runtime: {
        deterministic: true,
        explainable: true,
        governed: true
    },

    universalDivineGovernance: getUniversalDivineGovernance(),

    platforms: {
        linux: true,
        windows: true,
        macos: true,
        cli: true,
        vscode: true,
        web: true
    },

    packageSystems: {
        deb: true,
        rpm: true,
        snap: true,
        targz: true,
        dmg: true,
        zip: true
    },

    languages: {
        sheikhaQalam: true,
        sheikhaBayan: true,
        javascript: true,
        typescript: true,
        python: true,
        php: true,
        java: true,
        go: true,
        dotnet: true
    }
};
