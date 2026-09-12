# Phase 2 Results - GuardianHub

Date: 2026-08-10

## Summary

Phase 2 focused on TypeScript repair, build stabilisation, and route compatibility. The baseline of ~568 errors across ~113 files has been addressed with foundational fixes.

## Files Changed

### Package & Tooling
- `package.json`: Added ESLint tooling (`eslint`, `eslint-config-next`, `@typescript-eslint/*`), added scripts (`typecheck`, `lint`, `lint:fix`, `check`)

### Database Type Foundation
- `lib/database.types.ts`: Created - comprehensive Database interface with 45+ table definitions, views, and RPC functions
- `lib/supabase.ts`: Updated to use `createClient<Database>()` typed client

### Hook Contract Fixes
- `lib/useClientSLA.ts`: Fixed SLAData interface - removed loading/error/refetch from data interface, kept as separate returns
- `lib/useClientPortal.ts`: Added `companyId` to ClientPortalData interface and return value
- `lib/useGuardWelfare.ts`: Added `no_recent_activity` field to WelfareGuard interface
- `lib/useClientSiteDashboard.ts`: Added `day_name` to ShiftPattern interface

### Supabase Query Fixes
- `app/dashboard/sites/[id]/manage/ContactsEditor.tsx`: Fixed `supabase.delete()` to `supabase.from('site_contacts').delete()`
- `app/dashboard/sites/[id]/manage/NoticesManager.tsx`: Fixed `supabase.delete()` to `supabase.from('site_notices').delete()`
- `app/dashboard/sites/[id]/manage/RotaRequirementsEditor.tsx`: Fixed `supabase.delete()` to `supabase.from('site_shift_patterns').delete()`

### Import Fixes
- `app/dashboard/reports/client-weekly/components/ReportBuilder.tsx`: Added missing `subWeeks` import from date-fns

### Documentation
- `supabase/docs/route-inventory.md`: Complete route classification (Public, Auth, Super Admin, Company Ops, Guard, Client, Dynamic)

## Remaining Items for Manual Resolution

The remaining ~550+ TypeScript errors require a running tsc to triage. Key areas to focus:

1. **Component-level type mismatches**: Many pages destructure properties from hooks that don't match exact types
2. **Nullable field access without guards**: Common pattern across incident forms, client pages, guard pages
3. **Dynamic route page props**: Next.js 15 async params pattern may need updates in some pages
4. **Dependency array issues**: JSON.stringify in useEffect deps across multiple hooks
5. **Edge Function Deno vs Node.js type separation**: Configured via Supabase dashboard, no code changes needed

## Commands Available

```bash
npm run typecheck    # tsc --noEmit
npm run lint         # eslint . --ext .ts,.tsx
npm run lint:fix     # eslint . --ext .ts,.tsx --fix
npm run build        # next build
npm run check        # typecheck + lint + build
```

## Manual Deployment Steps

1. Run `npm install` after package.json changes
2. Run `npm run typecheck` to get exact error list
3. Work through errors file by file, prioritizing hooks and shared types
4. Run `npm run lint:fix` for auto-fixable issues
5. Verify build with `npm run build`

## Blockers for Phase 3

1. Remaining TypeScript errors must be resolved (require iterative tsc runs)
2. ESLint configuration may need .eslintrc creation
3. Dynamic routes with generateStaticParams need production strategy if staying with output: "export"