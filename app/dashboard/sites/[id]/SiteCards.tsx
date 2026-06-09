'use client';

export default function SiteCards() {
  const sites = [
    {
      name: 'West Campus',
      location: 'J. Smith',
      status: 'All Clear',
      nextCheck: '58 mins',
      statusColor: 'bg-green-500',
      officer: 'J. Smith',
      actions: ['Details', 'Call Now', 'History']
    },
    {
      name: 'South',
      location: 'R. Johnson',
      status: 'All Clear',
      nextCheck: '55 mins',
      statusColor: 'bg-green-500',
      officer: 'R. Johnson',
      actions: ['Details', 'Call Now', 'History']
    },
    {
      name: 'Harbor',
      location: 'Unresponsive',
      status: 'No Activity',
      nextCheck: '3 mins (retry)',
      statusColor: 'bg-red-500',
      officer: 'Officer',
      actions: ['Details', 'Call Now', 'History']
    },
    {
      name: 'Tech Park',
      location: 'In Progress',
      status: 'Calling',
      nextCheck: '60 mins',
      statusColor: 'bg-yellow-500',
      officer: 'Officer',
      actions: ['Details', 'Call Now', 'History']
    },
    {
      name: 'North Campus',
      location: 'M. Williams',
      status: 'All Clear',
      nextCheck: '46 mins',
      statusColor: 'bg-green-500',
      officer: 'M. Williams',
      actions: ['Details', 'Call Now', 'History']
    },
    {
      name: 'East Medical Center',
      location: 'T. Garcia',
      status: 'Issue Reported',
      nextCheck: '42 mins',
      statusColor: 'bg-red-500',
      officer: 'T. Garcia',
      actions: ['Details', 'Call Now', 'History']
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {sites.map((site, index) => (
        <div key={index} className="bg-slate-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-white">{site.name}</h3>
            <div className={`w-3 h-3 rounded-full ${site.statusColor}`}></div>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-300">Last Check-in:</span>
              <span className="text-white">{site.nextCheck}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-300">Officer:</span>
              <span className="text-white">{site.officer}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-300">Status:</span>
              <span className={`${
                site.status === 'All Clear' ? 'text-green-400' :
                site.status === 'Issue Reported' ? 'text-red-400' :
                site.status === 'Calling' ? 'text-yellow-400' :
                'text-red-400'
              }`}>{site.status}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-300">Next Check:</span>
              <span className="text-white">{site.nextCheck}</span>
            </div>
          </div>
          
          <div className="flex justify-between mt-4 pt-3 border-t border-slate-500">
            {site.actions.map((action, actionIndex) => (
              <button 
                key={actionIndex}
                className="px-3 py-1 bg-slate-500 text-white text-xs rounded hover:bg-slate-400 transition-colors cursor-pointer whitespace-nowrap"
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}