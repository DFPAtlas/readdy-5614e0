'use client';

import { useState } from 'react';
import { useAIImproveSOP, ImproveAction, getImproveActionLabel, AIImproveResult, ImprovementItem } from '@/lib/useAIImproveSOP';

interface Props {
  sopId: string;
  contentJson: Record<string, any>;
  onApply: (updates: Record<string, any>) => void;
  onRegenerate: () => void;
}

const ACTIONS: { action: ImproveAction; icon: string; desc: string }[] = [
  { action: 'improve_wording', icon: 'ri-edit-line', desc: 'Refine language for clarity and professionalism' },
  { action: 'complete_sections', icon: 'ri-file-list-3-line', desc: 'Fill in any empty or thin sections' },
  { action: 'add_health_safety', icon: 'ri-shield-check-line', desc: 'Add PPE, risks and health & safety notes' },
  { action: 'add_escalation', icon: 'ri-phone-line', desc: 'Add escalation steps and emergency contacts' },
  { action: 'general_review', icon: 'ri-sparkling-line', desc: 'Full AI review with section-by-section improvements' },
];

function SectionName(section: string): string {
  const map: Record<string, string> = {
    purpose: 'Purpose',
    scope: 'Scope',
    roles: 'Roles & Responsibilities',
    equipment: 'Required Equipment',
    procedure_steps: 'Procedure Steps',
    risks_controls: 'Risks & Controls',
    ppe: 'PPE Requirements',
    health_safety_notes: 'Health & Safety Notes',
    emergency_contacts: 'Emergency Contacts',
    escalation_procedure: 'Escalation Procedure',
    reporting_requirements: 'Reporting Requirements',
    guard_acknowledgement_statement: 'Guard Acknowledgement',
    title: 'Document Title',
  };
  return map[section] || section;
}

function ImprovedCard({ item }: { item: ImprovementItem }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-gray-800/50 border border-gray-700/60 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 text-left cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 flex items-center justify-center rounded bg-blue-500/10">
            <i className="ri-arrow-up-circle-line text-blue-400 text-xs"></i>
          </div>
          <span className="text-sm font-medium text-gray-200">{SectionName(item.section)}</span>
        </div>
        <div className="w-5 h-5 flex items-center justify-center text-gray-500">
          <i className={`ri-arrow-down-s-line text-xs transition-transform ${expanded ? 'rotate-180' : ''}`}></i>
        </div>
      </button>
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-700/40 pt-3">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1">Original</p>
            <p className="text-sm text-gray-400 line-through decoration-red-400/50">{item.original || 'Empty'}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-emerald-400 font-semibold mb-1">Improved</p>
            <p className="text-sm text-gray-200">{item.improved}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AIImprovementsPanel({ sopId, contentJson, onApply, onRegenerate }: Props) {
  const { improve, loading, result, error, currentAction, clear } = useAIImproveSOP();
  const [showPanel, setShowPanel] = useState(false);
  const [appliedToast, setAppliedToast] = useState(false);

  const handleAction = async (action: ImproveAction) => {
    const data = await improve(sopId, action, contentJson);
    if (data) setShowPanel(true);
  };

  const handleApply = () => {
    if (!result) return;
    const merged: Record<string, any> = { ...contentJson };

    if (result.improved_content_json) {
      Object.entries(result.improved_content_json).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') merged[key] = val;
      });
    }

    const directFields = [
      'purpose', 'scope', 'ppe', 'health_safety_notes', 'escalation_procedure',
      'reporting_requirements', 'guard_acknowledgement_statement', 'roles',
      'equipment', 'procedure_steps', 'risks_controls', 'emergency_contacts',
    ];
    directFields.forEach((key) => {
      if ((result as any)[key] !== undefined && (result as any)[key] !== null && (result as any)[key] !== '') {
        merged[key] = (result as any)[key];
      }
    });

    onApply(merged);
    setAppliedToast(true);
    setTimeout(() => setAppliedToast(false), 3000);
    clear();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
          <div className="w-5 h-5 flex items-center justify-center rounded bg-purple-500/10">
            <i className="ri-sparkling-line text-purple-400 text-xs"></i>
          </div>
          AI SOP Improvements
        </h3>
        {result && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleApply}
              className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-xs font-medium rounded-lg border border-emerald-500/20 transition-colors cursor-pointer whitespace-nowrap"
            >
              <div className="w-3 h-3 inline-flex items-center justify-center mr-1"><i className="ri-check-line"></i></div>
              Apply Changes
            </button>
            <button
              onClick={clear}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-400 text-xs font-medium rounded-lg border border-gray-700 transition-colors cursor-pointer whitespace-nowrap"
            >
              Discard
            </button>
          </div>
        )}
      </div>

      {loading && currentAction && (
        <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-6 flex flex-col items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center">
            <i className="ri-loader-4-line animate-spin text-purple-400 text-lg"></i>
          </div>
          <p className="text-sm text-gray-300 font-medium">{getImproveActionLabel(currentAction)}</p>
          <p className="text-xs text-gray-500">AI is reviewing and improving your SOP...</p>
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {result && result.summary && (
        <div className="bg-purple-500/5 border border-purple-500/10 rounded-lg p-3">
          <p className="text-sm text-gray-300">{result.summary}</p>
        </div>
      )}

      {result?.improvements && result.improvements.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {result.improvements.length} Suggested Improvement{result.improvements.length !== 1 ? 's' : ''}
          </p>
          {result.improvements.map((item, i) => (
            <ImprovedCard key={`${item.section}-${i}`} item={item} />
          ))}
        </div>
      )}

      {result?.improved_content_json && !result.improvements && (
        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-3">
          <p className="text-sm text-emerald-400">
            <div className="w-4 h-4 inline-flex items-center justify-center mr-1"><i className="ri-check-line text-xs"></i></div>
            AI improvements ready. Click "Apply Changes" to update your SOP.
          </p>
        </div>
      )}

      {!loading && !result && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {ACTIONS.map(({ action, icon, desc }) => (
            <button
              key={action}
              onClick={() => handleAction(action)}
              className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/40 border border-gray-700/50 hover:bg-gray-700/40 hover:border-gray-600 transition-all text-left cursor-pointer group"
            >
              <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors shrink-0">
                <i className={`${icon} text-purple-400 text-sm`}></i>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors whitespace-nowrap">{getImproveActionLabel(action)}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-snug">{desc}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {appliedToast && (
        <div className="fixed bottom-6 right-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-3 rounded-lg flex items-center gap-2 z-50">
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-check-line"></i></div>
          AI improvements applied
        </div>
      )}
    </div>
  );
}