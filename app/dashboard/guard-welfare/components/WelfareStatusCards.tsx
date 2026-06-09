import { useGuardWelfare, type WelfareGuard } from '@/lib/useGuardWelfare';
import GlassCard from '@/app/components/GlassCard';

interface StatusCardsProps {
  guards: WelfareGuard[];
  sessions: ReturnType<typeof useGuardWelfare>['sessions'];
  incidents: ReturnType<typeof useGuardWelfare>['welfareIncidents'];
  notifications: ReturnType<typeof useGuardWelfare>['notifications'];
}

function Card({
  icon,
  label,
  value,
  sub,
  color,
  pulse,
}: {
  icon: string;
  label: string;
  value: number;
  sub: string;
  color: 'emerald' | 'amber' | 'orange' | 'red' | 'blue' | 'gray';
  pulse?: boolean;
}) {
  const colorMap = {
    emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', dot: 'bg-emerald-500' },
    amber: { text: 'text-amber-400', bg: 'bg-amber-500/10', dot: 'bg-amber-500' },
    orange: { text: 'text-orange-400', bg: 'bg-orange-500/10', dot: 'bg-orange-500' },
    red: { text: 'text-red-400', bg: 'bg-red-500/10', dot: 'bg-red-500' },
    blue: { text: 'text-blue-400', bg: 'bg-blue-500/10', dot: 'bg-blue-500' },
    gray: { text: 'text-gray-400', bg: 'bg-gray-500/10', dot: 'bg-gray-500' },
  };
  const c = colorMap[color];

  return (
    <GlassCard className="p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-9 h-9 rounded-lg ${c.bg} flex items-center justify-center`}>
          <div className={`w-5 h-5 flex items-center justify-center ${c.text}`}>
            <i className={icon}></i>
          </div>
        </div>
        <span className="text-sm text-gray-400">{label}</span>
        {pulse && value > 0 && (
          <span className="relative flex h-2.5 w-2.5 ml-auto">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <span className={`text-2xl font-bold ${c.text}`}>{value}</span>
      </div>
      <p className="text-xs text-gray-500 mt-1">{sub}</p>
    </GlassCard>
  );
}

export default function WelfareStatusCards({ guards, sessions, incidents, notifications }: StatusCardsProps) {
  const onDuty = guards.filter((g) => g.on_duty).length;
  const missedCheckCalls = sessions.reduce((sum, s) => sum + (s.missed_check_ins || 0), 0);
  const overdueChecks = sessions.filter(
    (s) => s.next_check_in_due_at && new Date(s.next_check_in_due_at) < new Date() && s.status === 'active'
  ).length;
  const panicAlerts = notifications.filter(
    (n) => !n.read_at && (n.type?.toLowerCase().includes('panic') || n.type?.toLowerCase().includes('sos') || n.severity === 'critical')
  ).length;
  const noRecentActivity = guards.filter(
    (g) => (g as any).no_recent_activity && g.on_duty
  ).length;
  const escalationsAwaiting = sessions.filter(
    (s) => (s.escalation_level || 0) >= 3 && !s.alarm_acknowledged_at && s.alarm_triggered_at
  ).length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <Card icon="ri-shield-user-line" label="On Duty" value={onDuty} sub="Guards currently active" color="emerald" />
      <Card icon="ri-phone-lock-line" label="Missed Checks" value={missedCheckCalls} sub="Total missed check calls today" color="amber" pulse={missedCheckCalls > 0} />
      <Card icon="ri-time-line" label="Overdue" value={overdueChecks} sub="Check calls past due" color="orange" pulse={overdueChecks > 0} />
      <Card icon="ri-alarm-warning-line" label="Panic Alerts" value={panicAlerts} sub="Unread panic / SOS alerts" color="red" pulse={panicAlerts > 0} />
      <Card icon="ri-user-unfollow-line" label="No Activity" value={noRecentActivity} sub="Guards inactive > 4h on shift" color="gray" pulse={noRecentActivity > 0} />
      <Card icon="ri-alert-line" label="Escalations" value={escalationsAwaiting} sub="Critical awaiting action" color="red" pulse={escalationsAwaiting > 0} />
    </div>
  );
}