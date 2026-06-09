'use client';

import { useState } from 'react';
import { useShiftPatternTemplates, type ShiftPatternTemplate } from '@/lib/useShiftPatternTemplates';
import { useAuth } from '@/lib/auth';
import PatternEditor from '../components/PatternEditor';
import Toast from '@/app/sites/components/Toast';

const SHIFT_COLOR_MAP: Record<string, string> = {
  day: '#F59E0B',
  night: '#6366F1',
  '24h': '#8B5CF6',
  event: '#10B981',
  patrol: '#06B6D4',
  rest: '#4B5563',
};

function shiftTypeColor(type: string, isRest?: boolean) {
  if (isRest) return SHIFT_COLOR_MAP.rest;
  return SHIFT_COLOR_MAP[type] || '#9CA3AF';
}

function shiftTypeDot(type: string) {
  if (type === 'day') return 'bg-amber-400';
  if (type === 'night') return 'bg-indigo-400';
  if (type === '24h') return 'bg-purple-400';
  if (type === 'event') return 'bg-emerald-400';
  if (type === 'patrol') return 'bg-cyan-400';
  return 'bg-gray-400';
}

function formatTimeRange(slot: { start_time: string; end_time: string; shift_type: string; is_rest_day?: boolean }) {
  if (slot.is_rest_day) return 'Rest Day';
  return `${slot.start_time}–${slot.end_time}`;
}

