'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import { useForms } from '@/lib/useForms';
import IncidentReportForm from './components/IncidentReportForm';
import VisitorSignInForm from './components/VisitorSignInForm';
import PatrolCheckForm from './components/PatrolCheckForm';
import KeySignOutForm from './components/KeySignOutForm';
import DailyOccurrenceForm from './components/DailyOccurrenceForm';
import MaintenanceRequestForm from './components/MaintenanceRequestForm';

interface FormDef {
  id: string;
  label: string;
  icon: string;
  description: string;
  badge: string;
  component: React.ComponentType;
}

const forms: FormDef[] = [
  { id: 'incident', label: 'Incident Report', icon: 'ri-alarm-warning-line', description: 'Log security incidents, breaches, and safety events', badge: 'Critical', component: IncidentReportForm },
  { id: 'visitor', label: 'Visitor Sign-In', icon: 'ri-user-add-line', description: 'Record visitor entry, company, purpose, and host', badge: 'Entry', component: VisitorSignInForm },
  { id: 'patrol', label: 'Patrol Check', icon: 'ri-route-line', description: 'Log patrol rounds, checkpoints visited, and observations', badge: 'Routine', component: PatrolCheckForm },
  { id: 'key', label: 'Key Sign-Out', icon: 'ri-key-line', description: 'Track key issuances, returns, and authorised holders', badge: 'Asset', component: KeySignOutForm },
  { id: 'occurrence', label: 'Daily Occurrence', icon: 'ri-book-open-line', description: 'General occurrence book entries for the day', badge: 'Log', component: DailyOccurrenceForm },
  { id: 'maintenance', label: 'Maintenance Request', icon: 'ri-tools-line', description: 'Report faults, repairs, and facility issues', badge: 'Facility', component: MaintenanceRequestForm },
];

export default function FormsPage() {
  const { companyId } = useAuth();
  const { submissions, loading, refresh } = useForms(companyId);
  const [activeForm, setActiveForm] = useState<string>('incident');
  const [showRecent, setShowRecent] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const activeRef = useRef<HTMLDivElement>(null);

  const activeDef = forms.find((f) => f.id === activeForm) || forms[0];
  const ActiveComponent = activeDef.component;

  const filtered = filterType === 'all' ? submissions : submissions.filter((s) => s.form_type === filterType);

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activeForm]);

  const formTypeLabel = (id: string) => forms.find((f) => f.id === id)?.label || id;
  const formTypeColor = (id: string) => {
    const map: Record<string, string> = {
      incident: 'bg-red-500/10 text-red-400',
      visitor: 'bg-blue-500/10 text-blue-400',
      patrol: 'bg-emerald-500/10 text-emerald-400',
      key: 'bg-amber-500/10 text-amber-400',
      occurrence: 'bg-gray-500/10 text-gray-400',
      maintenance: 'bg-orange-500/10 text-orange-400',
    };
    return map[id] || 'bg-gray-500/10 text-gray-400';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Forms Collection</h1>
          <p className="text-gray-400 text-sm mt-1">Standardised operational forms for your security team</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowRecent(!showRecent)}
            className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-history-line"></i></div>
            {showRecent ? 'Hide History' : `Recent Submissions (${submissions.length})`}
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {forms.map((f) => {
          const count = submissions.filter((s) => s.form_type === f.id).length;
          const isActive = activeForm === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setActiveForm(f.id)}
              className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-600/10 border-blue-500/30'
                  : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isActive ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-gray-400'}`}>
                  <div className="w-4 h-4 flex items-center justify-center"><i className={f.icon}></i></div>
                </div>
                <span className="text-xs font-medium text-gray-500">{f.badge}</span>
              </div>
              <p className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-gray-300'}`}>{f.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{count} this week</p>
            </button>
          );
        })}
      </div>

      {/* Active form card */}
      <div ref={activeRef} className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl">
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
              <div className="w-5 h-5 flex items-center justify-center"><i className={activeDef.icon}></i></div>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">{activeDef.label}</h2>
              <p className="text-xs text-gray-400">{activeDef.description}</p>
            </div>
          </div>
        </div>
        <div className="p-5">
          <ActiveComponent />
        </div>
      </div>

      {/* Recent submissions panel */}
      {showRecent && (
        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl">
          <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Recent Submissions</h2>
            <div className="flex items-center gap-2">
              {(['all', ...forms.map((f) => f.id)] as string[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`text-xs font-medium px-2.5 py-1 rounded-full transition-colors cursor-pointer whitespace-nowrap ${
                    filterType === t
                      ? 'bg-blue-500/15 text-blue-400'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {t === 'all' ? 'All' : forms.find((f) => f.id === t)?.label}
                </button>
              ))}
            </div>
          </div>
          <div className="p-5">
            {loading ? (
              <div className="flex items-center justify-center gap-2 text-gray-500 text-sm py-8">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                Loading submissions...
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-10 h-10 mx-auto mb-3 flex items-center justify-center text-gray-600">
                  <i className="ri-file-list-3-line text-2xl"></i>
                </div>
                <p className="text-sm text-gray-500">No submissions yet. Submit your first form above.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map((sub) => (
                  <div key={sub.id} className="flex items-center gap-4 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      sub.form_type === 'incident' ? 'bg-red-400' :
                      sub.form_type === 'visitor' ? 'bg-blue-400' :
                      sub.form_type === 'patrol' ? 'bg-emerald-400' :
                      sub.form_type === 'key' ? 'bg-amber-400' :
                      sub.form_type === 'maintenance' ? 'bg-orange-400' : 'bg-gray-400'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${formTypeColor(sub.form_type)}`}>
                          {formTypeLabel(sub.form_type)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(sub.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 mt-0.5 truncate">
                        {sub.submission_data?.title || sub.submission_data?.entry || sub.submission_data?.description || 'No preview available'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}