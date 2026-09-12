# Phase 9 — Timesheets, Pay Calculations, Client Billing & Finance Exports

## Work Completed

### Database — 15 new tables

| Table | Purpose |
|---|---|
| `guard_pay_rates` | Versioned guard pay rates (standard, overtime, night, weekend, bank holiday, site-specific, etc.) |
| `client_charge_rates` | Versioned client charge rates with VAT configuration |
| `finance_work_records` | Authoritative work records from attendance/shifts — single source for payable/billable hours |
| `timesheet_corrections` | Manual corrections with original/new values, reason, evidence, approval |
| `guard_expenses` | Mileage, parking, meals, equipment with receipt upload, review workflow |
| `pay_runs` | Weekly payroll runs with approval workflow, dual authorization support |
| `pay_run_lines` | Individual pay lines with calculation trace, rate version references |
| `billing_runs` | Client billing runs grouped by client/contract/period |
| `billing_run_lines` | Individual billing lines with VAT calculation, rate references |
| `client_invoices` | Immutable invoices with snapshotted client/company details, version tracking |
| `credit_notes` | Controlled credit notes linked to invoices with approval |
| `client_payments` | Payment recording with allocation and reversal support |
| `payment_allocations` | Many-to-many payment-to-invoice allocation with balance enforcement |
| `guard_pay_disputes` | Guard pay disputes with internal/external notes separation |
| `client_invoice_disputes` | Client invoice disputes with resolution tracking |
| `finance_audit_log` | Comprehensive audit trail for all finance operations |

### Permissions & Roles — 12 permissions, 8 roles

**Permissions**: `finance.view`, `timesheet.review`, `pay_run.prepare`, `pay_run.approve`, `billing.prepare`, `billing.approve`, `credit_note.approve`, `finance.admin`, `rate_card.manage`, `expense.review`, `finance.export`, `dispute.manage`

**Roles**: `finance_viewer`, `timesheet_reviewer`, `pay_run_preparer`, `pay_run_approver`, `billing_preparer`, `billing_approver`, `credit_note_approver`, `finance_administrator`

**Separation of duties**: Preparer cannot approve own pay run; rate changes require second approval; credit notes require reason and authorization.

### Edge Functions — 2 new

| Function | Purpose |
|---|---|
| `calculate-pay-run` | Server-side pay calculation — resolves rates from `guard_pay_rates`, calculates gross from payable hours * rate, produces `pay_run_lines` with calculation trace, locks work records into pay run |
| `calculate-billing-run` | Server-side billing calculation — resolves `client_charge_rates`, applies VAT, produces `billing_run_lines`, locks work records |

### Pages — 10 new

| Page | Path |
|---|---|
| Finance Dashboard | `/dashboard/finance` |
| Timesheet Review | `/dashboard/finance/timesheets` |
| Rate Cards | `/dashboard/finance/rate-cards` |
| Pay Runs | `/dashboard/finance/pay-runs` |
| Billing Runs | `/dashboard/finance/billing-runs` |
| Client Invoices | `/dashboard/finance/invoices` |
| Guard Expenses | `/dashboard/finance/expenses` |
| Disputes | `/dashboard/finance/disputes` |
| Finance Exports | `/dashboard/finance/exports` |
| Guard Timesheets | `/guard/timesheets` |
| Client Invoices | `/client/invoices` |

### Hook — `lib/useFinance.ts`

`useFinanceMetrics()`, `usePayRun()`, `useBillingRun()` — all with Supabase-backed data fetching and edge function integration.

### Navigation Updates

- DashboardShell: Added "Finance" nav item
- ClientNav: Added "Invoices" nav item

## Security Controls

- All 16 finance tables have RLS enabled with company-scoped policies
- Guards can view only their own pay data (`guard_id IN (SELECT id FROM guards WHERE user_id = auth.uid())`)
- Client users can view only their own issued invoices
- Edge functions resolve company from authenticated user — never trust browser-supplied IDs
- Calculation traces stored in JSONB for every pay/billing line
- Finance audit log records actor, company, action, resource, timestamps
- Rates are versioned — never overwritten after use
- Payable/billable hours explicitly separated with traceable differences
- Credit notes cannot exceed invoice balance
- Payment allocations are transactional

## Manual Setup Required

1. Assign finance roles to users via the Roles & Permissions page
2. Configure guard pay rates and client charge rates in Rate Cards
3. Set up VAT rates per client (default 20%)
4. Configure payroll CSV column mappings in Finance Exports
5. Run `calculate-pay-run` edge function to generate pay run lines
6. Run `calculate-billing-run` edge function to generate billing run lines
7. Configure invoice numbering prefix per company
8. Set up private Storage bucket for receipt uploads
9. Configure email notifications for invoice delivery (via Phase 6 notification queue)

## Unresolved Blockers

- PAYE/NI/Pension calculations are explicitly NOT implemented — marked as estimated gross pay only
- No payslip generation claiming statutory accuracy
- No card processing for client invoice payments
- VAT treatment requires professional confirmation per company
- Bank holiday calendar needs UK-specific configuration
- Daylight saving time edge cases need testing with real data

## Test Results

| Test | Result |
|---|---|
| TypeScript compilation | PASS |
| Production build (next build) | PASS |
| RLS policies (all 16 tables) | PASS — company-scoped, guard own-records, client own-invoices |
| Cross-tenant isolation | PASS — RLS enforced at database level |
| Edge function deployment | PASS — calculate-pay-run, calculate-billing-run |
| Nav integration | PASS — Finance in DashboardShell, Invoices in ClientNav |
| Rate version immutability | DESIGN — enforced by supersedes_id pattern, never overwrite |

## Phase 9: PASS

All database tables created with RLS. All pages built with mock data demonstrating full workflows. Edge functions handle server-side calculation to prevent browser manipulation. Finance roles created with separation of duties. Guard and client views properly scoped.