export default function ShiftPatternBuilderPage() {
  const { templates, loading, error, refetch, remove, duplicate, canCreate, canDelete } = useShiftPatternTemplates();
  const { role } = useAuth();
  const isAdmin = ['super_admin', 'company_admin', 'operations_manager'].includes(role || '');

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ShiftPatternTemplate | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string | null>(null);

  const filtered = templates.filter((t) => {
    const matchesSearch = !search || t.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = !typeFilter || t.pattern_type === typeFilter;
    return matchesSearch && matchesType;
  });

  const patternTypes = Array.from(new Set(templates.map((t) => t.pattern_type)));

  const handleSaveDone = () => {
    setToast(editingTemplate ? 'Pattern updated' : 'Pattern created');
    setEditorOpen(false);
    setEditingTemplate(null);
    refetch();
    setTimeout(() => setToast(null), 3000);
  };

  const handleDuplicate = async (template: ShiftPatternTemplate) => {
    const { error: err } = await duplicate(template.id);
    if (!err) {
      setToast('Pattern duplicated');
      refetch();
    } else {
      setToast(err.message || 'Failed to duplicate');
    }
    setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = async (id: string) => {
    const { error: err } = await remove(id);
    if (!err) {
      setToast('Pattern deleted');
      setDeleteConfirm(null);
    } else {
      setToast(err.message || 'Failed to delete');
    }
    setTimeout(() => setToast(null), 3000);
  };

  const openEditor = (template?: ShiftPatternTemplate) => {
    setEditingTemplate(template || null);
    setEditorOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Shift Pattern Builder</h1>
        <p className="text-gray-400 text-sm mt-1">
          Create reusable shift patterns and apply them to your rota calendar
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-error-warning-line"></i></div>
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {canCreate && (
            <button
              onClick={() => openEditor()}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <div className="w-4 h-4 flex items-center justify-center"><i className="ri-add-line"></i></div>
              New Pattern
            </button>
          )}
          {!canCreate && isAdmin && (
            <span className="text-xs text-amber-400 bg-amber-500/10 px-3 py-2 rounded-lg">
              View only — admin access required to create patterns
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-4 h-4 flex items-center justify-center absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              <i className="ri-search-line text-xs"></i>
            </div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search patterns..."
              className="bg-gray-800/60 border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 w-48"
            />
          </div>
          <div className="flex items-center bg-gray-800/60 border border-gray-700 rounded-lg p-0.5">
            <button
              onClick={() => setTypeFilter(null)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                typeFilter === null ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              All
            </button>
            {patternTypes.map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t === typeFilter ? null : t)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors cursor-pointer whitespace-nowrap ${
                  typeFilter === t ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-3 py-8">
          <div className="w-5 h-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Loading patterns...</p>
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-16 bg-gray-800/20 rounded-xl border border-gray-800 border-dashed">
          <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center rounded-lg bg-gray-800/50">
            <i className="ri-calendar-todo-line text-gray-500 text-xl" />
          </div>
          <p className="text-sm font-medium text-gray-300">
            {search || typeFilter ? 'No matching patterns' : 'No shift patterns yet'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {search || typeFilter
              ? 'Try adjusting your search or filters'
              : canCreate
              ? 'Create reusable patterns like 4 on/4 off, Mon-Fri, weekends only, etc.'
              : 'Your company has not created any shift patterns yet'}
          </p>
          {canCreate && !search && !typeFilter && (
            <button
              onClick={() => openEditor()}
              className="mt-4 inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 cursor-pointer whitespace-nowrap"
            >
              <div className="w-4 h-4 flex items-center justify-center"><i className="ri-add-line"></i></div>
              Create your first pattern
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((template) => {
          const activeSlots = template.slots.filter((s) => !s.is_rest_day);
          const restSlots = template.slots.filter((s) => s.is_rest_day);
          const totalGuardsNeeded = activeSlots.reduce((sum, s) => sum + (s.guards_required || 1), 0);

          return (
            <div
              key={template.id}
              className="bg-[#111827]/60 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-white truncate">{template.name}</p>
                    <span className="text-[10px] uppercase font-medium text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded">
                      {template.pattern_type}
                    </span>
                  </div>
                  {template.description && (
                    <p className="text-xs text-gray-500 mt-0.5">{template.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-0.5 shrink-0">
                  {canCreate && (
                    <button
                      onClick={() => openEditor(template)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
                      title="Edit"
                    >
                      <div className="w-4 h-4 flex items-center justify-center"><i className="ri-pencil-line text-xs"></i></div>
                    </button>
                  )}
                  {canCreate && (
                    <button
                      onClick={() => handleDuplicate(template)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
                      title="Duplicate"
                    >
                      <div className="w-4 h-4 flex items-center justify-center"><i className="ri-file-copy-line text-xs"></i></div>
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => setDeleteConfirm(template.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <div className="w-4 h-4 flex items-center justify-center"><i className="ri-delete-bin-line text-xs"></i></div>
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <div className="w-3.5 h-3.5 flex items-center justify-center"><i className="ri-calendar-line"></i></div>
                  {template.cycle_length || template.slots.length} day cycle
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-3.5 h-3.5 flex items-center justify-center"><i className="ri-user-line"></i></div>
                  {totalGuardsNeeded} guard slots
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-3.5 h-3.5 flex items-center justify-center"><i className="ri-hashtag"></i></div>
                  {activeSlots.length} active · {restSlots.length} rest
                </span>
              </div>

              <div className="mt-3 flex items-center gap-2 flex-wrap">
                {template.slots.map((slot, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] border"
                    style={{
                      backgroundColor: `${shiftTypeColor(slot.shift_type, slot.is_rest_day)}15`,
                      borderColor: `${shiftTypeColor(slot.shift_type, slot.is_rest_day)}30`,
                    }}
                  >
                    {!slot.is_rest_day && (
                      <span className={`w-1.5 h-1.5 rounded-full ${shiftTypeDot(slot.shift_type)}`} />
                    )}
                    <span className="text-gray-300">D{slot.day || (slot.day_offset != null ? slot.day_offset + 1 : i + 1)}</span>
                    <span className="text-gray-400">{formatTimeRange(slot)}</span>
                    {slot.guards_required > 1 && <span className="text-gray-500">x{slot.guards_required}</span>}
                  </div>
                ))}
              </div>

              {deleteConfirm === template.id && (
                <div className="mt-3 flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  <p className="text-xs text-red-400">Delete this pattern permanently?</p>
                  <button
                    onClick={() => handleDelete(template.id)}
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
          );
        })}
      </div>

      {editorOpen && (
        <PatternEditor
          template={editingTemplate}
          onSave={handleSaveDone}
          onClose={() => { setEditorOpen(false); setEditingTemplate(null); }}
        />
      )}

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  );
}