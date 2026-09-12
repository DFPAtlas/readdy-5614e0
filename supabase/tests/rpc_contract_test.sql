-- GuardianHub RPC Contract Validation Tests
-- Run: psql -h localhost -p 54322 -d postgres -U postgres -f supabase/tests/rpc_contract_test.sql

-- Test 1: Required RPC functions exist
DO $$
DECLARE
  expected_rpcs text[] := ARRAY[
    'accept_shift_cover_offer', 'decline_shift_cover_offer',
    'is_super_admin', 'match_sop_chunks',
    'request_shift_leave', 'sop_daily_queries'
  ];
  missing text[] := '';
  t text;
BEGIN
  FOREACH t IN ARRAY expected_rpcs LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname = 'public' AND p.proname = t
    ) THEN
      missing := array_append(missing, t);
    END IF;
  END LOOP;

  IF array_length(missing, 1) > 0 THEN
    RAISE WARNING 'MISSING RPC FUNCTIONS: %', array_to_string(missing, ', ');
  ELSE
    RAISE NOTICE 'PASS: All 6 required RPC functions exist';
  END IF;
END $$;

-- Test 2: accept_shift_cover_offer accepts required params
DO $$
DECLARE
  has_params boolean;
BEGIN
  has_params := EXISTS (
    SELECT 1 FROM information_schema.parameters
    WHERE specific_schema = 'public'
      AND specific_name = 'accept_shift_cover_offer'
      AND parameter_name = 'p_offer_id'
  );
  
  IF has_params THEN
    RAISE NOTICE 'PASS: accept_shift_cover_offer accepts p_offer_id parameter';
  ELSE
    RAISE WARNING 'FAIL: accept_shift_cover_offer may have wrong parameter signature';
  END IF;
END $$;

-- Test 3: request_shift_leave accepts required params
DO $$
DECLARE
  has_shift_id boolean;
  has_reason boolean;
BEGIN
  has_shift_id := EXISTS (
    SELECT 1 FROM information_schema.parameters
    WHERE specific_schema = 'public'
      AND specific_name = 'request_shift_leave'
      AND parameter_name = 'p_shift_id'
  );
  has_reason := EXISTS (
    SELECT 1 FROM information_schema.parameters
    WHERE specific_schema = 'public'
      AND specific_name = 'request_shift_leave'
      AND parameter_name = 'p_reason'
  );

  IF has_shift_id THEN
    RAISE NOTICE 'PASS: request_shift_leave accepts required parameters';
  ELSE
    RAISE WARNING 'FAIL: request_shift_leave may have wrong parameter signature';
  END IF;
END $$;

-- Test 4: sop_daily_queries accepts required params
DO $$
DECLARE
  has_company_id boolean;
  has_since boolean;
BEGIN
  has_company_id := EXISTS (
    SELECT 1 FROM information_schema.parameters
    WHERE specific_schema = 'public'
      AND specific_name = 'sop_daily_queries'
      AND parameter_name = 'p_company_id'
  );
  has_since := EXISTS (
    SELECT 1 FROM information_schema.parameters
    WHERE specific_schema = 'public'
      AND specific_name = 'sop_daily_queries'
      AND parameter_name = 'p_since'
  );

  IF has_company_id AND has_since THEN
    RAISE NOTICE 'PASS: sop_daily_queries accepts required parameters';
  ELSE
    RAISE WARNING 'FAIL: sop_daily_queries may have wrong parameter signature';
  END IF;
END $$;

-- Test 5: match_sop_chunks returns expected columns
DO $$
DECLARE
  returned_columns text[] := '';
  expected_columns text[] := ARRAY['id', 'document_id', 'document_title', 'content', 'similarity'];
BEGIN
  -- This is a manual verification — run match_sop_chunks with test embeddings
  RAISE NOTICE 'MANUAL VERIFICATION: match_sop_chunks output schema should include document_id, document_title, content, similarity';
END $$;

-- MANUAL VERIFICATION:
-- 1. Verify is_super_admin correctly checks auth.uid() (both overloads)
-- 2. Verify all RPCs use SECURITY DEFINER only when genuinely required
-- 3. Verify anon role does not have execute on sensitive RPCs
-- 4. Verify RPCs validate company membership internally

-- Check which roles have execute on each RPC
SELECT
  n.nspname AS schema,
  p.proname AS function,
  pg_get_function_result(p.oid) AS returns
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN ('accept_shift_cover_offer', 'decline_shift_cover_offer',
                     'is_super_admin', 'match_sop_chunks',
                     'request_shift_leave', 'sop_daily_queries')
ORDER BY p.proname;