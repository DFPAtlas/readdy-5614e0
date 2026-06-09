import GlassCard from '@/app/components/GlassCard';

const escalationRules = [
  {
    level: 1,
    label: 'Warning',
    description: '1 missed check-in',
    action: 'Auto-reminder sent to guard',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    icon: 'ri-notification-3-line',
  },
  {
    level: 2,
    label: 'Supervisor Alert',
    description: '2 missed check-ins',
    action: 'Supervisor notified via SMS/email',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
    icon: 'ri-user-voice-line',
  },
  {
    level: 3,
    label: 'Critical Escalation',
    description: '3+ missed check-ins',
    action: 'Control room alerted + manager callout',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    icon: 'ri-alarm-warning-line',
  },
  {
    level: 0,
    label: 'Panic Alert',
    description: 'Guard triggers SOS / panic button',
    action: 'Immediate critical alert + location broadcast',
    color: 'text-red-500',
    bg: 'bg-red-500/20',
    border: 'border-red-500/30',
    icon: 'ri-alert-line',
  },
];

export default function EscalationRulesPanel() {
  return (
    <GlassCard className="overflow-hidden">
      <div className="flex items-center gap-2 px-5 pt-5 pb-3">
        <div className="w-5 h-5 flex items-center justify-center text-purple-400">
          <i className="ri-settings-5-line text-sm"></i>
        </div>
        <h3 className="text-sm font-semibold text-white">Escalation Rules</h3>
      </div>

      <div className="px-5 pb-5 space-y-3">
        {escalationRules.map((rule) => (
          <div
            key={rule.level}
            className={`rounded-xl border ${rule.border} ${rule.bg} p-4`}
          >
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-5 h-5 flex items-center justify-center ${rule.color}`}>
                <i className={rule.icon}></i>
              </div>
              <span className={`text-sm font-semibold ${rule.color}`}>{rule.label}</span>
              {rule.level === 0 && (
                <span className="ml-auto px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 text-[10px] font-bold">
                  IMMEDIATE
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mb-1">{rule.description}</p>
            <p className="text-xs text-gray-500">
              Action: <span className="text-gray-300 font-medium">{rule.action}</span>
            </p>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}