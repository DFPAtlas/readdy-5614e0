import Link from 'next/link';

interface QuickActionBarProps {
  onCreateIncident?: () => void;
  onAddOB?: () => void;
  onOpenPatrol?: () => void;
  onOpenRota?: () => void;
  onRaiseTicket?: () => void;
}

export default function QuickActionBar({
  onCreateIncident,
  onAddOB,
  onOpenPatrol,
  onOpenRota,
  onRaiseTicket,
}: QuickActionBarProps) {
  const actions = [
    {
      label: 'Create Incident',
      icon: 'ri-alarm-warning-line',
      color: 'bg-red-500/10 text-red-400 hover:bg-red-500/20',
      onClick: onCreateIncident,
      href: '/incidents',
    },
    {
      label: 'Add OB Entry',
      icon: 'ri-book-line',
      color: 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20',
      onClick: onAddOB,
      href: '/occurrence-book',
    },
    {
      label: 'Patrol Monitoring',
      icon: 'ri-route-line',
      color: 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20',
      onClick: onOpenPatrol,
      href: '/dashboard/patrol-monitoring',
    },
    {
      label: 'Open Rota',
      icon: 'ri-calendar-event-line',
      color: 'bg-purple-500/10 text-purple-400 hover:bg-purple-500/20',
      onClick: onOpenRota,
      href: '/rotas',
    },
    {
      label: 'Raise Ticket',
      icon: 'ri-customer-service-2-line',
      color: 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20',
      onClick: onRaiseTicket,
      href: '/client/support/new',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {actions.map((action) => (
        <Link
          key={action.label}
          href={action.href}
          onClick={action.onClick}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl border border-white/10 transition-all cursor-pointer ${action.color}`}
        >
          <div className="w-5 h-5 flex items-center justify-center shrink-0">
            <i className={action.icon}></i>
          </div>
          <span className="text-sm font-medium whitespace-nowrap">{action.label}</span>
        </Link>
      ))}
    </div>
  );
}