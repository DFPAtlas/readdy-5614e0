# Storage Backup Strategy — GuardianHub (Proposed)

Status: PROPOSED. This is a recovery strategy for critical private Storage objects, required because Supabase database backups/PITR restore metadata but do **not** restore deleted object files. No object backup service is configured yet, so Storage-object recovery is currently BLOCKED until one is provisioned.

## Scope

### Included buckets (critical, private)
- `incident-media` — incident/SOS evidence
- `evidence` — general evidence files
- `guard-documents` — guard compliance documents
- `compliance-documents` — compliance evidence
- `client-documents` — client contracts/documents
- `acs-evidence` — ACS compliance evidence
- `reports` — generated reports (rebuildable, lower priority)
- `support-attachments` — support evidence
- `sop-documents` — SOP files (once created)

### Excluded / lower priority
- `company-logos`, `email-assets` — public, rebuildable/marketing assets.
- `user-image` — profile images, low criticality.
- Any future transient/temp buckets.

## Policy

| Attribute | Proposed value |
|-----------|----------------|
| Backup frequency | Daily for critical evidence; event-driven export for `incident-media`/SOS on upload |
| Retention | 30 days online; 7 years for legal/evidence (aligned with `retention_config`); legal-hold overrides |
| Encryption | AES-256 at rest + SSE/CMK at off-site target; TLS in transit |
| Off-site location | Separate cloud object store (e.g. S3/GCS) in a different region, private |
| Access control | Service-only via edge function using service role; never browser-accessible |
| Integrity | SHA-256 checksum recorded per object; periodic verification job |
| Versioning | Object versioning enabled at target; aligned with `storage.objects.version` |
| Legal hold | Objects subject to `legal_holds` excluded from deletion propagation |
| Restore process | Download from off-site → verify checksum → re-upload via service role → verify signed URL |
| Deletion propagation | Object delete events recorded so off-site copies expire per retention unless on hold |
| Recovery owner | Platform Ops (proposed) |

## Constraints

- A second publicly accessible copy of private evidence must NOT be created. The off-site target must be private and access-controlled.
- Bucket paths must remain tenant-scoped (`{company_id}/...`) so restoration preserves isolation.
- Signed URLs for restored objects must be short-lived and minted only for authorised viewers.

## BLOCKED

Until an approved object backup service is configured, Storage-object recovery cannot be demonstrated. The exact blocker is the absence of an off-site object backup target and its provisioning/credentials — this must be configured by an operator before the Storage restore test in Phase 20B can pass.