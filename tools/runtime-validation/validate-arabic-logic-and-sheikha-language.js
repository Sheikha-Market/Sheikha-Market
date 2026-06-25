const fs = require("fs");

const files = [
  "runtime/arabic-logic-analogy/sheikha-arabic-logic-system-analogy-engine.json",
  "runtime/sheikha-programming-language/sheikha-programming-language-logic-engine.json"
];

let failed = false;

for (const file of files) {
  if (!fs.existsSync(file)) {
    console.error("MISSING:", file);
    failed = true;
    continue;
  }

  const data = JSON.parse(fs.readFileSync(file, "utf8"));

  if (data.status !== "ACTIVE") {
    console.error("NOT ACTIVE:", file);
    failed = true;
  }

  if (!data.governance || data.governance.no_harm !== true) {
    console.error("NO_HARM GOVERNANCE MISSING:", file);
    failed = true;
  }

  console.log("VALIDATED:", data.system);
}

if (failed) process.exit(1);

console.log("SHEIKHA ARABIC LOGIC AND PROGRAMMING LANGUAGE VALIDATED");

