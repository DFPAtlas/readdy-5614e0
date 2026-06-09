'use client';

interface Site {
  id: number;
  name: string;
  status: string;
  staffOnDuty: string[];
  totalStaff: number;
  incidents: number;
  contract: string;
}

interface SiteStatsProps {
  sites: Site[];
}

export default function SiteStats({ sites }: SiteStatsProps) {
  const totalSites = sites.length;
  const activeSites = sites.filter(site => site.status === 'green').length;
  const alertSites = sites.filter(site => site.status === 'red').length;
  const warningsSites = sites.filter(site => site.status === 'yellow').length;
  const totalIncidents = sites.reduce((sum, site) => sum + site.incidents, 0);
  const totalStaffOnDuty = sites.reduce((sum, site) => sum + site.staffOnDuty.length, 0);
  const totalStaffCapacity = sites.reduce((sum, site) => sum + site.totalStaff, 0);
  const premiumSites = sites.filter(site => site.contract === 'Premium').length;

  const stats = [
    {
      title: 'Total Sites',
      value: totalSites,
      icon: 'ri-building-line',
      color: 'blue',
      subtitle: `${premiumSites} Premium contracts`
    },
    {
      title: 'Active Sites',
      value: activeSites,
      icon: 'ri-checkbox-circle-line',
      color: 'green',
      subtitle: `${((activeSites / totalSites) * 100).toFixed(0)}% operational`
    },
    {
      title: 'Alert Sites',
      value: alertSites,
      icon: 'ri-error-warning-line',
      color: 'red',
      subtitle: warningsSites > 0 ? `${warningsSites} need attention` : 'All clear'
    },
    {
      title: 'Staff Coverage',
      value: `${totalStaffOnDuty}/${totalStaffCapacity}`,
      icon: 'ri-team-line',
      color: 'purple',
      subtitle: `${((totalStaffOnDuty / totalStaffCapacity) * 100).toFixed(0)}% coverage`
    },
    {
      title: 'Active Incidents',
      value: totalIncidents,
      icon: 'ri-alert-line',
      color: 'orange',
      subtitle: totalIncidents > 0 ? 'Requires attention' : 'No incidents'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      red: 'bg-red-100 text-red-600',
      purple: 'bg-purple-100 text-purple-600',
      orange: 'bg-orange-100 text-orange-600'
    };
    return colors[color as keyof typeof colors] || 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getColorClasses(stat.color)}`}>
              <i className={`${stat.icon} text-xl`}></i>
            </div>
          </div>
          <div className="mb-2">
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm font-medium text-gray-600">{stat.title}</p>
          </div>
          <p className="text-xs text-gray-500">{stat.subtitle}</p>
        </div>
      ))}
    </div>
  );
}