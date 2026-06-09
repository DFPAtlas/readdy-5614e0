'use client';

import { useState } from 'react';

export default function AIIntegrationSettings() {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
              <i className="ri-openai-line text-white text-lg"></i>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">OpenAI Configuration</h2>
              <p className="text-sm text-gray-500">AI features are centrally managed by platform administrators</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <i className="ri-shield-star-line text-amber-600"></i>
              <p className="text-sm text-amber-800">
                AI API keys are managed in the <strong>Super Admin Settings</strong> area. Contact your platform administrator if AI features need configuration.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">AI Modules</h2>
          <p className="text-sm text-gray-500">Six Guardian Hub AI automation modules and their current status</p>
        </div>
        <div className="p-6 space-y-4">
          {[
            { name: 'Module 1 — Support Ticket AI Triage', desc: 'Auto-categorises and routes support tickets', active: true },
            { name: 'Module 2 — Incident Report Checker', desc: 'Flags missing details and severity mismatches in incident reports', active: true },
            { name: 'Module 3 — Daily Site Summary', desc: 'Generates daily patrol, incident, and guard status summaries', active: true },
            { name: 'Module 4 — SOP and Risk Assessment Builder', desc: 'AI-powered SOP creation and risk assessment templates', active: true },
            { name: 'Module 5 — Compliance Monitor', desc: 'Tracks licence expiry, training certs, and compliance scores', active: true },
            { name: 'Module 6 — AI Rota Helper', desc: 'Suggests guards for open shifts, manages sick cover, and balances overtime', active: true },
          ].map((feature) => (
            <div key={feature.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">{feature.name}</h4>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${feature.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                {feature.active ? 'Enabled' : 'Coming Soon'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">AI Rota Helper — Output Requirements</h2>
          <p className="text-sm text-gray-500">All AI rota suggestions must include these fields</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              'module_name = ai_rota_helper',
              'company_id',
              'site_id (if relevant)',
              'shift_id (if relevant)',
              'suggested_guard_id (if relevant)',
              'confidence_score',
              'reasoning',
              'warnings',
              'requires_human_review = true',
              'created_at',
            ].map((field) => (
              <div key={field} className="flex items-center gap-2 text-sm text-gray-700">
                <span className="w-4 h-4 flex items-center justify-center text-emerald-500">
                  <i className="ri-checkbox-circle-line text-xs"></i>
                </span>
                {field}
              </div>
            ))}
          </div>
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-sm text-amber-800">
              <strong>Review threshold:</strong> If confidence is below 80%, the suggestion is automatically flagged as <em>Needs Review</em> and cannot be bulk-approved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}