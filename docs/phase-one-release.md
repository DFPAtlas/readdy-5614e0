# GuardianHub Phase 1

Implemented journeys:

- Guard creation, profile, compliance/training overview and editing.
- Incident creation and detail editing, status updates, evidence, comments and related records.
- Client service request creation, detail, messages, attachments, close/reopen and staff replies.
- Client invoice list/detail, actual billing lines, payments, queries and PDF downloads.
- Management shift creation/detail/edit/duplicate, conflict checks, cancellation and history.
- Guard shift instructions, acknowledgement, clock-in/out and handover.

Detail URLs use UUID query parameters, allowing arbitrary records on the existing Next static export host. Reads and writes include tenant filters and client/guard ownership where applicable. The database migration supplies additional RLS protection and controlled request/query RPCs.

## Validation

`npm run test:phase-one:sql` runs the migration against a minimal isolated Postgres schema using PGlite, followed by privilege and behaviour assertions. It covers tenant/client isolation, published invoice visibility, safe invoice queries, viewer write denial, request close/reopen/messages, staff replies and shift acknowledgement ownership. It does not change the production database and does not substitute for staging tests against the complete database.

The unchanged main baseline reports 622 TypeScript diagnostic lines with the pinned Supabase dependency. Phase 1 reports the same count with no diagnostics in newly added Phase 1 files. The normal production build compiles application code, then fails on the existing `app/admin/activity/page.tsx` callAgent argument mismatch and missing ESLint. Do not enable ignoreBuildErrors to release this change. The repository's existing build blockers must be resolved before merge and release.

## Release prerequisites

1. Resolve existing TypeScript/ESLint build failures and obtain a passing production build.
2. Apply `supabase/migrations/20261003090033_guardianhub_phase_one_journeys.sql` in staging, review existing roles/RLS against the complete database and test client, viewer, staff and guard accounts.
3. Check a complete invoice PDF, request attachment download, overnight/conflicting shifts, published rota restrictions, acknowledgements and clock-in/out in staging.
4. Apply the migration to the production database before publishing the frontend. New request/invoice RPCs and shift history/acknowledgement tables are required by these pages.

The production migration has not been applied by this PR. New functionality should not be published before the migration and staging verification. A failed live migration dry run was followed by verifying that the new tables and RPCs were absent.
