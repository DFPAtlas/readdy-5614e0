-- GuardianHub Phase 14: RLS fixes for tables found without row-level security

ALTER TABLE public.service_contract_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_debug_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY scv_select ON public.service_contract_versions FOR SELECT USING (
  is_super_admin() OR EXISTS (
    SELECT 1 FROM public.service_contracts sc
    WHERE sc.id = service_contract_versions.contract_id
    AND sc.company_id = get_my_company_id()
  )
);

CREATE POLICY scv_insert ON public.service_contract_versions FOR INSERT WITH CHECK (
  is_super_admin() OR EXISTS (
    SELECT 1 FROM public.service_contracts sc
    WHERE sc.id = service_contract_versions.contract_id
    AND sc.company_id = get_my_company_id()
  )
);

CREATE POLICY webhook_debug_log_select ON public.webhook_debug_log FOR SELECT USING (is_super_admin() OR is_platform_staff());
CREATE POLICY webhook_debug_log_insert ON public.webhook_debug_log FOR INSERT WITH CHECK (is_super_admin() OR is_platform_staff());