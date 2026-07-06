const {
 recoverRuntime
} =
require(
'../runtime/recovery/sheikha-recovery-engine'
);

describe(
'Sheikha Recovery Engine V1',
() => {

test(
'recovers runtime',
() => {

const r =
recoverRuntime();

expect(
r.status
).toBe(
'RECOVERED'
);

expect(
r.recoveredModules
).toBe(
r.totalModules
);

});
});
