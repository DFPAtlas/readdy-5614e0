'use client';

import { useState, useEffect } from 'react';
import { useBuiltSOPs, getSOPTypeLabel } from '@/lib/useBuiltSOPs';
import { useSOPAcknowledgements } from '@/lib/useSOPAcknowledgements';
import { useGuardPortal } from '@/lib/useGuardPortal';
import { useAuth } from '@/lib/auth';

interface Props {
  siteId: string;
  guardId: string;
}

export default function GuardBuiltSOPsView({ siteId, guardId }: Props) {
  const { sops } = useBuiltSOPs();
  const { hasAcknowledged, acknowledge } = useSOPAcknowledgements();
  const [selectedSOP, setSelectedSOP] = useState<any>(null);
  const [sopContent, setSopContent] = useState<string | null>(null);
  const [acknowledgedMap, setAcknowledgedMap] = useState<Record<string, boolean>>();
  const [acknowledging, setAcknowledging] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const publishedSOPs = sops.filter((s) => s.status === 'published' && s.is_active);
  const siteSOPs = publishedSOPs.filter((s) => !s.site_id || s.site_id === siteId);

  useEffect(() => {
    const checkAcks = async () => {
      const map: Record<string, boolean> = {};
      for (const sop of siteSOPs) {
        map[sop.id] = await hasAcknowledged(sop.id, guardId, sop.version_number);
      }
      setAcknowledgedMap(map);
    };
    if (siteSOPs.length > 0) checkAcks();
  }, [siteSOPs, guardId, hasAcknowledged]);

  const handleOpen = (sop: any) => {
    setSelectedSOP(sop);
    const html = sop.content_html || generateFallbackHTML(sop);
    setSopContent(html);
  };

  const handleAcknowledge = async () => {
    if (!selectedSOP || !guardId) return;
    setAcknowledging(true);
    const { error } = await acknowledge(selectedSOP.id, guardId, siteId, selectedSOP.version_number);
    if (!error) {
      setAcknowledgedMap((prev) => ({ ...prev, [selectedSOP.id]: true }));
      setToast('Acknowledged. You may now start your shift.');
    } else {
      setToast('Failed to acknowledge. Try again.');
    }
    setAcknowledging(false);
    setTimeout(() => setToast(null), 4000);
  };

  const generateFallbackHTML = (sop: any): string => {
    const sections: string[] = [];
    sections.push(`<h1>${sop.title}</h1><p><strong>Type:</strong> ${getSOPTypeLabel(sop.sop_type)}</p><p><strong>Version:</strong> ${sop.version_number}</p>`);
    if (sop.purpose) sections.push(`<h2>1. Purpose</h2><p>${sop.purpose}</p>`);
    if (sop.scope) sections.push(`<h2>2. Scope</h2><p>${sop.scope}</p>`);
    if (sop.roles?.length) {
      sections.push(`<h2>3. Roles</h2><ul>${sop.roles.map((r: any) => `<li><strong>${r.role}:</strong> ${r.responsibility}</li>`).join('')}</ul>`);
    }
    if (sop.procedure_steps?.length) {
      sections.push(`<h2>4. Procedure</h2><ol>${sop.procedure_steps.map((s: any) => `<li>${s.instruction}${s.expectedOutcome ? ` <em>(Expected: ${s.expectedOutcome})</em>` : ''}</li>`).join('')}</ol>`);
    }
    if (sop.risks_controls?.length) {
      sections.push(`<h2>5. Risks & Controls</h2><ul>${sop.risks_controls.map((r: any) => `<li><strong>Risk:</strong> ${r.risk}<br><strong>Control:</strong> ${r.control}</li>`).join('')}</ul>`);
    }
    if (sop.emergency_contacts?.length) {
      sections.push(`<h2>6. Emergency Contacts</h2><ul>${sop.emergency_contacts.map((c: any) => `<li>${c.name} - ${c.role}: ${c.phone}</li>`).join('')}</ul>`);
    }
    return `<style>body{font-family:sans-serif;padding:20px;max-width:700px;margin:0 auto;color:#333;line-height:1.6}h1{color:#1d4ed8}h2{color:#4b5563;border-bottom:1px solid #e5e7eb;padding-bottom:4px;margin-top:24px}p,li{margin-bottom:8px}</style>${sections.join('')}`;
  };

  if (selectedSOP && sopContent) {
    const isAcked = acknowledgedMap[selectedSOP.id];
    return (
      <div className="bg-[#1a1a1a] border border-white/5 rounded-xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setSelectedSOP(null); setSopContent(null); }}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <div className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-left-line text-xs"></i></div>
            </button>
            <div>
              <p className="text-sm font-medium text-white">{selectedSOP.title}</p>
              <p className="text-xs text-gray-500">v{selectedSOP.version_number} &middot; {getSOPTypeLabel(selectedSOP.sop_type)}</p>
            </div>
          </div>
          {isAcked ? (
            <span className="px-2 py-1 bg-emerald-500/15 text-emerald-400 text-xs font-semibold rounded border border-emerald-500/20 whitespace-nowrap">
              <div className="w-3 h-3 inline-flex items-center justify-center mr-1"><i className="ri-check-line text-xs"></i></div>
              Acknowledged
            </span>
          ) : (
            <button
              onClick={handleAcknowledge}
              disabled={acknowledging}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              {acknowledging ? 'Confirming...' : 'I Confirm I Have Read This'}
            </button>
          )}
        </div>
        <div className="flex-1 bg-white min-h-[300px]">
          <iframe srcDoc={sopContent} className="w-full min-h-[300px]" style={{ border: 'none' }} />
        </div>
        {toast && (
          <div className="p-3 bg-emerald-500/10 border-t border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-2">
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-check-line text-xs"></i></div>
            {toast}
          </div>
        )}
      </div>
    );
  }

  if (siteSOPs.length === 0) {
    return (
      <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 flex items-center justify-center bg-blue-500/10 rounded-lg">
            <i className="ri-book-open-line text-blue-400 text-sm"></i>
          </div>
          <p className="text-sm font-medium text-white">Site Procedures</p>
        </div>
        <p className="text-xs text-gray-500">No published SOPs for this site yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 flex items-center justify-center bg-blue-500/10 rounded-lg">
          <i className="ri-book-open-line text-blue-400 text-sm"></i>
        </div>
        <div>
          <p className="text-sm font-medium text-white">Site Procedures</p>
          <p className="text-xs text-gray-500">{siteSOPs.length} SOP{siteSOPs.length !== 1 ? 's' : ''} to acknowledge</p>
        </div>
      </div>

      <div className="space-y-2">
        {siteSOPs.map((sop) => {
          const acked = acknowledgedMap[sop.id];
          return (
            <button
              key={sop.id}
              onClick={() => handleOpen(sop)}
              className="w-full flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-left cursor-pointer"
            >
              <div className="w-9 h-9 flex items-center justify-center bg-blue-500/10 rounded-lg flex-shrink-0">
                <i className="ri-file-text-line text-blue-400 text-sm"></i>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{sop.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] px-1.5 py-0.5 bg-white/10 text-gray-400 rounded">{getSOPTypeLabel(sop.sop_type)}</span>
                  <span className="text-[10px] text-blue-400 font-medium">v{sop.version_number}</span>
                </div>
              </div>
              {acked ? (
                <div className="w-6 h-6 flex items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
                  <i className="ri-check-line text-xs"></i>
                </div>
              ) : (
                <span className="text-[10px] px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded border border-amber-500/15 whitespace-nowrap">
                  Read & Confirm
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}