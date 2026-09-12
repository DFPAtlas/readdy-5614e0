# RLS Policy Matrix — GuardianHub Phase 1B

## Overview

All 135 public tables have Row Level Security enabled. This document summarizes the security posture of each table group after Phase 1B hardening.

## Policy Standards

| User Type | SELECT | INSERT | UPDATE | DELETE |
|-----------|--------|--------|--------|--------|
| super_admin | All | All | All | All |
| company_admin | Own company | Own company | Own company | Own company |
| operations_manager | Own company | Own company | Own company | Own company |
| guard | Own records + assigned sites | Own actions only | Own records only | Own records only |
| client | Client-visible records only | Own client data | Own client data | Own client data |
| anon | Denied | Denied (except newsletter) | Denied | Denied |

## Table Group Status

### Core Tenancy (companies, users, roles, permissions) — SECURE
- users: RESTRICTIVE policy blocks super_admin creation/upgrade by non-super-admin
- companies: Billing fields protected by trigger; only super_admin can change Stripe IDs
- roles: System roles protected from modification by non-super-admin
- permissions: Reference data, authenticated read
- plans: Reference data, authenticated read
- plan_features: Reference data, authenticated read

### Multi-tenant Core (user_roles, user_site_access, role_permissions) — SECURE
- All scoped to company_id
- Admin-only management

### Sites & Guards — SECURE
- sites: Company-scoped + client access
- guards: Company-scoped, guard can read own
- guard_site_assignments: Company-scoped
- guard_availability: Company-scoped + guard-owned
- guard_time_off: Company-scoped + guard-owned

### Rota, Shifts, Attendance — SECURE
- shifts: Company-scoped + client-visible where applicable
- attendance_logs: Company-scoped, guard sees own
- leave_requests: Company-scoped
- shift_cover_offers: Company-scoped + offered user

### Incidents & Occurrence Books — SECURE
- incidents: Company-scoped + client-visible where site.client_id matches
- occurrence_books: Company-scoped + client_visible=true for client sites
- incident_comments/media/timeline: Scoped via incident ownership

### Patrols & Checkpoints — SECURE
- patrol_logs: Company-scoped + client-visible
- patrol_scans: Company-scoped + client-visible
- patrol_checkpoints: Company-scoped + client access

### Lone Worker & Welfare — SECURE
- lone_worker_sessions: Company-scoped
- lone_worker_checkins: Scoped via session ownership
- guard_wellbeing_checkins: Company-scoped, guard sees own

### SOP, Training & Compliance — SECURE
- sop_documents: Company-scoped + client site access
- training_modules: Company-scoped + global modules
- compliance_documents: Company-scoped

### ACS & Evidence — SECURE (FIXED)
- acs_audit_findings: INSERT now requires company membership (was USING true)
- acs_audit_runs: INSERT now requires company membership (was USING true)
- All other ACS tables: Company-scoped

### Agent & AI — SECURE (FIXED)
- agent_execution_logs: OPEN SELECT policy REMOVED, now company + user scoped
- agent_registry: Active agents only for authenticated users
- ai_activity_logs: Company-scoped

### Billing — SECURE
- All billing_* tables: super_admin only (RLS + trigger protection)
- companies subscription fields: Trigger-protected

### Support — SECURE
- support_tickets: Company-scoped
- support_ticket_messages: Company-scoped + internal message restriction

### Sensitive Data — SECURE
- company_secrets: Blocked for all roles (false policy)
- guard_vetting_records: Admin only, guards denied
- guard_performance_scores: Admin only, guards denied
- admin_activity_log: Admin only, no delete by non-super-admin