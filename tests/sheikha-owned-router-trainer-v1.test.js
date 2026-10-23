'use strict';

const { evaluate, predict, train } = require(
  '../runtime/sheikha-ai-governor/v1/sheikha-owned-router-trainer-v1'
);

test('trains and predicts an owned routing model', () => {
  const samples = [
    { text: 'اكتب كود JavaScript', label: 'coding' },
    { text: 'اصلح كود Python', label: 'coding' },
    { text: 'أنشئ صورة منتج', label: 'vision' },
    { text: 'حلل صورة مرئية', label: 'vision' }
  ];
  const model = train(samples);
  expect(predict(model, 'اكتب كود').label).toBe('coding');
  expect(evaluate(model, samples).accuracy).toBe(1);
  expect(model.license).toBe('SHEIKHA-LOCAL-COMMERCIAL-V1');
});
