'use strict';

const atlas = require('../../knowledge/quranic-atlas/sheikha-quranic-architectural-atlas.json');

function loadQuranicAtlas() {
  return atlas;
}

module.exports = { loadQuranicAtlas };
