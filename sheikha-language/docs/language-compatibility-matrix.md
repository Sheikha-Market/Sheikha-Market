# Language Compatibility Matrix

| Family | Languages | Intake | Runtime path | Governance path |
| --- | --- | --- | --- | --- |
| Sheikha DSL | Sheikha | Native `.shk` | Native | Native |
| JavaScript / TypeScript | JavaScript, TypeScript | Semantic manifest | Unified runner | Normalized |
| Python / Ruby / PHP | Python, Ruby, PHP | Semantic manifest | Unified runner | Normalized |
| Go / Rust / C | Go, Rust, C, C++ | Semantic manifest | Unified runner | Normalized |
| JVM / .NET | Java, C#, Kotlin | Semantic manifest | Unified runner | Normalized |
| Functional | Scala, Haskell, Clojure, Elixir | Semantic manifest | Unified runner | Normalized |
| Scripting | Lua | Semantic manifest | Unified runner | Normalized |

## Current Scope

- Unified AST/IR/runtime execution is implemented
- Language-specific parsing remains delegated to adapters
- Compiler targets currently emit PHP, JavaScript, Python, JSON IR, and bytecode artifacts

## Practical Rule

The repository unifies **meaning and governance**, not every surface syntax.
