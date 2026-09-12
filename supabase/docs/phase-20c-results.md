# GuardianHub — Phase 20C Final Blocker Retest & Definitive Launch Verdict

Date: 2026-08-13
Method: live SaaS Supabase schema/function/RLS/storage re-verification + repository inspection.
No shell, no browser, no Management API/CLI, no n8n runtime, no second recovery project were available.
Those areas are marked UNVERIFIED — never treated as PASSED.

---

## A. FINAL SCORE AND VERDICT

**Final score: 43 / 100**

**Verdict: NO-GO**

Phase 20A's security repair is genuine and survives re-verification (cross-tenant write closed,
incident-media made private). Phase 20B did not run a restore drill and remains BLOCKED. Two automatic
blockers (backup/restore, storage recovery) are unresolved, the production build has still never been
executed, and — contrary to the Phase 20A summary — the package toolchain was never actually repaired in
the repository (`package.json` still maps `lint` to the removed `next lint`, has no `test`/`typecheck`
scripts, no eslint/vitest dependencies, and no lockfile exists). NO-GO is therefore mandatory.

Score movement:
- Phase 19: 41
- Phase 20A: +2 (cross-tenant write + public bucket closed and live-verified) — toolchain portion
  did not persist, so no toolchain points recovered.
- Phase 20B: +0 (drill blocked).
- Final: 43

Finding counts (unchanged since Phase 19 where not explicitly closed): 1 Critical (backup/restore),
5 High, plus the residual least-privilege grants listed below.

---

## B. PHASE 20A RESULT (re-verified live, not from the old report)

### RPC repair — CONFIRMED FUNCTIONALLY, LEAST-PRIVILEGE STILL PENDING

`guard_seed_first_run_policies` live definition and grants (queried this phase):

- Grants: `{=X/postgres, postgres=X/postgres, anon=X/postgres, authenticated=X/postgres, service_role=X/postgres}`
  — **PUBLIC and anon EXECUTE are still present.** The `REVOKE` in migration 027 has NOT been applied.
- Body (applied live and verified): `auth.uid() IS NULL` → `RAISE EXCEPTION '...requires an authenticated user'`;
  company derived server-side via `get_my_company_id()`; `p_company_id` is trusted only after it equals the
  caller's own company; active-membership check `users.company_id = p_company_id AND (status IS NULL OR status='active')`;
  idempotent `NOT EXISTS` guards retained; signature/return type unchanged.
- `search_path`: `public, pg_temp` — safe (no attacker-influenceable schema earlier in the path).
- **Live proof:** `SELECT guard_seed_first_run_policies(<company_id>)` with no authenticated session returns
  `ERROR P0001: guard_seed_first_run_policies requires an authenticated user` at line 7 — before any INSERT.
  The foreign-tenant and anonymous write vectors are closed **by the body**, regardless of the broad grants.

Verification checklist:

| Check | Result |
|---|---|
| PUBLIC has no execute permission | NOT MET — `=X` still granted (REVOKE blocked in this environment) |
| anon has no execute permission | NOT MET — `anon=X` still granted |
| Unauthenticated execution fails | PASS (live P0001) |
| Function checks auth.uid() | PASS |
| Tenant membership verified server-side | PASS (`get_my_company_id()` + `users.company_id`) |
| Suspended members rejected | PASS (`status='active'` guard) |
| Unauthorised role rejected | PARTIAL — no role check; any active member can seed its own company (benign, idempotent) |
| Tenant A cannot seed Tenant B | PASS (company mismatch → RETURN) |
| Authorised user seeds own tenant | PASS (active membership) |
| Repeated execution no duplicates | PASS (`NOT EXISTS`) |
| search_path safe | PASS |
| Browser cannot choose foreign tenant | PASS (company derived from auth, not request) |

### Other SECURITY DEFINER functions — REVIEWED, NO MATCHING VULNERABILITY

Every other `anon`/`PUBLIC`-executable SECURITY DEFINER function was re-read this phase. None has the
anon-skip pattern:

- `guard_acknowledge_first_run_policy` — checks `auth.uid()`; returns false and writes nothing when unauthenticated;
  verifies policy belongs to caller's company.
- `guard_ensure_workforce_profile` — returns NULL when unauthenticated; no insert.
- `guard_get_first_run_acknowledgements` — returns empty when unauthenticated.
- `is_platform_staff` — read-only; `auth.uid()` null yields false.
- `generate_incident_number` — trigger function; scoped to `NEW.company_id`; harmless to revoke for hygiene.

These grants remain broad (REVOKE blocked) but no cross-tenant write or anonymous write was found.

### Storage security — CONFIRMED

`incident-media` live settings: `public=false`, `file_size_limit=52428800` (50MB), MIME allowlist
(image/jpeg, png, webp, gif, heic, heif; video/mp4, quicktime, webm, 3gpp). Five tenant-scoped policies
present: INSERT/UPDATE/DELETE + SELECT keyed on `foldername(name)[1] = get_my_company_id()` (or
super_admin/platform_staff), plus a client SELECT policy keyed on `client_visible` + site ownership.

