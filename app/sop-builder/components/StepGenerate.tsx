'use client';

import { useState, useCallback } from 'react';
import { SOPFormData, getSOPTypeLabel } from '@/lib/useBuiltSOPs';

interface Props {
  data: SOPFormData;
  onChange: (data: Partial<SOPFormData>) => void;
  onGenerate: () => void;
  generating: boolean;
}

export default function StepGenerate({ data, onGenerate, generating }: Props) {
  const [preview, setPreview] = useState(false);

  const buildSummary = useCallback(() => {
    const parts: string[] = [];
    parts.push(`SOP Type: ${getSOPTypeLabel(data.sop_type)}`);
    if (data.title) parts.push(`Title: ${data.title}`);
    if (data.client_name) parts.push(`Client: ${data.client_name}`);
    if (data.purpose) parts.push(`Purpose: ${data.purpose.slice(0, 120)}${data.purpose.length > 120 ? '...' : ''}`);
    if (data.scope) parts.push(`Scope: ${data.scope.slice(0, 120)}${data.scope.length > 120 ? '...' : ''}`);
    if (data.roles.length > 0) parts.push(`Roles: ${data.roles.map((r) => r.role).join(', ')}`);
    if (data.equipment.length > 0) parts.push(`Equipment: ${data.equipment.join(', ')}`);
    if (data.procedure_steps.length > 0) parts.push(`Steps: ${data.procedure_steps.length}`);
    if (data.risks_controls.length > 0) parts.push(`Risks documented: ${data.risks_controls.length}`);
    if (data.ppe) parts.push(`PPE: ${data.ppe}`);
    if (data.emergency_contacts.length > 0) parts.push(`Emergency contacts: ${data.emergency_contacts.length}`);
    return parts;
  }, [data]);

  const summary = buildSummary();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Generate SOP Document</h2>
        <p className="text-sm text-gray-400">Review the information you have entered, then generate the full SOP document.</p>
      </div>

      <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-300">Input Summary</h3>
          <button
            onClick={() => setPreview(!preview)}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors cursor-pointer whitespace-nowrap"
          >
            {preview ? 'Hide details' : 'Show details'}
          </button>
        </div>

        {preview ? (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {summary.map((line, i) => (
              <div key={i} className="text-sm text-gray-400 flex items-start gap-2">
                <div className="w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <i className="ri-check-line text-emerald-400 text-xs"></i>
                </div>
                {line}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-800/60 rounded-lg px-3 py-2">
              <p className="text-xs text-gray-500">Type</p>
              <p className="text-sm text-white">{getSOPTypeLabel(data.sop_type)}</p>
            </div>
            <div className="bg-gray-800/60 rounded-lg px-3 py-2">
              <p className="text-xs text-gray-500">Title</p>
              <p className="text-sm text-white truncate">{data.title || '—'}</p>
            </div>
            <div className="bg-gray-800/60 rounded-lg px-3 py-2">
              <p className="text-xs text-gray-500">Steps</p>
              <p className="text-sm text-white">{data.procedure_steps.length}</p>
            </div>
            <div className="bg-gray-800/60 rounded-lg px-3 py-2">
              <p className="text-xs text-gray-500">Risks</p>
              <p className="text-sm text-white">{data.risks_controls.length}</p>
            </div>
            <div className="bg-gray-800/60 rounded-lg px-3 py-2">
              <p className="text-xs text-gray-500">Roles</p>
              <p className="text-sm text-white">{data.roles.length}</p>
            </div>
            <div className="bg-gray-800/60 rounded-lg px-3 py-2">
              <p className="text-xs text-gray-500">Equipment</p>
              <p className="text-sm text-white">{data.equipment.length}</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={onGenerate}
          disabled={generating}
          className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
        >
          {generating ? (
            <>
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-loader-4-line animate-spin"></i>
              </div>
              Generating with AI...
            </>
          ) : (
            <>
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-sparkling-line"></i>
              </div>
              Generate Professional SOP Document
            </>
          )}
        </button>
        <p className="text-xs text-gray-500 text-center">AI will format your inputs into a professional, branded SOP document.</p>
      </div>
    </div>
  );
}