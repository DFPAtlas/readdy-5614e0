-- Phase 1 page support. Existing operational records are preserved.
-- New client-facing history contains only client-safe messages, never internal notes.
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create or replace function private.phase1_client_member(cid uuid, clid uuid, writable boolean default false)
returns boolean language sql stable security definer set search_path = '' as $$
 select auth.uid() is not null and exists (
  select 1 from public.client_users cu join public.users u on u.id=cu.user_id
  where cu.user_id=auth.uid() and cu.company_id=cid and cu.client_id=clid
  and u.company_id=cid and u.status='active' and cu.status='active'
  and (not writable or cu.role in ('admin','manager'))
 );
$$;
revoke all on function private.phase1_client_member(uuid,uuid,boolean) from public,anon;
grant execute on function private.phase1_client_member(uuid,uuid,boolean) to authenticated;

create or replace function private.phase1_staff_permission(cid uuid, permission_key text, minimum_level text default 'view')
returns boolean language sql stable security definer set search_path = '' as $$
 select auth.uid() is not null and exists (
  select 1 from public.users u where u.id=auth.uid() and u.company_id=cid and u.status='active'
  and u.role not in ('client','guard') and (
   u.role in ('company_admin','super_admin','admin','owner','operations_manager') or exists (
    select 1 from public.user_roles ur join public.role_permissions rp on rp.role_id=ur.role_id
    where ur.user_id=u.id and ur.company_id=cid and rp.company_id=cid and rp.permission_key=phase1_staff_permission.permission_key
    and case rp.level when 'view' then 1 when 'create' then 2 when 'edit' then 3 when 'approve' then 4 when 'delete' then 5 when 'manage' then 6 else 0 end
        >= case minimum_level when 'view' then 1 when 'create' then 2 when 'edit' then 3 when 'delete' then 5 else 6 end
   )
  )
 );
$$;
revoke all on function private.phase1_staff_permission(uuid,text,text) from public,anon;
grant execute on function private.phase1_staff_permission(uuid,text,text) to authenticated;

create table if not exists public.service_request_events (
 id uuid primary key default gen_random_uuid(), company_id uuid not null references public.companies(id),
 request_id uuid not null references public.service_requests(id) on delete cascade,
 actor_id uuid references public.users(id), event_type text not null,
 body text, attachment_path text, attachment_name text, created_at timestamptz not null default now()
);
create index if not exists service_request_events_request_idx on public.service_request_events(request_id,created_at);
alter table public.service_request_events enable row level security;
revoke all on public.service_request_events from public,anon,authenticated;
grant select on public.service_request_events to authenticated;
create policy phase1_request_events_read on public.service_request_events for select to authenticated using (
 exists(select 1 from public.service_requests sr where sr.id=request_id and sr.company_id=service_request_events.company_id
 and (private.phase1_client_member(sr.company_id,sr.client_id) or private.phase1_staff_permission(sr.company_id,'client_portal')))
);

-- Replace company-wide client request visibility with a client boundary.
drop policy if exists sr_sel on public.service_requests;
create policy phase1_request_read on public.service_requests for select to authenticated using (
 private.phase1_client_member(company_id,client_id) or private.phase1_staff_permission(company_id,'client_portal')
);
drop policy if exists sr_cli_ins on public.service_requests;
create policy phase1_request_insert on public.service_requests for insert to authenticated with check (
 (private.phase1_client_member(company_id,client_id,true) and requester_id=auth.uid() and status='submitted'
  and internal_notes is null and assigned_to is null and resolution is null and closed_at is null
  and (site_id is null or exists(select 1 from public.sites s where s.id=site_id and s.company_id=service_requests.company_id and s.client_id=service_requests.client_id)))
 or private.phase1_staff_permission(company_id,'client_portal','create')
);
drop policy if exists sr_req_upd on public.service_requests;
drop policy if exists sr_cmp_upd on public.service_requests;
create policy phase1_request_staff_update on public.service_requests for update to authenticated
 using(private.phase1_staff_permission(company_id,'client_portal','edit')) with check(private.phase1_staff_permission(company_id,'client_portal','edit'));

