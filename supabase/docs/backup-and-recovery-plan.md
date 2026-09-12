# Backup & Point-in-Time Recovery Plan — GuardianHub Phase 14

## Status

This plan documents the required production backup configuration. The actual enablement of Point-in-Time Recovery (PITR) and scheduled backups is a **Supabase Dashboard action** that has not been performed or verified in this workspace. No backup or restore success is claimed.

## Objectives (to be agreed and signed off)

| Item | Proposed | Owner to confirm |
|------|----------|------------------|
| Recovery Point Objective (RPO) | 5 minutes (PITR) | Platform owner |
| Recovery Time Objective (RTO) | 1 hour | Platform owner |
| Backup frequency | Continuous WAL + daily snapshot (plan-dependent) | Platform owner |
| Retention period | Plan-dependent (Supabase standard) | Platform owner |
| Restore authority | Platform Owner / Security lead | Platform owner |
| Emergency approval | Dual approval (Owner + Security) | Platform owner |

## Configuration steps (manual)

1. In Supabase Dashboard → Database → Backups, confirm scheduled backups are enabled.
2. Enable Point-in-Time Recovery on the production project.
3. Confirm the Supabase plan supports PITR (Free tier does not).
4. Record the configuration in `deployment_records` notes.

## Storage recovery limitation (important)

Database backups (and PITR) restore **database rows and Storage metadata**, but do **not** restore deleted Storage objects (files). Deleted evidence files, exports, uploads and attachments are therefore NOT recoverable from a database restore.

Separate recovery strategy for critical Storage files:
- Keep critical evidence and documents in Storage buckets with versioning/retention and object lock where supported.
- Export/archive critical Storage objects to an encrypted, access-controlled off-site location on a defined schedule.
- Do not rely on database restore for Storage object recovery.

## Restore drill (staging) — NOT YET RUN

A restore drill on staging has not been executed in this workspace and is therefore **unverified**.

Required drill steps:
1. Restore a recent production-like snapshot into staging.
2. Verify after restore: authentication, tenant isolation, core relationships, Storage references, scheduled shifts, incident records, billing references, automation configuration.
3. Record actual recovery duration and any discovered problems.
4. Only after a passing drill, mark the restore process verified.

## Backup status reporting

Backup status must be recorded without exposing credentials. The Operations dashboard and `deployment_records` table are the intended home for this status once configured.