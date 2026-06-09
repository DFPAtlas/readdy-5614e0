'use client';

export default function RecentCheckIns() {
  const checkIns = [
    {
      location: 'Downtown Office',
      officer: 'J. Smith',
      time: '2 mins ago',
      status: 'active'
    },
    {
      location: 'Westside Mall',
      officer: 'R. Johnson',
      time: '5 mins ago',
      status: 'active'
    },
    {
      location: 'Harbor Warehouse',
      officer: 'No Activity',
      time: '7 mins ago',
      status: 'inactive'
    },
    {
      location: 'Tech Park Building B',
      officer: 'Calling...',
      time: 'Now',
      status: 'calling'
    },
    {
      location: 'North Campus',
      officer: 'M. Williams',
      time: '12 mins ago',
      status: 'active'
    }
  ];

  return (
    <div className="bg-slate-600 rounded-lg p-6 text-white mt-6">
      <h2 className="text-lg font-semibold mb-4">Recent Check-ins</h2>
      
      <div className="space-y-4">
        {checkIns.map((checkIn, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-sm font-medium text-white">{checkIn.location}</div>
              <div className={`text-xs ${
                checkIn.status === 'active' ? 'text-blue-300' : 
                checkIn.status === 'calling' ? 'text-yellow-300' : 
                'text-red-300'
              }`}>
                {checkIn.officer}
              </div>
            </div>
            <div className="text-xs text-gray-300">{checkIn.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
}