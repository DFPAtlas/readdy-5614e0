do $$
begin
 if not (select relrowsecurity from pg_class where oid='public.service_request_events'::regclass) then raise exception 'Request history RLS missing'; end if;
 if not (select relrowsecurity from pg_class where oid='public.shift_history'::regclass) then raise exception 'Shift history RLS missing'; end if;
 if not (select relrowsecurity from pg_class where oid='public.shift_acknowledgements'::regclass) then raise exception 'Shift acknowledgement RLS missing'; end if;
 if has_table_privilege('anon','public.service_request_events','SELECT') then raise exception 'Anonymous request history access'; end if;
 if has_table_privilege('authenticated','public.service_request_events','INSERT') then raise exception 'Forged history insertion allowed'; end if;
 if has_function_privilege('anon','public.client_service_request_action(uuid,text,text,text,text)','EXECUTE') then raise exception 'Anonymous request RPC access'; end if;
 if has_function_privilege('anon','public.client_invoice_queries(uuid,text)','EXECUTE') then raise exception 'Anonymous invoice RPC access'; end if;
 if (select public from storage.buckets where id='service-request-attachments') then raise exception 'Public request attachments'; end if;
 if private.phase1_client_member(gen_random_uuid(),gen_random_uuid()) then raise exception 'Unauthenticated membership'; end if;
 begin perform public.client_service_request_action(gen_random_uuid(),'message','unauthorised');raise exception 'Anonymous request mutation accepted';exception when insufficient_privilege then null;end;
 begin perform public.client_invoice_queries(gen_random_uuid());raise exception 'Anonymous invoice access accepted';exception when insufficient_privilege then null;end;
end $$;
