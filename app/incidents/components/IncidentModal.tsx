import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { phaseOneSupabase as supabase } from '@/lib/phaseOneSupabase';
import { INCIDENT_TYPES, SEVERITY_COLORS } from '@/lib/useIncidents';

interface Props {
  editingIncident?: any;
  onSave: (payload: any) => void;
  onClose: () => void;
  saving: boolean;
  fullPage?: boolean;
  saveError?: string | null;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 pt-1">{children}</div>
  );
}

export default function IncidentModal({ editingIncident, onSave, onClose, saving, fullPage = false, saveError }: Props) {
  const { companyId } = useAuth();
  const [sites, setSites] = useState<{ id: string; site_name: string }[]>([]);
  const [guards, setGuards] = useState<{ id: string; first_name: string | null; last_name: string | null }[]>([]);
  const [shifts, setShifts] = useState<{ id: string; guard_id: string | null; site_id: string | null; start_time: string; end_time: string }[]>([]);

  const [siteId, setSiteId] = useState('');
  const [guardId, setGuardId] = useState('');
  const [shiftId, setShiftId] = useState('');
  const [incidentType, setIncidentType] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [title, setTitle] = useState('');
  const [occurredAt, setOccurredAt] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState('open');
  const [clientVisible, setClientVisible] = useState(true);
  const [requiresFollowUp, setRequiresFollowUp] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!companyId) return;
    supabase.from('sites').select('id, site_name').eq('company_id', companyId).order('site_name').then(({ data }) => {
      if (data) setSites(data);
    });
    supabase.from('guards').select('id, first_name, last_name').eq('company_id', companyId).eq('status', 'active').order('first_name').then(({ data }) => {
      if (data) setGuards(data);
    });
    const now = new Date().toISOString();
    supabase.from('shifts').select('id, guard_id, site_id, start_time, end_time').eq('company_id', companyId).lte('start_time', now).gte('end_time', now).order('start_time').then(({ data }) => {
      if (data) setShifts(data);
    });
  }, [companyId]);

  useEffect(() => {
    if (editingIncident) {
      setSiteId(editingIncident.site_id || '');
      setGuardId(editingIncident.guard_id || '');
      setShiftId(editingIncident.shift_id || '');
      setIncidentType(editingIncident.incident_type || '');
      setSeverity(editingIncident.severity || 'medium');
      setTitle(editingIncident.title || '');
      setOccurredAt(editingIncident.occurred_at ? new Date(editingIncident.occurred_at).toISOString().slice(0, 16) : '');
      setDescription(editingIncident.description || '');
      setLocation(editingIncident.location || '');
      setStatus(editingIncident.status || 'open');
      setClientVisible(editingIncident.client_visible ?? true);
      setRequiresFollowUp(editingIncident.requires_follow_up ?? false);
    } else {
      setSiteId('');
      setGuardId('');
      setShiftId('');
      setIncidentType('');
      setSeverity('medium');
      setTitle('');
      setOccurredAt(new Date().toISOString().slice(0, 16));
      setDescription('');
      setLocation('');
      setStatus('open');
      setClientVisible(true);
      setRequiresFollowUp(false);
    }
    setErrors({});
  }, [editingIncident]);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!siteId) e.siteId = 'Site is required';
    if (!incidentType) e.incidentType = 'Type is required';
    if (!severity) e.severity = 'Severity is required';
    if (!occurredAt) e.occurredAt = 'Date/time is required';
    if (!description || description.length < 20) e.description = 'Description must be at least 20 characters';
    if (!status) e.status = 'Status is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (saving || !validate()) return;
    onSave({
      site_id: siteId,
      guard_id: guardId || null,
      shift_id: shiftId || null,
      incident_type: incidentType,
      severity,
      title: title || incidentType,
      occurred_at: new Date(occurredAt).toISOString(),
      description,
      location: location || null,
      status,
      client_visible: clientVisible,
      requires_follow_up: requiresFollowUp,
    });
  };

  const sevOptions = ['low', 'medium', 'high', 'critical'];

  return (
    <div className={fullPage ? "max-w-4xl mx-auto" : "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"}>
      <div className={`bg-[#151b27] border border-gray-800 rounded-xl w-full shadow-2xl ${fullPage ? "" : "max-w-lg max-h-[90vh] overflow-y-auto"}`}>
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">{editingIncident ? 'Edit Incident' : 'Log Incident'}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white cursor-pointer">
            <div className="w-5 h-5 flex items-center justify-center"><i className="ri-close-line"></i></div>
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {saveError && <p role="alert" className="text-red-400">{saveError}</p>}
          <SectionLabel>Incident Details</SectionLabel>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Site <span className="text-red-400">*</span></label>
              <select
                value={siteId}
                onChange={(e) => { setSiteId(e.target.value); setShiftId(''); }}
                className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 cursor-pointer pr-8"
              >
                <option value="" disabled>Select site...</option>
                {sites.map((s) => <option key={s.id} value={s.id}>{s.site_name}</option>)}
              </select>
              {errors.siteId && <p className="text-red-400 text-xs mt-1">{errors.siteId}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Incident Type <span className="text-red-400">*</span></label>
              <select
                value={incidentType}
                onChange={(e) => { setIncidentType(e.target.value); if (!title) setTitle(e.target.value); }}
                className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 cursor-pointer pr-8"
              >
                <option value="" disabled>Select type...</option>
                {INCIDENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              {errors.incidentType && <p className="text-red-400 text-xs mt-1">{errors.incidentType}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Severity <span className="text-red-400">*</span></label>
            <div className="flex gap-2">
              {sevOptions.map((sev) => {
                const active = severity === sev;
                const c = SEVERITY_COLORS[sev];
                return (
                  <button
                    key={sev}
                    onClick={() => setSeverity(sev)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer whitespace-nowrap ${
                      active ? `${c.bg} ${c.text} ${sev === 'low' ? 'border-emerald-500/50' : sev === 'medium' ? 'border-amber-500/50' : sev === 'high' ? 'border-orange-500/50' : 'border-red-500/50'}` : 'border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800/50'
                    }`}
                  >
                    <span className={`inline-block w-2 h-2 rounded-full ${c.dot} mr-1.5`}></span>
                    {sev.charAt(0).toUpperCase() + sev.slice(1)}
                  </button>
                );
              })}
            </div>
            {errors.severity && <p className="text-red-400 text-xs mt-1">{errors.severity}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Date/Time <span className="text-red-400">*</span></label>
              <input
                type="datetime-local"
                value={occurredAt}
                onChange={(e) => setOccurredAt(e.target.value)}
                className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
              {errors.occurredAt && <p className="text-red-400 text-xs mt-1">{errors.occurredAt}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Where did this happen?"
                className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={incidentType || 'Brief summary of incident'}
              className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <SectionLabel>Description</SectionLabel>
          <div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              maxLength={500}
              className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
              placeholder="Describe the incident in detail (min 20 chars)..."
            />
            <div className="flex items-center justify-between mt-1">
              {errors.description && <p className="text-red-400 text-xs">{errors.description}</p>}
              <div className="text-right text-xs text-gray-500 ml-auto">{description.length}/500</div>
            </div>
          </div>

          <SectionLabel>People</SectionLabel>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Reported By Guard</label>
              <select
                value={guardId}
                onChange={(e) => setGuardId(e.target.value)}
                className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 cursor-pointer pr-8"
              >
                <option value="">—</option>
                {guards.map((g) => <option key={g.id} value={g.id}>{g.first_name} {g.last_name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Active Shift</label>
              <select
                value={shiftId}
                onChange={(e) => setShiftId(e.target.value)}
                className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 cursor-pointer pr-8"
              >
                <option value="">—</option>
                {shifts.filter(s => !siteId || s.site_id === siteId).map((s) => {
                  const g = guards.find(x => x.id === s.guard_id);
                  return (
                    <option key={s.id} value={s.id}>
                      {g ? `${g.first_name} ${g.last_name}` : 'Officer'} — {new Date(s.start_time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <SectionLabel>Status</SectionLabel>
          {editingIncident && (
            <div>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 cursor-pointer pr-8"
              >
                <option value="open">Open</option>
                <option value="reviewing">Reviewing</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          )}
          {!editingIncident && (
            <div className="text-sm text-gray-500">New incidents are logged as Open.</div>
          )}

          <div className="flex items-center gap-6 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={clientVisible}
                onChange={(e) => setClientVisible(e.target.checked)}
                className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-300">Visible to client</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={requiresFollowUp}
                onChange={(e) => setRequiresFollowUp(e.target.checked)}
                className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-300">Requires follow-up</span>
            </label>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-800 flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap">Cancel</button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap"
          >
            {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
            {editingIncident ? 'Save' : 'Log Incident'}
          </button>
        </div>
      </div>
    </div>
  );
}