### Toolchain — NOT REPAIRED IN THE REPOSITORY (material correction to the Phase 20A summary)

`package.json` current state:

```
"scripts": { "build": "next build", "dev": "...", "lint": "next lint" }
```

- `lint` still maps to `next lint` (removed in Next 15.3.2) → will fail.
- No `typecheck`, `test`, `test:run`, or `verify` script.
- `devDependencies` contain no eslint, eslint-config-next, or vitest.
- No lockfile exists anywhere in the repository.
- Test files DO exist and contain meaningful assertions, but import `vitest`, which is not installed and
  has no script to invoke it — so they cannot currently run.

The Phase 20A report stated these scripts/dependencies were added. The current repository contradicts that;
the toolchain repair was not persisted.

### Tests created (files verified this phase)

Real assertions, not mocks of the security behaviour:
- `lib/security/signatures.test.ts` — HMAC + Stripe signature rejection/tamper/wrong-secret/malformed.
- `lib/redirect.test.ts` — open-redirect protection (external, protocol-relative, js/data/vbscript, encoded).
- `lib/accountStatus.test.ts` — suspended/removed/company-suspension denial.
- `supabase/tests/phase-20a-rpc-security-tests.sql` — SQL test harness (requires manual run; multi-session
  auth simulation not possible in this environment).

### Verification results

```bash
npm install        # UNVERIFIED (no shell; would generate the missing lockfile)
npm run typecheck  # NO SCRIPT — fails to exist
npm run lint       # BROKEN — `next lint` removed in Next 15
npm run test:run   # NO SCRIPT; vitest not installed
npm run build      # UNVERIFIED (no shell)
npm audit          # UNVERIFIED (no lockfile)
```

---

## C. PHASE 20B RESULT

**BLOCKED — the backup/restore hard blocker is NOT resolved.** No restore was executed; no recovery
environment existed; no RPO/RTO measured; no Storage object restored. `supabase/docs/phase-20b-results.md`
records this honestly. The only verified positive is that WAL archiving is live (9,936 files, 0 failures),
which is the PITR mechanism firing but is not proof of an executed restore.

---

## D. AUTOMATIC BLOCKER TABLE

| Blocker | Result | Notes |
|---|---|---|
| Production build | UNVERIFIED | never executed; toolchain also broken |
| Tenant isolation | PARTIAL / UNVERIFIED | RLS verified live; no two-session runtime test possible |
| Cross-tenant RPC repair | PASS (functional) | body verified live; least-privilege grants still pending |
| Sensitive-table RLS | PASS | all 265 public tables `relrowsecurity=true`; 7 views `security_invoker` |
| Privileged-secret scan | PASS (code) | no secret literal in browser code (Phase 19/20A grep) |
| SOS safety | UNVERIFIED (code PASS) | persist-first verified in code; no runtime run |
| Stripe webhook signatures | UNVERIFIED (code PASS) | HMAC + event-id dedup verified in code; not executed |
| Migration source of truth | PASS | 001–027 sequential |
| Critical agents | UNVERIFIED | no n8n runtime/config evidence |
| Backup restore | FAIL | 20B blocked, no drill |
| Storage recovery | FAIL | 20B blocked, no object restore |
| Critical dependency vulnerabilities | UNVERIFIED | no lockfile, `npm audit` never run |
| Authentication | UNVERIFIED | no runtime session |
| Rollback process | UNVERIFIED | documented only |

Any FAIL → NO-GO; any UNVERIFIED item needed to clear a blocker remains uncleared. Multiple remain.

---

## E. AGENT REGISTER

All 15 agents remain code-complete but runtime-unverified. None can be classified READY (no importable-config
evidence, no credentials, no schedule/trigger, no successful staging execution, no owner recorded).

| Agent | Workflow | Classification |
|---|---|---|
| Shift reminder | agent-shift-reminder.json | UNVERIFIED (config required) |
| Late/missed check-in | agent-late-checkin.json | UNVERIFIED (config required) — CRITICAL |
| SOS escalation | agent-sos-escalation.json | UNVERIFIED (config required) — CRITICAL |
| Incident notification | agent-incident-notification.json | UNVERIFIED (config required) |
| Compliance expiry | agent-licence-expiry.json | UNVERIFIED (config required) |
| Training renewal | agent-training-renewal.json | UNVERIFIED (config required) |
| Timesheet reminder | agent-timesheet-reminder.json | UNVERIFIED (config required) |
| Invoice reminder | agent-invoice-reminder.json | UNVERIFIED (config required) |
| Subscription reconciliation | agent-subscription-reconciliation.json | UNVERIFIED (config required) — CRITICAL |
| Notification retry | agent-notification-retry.json | UNVERIFIED (config required) — CRITICAL |
| Failed-event recovery | agent-failed-event-recovery.json | UNVERIFIED (config required) — CRITICAL |
| Daily operations summary | agent-daily-summary.json | UNVERIFIED (config required) |
| Data retention | agent-data-retention.json | UNVERIFIED (config required) |
| Data integrity | agent-integrity-reconciliation.json | UNVERIFIED (config required) |
| Platform health | agent-health-monitoring.json | UNVERIFIED (config required) — CRITICAL |

