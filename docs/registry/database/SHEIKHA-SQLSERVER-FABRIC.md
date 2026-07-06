# Sheikha SQL Server Fabric

SQL Server is activated as a governed database integration layer.

VS Code is only a client interface.

Runtime, credentials, migrations, schema changes, and queries must pass governance.

## Rules

- No plaintext passwords in Git.
- Use environment variables only.
- Backup before migration.
- Human approval before schema change.
- Audit trail required.
