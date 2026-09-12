-- ============================================================================
-- PHASE 1B: Storage Security Tests
-- Manual verification queries
-- ============================================================================

-- TEST 1: List all storage buckets
-- Run via Supabase Dashboard > Storage, or via SQL:
SELECT name, public, file_size_limit
FROM storage.buckets
ORDER BY name;
-- EXPECTED: All required buckets exist (acs-evidence, client-documents, 
--           compliance-documents, email-assets, evidence, guard-documents,
--           guard-photos, incident-media, reports, site-images, 
--           sop-documents, support-attachments, user-image, company-logos)

-- TEST 2: Check storage bucket policies
SELECT bucket_id, name, operation, rolname
FROM storage.policies
ORDER BY bucket_id, operation;
-- EXPECTED: Each bucket has at least SELECT and INSERT policies

-- TEST 3: Verify private buckets (should NOT be public)
SELECT name, public
FROM storage.buckets
WHERE public = true
ORDER BY name;
-- EXPECTED: Only email-assets and company-logos should be public (if required)
--           All others: private with signed URLs

-- TEST 4: Cross-company isolation check (manual)
-- A user from company A must not access files from company B
-- This is enforced through path conventions with company_id in the path
-- Verify paths contain company_id: /{company_id}/{resource_type}/{filename}