'use client';

interface GuardsOnDutyProps {
  onOpenModal: (type: string) => void;
}

export default function GuardsOnDuty({ onOpenModal }: GuardsOnDutyProps) {
  const guards = [
    {
      name: 'J. Smith',
      position: 'Senior Security Officer',
      location: 'West Campus',
      status: 'Active',
      lastCheck: '2 mins ago',
      phone: '+44 7700 900123'
    },
    {
      name: 'R. Johnson',
      position: 'Security Guard',
      location: 'South Building',
      status: 'Active',
      lastCheck: '5 mins ago',
      phone: '+44 7700 900124'
    },
    {
      name: 'M. Williams',
      position: 'Security Officer',
      location: 'North Campus',
      status: 'Active',
      lastCheck: '12 mins ago',
      phone: '+44 7700 900125'
    },
    {
      name: 'T. Garcia',
      position: 'Security Guard',
      location: 'East Medical Center',
      status: 'Incident Response',
      lastCheck: '18 mins ago',
      phone: '+44 7700 900126'
    }
  ];

  return (
    <div className="bg-slate-600 rounded-lg p-6 text-white">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Guards on Duty</h2>
        <span className="text-sm text-gray-300">{guards.length} Active</span>
      </div>
      
      <div className="space-y-4">
        {guards.map((guard, index) => (
          <div key={index} className="bg-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium">{guard.name.split(' ').map(n => n[0]).join('')}</span>
                </div>
                <div>
                  <div className="font-medium text-white">{guard.name}</div>
                  <div className="text-xs text-gray-300">{guard.position}</div>
                </div>
              </div>
              <div className={`w-3 h-3 rounded-full ${
                guard.status === 'Active' ? 'bg-green-500' : 
                guard.status === 'Incident Response' ? 'bg-red-500' : 
                'bg-yellow-500'
              }`}></div>
            </div>
            
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-300">Location:</span>
                <span className="text-white">{guard.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Status:</span>
                <span className={`${
                  guard.status === 'Active' ? 'text-green-400' :
                  guard.status === 'Incident Response' ? 'text-red-400' :
                  'text-yellow-400'
                }`}>{guard.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Last Check:</span>
                <span className="text-white">{guard.lastCheck}</span>
              </div>
            </div>
            
            <div className="flex justify-between mt-3 pt-3 border-t border-slate-600">
              <button 
                onClick={() => onOpenModal('contact')}
                className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                Contact
              </button>
              <button 
                onClick={() => onOpenModal('patrol-log')}
                className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                Patrol Log
              </button>
              <button 
                onClick={() => onOpenModal('details')}
                className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                Details
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 grid grid-cols-2 gap-3">
        <button 
          onClick={() => onOpenModal('risk-assessment')}
          className="px-4 py-2 bg-orange-600 text-white text-sm rounded hover:bg-orange-700 transition-colors cursor-pointer whitespace-nowrap"
        >
          Risk Assessment
        </button>
        <button 
          onClick={() => onOpenModal('incident-report')}
          className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors cursor-pointer whitespace-nowrap"
        >
          Incident Report
        </button>
      </div>
    </div>
  );
}