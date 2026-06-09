'use client';

import { useState } from 'react';
import AddGuardModal from './AddGuardModal';
import RotaManagementModal from './RotaManagementModal';
import CreateTemplateModal from './CreateTemplateModal';
import AITooledOperationsCopilot from '@/app/dashboard/components/AITooledOperationsCopilot';

export default function StaffManagement() {
  const [showAddGuard, setShowAddGuard] = useState(false);
  const [showRotaModal, setShowRotaModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedGuard, setSelectedGuard] = useState<any>(null);
  const [showGuardDetails, setShowGuardDetails] = useState(false);

  const staffTemplates = [
    {
      id: 1,
      templateName: 'Standard Security Guard',
      position: 'Security Guard',
      department: 'Security',
      salary: '28000',
      shift: 'Day Shift',
      createdAt: '2024-01-15',
      status: 'Active'
    },
    {
      id: 2,
      templateName: 'Senior Security Officer',
      position: 'Senior Security Officer',
      department: 'Security',
      salary: '32000',
      shift: 'Night Shift',
      createdAt: '2024-01-10',
      status: 'Active'
    }
  ];

  const staffMembers = [
    {
      id: 1,
      name: 'John Smith',
      position: 'Senior Security Officer',
      phone: '+44 7700 900123',
      email: 'john.smith@security.com',
      badgeNumber: 'SEC-0123',
      photo: 'https://readdy.ai/api/search-image?query=professional%20security%20guard%20headshot%20portrait%20uniform%20confident%20mature%20man%20security%20officer%20clean%20background&width=80&height=80&seq=guard1&orientation=squarish',
      currentSite: 'West Campus',
      status: 'Active',
      shift: 'Day Shift',
      hireDate: '2022-01-15',
      salary: '£32,000'
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      position: 'Security Guard',
      phone: '+44 7700 900124',
      email: 'sarah.johnson@security.com',
      badgeNumber: 'SEC-0124',
      photo: 'https://readdy.ai/api/search-image?query=professional%20female%20security%20guard%20headshot%20portrait%20uniform%20confident%20woman%20security%20officer%20clean%20background&width=80&height=80&seq=guard2&orientation=squarish',
      currentSite: 'South Building',
      status: 'Active',
      shift: 'Night Shift',
      hireDate: '2022-03-20',
      salary: '£28,000'
    },
    {
      id: 3,
      name: 'Michael Williams',
      position: 'Security Officer',
      phone: '+44 7700 900125',
      email: 'michael.williams@security.com',
      badgeNumber: 'SEC-0125',
      photo: 'https://readdy.ai/api/search-image?query=professional%20security%20guard%20headshot%20portrait%20uniform%20confident%20middle%20aged%20man%20security%20officer%20clean%20background&width=80&height=80&seq=guard3&orientation=squarish',
      currentSite: 'North Campus',
      status: 'Active',
      shift: 'Day Shift',
      hireDate: '2021-11-10',
      salary: '£30,000'
    },
    {
      id: 4,
      name: 'Emma Davis',
      position: 'Security Guard',
      phone: '+44 7700 900126',
      email: 'emma.davis@security.com',
      badgeNumber: 'SEC-0126',
      photo: 'https://readdy.ai/api/search-image?query=professional%20female%20security%20guard%20headshot%20portrait%20uniform%20confident%20young%20woman%20security%20officer%20clean%20background&width=80&height=80&seq=guard4&orientation=squarish',
      currentSite: 'East Medical Center',
      status: 'On Leave',
      shift: 'Night Shift',
      hireDate: '2023-02-01',
      salary: '£26,000'
    },
    {
      id: 5,
      name: 'Robert Brown',
      position: 'Security Supervisor',
      phone: '+44 7700 900127',
      email: 'robert.brown@security.com',
      badgeNumber: 'SEC-0127',
      photo: 'https://readdy.ai/api/search-image?query=professional%20security%20supervisor%20headshot%20portrait%20uniform%20confident%20senior%20man%20security%20officer%20clean%20background&width=80&height=80&seq=guard5&orientation=squarish',
      currentSite: 'Multiple Sites',
      status: 'Active',
      shift: 'Day Shift',
      hireDate: '2020-08-15',
      salary: '£38,000'
    }
  ];

  const handleEditGuard = (guard: any) => {
    setSelectedGuard(guard);
    setShowAddGuard(true);
  };

  const handleViewGuard = (guard: any) => {
    setSelectedGuard(guard);
    setShowGuardDetails(true);
  };

  const handleDeleteGuard = (guardId: number) => {
    if (window.confirm('Are you sure you want to delete this guard?')) {
      console.log('Deleting guard:', guardId);
    }
  };

  const activeGuards = staffMembers.filter(guard => guard.status === 'Active').length;
  const totalHours = staffMembers.length * 40; 
  const siteCoverage = Math.round((activeGuards / 5) * 100); 

  const handleCreateTemplate = (templateData: any) => {
    console.log('Template created:', templateData);
    setShowTemplateModal(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a]">      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Staff Management</h1>
          <div className="flex space-x-4">
            <button 
              onClick={() => setShowTemplateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap flex items-center text-sm"
            >
              <i className="ri-add-line mr-2"></i>Create Template
            </button>
            <button 
              onClick={() => setShowAddGuard(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-add-line mr-2"></i>
              Add New Guard
            </button>
            <button 
              onClick={() => setShowRotaModal(true)}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-calendar-line mr-2"></i>
              Manage Rotas
            </button>
          </div>
        </div>

        {/* Templates Section */}
        {staffTemplates.length > 0 && (
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Staff Templates</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {staffTemplates.map((template) => (
                    <div key={template.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-900">{template.templateName}</h3>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {template.status}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>Position:</span>
                          <span className="font-medium text-gray-900">{template.position}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Department:</span>
                          <span className="font-medium text-gray-900">{template.department}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Salary:</span>
                          <span className="font-medium text-gray-900">£{template.salary}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Shift:</span>
                          <span className="font-medium text-gray-900">{template.shift}</span>
                        </div>
                      </div>
                      <div className="mt-4 flex justify-between">
                        <button className="text-blue-600 hover:text-blue-800 text-sm cursor-pointer">
                          <i className="ri-eye-line mr-1"></i>View
                        </button>
                        <button className="text-green-600 hover:text-green-800 text-sm cursor-pointer">
                          <i className="ri-user-add-line mr-1"></i>Use Template
                        </button>
                        <button className="text-gray-600 hover:text-gray-800 text-sm cursor-pointer">
                          <i className="ri-edit-line mr-1"></i>Edit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <i className="ri-user-line text-white text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-blue-600 font-medium">Total Guards</p>
                <p className="text-2xl font-bold text-blue-900">{staffMembers.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                <i className="ri-shield-check-line text-white text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-green-600 font-medium">Active Guards</p>
                <p className="text-2xl font-bold text-green-900">{activeGuards}</p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                <i className="ri-building-line text-white text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-purple-600 font-medium">Site Coverage</p>
                <p className="text-2xl font-bold text-purple-900">{siteCoverage}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Staff Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Staff Members</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guard</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Site</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shift</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {staffMembers.map((guard) => (
                  <tr key={guard.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img 
                          src={guard.photo} 
                          alt={guard.name}
                          className="w-10 h-10 rounded-full object-cover object-top"
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{guard.name}</div>
                          <div className="text-sm text-gray-500">{guard.badgeNumber}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{guard.position}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{guard.phone}</div>
                      <div className="text-sm text-gray-500">{guard.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{guard.currentSite}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        guard.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {guard.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{guard.shift}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleViewGuard(guard)}
                          className="text-blue-600 hover:text-blue-800 text-sm cursor-pointer"
                        >
                          <i className="ri-eye-line mr-1"></i>View
                        </button>
                        <button 
                          onClick={() => handleEditGuard(guard)}
                          className="text-blue-600 hover:text-blue-900 cursor-pointer whitespace-nowrap"
                        >
                          <i className="ri-edit-line"></i>
                        </button>
                        <button 
                          onClick={() => handleDeleteGuard(guard.id)}
                          className="text-red-600 hover:text-red-900 cursor-pointer whitespace-nowrap"
                        >
                          <i className="ri-delete-bin-line"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showAddGuard && <AddGuardModal onClose={() => setShowAddGuard(false)} />}
      {showRotaModal && <RotaManagementModal onClose={() => setShowRotaModal(false)} />}
      {showTemplateModal && <CreateTemplateModal onClose={() => setShowTemplateModal(false)} />}
      {showGuardDetails && selectedGuard && (
        <GuardDetailsModal 
          guard={selectedGuard} 
          onClose={() => {
            setShowGuardDetails(false);
            setSelectedGuard(null);
          }} 
        />
      )}

      <AITooledOperationsCopilot />
    </div>
  );
}

function GuardDetailsModal({ guard, onClose }: { guard: any; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'ri-user-line' },
    { id: 'schedule', label: 'Schedule', icon: 'ri-calendar-line' },
    { id: 'performance', label: 'Performance', icon: 'ri-bar-chart-line' },
    { id: 'incidents', label: 'Incidents', icon: 'ri-alert-line' }
  ];

  const recentShifts = [
    { date: '2024-01-15', site: 'Downtown Plaza', hours: '8h', status: 'Completed' },
    { date: '2024-01-14', site: 'Industrial Park East', hours: '12h', status: 'Completed' },
    { date: '2024-01-13', site: 'Downtown Plaza', hours: '8h', status: 'Completed' },
    { date: '2024-01-12', site: 'Corporate Tower', hours: '8h', status: 'Completed' }
  ];

  const upcomingShifts = [
    { date: '2024-01-16', site: 'Downtown Plaza', time: '08:00 - 16:00' },
    { date: '2024-01-17', site: 'Industrial Park East', time: '20:00 - 08:00' },
    { date: '2024-01-18', site: 'Downtown Plaza', time: '08:00 - 16:00' }
  ];

  const performanceMetrics = [
    { label: 'Check-in Rate', value: '98%', trend: '+2%', color: 'green' },
    { label: 'Response Time', value: '2.3 min', trend: '-0.5 min', color: 'green' },
    { label: 'Incidents Handled', value: '23', trend: '+5', color: 'blue' },
    { label: 'Training Completed', value: '12/15', trend: '80%', color: 'yellow' }
  ];

  const recentIncidents = [
    { date: '2024-01-14', type: 'Security Breach', severity: 'Medium', status: 'Resolved' },
    { date: '2024-01-10', type: 'Suspicious Activity', severity: 'Low', status: 'Resolved' },
    { date: '2024-01-08', type: 'Equipment Issue', severity: 'Low', status: 'Resolved' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-blue-600">{guard.name.split(' ').map((n: string) => n[0]).join('')}</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{guard.name}</h2>
              <p className="text-blue-100">{guard.role} • ID: {guard.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-white hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
          >
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>

        <div className="border-b border-gray-200 px-6">
          <div className="flex items-center space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <i className={tab.icon}></i>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <i className="ri-phone-line text-gray-600"></i>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Phone</div>
                        <div className="font-medium text-gray-900">{guard.phone}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <i className="ri-mail-line text-gray-600"></i>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Email</div>
                        <div className="font-medium text-gray-900">{guard.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <i className="ri-map-pin-line text-gray-600"></i>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Current Site</div>
                        <div className="font-medium text-gray-900">{guard.site}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Employment Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        guard.status === 'On Duty' ? 'bg-green-100 text-green-700' :
                        guard.status === 'Off Duty' ? 'bg-gray-100 text-gray-700' :
                        'bg-red-100 text-red-700'
                      }`}>{guard.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Check-in Rate</span>
                      <span className="font-medium text-gray-900">{guard.checkinRate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Check-in</span>
                      <span className="font-medium text-gray-900">{guard.lastCheckin}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Shifts</span>
                      <span className="font-medium text-gray-900">156 shifts</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Join Date</span>
                      <span className="font-medium text-gray-900">Jan 15, 2023</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Certifications & Training</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {['SIA License', 'First Aid', 'Fire Safety', 'CCTV Operations', 'Conflict Resolution', 'Emergency Response'].map((cert, index) => (
                    <div key={index} className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                        <i className="ri-check-line text-white text-sm"></i>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{cert}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Shifts</h3>
                <div className="space-y-3">
                  {upcomingShifts.map((shift, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                          <i className="ri-calendar-line text-white"></i>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{shift.site}</div>
                          <div className="text-sm text-gray-600">{shift.date} • {shift.time}</div>
                        </div>
                      </div>
                      <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap">
                        Modify
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Shifts</h3>
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Site</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Hours</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {recentShifts.map((shift, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 text-sm text-gray-900">{shift.date}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{shift.site}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{shift.hours}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                              {shift.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                {performanceMetrics.map((metric, index) => (
                  <div key={index} className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">{metric.label}</span>
                      <span className={`text-xs font-medium ${
                        metric.color === 'green' ? 'text-green-600' :
                        metric.color === 'blue' ? 'text-blue-600' :
                        'text-yellow-600'
                      }`}>{metric.trend}</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
                  </div>
                ))}
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Chart</h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 h-64 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <i className="ri-bar-chart-line text-4xl mb-2"></i>
                    <p>Performance chart visualization</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Strengths & Areas for Improvement</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">Strengths</h4>
                    <ul className="space-y-1 text-sm text-green-700">
                      <li>• Excellent punctuality</li>
                      <li>• High check-in compliance</li>
                      <li>• Strong incident response</li>
                      <li>• Good communication skills</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-medium text-yellow-900 mb-2">Areas for Improvement</h4>
                    <ul className="space-y-1 text-sm text-yellow-700">
                      <li>• Complete remaining training modules</li>
                      <li>• Improve report detail quality</li>
                      <li>• Enhance patrol route coverage</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'incidents' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center">
                  <div className="text-2xl font-bold text-red-600">3</div>
                  <div className="text-sm text-red-700">Total Incidents</div>
                </div>
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">3</div>
                  <div className="text-sm text-green-700">Resolved</div>
                </div>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">2.5h</div>
                  <div className="text-sm text-blue-700">Avg Response Time</div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Incidents</h3>
                <div className="space-y-3">
                  {recentIncidents.map((incident, index) => (
                    <div key={index} className="p-4 bg-white border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            incident.severity === 'High' ? 'bg-red-100' :
                            incident.severity === 'Medium' ? 'bg-yellow-100' :
                            'bg-blue-100'
                          }`}>
                            <i className={`ri-alert-line ${
                              incident.severity === 'High' ? 'text-red-600' :
                              incident.severity === 'Medium' ? 'text-yellow-600' :
                              'text-blue-600'
                            }`}></i>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{incident.type}</div>
                            <div className="text-sm text-gray-600">{incident.date}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            incident.severity === 'High' ? 'bg-red-100 text-red-700' :
                            incident.severity === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>{incident.severity}</span>
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                            {incident.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer whitespace-nowrap"
          >
            Close
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap">
            <i className="ri-edit-line mr-2"></i>Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}