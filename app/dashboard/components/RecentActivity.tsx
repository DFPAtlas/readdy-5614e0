
'use client';

export default function RecentActivity() {
  const activities = [
    {
      type: 'check-in',
      message: 'Emma Davis checked in at Riverside Office Complex',
      time: '2 mins ago',
      icon: 'ri-user-line',
      color: 'text-green-600'
    },
    {
      type: 'incident',
      message: 'Security breach reported at Industrial Park East',
      time: '15 mins ago',
      icon: 'ri-error-warning-line',
      color: 'text-red-600'
    },
    {
      type: 'patrol',
      message: 'GPS patrol completed at City Centre Mall',
      time: '32 mins ago',
      icon: 'ri-map-pin-line',
      color: 'text-blue-600'
    },
    {
      type: 'ai-alert',
      message: 'AI detected missed check-in at Warehouse District',
      time: '45 mins ago',
      icon: 'ri-robot-line',
      color: 'text-purple-600'
    },
    {
      type: 'report',
      message: 'Daily occurrence log submitted for Shopping Centre West',
      time: '1 hour ago',
      icon: 'ri-file-text-line',
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-start space-x-3">
            <div className={`w-2 h-2 rounded-full mt-2 ${activity.color.replace('text-', 'bg-')}`}></div>
            <div className="flex-1">
              <p className="text-sm text-gray-700">{activity.message}</p>
              <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200">
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium cursor-pointer">
          View all activity
        </button>
      </div>
    </div>
  );
}
