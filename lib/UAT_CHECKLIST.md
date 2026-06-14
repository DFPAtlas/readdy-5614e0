# QuickGuard UAT Checklist

Use this checklist during User Acceptance Testing. Mark each item PASS or FAIL with notes.

---

## 1. Guard Registration

- [ ] Navigate to guard signup page
- [ ] Fill in all required fields (name, email, password, company)
- [ ] Submit registration
- [ ] Verify account is created
- [ ] Verify automatic redirect to guard dashboard
- [ ] Check welcome email arrives within 5 minutes (check spam)

**Notes:** ________________________________

---

## 2. Client Registration

- [ ] Navigate to client signup page
- [ ] Fill in all required fields
- [ ] Submit registration
- [ ] Verify account is created
- [ ] Verify redirect to client portal
- [ ] Check welcome email arrives within 5 minutes

**Notes:** ________________________________

---

## 3. Admin Login

- [ ] Navigate to admin login page
- [ ] Enter super-admin credentials
- [ ] Verify successful login
- [ ] Verify redirect to admin dashboard
- [ ] Verify all admin nav items visible
- [ ] Attempt login with non-admin account — must be rejected

**Notes:** ________________________________

---

## 4. Guard Profile Completion

- [ ] Login as guard
- [ ] Navigate to profile/settings
- [ ] Upload profile photo
- [ ] Fill in personal details
- [ ] Add certifications
- [ ] Save and verify data persists on reload

**Notes:** ________________________________

---

## 5. SIA Verification Upload

- [ ] Login as guard
- [ ] Navigate to SIA verification section
- [ ] Upload SIA licence document/image
- [ ] Verify upload completes successfully
- [ ] Verify status shows "pending verification"
- [ ] Login as admin, find the guard, verify SIA document is visible
- [ ] Approve the SIA verification
- [ ] Login as guard, verify status now shows "verified"

**Notes:** ________________________________

---

## 6. Client Job Posting

- [ ] Login as client
- [ ] Navigate to job posting section
- [ ] Create a new job post (title, description, requirements, dates, site)
- [ ] Verify job appears in active listings
- [ ] Edit the job post
- [ ] Verify changes are saved
- [ ] Close the job post
- [ ] Verify job moves to closed/inactive

**Notes:** ________________________________

---

## 7. Guard Job Application

- [ ] Login as guard
- [ ] Browse available jobs
- [ ] Apply for a job
- [ ] Verify application is submitted
- [ ] View application status
- [ ] Withdraw an application
- [ ] Verify withdrawal is processed

**Notes:** ________________________________

---

## 8. Client Selects Guard

- [ ] Login as client
- [ ] Navigate to job applicants list
- [ ] View guard profiles and applications
- [ ] Select a guard for the job
- [ ] Verify guard is assigned
- [ ] Login as guard, verify assignment notification

**Notes:** ________________________________

---

## 9. Stripe Subscription Checkout

- [ ] Login as ops/company admin
- [ ] Navigate to Pricing page
- [ ] Select a plan (Sentinel / Command)
- [ ] Choose billing period (monthly / yearly)
- [ ] Click checkout — verify redirect to Stripe
- [ ] Enter test card: 4242 4242 4242 4242, any future expiry, any CVC
- [ ] Complete checkout — verify redirect back to app
- [ ] Verify success page shows correct plan
- [ ] Navigate to Billing Settings — verify subscription status is "active"
- [ ] Verify plan features are unlocked

**Notes:** ________________________________

---

## 10. Stripe Webhook Verification

- [ ] After subscription checkout, verify webhook processed:
- [ ] Check billing_webhook_events table has entry with processed_at set
- [ ] Check companies table has correct subscription_status, stripe_subscription_id, stripe_customer_id
- [ ] Check billing_subscription_events has event logged
- [ ] Check company_enabled_modules has correct modules enabled for plan
- [ ] Trigger a payment failure (or use webhook-test tool) — verify status goes to past_due
- [ ] Trigger subscription cancellation — verify status goes to canceled

**Notes:** ________________________________

---

## 11. Email Notifications

- [ ] Verify welcome email after registration (guard and client)
- [ ] Verify password reset email (see section 12)
- [ ] Verify notification emails for incidents/alerts
- [ ] Check notification preferences in settings
- [ ] Disable email notifications — verify no emails received
- [ ] Re-enable — verify emails resume

