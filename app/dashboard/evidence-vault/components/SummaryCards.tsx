import GlassCard from '@/app/components/GlassCard';

interface Props {
  stats: {
    totalFiles: number;
    todayUploaded: number;
    linkedToOpenIncidents: number;
    unreviewed: number;
    storageBytes: number;
  };
}

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

const cards = [
  {
    key: 'totalFiles',
    label: 'Total Files',
    icon: 'ri-folder-5-line',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-400',
  },
  {
    key: 'todayUploaded',
    label: 'Uploaded Today',
    icon: 'ri-upload-cloud-line',
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-400',
  },
  {
    key: 'linkedToOpenIncidents',
    label: 'Linked to Open Incidents',
    icon: 'ri-alarm-warning-line',
    iconBg: 'bg-orange-500/10',
    iconColor: 'text-orange-400',
  },
  {
    key: 'unreviewed',
    label: 'Unreviewed',
    icon: 'ri-eye-off-line',
    iconBg: 'bg-red-500/10',
    iconColor: 'text-red-400',
    pulse: true,
  },
  {
    key: 'storageBytes',
    label: 'Storage Used',
    icon: 'ri-hard-drive-line',
    iconBg: 'bg-purple-500/10',
    iconColor: 'text-purple-400',
  },
];

export default function SummaryCards({ stats }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((card) => {
        const value = card.key === 'storageBytes' ? formatBytes(stats.storageBytes) : stats[card.key as keyof typeof stats];
        return (
          <GlassCard key={card.key} className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center flex-shrink-0`}>
                <div className="w-5 h-5 flex items-center justify-center">
                  <i className={`${card.icon} ${card.iconColor} ${card.pulse ? 'animate-pulse' : ''}`}></i>
                </div>
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-400 truncate">{card.label}</p>
                <p className="text-xl font-bold text-white mt-0.5">{value}</p>
              </div>
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
}