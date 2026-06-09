'use client';

import { useRouter } from 'next/navigation';

interface FinishScreenProps {
  companyName: string | null;
  stepsCompleted: number;
  totalSteps: number;
  onRestart: () => void;
}

export default function FinishScreen({ companyName, stepsCompleted, totalSteps, onRestart }: FinishScreenProps) {
  const router = useRouter();

  const progressItems = [
    { label: 'Company Profile', icon: 'ri-building-2-line', done: true, link: '/dashboard/settings' },
    { label: 'First Site', icon: 'ri-map-pin-line', done: true, link: '/sites' },
    { label: 'Guards Added', icon: 'ri-shield-user-line', done: true, link: '/guards' },
    { label: 'Rota Created', icon: 'ri-calendar-event-line', done: true, link: '/rotas' },
    { label: 'Compliance Documents', icon: 'ri-file-shield-line', done: false, link: '/dashboard/compliance/documents' },
    { label: 'Command Centre', icon: 'ri-command-line', done: false, link: '/dashboard/command-centre' },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="ri-check-double-line text-emerald-400 text-2xl" />
        </div>
        <h2 className="text-xl font-bold text-white mb-1">Setup Complete</h2>
        <p className="text-sm text-gray-400">
          {companyName || 'Your company'} is ready to use GuardianHub.
        </p>
      </div>

      <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-emerald-400">Setup Progress</span>
          <span className="text-xs text-gray-500">
            {stepsCompleted}/{totalSteps} steps done
          </span>
        </div>
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all"
            style={{ width: `${(stepsCompleted / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        {progressItems.map((item) => (
          <button
            key={item.label}
            onClick={() => router.push(item.link)}
            className="w-full flex items-center gap-3 px-4 py-3 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-all cursor-pointer text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
              <i className={`${item.icon} ${item.done ? 'text-emerald-400' : 'text-gray-500'} text-sm`} />
            </div>
            <div className="flex-1">
              <span className={`text-sm ${item.done ? 'text-white font-medium' : 'text-gray-400'}`}>{item.label}</span>
            </div>
            {item.done ? (
              <i className="ri-check-line text-emerald-400 text-sm" />
            ) : (
              <span className="text-xs text-gray-500">Next</span>
            )}
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => router.push('/dashboard/command-centre')}
          className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center gap-2"
        >
          <i className="ri-command-line" /> Go to Command Centre
        </button>
        <button
          onClick={() => router.push('/dashboard')}
          className="flex-1 bg-white/10 hover:bg-white/15 text-white text-sm font-medium py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center gap-2"
        >
          <i className="ri-dashboard-line" /> Go to Dashboard
        </button>
      </div>

      <button
        onClick={onRestart}
        className="w-full text-gray-500 hover:text-gray-400 text-sm font-medium py-2.5 transition-colors cursor-pointer whitespace-nowrap"
      >
        <i className="ri-refresh-line mr-1" /> Restart Setup Wizard
      </button>
    </div>
  );
}