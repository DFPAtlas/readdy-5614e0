-- GuardianHub Phase 18 reference data (idempotent-ish; safe to re-run if slugs are absent)
insert into public.help_categories (slug, name, description, icon, sort_order)
select * from (values
  ('account-security','Account & Security','Sign in, MFA, sessions and account safety','ri-shield-keyhole-line',1),
  ('company-setup','Company Setup','Onboarding your security company','ri-building-2-line',2),
  ('clients-sites','Clients & Sites','Managing clients and physical sites','ri-briefcase-line',3),
  ('guards-compliance','Guards & Compliance','SIA, vetting and workforce compliance','ri-shield-user-line',4),
  ('scheduling','Scheduling','Rotas, shifts and assignments','ri-calendar-event-line',5),
  ('checkin-patrols','Check-in & Patrols','Clock in, geofencing and patrols','ri-route-line',6),
  ('incidents-sos','Incidents & SOS','Incident reporting and emergency response','ri-alarm-warning-line',7),
  ('timesheets-finance','Timesheets & Finance','Pay, invoices and billing','ri-money-pound-circle-line',8),
  ('client-portal','Client Portal','The client-facing portal','ri-building-line',9),
  ('reports','Reports','Reporting and exports','ri-file-chart-line',10),
  ('integrations-agents','Integrations & Agents','Automation, agents and connectors','ri-robot-2-line',11),
  ('privacy-data','Privacy & Data','GDPR and data protection','ri-lock-line',12),
  ('troubleshooting','Troubleshooting','Common issues and fixes','ri-tools-line',13)
) as v(slug, name, description, icon, sort_order)
where not exists (select 1 from public.help_categories c where c.slug = v.slug);

insert into public.onboarding_programs (name, slug, description, target_roles, version)
select 'GuardianHub Go-Live','guardianhub-go-live','End-to-end launch checklist for security companies', null, '1.0'
where not exists (select 1 from public.onboarding_programs p where p.slug = 'guardianhub-go-live');

insert into public.onboarding_steps (program_id, step_order, title, description, feature_key, is_required, help_article_slug)
select p.id, v.step_order, v.title, v.description, v.feature_key, v.is_required, v.help_slug
from (values
  (1,'Company profile','Legal name, address, timezone and key contacts','company-profile',true,'getting-started-security-company'),
  (2,'Security and account setup','Privileged admins, MFA readiness and emergency contacts','security-account',true,null),
  (3,'Team and roles','Invite your team and assign roles','team-roles',true,null),
  (4,'Clients','Add your first client','clients',true,null),
  (5,'Sites','Add your first site','sites',true,'set-up-your-first-site'),
  (6,'Guards','Add your security guards','guards',true,null),
  (7,'SIA and compliance rules','Record licences and compliance requirements','sia-compliance',true,null),
  (8,'Shift templates','Define your shift patterns','shift-templates',true,null),
  (9,'Notifications','Configure alerts and reminder timings','notifications',true,null),
  (10,'Payroll and billing preferences','Billing, tax and timesheet settings','payroll-billing',true,'billing-and-invoices'),
  (11,'Client portal','Configure client portal access','client-portal',false,'client-portal-overview'),
  (12,'Integrations','Connect Stripe, email, SMS and n8n','integrations',false,'configuring-agents'),
  (13,'Agent configuration','Enable and verify automation agents','agent-configuration',false,'configuring-agents'),
  (14,'Data import','Import guards, clients and sites','data-import',false,null),
  (15,'Training','Assign product training','training',false,null),
  (16,'Go-live review','Confirm launch blockers are cleared','go-live-review',true,null)
) as v(step_order, title, description, feature_key, is_required, help_slug)
cross join public.onboarding_programs p
where p.slug = 'guardianhub-go-live'
  and not exists (select 1 from public.onboarding_steps s where s.program_id = p.id and s.feature_key = v.feature_key);

insert into public.help_articles (slug, title, summary, category_id, category_slug, audience, roles, content, status, is_featured, effective_date, review_date, published_at)
values
('getting-started-security-company','Getting started for security companies','A guided tour of your first day with GuardianHub, from sign in to first shift.',
 (select id from public.help_categories where slug='company-setup'),'company-setup','public',null,
 E'GuardianHub is the command centre for modern security operations. This guide walks through the essentials: signing in, creating your company profile, adding a first site, inviting guards and publishing a first shift.\n\nWe recommend completing the Getting Started checklist in your dashboard. It tracks real data in your account, so progress is only marked complete when the underlying records actually exist.\n\nIf anything is unclear, contact support from the Help Centre. We never fabricate instructions, and our support team can walk you through each step.',
 'published',true,current_date,current_date + interval '90 days',now()),

