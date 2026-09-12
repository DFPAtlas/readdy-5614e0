'use client';

interface RotaStatusStripProps {
  totalShifts: number;
  filled: number;
  unassigned: number;
  conflicts: number;
  overtime: number;
  leave: number;
  published: boolean;
}

function Cell({ label, value, tone, icon }: { label: string; value: number; tone: 'green' | 'amber' | 'red' | 'neutral'; icon: string }) {
  const color =
    tone === 'red' ? 'text-red-400' :
    tone === 'amber' ? 'text-amber-400' :
    tone === 'green' ? 'text-emerald-400' :
    'text-gray-200';
  const bg =
    tone === 'red' ? 'bg-red-500/10 border-red-500/20' :
    tone === 'amber' ? 'bg-amber-500/10 border-amber-500/20' :
    'bg-[#111827] border-gray-800';

  return (
    <div className={`rounded-xl px-3.5 py-3 border ${bg}`}>
      <div className="flex items-center gap-2">
        <div className={`w-4 h-4 flex items-center justify-center ${color}`}>
          <i className={`${icon} text-xs`}></i>
        </div>
        <span className={`text-lg font-bold leading-none ${color}`}>{value}</span>
      </div>
      <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mt-1.5 truncate">{label}</p>
    </div>
  );
}

export default function RotaStatusStrip({
  totalShifts,
  filled,
  unassigned,
  conflicts,
  overtime,
  leave,
  published,
}: RotaStatusStripProps) {
  const publishTone = published ? 'Published / Locked' : 'Draft';
  const publishColor = published ? 'text-amber-400' : 'text-emerald-400';
  const publishBg = published ? 'bg-amber-500/10 border-amber-500/20' : 'bg-emerald-500/10 border-emerald-500/20';
  const publishIcon = published ? 'ri-lock-line' : 'ri-lock-unlock-line';

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
      <Cell label="Total Shifts" value={totalShifts} tone="neutral" icon="ri-calendar-todo-line" />
      <Cell label="Filled" value={filled} tone={filled > 0 ? 'green' : 'neutral'} icon="ri-check-double-line" />
      <Cell label="Unassigned" value={unassigned} tone={unassigned > 0 ? 'amber' : 'green'} icon="ri-user-unfollow-line" />
      <Cell label="Conflicts" value={conflicts} tone={conflicts > 0 ? 'red' : 'green'} icon="ri-error-warning-line" />
      <Cell label="On Leave" value={leave} tone={leave > 0 ? 'amber' : 'neutral'} icon="ri-hospital-line" />
      <Cell label="Overtime" value={overtime} tone={overtime > 0 ? 'amber' : 'green'} icon="ri-time-line" />
      <div className={`rounded-xl px-3.5 py-3 border ${publishBg}`}>
        <div className="flex items-center gap-2">
          <div className={`w-4 h-4 flex items-center justify-center ${publishColor}`}>
            <i className={`${publishIcon} text-xs`}></i>
          </div>
          <span className={`text-sm font-bold leading-none ${publishColor}`}>{publishTone}</span>
        </div>
        <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mt-1.5 truncate">Publish State</p>
      </div>
    </div>
  );
}