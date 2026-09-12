# GuardianHub Storage Buckets Reference

Phase 1A Baseline — 2026-08-10

---

## Bucket Summary

| Bucket | Status | Privacy | Allowed Types | Max Size | Upload | Read | Delete | Notes |
|---|---|---|---|---|---|---|---|---|
| acs-evidence | EXISTS | Private | image/*, application/pdf | 25MB | admin, company_admin | signed URL | admin, company_admin | ACS compliance evidence |
| client-documents | EXISTS | Private | image/*, application/pdf, application/msword | 10MB | client_users, admin | signed URL | admin, company_admin | Client portal documents |
| company-logos | EXISTS | Public | image/* | 2MB | company_admin | public URL | company_admin | Company branding |
| compliance-documents | EXISTS | Private* | application/pdf, image/* | 25MB | admin, company_admin | **getPublicUrl used but private** | admin | MISMATCH: code uses public URLs |
| email-assets | EXISTS | Public | image/* | 5MB | super_admin | public URL | super_admin | Email marketing assets |
| evidence | EXISTS | Private | image/*, video/*, application/* | 50MB | admin, guards | signed URL | admin | General evidence files |
| guard-documents | EXISTS | Private | application/pdf, image/* | 10MB | admin, guards | signed URL | admin | Guard document storage |
| **guard-photos** | **MISSING** | Public | image/jpeg, image/png, image/webp | 5MB | admin, company_admin | public URL | admin | Guard profile photos |
| incident-media | EXISTS | **Public*** | image/*, video/* | 25MB | guards, admin | public URL | admin | **Should be private** |
| reports | EXISTS | Private | application/pdf | 10MB | edge functions | signed URL | admin | Generated reports |
| site-images | EXISTS | Private | image/* | 10MB | admin, company_admin | signed URL | admin | Site-related images |
| **sop-documents** | **MISSING** | Private | application/pdf, application/msword | 25MB | admin, company_admin | signed URL | admin | SOP document files |
| support-attachments | EXISTS | Private | image/*, application/pdf | 10MB | users | public URL | admin | Support ticket attachments |
| user-image | EXISTS | Private | image/* | 2MB | users | signed URL | admin | User profile images |

---

## Path Conventions

| Bucket | Path Pattern | Example |
|---|---|---|
| guard-photos | {guard_id}/{filename} | abc-123/photo.jpg |
| sop-documents | {company_id}/{document_id}/{filename} | def-456/doc-789/sop.pdf |
| incident-media | {incident_id}/{filename} | ghi-789/evidence.jpg |
| client-documents | {client_id}/{filename} | jkl-012/report.pdf |
| acs-evidence | {company_id}/{category}/{filename} | mno-345/insurance/cert.pdf |
| reports | {company_id}/{report_type}/{filename} | pqr-678/weekly/report.pdf |
| support-attachments | {ticket_id}/{filename} | stu-901/screenshot.png |

---

## Security Requirements

1. **Private buckets must use signed URLs** — never expose direct public URLs for sensitive data
2. **Company isolation**: Path must start with company_id or be validated against the authenticated user's company
3. **Evidence, incident media, compliance files**: Always private, signed URLs only
4. **Guard photos**: May be public (profile photos) but requires product design confirmation
5. **Email assets**: Public for external email delivery
6. **Support attachments**: Consider switching to signed URLs to prevent unauthenticated access

---

## Required Storage Policies

Each bucket needs policies for:

- SELECT (read): Authenticated users with appropriate role + company membership
- INSERT (upload): Appropriate roles, file type and size validation
- UPDATE: Generally disabled unless overwrite is required
- DELETE: Admin or owning company admin only

---

## Phase 1B Tasks

1. Switch incident-media to private
2. Fix compliance-documents privacy (bucket or code)
3. Create guard-photos bucket
4. Create sop-documents bucket
5. Audit all storage policies for company isolation
6. Standardise signed URL usage across all private buckets