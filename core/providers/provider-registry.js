'use strict';

const providers = {
  openai: './openai',
  ollama: './ollama',
  local: './local',
  offline: './offline',
  gemini: './gemini',
  claude: './claude'
};

function resolveProvider(name = process.env.SHEIKHA_PROVIDER || 'local') {
  try {
    return require(providers[name]);
  } catch (e) {
    return require('./offline');
  }
}

module.exports = {
  resolveProvider,
  providers
};
