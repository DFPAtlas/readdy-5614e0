# GuardianHub — Phase 19 Complete Re-Audit

Audit date: 2026-08-13
Method: repository inspection + live SaaS Supabase schema/RLS/storage/function inspection.
No browser runtime, no shell (build/test), no dashboard-only tools were available, so those areas are
marked UNVERIFIED rather than guessed.

---

## A. EXECUTIVE VERDICT

**Score: 41 / 100**

**Verdict: NO-GO**

GuardianHub has a substantial, well-structured codebase and a genuinely strong security foundation:
300+ tables with RLS enabled, a versioned migration source of truth (001–026), no privileged secrets in
browser code, a Stripe webhook that correctly verifies signatures and deduplicates, and an SOS path that
persists the incident before any downstream write. However, a confirmed cross-tenant write vector and the
complete absence of environment-level evidence (build, tests, restore drill, agent/integration config)
make launch unsafe today. Most of the platform is code-complete but unverified in any running environment.

Finding counts: 2 Critical, 5 High, 11 Medium, 8 Low.

---

## B. VERIFIED WORKING (code-verified unless stated)

These are proven at the code/database level, NOT runtime-tested:

- **RLS foundation** — every `relkind='r'` table (300+) has `row_security` enabled. No table has RLS off.
- **Views use security_invoker** — all 7 public views (`v_billing_*`, `site_weekly_guard_cards`,
  `active_site_notices`, `sop_version_history`) are `security_invoker=true`, so underlying RLS is enforced.
- **Migration source of truth** — 26 sequential migration files under `supabase/migrations/` exist and are applied.
- **Stripe webhook integrity** — `stripe.webhooks.constructEvent()` verifies HMAC signature before any write;
  dedupe by unique index on `billing_webhook_events.stripe_event_id`; service-role key used only server-side.
- **SOS persist-first ordering** — the SOS incident row is inserted into `incidents` before occurrence-book,
  activity-log, or notification writes. No AI call can close/downgrade it in that path.
- **No privileged secret in browser code** — grep of `app/` and `components/` found no service-role key, Stripe
  secret, webhook secret, or hard-coded credential. `lib/billing/*` reference non-`NEXT_PUBLIC_` env vars
  (server-only), not literals.
- **Tenant scoping helpers** — `get_my_company_id`, `is_same_company`, `is_company_member`, `is_platform_staff`,
  `is_super_admin`, `get_my_guard_id` all exist and are `SECURITY DEFINER` with `search_path` pinned where inspected.
- **First-run guard acknowledgements** — 3 policies seeded per company, idempotent unique index, guard RLS on
  `policy_acknowledgments` (4 policies).

---

## C. UNVERIFIED (exists but could not be genuinely tested here)

- **Production build** — no shell; `npm run build` could not be executed.
- **TypeScript** — `npx tsc --noEmit` could not be executed.
- **Lint** — `npm run lint` maps to `next lint`, which was removed in Next.js 15 and is expected to fail.
- **Unit / integration tests** — no `test` script and no test runner dependency exist; only SQL files under
  `supabase/tests/` are present, and none could be executed here.
- **Dependency audit** — no lockfile present in the repo; `npm audit` could not run.
- **All runtime workflows** — onboarding, shifts, check-in, geofence, patrol, incident, evidence, timesheet,
  invoice, recruitment, DSAR, support: no browser/session available to execute end-to-end.
- **Cross-tenant runtime test** — cannot simulate two authenticated sessions via the SQL tool.
- **Auth flows** — registration, reset, invitation, MFA, redirect safety, rate limits: not runnable here.
- **Stripe test-mode run** — checkout/webhook not exercised; live-mode config not applicable.
- **n8n agents** — workflow JSON files exist but credentials, schedules, triggers, and last-successful-run are unknown.
- **Email / SMS / Maps / Monitoring / AI providers** — configuration status unknown beyond env wiring.
- **Backup / restore** — plan and runbook docs exist; no evidence of a real restore drill.
- **Security Advisor / Performance Advisor** — dashboard-only, not runnable from this tool.
- **Load / performance** — no load test executed.

---

## D. WHAT IS LEFT TO BUILD / FIX

