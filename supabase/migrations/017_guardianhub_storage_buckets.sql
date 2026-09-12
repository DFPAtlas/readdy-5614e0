-- GuardianHub Migration 017: Storage Buckets
-- Phase 1A Baseline Recovery
-- Creates missing buckets using Storage API approach

-- NOTE: Buckets must be created via Supabase Management API or dashboard.
-- This migration documents the expected bucket configuration.

-- EXISTING BUCKETS (verified — do not recreate):
-- acs-evidence         (private)
-- client-documents     (private)
-- company-logos        (public)
-- compliance-documents (private — BUT code uses getPublicUrl)
-- email-assets         (public)
-- evidence             (private)
-- guard-documents      (private)
-- incident-media       (public — SECURITY CONCERN)
-- reports              (private)
-- site-images          (private)
-- support-attachments  (private)
-- user-image           (private)

-- MISSING BUCKETS TO CREATE:

-- 1. guard-photos
-- Used by: app/dashboard/staff/AddGuardModal.tsx, app/dashboard/staff/CreateTemplateModal.tsx
-- Purpose: Guard profile photos
-- Privacy: Should be public (profile photos, non-sensitive by design)
-- Allowed MIME: image/jpeg, image/png, image/webp
-- Max file size: 5MB
-- Path convention: {guard_id}/{filename}
DO $$
BEGIN
  RAISE NOTICE 'guard-photos bucket must be created via Supabase dashboard. Set to public, image/* MIME only, 5MB limit.';
END $$;

-- 2. sop-documents
-- Used by: lib/useSOPDocuments.ts, lib/useSOPLibrary.ts
-- Purpose: SOP document files (PDFs, docs)
-- Privacy: Should be private
-- Allowed MIME: application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document
-- Max file size: 25MB
-- Path convention: {company_id}/{document_id}/{filename}
DO $$
BEGIN
  RAISE NOTICE 'sop-documents bucket must be created via Supabase dashboard. Set to private, PDF/DOC MIME only, 25MB limit.';
END $$;

-- MISMATCHES TO FIX:

-- 3. incident-media — currently public, SHOULD be private
-- Sensitive incident photos are publicly accessible. 
-- After code migration to signed URLs, change bucket to private.
DO $$
BEGIN
  RAISE NOTICE 'incident-media is public. After code audit in Phase 1B, switch to private with signed URLs.';
END $$;

-- 4. compliance-documents — code uses getPublicUrl but bucket is private
-- Either make bucket public or update all code to use createSignedUrl
DO $$
BEGIN
  RAISE NOTICE 'compliance-documents mismatch: code calls getPublicUrl but bucket is private. Fix in Phase 1B.';
END $$;