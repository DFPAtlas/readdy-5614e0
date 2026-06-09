
'use client';

import Link from 'next/link';

interface Site {
  id: number;
  name: string;
  status: string;
  staffOnDuty: string[];
  totalStaff: number;
  lastUpdate: string;
  incidents: number;
  location: string;
}

interface SiteGridProps {
  sites: Site[];
}

export default function SiteGrid({ sites }: SiteGridProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'green':
        return 'bg-green-500';
      case 'yellow':
        return 'bg-yellow-500';
      case 'red':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'green':
        return 'All Clear';
      case 'yellow':
        return 'Attention Required';
      case 'red':
        return 'Alert';
      default:
        return 'Unknown';
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Site Overview</h2>
        <Link 
          href="/dashboard/sites/new"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
        >
          <i className="ri-add-line mr-2"></i>
          Add Site
        </Link>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sites.map((site) => (
          <Link key={site.id} href={`/dashboard/sites/${site.id}`} className="cursor-pointer">
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{site.name}</h3>
                  <p className="text-sm text-gray-600">{site.location}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-4 h-4 rounded-full ${getStatusColor(site.status)}`}></div>
                  <span className="text-sm font-medium text-gray-700">{getStatusText(site.status)}</span>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Staff on Duty</span>
                  <span className="text-sm text-gray-600">{site.staffOnDuty.length}/{site.totalStaff}</span>
                </div>
                
                {site.staffOnDuty.length > 0 ? (
                  <div className="space-y-1">
                    {site.staffOnDuty.map((staff, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-700">{staff}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-red-600">No staff on duty</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Last update: {site.lastUpdate}</span>
                {site.incidents > 0 && (
                  <span className="flex items-center text-red-600">
                    <i className="ri-error-warning-line mr-1"></i>
                    {site.incidents} incident{site.incidents > 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
