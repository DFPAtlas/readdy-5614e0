import { useState } from 'react';
import type { Guard } from '@/lib/useGuards';
import { getFullName, getInitials, getDaysUntil, getSIAStatus } from '@/lib/useGuards';
import SkillsChips from './SkillsChips';
import GuardAvailabilityEditor from './GuardAvailabilityEditor';
import GuardTimeOffEditor from './GuardTimeOffEditor';

function avatarGradient(id: string) {
  const gradients = [
    'bg-gradient-to-br from-blue-500/20 to-cyan-500/20 text-blue-300',
    'bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-300',
    'bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 text-violet-300',
    'bg-gradient-to-br from-orange-500/20 to-red-500/20 text-orange-300',
    'bg-gradient-to-br from-sky-500/20 to-indigo-500/20 text-sky-300',
    'bg-gradient-to-br from-rose-500/20 to-pink-500/20 text-rose-300',
  ];
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) % gradients.length;
  return gradients[Math.abs(hash)];
}

interface Props {
  guard: Guard | null;
  onClose: () => void;
  onEdit: (guard: Guard) => void;
}

export default function GuardProfileDrawer({ guard, onClose, onEdit }: Props) {
  const [tab, setTab] = useState<'overview' | 'shifts' | 'incidents' | 'documents' | 'availability' | 'timeoff'>('overview');

  if (!guard) return null;

  const daysLeft = getDaysUntil(guard.sia_expiry);
  const siaStatus = getSIAStatus(guard.sia_expiry);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-[#111827] border-l border-gray-800 h-full overflow-y-auto">
        <div className="sticky top-0 bg-[#111827] border-b border-gray-800 px-5 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-semibold text-white">Guard Profile</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer">
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-close-line"></i></div>
          </button>
        </div>

        <div className="px-5 py-6">
          <div className="flex items-center gap-4 mb-6">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold ${avatarGradient(guard.id)}`}>
              {getInitials(guard)}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{getFullName(guard)}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${(guard.status || 'active') === 'active' ? 'bg-emerald-500/10 text-emerald-400' : (guard.status || 'active') === 'suspended' ? 'bg-amber-500/10 text-amber-400' : 'bg-gray-500/10 text-gray-400'}`}>
                  {(guard.status || 'active').charAt(0).toUpperCase() + (guard.status || 'active').slice(1)}
                </span>
                <span className="text-xs text-gray-500">{guard.email || 'No email'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-gray-800/40 rounded-lg p-1 mb-6">
            {(['overview', 'shifts', 'incidents', 'documents', 'availability', 'timeoff'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 text-xs font-medium px-3 py-1.5 rounded-md transition-colors cursor-pointer whitespace-nowrap ${tab === t ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                {t === 'timeoff' ? 'Time Off' : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {tab === 'overview' && (
            <div className="space-y-5">
              <div className="bg-gray-800/40 border border-gray-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-white flex items-center gap-2">
                    <div className="w-4 h-4 flex items-center justify-center"><i className="ri-shield-check-line text-blue-400"></i></div>
                    SIA Licence
                  </h4>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${siaStatus === 'expired' ? 'bg-red-500/10 text-red-400' : siaStatus === 'expiring_soon' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                    {siaStatus === 'expired' ? 'Expired' : siaStatus === 'expiring_soon' ? (daysLeft != null && daysLeft >= 0 ? `Expiring in ${daysLeft} days` : 'Expiring soon') : 'Valid'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Licence Number</p>
                    <p className="text-gray-300 font-mono">{guard.sia_licence ? `****${guard.sia_licence.slice(-4)}` : '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Expires</p>
                    <p className="text-gray-300">{guard.sia_expiry || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Hourly Rate</p>
                    <p className="text-gray-300">{guard.hourly_rate != null ? `£${Number(guard.hourly_rate).toFixed(2)}/hr` : '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Phone</p>
                    <p className="text-gray-300">{guard.phone || '—'}</p>
                  </div>
                </div>
                {guard.sia_expiry && (
                  <div className="mt-3">
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${daysLeft != null && daysLeft < 0 ? 'bg-red-500' : daysLeft != null && daysLeft <= 60 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.max(0, Math.min(100, (daysLeft != null ? Math.max(0, daysLeft) : 365) / 365 * 100))}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {daysLeft != null && daysLeft < 0 ? `${Math.abs(daysLeft)} days overdue` : `${daysLeft} days remaining until expiry`}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-sm font-medium text-white mb-2">Skills</h4>
                <SkillsChips skills={guard.skills} showAll />
                {(!guard.skills || guard.skills.length === 0) && (
                  <p className="text-sm text-gray-500">No skills recorded.</p>
                )}
              </div>

              <button
                onClick={() => { onEdit(guard); onClose(); }}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
              >
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-edit-line"></i></div>
                Edit Guard
              </button>
            </div>
          )}

          {tab === 'shifts' && (
            <div className="text-center py-8">
              <div className="w-10 h-10 mx-auto mb-3 flex items-center justify-center text-gray-600">
                <i className="ri-calendar-event-line text-2xl"></i>
              </div>
              <p className="text-sm text-gray-500">Shift history coming soon</p>
            </div>
          )}

          {tab === 'incidents' && (
            <div className="text-center py-8">
              <div className="w-10 h-10 mx-auto mb-3 flex items-center justify-center text-gray-600">
                <i className="ri-alarm-warning-line text-2xl"></i>
              </div>
              <p className="text-sm text-gray-500">Incident history coming soon</p>
            </div>
          )}

          {tab === 'documents' && (
            <div className="text-center py-8">
              <div className="w-10 h-10 mx-auto mb-3 flex items-center justify-center text-gray-600">
                <i className="ri-file-list-line text-2xl"></i>
              </div>
              <p className="text-sm text-gray-500">Document management coming soon</p>
            </div>
          )}

          {tab === 'availability' && (
            <div>
              <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-calendar-check-line text-blue-400"></i></div>
                Weekly Availability
              </h4>
              <GuardAvailabilityEditor guardId={guard.id} />
            </div>
          )}

          {tab === 'timeoff' && (
            <div>
              <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-time-line text-amber-400"></i></div>
                Time Off
              </h4>
              <GuardTimeOffEditor guardId={guard.id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}