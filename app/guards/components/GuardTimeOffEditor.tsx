import { useState } from 'react';
import { useGuardAvailability, addTimeOff, deleteTimeOff } from '@/lib/useGuardAvailability';

type LeaveReason = 'holiday' | 'sick' | 'training' | 'other';

const REASON_OPTIONS: { value: LeaveReason; label: string; color: string }[] = [
  { value: 'holiday', label: 'Holiday', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  { value: 'sick', label: 'Sick Leave', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
  { value: 'training', label: 'Training', color: 'bg-violet-500/10 text-violet-400 border-violet-500/20' },
  { value: 'other', label: 'Other', color: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
];

export default function GuardTimeOffEditor({ guardId }: { guardId: string }) {
  const { timeOff, loading, refetch } = useGuardAvailability();
  const [form, setForm] = useState<{ start_date: string; end_date: string; reason: LeaveReason }>({ start_date: '', end_date: '', reason: 'holiday' });
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    if (!form.start_date || !form.end_date) return;
    if (new Date(form.start_date) > new Date(form.end_date)) return;
    setAdding(true);
    await addTimeOff(guardId, form.start_date, form.end_date, form.reason);
    await refetch();
    setForm({ start_date: '', end_date: '', reason: 'holiday' });
    setAdding(false);
  };

  const handleDelete = async (id: string) => {
    await deleteTimeOff(id);
    await refetch();
  };

  return (
    <div className="space-y-4">
      <div className="bg-gray-800/40 border border-gray-800 rounded-xl p-4 space-y-3">
        <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider">Request Time Off</h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] text-gray-500 mb-1">Start Date</label>
            <input
              type="date"
              value={form.start_date}
              onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-[10px] text-gray-500 mb-1">End Date</label>
            <input
              type="date"
              value={form.end_date}
              onChange={(e) => setForm({ ...form, end_date: e.target.value })}
              className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-[10px] text-gray-500 mb-1">Reason</label>
          <div className="flex gap-2">
            {REASON_OPTIONS.map((r) => (
              <button
                key={r.value}
                onClick={() => setForm({ ...form, reason: r.value })}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-medium border transition-colors cursor-pointer whitespace-nowrap ${
                  form.reason === r.value ? `${r.color}` : 'bg-gray-800/40 text-gray-400 border-gray-700 hover:border-gray-600'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={handleAdd}
          disabled={adding || !form.start_date || !form.end_date}
          className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
        >
          {adding && <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
          Add Time Off
        </button>
      </div>

      <div className="space-y-2">
        {loading && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="w-3 h-3 border-2 border-gray-600/30 border-t-gray-500 rounded-full animate-spin"></div>
            Loading...
          </div>
        )}
        {timeOff.length === 0 && !loading && (
          <p className="text-sm text-gray-500 text-center py-4">No time off recorded.</p>
        )}
        {timeOff.map((to) => {
          const reason = REASON_OPTIONS.find((r) => r.value === to.reason);
          const isPending = to.status === 'pending';
          const isRejected = to.status === 'rejected';
          return (
            <div key={to.id} className={`bg-gray-800/30 border rounded-lg px-3 py-2.5 flex items-center justify-between ${isPending ? 'border-amber-500/15' : isRejected ? 'border-red-500/10 opacity-50' : 'border-gray-800'}`}>
              <div className="flex items-center gap-3">
                <span className={`text-[10px] px-1.5 py-0.5 rounded border ${reason?.color || 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                  {reason?.label || to.reason}
                </span>
                <span className="text-xs text-gray-300">
                  {to.start_date} — {to.end_date}
                </span>
                {isPending && (
                  <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">Pending</span>
                )}
                {isRejected && (
                  <span className="text-[10px] text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">Rejected</span>
                )}
              </div>
              <button
                onClick={() => handleDelete(to.id)}
                className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-red-400 transition-colors cursor-pointer"
              >
                <i className="ri-delete-bin-line text-xs"></i>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}