| Feature | Severity | Problem | Affected | Required fix | Effort | Blocker |
|---|---|---|---|---|---|---|
| guard_seed_first_run_policies | Critical | anon-executable, accepts arbitrary company_id, inserts rows into any tenant | migration 026 function | `REVOKE EXECUTE ... FROM anon, PUBLIC` and/or change guard to `IF auth.uid() IS NULL OR p_company_id <> get_my_company_id() THEN RETURN` | 0.5h | YES |
| Backup/restore evidence | Critical | no restore-drill evidence | ops | perform + record a real restore drill; confirm PITR/RPO/RTO | 1d | YES |
| Production build | High | never run/recorded | repo | run `npm run build`, fix any errors, record exit code | 0.5–2d | YES |
| incident-media bucket | High | `public=true`, no size/MIME limit | storage | make private + signed URLs; add MIME/size limits | 0.5h | YES |
| v_billing_* views | High | SELECT granted to `anon` | storage/DB | revoke anon SELECT; confirm underlying RLS denies anon | 0.5h | YES |
| `next lint` script | High | maps to removed `next lint` | package.json | replace with eslint or remove; add `typecheck` script | 0.5h | YES |
| No test suite | High | no runnable tests | repo | add vitest/jest + critical-path tests | 3–5d | YES |
| Duplicate SOS protection | Medium | SOS fn inserts without deduping an open SOS | sos-emergency-notify | short-window dedup on open critical SOS for same guard | 2h | NO |
| Zero-policy tables | Medium | 26 RLS tables have 0 policies (deny-all) — e.g. `data_requests`, `retention_rules`, `legal_holds`, `feature_flags` | DB | verify each is intentionally edge-only; add policies where tenant access is intended | 4h | NO |
| n8n agent config | Medium | 15+ workflows code-only | n8n | configure credentials/triggers/schedules, record test | 1–3d | YES |
| Email/SMS/maps/monitoring config | Medium | unverified | providers | configure + verify each provider | 1–3d | YES |
| Parallel/duplicate route families | Medium | multiple site/admin/support UIs | app/ | designate canonical routes, prune dead ones | 2–4d | NO |
| Billing test-mode E2E | Medium | webhook code solid but untested | stripe | run test-mode checkout→webhook→entitlement cycle | 1d | YES |
| Database types | Medium | `database.types.ts` is a partial snapshot | lib | regenerate via `supabase gen types` | 0.5h | NO |
| No lockfile | Low | non-reproducible installs | repo | commit lockfile | 0.5h | NO |

---

## E. AGENT REGISTER

Classification key: READY / CODE COMPLETE, CONFIG REQUIRED / PARTIAL / MISSING / FAILED / UNVERIFIED.

| Agent | Workflow JSON | Classification |
|---|---|---|
| Shift reminder | agent-shift-reminder.json | CODE COMPLETE, CONFIG REQUIRED |
| Late/missed check-in | agent-late-checkin.json | CODE COMPLETE, CONFIG REQUIRED |
| SOS escalation | agent-sos-escalation.json | CODE COMPLETE, CONFIG REQUIRED |
| Incident notification | agent-incident-notification.json | CODE COMPLETE, CONFIG REQUIRED |
| Compliance expiry | agent-licence-expiry.json | CODE COMPLETE, CONFIG REQUIRED |
| Training renewal | agent-training-renewal.json | CODE COMPLETE, CONFIG REQUIRED |
| Timesheet reminder | agent-timesheet-reminder.json | CODE COMPLETE, CONFIG REQUIRED |
| Invoice reminder | agent-invoice-reminder.json | CODE COMPLETE, CONFIG REQUIRED |
| Subscription reconciliation | agent-subscription-reconciliation.json | CODE COMPLETE, CONFIG REQUIRED |
| Notification retry | agent-notification-retry.json | CODE COMPLETE, CONFIG REQUIRED |
| Failed-event recovery | agent-failed-event-recovery.json | CODE COMPLETE, CONFIG REQUIRED |
| Daily operations summary | agent-daily-summary.json | CODE COMPLETE, CONFIG REQUIRED |
| Data retention | agent-data-retention.json | CODE COMPLETE, CONFIG REQUIRED |
| Data integrity | agent-integrity-reconciliation.json | CODE COMPLETE, CONFIG REQUIRED |
| Platform health | agent-health-monitoring.json | CODE COMPLETE, CONFIG REQUIRED |

Every agent is code-complete but UNVERIFIED for credentials, schedules, triggers, tenant isolation and
last-successful-run. None can be classified READY without n8n access and a recorded test.

---

## F. PROVIDER CONFIGURATION REQUIRED

- **Supabase** — confirm production project, PITR, backup schedule, Security Advisor, and Realtime cleanup.
- **Stripe** — test-mode end-to-end first; then live keys, webhook endpoint + signing secret, correct redirect URLs.
- **n8n** — import all workflow JSON, wire credentials (Supabase service-role, email/SMS, AI), set schedules and signed-callbacks.
- **Email** — custom SMTP / Resend domain verification (currently `not_configured`), From address from `RESEND_FROM_DOMAIN`.
- **SMS** — provider + credentials + sender ID.
- **Maps** — Google Maps API key (`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`).
- **Monitoring / error tracking** — provider + DSN.
- **AI provider** — OpenAI/other key + model config (stored server-side, never browser).

---

## G. SECURITY REPORT

### Critical
1. **Cross-tenant write via `guard_seed_first_run_policies`** — PUBLIC execute (`=X/postgres`), accepts
   arbitrary `p_company_id`; anon (`auth.uid() IS NULL`) bypasses the own-company guard and can insert 3 policy
   rows into any tenant's `workforce_policies`. Idempotent and content-fixed (low data impact) but a confirmed
   cross-tenant write. Launch-blocking. Fix: revoke anon/PUBLIC execute + harden guard.

