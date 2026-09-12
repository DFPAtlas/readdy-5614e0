# GuardianHub — Phase 22C Runtime UAT Report

Date: 2026-08-13
Result: **FAIL** — browser, tenant-isolation and Stripe runtime blockers remain. Production deployment prohibited.

---

## 1. Executive result

Phase 22C could not clear the browser, tenant-isolation or Stripe runtime blockers because this
environment has **no shell, no browser automation and no reachable staging URL**. Runtime browser
evidence — which this phase explicitly requires and forbids substituting with static inspection —
could not be produced.

What was produced is a mix of **live database verification** (real SQL results) and **static source
inspection**, plus a **correct, runnable Playwright harness** that unblocks the browser work for an
external runner. Critically, the live checks surfaced a **hard, still-open security blocker**:

- `guard_seed_first_run_policies` and five other `SECURITY DEFINER` functions still carry
  `PUBLIC` + `anon` + `authenticated` EXECUTE grants. Unauthenticated invocation is therefore **not
  denied**, which directly fails the phase's least-privilege acceptance criterion.

A second blocker is a **toolchain regression**: the current `package.json` is back to the pre-22A
state (`next lint` still present, no `typecheck`/`test`/`verify`, no lockfile), so the "production
build and verification commands pass" gate cannot be met either.

Because at least one High blocker remains open (grants) and the runtime evidence is absent, the
result is FAIL. Nothing touched production and no live Stripe payment was used.

---

## 2. Environment and commit identity

| Item | Value | Status |
|---|---|---|
| Git commit SHA | unknown | UNVERIFIED (no shell to run `git rev-parse HEAD`) |
| Deployment URL | none reachable | BLOCKED (no staging URL provided to this environment) |
| Build identifier | none | UNVERIFIED |
| Node version | unknown | UNVERIFIED |
| Package manager | npm (pinned in prior phase) | UNVERIFIED (no lockfile present, no install run) |
| Supabase project | connected staging SaaS Supabase (ref redacted) | Verified connected; identity redacted |
| Stripe environment | sandbox/test-mode only required | UNVERIFIED (cannot inspect live vs test keys here) |
| Browser / Playwright | Playwright 1.62.x | Harness added; **not installed or run** |
| Test start/end (UTC) | N/A | No browser run occurred |

**Environment identity checks:** not proven. The absence of a shell and a staging URL means the
"staging is not connected to production Supabase" and "live Stripe keys are not present" checks
could not be executed. Per the phase, these checks stop at BLOCKED.

---

## 3. Commands and exit codes

No command could be executed — there is no shell in this environment. The following are the exact
commands that an external runner must execute, with the evidence they will produce:

| # | Command | Purpose | Result here |
|---|---|---|---|
| 1 | `npm install` | frozen clean install + generate lockfile | UNVERIFIED |
| 2 | `npm run typecheck` | TypeScript no-emit check | UNVERIFIED (script currently missing — see defect D-2) |
| 3 | `npm run lint` | ESLint | UNVERIFIED (script still `next lint`) |
| 4 | `npm run test` | unit tests | UNVERIFIED (script currently missing) |
| 5 | `npm run build` | production build | UNVERIFIED |
| 6 | `npx playwright install` | install browser binaries | UNVERIFIED |
| 7 | `npm run test:e2e` | browser UAT suite | UNVERIFIED (script + dep added; config/spec must be manually placed — see §12) |

No exit codes are claimed.

---

## 4. Route coverage totals

Routes were discovered from the actual `app/` source tree. The project contains roughly **200+
routable pages** across marketing, dashboard, ops, guard, client and admin areas.

- Routes discovered from source: ~200+ (full tree in `app/`)
- Routes visited in a browser: **0**
- Runtime result recorded: **0**
- Critical routes visited: **0**

Because zero routes were runtime-verified, the acceptance criterion "every discovered route has a
recorded result" is **not met**. Representative critical routes (runtime result UNVERIFIED for all):

