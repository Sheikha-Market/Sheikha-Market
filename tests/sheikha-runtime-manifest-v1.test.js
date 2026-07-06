const {
 loadManifest
} =
require(
'../runtime/manifest/sheikha-runtime-manifest'
);

describe(
'Sheikha Runtime Manifest V1',
() => {

test(
'loads manifest',
() => {

const manifest =
loadManifest();

expect(
manifest.status
).toBe(
'ACTIVE'
);

expect(
manifest.modules
).toBeGreaterThanOrEqual(
15
);

});
});
