# Operational Risk Register — GuardianHub Phase 14

Status: open risks requiring manual/provider configuration. None are claimed resolved.

| # | Risk | Severity | Status | Required action |
|---|------|----------|--------|-----------------|
| 1 | PITR / scheduled backups not yet enabled or verified | High | Open | Enable in Supabase Dashboard; run staged restore drill |
| 2 | Storage objects not recoverable from DB restore | High | Open | Implement encrypted off-site Storage export for critical evidence |
| 3 | Supabase Security Advisor not run in dashboard | High | Open | Run Advisor; resolve critical findings |
| 4 | Supabase Performance Advisor not run | Medium | Open | Run Advisor; review slow-query findings |
| 5 | No external error-monitoring provider (Sentry etc.) configured | Medium | Open | Approve provider; wire adapter or enable |
| 6 | Production security headers not applied at CDN/edge | Medium | Open | Apply headers from security-headers.md; verify |
| 7 | Rate limiting on sensitive endpoints not fully implemented | Medium | Open | Add edge/gateway rate limits for sign-in, SOS, uploads, forms, webhooks |
| 8 | package-lock.json not committed (reproducible installs) | Medium | Open | Commit lockfile; enable `npm ci` |
| 9 | ESLint not configured (`next lint` currently non-blocking) | Medium | Open | Add eslint + eslint-config-next |
| 10 | Load tests not executed (SOS/check-in/incident budgets unverified) | Medium | Open | Run staging load tests; record p95/p99 |
| 11 | No real production deployment record yet | Low | Open | Record each release in `deployment_records` |
| 12 | Retention periods are draft defaults | High | Open | Legal review and finalisation before enabling `apply` mode |
| 13 | SMS/push provider not configured | Low | Open | Configure provider keys or mark permanently out of scope |
| 14 | `retention-runner` apply mode covers only a subset (automation payloads, terminal notifications, exports) | Medium | Open | Extend to remaining categories after legal review |
| 15 | Demo/admin legacy `super_admin` role still accepted by the gate | Low | Open | Migrate all staff to `platform_role_assignments`; remove legacy path |

## Secret-scan note

The CI workflow includes a Gitleaks secret-scan gate and `npm audit` high-severity gate. These run in GitHub Actions and are not executed in this workspace.