('set-up-your-first-site','Set up your first site','Create a site, set its risk level and configure geofencing.',
 (select id from public.help_categories where slug='clients-sites'),'clients-sites','authenticated',null,
 E'Sites are the core organisational unit in GuardianHub. Each site represents a physical location your guards protect.\n\nWhen creating a site, set the risk level. This drives default patrol frequency and staffing recommendations. Add the full address so the geofence can be calculated for clock in.\n\nYou can add contacts, documents, patrol checkpoints and instructions later from the site detail page. Keep operating hours and emergency contacts up to date.',
 'published',false,current_date,current_date + interval '90 days',now()),

('guard-mobile-sos-guide','Guard mobile app and SOS','How guards use the mobile app, including the SOS button.',
 (select id from public.help_categories where slug='incidents-sos'),'incidents-sos','role',array['guard'],
 E'The Guard App is the mobile companion for security operatives. It shows upcoming shifts, allows clock in and out, guides patrols and records incidents.\n\nThe SOS button sends an immediate highest-priority alert to the control room with your live location. Press it when you are in danger or need urgent help. A human must always acknowledge and resolve an SOS event; it is never closed automatically.\n\nIf email, SMS, maps or automation are unavailable, the platform still records your SOS event first, then continues alerting through whatever channels remain.',
 'published',true,current_date,current_date + interval '90 days',now()),

('understanding-location-tracking','Understanding location tracking','When location is tracked, why, and how it stops.',
 (select id from public.help_categories where slug='privacy-data'),'privacy-data','role',array['guard'],
 E'GuardianHub tracks your location only during authorised work periods, unless an emergency is active. Routine tracking stops after you clock out.\n\nYou will always see when tracking is active in the app. Location is restricted to operational staff and is never shown to clients unless your company expressly enables it.\n\nIf you deny location permission, the app degrades safely: you can still view shifts and report incidents, but geofenced clock in and live location will not work. Ask your supervisor about the company location transparency notice.',
 'published',false,current_date,current_date + interval '90 days',now()),

('check-in-and-geofencing','Check-in and geofencing','How clock in works and what to do when you are outside the geofence.',
 (select id from public.help_categories where slug='checkin-patrols'),'checkin-patrols','authenticated',null,
 E'Clock in verifies your location against the site geofence. If you are outside the permitted area, the check in is rejected to protect attendance accuracy.\n\nIf you believe the geofence is wrong, contact your control room rather than attempting to override it. Administrators can adjust the radius or approve a manual check in.\n\nLate and missed check ins trigger a configurable escalation flow, starting with the guard and moving to the controller and supervisor if unresolved.',
 'published',false,current_date,current_date + interval '90 days',now()),

('reporting-incidents','Reporting incidents','Capture complete, actionable incident reports.',
 (select id from public.help_categories where slug='incidents-sos'),'incidents-sos','authenticated',null,
 E'A good incident report answers who, what, where, when and why. The incident form prompts for each element so nothing is missed under pressure.\n\nAttach photos directly from the app. They are timestamped and geotagged automatically and form part of the evidence chain.\n\nChoose severity carefully. When unsure, report a higher severity; it is always better to over-report and downgrade than to under-report a serious incident.',
 'published',false,current_date,current_date + interval '90 days',now()),

('client-portal-overview','Client portal overview','What clients see and what stays private.',
 (select id from public.help_categories where slug='client-portal'),'client-portal','role',array['client','client_admin'],
 E'The client portal shows only what your security provider has authorised for your organisation: sites, shift coverage, incidents, reports, contract documents and invoices where permitted.\n\nClients never see internal guard notes, other-client data or sensitive operational detail. Access is scoped per organisation.\n\nIf you cannot see something you expected, contact your security provider rather than GuardianHub directly; visibility is controlled by them.',
 'published',false,current_date,current_date + interval '90 days',now()),

('billing-and-invoices','Billing and invoices','Manage your GuardianHub subscription and customer billing.',
 (select id from public.help_categories where slug='timesheets-finance'),'timesheets-finance','authenticated',null,
 E'Your subscription and payment details live under Settings and Billing. Payments are processed by Stripe; card details are never stored on GuardianHub servers.\n\nCustomer billing preferences, tax details, invoice numbering and payment terms are configured separately from your own subscription. These feed the invoicing workflow.\n\nA failed payment retries automatically and notifies the account owner. Services continue during the retry window.',
 'published',false,current_date,current_date + interval '90 days',now()),

('timesheet-approvals','Timesheet approvals','Approve guard hours and prepare them for pay runs.',
 (select id from public.help_categories where slug='timesheets-finance'),'timesheets-finance','role',array['finance','company_admin'],
 E'Completed shifts generate timesheet lines for approval. Review them for accuracy before approving; the system never creates, approves or alters hours automatically.\n\nApproved timesheets flow into pay runs. Rejected timesheets return to the guard for correction.\n\nFinance users have restricted access: they see finance and timesheet data but not operational or platform settings.',
 'published',false,current_date,current_date + interval '90 days',now()),