**Notes:** ________________________________

---

## 12. Password Reset

- [ ] Navigate to login page
- [ ] Click "Forgot password"
- [ ] Enter registered email
- [ ] Check inbox for reset link
- [ ] Click reset link
- [ ] Enter new password
- [ ] Verify new password works for login
- [ ] Verify old password no longer works

**Notes:** ________________________________

---

## 13. Feature Gating

- [ ] Login with a free/trial account (no subscription)
- [ ] Navigate to premium features (AI assistant, client portal, patrols, SOP builder)
- [ ] Verify "Upgrade Required" popup appears
- [ ] Verify locked nav items are dimmed with lock icon
- [ ] Subscribe to a paid plan
- [ ] Verify all features are now accessible
- [ ] Cancel subscription — verify features re-lock after period ends

**Notes:** ________________________________

---

## 14. Upgrade Popup

- [ ] Click a locked nav item in dashboard
- [ ] Verify UpgradeRequiredModal opens
- [ ] Verify modal shows plan options and pricing
- [ ] Click "Choose a Plan" — verify redirect to pricing
- [ ] Close modal — verify normal app state resumes

**Notes:** ________________________________

---

## 15. Dashboard Live Data

- [ ] Login as ops/company admin
- [ ] Verify KPI cards show real data (not zeros, not mock)
- [ ] Verify site status grid reflects actual sites
- [ ] Verify guard status widget shows real guard data
- [ ] Verify incident widget shows real incidents
- [ ] Verify patrol widget shows real patrol data
- [ ] Verify week-at-glance shows this week's shifts
- [ ] Verify live occurrence feed shows real entries
- [ ] Add a new site — verify it appears on dashboard
- [ ] Add a guard — verify count updates

**Notes:** ________________________________

---

## 16. Complaint Flow

- [ ] Login as client
- [ ] Navigate to support/contact
- [ ] Submit a complaint/issue
- [ ] Verify confirmation message
- [ ] Login as admin
- [ ] Navigate to support tickets
- [ ] Find the submitted complaint
- [ ] Update ticket status
- [ ] Add response
- [ ] Login as client — verify response is visible

**Notes:** ________________________________

---

## 17. Mobile View Test

- [ ] Open app on mobile device or browser dev tools mobile view
- [ ] Verify login page is usable on mobile
- [ ] Verify guard portal (bottom nav) works on mobile
- [ ] Verify client portal is responsive
- [ ] Verify dashboard cards stack properly
- [ ] Verify forms are usable with mobile keyboard
- [ ] Verify buttons are large enough to tap
- [ ] Verify no horizontal overflow

**Notes:** ________________________________

---

## 18. Plan Change Flow

- [ ] Navigate to Billing Settings
- [ ] Click "Change Plan"
- [ ] Verify warning notice appears: "To change plan, your current subscription will be cancelled..."
- [ ] Select a different plan
- [ ] Verify checkout redirects to Stripe
- [ ] Complete checkout with test card
- [ ] Verify new plan is active, old plan replaced

**Notes:** ________________________________

---

## Summary

| # | Test | Result | Tester |
|---|------|--------|--------|
| 1 | Guard Registration | ⬜ | |
| 2 | Client Registration | ⬜ | |
| 3 | Admin Login | ⬜ | |
| 4 | Guard Profile | ⬜ | |
| 5 | SIA Verification | ⬜ | |
| 6 | Client Job Posting | ⬜ | |
| 7 | Guard Job Application | ⬜ | |
| 8 | Client Selects Guard | ⬜ | |
| 9 | Stripe Checkout | ⬜ | |
| 10 | Stripe Webhooks | ⬜ | |
| 11 | Email Notifications | ⬜ | |
| 12 | Password Reset | ⬜ | |
| 13 | Feature Gating | ⬜ | |
| 14 | Upgrade Popup | ⬜ | |
| 15 | Dashboard Live Data | ⬜ | |
| 16 | Complaint Flow | ⬜ | |
| 17 | Mobile View | ⬜ | |
| 18 | Plan Change Flow | ⬜ | |

**Date tested:** _______________

**Tester name:** _______________

**Overall result:** PASS / FAIL (circle one)

**Blockers:** ________________________________