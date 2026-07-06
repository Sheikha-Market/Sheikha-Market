const {
 autoRegisterModules
} =
require(
'../runtime/auto-registration/sheikha-auto-registration'
);

describe(
'Sheikha Auto Registration V1',
() => {

test(
'registers modules',
() => {

const modules =
autoRegisterModules();

expect(
modules.length
).toBeGreaterThanOrEqual(
15
);

expect(
modules.every(
m => m.registered
)
).toBe(
true
);

});
});
