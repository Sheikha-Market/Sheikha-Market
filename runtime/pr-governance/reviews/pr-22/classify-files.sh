#!/usr/bin/env bash
set -euo pipefail

IN="runtime/pr-governance/reviews/pr-22/files.txt"
OUT="runtime/pr-governance/reviews/pr-22/classification.json"

jq -Rn '
  [inputs | select(length > 0)] as $files |
  {
    pr: 22,
    totalFiles: ($files | length),
    categories: {
      server: [$files[] | select(. == "server.js")],
      fabric: [$files[] | select(test("runtime/fabric-bootstrap|lib/fabric-bootstrap"))],
      routes: [$files[] | select(startswith("routes/"))],
      runtime: [$files[] | select(startswith("runtime/"))],
      public: [$files[] | select(startswith("public/"))],
      package: [$files[] | select(. == "package.json" or . == "package-lock.json")],
      docs: [$files[] | select(startswith("docs/") or startswith("README"))],
      dist: [$files[] | select(startswith("dist/"))],
      other: [$files[] | select(
        (. != "server.js")
        and (test("runtime/fabric-bootstrap|lib/fabric-bootstrap") | not)
        and (startswith("routes/") | not)
        and (startswith("runtime/") | not)
        and (startswith("public/") | not)
        and (. != "package.json")
        and (. != "package-lock.json")
        and (startswith("docs/") | not)
        and (startswith("README") | not)
        and (startswith("dist/") | not)
      )]
    }
  }
' "$IN" > "$OUT"

cat "$OUT" | jq '{pr,totalFiles,counts:(.categories|with_entries(.value = (.value|length)))}'