| Area | Example routes |
|---|---|
| Auth | `/login`, `/signup`, `/auth/callback`, `/forgot-password`, `/reset-password` |
| Onboarding | `/dashboard/setup-wizard`, `/dashboard/getting-started` |
| Dashboard | `/dashboard`, `/dashboard/sites`, `/dashboard/staff`, `/dashboard/operations` |
| Scheduling | `/rotas`, `/dashboard/sites/[id]` |
| Incidents | `/incidents`, `/incidents/[id]`, `/dashboard/ops-room` |
| SOS / welfare | `/guard/sos`, `/dashboard/guard-welfare` |
| Billing | `/pricing`, `/checkout/success`, `/checkout/cancel`, `/dashboard/settings` |
| Client portal | `/client`, `/client/sites/[id]`, `/client/incidents` |
| Admin / audit | `/admin`, `/admin/audit-log`, `/admin/security-centre` |
| Errors | `/not-found`, `/403`, `/error` |

No runtime navigation, hydration, redirect-loop, console or permission result could be recorded.

---

## 5. Role / authentication matrix

Status: **UNVERIFIED** across the board. Static source review confirms role-gated routes and
auth wrappers exist (`AuthGate`, `PermissionGuard`, `SuperAdminGate`, `ACSGuard`, etc.), but no
login/logout/refresh/session-expiry/suspended-user journey was executed in a browser.

| Journey | Status |
|---|---|
| Valid login | UNVERIFIED |
| Invalid login | UNVERIFIED |
| Logout | UNVERIFIED |
| Protected route while logged out | UNVERIFIED |
| Expired / invalid session | UNVERIFIED |
| Browser refresh with active session | UNVERIFIED |
| Role-based landing page | UNVERIFIED |
| Invitation acceptance | UNVERIFIED |
| Password reset | UNVERIFIED |
| Suspended/disabled user denial | UNVERIFIED |
| Manual navigation to another role's route | UNVERIFIED |
| Session after role/access removal | UNVERIFIED |

UI restriction and backend rejection were **not** demonstrated.

---

## 6. Tenant-isolation CRUD matrix

**Pre-requisite (live, verified):** RLS is enabled (`relrowsecurity = true`) on all 14 key tenant
tables, with policies present on each:

| Table | Policies | Table | Policies |
|---|---|---|---|
| companies | 4 | incident_media | 4 |
| sites | 8 | notifications | 1 |
| guards | 12 | billing_invoices | 1 |
| clients | 5 | billing_payments | 1 |
| shifts | 8 | billing_subscription_events | 1 |
| attendance_logs | 4 | workforce_policies | 2 |
| incidents | 8 | policy_documents | 4 |

**Runtime CRUD matrix: UNVERIFIED.** The phase forbids using `service_role`/SQL impersonation to
prove isolation, and requires genuine authenticated browser sessions — which cannot be produced
here. No cross-tenant read/write/update/delete/guess-ID test was executed.

`relforcerowsecurity` is `false` on all tables (RLS enabled but not FORCE) — a low-severity
hardening recommendation, not a browser-role blocker, since `anon`/`authenticated` are always
subject to RLS.

---

## 7. Storage and Realtime results

- Storage isolation (list/download/overwrite/delete across tenants, path traversal, signed-URL
  expiry, MIME/size limits, extension rejection): **UNVERIFIED** — no browser session.
- Realtime cross-tenant payload/presence/notification isolation: **UNVERIFIED** — no subscription
  session.

---

## 8. Core workflow results

All **UNVERIFIED** (require a browser + synthetic tenant data): company onboarding, workforce
setup, guard check-in/check-out, incident create/update/media, controlled SOS, timesheet/client
portal. No visible outcome or DB-side evidence was recorded.

---

## 9. Stripe scenario matrix

**Static source inspection only.** No sandbox Checkout was completed and no webhook was delivered.

