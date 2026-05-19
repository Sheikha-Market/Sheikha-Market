'use strict';

const { evaluate } = require('../core/root-calculus');

const result = evaluate({
  intention: true,
  truth: true,
  noHarm: true,
  usefulness: true,
  governance: true,
  rollback: true
});

console.log(JSON.stringify(result, null, 2));
