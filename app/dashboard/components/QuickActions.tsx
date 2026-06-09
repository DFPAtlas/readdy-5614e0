'use client';

import Link from 'next/link';

export default function QuickActions() {
  const actions = [
    {
      title: 'Sites',
      icon: 'ri-building-line',
      href: '/sites',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'Guards',
      icon: 'ri-user-line',
      href: '/guards',
      color: 'bg-green-100 text-green-600'
    },
    {
      title: 'Incidents',
      icon: 'ri-file-text-line',
      href: '/incidents',
      color: 'bg-orange-100 text-orange-600'
    },
    {
      title: 'AI Risk Assessment',
      icon: 'ri-robot-line',
      href: '/dashboard/ai-assistant',
      color: 'bg-purple-100 text-purple-600'
    }
  ];

  return (
    <div className="bg-white/70 backdrop-blur-sm border border-white/50 shadow-sm rounded-xl p-5 mb-6">
      <h3 className="text-sm font-bold text-gray-900 mb-4">Quick Actions</h3>
      <div className="space-y-2">
        {actions.map((action, index) => (
          <Link 
            key={index} 
            href={action.href}
            className="flex items-center space-x-3 p-2.5 rounded-lg hover:bg-white/80 transition-colors cursor-pointer"
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${action.color}`}>
              <div className="w-5 h-5 flex items-center justify-center">
                <i className={`${action.icon} text-sm`}></i>
              </div>
            </div>
            <span className="text-sm font-medium text-gray-700">{action.title}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}