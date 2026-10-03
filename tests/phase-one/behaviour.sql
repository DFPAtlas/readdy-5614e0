-- Synthetic companies, clients and users. No production data or network is used.
insert into companies(id,name) values ('10000000-0000-4000-8000-000000000001','Company A'),('10000000-0000-4000-8000-000000000002','Company B');
insert into users(id,company_id,role,status) values
 ('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','client','active'),
 ('20000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000001','client','active'),
 ('20000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000001','company_admin','active'),
 ('20000000-0000-4000-8000-000000000004','10000000-0000-4000-8000-000000000002','client','active'),
 ('20000000-0000-4000-8000-000000000005','10000000-0000-4000-8000-000000000001','guard','active');
insert into client_users(user_id,company_id,client_id,role) values
 ('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001','admin'),
 ('20000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000002','viewer'),
 ('20000000-0000-4000-8000-000000000004','10000000-0000-4000-8000-000000000002','30000000-0000-4000-8000-000000000004','admin');
insert into service_requests(id,company_id,client_id,requester_id,description) values
 ('40000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','Request A'),
 ('40000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000002','Other client, same company'),
 ('40000000-0000-4000-8000-000000000004','10000000-0000-4000-8000-000000000002','30000000-0000-4000-8000-000000000004','20000000-0000-4000-8000-000000000004','Other company');
insert into client_invoices(id,company_id,client_id,status) values
 ('50000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001','issued'),
 ('50000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001','paid'),
 ('50000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001','overdue'),
 ('50000000-0000-4000-8000-000000000004','10000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001','draft'),
 ('50000000-0000-4000-8000-000000000005','10000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000002','issued'),
 ('50000000-0000-4000-8000-000000000006','10000000-0000-4000-8000-000000000002','30000000-0000-4000-8000-000000000004','issued');
insert into guards(id,user_id,company_id) values('60000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000005','10000000-0000-4000-8000-000000000001');
insert into shifts(id,company_id,guard_id,status,start_time,end_time) values
 ('70000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','60000000-0000-4000-8000-000000000001','scheduled',now(),now()+interval '12 hours'),
 ('70000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000001',null,'scheduled',now(),now()+interval '12 hours');
set role authenticated;
select set_config('request.jwt.claim.sub','20000000-0000-4000-8000-000000000001',false);
do $$ declare n int; result jsonb;
begin
 select count(*) into n from service_requests; if n<>1 then raise exception 'Client request isolation failed: %',n;end if;
 select count(*) into n from client_invoices; if n<>3 then raise exception 'Issued/paid/overdue visibility or draft isolation failed: %',n;end if;
 perform public.client_service_request_action('40000000-0000-4000-8000-000000000001','message','Can you confirm cover?');
 perform public.client_service_request_action('40000000-0000-4000-8000-000000000001','close');
 select status into result from (select to_jsonb(status) status from service_requests where id='40000000-0000-4000-8000-000000000001') s;
 if result<>'"closed"'::jsonb then raise exception 'Request close failed'; end if;
 perform public.client_service_request_action('40000000-0000-4000-8000-000000000001','reopen');
 begin perform public.client_service_request_action('40000000-0000-4000-8000-000000000002','close');raise exception 'Other client mutation accepted';exception when insufficient_privilege then null;end;
 begin perform public.client_service_request_action('40000000-0000-4000-8000-000000000004','close');raise exception 'Other company mutation accepted';exception when insufficient_privilege then null;end;
 update service_requests set internal_notes='forged' where id='40000000-0000-4000-8000-000000000001';get diagnostics n=row_count;if n<>0 then raise exception 'Direct client internal mutation accepted';end if;
 result:=public.client_invoice_queries('50000000-0000-4000-8000-000000000001','The invoice hours need checking.');
 if jsonb_array_length(result)<>1 or (result->0) ? 'internal_notes' then raise exception 'Invoice query response unsafe'; end if;
 begin perform public.client_invoice_queries('50000000-0000-4000-8000-000000000004');raise exception 'Draft invoice query accepted';exception when insufficient_privilege then null;end;
 begin perform public.client_invoice_queries('50000000-0000-4000-8000-000000000005');raise exception 'Other client invoice query accepted';exception when insufficient_privilege then null;end;
 select count(*) into n from service_request_events; if n<>4 then raise exception 'Request history missing or leaked: %',n; end if;
end $$;
select set_config('request.jwt.claim.sub','20000000-0000-4000-8000-000000000002',false);
do $$ begin
 begin perform public.client_service_request_action('40000000-0000-4000-8000-000000000002','close');raise exception 'Viewer mutation accepted';exception when insufficient_privilege then null;end;
 begin perform public.client_invoice_queries('50000000-0000-4000-8000-000000000005','Viewer tries to submit a query');raise exception 'Viewer invoice query accepted';exception when insufficient_privilege then null;end;
end $$;
select set_config('request.jwt.claim.sub','20000000-0000-4000-8000-000000000003',false);
do $$ declare n int;
begin
 perform public.client_service_request_action('40000000-0000-4000-8000-000000000001','message','Cover confirmed by operations.');
 select count(*) into n from shift_history;if n<>2 then raise exception 'Shift creation audit missing';end if;
end $$;
select set_config('request.jwt.claim.sub','20000000-0000-4000-8000-000000000005',false);
do $$ begin
 insert into shift_acknowledgements(company_id,shift_id,guard_id) values('10000000-0000-4000-8000-000000000001','70000000-0000-4000-8000-000000000001','60000000-0000-4000-8000-000000000001');
 begin insert into shift_acknowledgements(company_id,shift_id,guard_id) values('10000000-0000-4000-8000-000000000001','70000000-0000-4000-8000-000000000002','60000000-0000-4000-8000-000000000001');raise exception 'Unassigned shift acknowledged';exception when insufficient_privilege then null;end;
end $$;
reset role;
