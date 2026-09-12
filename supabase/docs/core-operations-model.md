# GuardianHub Core Operations Model

## Entity Relationships

### Companies → Sites
- One company has many sites (`sites.company_id → companies.id`)
- Sites are the operational unit where guards are deployed
- Every site belongs to exactly one company

### Sites → Clients
- A site can optionally link to a client (`sites.client_id → clients.id`)
- Client sites may also have separate `client_sites` records for client-specific views
- Client users see only sites linked to their client profile

### Sites → Guards (via Assignments)
- Guards are assigned to sites via `guard_site_assignments`
- Assignment statuses: `assigned`, `approved`, `not_trained`, `blocked`, `expired_docs`
- `is_blocked` flag prevents guard from being assigned to shifts at that site
- Assignment tracks induction status and last worked date

### Sites → Shifts
- Shifts belong to a site (`shifts.site_id → sites.id`)
- Each shift has a guard (`shifts.guard_id → guards.id`, nullable for unassigned)
- Shift statuses: `scheduled`, `active`, `completed`, `cancelled`
- Shift types reference `shift_types` table for templating

### Shift Types
- Company-scoped (`shift_types.company_id`)
- Fields: name, code, color, start_time, end_time, is_paid, break_duration_minutes, is_active
- Used by shifts and patterns as a template reference

### Shift Pattern Templates
- Company-scoped reusable patterns (`shift_pattern_templates.company_id`)
- Can be applied to generate shifts for sites
- `pattern_type`: weekly, rotational, single, custom
- `slots` is a JSONB array of day/time/guard-requirements

### Site Shift Patterns
- Site-specific recurring patterns (`site_shift_patterns.site_id`)
- Defines day_of_week, shift_type, start/end times, guards_required
- Used by the rota builder for automatic shift generation

### Rota Publishing
- `rota_published_weeks` tracks published rotas per company/week
- Publishing creates a lock on the week to prevent unauthorized edits
- Unpublishing records who and when, preserves historical record

### Rota Conflicts
- Detected at build time and stored in `rota_conflicts`
- Types: overlapping_shifts, guard_unavailable, leave_conflict, overtime, missing_skills
- Resolved conflicts are marked but preserved for audit

### Guard Availability
- `guard_availability` stores per-guard day-of-week availability windows
- `guard_time_off` stores approved leave periods
- `leave_requests` is the formal leave workflow (shift-specific leave requests)

### Shift Cover
- `shift_cover_offers` are created when a guard requests leave
- Sent to eligible guards with a response deadline
- Atomic accept/decline via RPC functions
- First valid acceptance reserves the shift

### Attendance Logs
- `attendance_logs` records clock-in/clock-out per shift
- Linked to shift and guard
- Optional GPS coordinates for location verification
- Manager corrections require reason

### Operational Records
- **Occurrence Books**: Site-specific daily log entries, linked to guard/shift
- **Incidents**: Security incidents with status workflow, timeline, media
- **Patrol Logs**: Guard patrol runs with checkpoint completion tracking
- **Visitor Logs**: Visitor sign-in/out at sites

### Access Control
- `user_site_access` determines which users can see which sites
- Gate checks for guard portal: guards see only assigned sites
- Client users see only client-linked sites
- Dashboard operators see all company sites (permission-based)

## Data Flow

```
Company
  └── Sites
       ├── Clients (optional link)
       ├── Guard Assignments
       │    └── Guards
       ├── Shift Patterns
       ├── Shifts
       │    ├── Attendance Logs
       │    ├── Leave Requests
       │    └── Cover Offers
       ├── Rota Published Weeks
       ├── Rota Conflicts
       ├── Occurrence Books
       ├── Incidents
       ├── Patrol Logs
       └── Visitor Logs
```