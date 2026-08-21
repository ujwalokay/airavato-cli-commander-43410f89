# Render PostgreSQL Migration

AirvatoHead now has a Render PostgreSQL foundation. Render provisions the database from `render.yaml`, injects its internal connection string as `DATABASE_URL`, and runs `npm run db:migrate` before the web service starts.

The server-side POS registration and heartbeat routes now write directly to Render PostgreSQL. Dashboard read queries use the protected application snapshot route, which keeps database credentials on the server.

## Render setup

1. Open the Render Blueprint connected to the `main` branch.
2. Sync the Blueprint changes from `render.yaml`.
3. Approve creation of the `airavoto-db` PostgreSQL database.
4. Confirm the web service and database are in the same Render region.
5. Keep `DATABASE_URL` managed by the Blueprint. Do not paste it into frontend variables.
6. Keep the existing Supabase URL and publishable key only while the authentication transition is still in progress.

Render provides an internal database URL for services in the same region. The application uses that internal connection through `DATABASE_URL`.

## Migration behavior

The first deployment creates the application schema from `db/migrations/001_initial.sql` and records the applied version in `schema_migrations`. The migration contains the platform tables but no demo records.

The migration is intentionally fail-closed when `DATABASE_URL` is absent. A deployment without a provisioned Render database will fail before startup instead of silently using fake or local data.

## Current transition boundary

The following data paths use Render PostgreSQL:

| Data path | Backend |
|---|---|
| POS registration | Render PostgreSQL |
| POS heartbeat | Render PostgreSQL |
| Platform dashboard reads | Render PostgreSQL snapshot API |
| Supabase authentication session | Temporary compatibility layer |
| Existing management mutations | Still being moved to the Render API |

The existing Supabase database is not automatically copied into Render PostgreSQL. If it contains real production records, export and import them before switching traffic. Do not import the old demo seed migration.

## Required production follow-up

Before removing Supabase completely, implement the remaining authenticated management mutation endpoints and replace the temporary Supabase authentication session with a Render-backed authentication system or another explicit identity provider. Until that step is complete, keep the Supabase authentication environment variables configured and do not delete the Supabase project.
