# Phase 10 — Recruitment, Vetting, SIA Compliance, Training & Workforce Lifecycle

## Status: PASS

## Work Completed

### Database — 18 New Tables
| Table | Purpose |
|-------|---------|
| workforce_profiles | Central workforce record per worker |
| workforce_status_history | Immutable status change log |
| vacancies | Job vacancy management |
| applications | Candidate applications (hashed tokens) |
| application_documents | Secure uploaded application files |
| application_stage_history | Pipeline stage audit |
| onboarding_checklists | Configurable new-starter checklists |
| sia_licences | Separate SIA licence tracking per worker |
| identity_rtw_checks | Right-to-work verification records |
| screening_requirements | Configurable company screening rules |
| screening_items | Per-worker screening check status |
| worker_references | Reference requests with hashed tokens |
| competency_assessments | Assessor-verified competency records |
| workforce_policies | Versioned policy documents |
| policy_acknowledgments | Per-worker policy acknowledgement/quiz |
| uniform_equipment | Asset tracking (uniforms, keys, devices) |
| sensitive_hr_cases | Welfare, grievance, disciplinary cases |
| sensitive_case_members | Per-case access control (not company-wide) |
| sensitive_case_events | Case event timeline |
| offboarding_checklists | Controlled exit workflow |
| retention_rules | Configurable retention per record category |
| legal_holds | Freeze deletion for legal requirements |
| workforce_audit_log | Full workforce action audit trail |

### Roles & Permissions — 4 HR Roles + 16 Permissions
- hr_viewer — read-only workforce/recruitment/vetting/SIA
- hr_recruiter — manage pipeline + screening
- hr_manager — full lifecycle management + sensitive cases
- hr_director — final approvals (hire, vetting, disciplinary) + retention

### Edge Functions
- check-assignment-eligibility — Server-side eligibility check evaluating workforce status, SIA licence validity, mandatory training, screening status, and right-to-work. Returns eligible/eligible_with_warning/ineligible with reason codes.

### Pages Created — 10 Pages
| Route | Description |
|-------|-------------|
| /dashboard/workforce | Workforce Hub dashboard |
| /dashboard/workforce/vacancies | Create/manage vacancies |
| /dashboard/workforce/recruitment | Application pipeline by stage |
| /dashboard/workforce/sia | SIA licence management |
| /dashboard/workforce/screening | Screening & vetting items |
| /dashboard/workforce/onboarding | New starter checklists |
| /dashboard/workforce/offboarding | Controlled exit workflow |
| /dashboard/workforce/hr-cases | Sensitive HR case management |
| /dashboard/workforce/equipment | Uniform & asset tracking |
| /dashboard/workforce/policies | Policy version management |
| /dashboard/workforce/retention | Retention rules & legal holds |

### Navigation
- "Workforce Hub" added to DashboardShell nav (near Guards)

## Security Controls
- All tables have RLS with company-level isolation
- sensitive_hr_cases uses case_member access, not general company membership
- sensitive_case_members controls per-case access
- Applications use hashed applicant tokens (applicant_token_hash)
- Worker references use hashed single-use tokens (request_token_hash)
- Client users cannot access any workforce tables
- Guards see only their own workforce profile
- Identity/RTW/screening tables restricted to HR managers+
- Legal holds prevent deletion

## Recruitment & Compliance Workflows
- Vacancy → published → applications → pipeline stages (received → hired/unsuccessful)
- SIA licence: separate table with verified status, expiry tracking, alerts
- Screening: requirements → items per worker → human approval required
- Onboarding: checklist with configurable items, version tracking
- Offboarding: access revoke, session revoke, equipment return, pay handoff
- Eligibility: server-side check (SIA + training + screening + RTW)

## Manual/Legal Configuration Required
1. Assign HR roles to authorized users
2. Configure screening requirements per company
3. Configure retention periods per record category
4. Verify SIA licences through official register (not automated)
5. Conduct right-to-work checks per official guidance
6. Configure onboarding checklist items per role
7. Upload workforce policies
8. Set up private Storage buckets for sensitive documents
9. Configure legal holds when needed
10. Review and update retention rules periodically

## Files Changed
- 18 new database tables (SQL executed)
- 4 HR roles + 16 permissions (SQL executed)
- 23 RLS policies (SQL executed)
- 1 edge function: check-assignment-eligibility
- 11 new page files (workforce hub + 10 sub-pages)
- 1 modified: app/dashboard/components/DashboardShell.tsx (nav item)
- 1 documentation file

## Unresolved Blockers
- None. All database, RLS, and page infrastructure is in place.
- Operational verification (SIA checks, RTW checks) requires human action as designed.
- Storage bucket configuration for sensitive documents is manual setup.