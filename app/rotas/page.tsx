'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';
import { useShifts } from '@/lib/useShifts';
import { useGuards } from '@/lib/useGuards';
import { useAuth } from '@/lib/auth';
import { useMyPermissions } from '@/lib/usePermissions';
import { supabase } from '@/lib/supabase';
import { useGuardAvailability, isGuardOnLeave, isGuardAvailable, getGuardWeeklyHours, OVERTIME_THRESHOLD } from '@/lib/useGuardAvailability';
import { useRotaEngine } from '@/app/rotas/hooks/useRotaEngine';
import { useRotaUndo, type UndoAction } from '@/lib/useRotaUndo';
import RotaHeader from './components/RotaHeader';
import WeekGrid from './components/WeekGrid';
import MonthView from './components/MonthView';
import DayDrawer from './components/DayDrawer';
import ShiftModal from './components/ShiftModal';
import SiteGuardsPanel from './components/SiteGuardsPanel';
import GuardRosterPanel from './components/GuardRosterPanel';
import Toast from '@/app/sites/components/Toast';
import BuildRotaBanner from './components/BuildRotaBanner';
import SiteInfoSection from './components/SiteInfoSection';
import AISuggestionsPanel from './components/AISuggestionsPanel';
import RotaWarningBar from './components/RotaWarningBar';
import AIRotaSummaryPanel from './components/AIRotaSummaryPanel';
import { useRotaPublish } from '@/lib/useRotaPublish';
import { useAIRotaSuggestions } from '@/lib/useAIRotaSuggestions';
import { useAISuggestions } from '@/lib/useAISuggestions';
import { useSickCover, type SickCoverItem } from '@/lib/useSickCover';
import SickCoverPanel from './components/SickCoverPanel';
import ShiftPatternTemplates from './components/ShiftPatternTemplates';
import ShiftBuilder from './components/ShiftBuilder';
import type { ShiftPatternTemplate } from '@/lib/useShiftPatternTemplates';
import PublishRotaBanner from './components/PublishRotaBanner';

