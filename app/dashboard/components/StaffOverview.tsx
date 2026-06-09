
'use client';

interface StaffOverviewProps {
  totalStaffOnDuty: number;
  totalSites: number;
  activeSites: number;
  totalIncidents: number;
}

export default function StaffOverview({ 
  totalStaffOnDuty, 
  totalSites, 
  activeSites, 
  totalIncidents 
}: StaffOverviewProps) {
  const stats = [
    {
      title: 'Total Staff on Duty',
      value: totalStaffOnDuty,
      icon: 'ri-user-line',
      color: 'bg-blue-100 text-blue-600',
      change: '+2 from yesterday'
    },
    {
      title: 'Total Sites',
      value: totalSites,
      icon: 'ri-building-line',
      color: 'bg-green-100 text-green-600',
      change: 'All sites active'
    },
    {
      title: 'Active Sites',
      value: activeSites,
      icon: 'ri-shield-check-line',
      color: 'bg-emerald-100 text-emerald-600',
      change: `${activeSites}/${totalSites} operational`
    },
    {
      title: 'Total Incidents',
      value: totalIncidents,
      icon: 'ri-error-warning-line',
      color: 'bg-red-100 text-red-600',
      change: totalIncidents > 0 ? 'Requires attention' : 'No incidents'
    }
  ];

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color}`}>
              <i className={`${stat.icon} text-xl`}></i>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">{stat.title}</h3>
          <p className="text-xs text-gray-500">{stat.change}</p>
        </div>
      ))}
    </div>
  );
}
