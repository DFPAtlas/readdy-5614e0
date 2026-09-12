# GuardianHub — Phase 22A Results: Toolchain Repair, Live Grant Enforcement & Build Evidence

Date: 2026-08-13
Result: FAIL — the build blocker remains UNVERIFIED (no shell) and the live-grant blocker remains (REVOKE is blocked in-environment and migration 027's grants are still unapplied).

---

## 0. Verdict (up front)

The code/toolchain *source* is now repaired (scripts, deps, tests, corrective migration), but this phase
cannot be marked PASS because two acceptance criteria are not met and cannot be met from this environment:

- **Production build** — cannot execute here (no shell). UNVERIFIED. Acceptance requires a real
  `next build` exit code, which requires an external runner.
- **Live least-privilege grants** — `REVOKE` is explicitly rejected by the SQL runner
  (`SQL execution is prohibited to protect data security: REVOKE EXECUTE ...`). The 14 custom functions
  still carry PUBLIC + anon EXECUTE and the 5 sensitive views still grant anon. A corrective migration
  (028) is committed but can only be applied via the Supabase SQL editor / `supabase db push`.

Both blockers therefore remain. Nothing here touches production.

---

## 1. Files changed

| File | Change | Status |
|---|---|---|
| `package.json` | Removed `next lint`; added `lint`/`typecheck`/`test`/`test:run`/`verify`; added eslint + eslint-config-next + @eslint/eslintrc + vitest deps; pinned npm via `packageManager` | Written, syntax OK |
| `lib/security/integrity.ts` | New pure module: timestamp freshness, nonce replay set, event-id dedup | Written |
| `lib/security/integrity.test.ts` | 11 new real assertions (replay window, nonce replay, stripe dedup) | Written |
| `supabase/migrations/028_guardianhub_phase22a_grant_repair.sql` | Corrective least-privilege migration (REVOKE/GRANT) | Written |
| `supabase/docs/phase-22a-results.md` | This report | Written |
| `supabase/docs/phase-21-blocked-launch-report.md` | Updated with Phase 22A state | Updated |

Blocked by environment (config-file protection — same class as `tsconfig.json`/`eslint.config.mjs`):

- `vitest.config.ts` — not written. Not required: the unit tests only use type-only `@/` imports
  (`import type` is erased), so Vitest's default config runs them.
- `.github/workflows/ci.yml` — not written. Content captured in section 15 for manual placement.
- `.gitleaks.toml` — not written. Content captured in section 15.

---

## 2. Toolchain inspection (before)

| Item | Value |
|---|---|
| Framework | Next.js 15.3.2 (React 19) |
| Language | TypeScript ^5 |
| Package manager intended | npm (no other lockfile present) |
| Existing lockfiles | **None** (no package-lock.json / yarn.lock / pnpm-lock.yaml / bun.lockb) |
| `next lint` present | **Yes** — `"lint": "next lint"`. Removed in Next 15, so it fails/aborts |
| `typecheck` / `test` / `verify` scripts | **Absent** |
| eslint / vitest deps | **Absent** |
| ESLint config | `eslint.config.mjs` exists but is environment-protected (unreadable/unmodifiable here) |
| TypeScript config | `tsconfig.json` exists but is environment-protected (unreadable/unmodifiable here) |
| Test files present | `lib/security/signatures.test.ts`, `lib/redirect.test.ts`, `lib/accountStatus.test.ts` (19 assertions total) |
| CI | None (`.github/workflows/` absent) |

Root cause of the toolchain blocker: `package.json` still referenced the removed `next lint`, had no
typecheck/test/verify scripts, had no eslint/vitest deps, and had no lockfile. The Phase 20A report
claimed these were added, but the repository never actually received them.

---

## 3. Package manager

Selected: **npm** (the only manager the repository has ever implied; no competing lockfile exists).
Pinned via `"packageManager": "npm@10.9.2"`. No conflicting lockfiles to remove.

---

## 4. Lockfile

**NOT created.** Generating `package-lock.json` requires `npm install`, and there is no shell here.
The lockfile is therefore UNVERIFIED until an external runner executes `npm install` and commits it.

---

## 5. Scripts before / after

Before:

```json
"build": "next build",
"dev": "cross-env NODE_ENV=development next dev -H 0.0.0.0 -p 3000",
"lint": "next lint"
```

After:

```json
"dev": "cross-env NODE_ENV=development next dev -H 0.0.0.0 -p 3000",
"build": "next build",
"lint": "eslint .",
"typecheck": "tsc --noEmit",
"test": "vitest",
"test:run": "vitest run",
"verify": "npm run typecheck && npm run lint && npm run test:run && npm run build"
```

No `|| true`, no error-ignoring flags. `verify` runs typecheck → lint → test → build and fails fast.

---

## 6. TypeScript

- Starting errors: unknown (never run).
- Final errors: **UNVERIFIED** — `tsc --noEmit` cannot be executed here.
- Edge Functions are Deno/TypeScript and are not covered by `tsc --noEmit`; they would need `deno check`.
  No separate functions tsconfig exists. Documented as a limitation, not fabricated.

---

## 7. ESLint

- `next lint` removed; `lint` now runs `eslint .`.
- Config file `eslint.config.mjs` is environment-protected and cannot be read/verified here.
- Deps added: `eslint@^9`, `eslint-config-next@15.3.2`, `@eslint/eslintrc@^3`.
- Final lint errors: **UNVERIFIED** (cannot execute).

---

## 8. Test foundation

Already present (real, non-mocked):
- `lib/security/signatures.test.ts` — HMAC + Stripe signature valid/tampered/wrong-secret/malformed.
- `lib/redirect.test.ts` — open-redirect protection.
- `lib/accountStatus.test.ts` — suspended/removed account denial (tenant authorisation).

Added this phase (`lib/security/integrity.test.ts`, 11 assertions):
- `isTimestampFresh` — n8n callback replay-window (accept boundary, reject stale/future/non-finite).
- `SeenNonceSet` — n8n nonce replay rejection (first-accept, replayed-reject, empty-reject).
- `isDuplicateEvent` — Stripe webhook idempotency (unseen vs already-processed vs missing-id).

DB/RPC behaviours that cannot be unit-tested without a live multi-session DB remain in
`supabase/tests/phase-20a-rpc-security-tests.sql` and are **UNVERIFIED** (anonymous denial,
cross-tenant seeding, same-tenant success, idempotent seeding). Stripe duplicate-event and n8n
nonce replay are DB-backed at runtime (`billing_webhook_events.stripe_event_id` unique,
`agent_replay_nonces.nonce` unique); the unit tests above assert the same contract in pure form.

Test run result: **UNVERIFIED** (vitest not executable here).

---

## 9. Clean installation

**UNVERIFIED.** Command `npm ci` (frozen) cannot run until `npm install` first produces and commits
`package-lock.json`.

---

## 10. Production build

**UNVERIFIED.** `npm run build` (`next build`) has never executed in any prior phase and cannot here.

---

## 11. Dependency audit

**UNVERIFIED.** `npm audit --audit-level=high` cannot run without a lockfile/node_modules.

---

## 12. Secret scan

**UNVERIFIED.** A gitleaks-based scan is defined in the CI gate (section 15) but cannot run here.
No manual scan of source found a privileged secret in browser-reachable code; this is a
source-review statement, not a tool result. `.gitleaks.toml` could not be written (protected path);
the allowlist for `lib/.*\.test\.ts$` test fixtures is provided in section 15.

---

## 13. Migration 027 status

- File: `supabase/migrations/027_guardianhub_phase20a_security_repair.sql`.
- Function-body hardening (section 1): **applied live** (verified in Phases 20A/20C).
- REVOKE/GRANT blocks (sections 2, 3, 4): **NOT applied** — confirmed by live catalog inspection.
- Applied migration history uses timestamp versions (e.g. `20260614141455`), not the repo's `001–027`
  numbering; no applied entry contains 027's REVOKE/GRANT statements.
- **Corrective migration created:** `supabase/migrations/028_guardianhub_phase22a_grant_repair.sql`
  (replicates 027's grant changes plus trigger-helper hardening). Must be applied externally.

---

## 14. Live function grants — before and after

"Before" is the current live state. "After" is unchanged because REVOKE cannot be applied here.

| Function | SECURITY | Before (PUBLIC/anon) | After | Intended |
|---|---|---|---|---|
| guard_seed_first_run_policies(uuid) | DEFINER | PUBLIC+anon+auth+sr | unchanged | internal (no client execute) |
| guard_ensure_workforce_profile() | DEFINER | PUBLIC+anon+auth+sr | unchanged | internal |
| guard_get_first_run_acknowledgements() | DEFINER | PUBLIC+anon+sr | unchanged | authenticated only |
| guard_acknowledge_first_run_policy(uuid) | DEFINER | PUBLIC+anon+sr | unchanged | authenticated only |
| generate_incident_number() | DEFINER | PUBLIC+anon+auth+sr | unchanged | trigger-only |
| is_platform_staff() | DEFINER | PUBLIC+anon | unchanged | authenticated + service_role |
| sop_daily_queries(uuid, timestamptz) | INVOKER | PUBLIC+anon | unchanged | authenticated + service_role |
| match_sop_chunks (2 overloads) | INVOKER | PUBLIC+anon | unchanged | authenticated + service_role |
| prevent_subscription_field_tamper() | trigger | PUBLIC+anon | unchanged | trigger-only |
| prevent_subscription_field_update() | trigger | PUBLIC+anon | unchanged | trigger-only |
| set_site_notice_updated_at() | trigger | PUBLIC+anon | unchanged | trigger-only |
| set_updated_at() | trigger | PUBLIC+anon | unchanged | trigger-only |
| tg_billing_set_updated_at() | trigger | PUBLIC+anon | unchanged | trigger-only |

The pgvector extension functions (`vector_*`, `halfvec_*`, `sparsevec_*`, `*_distance`, etc.) remain
PUBLIC-executable — these are pure math/cast operators with no data access and are correctly left alone.

Cross-tenant/anonymous denial: the hardened `guard_seed_first_run_policies` body already rejects
unauthenticated callers (P0001) and never trusts `p_company_id` (verified live in Phase 20C). The grant
tightening in 028 is defense-in-depth and remains UNAPPLIED.

---

## 15. Live view/table grants — before and after

| Object | Before (anon) | After | Notes |
|---|---|---|---|
| v_billing_mrr_current | SELECT + more | unchanged | security_invoker=on (verified) |
| v_billing_overdue | SELECT + more | unchanged | security_invoker=on (verified) |
| v_billing_revenue_monthly | SELECT + more | unchanged | security_invoker=on (verified) |
| v_billing_tax_monthly | SELECT + more | unchanged | security_invoker=on (verified) |
| sop_version_history | SELECT + more | unchanged | security_invoker=true (verified) |

All 7 public views verified live as `security_invoker=true` (the 4 billing views report `=on`, equivalent).
This acceptance sub-criterion **passes**. The anon SELECT revocation remains UNAPPLIED (REVOKE blocked).

---

## 16. CI release gate

`.github/workflows/ci.yml` could not be written (protected path). The exact gate to add manually:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

permissions:
  contents: read

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - name: Install dependencies (frozen lockfile)
        run: npm ci
      - name: Typecheck
        run: npm run typecheck
      - name: Lint
        run: npm run lint
      - name: Test
        run: npm run test:run
      - name: Build
        run: npm run build
      - name: Dependency audit (fail on high/critical)
        run: npm audit --audit-level=high

  secret-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - name: Gitleaks secret scan
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

Recommended `.gitleaks.toml` (test fixtures are fake secrets):

```toml
title = "GuardianHub gitleaks config"

[allowlist]
description = "Exclude unit-test fixtures that contain intentionally fake secrets"
paths = [
  '''lib/.*\.test\.ts$''',
]
```

No automatic production deployment is configured (correct for this phase).

---

## 17. Exact external commands still required

```bash
npm install            # generates + commits package-lock.json (one lockfile, npm)
npm ci                 # frozen clean install (CI + local verify)
npm run typecheck      # tsc --noEmit
npm run lint           # eslint . (requires valid eslint.config.mjs)
npm run test:run       # vitest run (4 suites, 30 assertions)
npm run build          # next build (real production build)
npm audit --audit-level=high
```

Database grant application (Supabase SQL editor, or `supabase db push`):

```sql
-- run the full contents of:
--   supabase/migrations/028_guardianhub_phase22a_grant_repair.sql
```

Deno Edge Functions typecheck (optional, needs Deno CLI):

```bash
deno check supabase/functions/*/index.ts
```

---

## 18. Security / Performance Advisor

**UNVERIFIED.** These are Supabase dashboard features, not reachable via the SQL tool. Not marked passed.

---

## 19. Remaining blockers (unchanged unless separately proven)

- Phase 20B recovery drill — still FAIL/BLOCKED.
- Storage-object restore — still FAIL.
- Browser route/UAT evidence — still UNVERIFIED.
- n8n critical-agent execution — still UNVERIFIED.
- Stripe E2E — still UNVERIFIED.
- Six release approvals — still missing.
- Production build — now scripted in repo but still UNVERIFIED (needs external run).
- Live least-privilege grants — migration 028 committed but still UNAPPLIED (REVOKE blocked here).

---

## 20. Final result

The build/toolchain **source** is repaired and the corrective grant migration is committed, but neither
blocker is cleared with execution evidence: the build has not run (no shell) and the grants have not been
applied (REVOKE blocked). Do not deploy.

PHASE 22A RESULT: FAIL — BUILD OR LIVE-GRANT BLOCKER REMAINS