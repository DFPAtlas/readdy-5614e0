-- GuardianHub Migration 001: Extensions and Helpers
-- Phase 1A Baseline Recovery
-- DO NOT run without backing up first

-- Enable required extensions (idempotent)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Generic updated_at trigger function
-- If this function already exists, DO NOT replace it without verifying the existing definition
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'set_updated_at'
  ) THEN
    EXECUTE $fn$
      CREATE FUNCTION public.set_updated_at()
      RETURNS trigger
      LANGUAGE plpgsql
      AS $body$
      BEGIN
        NEW.updated_at = now();
        RETURN NEW;
      END;
      $body$
    $fn$;
  ELSE
    RAISE NOTICE 'set_updated_at() already exists — skipping creation. Verify definition manually.';
  END IF;
END $$;

-- Note: Many custom trigger functions already exist in the database.
-- They are documented in docs/database/guardianhub-database-contract.md
-- and will be recovered per-table in subsequent migrations.