export default function RotasPage() {
  const { companyId, profile } = useAuth();
  const { can } = useMyPermissions(profile?.id || null, companyId);
  const [view, setView] = useState<'week' | 'month'>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [toast, setToast] = useState<string | null>(null);
  const [lastAIError, setLastAIError] = useState<string | null>(null);
  const [aiTestStatus, setAITestStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);

  const weekStart = useMemo(() => startOfWeek(currentDate, { weekStartsOn: 1 }), [currentDate]);
  const weekEnd = useMemo(() => endOfWeek(currentDate, { weekStartsOn: 1 }), [currentDate]);
  const monthStart = useMemo(() => startOfMonth(currentDate), [currentDate]);
  const monthEnd = useMemo(() => endOfMonth(currentDate), [currentDate]);

  const { shifts, loading, error, refetch, createShift, updateShift, deleteShift, assignGuard, clearShifts } = useShifts(
    view === 'week' ? weekStart : monthStart,
    view === 'week' ? weekEnd : monthEnd
  );

  const { guards } = useGuards();
  const aiSuggestions = useAISuggestions();
  const aiRota = useAIRotaSuggestions();
  const { availability, timeOff, allTimeOff } = useGuardAvailability();
  const sickCover = useSickCover();

  const { warnings, guardStats, counts, criticalCount } = useRotaEngine(
    shifts,
    guards,
    weekStart,
    availability,
    timeOff,
    allTimeOff
  );

  const shiftWarnings = useMemo(() => {
    const map: Record<string, ReturnType<typeof useRotaEngine>['warnings']> = {};
    for (const w of warnings) {
      if (!map[w.shiftId]) map[w.shiftId] = [];
      map[w.shiftId].push(w);
    }
    return map;
  }, [warnings]);

  const [sites, setSites] = useState<{ id: string; site_name: string; risk_level: string | null }[]>([]);

  useEffect(() => {
    if (!companyId) return;
    supabase.from('sites').select('id, site_name, risk_level').eq('company_id', companyId).order('site_name').then(({ data }) => {
      if (data) setSites(data);
    });
  }, [companyId]);

  // Auto-fetch pending AI suggestions and sick cover on load so summary panel shows real counts immediately
  useEffect(() => {
    if (!companyId) return;
    aiRota.fetchPending(companyId);
  }, [companyId, weekStart]);

  useEffect(() => {
    if (!companyId) return;
    sickCover.generate(companyId, weekStart);
  }, [companyId, weekStart]);

  const filteredShifts = useMemo(() => {
    if (!selectedSiteId) return shifts;
    return shifts.filter((s) => s.site_id === selectedSiteId);
  }, [shifts, selectedSiteId]);

  const filteredSites = useMemo(() => {
    if (!selectedSiteId) return sites;
    return sites.filter((s) => s.id === selectedSiteId);
  }, [sites, selectedSiteId]);

  const siteGuards = useMemo(() => {
    if (!selectedSiteId) return [];
    const guardIds = new Set(shifts.filter((s) => s.site_id === selectedSiteId).map((s) => s.guard_id));
    return guards.filter((g) => guardIds.has(g.id));
  }, [guards, shifts, selectedSiteId]);

  const selectedSiteName = useMemo(() => {
    return sites.find((s) => s.id === selectedSiteId)?.site_name || 'Site';
  }, [sites, selectedSiteId]);

  const periodLabel = useMemo(() => {
    return view === 'week'
      ? `${format(weekStart, 'd MMM')} – ${format(weekEnd, 'd MMM yyyy')}`
      : format(currentDate, 'MMMM yyyy');
  }, [view, weekStart, weekEnd, currentDate]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<ReturnType<typeof useShifts>['shifts'][0] | null>(null);
  const [initialSiteId, setInitialSiteId] = useState<string | null>(null);
  const [initialDate, setInitialDate] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [dayDrawerDate, setDayDrawerDate] = useState<Date | null>(null);
  const [rosterCollapsed, setRosterCollapsed] = useState(false);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [warningFilter, setWarningFilter] = useState<string | null>(null);
  const [sickPanelOpen, setSickPanelOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [templateData, setTemplateData] = useState<ShiftPatternTemplate | null>(null);

  const filteredShiftWarnings = useMemo(() => {
    if (!warningFilter) return shiftWarnings;
    const filtered: Record<string, ReturnType<typeof useRotaEngine>['warnings']> = {};
    for (const [shiftId, list] of Object.entries(shiftWarnings)) {
      const matching = list.filter((w) => w.type === warningFilter);
      if (matching.length > 0) filtered[shiftId] = matching;
    }
    return filtered;
  }, [shiftWarnings, warningFilter]);

  const undo = useRotaUndo(refetch);

  const unassignedShifts = useMemo(() => filteredShifts.filter((s) => !s.guard_name), [filteredShifts]);

  const handlePrev = () => {
    if (view === 'week') setCurrentDate((d) => subWeeks(d, 1));
    else setCurrentDate((d) => subMonths(d, 1));
  };

  const handleNext = () => {
    if (view === 'week') setCurrentDate((d) => addWeeks(d, 1));
    else setCurrentDate((d) => addMonths(d, 1));
  };

  const handleToday = () => setCurrentDate(new Date());

  const handleToggleView = () => {
    setView((v) => (v === 'week' ? 'month' : 'week'));
    setCurrentDate(new Date());
  };

  const openAddShift = (siteId?: string, dateStr?: string) => {
    setEditingShift(null);
    setInitialSiteId(siteId || selectedSiteId || null);
    setInitialDate(dateStr || format(new Date(), 'yyyy-MM-dd'));
    setModalOpen(true);
  };

  const openEditShift = (shift: ReturnType<typeof useShifts>['shifts'][0]) => {
    setEditingShift(shift);
    setInitialSiteId(null);
    setInitialDate(null);
    setModalOpen(true);
  };

  const handleSave = async (payload: any) => {
    if (weekIsLocked && !isAdmin) {
      setToast('This rota is published. Contact an admin to make changes.');
      setModalOpen(false);
      return;
    }
    setSaving(true);
    if (editingShift) {
      const oldShift = shifts.find((s) => s.id === editingShift.id);
      const { error } = await updateShift(editingShift.id, payload);
      if (!error) {
        setToast('Shift updated');
        const actions: UndoAction[] = [];
        if (oldShift) {
          actions.push({
            kind: 'update_shift',
            id: editingShift.id,
            oldData: {
              site_id: oldShift.site_id,
              guard_id: oldShift.guard_id,
              start_time: oldShift.start_time,
              end_time: oldShift.end_time,
              shift_type: oldShift.shift_type,
              status: oldShift.status,
              notes: oldShift.notes,
            },
          });
        }
        undo.push(`Edited shift at ${editingShift.site_name || editingShift.site_id}`, actions);
        refetch();
      } else setToast('Failed to update shift');
    } else {
      const { data, error } = await createShift(payload);
      if (!error && data) {
        setToast('Shift created');
        undo.push('Added shift', [{ kind: 'delete_shift', id: data.id }]);
        refetch();
      } else setToast('Failed to create shift');
    }
    setSaving(false);
    setModalOpen(false);
  };

  const handleDelete = async () => {
    if (!editingShift) return;
    if (weekIsLocked && !isAdmin) {
      setToast('This rota is published. Contact an admin to make changes.');
      setSaving(false);
      setModalOpen(false);
      return;
    }
    setSaving(true);
    const oldShift = shifts.find((s) => s.id === editingShift.id);
    const { error } = await deleteShift(editingShift.id);
    if (!error) {
      setToast('Shift deleted');
      const actions: UndoAction[] = [];
      if (oldShift) {
        actions.push({
          kind: 'insert_shift',
          data: {
            id: oldShift.id,
            company_id: oldShift.company_id,
            site_id: oldShift.site_id,
            guard_id: oldShift.guard_id,
            start_time: oldShift.start_time,
            end_time: oldShift.end_time,
            shift_type: oldShift.shift_type,
            status: oldShift.status,
            notes: oldShift.notes,
          },
        });
      }
      undo.push(`Deleted shift at ${editingShift.site_name || editingShift.site_id}`, actions);
      refetch();
    } else setToast('Failed to delete shift');
    setSaving(false);
    setModalOpen(false);
  };

  const handleDropShift = async (shiftId: string, targetSiteId: string, targetDate: string) => {
    if (weekIsLocked && !isAdmin) {
      setToast('This rota is published. Contact an admin to make changes.');
      return;
    }
    const shift = shifts.find((s) => s.id === shiftId);
    if (!shift) return;
    const originalStart = new Date(shift.start_time);
    const originalEnd = new Date(shift.end_time);
    const duration = originalEnd.getTime() - originalStart.getTime();
    const targetStart = new Date(`${targetDate}T${format(originalStart, 'HH:mm')}`);
    const targetEnd = new Date(targetStart.getTime() + duration);

    if (shift.guard_id) {
      const guardShifts = shifts.filter((s) => s.guard_id === shift.guard_id && s.id !== shiftId);
      const conflicting = guardShifts.find((s) => {
        const sStart = new Date(s.start_time);
        const sEnd = new Date(s.end_time);
        return sStart < targetEnd && sEnd > targetStart;
      });
      if (conflicting) {
        const cStart = format(new Date(conflicting.start_time), 'HH:mm');
        const cEnd = format(new Date(conflicting.end_time), 'HH:mm');
        const cDate = format(new Date(conflicting.start_time), 'EEE d MMM');
        const cSite = conflicting.site_name || 'another site';
        setToast(`Conflict: guard already booked ${cStart}–${cEnd} at ${cSite} on ${cDate}`);
        return;
      }
      const leave = isGuardOnLeave(shift.guard_id, targetDate, timeOff);
      if (leave) {
        setToast(`Guard is on ${leave.reason} until ${leave.end_date}`);
        return;
      }
      const availOk = isGuardAvailable(shift.guard_id, targetStart, format(targetStart, 'HH:mm'), format(targetEnd, 'HH:mm'), availability);
      if (!availOk) {
        setToast('Shift falls outside guard availability window');
        return;
      }
    }

    const { error } = await updateShift(shiftId, {
      site_id: targetSiteId,
      date: targetDate,
      start_time: format(originalStart, 'HH:mm'),
      end_time: format(originalEnd, 'HH:mm'),
    });
    if (!error) {
      setToast('Shift moved');
      undo.push('Moved shift', [{
        kind: 'update_shift',
        id: shiftId,
        oldData: {
          site_id: shift.site_id,
          start_time: shift.start_time,
          end_time: shift.end_time,
        },
      }]);
      refetch();
    } else setToast('Failed to move shift');
  };

  const handleDropGuard = useCallback(async (guardId: string, siteId: string, dateStr: string) => {
    if (weekIsLocked && !isAdmin) {
      setToast('This rota is published. Contact an admin to make changes.');
      return;
    }
    const leave = isGuardOnLeave(guardId, dateStr, timeOff);
    if (leave) {
      setToast(`Guard is on ${leave.reason} until ${leave.end_date}`);
      return;
    }

    const openOnDay = filteredShifts.filter(
      (s) => s.site_id === siteId && !s.guard_name && s.start_time.startsWith(dateStr)
    );

    let targetStart: Date;
    let targetEnd: Date;

    if (openOnDay.length > 0) {
      targetStart = new Date(openOnDay[0].start_time);
      targetEnd = new Date(openOnDay[0].end_time);
    } else {
      targetStart = new Date(`${dateStr}T06:00:00`);
      targetEnd = new Date(`${dateStr}T18:00:00`);
    }

    const availOk = isGuardAvailable(guardId, targetStart, format(targetStart, 'HH:mm'), format(targetEnd, 'HH:mm'), availability);
    if (!availOk) {
      setToast('Guard is unavailable at that time');
      return;
    }

    const guardShifts = shifts.filter((s) => s.guard_id === guardId);
    const conflicting = guardShifts.find((s) => {
      const sStart = new Date(s.start_time);
      const sEnd = new Date(s.end_time);
      return sStart < targetEnd && sEnd > targetStart;
    });

    if (conflicting) {
      const cStart = format(new Date(conflicting.start_time), 'HH:mm');
      const cEnd = format(new Date(conflicting.end_time), 'HH:mm');
      const cDate = format(new Date(conflicting.start_time), 'EEE d MMM');
      const cSite = conflicting.site_name || 'another site';
      setToast(`Conflict: already booked ${cStart}–${cEnd} at ${cSite} on ${cDate}`);
      return;
    }

    const ws = startOfWeek(targetStart, { weekStartsOn: 1 });
    const currentHours = getGuardWeeklyHours(guardId, shifts, ws);
    const shiftHours = (targetEnd.getTime() - targetStart.getTime()) / (1000 * 60 * 60);
    if (currentHours + shiftHours > OVERTIME_THRESHOLD) {
      setToast(`Guard would exceed ${OVERTIME_THRESHOLD}h/week (${(currentHours + shiftHours).toFixed(1)}h)`);
      return;
    }

    if (openOnDay.length > 0) {
      const openShift = openOnDay[0];
      const { error } = await assignGuard(openShift.id, guardId);
      if (!error) {
        setToast('Guard assigned to open shift');
        undo.push('Assigned guard to shift', [{
          kind: 'update_shift',
          id: openShift.id,
          oldData: { guard_id: openShift.guard_id },
        }]);
        refetch();
      } else setToast('Failed to assign guard');
      return;
    }

    const { data, error } = await createShift({
      site_id: siteId,
      guard_id: guardId,
      date: dateStr,
      start_time: '06:00',
      end_time: '18:00',
      shift_type: 'day',
      status: 'scheduled',
      notes: '',
    });
    if (!error && data) {
      setToast('Shift created');
      undo.push('Created shift from guard drop', [{ kind: 'delete_shift', id: data.id }]);
      refetch();
    } else setToast('Failed to create shift');
  }, [filteredShifts, shifts, timeOff, availability]);

  const handleGenerateAI = async () => {
    if (!companyId) return;
    setLastAIError(null);
    setAITestStatus(null);
    setToast('Generating AI suggestions...');

    const { data: result, error: genError } = await aiSuggestions.generate(companyId, format(weekStart, 'yyyy-MM-dd'));

    if (genError) {
      setLastAIError(genError);
      setToast(genError);
      return;
    }

    if (!result) {
      const err = 'AI service returned no data';
      setLastAIError(err);
      setToast(err);
      return;
    }

    if (result.shifts_count === 0) {
      setToast('No unassigned shifts found for this week. AI has nothing to fill.');
      setAiPanelOpen(true);
      return;
    }

    if (result.suggestions.length === 0 && result.unfillable.length === 0) {
      setToast('AI analysed shifts but could not propose any assignments. All guards may be unavailable or at capacity.');
      setAiPanelOpen(true);
      return;
    }

    const inputs = result.suggestions
      .filter(s => s.suggested_guard_id)
      .map(s => {
        const shift = shifts.find(sh => sh.id === s.shift_id);
        return {
          company_id: companyId,
          site_id: shift?.site_id,
          shift_id: s.shift_id,
          suggested_guard_id: s.suggested_guard_id,
          suggestion_type: 'open_shift_cover' as const,
          confidence: s.confidence,
          reasoning: s.reasoning,
          warnings: [] as any[],
          metadata: { source: 'ai-suggest-staffing' },
        };
      });

    if (inputs.length > 0) {
      const { error: createErr } = await aiRota.createSuggestions(inputs);
      if (createErr) {
        setToast('AI generated suggestions but saving drafts failed. Try again.');
        return;
      }
      setToast(`${inputs.length} AI suggestion${inputs.length !== 1 ? 's' : ''} saved as pending drafts`);
    } else if (result.unfillable.length > 0) {
      setToast(`${result.unfillable.length} shift${result.unfillable.length !== 1 ? 's' : ''} could not be filled — see unfillable list`);
    }

    await aiRota.fetchPending(companyId);
    setAiPanelOpen(true);
  };

  const handleApproveSuggestion = async (suggestionId: string) => {
    if (!companyId) return;
    const { error } = await aiRota.approveAndApply(suggestionId, companyId);
    if (!error) {
      setToast('Suggestion approved and applied');
      await aiRota.fetchPending(companyId);
      refetch();
    } else {
      setToast('Failed to approve suggestion');
    }
  };

  const handleApproveAllHigh = async () => {
    if (!companyId) return;
    const applied = await aiRota.approveAllHigh(aiRota.pending, companyId);
    setToast(`${applied} high-confidence suggestions approved and applied`);
    await aiRota.fetchPending(companyId);
    refetch();
  };

  const handleRejectSuggestion = async (suggestionId: string) => {
    if (!companyId) return;
    const { error } = await aiRota.rejectSuggestion(suggestionId, companyId);
    if (!error) {
      setToast('Suggestion rejected');
      await aiRota.fetchPending(companyId);
    } else {
      setToast('Failed to reject suggestion');
    }
  };

  const handleSickAssign = async (shiftId: string, guardId: string) => {
    if (!companyId) return;
    const shift = shifts.find((s) => s.id === shiftId);
    const { data } = await aiRota.createSuggestions([{
      company_id: companyId,
      site_id: shift?.site_id,
      shift_id: shiftId,
      suggested_guard_id: guardId,
      suggestion_type: 'sick_cover',
      confidence: 70,
      reasoning: 'Sick cover replacement',
      warnings: [],
      metadata: { source: 'sick-cover-panel' },
    }]);
    if (data && data[0]) {
      const { error } = await aiRota.approveAndApply(data[0].id, companyId);
      if (!error) {
        setToast('Sick cover approved and applied');
        undo.push('Assigned sick cover', [{
          kind: 'update_shift',
          id: shiftId,
          oldData: { guard_id: shift?.guard_id },
        }]);
        refetch();
      } else {
        setToast('Failed to assign cover');
      }
    }
  };

  const handleSickAssignAll = async (items: SickCoverItem[]) => {
    if (!companyId) return;
    const toAssign = items.filter((i) => !!i.suggested_guard_id);
    let count = 0;
    const actions: UndoAction[] = [];
    const inputs = toAssign.map(item => {
      const shift = shifts.find((s) => s.id === item.shift_id);
      return {
        company_id: companyId,
        site_id: shift?.site_id,
        shift_id: item.shift_id,
        suggested_guard_id: item.suggested_guard_id!,
        suggestion_type: 'sick_cover',
        confidence: item.confidence,
        reasoning: item.reasoning,
        warnings: [],
        metadata: { source: 'sick-cover-panel', sick_guard_id: item.sick_guard_id },
      };
    });
    const { data: suggestions } = await aiRota.createSuggestions(inputs);
    if (suggestions) {
      for (const s of suggestions) {
        const { error } = await aiRota.approveAndApply(s.id, companyId);
        if (!error) {
          count++;
          const shift = shifts.find((sh) => sh.id === s.shift_id);
          if (shift) {
            actions.push({
              kind: 'update_shift',
              id: s.shift_id,
              oldData: { guard_id: shift.guard_id },
            });
          }
        }
      }
    }
    setToast(`${count} sick cover replacements assigned`);
    if (actions.length > 0) undo.push(`Assigned ${count} sick cover replacements`, actions);
    refetch();
  };

  const handleUsePattern = (template: ShiftPatternTemplate) => {
    setBuilderOpen(true);
    setTemplateData(template);
  };

  const handleUndo = async () => {
    if (weekIsLocked && !isAdmin) {
      setToast('This rota is published. Contact an admin to make changes.');
      return;
    }
    await undo.undo();
    setToast(undo.lastLabel ? `Undid: ${undo.lastLabel}` : 'Last change undone');
  };

  const handleClearShifts = async () => {
    if (weekIsLocked && !isAdmin) {
      setToast('This rota is published. Contact an admin to make changes.');
      return;
    }
    const siteLabel = selectedSiteId ? sites.find((s) => s.id === selectedSiteId)?.site_name || 'selected site' : 'all sites';
    const { error: clearError } = await clearShifts(selectedSiteId);
    if (!clearError) {
      setToast(`Shifts cleared for ${siteLabel}`);
      refetch();
    } else {
      setToast('Failed to clear shifts');
    }
  };

  const weekRange = view === 'week'
    ? `${format(weekStart, 'EEE d MMM')} – ${format(weekEnd, 'EEE d MMM yyyy')}`
    : format(currentDate, 'MMMM yyyy');

  const siteRiskLevel = sites.find((s) => s.id === selectedSiteId)?.risk_level || null;
  const companyUnassigned = useMemo(() => shifts.filter((s) => !s.guard_name), [shifts]);

  // Transform aiRota.pending into the StaffingSuggestion shape the panel expects
  const pendingSuggestions = useMemo(() => {
    return aiRota.pending.map(p => ({
      shift_id: p.shift_id,
      suggested_guard_id: p.suggested_guard_id,
      confidence: p.confidence ?? 0,
      reasoning: p.reasoning ?? '',
    }));
  }, [aiRota.pending]);

  const [approvingAll, setApprovingAll] = useState(false);

  const { published, loading: publishLoading, isAdmin, fetchPublished, publish, unpublish } = useRotaPublish();
  const [publishing, setPublishing] = useState(false);
  const weekIsLocked = !!published;

  useEffect(() => {
    if (!companyId) return;
    fetchPublished(weekStart);
  }, [companyId, weekStart, fetchPublished]);

  const handlePublish = async () => {
    setPublishing(true);
    const { error } = await publish(weekStart);
    setPublishing(false);
    if (!error) {
      setToast('Rota published and locked. AI suggestions disabled.');
    } else {
      setToast('Failed to publish rota');
    }
  };

  const handleUnpublish = async () => {
    const { error } = await unpublish();
    if (!error) {
      setToast('Rota unlocked. AI suggestions re-enabled.');
    } else {
      setToast('Failed to unpublish rota');
    }
  };

  const handleApproveAllHighClick = async () => {
    setApprovingAll(true);
    await handleApproveAllHigh();
    setApprovingAll(false);
  };

  const handleTestAIConnection = async () => {
    setAITestStatus(null);
    setToast('Testing AI connection...');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || '';
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/test-openai-config`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      if (!res.ok) {
        const msg = data?.error || `Test failed (${res.status})`;
        setAITestStatus({ message: msg, type: 'error' });
        setToast(msg);
        return;
      }
      if (data.working) {
        setAITestStatus({ message: `OpenAI connected — model replied: "${data.reply}"`, type: 'success' });
        setToast(`OpenAI connected! Model replied: "${data.reply}"`);
      } else if (data.configured) {
        const msg = data.error || 'OpenAI key is set but the API rejected the request. Key might be invalid or expired.';
        setAITestStatus({ message: msg, type: 'error' });
        setToast(msg);
      } else {
        const msg = data.error || 'OpenAI API key not found in edge function secrets.';
        setAITestStatus({ message: msg, type: 'error' });
        setToast(msg);
      }
    } catch (err: any) {
      const msg = err?.message || 'Connection test failed';
      setAITestStatus({ message: msg, type: 'error' });
      setToast(msg);
    }
  };

  return (
    <div className="space-y-6">
      <RotaHeader
        weekRange={weekRange}
        weekStart={weekStart}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={handleToday}
        view={view}
        onToggleView={handleToggleView}
        onAddShift={() => openAddShift()}
        sites={sites}
        selectedSiteId={selectedSiteId}
        onSelectSite={setSelectedSiteId}
        onGenerateDone={() => { setToast('Shifts generated from cover plan'); refetch(); }}
        canEdit={can('rotas', 'edit')}
        onOpenTemplates={() => can('shift_patterns', 'view') && setTemplatesOpen(true)}
        onOpenShiftBuilder={() => can('shift_patterns', 'create') && setBuilderOpen(true)}
        canUndo={undo.canUndo}
        onUndo={handleUndo}
        undoLabel={undo.lastLabel}
        undoCount={undo.undoCount}
        onClearShifts={handleClearShifts}
      />

      <PublishRotaBanner
        published={weekIsLocked}
        publishedByName={published?.published_by_name}
        publishedAt={published?.published_at}
        isAdmin={isAdmin}
        onPublish={handlePublish}
        onUnpublish={handleUnpublish}
        publishing={publishing}
      />

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-error-warning-line"></i></div>
          {error}
        </div>
      )}

      <AIRotaSummaryPanel
        weekStart={weekStart}
        shifts={shifts}
        counts={counts}
        criticalCount={criticalCount}
        pendingSuggestions={aiRota.pending}
        sickCoverData={sickCover.data}
        timeOff={timeOff}
        onGenerateAI={weekIsLocked ? undefined : handleGenerateAI}
        onOpenSickCover={weekIsLocked ? undefined : () => {
          setSickPanelOpen(true);
          if (companyId) sickCover.generate(companyId, weekStart);
        }}
        onOpenSuggestions={weekIsLocked ? undefined : () => setAiPanelOpen(true)}
        onApproveAllHigh={weekIsLocked ? undefined : handleApproveAllHighClick}
        onOpenConflicts={weekIsLocked ? undefined : () => setWarningFilter(warningFilter === 'conflict' ? null : 'conflict')}
        onTestAIConnection={handleTestAIConnection}
        generating={aiSuggestions.loading || aiRota.loading}
        approvingAll={approvingAll}
        canApprove={can('rotas', 'edit') && !weekIsLocked}
        lastAIError={lastAIError}
        aiTestStatus={aiTestStatus}
        weekIsLocked={weekIsLocked}
      />

      <RotaWarningBar
        counts={counts}
        criticalCount={criticalCount}
        onFilterClick={setWarningFilter}
        activeFilter={warningFilter}
      />

      {selectedSiteId && (
        <BuildRotaBanner
          siteId={selectedSiteId}
          siteName={selectedSiteName}
          weekStart={weekStart}
          weekEnd={weekEnd}
          existingShiftCount={filteredShifts.length}
          onDone={() => refetch()}
        />
      )}

      {selectedSiteId && (
        <SiteInfoSection
          siteName={selectedSiteName}
          riskLevel={siteRiskLevel}
          totalShifts={filteredShifts.length}
          assignedShifts={filteredShifts.filter((s) => s.guard_name).length}
          unassignedShifts={unassignedShifts.length}
          periodLabel={periodLabel}
        />
      )}

      <div className="flex gap-0">
        <GuardRosterPanel
          guards={guards}
          guardStats={guardStats}
          collapsed={rosterCollapsed}
          onToggleCollapse={() => setRosterCollapsed((v) => !v)}
        />
        <div className="flex-1 min-w-0">
          {view === 'week' ? (
            <div className="bg-[#111827]/60 border border-gray-800 rounded-xl overflow-hidden">
              <WeekGrid
                weekStart={weekStart}
                shifts={filteredShifts}
                sites={filteredSites}
                guards={guards}
                onClickShift={openEditShift}
                onAddShift={openAddShift}
                onDropGuard={handleDropGuard}
                onDropShift={handleDropShift}
                shiftWarnings={filteredShiftWarnings}
                guardStats={guardStats}
              />
            </div>
          ) : (
            <div className="bg-[#111827]/60 border border-gray-800 rounded-xl overflow-hidden">
              <MonthView
                currentDate={currentDate}
                shifts={filteredShifts}
                sites={filteredSites}
                onClickDay={(d) => setDayDrawerDate(d)}
                onAddShift={openAddShift}
                onDropGuard={handleDropGuard}
                shiftWarnings={filteredShiftWarnings}
              />
            </div>
          )}
        </div>
      </div>

      {loading && shifts.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      )}

      {view === 'week' && unassignedShifts.length > 0 && (
        <div className="bg-[#151b27] border border-gray-800 rounded-xl overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-800">
            <div className="w-5 h-5 flex items-center justify-center text-amber-400">
              <i className="ri-alarm-warning-line"></i>
            </div>
            <span className="text-sm font-semibold text-white">Open shifts ({unassignedShifts.length})</span>
          </div>
          <div className="p-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
              {unassignedShifts.map((shift) => (
                <div
                  key={shift.id}
                  onClick={() => openEditShift(shift)}
                  className="bg-[#1a1f2e] border border-gray-700 rounded-lg px-3 py-2.5 cursor-pointer hover:border-amber-500/40 hover:bg-[#1f2535] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white truncate">{shift.site_name || 'Site'}</span>
                    <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">UNASSIGNED</span>
                  </div>
                  <div className="text-[11px] text-gray-400 mt-1">
                    {new Date(shift.start_time).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' })} ·{' '}
                    {new Date(shift.start_time).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}–
                    {new Date(shift.end_time).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="mt-1.5 flex gap-1.5">
                    <span className="text-[10px] text-gray-500 bg-gray-800/60 px-1.5 py-0.5 rounded">{shift.shift_type || 'day'}</span>
                    <span className="text-[10px] text-gray-500 bg-gray-800/60 px-1.5 py-0.5 rounded">{shift.status || 'scheduled'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {modalOpen && (
        <ShiftModal
          editingShift={editingShift}
          initialSiteId={initialSiteId}
          initialDate={initialDate || undefined}
          allShifts={shifts}
          onSave={handleSave}
          onClose={() => setModalOpen(false)}
          onDelete={editingShift ? handleDelete : undefined}
          saving={saving}
        />
      )}

      <DayDrawer
        date={dayDrawerDate}
        shifts={filteredShifts}
        sites={filteredSites}
        onClose={() => setDayDrawerDate(null)}
        onClickShift={openEditShift}
        onAddShift={openAddShift}
      />

      {selectedSiteId && siteGuards.length > 0 && (
        <SiteGuardsPanel
          guards={siteGuards}
          shifts={filteredShifts}
          siteName={selectedSiteName}
          periodLabel={periodLabel}
        />
      )}

      <AISuggestionsPanel
        isOpen={aiPanelOpen}
        onClose={() => setAiPanelOpen(false)}
        suggestions={pendingSuggestions}
        unfillable={aiSuggestions.unfillable}
        warnings={aiSuggestions.warnings}
        shifts={shifts}
        onApprove={handleApproveSuggestion}
        onApproveAllHigh={handleApproveAllHigh}
        onReject={handleRejectSuggestion}
        generating={aiSuggestions.loading || aiRota.loading}
        openShiftsCount={companyUnassigned.length}
        pendingSuggestions={aiRota.pending}
      />

      <SickCoverPanel
        isOpen={sickPanelOpen}
        onClose={() => setSickPanelOpen(false)}
        data={sickCover.data}
        loading={sickCover.loading}
        error={sickCover.error}
        onAssign={handleSickAssign}
        onAssignAll={handleSickAssignAll}
      />

      {templatesOpen && (
        <ShiftPatternTemplates
          onUsePattern={handleUsePattern}
          onClose={() => { setTemplatesOpen(false); setTemplateData(null); }}
        />
      )}

      {builderOpen && (
        <ShiftBuilder
          templates={templateData ? [templateData] : []}
          sites={sites}
          onDone={() => { setBuilderOpen(false); setTemplateData(null); refetch(); }}
        />
      )}

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  );
}