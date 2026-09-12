# GuardianHub Phase 17 — UK GDPR, SIA Compliance & Trust Centre

## Verdict
**PARTIAL — supports compliance, does not certify it.** All compliance controls are persisted
and tenant-isolated, but legal documents, lawful bases, DPIAs and subprocessor transfer
mechanisms are explicitly marked `legal_review` / `draft` and require a solicitor or DPO
before production publication. No certification or ACS mark is claimed.

## What was implemented

### Compliance data model (17 new tables + SIA extension)
- `compliance_frameworks`, `compliance_evidence`, `policy_documents`, `policy_acceptances`
- `processing_activities`, `lawful_basis_records`, `dpia_assessments`
- `data_subject_request_events`, `data_breach_cases`, `data_breach_events`
- `subprocessors`, `data_transfer_records`, `data_processing_agreements`
- `location_tracking_configs`, `ai_automation_register`, `company_acs_records`
- `compliance_review_tasks`
- Extended `sia_licences` with `watchlist_status`, `assignment_eligibility`, `verification_method`, `review_notes`

Reused existing tables: `data_requests` (DSAR cases), `retention_rules`, `legal_holds`,
`sia_licences`, `guard_vetting_records`, `screening_requirements`, `screening_items`.

### RLS and access controls
- Every new table has RLS enabled.
- Tenant-scoped tables use `company_id = get_my_company_id() OR is_platform_staff()`.
- Platform-only tables (`compliance_review_tasks`, `data_transfer_records`, `data_subject_request_events`) are `is_platform_staff()` only.
- Published transparency tables (`subprocessors`, `policy_documents`, `ai_automation_register`, `compliance_frameworks`) expose only `is_published` rows publicly; drafts and management are platform-staff only.
- Sensitive evidence references are stored as private Storage paths, not inline content.

### Platform Compliance Command Centre — `/admin/compliance`
Tabs: Overview, Processing & DPIA, Subprocessors, Legal Documents, AI Register, Breaches.
Added to the platform sidebar. Restricted by the existing platform-admin gate.

### Tenant compliance — `/dashboard/settings` → Compliance tab
Tabs: Location Tracking, SIA & ACS, Breaches, Records & DPIA. Tenant users only see their own organisation records.

### Location tracking safeguards
- Config requires purpose, lawful basis, tracked subjects, start/stop, precision, retention,
  viewer roles, emergency rules, worker-notice version and DPIA status.
- Background tracking is off by default and warns when enabled.
- UI states tracking stops at check-out and hidden monitoring is never used.

### Data-subject request workflow
- Public `/privacy/request` (form-backed, honeypot-protected) with nine request types.
- Case management already exists in `/admin/data-requests` (reused); added `data_subject_request_events` timeline.

### Breach management
- `data_breach_cases` + `data_breach_events`.
- 72-hour deadline calculated from recorded awareness time (and stored with human confirmation).
- No automatic ICO/customer/individual notification. Breach log retained even when not reportable.

### SIA and ACS controls
- SIA licence eligibility flag (`assignment_eligibility`) drives assignment safety; format validation is not verification.
- Company ACS record with `not_held` / `preparing` / `held` and platform-only `display_authorised` flag.
- ACS marks can never be published without platform verification.

### Retention and legal holds
- Reuses `retention_rules` and `legal_holds` (tenant-aware, legal-hold aware).
- Recommended retention placeholders are presented as "legal review required", never hard-coded as final.

### Subprocessors identified
Supabase, Stripe, Resend, Google Maps Platform, n8n, OpenAI, SMS gateway (unconfigured).
All transfer mechanisms and risk assessments are `Legal review required`.

### AI and automation transparency
- `ai_automation_register` with 16 systems, all `not_approved`.
- Explicit list of decisions agents must never make autonomously (dismiss, reject applicants, determine guilt, diagnose health, close SOS, final disciplinary decisions).

### Legal documents (12 drafts, version-controlled)
Privacy Notice, DPA, Terms of Service, Cookie Notice, AUP, Security Overview, Data Retention
Summary, Subprocessor List, Worker Location Transparency, Data Breach Procedure, Data Subject
Rights Procedure, AI Transparency Notice. All `draft`, version `0.1.0`, never presented as approved.

### Cookie and consent controls
- Upgraded banner: Accept all / Essential only / Customise with equal clarity.
- Consent stored with version + timestamp; re-requested on version change.
- Withdrawal via persistent "Cookie settings" button.
- Non-essential cookies are not set before consent.

## Items requiring solicitor, DPO or regulatory review
1. All 12 legal documents (drafts only).
2. Lawful basis for guard location tracking.
3. Transfer mechanisms for US-based subprocessors.
4. DPA 2018 Schedule 1 condition for criminal-offence and vetting data.
5. Whether an authorised SIA verification integration exists.
6. Retention periods before they become final.
7. ACS display authorisation process.

## Official guidance used
- ICO UK GDPR guidance: https://ico.org.uk/for-organisations/
- ICO subject access: https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/subject-access-requests/
- GOV.UK SIA licence checker: https://www.gov.uk/check-a-private-security-licence
- GOV.UK SIA business services: https://www.gov.uk/guidance/use-our-business-services
- GOV.UK ACS guidance: https://www.gov.uk/guidance/learn-about-our-approved-contractor-scheme

## Remaining compliance risks
- No DPO or solicitor has reviewed the generated drafts.
- Subprocessor transfer risk assessments are incomplete.
- No official SIA verification integration confirmed.
- Final retention periods are placeholders, not legally reviewed.
- Trust Centre publishes the honesty note (no certifications) but full reviewed documents are not yet downloadable.

## Verification
```bash
npm run build
npx tsc --noEmit
```
A clean build was not runnable in this workspace; run both before publication.

## Final note
Completing this phase does not make GuardianHub or its customers legally compliant. Final
professional review is required before production publication.