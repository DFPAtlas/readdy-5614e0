-- GuardianHub Storage Contract Validation Tests
-- Run: psql -h localhost -p 54322 -d postgres -U postgres -f supabase/tests/storage_contract_test.sql

-- Test: Expected storage buckets exist
DO $$
DECLARE
  expected_buckets text[] := ARRAY[
    'acs-evidence', 'client-documents', 'company-logos',
    'compliance-documents', 'email-assets', 'evidence',
    'guard-documents', 'guard-photos', 'incident-media',
    'reports', 'site-images', 'sop-documents',
    'support-attachments', 'user-image'
  ];
  missing text[] := '';
  t text;
BEGIN
  FOREACH t IN ARRAY expected_buckets LOOP
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE name = t) THEN
      missing := array_append(missing, t);
    END IF;
  END LOOP;

  IF array_length(missing, 1) > 0 THEN
    RAISE WARNING 'MISSING STORAGE BUCKETS: %', array_to_string(missing, ', ');
  ELSE
    RAISE NOTICE 'PASS: All 14 expected storage buckets exist';
  END IF;
END $$;

-- Test: Private buckets should not be public
DO $$
DECLARE
  public_issues text[] := '';
  r record;
BEGIN
  FOR r IN
    SELECT name, public FROM storage.buckets
    WHERE name NOT IN ('company-logos', 'email-assets', 'guard-photos')
  LOOP
    IF r.public = true THEN
      public_issues := array_append(public_issues, r.name);
    END IF;
  END LOOP;

  IF array_length(public_issues, 1) > 0 THEN
    RAISE WARNING 'POTENTIALLY SENSITIVE BUCKETS SET TO PUBLIC: %', array_to_string(public_issues, ', ');
  ELSE
    RAISE NOTICE 'PASS: Sensitive buckets are correctly set to private';
  END IF;
END $$;

-- MANUAL VERIFICATION:
-- 1. Verify each bucket's storage policies enforce company-level isolation
-- 2. Verify allowed MIME types are restrictive
-- 3. Verify max file size limits are appropriate
-- 4. Verify signed URL expiry for private buckets

SELECT name, public FROM storage.buckets ORDER BY name;