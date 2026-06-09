'use client';

import { SOPFormData, getSOPTypeLabel } from '@/lib/useBuiltSOPs';

export function generateSOPContent(formData: SOPFormData, meta: {
  sopReference: string;
  version: number;
  createdBy: string;
  createdAt: string;
  status: string;
}): string {
  const sections: string[] = [];

  sections.push(`
    <div class="sop-header">
      <div class="sop-brand">
        <img src="https://storage.readdy-site.link/project_files/18288eee-63fa-4165-a658-6aa7ab020255/0f55097c-53e5-494b-b419-876152a51ee7_edited_image_d3fb89d4-4c94-480b-911a-a4f5576d177c_0.png?v=4a5cb4d0eb32cb9bee8b5acd1d9f9fa6" alt="GuardianHub" class="sop-logo" />
        <div class="sop-brand-text">
          <h1 class="sop-brand-name">GuardianHub</h1>
          <p class="sop-brand-sub">Standard Operating Procedure</p>
        </div>
      </div>
      <div class="sop-meta">
        <div class="sop-meta-row"><span class="sop-meta-label">SOP Ref:</span><span class="sop-meta-value">${meta.sopReference}</span></div>
        <div class="sop-meta-row"><span class="sop-meta-label">Version:</span><span class="sop-meta-value">${meta.version}</span></div>
        <div class="sop-meta-row"><span class="sop-meta-label">Status:</span><span class="sop-meta-value sop-status-${meta.status.toLowerCase().replace(/\s/g, '-')}">${meta.status}</span></div>
        <div class="sop-meta-row"><span class="sop-meta-label">Created:</span><span class="sop-meta-value">${new Date(meta.createdAt).toLocaleDateString('en-GB')}</span></div>
        <div class="sop-meta-row"><span class="sop-meta-label">Created By:</span><span class="sop-meta-value">${meta.createdBy}</span></div>
        ${formData.review_date ? `<div class="sop-meta-row"><span class="sop-meta-label">Review Date:</span><span class="sop-meta-value">${new Date(formData.review_date).toLocaleDateString('en-GB')}</span></div>` : ''}
      </div>
    </div>
  `);

  sections.push(`
    <div class="sop-title-section">
      <h1 class="sop-doc-title">${escapeHtml(formData.title || getSOPTypeLabel(formData.sop_type))}</h1>
      <p class="sop-doc-subtitle">${getSOPTypeLabel(formData.sop_type)}</p>
      ${formData.client_name ? `<p class="sop-doc-client">Client: ${escapeHtml(formData.client_name)}</p>` : ''}
      ${formData.guard_role ? `<p class="sop-doc-role">Role: ${escapeHtml(formData.guard_role)}${formData.shift_type ? ` &middot; ${escapeHtml(formData.shift_type)}` : ''}</p>` : ''}
    </div>
  `);

  if (formData.purpose) {
    sections.push(makeSection('1. Purpose', `<p class="sop-para">${escapeHtml(formData.purpose)}</p>`));
  }

  if (formData.scope) {
    sections.push(makeSection('2. Scope', `<p class="sop-para">${escapeHtml(formData.scope)}</p>`));
  }

  if (formData.roles.length > 0) {
    const rows = formData.roles.map((r, i) => `
      <tr>
        <td class="sop-td sop-td-num">${i + 1}</td>
        <td class="sop-td sop-td-bold">${escapeHtml(r.role)}</td>
        <td class="sop-td">${escapeHtml(r.responsibility)}</td>
      </tr>
    `).join('');
    sections.push(makeSection('3. Roles & Responsibilities', `
      <table class="sop-table">
        <thead><tr><th class="sop-th sop-th-narrow">#</th><th class="sop-th">Role</th><th class="sop-th">Responsibility</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `));
  }

  if (formData.equipment.length > 0) {
    const list = formData.equipment.map((e) => `<li class="sop-li"><div class="w-4 h-4 inline-flex items-center justify-center mr-2"><i class="ri-checkbox-circle-line text-blue-500 text-xs"></i></div>${escapeHtml(e)}</li>`).join('');
    sections.push(makeSection('4. Required Equipment', `<ul class="sop-ul">${list}</ul>`));
  }

  if (formData.procedure_steps.length > 0) {
    const steps = formData.procedure_steps.map((s) => `
      <div class="sop-step">
        <div class="sop-step-header">
          <div class="sop-step-num">${s.step}</div>
          <span class="sop-step-label">Step ${s.step}</span>
        </div>
        <p class="sop-step-instruction">${escapeHtml(s.instruction)}</p>
        ${s.expectedOutcome ? `<p class="sop-step-outcome"><span class="sop-outcome-label">Expected outcome:</span> ${escapeHtml(s.expectedOutcome)}</p>` : ''}
      </div>
    `).join('');
    sections.push(makeSection('5. Procedure', steps));
  }

  if (formData.risks_controls.length > 0) {
    const rows = formData.risks_controls.map((r, i) => `
      <tr>
        <td class="sop-td sop-td-num">${i + 1}</td>
        <td class="sop-td sop-td-risk">${escapeHtml(r.risk)}</td>
        <td class="sop-td sop-td-control">${escapeHtml(r.control)}</td>
      </tr>
    `).join('');
    sections.push(makeSection('6. Risks & Controls', `
      <table class="sop-table">
        <thead><tr><th class="sop-th sop-th-narrow">#</th><th class="sop-th">Risk / Hazard</th><th class="sop-th">Control Measure</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `));
  }

  if (formData.ppe || formData.health_safety_notes) {
    let content = '';
    if (formData.ppe) {
      content += `<p class="sop-para sop-para-bold">Required PPE:</p><p class="sop-para">${escapeHtml(formData.ppe)}</p>`;
    }
    if (formData.health_safety_notes) {
      content += `<p class="sop-para sop-para-bold mt-4">Health & Safety Notes:</p><p class="sop-para">${escapeHtml(formData.health_safety_notes)}</p>`;
    }
    sections.push(makeSection('7. Health & Safety', content));
  }

  if (formData.emergency_contacts.length > 0) {
    const rows = formData.emergency_contacts.map((c) => `
      <tr>
        <td class="sop-td sop-td-bold">${escapeHtml(c.name)}</td>
        <td class="sop-td">${escapeHtml(c.role)}</td>
        <td class="sop-td sop-td-phone">${escapeHtml(c.phone)}</td>
      </tr>
    `).join('');
    sections.push(makeSection('8. Emergency Contacts', `
      <table class="sop-table">
        <thead><tr><th class="sop-th">Name</th><th class="sop-th">Role</th><th class="sop-th">Phone</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `));
  }

  if (formData.escalation_procedure) {
    sections.push(makeSection('9. Escalation Procedure', `<p class="sop-para">${escapeHtml(formData.escalation_procedure).replace(/\n/g, '</p><p class="sop-para">')}</p>`));
  }

  if (formData.reporting_requirements) {
    sections.push(makeSection('10. Reporting Requirements', `<p class="sop-para">${escapeHtml(formData.reporting_requirements).replace(/\n/g, '</p><p class="sop-para">')}</p>`));
  }

  if (formData.guard_acknowledgement_statement) {
    sections.push(makeSection('11. Guard Acknowledgement', `
      <div class="sop-ack-box">
        <p class="sop-para sop-para-bold">All guards must read and confirm the following:</p>
        <p class="sop-para sop-ack-statement">${escapeHtml(formData.guard_acknowledgement_statement)}</p>
        <div class="sop-ack-signature">
          <div class="sop-ack-line">Guard Signature / Confirmation</div>
          <div class="sop-ack-line">Date</div>
        </div>
      </div>
    `));
  }

  sections.push(`
    <div class="sop-footer">
      <p class="sop-footer-text">This document is the property of GuardianHub and must not be shared externally.</p>
      <p class="sop-footer-text">Any unauthorised reproduction or distribution is strictly prohibited.</p>
    </div>
  `);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1f2937; background: #fff; line-height: 1.6; font-size: 14px; }
    .sop-page { max-width: 800px; margin: 0 auto; padding: 40px; }
    .sop-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #1d4ed8; padding-bottom: 20px; margin-bottom: 30px; }
    .sop-brand { display: flex; align-items: center; gap: 12px; }
    .sop-logo { height: 40px; width: auto; }
    .sop-brand-name { font-size: 20px; font-weight: 700; color: #1d4ed8; }
    .sop-brand-sub { font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }
    .sop-meta { text-align: right; }
    .sop-meta-row { display: flex; justify-content: flex-end; gap: 8px; margin-bottom: 4px; }
    .sop-meta-label { font-size: 11px; color: #6b7280; font-weight: 500; }
    .sop-meta-value { font-size: 11px; color: #374151; font-weight: 600; }
    .sop-status-draft { color: #9ca3af; }
    .sop-status-in-review { color: #f59e0b; }
    .sop-status-approved { color: #10b981; }
    .sop-status-published { color: #1d4ed8; }
    .sop-status-archived { color: #6b7280; }
    .sop-title-section { margin-bottom: 30px; text-align: center; }
    .sop-doc-title { font-size: 26px; font-weight: 700; color: #111827; margin-bottom: 6px; }
    .sop-doc-subtitle { font-size: 14px; color: #4b5563; font-weight: 500; margin-bottom: 4px; }
    .sop-doc-client, .sop-doc-role { font-size: 12px; color: #6b7280; }
    .sop-section { margin-bottom: 28px; }
    .sop-section-title { font-size: 15px; font-weight: 700; color: #1d4ed8; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 1px solid #e5e7eb; }
    .sop-para { font-size: 13px; color: #374151; margin-bottom: 10px; }
    .sop-para-bold { font-weight: 600; color: #111827; }
    .sop-table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 8px; }
    .sop-th { background: #f3f4f6; color: #374151; font-weight: 600; text-align: left; padding: 10px 12px; border: 1px solid #e5e7eb; }
    .sop-th-narrow { width: 40px; text-align: center; }
    .sop-td { padding: 10px 12px; border: 1px solid #e5e7eb; color: #374151; }
    .sop-td-num { text-align: center; font-weight: 700; color: #1d4ed8; width: 40px; }
    .sop-td-bold { font-weight: 600; color: #111827; }
    .sop-td-risk { color: #dc2626; }
    .sop-td-control { color: #059669; }
    .sop-td-phone { font-family: ui-monospace, SFMono-Regular, monospace; color: #4b5563; }
    .sop-ul { list-style: none; padding: 0; }
    .sop-li { display: flex; align-items: center; gap: 6px; padding: 6px 0; font-size: 13px; color: #374151; border-bottom: 1px solid #f3f4f6; }
    .sop-step { background: #f9fafb; border-radius: 8px; padding: 16px; margin-bottom: 12px; border: 1px solid #e5e7eb; }
    .sop-step-header { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
    .sop-step-num { width: 28px; height: 28px; background: #1d4ed8; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; }
    .sop-step-label { font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }
    .sop-step-instruction { font-size: 13px; color: #374151; margin-bottom: 6px; }
    .sop-step-outcome { font-size: 12px; color: #6b7280; font-style: italic; }
    .sop-outcome-label { font-weight: 600; color: #4b5563; font-style: normal; }
    .sop-ack-box { background: #fefce8; border: 1px solid #fde047; border-radius: 8px; padding: 16px; }
    .sop-ack-statement { font-style: italic; color: #713f12; margin: 8px 0; }
    .sop-ack-signature { display: flex; gap: 40px; margin-top: 16px; }
    .sop-ack-line { flex: 1; border-top: 1px solid #d1d5db; padding-top: 6px; font-size: 11px; color: #6b7280; text-align: center; }
    .sop-footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; }
    .sop-footer-text { font-size: 10px; color: #9ca3af; margin-bottom: 4px; }
    .mt-4 { margin-top: 16px; }
  </style>
</head>
<body>
  <div class="sop-page">${sections.join('')}</div>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function makeSection(title: string, content: string): string {
  return `<div class="sop-section"><h2 class="sop-section-title">${title}</h2>${content}</div>`;
}