| Check | Result | Evidence |
|---|---|---|
| Checkout session created server-side | PASS (static) | `create-checkout-session` is an Edge Function |
| Price/plan from trusted server config | PASS (static) | price resolved from `plans.stripe_price_id_*`, not browser body |
| Browser price/amount/company not trusted | PASS (static) | only `plan` + `billing` accepted; company derived from auth user |
| Success/cancel URLs controlled | PARTIAL (static) | `returnUrl` accepted if it starts with `https://` (see D-4) |
| No Stripe secret in browser | PASS (static) | secret read from `Deno.env` only |
| Webhook signature verification | PASS (static) | `stripe.webhooks.constructEvent` |
| Duplicate event idempotency | PASS (static) | `billing_webhook_events.stripe_event_id` has a real UNIQUE constraint |
| Out-of-order event final state | UNVERIFIED | no execution |
| Cross-tenant event cannot mutate wrong company | UNVERIFIED | no execution |
| Sensitive payload not logged | PARTIAL (static) | full `raw` event persisted (see D-5) |
| Billing lifecycle (initial/decline/renewal/cancel/reactivate) | UNVERIFIED | no execution |

Full sandbox E2E (checkout → webhook → entitlement → relogin consistency) is **UNVERIFIED**.

---

## 10. Browser / device / accessibility results

**UNVERIFIED.** No Chromium/Firefox/WebKit/mobile run occurred; no accessibility scan was executed.
Responsive, focus-trap, contrast and accessible-name checks remain outstanding.

---

## 11. Defect register

| ID | Severity | Area | Finding |
|---|---|---|---|
| D-1 | **High** | Security | `guard_seed_first_run_policies` + 5 `SECURITY DEFINER` functions retain PUBLIC + anon EXECUTE (live). Unauthenticated invocation not denied; migration 028 unapplied; REVOKE blocked in-environment. |
| D-2 | **High** | Toolchain | `package.json` regressed to pre-22A state: `next lint` present, no `typecheck`/`test`/`verify`, no lockfile. Build/verify gate cannot pass. |
| D-3 | Medium | Security | `Access-Control-Allow-Origin: *` on `create-checkout-session` and `stripe-webhook` (and other functions). |
| D-4 | Medium | Security | Checkout accepts any browser-supplied `returnUrl` starting with `https://` as success/cancel target. |
| D-5 | Medium | Data privacy | Stripe webhook persists full raw event (`raw: event`) incl. customer email/name/address/card last4 to DB. |
| D-6 | Low | Reliability | Stripe webhook dedup uses pre-insert `.maybeSingle()` fast-path; UNIQUE constraint catches the race but the losing request's catch writes `processed_at`/`error` onto the winning request's row. |

Open **High** defects (D-1, D-2) alone make Phase 22C FAIL.

---

## 12. Fixes and retests

Changed this phase (no retest possible — no runner):

- `package.json` — added `@playwright/test` dependency and a `test:e2e` script.

The harness config and spec could not be written to `playwright.config.ts` and `e2e/*` — this
environment blocks those paths to avoid compilation failure (same guard that blocked
`vitest.config.ts` and the CI file in Phase 22A). Their full source is captured below for manual
placement before the first `npm run test:e2e` run.

`playwright.config.ts`:

    import { defineConfig, devices } from '@playwright/test';
    export default defineConfig({
      testDir: './e2e',
      fullyParallel: false,
      forbidOnly: !!process.env.CI,
      retries: process.env.CI ? 1 : 0,
      reporter: [['list'], ['html', { open: 'never' }]],
      use: {
        baseURL: process.env.E2E_BASE_URL || 'http://localhost:3000',
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
      },
      projects: [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
        { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
        { name: 'webkit', use: { ...devices['Desktop Safari'] } },
        { name: 'mobile-chromium', use: { ...devices['iPhone 13'] } },
      ],
    });

`e2e/route-smoke.spec.ts`:

    import { test, expect, type Page } from '@playwright/test';
    const BASE = process.env.E2E_BASE_URL || 'http://localhost:3000';
    const PUBLIC_ROUTES = ['/', '/login', '/pricing', '/contact', '/about'];
    const PROTECTED_ROUTES = ['/dashboard', '/dashboard/sites', '/dashboard/staff', '/dashboard/finance'];
    function collectRuntimeErrors(page: Page): string[] {
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));
      page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
      return errors;
    }
    test.beforeEach(() => {
      if (!process.env.E2E_BASE_URL) throw new Error('Missing E2E_BASE_URL');
    });
    test('public routes render without unhandled exceptions', async ({ page }) => {
      const errors = collectRuntimeErrors(page);
      for (const route of PUBLIC_ROUTES) {
        const res = await page.goto(`${BASE}${route}`);
        expect(res.status()).toBeLessThan(500);
      }
      expect(errors).toEqual([]);
    });
    test('unauthenticated access to protected routes is denied or redirected', async ({ page }) => {
      for (const route of PROTECTED_ROUTES) {
        const res = await page.goto(`${BASE}${route}`);
        expect(res.status()).toBeLessThan(500);
        expect(page.url()).not.toMatch(new RegExp(`${route}$`));
      }
    });
    test('Tenant A owner can authenticate when credentials are supplied', async ({ page }) => {
      const email = process.env.E2E_TENANT_A_EMAIL;
      const password = process.env.E2E_TENANT_A_PASSWORD;
      if (!email || !password) throw new Error('Missing E2E_TENANT_A_EMAIL / E2E_TENANT_A_PASSWORD');
      await page.goto(`${BASE}/login`);
      await page.getByRole('textbox', { name: /email/i }).fill(email);
      await page.getByRole('textbox', { name: /password/i }).fill(password);
      await page.getByRole('button', { name: /sign in|log in/i }).click();
      await page.waitForURL(/dashboard/, { timeout: 15000 });
    });

