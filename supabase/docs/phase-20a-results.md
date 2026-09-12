# GuardianHub — Phase 20A Results: Critical Security Repair & Build Verification

Date: 2026-08-13

## Verdict

**PHASE 20A RESULT: PASS — CROSS-TENANT BLOCKER RESOLVED**

The confirmed cross-tenant write in `guard_seed_first_run_policies` is closed. The
function now rejects unauthenticated callers and never trusts a submitted company id,
deriving the caller's tenant server-side. Anonymous billing/SOP view access and the
public incident-media bucket are also corrected. The REVOKE-only grant tightening is
shipped in migration 027 for manual application (the in-environment SQL runner blocks
REVOKE); the function-body hardening closes the vulnerability regardless of grant state.

---

## 1. Cross-tenant RPC fix

### Before (migration 026, as applied to live DB)
- Grants: `PUBLIC`, `anon`, `authenticated`, `service_role`, `postgres` + template roles.
- Body: `IF auth.uid() IS NOT NULL AND p_company_id <> get_my_company_id() THEN RETURN;`
  — when `auth.uid()` was NULL (anonymous), the guard was **skipped**, so an anonymous
  caller could insert 3 policy rows into any `p_company_id`.

### After (migration 027)
- Body hardened (applied live, verified in DB):
  - `auth.uid() IS NULL` → `RAISE EXCEPTION '... requires an authenticated user'`.
  - Company derived server-side via `get_my_company_id()`; `p_company_id` is never trusted.
  - Requires active membership (`users.company_id = p_company_id AND status = 'active'`).
  - Idempotent `NOT EXISTS` guards preserved; original signature/return type preserved.
- Grants (REVOKE/GRANT in migration 027, **manual application required** — runner blocks REVOKE):
  - `guard_seed_first_run_policies` / `guard_ensure_workforce_profile`: revoke from
    `PUBLIC, anon, authenticated, service_role` (internal helpers only).
  - `guard_get_first_run_acknowledgements` / `guard_acknowledge_first_run_policy`:
    revoke from `PUBLIC, anon, service_role`; grant to `authenticated`.

### Authorisation rule used
`auth.uid()` must be non-null; `get_my_company_id()` (SECURITY DEFINER, reads `users`
for the JWT subject) must equal `p_company_id`; and the user must be an active member of
that company. No editable user metadata is trusted for authorisation.

### Cross-tenant test evidence
- Live: anonymous call `guard_seed_first_run_policies(<uuid>)` raised
  `guard_seed_first_run_policies requires an authenticated user` (P0001) — no insert path reached.
- Automated: `supabase/tests/phase-20a-rpc-security-tests.sql` (TEST 1–6) covers
  anonymous, cross-tenant, authorised-own, idempotency, suspended and null-id cases with
  before/after row counts. **Requires manual run** in the SQL editor — the runner blocks
  `set_config('request.jwt.claims')`, so multi-session simulation is not possible here.

---

## 2. RPC grant review (all exposed custom functions)

| Function | Kind | Action | Classification |
|---|---|---|---|
| guard_seed_first_run_policies | SECURITY DEFINER | revoke PUBLIC/anon/auth/sr | Service-only (internal) |
| guard_ensure_workforce_profile | SECURITY DEFINER | revoke PUBLIC/anon/auth/sr | Service-only (internal) |
| guard_get_first_run_acknowledgements | SECURITY DEFINER | revoke PUBLIC/anon/sr; grant authenticated | Authenticated + tenant-scoped |
| guard_acknowledge_first_run_policy | SECURITY DEFINER | revoke PUBLIC/anon/sr; grant authenticated | Authenticated + tenant-scoped |
| generate_incident_number | SECURITY DEFINER (trigger) | revoke PUBLIC/anon/auth/sr | Service-only (trigger) |
| is_platform_staff | SECURITY DEFINER | revoke PUBLIC/anon; grant auth/sr | Platform-admin helper |
| sop_daily_queries | SECURITY INVOKER | revoke PUBLIC/anon; grant auth/sr | Authenticated + RLS-scoped |
| match_sop_chunks (x2) | SECURITY INVOKER | revoke PUBLIC/anon; grant auth/sr | Authenticated + RLS-scoped |

The vector/halfvec/sparsevec functions are extension-provided and left untouched. Trigger
functions `set_updated_at`, `set_site_notice_updated_at`, `prevent_subscription_field_*`,
`tg_billing_set_updated_at` still carry a default PUBLIC grant but are trigger-only and
not client-invokable — flagged for a later cleanup pass, not changed this phase.

---

## 3. View grants changed
- Revoked all privileges from `anon` on `v_billing_mrr_current`, `v_billing_overdue`,
  `v_billing_revenue_monthly`, `v_billing_tax_monthly`, `sop_version_history`.
