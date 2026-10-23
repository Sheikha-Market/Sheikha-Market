'use strict';

const vm = require('node:vm');
const { QUICK_ACTIONS, renderSheikhaChatTemplate } = require('../src/ui/sheikhaChatTemplate');

function fixture(draft = '') {
  const buttons = QUICK_ACTIONS.map(action => ({
    dataset: { prompt: action.prompt, mode: action.mode || '' },
    addEventListener: function (event, callback) { this.click = callback; }
  }));
  const html = renderSheikhaChatTemplate();
  const start = html.indexOf("document.querySelectorAll('[data-prompt]').forEach");
  const end = html.indexOf("input.addEventListener('keydown'", start);
  if (start < 0 || end < 0) throw Error('QUICK_ACTION_HANDLER_MISSING');
  const context = { busy: false, appliedQuickPrompt: '',
    input: { value: draft, focus: jest.fn() }, modeSelect: { value: 'smart' },
    updateAudienceVisibility: jest.fn(), resizeInput: jest.fn(), saveState: jest.fn(),
    document: { querySelectorAll: () => buttons } };
  vm.runInNewContext(html.slice(start, end), context);
  return { context, click: icon => buttons[QUICK_ACTIONS.findIndex(action => action.icon === icon)].click() };
}

test('quick action preserves a drafted task and does not submit it', () => {
  const f = fixture('أصلح دالة الجمع'); f.click('RUN');
  expect(f.context.input.value).toBe(QUICK_ACTIONS.find(a => a.icon === 'RUN').prompt + '\n\nأصلح دالة الجمع');
  expect(f.context.modeSelect.value).toBe('engineering');
  expect(f.context.saveState).toHaveBeenCalledTimes(1);
});
test('repeated clicks and mode switches keep one instruction and the current task', () => {
  const f = fixture('TASK'); f.click('RUN'); f.click('RUN');
  f.context.input.value += '\nEDITED'; f.click('DOC');
  expect(f.context.input.value).toBe(QUICK_ACTIONS.find(a => a.icon === 'DOC').prompt + '\n\nTASK\nEDITED');
});
test('empty drafts remain exact prompts for local clarification', () => {
  const f = fixture('  '); f.click('RUN'); f.click('SUM');
  expect(f.context.input.value).toBe(QUICK_ACTIONS.find(a => a.icon === 'SUM').prompt);
});
test('a replaced draft is preserved and busy requests cannot change it', () => {
  const f = fixture('FIRST'); f.click('RUN'); f.context.input.value = 'REPLACED'; f.click('DOC');
  expect(f.context.input.value).toBe(QUICK_ACTIONS.find(a => a.icon === 'DOC').prompt + '\n\nREPLACED');
  const before = f.context.input.value; f.context.busy = true; f.click('SUM');
  expect(f.context.input.value).toBe(before);
});
