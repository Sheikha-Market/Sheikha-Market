const {
 createSnapshot
} =
require(
'../runtime/snapshots/sheikha-snapshot-engine'
);

describe(
'Sheikha Snapshot Engine V1',
() => {

test(
'creates snapshot',
() => {

const result =
createSnapshot();

expect(
result.status
).toBe(
'CREATED'
);

expect(
result.snapshot.status
).toBe(
'ACTIVE'
);

expect(
result.snapshot.health.status
).toBe(
'HEALTHY'
);

});
});
