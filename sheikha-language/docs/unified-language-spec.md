# Unified Language Specification

## Purpose

This repository now treats **Sheikha** as the internal governance language for **all programming languages** through a normalized intake model.

## Intake Modes

- Native `.shk` programs
- Semantic manifests produced by adapters for external languages

## Unified Contract

Every source language is normalized into:

1. Unified AST
2. Unified IR
3. Unified bytecode/runtime model
4. Unified governance and sandbox checks

## Semantic Manifest Schema

```json
{
  "kind": "SheikhaSourceProgram",
  "version": "1.0.0",
  "sourceLanguage": "javascript",
  "sourceFile": "market.js",
  "program": {
    "directives": ["بسم_الله"],
    "entities": [
      {
        "name": "خدمة_موحدة",
        "properties": {
          "اللغة": "javascript",
          "الحوكمة": "مفعلة"
        }
      }
    ],
    "procedures": [
      {
        "name": "تشغيل",
        "body": [
          { "command": "اعرض", "argument": "تم التوحيد" }
        ]
      }
    ]
  }
}
```

## Governance Model

- Source-specific syntax stays outside the runtime
- Adapters convert each language into the shared semantic contract
- The Sheikha runtime applies one governance path after normalization

## Initial Supported Families

- JavaScript / TypeScript
- Python / Ruby / PHP
- Go / Rust / C / C++
- Java / C# / Kotlin
- Functional languages

Detailed profiles live in `/tmp/workspace/Sheikha-Market/sheikha-main-portal/sheikha-language/specifications/language-spec-registry.json`.