create or replace function private.phase1_request_action(p_request_id uuid,p_action text,p_body text default null,p_attachment_path text default null,p_attachment_name text default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare sr public.service_requests%rowtype; new_status text;
begin
 if auth.uid() is null then raise exception 'Authentication required' using errcode='42501'; end if;
 select * into sr from public.service_requests where id=p_request_id for update;
 if not found or not (private.phase1_client_member(sr.company_id,sr.client_id,true) or private.phase1_staff_permission(sr.company_id,'client_portal','edit')) then raise exception 'Request unavailable' using errcode='42501'; end if;
 if p_action='message' then
  if sr.status in ('closed','completed','canceled','declined') then raise exception 'Reopen the request before adding a message'; end if;
  if (nullif(trim(p_body),'') is null and p_attachment_path is null) or length(coalesce(p_body,''))>2000 then raise exception 'Invalid message'; end if;
  if p_attachment_path is not null and (p_attachment_path not like sr.company_id::text||'/'||sr.id::text||'/%' or not exists(select 1 from storage.objects o where o.bucket_id='service-request-attachments' and o.name=p_attachment_path and o.owner_id=auth.uid()::text)) then raise exception 'Attachment unavailable' using errcode='42501'; end if;
  insert into public.service_request_events(company_id,request_id,actor_id,event_type,body,attachment_path,attachment_name)
  values(sr.company_id,sr.id,auth.uid(),'message',nullif(trim(p_body),''),p_attachment_path,left(p_attachment_name,255));
 elsif p_action in ('close','reopen') then
  if p_action='close' and sr.status in ('closed','completed','canceled','declined') then raise exception 'Request already closed'; end if;
  if p_action='reopen' and sr.status not in ('closed','completed','canceled','declined') then raise exception 'Request is already open'; end if;
  new_status:=case p_action when 'close' then 'closed' else 'submitted' end;
  update public.service_requests set status=new_status,closed_at=case when p_action='close' then now() else null end,updated_at=now() where id=sr.id;
 else raise exception 'Invalid action'; end if;
 return jsonb_build_object('ok',true);
end;
$$;
revoke all on function private.phase1_request_action(uuid,text,text,text,text) from public,anon;
grant execute on function private.phase1_request_action(uuid,text,text,text,text) to authenticated;
create or replace function public.client_service_request_action(p_request_id uuid,p_action text,p_body text default null,p_attachment_path text default null,p_attachment_name text default null)
returns jsonb language sql security invoker set search_path='' as $$ select private.phase1_request_action(p_request_id,p_action,p_body,p_attachment_path,p_attachment_name); $$;
revoke all on function public.client_service_request_action(uuid,text,text,text,text) from public,anon;
grant execute on function public.client_service_request_action(uuid,text,text,text,text) to authenticated;

-- Trigger-only history writer. Clients cannot invent status history.
create or replace function private.phase1_request_history() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if TG_OP='INSERT' or new.status is distinct from old.status then
  insert into public.service_request_events(company_id,request_id,actor_id,event_type,body)
  values(new.company_id,new.id,auth.uid(),case when TG_OP='INSERT' then 'submitted' else 'status_change' end,
  case when TG_OP='INSERT' then 'Request submitted' else coalesce(old.status,'unknown')||' → '||coalesce(new.status,'unknown') end);
 end if;
 if TG_OP='UPDATE' and new.resolution is distinct from old.resolution and new.resolution is not null then
  insert into public.service_request_events(company_id,request_id,actor_id,event_type,body) values(new.company_id,new.id,auth.uid(),'resolution',new.resolution);
 end if;
 return new;
end;
$$;
revoke all on function private.phase1_request_history() from public,anon,authenticated;
drop trigger if exists phase1_request_history on public.service_requests;
create trigger phase1_request_history after insert or update on public.service_requests for each row execute function private.phase1_request_history();

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('service-request-attachments','service-request-attachments',false,10485760,array['application/pdf','image/jpeg','image/png']) on conflict(id) do nothing;
create policy phase1_request_file_read on storage.objects for select to authenticated using (
 bucket_id='service-request-attachments' and exists(select 1 from public.service_requests sr
 where sr.company_id::text=(storage.foldername(name))[1] and sr.id::text=(storage.foldername(name))[2]
 and (private.phase1_client_member(sr.company_id,sr.client_id) or private.phase1_staff_permission(sr.company_id,'client_portal')))
);
create policy phase1_request_file_insert on storage.objects for insert to authenticated with check (
 bucket_id='service-request-attachments' and exists(select 1 from public.service_requests sr
 where sr.company_id::text=(storage.foldername(name))[1] and sr.id::text=(storage.foldername(name))[2]
 and private.phase1_client_member(sr.company_id,sr.client_id,true))
);
create policy phase1_request_file_cleanup on storage.objects for delete to authenticated using (
 bucket_id='service-request-attachments' and owner_id=auth.uid()::text
 and not exists(select 1 from public.service_request_events e where e.attachment_path=name)
);

-- Published operational invoices only; drafts remain invisible to clients.
drop policy if exists "Client view own invoices" on public.client_invoices;
create policy phase1_invoice_client_read on public.client_invoices for select to authenticated using (
 private.phase1_client_member(company_id,client_id) and status in ('issued','viewed','partially_paid','paid','overdue','disputed','void')
);
create policy phase1_invoice_lines_client_read on public.billing_run_lines for select to authenticated using (
 exists(select 1 from public.client_invoices i where i.billing_run_id=billing_run_lines.billing_run_id and i.company_id=billing_run_lines.company_id
 and i.client_id=billing_run_lines.client_id and private.phase1_client_member(i.company_id,i.client_id)
 and i.status in ('issued','viewed','partially_paid','paid','overdue','disputed','void'))
);
create policy phase1_payment_allocation_client_read on public.payment_allocations for select to authenticated using (
 exists(select 1 from public.client_invoices i where i.id=invoice_id and i.company_id=payment_allocations.company_id and private.phase1_client_member(i.company_id,i.client_id)
 and i.status in ('issued','viewed','partially_paid','paid','overdue','disputed','void'))
);
drop policy if exists "Company access client_payments" on public.client_payments;
create policy phase1_payment_staff on public.client_payments for all to authenticated using(private.phase1_staff_permission(company_id,'billing')) with check(private.phase1_staff_permission(company_id,'billing','edit'));
drop policy if exists "Company access payment_allocations" on public.payment_allocations;
create policy phase1_allocation_staff on public.payment_allocations for all to authenticated using(private.phase1_staff_permission(company_id,'billing')) with check(private.phase1_staff_permission(company_id,'billing','edit'));
create policy phase1_invoice_staff_read on public.client_invoices for select to authenticated using(private.phase1_staff_permission(company_id,'billing'));
create policy phase1_invoice_lines_staff_read on public.billing_run_lines for select to authenticated using(private.phase1_staff_permission(company_id,'billing'));
create policy phase1_payment_client_read on public.client_payments for select to authenticated using(private.phase1_client_member(company_id,client_id));

-- Query submission and client-safe query reads. Internal finance notes stay staff-only.
drop policy if exists "Company access client_invoice_disputes" on public.client_invoice_disputes;
create policy phase1_invoice_dispute_staff on public.client_invoice_disputes for all to authenticated
 using(private.phase1_staff_permission(company_id,'billing')) with check(private.phase1_staff_permission(company_id,'billing','edit'));
create or replace function private.phase1_invoice_queries(p_invoice_id uuid,p_reason text default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare inv public.client_invoices%rowtype; result jsonb;
begin
 if auth.uid() is null then raise exception 'Authentication required' using errcode='42501'; end if;
 select * into inv from public.client_invoices where id=p_invoice_id;
 if not found or not private.phase1_client_member(inv.company_id,inv.client_id) or inv.status not in ('issued','viewed','partially_paid','paid','overdue','disputed','void') then raise exception 'Invoice unavailable' using errcode='42501'; end if;
 if p_reason is not null then
  if not private.phase1_client_member(inv.company_id,inv.client_id,true) or length(trim(p_reason))<10 or length(p_reason)>2000 then raise exception 'Invalid invoice query' using errcode='42501'; end if;
  insert into public.client_invoice_disputes(company_id,invoice_id,client_id,reason,submitted_by)
  values(inv.company_id,inv.id,inv.client_id,trim(p_reason),auth.uid());
 end if;
 select coalesce(jsonb_agg(jsonb_build_object('id',d.id,'reason',d.reason,'status',d.status,'created_at',d.created_at,'client_visible_response',d.client_visible_response) order by d.created_at desc),'[]'::jsonb)
 into result from public.client_invoice_disputes d where d.invoice_id=inv.id and d.company_id=inv.company_id and d.client_id=inv.client_id;
 return result;
end;
$$;
revoke all on function private.phase1_invoice_queries(uuid,text) from public,anon;
grant execute on function private.phase1_invoice_queries(uuid,text) to authenticated;
create or replace function public.client_invoice_queries(p_invoice_id uuid,p_reason text default null)
returns jsonb language sql security invoker set search_path='' as $$ select private.phase1_invoice_queries(p_invoice_id,p_reason); $$;
revoke all on function public.client_invoice_queries(uuid,text) from public,anon;
grant execute on function public.client_invoice_queries(uuid,text) to authenticated;

create table if not exists public.shift_history (
 id uuid primary key default gen_random_uuid(),company_id uuid not null references public.companies(id),shift_id uuid not null,
 actor_id uuid references public.users(id),event_type text not null,changes jsonb not null default '{}',created_at timestamptz not null default now()
);
create index if not exists shift_history_shift_idx on public.shift_history(company_id,shift_id,created_at);
alter table public.shift_history enable row level security;
revoke all on public.shift_history from public,anon,authenticated;
grant select on public.shift_history to authenticated;
create policy phase1_shift_history_read on public.shift_history for select to authenticated using(private.phase1_staff_permission(company_id,'rotas'));
create or replace function private.phase1_shift_history() returns trigger language plpgsql security definer set search_path='' as $$
declare changes jsonb;
begin
 if TG_OP='DELETE' then
  insert into public.shift_history(company_id,shift_id,actor_id,event_type,changes) values(old.company_id,old.id,auth.uid(),'deleted','{}');return old;
 end if;
 if TG_OP='INSERT' then changes=jsonb_build_object('site_id',new.site_id,'guard_id',new.guard_id,'start_time',new.start_time,'end_time',new.end_time,'status',new.status);
 else
  select coalesce(jsonb_object_agg(n.key,jsonb_build_object('before',o.value,'after',n.value)),'{}'::jsonb) into changes
  from jsonb_each(to_jsonb(new)) n join jsonb_each(to_jsonb(old)) o on o.key=n.key
  where n.value is distinct from o.value and n.key in ('site_id','guard_id','start_time','end_time','status','shift_type','notes');
 end if;
 if TG_OP='INSERT' or changes<>'{}'::jsonb then
  insert into public.shift_history(company_id,shift_id,actor_id,event_type,changes)
  values(new.company_id,new.id,auth.uid(),case when TG_OP='INSERT' then 'created' when new.status='cancelled' and old.status is distinct from new.status then 'cancelled' when old.guard_id is distinct from new.guard_id then 'reassigned' else 'updated' end,changes);
 end if;
 return new;
end;
$$;
revoke all on function private.phase1_shift_history() from public,anon,authenticated;
drop trigger if exists phase1_shift_history on public.shifts;
create trigger phase1_shift_history after insert or update or delete on public.shifts for each row execute function private.phase1_shift_history();

create table if not exists public.shift_acknowledgements(
 id uuid primary key default gen_random_uuid(),company_id uuid not null references public.companies(id),shift_id uuid not null references public.shifts(id) on delete cascade,
 guard_id uuid not null references public.guards(id),acknowledged_at timestamptz not null default now(),unique(shift_id,guard_id)
);
alter table public.shift_acknowledgements enable row level security;
revoke all on public.shift_acknowledgements from public,anon,authenticated;
grant select,insert on public.shift_acknowledgements to authenticated;
create policy phase1_shift_ack_read on public.shift_acknowledgements for select to authenticated using (
 private.phase1_staff_permission(company_id,'rotas') or exists(select 1 from public.guards g where g.id=guard_id and g.user_id=auth.uid() and g.company_id=shift_acknowledgements.company_id)
);
create policy phase1_shift_ack_insert on public.shift_acknowledgements for insert to authenticated with check (
 exists(select 1 from public.shifts s join public.guards g on g.id=s.guard_id where s.id=shift_id and s.guard_id=shift_acknowledgements.guard_id
 and s.company_id=shift_acknowledgements.company_id and g.company_id=s.company_id and g.user_id=auth.uid() and s.status<>'cancelled')
);

-- Ensure Data API privileges accompany RLS for the existing finance records.
grant select on public.client_invoices,public.billing_run_lines,public.payment_allocations,public.client_payments to authenticated;
