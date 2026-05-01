# Sheikha Copilot Instructions

Apply these rules when generating code in this repository.

## Project Context
- Project: SHEIKHA main portal (Arabic RTL platform).
- Stack: Node.js + Express backend, Vanilla HTML/CSS/JS frontend.
- Data: JSON files under `data/`.
- Auth: JWT + OAuth providers.

## Coding Conventions
- Use 4 spaces indentation.
- Use `camelCase` for variables and function names.
- Use single quotes and semicolons.
- Keep comments concise and in Arabic when helpful.
- Keep API responses consistent:
  - `{ success, data, message, timestamp }`

## Backend Rules
- Validate all inputs.
- Return user-facing error messages in Arabic.
- Do not break existing endpoint behavior unless explicitly requested.
- Prefer small, targeted changes over large refactors.

## Frontend Rules
- Preserve RTL and existing design language.
- Avoid introducing frameworks unless explicitly requested.
- Keep accessibility and responsive behavior intact.

## Security And Privacy
- Never expose secrets, tokens, API keys, or private credentials.
- Use placeholders in examples (for example: `YOUR_API_KEY`).
- Avoid logging sensitive data.

## Delivery Behavior
- When editing code, include exact file references in explanations.
- If tests or runtime checks are available, run relevant checks and report outcomes.
- If a requested change could cause regressions, mention risks briefly.
