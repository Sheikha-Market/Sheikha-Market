# AST Specification (SheikhaLang)

مواصفة AST الحالية في المرحلة الأولى من المحلل.

## Program

```json
{
  "type": "Program",
  "body": [],
  "loc": { "start": {"line": 1, "column": 1}, "end": {"line": 1, "column": 1} }
}
```

## Supported Node Types

- `Directive`
  - `name: string`

- `EntityDeclaration`
  - `name: string`
  - `properties: PropertyAssignment[]`

- `ProcedureDeclaration`
  - `name: string`
  - `body: Statement[]`

- `PropertyAssignment`
  - `key: string`
  - `value: string`

- `IfStatement`
  - `condition: string`
  - `consequent: Statement[]`
  - `alternate: Statement[]`

- `CommandStatement`
  - `command: "اعرض" | "ارفض" | "أجز"`
  - `argument: string`

كل عقدة تحتوي على `loc.start` و `loc.end` لتتبع المصدر.
