# Sheikha Copilot Instructions

Apply these rules when generating code in this repository.

## Quick Context
- Project: SHEIKHA main portal (Arabic RTL platform).
- Stack: Node.js + Express backend, Vanilla HTML/CSS/JS frontend.
- Data layer: JSON files under `data/`.
- Auth: JWT + OAuth providers.

## Code Style
- Use 4 spaces indentation.
- Use `camelCase` for variables and function names.
- Use single quotes and semicolons.
- Keep comments concise and in Arabic when helpful.

## Architecture
- Main backend entrypoint: `server.js`.
- API endpoints: `routes/`.
- Shared backend logic: `lib/`.
- Middleware and request pipeline: `middleware/`.
- Frontend pages and assets: `public/`.
- Configuration: `config/`.

## Build And Test
- Install dependencies: `npm install`.
- Start app: `npm start` (runs on port 8080).
- Dev watch mode: `npm run dev`.
- Stop port 8080 process: `npm run stop`.
- Unit tests: `npm test`.
- Lint checks: `npm run lint`.
- Full QA checks: `npm run qa:all`.

## Conventions
- Keep API responses consistent:
  - `{ success, data, message, timestamp }`
- Validate all inputs.
- Return user-facing error messages in Arabic.
- Do not break existing endpoint behavior unless explicitly requested.
- Prefer small, targeted changes over large refactors.
- Preserve RTL and existing design language.
- Avoid introducing frontend frameworks unless explicitly requested.
- Keep accessibility and responsive behavior intact.

## Security And Privacy
- Never expose secrets, tokens, API keys, or private credentials.
- Use placeholders in examples (for example: `YOUR_API_KEY`).
- Avoid logging sensitive data.

## Docs To Link (Do Not Duplicate)
- `README.md`
- `CLAUDE.md`
- `QUICK-START.md`
- `QUICK-START-API.md`
- `INTEGRATION-GUIDE.md`
- `docs/system-governance-manifesto.ar-en.md`
- `docs/architecture/01-SYSTEM-ARCHITECTURE.md`
- `docs/deployment/sheikha-top-deployment-workflow.md`

## Delivery Behavior
- When editing code, include exact file references in explanations.
- If tests or runtime checks are available, run relevant checks and report outcomes.
- If a requested change could cause regressions, mention risks briefly.
