'use strict';

// Unified AI Gateway for all providers

const providers = require('../providers/provider-registry');

function generate(input, opts) {
  // Route to selected provider
  const provider = providers.resolveProvider();
  return provider.generate ? provider.generate(input, opts) : { error: 'Not implemented' };
}

function chat(messages, opts) {
  const provider = providers.resolveProvider();
  return provider.chat ? provider.chat(messages, opts) : { error: 'Not implemented' };
}

function vision(image, opts) {
  const provider = providers.resolveProvider();
  return provider.vision ? provider.vision(image, opts) : { error: 'Not implemented' };
}

function embedding(text, opts) {
  const provider = providers.resolveProvider();
  return provider.embedding ? provider.embedding(text, opts) : { error: 'Not implemented' };
}

function reason(context, opts) {
  const provider = providers.resolveProvider();
  return provider.reason ? provider.reason(context, opts) : { error: 'Not implemented' };
}

function tools(toolName, args) {
  const provider = providers.resolveProvider();
  return provider.tools ? provider.tools(toolName, args) : { error: 'Not implemented' };
}

module.exports = {
  generate,
  chat,
  vision,
  embedding,
  reason,
  tools
};
