const fs = require("fs");

const registry =
  "runtime/runtime-contract-registry/sheikha-runtime-contract-registry.json";

const data = JSON.parse(fs.readFileSync(registry, "utf8"));

let failed = false;

for (const [name, contract] of Object.entries(data.contracts)) {
  const file = contract.source;

  if (!fs.existsSync(file)) {
    console.error("MISSING:", file);
    failed = true;
    continue;
  }

  const payload = JSON.parse(fs.readFileSync(file, "utf8"));

  for (const field of contract.must_define) {
    if (!(field in payload)) {
      console.error(
        `${name} missing field: ${field}`
      );
      failed = true;
    }
  }

  console.log(`VALIDATED: ${name}`);
}

if (failed) {
  process.exit(1);
}

console.log(
  "SHEIKHA RUNTIME CONTRACTS VALIDATED"
);
