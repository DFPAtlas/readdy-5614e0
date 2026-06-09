'use client';

export default function ActiveAlerts() {
  const alerts = [
    {
      id: 1,
      type: 'Security Breach',
      message: 'Possible security breach detected. East side of building. Sensor shows motion detected near locked entrance.',
      time: '7 mins ago',
      severity: 'high',
      location: 'East Medical Center',
      actions: ['Details', 'Acknowledge']
    },
    {
      id: 2,
      type: 'Issue Reported',
      message: 'Suspicious individual in parking lot area 3. Wearing dark clothing, appeared to be testing door handles. Currently monitoring via CCTV.',
      time: '18 mins ago',
      severity: 'medium',
      location: 'East Medical Center',
      actions: ['Details', 'Acknowledge']
    },
    {
      id: 3,
      type: 'System Notice',
      message: 'Voice recognition accuracy below threshold (92%) for South Tower location. Possible environmental noise interference. Consider manual check-in.',
      time: '35 mins ago',
      severity: 'low',
      location: 'South Tower',
      actions: ['Details', 'Acknowledge']
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-orange-500';
      case 'low': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityIcon = (type: string) => {
    switch (type) {
      case 'Security Breach': return 'ri-shield-cross-line';
      case 'Issue Reported': return 'ri-error-warning-line';
      case 'System Notice': return 'ri-information-line';
      default: return 'ri-alert-line';
    }
  };

  return (
    <div className="bg-slate-600 rounded-lg p-6 text-white">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Active Alerts</h2>
        <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
          <span className="text-xs font-bold">{alerts.length}</span>
        </div>
      </div>
      
      <div className="space-y-4">
        {alerts.map((alert) => (
          <div key={alert.id} className="bg-slate-700 rounded-lg p-4">
            <div className="flex items-start space-x-3 mb-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getSeverityColor(alert.severity)}`}>
                <i className={`${getSeverityIcon(alert.type)} text-white text-sm`}></i>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-white">{alert.type}</h3>
                  <span className="text-xs text-gray-300">{alert.time}</span>
                </div>
                <p className="text-sm text-gray-300 mb-2">{alert.message}</p>
                <p className="text-xs text-blue-300">Location: {alert.location}</p>
              </div>
            </div>
            
            <div className="flex justify-between pt-3 border-t border-slate-600">
              {alert.actions.map((action, index) => (
                <button 
                  key={index}
                  className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}