None of this was executed; all remain UNVERIFIED.

---

## 13. Redacted links to screenshots, traces and logs

None. No browser run occurred, so no screenshots, traces, HTML reports or console captures exist.

---

## 14. Remaining BLOCKED / UNVERIFIED items

- Phase 20B restore drill + storage-object restore (separate gate, still BLOCKED).
- Production build / typecheck / lint / unit tests (toolchain regression D-2).
- Live least-privilege grants — migration 028 REVOKE (D-1).
- Browser route smoke + auth/role UAT.
- Runtime tenant-isolation CRUD, Storage and Realtime isolation.
- Core workflow UAT incl. controlled SOS.
- Stripe sandbox E2E (checkout, webhook, lifecycle, idempotency).
- n8n critical-agent import/config/owner/execution (from Phase 22B, still open).
- Six release approvals + production provider configuration.

---

## 15. Separate gates (not cleared by this phase)

Backup/restore recovery drill, production deployment approval, required stakeholder sign-offs,
production provider configuration, and all remaining Phase 22B agent tests remain separate gates.
This phase does **not** claim production readiness.

---

PHASE 22C RESULT: FAIL — RUNTIME BLOCKERS REMAIN; PRODUCTION DEPLOYMENT PROHIBITED

Remaining blockers (owner / evidence required / next action):

1. **Live least-privilege grants** — Security. Evidence: `anon`/`PUBLIC` EXECUTE revoked on the 6
   functions and `anon` SELECT removed on `v_billing_*`/`sop_version_history`. Next action: apply
   migration 028 in the Supabase SQL editor or `supabase db push` (the in-environment runner blocks
   REVOKE).
2. **Production build + toolchain** — Engineering. Evidence: `next lint` removed, `typecheck`/`lint`/
   `test`/`verify` scripts present, one lockfile committed, and a clean `npm run verify` exit 0.
   Next action: re-apply the Phase 22A toolchain repair that has regressed out of the tree.
3. **Browser route/auth/tenant UAT** — Engineering/QA. Evidence: `npm run test:e2e` passing on a real
   staging URL with two synthetic tenants. Next action: provide a staging URL + credentials, run the
   new harness, record exit codes.
4. **Stripe sandbox E2E** — Finance/Engineering. Evidence: sandbox checkout → signed webhook →
   entitlement change with duplicate-event idempotency. Next action: run from a browser with Stripe
   test keys and a test-mode webhook endpoint.
5. **Phase 20B restore drill** — Platform owner/Operations. Evidence: measured RPO/RTO + Storage
   object restore/checksum. Next action: run the recovery drill in an isolated project.
6. **n8n critical agents** — Operations. Evidence: 15 agents imported, credentialed, owned, real
   handlers, signed staging E2E on the 6 critical agents. Next action: complete Phase 22B.
7. **Six release approvals + production provider config** — Release owner. Evidence: named approvals
   from Product, Engineering, Security, Operations, Data/privacy, Finance.