Six critical agents are UNVERIFIED → not cleared for launch.

---

## F. VERIFIED WORKING (evidence-backed only)

- Cross-tenant RPC write closed — live function body + live P0001 rejection (this phase).
- `incident-media` private with 50MB + MIME limits and 5 tenant-scoped policies (this phase).
- RLS enabled on all 265 public tables; 7 views `security_invoker` (this phase).
- Stripe webhook signature verification + unique event-id dedup (code).
- SOS persist-before-notify ordering; no AI close/downgrade (code).
- No privileged secret in browser-reachable code (code scan).
- 27 zero-policy tables are service-only deny-all (classified, no broad policies added).
- Real unit-test files with meaningful assertions exist (but are not runnable — see toolchain).

---

## G. REMAINING CONDITIONS

| Item | Severity | Exact action | Launch impact |
|---|---|---|---|
| Backup/restore drill | Critical | Run Phase 20B drill in an isolated recovery project (Dashboard + CLI); record RPO/RTO | BLOCKING |
| Storage object restore | Critical | Restore + checksum-validate one synthetic critical object; enable off-site object backup | BLOCKING |
| Production build | High | `npm install` (generates lockfile) → `npm run build`; record exit code | BLOCKING |
| Package toolchain | High | Replace `next lint`; add `typecheck`/`test`/`test:run`/`verify`; add eslint + vitest | BLOCKING (build/test) |
| Least-privilege grants | High | Apply migration 027 `REVOKE`/`GRANT` in Supabase SQL editor (REVOKE blocked in this tool) | Must-fix before prod |
| anon view grants | High | Revoke anon from `v_billing_*` + `sop_version_history` (security_invoker already limits data) | Must-fix before prod |
| n8n agent config | High | Import workflows, wire credentials, set schedules + signed callbacks; record a test run | BLOCKING (critical agents) |
| Provider config | Medium | Email (Resend domain verify), SMS, maps, monitoring, AI | Must-fix before prod |
| Stripe test-mode E2E | Medium | Run checkout→webhook→entitlement in test mode | Must-fix before prod |
| Runtime tenant-isolation + route smoke test | High | Execute in a real browser; capture console/network/permission results | Must-fix before prod |
| Duplicate cron job + service-role key in pg_cron setting | Medium | Remove duplicate `expire_shift_cover_offers`; move key to Vault | Can follow |
| `config.toml` Postgres version drift (15 vs 17.6) | Low | Update to match live | Can follow |

---

## H. PRODUCTION CONFIGURATION CHECKLIST (remaining manual)

1. Enable PITR + scheduled backups; confirm plan tier and retention (Dashboard).
2. Provision an isolated recovery project; run and approve the Phase 20B drill.
3. Configure off-site Storage object backup for critical private buckets.
4. Apply migration 027 grant statements (Supabase SQL editor).
5. n8n: import 15 workflows, set credentials/schedules/signed-callbacks, run one signed E2E per critical agent.
6. Resend: verify sending domain; set `RESEND_FROM_DOMAIN`; build From from it (not hardcoded).
7. Stripe live keys + webhook endpoint + signing secret + redirect URLs (after test-mode E2E).
8. Google Maps API key, SMS provider + sender, error-monitoring DSN, AI provider key (server-side only).
9. `npm install` → commit lockfile; run `typecheck`/`lint`/`test`/`build`; fix and record.

---

## I. FIRST 72-HOUR MONITORING PLAN (proposed)

| Owner | Metric | Alert threshold | Escalation | Rollback trigger |
|---|---|---|---|---|
| Platform owner | SOS persistence + ack latency | any SOS with no ack in 2 min | on-call controller → platform owner | >1 SOS loss/error |
| Platform owner | Webhook 5xx / signature failures | >0 signature failures | on-call eng | webhook error rate >1% |
| Platform owner | Tenant-isolation alerts (cross-tenant read/write) | any | immediate freeze + incident | any confirmed leak |
| Eng | Agent execution failures / dead-letter growth | dead-letter >5/min | eng on-call | critical agent down |
| Eng | Build/deploy + error tracker | error rate spike | eng on-call | new-release regression |
| Support | Billing webhook duplicates / entitlement drift | any duplicate invoice | eng + billing | duplicate charges |

---

## J. FINAL DECISION

Phase 20A functionally closed the cross-tenant write (re-verified live), but its toolchain repair did not
persist in the repository. Phase 20B failed to produce a restore drill, leaving the backup/restore and
storage-recovery blockers open. The production build has never run, and six critical agents remain
unverified. Per the rules — "Do not issue GO if either Phase 20A or Phase 20B failed" — the verdict is NO-GO.

FINAL VERDICT: NO-GO — GUARDIANHUB MUST NOT LAUNCH UNTIL THE BLOCKERS ARE FIXED