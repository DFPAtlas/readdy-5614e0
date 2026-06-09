'use client';

export default function SiteInformation({ siteId }: { siteId: string }) {
  const siteData = {
    name: "Westfield Shopping Centre",
    address: "Ariel Way, London W12 7GF",
    type: "Commercial Property",
    size: "185,000 sq ft",
    establishedDate: "2008",
    riskLevel: "Medium",
    totalGuards: 4,
    activeGuards: 3,
    lastInspection: "2024-01-15",
    nextInspection: "2024-02-15",
    status: "Active",
    contractValue: "£45,000/month",
    clientContact: "Sarah Johnson",
    emergencyContact: "+44 999 Emergency",
    siteManager: "Michael Davies",
    securityControl: "+44 7700 900101",
    backupOfficer: "+44 7700 900102"
  };

  const securityFeatures = [
    { name: "CCTV Cameras", count: 24, status: "Active" },
    { name: "Access Control Points", count: 8, status: "Active" },
    { name: "Motion Sensors", count: 16, status: "Active" },
    { name: "Panic Buttons", count: 12, status: "Active" },
    { name: "Fire Alarms", count: 32, status: "Active" },
    { name: "Emergency Lighting", count: 45, status: "Active" }
  ];

  const patrolSchedule = [
    { time: "00:00", type: "Perimeter Check", frequency: "Every 2 hours" },
    { time: "02:00", type: "Building Interior", frequency: "Every 2 hours" },
    { time: "04:00", type: "Parking Area", frequency: "Every 2 hours" },
    { time: "06:00", type: "Full Site Inspection", frequency: "Every 6 hours" },
    { time: "08:00", type: "Entrance Monitoring", frequency: "Continuous" },
    { time: "12:00", type: "Lunch Break Coverage", frequency: "Daily" }
  ];

  const recentIncidents = [
    {
      date: "2024-01-20",
      time: "18:30",
      type: "Suspicious Activity",
      severity: "Medium",
      description: "Individual testing vehicle door handles in parking area",
      status: "Resolved"
    },
    {
      date: "2024-01-19",
      time: "14:20",
      type: "Equipment Malfunction",
      severity: "Low",
      description: "CCTV Camera 3 offline for 2 hours",
      status: "Fixed"
    },
    {
      date: "2024-01-18",
      time: "09:15",
      type: "False Alarm",
      severity: "Low",
      description: "Motion sensor triggered by cleaning staff",
      status: "Closed"
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'resolved': return 'text-blue-600 bg-blue-100';
      case 'fixed': return 'text-green-600 bg-green-100';
      case 'closed': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-slate-700">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-600">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-white font-bold text-xl">logo</div>
              <div className="text-slate-300">|</div>
              <div className="text-white font-semibold">Site Information</div>
            </div>
            <button className="bg-slate-600 text-white px-4 py-2 rounded hover:bg-slate-500 transition-colors cursor-pointer whitespace-nowrap">
              <i className="ri-arrow-left-line mr-2"></i>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* Site Overview */}
        <div className="bg-slate-800 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-white">{siteData.name}</h1>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(siteData.status)}`}>
              {siteData.status}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-700 rounded-lg p-4">
              <div className="text-slate-300 text-sm">Address</div>
              <div className="text-white font-medium">{siteData.address}</div>
            </div>
            <div className="bg-slate-700 rounded-lg p-4">
              <div className="text-slate-300 text-sm">Property Type</div>
              <div className="text-white font-medium">{siteData.type}</div>
            </div>
            <div className="bg-slate-700 rounded-lg p-4">
              <div className="text-slate-300 text-sm">Size</div>
              <div className="text-white font-medium">{siteData.size}</div>
            </div>
            <div className="bg-slate-700 rounded-lg p-4">
              <div className="text-slate-300 text-sm">Risk Level</div>
              <div className={`font-medium ${siteData.riskLevel === 'Medium' ? 'text-yellow-400' : 'text-green-400'}`}>
                {siteData.riskLevel}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Contact Information</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-300">Client Contact:</span>
                <span className="text-white font-medium">{siteData.clientContact}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Emergency Contact:</span>
                <span className="text-white font-medium">{siteData.emergencyContact}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Site Manager:</span>
                <span className="text-white font-medium">{siteData.siteManager}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Security Control:</span>
                <span className="text-white font-medium">{siteData.securityControl}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Backup Officer:</span>
                <span className="text-white font-medium">{siteData.backupOfficer}</span>
              </div>
            </div>
          </div>

          {/* Contract Details */}
          <div className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Contract Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-300">Contract Value:</span>
                <span className="text-white font-medium">{siteData.contractValue}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Established:</span>
                <span className="text-white font-medium">{siteData.establishedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Total Guards:</span>
                <span className="text-white font-medium">{siteData.totalGuards}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Active Guards:</span>
                <span className="text-green-400 font-medium">{siteData.activeGuards}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Last Inspection:</span>
                <span className="text-white font-medium">{siteData.lastInspection}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Next Inspection:</span>
                <span className="text-yellow-400 font-medium">{siteData.nextInspection}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Security Features */}
        <div className="bg-slate-800 rounded-lg p-6 mt-8">
          <h2 className="text-xl font-bold text-white mb-4">Security Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {securityFeatures.map((feature, index) => (
              <div key={index} className="bg-slate-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{feature.name}</span>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(feature.status)}`}>
                    {feature.status}
                  </div>
                </div>
                <div className="text-slate-300 text-sm">Count: {feature.count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Patrol Schedule */}
        <div className="bg-slate-800 rounded-lg p-6 mt-8">
          <h2 className="text-xl font-bold text-white mb-4">Patrol Schedule</h2>
          <div className="space-y-3">
            {patrolSchedule.map((patrol, index) => (
              <div key={index} className="bg-slate-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-blue-400 font-mono">{patrol.time}</div>
                    <div className="text-white font-medium">{patrol.type}</div>
                  </div>
                  <div className="text-slate-300 text-sm">{patrol.frequency}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Incidents */}
        <div className="bg-slate-800 rounded-lg p-6 mt-8">
          <h2 className="text-xl font-bold text-white mb-4">Recent Incidents</h2>
          <div className="space-y-4">
            {recentIncidents.map((incident, index) => (
              <div key={index} className="bg-slate-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="text-slate-300 text-sm">{incident.date} {incident.time}</div>
                    <div className="text-white font-medium">{incident.type}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(incident.severity)}`}>
                      {incident.severity}
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(incident.status)}`}>
                      {incident.status}
                    </div>
                  </div>
                </div>
                <div className="text-slate-300 text-sm">{incident.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}