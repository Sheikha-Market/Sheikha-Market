'use strict';

const { createSheikhaAIRouter } = require('../sheikha-ai-router');
const { createSheikhaRouterGovernor } = require('./governance');
const { createHostingerUpstreamAdapter } = require('./hostinger-upstream');
const { createSheikhaProvider } = require('./provider');

module.exports = {
    createSheikhaAIRouter,
    createSheikhaRouterGovernor,
    createHostingerUpstreamAdapter,
    createSheikhaProvider
};
