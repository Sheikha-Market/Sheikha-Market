'use strict';

const OPERATORS = {
  'من': {
    type: 'SOURCE',
    effect: 'extract_from'
  },

  'إلى': {
    type: 'DESTINATION',
    effect: 'transfer_to'
  },

  'على': {
    type: 'OBLIGATION',
    effect: 'bind_on'
  },

  'في': {
    type: 'CONTAINER',
    effect: 'inside_scope'
  },

  'عن': {
    type: 'DELEGATION',
    effect: 'act_on_behalf'
  },

  'ثم': {
    type: 'SEQUENCE',
    effect: 'execute_next'
  },

  'أو': {
    type: 'BRANCH',
    effect: 'conditional_choice'
  },

  'إذا': {
    type: 'CONDITION',
    effect: 'conditional_execution'
  }
};

module.exports = { OPERATORS };