### High
2. **`incident-media` bucket is public** with no size/MIME limit — incident photos/video are permanently
   URL-accessible and may contain special-category data. Make private + signed URLs + limits.
3. **`v_billing_*` and `sop_version_history` SELECT granted to `anon`** — views are security_invoker so
   underlying RLS applies, but exposure should be revoked for anon.
4. **No verified backup/restore** — runbook exists, no drill evidence. Database backups do not restore Storage objects.
5. **Build/lint/test never executed/recorded** — `next lint` is removed in Next 15; no test runner.

### Medium
6. 26 RLS tables with zero policies (deny-all) — safe but may mean broken features (`data_requests`, `retention_rules`, `legal_holds`).
7. `is_super_admin(uuid)` / `has_permission(...)` authenticated-executable — user/super-admin enumeration risk.
8. SOS path has no duplicate-open-SOS dedup.
9. Stripe webhook idempotency check happens before the log insert (race) — mitigated by unique index, but a
   concurrent duplicate returns 500 rather than clean idempotent 200.
10. `@tailwindcss/postcss` (v4) listed with `tailwindcss ^3.4` — mismatched, build risk.
11. No lockfile; dependency audit impossible.
12. Multiple parallel admin/site/support route families — unclear canonical ownership.

### Low
13. `generate_incident_number`, trigger fns anon-executable (harmless but should be revoked).
14. `database.types.ts` partial snapshot — type drift risk.
15. `has_rota_edit_permission`, `has_site_access` exposed to authenticated without audit.
16. No CAPTCHA/rate-limit evidence on public signup paths.

No XSS/SQLi/SSRF/CORS/open-redirect/secret-in-browser finding was confirmed by static inspection; runtime
pen-testing of these is UNVERIFIED.

---

## H. TEST REPORT

Commands required but **not executed in this environment**:

```bash
npm install          # UNVERIFIED — no lockfile present
npm run build        # UNVERIFIED
npx tsc --noEmit     # UNVERIFIED
npm run lint         # EXPECTED FAIL — `next lint` removed in Next 15
npm test             # MISSING — no test script
npm audit            # UNVERIFIED
```

SQL checks executed against the live database (these passed):
- All `relkind='r'` tables RLS-enabled: PASS.
- Views security_invoker: PASS.
- Stripe webhook signature + idempotency code: PASS (code inspection).
- SOS persist-before-notify ordering: PASS (code inspection).
- No secret literals in `app/`/`components/`: PASS.
- 26 RLS tables with zero policies: FAIL (flagged).
- `guard_seed_first_run_policies` anon execute: FAIL (flagged, critical).

---

## I. ROUTE REPORT

Approximate discovery from the repository tree (not runtime-tested):

- Total route entries (`page.tsx`): ~310
- Public / marketing / informational: ~30
- Authentication: ~12
- Tenant dashboard: ~90
- Guard: ~25
- Client portal: ~35
- Ops / control room: ~18
- Platform admin: ~30
- Super admin: ~10
- Specialised (sops, rotas, sop-builder, sites, incidents, occurrence-book, reports, guards, finance): ~60

- Working (HTTP/render confirmed): **0** (no browser runtime available)
- Failed: **0 confirmed** (none runnable)
- Redirected: **0 confirmed**
- Placeholder / dead (suspected, not confirmed): parallel site/admin/support families
- Protected (auth-gated by code): ~250 (based on `AuthGate`/`PermissionGuard` usage)
- Untested: **~310 (all)**

No `href="#"` dead links were found. TODO/FIXME markers are present in ~150 files but were not triaged.

---

## J. LAUNCH BLOCKERS (fix in this order)

1. Revoke/harden `guard_seed_first_run_policies` (cross-tenant write).
2. Run and pass `npm run build` + `npx tsc --noEmit`; record results.
3. Establish and record a real backup/restore drill (PITR, RPO/RTO).
4. Make `incident-media` private + signed URLs + size/MIME limits.
5. Revoke anon SELECT on `v_billing_*` / `sop_version_history`.
6. Fix `lint` script (remove `next lint`), add `typecheck` + `test` scripts.
7. Configure and test n8n agents (credentials, schedules, signed callbacks).
8. Configure and verify email, SMS, maps, monitoring, AI providers.
9. Run Stripe test-mode checkout→webhook→entitlement cycle.
10. Regenerate `database.types.ts`; commit a lockfile.

---

## K. LAUNCH PLAN

**Must fix before staging:** blockers 1–5 (security + build + recovery evidence).

**Must fix before production:** blockers 6–10 (tests, agents, providers, Stripe test cycle, types/lockfile).

**Can follow after launch:** duplicate-route consolidation, SOS dedup polish, zero-policy table review,
database-type regeneration cadence, non-critical hardening.

---

## L. FINAL VERDICT STATEMENT

FINAL VERDICT: NO-GO — GUARDIANHUB MUST NOT LAUNCH UNTIL THE BLOCKERS ARE FIXED