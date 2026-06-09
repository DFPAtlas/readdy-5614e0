'use client';

import { useState } from 'react';
import { useShiftPatternTemplates, ShiftPatternTemplate } from '@/lib/useShiftPatternTemplates';
import PatternBuilder from './PatternBuilder';

interface Props {
  onUsePattern: (template: ShiftPatternTemplate) => void;
  onClose: () => void;
}

export default function ShiftPatternTemplates({ onUsePattern, onClose }: Props) {
  const { templates, loading, error, remove, create, seedBuiltIn } = useShiftPatternTemplates();
  const [builderOpen, setBuilderOpen] = useState(false);
  const [editing, setEditing] = useState<ShiftPatternTemplate | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const shiftTypeDot = (type: string) => {
    if (type === 'day') return 'bg-amber-400';
    if (type === 'night') return 'bg-indigo-400';
    if (type === '24h') return 'bg-purple-400';
    return 'bg-emerald-400';
  };

  const handleSave = async (
    template: Omit<ShiftPatternTemplate, 'id' | 'company_id' | 'created_at' | 'updated_at'>
  ) => {
    if (editing) {
      await remove(editing.id);
      await create(template);
    } else {
      await create(template);
    }
    setBuilderOpen(false);
    setEditing(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#111827] border border-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Shift Pattern Templates</h2>
            <p className="text-xs text-gray-500 mt-0.5">Save reusable shift patterns for quick rota building</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer">
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-close-line"></i></div>
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-2.5 rounded-lg flex items-center gap-2">
              <div className="w-4 h-4 flex items-center justify-center"><i className="ri-error-warning-line"></i></div>
              {error}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setEditing(null); setBuilderOpen(true); }}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                <div className="w-3.5 h-3.5 flex items-center justify-center"><i className="ri-add-line"></i></div>
                New Pattern
              </button>
              {templates.length === 0 && (
                <button
                  onClick={() => seedBuiltIn()}
                  className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
                >
                  <div className="w-3.5 h-3.5 flex items-center justify-center"><i className="ri-magic-line"></i></div>
                  Seed defaults
                </button>
              )}
            </div>
            <span className="text-xs text-gray-500">{templates.length} saved</span>
          </div>

          {loading && (
            <div className="flex items-center gap-3 py-8">
              <div className="w-5 h-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
              <p className="text-sm text-gray-400">Loading patterns...</p>
            </div>
          )}

          {!loading && templates.length === 0 && (
            <div className="text-center py-10 bg-gray-800/20 rounded-xl border border-gray-800 border-dashed">
              <div className="w-10 h-10 mx-auto mb-3 flex items-center justify-center rounded-lg bg-gray-800/50">
                <i className="ri-calendar-todo-line text-gray-500 text-lg" />
              </div>
              <p className="text-sm font-medium text-gray-300">No patterns yet</p>
              <p className="text-xs text-gray-500 mt-1">Create a new pattern or seed the default set</p>
            </div>
          )}

          <div className="space-y-2">
            {templates.filter(Boolean).map((t) => (
              <div
                key={t?.id || Math.random()}
                className="bg-gray-800/40 border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-white">{t?.name || 'Unnamed Pattern'}</p>
                      <span className="text-[10px] uppercase font-medium text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded">
                        {t?.pattern_type || 'unknown'}
                      </span>
                      <span className="text-[10px] text-gray-500">{(t?.cycle_length ?? t?.slots?.length ?? 0)}d cycle</span>
                    </div>
                    {t?.description && <p className="text-xs text-gray-500 mt-0.5">{t.description}</p>}

                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {(t?.slots || []).map((slot, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-gray-900/60 border border-gray-700 text-gray-400"
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${shiftTypeDot(slot?.shift_type)}`} />
                            D{(slot?.day_offset ?? 0) + 1}: {slot?.start_time || '--:--'}–{slot?.end_time || '--:--'}
                            {(slot?.guards_required ?? 1) > 1 && ` ×${slot.guards_required}`}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onUsePattern(t)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-600/15 text-blue-400 hover:bg-blue-600/25 transition-colors cursor-pointer"
                      title="Use this pattern"
                    >
                      <div className="w-4 h-4 flex items-center justify-center"><i className="ri-play-line text-xs"></i></div>
                    </button>
                    <button
                      onClick={() => { setEditing(t); setBuilderOpen(true); }}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
                      title="Edit"
                    >
                      <div className="w-4 h-4 flex items-center justify-center"><i className="ri-pencil-line text-xs"></i></div>
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(t?.id || '')}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <div className="w-4 h-4 flex items-center justify-center"><i className="ri-delete-bin-line text-xs"></i></div>
                    </button>
                  </div>
                </div>

                {deleteConfirm === t?.id && (
                  <div className="mt-3 flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                    <p className="text-xs text-red-400">Delete this pattern? This cannot be undone.</p>
                    <button
                      onClick={() => { if (t?.id) remove(t.id); setDeleteConfirm(null); }}
                      className="ml-auto text-xs text-red-400 hover:text-red-300 font-medium cursor-pointer whitespace-nowrap"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="text-xs text-gray-400 hover:text-white cursor-pointer whitespace-nowrap"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {builderOpen && (
        <PatternBuilder
          templates={templates}
          editingTemplate={editing}
          onSave={handleSave}
          onClose={() => { setBuilderOpen(false); setEditing(null); }}
        />
      )}
    </div>
  );
}