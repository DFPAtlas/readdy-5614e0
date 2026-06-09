'use client';

import { useState } from 'react';

export default function SiteStaffList() {
  const [siteStaff, setSiteStaff] = useState([
    {
      id: 1,
      name: 'John Smith',
      position: 'Senior Security Officer',
      badgeNumber: 'SEC-0123',
      shift: 'Day Shift (06:00 - 18:00)',
      status: 'On Duty',
      lastCheckIn: '2024-01-15 14:30',
      phone: '+44 7700 900123',
      email: 'john.smith@security.com',
      location: 'Main Entrance',
      photo: 'https://readdy.ai/api/search-image?query=professional%20security%20guard%20headshot%20portrait%20uniform%20confident%20mature%20man%20security%20officer%20clean%20background&width=60&height=60&seq=staff1&orientation=squarish'
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      position: 'Security Guard',
      badgeNumber: 'SEC-0124',
      shift: 'Day Shift (06:00 - 18:00)',
      status: 'On Duty',
      lastCheckIn: '2024-01-15 14:15',
      phone: '+44 7700 900124',
      email: 'sarah.johnson@security.com',
      location: 'Food Court',
      photo: 'https://readdy.ai/api/search-image?query=professional%20female%20security%20guard%20headshot%20portrait%20uniform%20confident%20woman%20security%20officer%20clean%20background&width=60&height=60&seq=staff2&orientation=squarish'
    },
    {
      id: 3,
      name: 'Michael Williams',
      position: 'Security Officer',
      badgeNumber: 'SEC-0125',
      shift: 'Night Shift (18:00 - 06:00)',
      status: 'Off Duty',
      lastCheckIn: '2024-01-15 06:00',
      phone: '+44 7700 900125',
      email: 'michael.williams@security.com',
      location: 'Control Room',
      photo: 'https://readdy.ai/api/search-image?query=professional%20security%20guard%20headshot%20portrait%20uniform%20confident%20middle%20aged%20man%20security%20officer%20clean%20background&width=60&height=60&seq=staff3&orientation=squarish'
    },
    {
      id: 4,
      name: 'Emma Davis',
      position: 'Security Guard',
      badgeNumber: 'SEC-0126',
      shift: 'Night Shift (18:00 - 06:00)',
      status: 'Off Duty',
      lastCheckIn: '2024-01-15 06:00',
      phone: '+44 7700 900126',
      email: 'emma.davis@security.com',
      location: 'Parking Area',
      photo: 'https://readdy.ai/api/search-image?query=professional%20female%20security%20guard%20headshot%20portrait%20uniform%20confident%20young%20woman%20security%20officer%20clean%20background&width=60&height=60&seq=staff4&orientation=squarish'
    },
    {
      id: 5,
      name: 'Robert Brown',
      position: 'Security Supervisor',
      badgeNumber: 'SEC-0127',
      shift: 'Management (09:00 - 17:00)',
      status: 'On Duty',
      lastCheckIn: '2024-01-15 14:00',
      phone: '+44 7700 900127',
      email: 'robert.brown@security.com',
      location: 'Administrative Office',
      photo: 'https://readdy.ai/api/search-image?query=professional%20security%20supervisor%20headshot%20portrait%20uniform%20confident%20senior%20man%20security%20officer%20clean%20background&width=60&height=60&seq=staff5&orientation=squarish'
    }
  ]);

  const [selectedStaff, setSelectedStaff] = useState<number | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'On Duty':
        return 'bg-green-100 text-green-800';
      case 'Off Duty':
        return 'bg-gray-100 text-gray-800';
      case 'Break':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const onDutyCount = siteStaff.filter(staff => staff.status === 'On Duty').length;
  const totalStaff = siteStaff.length;

  return (
    <div className="space-y-6">
      {/* Staff Overview */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Staff Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{totalStaff}</div>
            <div className="text-sm text-blue-600">Total Staff</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{onDutyCount}</div>
            <div className="text-sm text-green-600">On Duty</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{totalStaff - onDutyCount}</div>
            <div className="text-sm text-yellow-600">Off Duty</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">100%</div>
            <div className="text-sm text-purple-600">Coverage</div>
          </div>
        </div>
      </div>

      {/* Staff List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Site Staff Directory</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Staff Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Shift
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Check-in
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {siteStaff.map((staff) => (
                <tr key={staff.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img 
                        src={staff.photo} 
                        alt={staff.name}
                        className="w-10 h-10 rounded-full object-cover object-top"
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{staff.name}</div>
                        <div className="text-sm text-gray-500">{staff.badgeNumber}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {staff.position}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {staff.shift}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(staff.status)}`}>
                      {staff.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {staff.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {staff.lastCheckIn}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setSelectedStaff(staff.id)}
                      className="text-blue-600 hover:text-blue-900 cursor-pointer whitespace-nowrap mr-3"
                    >
                      <i className="ri-eye-line"></i>
                    </button>
                    <button className="text-green-600 hover:text-green-900 cursor-pointer whitespace-nowrap mr-3">
                      <i className="ri-phone-line"></i>
                    </button>
                    <button className="text-gray-600 hover:text-gray-900 cursor-pointer whitespace-nowrap">
                      <i className="ri-mail-line"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center px-4 py-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer">
            <i className="ri-notification-line mr-2"></i>
            Send Alert to All Staff
          </button>
          <button className="flex items-center justify-center px-4 py-3 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors cursor-pointer">
            <i className="ri-user-add-line mr-2"></i>
            Add Temporary Staff
          </button>
          <button className="flex items-center justify-center px-4 py-3 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors cursor-pointer">
            <i className="ri-file-download-line mr-2"></i>
            Export Staff Report
          </button>
        </div>
      </div>
    </div>
  );
}