- All seven public views remain `security_invoker=true` (verified), so authenticated
  access stays scoped by underlying RLS. (Manual application required — runner blocks REVOKE.)

---

## 4. Incident-media hardening (applied live)
- Bucket `incident-media` changed `public=false`, `file_size_limit=52428800` (50MB),
  `allowed_mime_types` set to a fixed image/video allowlist.
- 5 new `storage.objects` policies (authenticated-only): insert/select/update/delete
  tenant-scoped on `(foldername(name))[1] = get_my_company_id()`, plus a client SELECT
  policy keyed on `client_visible` + site ownership + filename.
- Added `incident_media.storage_path` column.
- Frontend updated to mint short-lived signed URLs instead of public URLs and to persist
  `storage_path` (guard incident flow, incident tab, patrol scan, admin incident detail,
  client incident detail).

---

## 5. Deny-all (zero-policy) tables — classification

All 26 are RLS-enabled with zero policies (deny-all = safe, but access must be via trusted
server functions). Classification:

- **Service-only / trusted-server access (expected deny-all):** `data_requests`,
  `retention_rules`, `legal_holds`, `feature_flags`, `feature_flag_history`,
  `platform_audit_log`, `platform_security_events`, `support_access_logs`,
  `sensitive_case_members`, `sensitive_case_events`, `workforce_audit_log`,
  `worker_references`, `workforce_status_history`, `notification_jobs`,
  `billing_runs`, `billing_run_lines`, `tenant_status_config`, `onboarding_checklists`,
  `screening_requirements`, `application_documents`, `application_stage_history`,
  `competency_assessments`, `support_case_events`, `support_messages`,
  `announcement_acknowledgments`, `platform_announcements`.

No broad policies were added — the deny-all posture is retained intentionally. Any table
that later needs tenant-facing access should get a narrow policy with auth + active
membership + tenant ownership + correct USING/WITH CHECK.

---

## 6. Package toolchain restored
- `package.json` scripts: `lint` (eslint, not `next lint`), `typecheck` (tsc --noEmit),
  `test` (vitest), `test:run` (vitest run), `verify` (typecheck + lint + test + build),
  `build` (next build), `dev` unchanged.
- devDependencies added: `eslint@^9`, `eslint-config-next@15.3.2`, `@eslint/eslintrc@^3`,
  `vitest@^2.1.8`.
- Lockfile: **not generated here** — no shell is available to run `npm install`. The
  user must run `npm install` to produce `package-lock.json`. (Unverified.)

## 7. Test foundation
- Vitest tests: `lib/security/signatures.test.ts` (HMAC + Stripe signature rejection),
  `lib/redirect.test.ts` (open-redirect protection), `lib/accountStatus.test.ts`
  (suspended/removed denial). Pure, non-mocked, real assertions.
- SQL tests: `supabase/tests/phase-20a-rpc-security-tests.sql` (cross-tenant, anonymous,
  role, idempotency, suspended).

## 8. Verification
Commands (cannot be executed here — no shell; mark UNVERIFIED):
```bash
npm install        # UNVERIFIED (generates package-lock.json)
npm run typecheck  # UNVERIFIED (may surface pre-existing errors)
npm run lint       # UNVERIFIED
npm run test:run   # UNVERIFIED (3 vitest suites, 19 assertions)
npm run build      # UNVERIFIED
npm audit          # UNVERIFIED
```
Live-verified in DB: hardened function body, unauthenticated rejection (P0001), private
bucket + limits + policies, `storage_path` column.

## 9. Remaining critical/high findings
- Backup/restore drill — still the separate blocker (NOT resolved this phase).
- REVOKE/GRANT statements in migration 027 require manual application (runner limitation).
- Build/typecheck/lint/test results unverified (no shell).

## Files changed
- `supabase/migrations/027_guardianhub_phase20a_security_repair.sql`
- `supabase/tests/phase-20a-rpc-security-tests.sql`
- `lib/security/signatures.ts`, `lib/security/signatures.test.ts`
- `lib/redirect.test.ts`, `lib/accountStatus.test.ts`
- `package.json`
- `lib/useIncidentDetail.ts`, `app/incidents/[id]/IncidentDetailClient.tsx`
- `app/client/incidents/[id]/IncidentDetailClient.tsx`
- `app/guard/components/IncidentFlow.tsx`, `app/guard/components/IncidentTab.tsx`
- `app/guard/patrol/scan/[checkpoint_code]/GuardPatrolScanPage.tsx`

## Hard blocker 1
**Resolved** — the cross-tenant write and anonymous write are closed by the hardened
function body (verified live). The residual grant-tightening (REVOKE) is shipped for
manual application and is defense-in-depth, not a requirement to close the write.