('configuring-agents','Configuring automation agents','Enable, verify and monitor GuardianHub automation agents.',
 (select id from public.help_categories where slug='integrations-agents'),'integrations-agents','role',array['company_admin','super_admin'],
 E'GuardianHub agents automate reminders, escalation and reconciliation. Each agent must have its trigger, credentials, permissions and failure handling verified before it is marked ready.\n\nAgents never make high-risk decisions without approval, and they never close or downgrade SOS events.\n\nSee the agent operations console for health, schedules and dead-letter queues. Credentials are stored as secret references, never displayed as plain values.',
 'published',false,current_date,current_date + interval '90 days',now()),

('sso-and-mfa','MFA and account security','Protect privileged accounts with multi-factor authentication.',
 (select id from public.help_categories where slug='account-security'),'account-security','role',array['company_admin','super_admin'],
 E'Privileged operators should enable multi-factor authentication. MFA readiness is tracked as part of the go-live review.\n\nUse separate accounts per person; never share logins. Session and security settings are configured under account settings.\n\nIf you suspect a compromise, change your password immediately and notify your administrator.',
 'published',false,current_date,current_date + interval '90 days',now()),

('data-subject-requests','Data subject requests','How individuals can exercise their data rights.',
 (select id from public.help_categories where slug='privacy-data'),'privacy-data','public',null,
 E'You can request access, rectification, erasure, restriction, objection or portability of your personal data, or withdraw consent, through the privacy request page.\n\nYou do not need to use legal terminology; describe what you want in plain words. We verify your identity before acting.\n\nGuardianHub acts as a processor for most customer-controlled workforce data. Requests about that data are routed to the responsible controller.',
 'published',false,current_date,current_date + interval '90 days',now()),

('troubleshooting-login','Troubleshooting sign in','Common sign in problems and how to resolve them.',
 (select id from public.help_categories where slug='troubleshooting'),'troubleshooting','public',null,
 E'If you cannot sign in, first check your email address and password. Use the forgot password link to reset it.\n\nIf your account is suspended or pending verification, you will see a clear message. Contact your administrator or support.\n\nFor urgent operational issues, use your organisation emergency procedures. Ordinary support tickets are not for real-world emergencies.',
 'published',false,current_date,current_date + interval '90 days',now()),

('reports-and-exports','Reports and exports','Generate and share operational and client reports.',
 (select id from public.help_categories where slug='reports'),'reports','authenticated',null,
 E'Reports pull from live operational data: attendance, patrol completion, incidents and occurrence book entries.\n\nClient-facing reports respect client permissions and never include internal notes or another tenant data.\n\nExports are generated server-side and delivered as short-lived, secure downloads for data subject and compliance requests.',
 'published',false,current_date,current_date + interval '90 days',now());

insert into public.training_assessments (title, pass_mark, max_attempts, is_high_risk, questions, question_version)
values
('SOS Response Knowledge Check',80,3,true,
 '[{"type":"single","question":"When a guard activates SOS, what happens first?","options":["The system waits for email to be available","The event is persisted before any external calls","An AI closes the event","Nothing until a supervisor logs in"],"answer":1,"explanation":"The SOS event is recorded first, then alerts are sent through available channels."},{"type":"multi","question":"Which channels must continue safely if one fails during an SOS?","options":["Email","SMS","Maps","Control room alert"],"answer":[0,1,2,3],"explanation":"Processing continues through every remaining channel when one is unavailable."},{"type":"boolean","question":"An authorised human is required to resolve and close an SOS event.","answer":true,"explanation":"SOS events are never closed or downgraded automatically."},{"type":"single","question":"Who receives the immediate SOS alert?","options":["Only the client","The active controller and configured supervisors","Only the guard","No one"],"answer":1,"explanation":"The active controller is alerted immediately, with supervisors as configured."}]'::jsonb,1),
('Guard Mobile App Basics',75,3,false,
 '[{"type":"single","question":"When does routine location tracking stop?","options":["Never","After clock out","At midnight","Only on weekends"],"answer":1,"explanation":"Routine tracking stops after check out unless an emergency is active."},{"type":"boolean","question":"You can view your shifts and report incidents even if location permission is denied.","answer":true,"explanation":"The app degrades safely without location permission."},{"type":"single","question":"What should you do if the geofence rejects your clock in?","options":["Force the clock in","Contact your control room","Wait until next shift","Ignore it"],"answer":1,"explanation":"Contact your control room; do not attempt to override the geofence."},{"type":"multi","question":"Which actions are part of a shift?","options":["Clock in","Patrol checkpoints","Report incidents","Clock out"],"answer":[0,1,2,3],"explanation":"A shift includes clock in, patrols, incident reporting and clock out."},{"type":"boolean","question":"GuardianHub product training is a formal SIA qualification.","answer":false,"explanation":"Product training is not an SIA qualification or external accreditation."}]'::jsonb,1);