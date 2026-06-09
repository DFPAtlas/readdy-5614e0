'use client';

import { useState } from 'react';

export default function ContractorSignInForm() {
  const [formData, setFormData] = useState({
    contractorName: '',
    company: '',
    contractorPhone: '',
    contractorEmail: '',
    workType: '',
    workDescription: '',
    workLocation: '',
    estimatedDuration: '',
    safetyBriefing: false,
    equipmentChecked: false,
    permitRequired: false,
    permitNumber: '',
    emergencyContact: '',
    emergencyPhone: '',
    vehicleReg: '',
    toolsEquipment: '',
    hazardousWork: false,
    hazardDescription: '',
    supervisorName: '',
    arrivalTime: '',
    expectedCompletion: ''
  });

  const [contractors, setContractors] = useState([
    {
      id: 1,
      name: 'Alex Thompson',
      company: 'ElectricPro Services',
      workType: 'Electrical Work',
      location: 'Main Entrance',
      arrivalTime: '2024-01-15 08:00',
      status: 'Working',
      permitNumber: 'EWP-2024-001',
      supervisor: 'John Smith'
    },
    {
      id: 2,
      name: 'Maria Rodriguez',
      company: 'CleanTech Solutions',
      workType: 'Cleaning Services',
      location: 'Food Court',
      arrivalTime: '2024-01-15 06:30',
      status: 'Working',
      permitNumber: 'N/A',
      supervisor: 'Sarah Johnson'
    },
    {
      id: 3,
      name: 'David Chen',
      company: 'HVAC Masters',
      workType: 'HVAC Maintenance',
      location: 'Retail Area',
      arrivalTime: '2024-01-15 09:15',
      status: 'Completed',
      permitNumber: 'HWP-2024-003',
      supervisor: 'Michael Williams'
    }
  ]);

  const workTypes = [
    'Electrical Work',
    'Plumbing',
    'HVAC Maintenance',
    'Cleaning Services',
    'Maintenance',
    'Installation',
    'Repair Work',
    'Inspection',
    'Painting',
    'Landscaping',
    'Security System Work',
    'IT Services',
    'Construction',
    'Other'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newContractor = {
      id: contractors.length + 1,
      name: formData.contractorName,
      company: formData.company,
      workType: formData.workType,
      location: formData.workLocation,
      arrivalTime: formData.arrivalTime,
      status: 'Working',
      permitNumber: formData.permitNumber || 'N/A',
      supervisor: formData.supervisorName
    };
    setContractors([...contractors, newContractor]);
    setFormData({
      contractorName: '',
      company: '',
      contractorPhone: '',
      contractorEmail: '',
      workType: '',
      workDescription: '',
      workLocation: '',
      estimatedDuration: '',
      safetyBriefing: false,
      equipmentChecked: false,
      permitRequired: false,
      permitNumber: '',
      emergencyContact: '',
      emergencyPhone: '',
      vehicleReg: '',
      toolsEquipment: '',
      hazardousWork: false,
      hazardDescription: '',
      supervisorName: '',
      arrivalTime: '',
      expectedCompletion: ''
    });
  };

  const handleSignOut = (contractorId: number) => {
    setContractors(contractors.map(contractor => 
      contractor.id === contractorId 
        ? { ...contractor, status: 'Completed' }
        : contractor
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Working':
        return 'bg-blue-100 text-blue-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Break':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Contractor Sign-In Form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Contractor Sign-In</h2>
          <form id="contractor-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contractor Name *</label>
                <input
                  type="text"
                  name="contractorName"
                  value={formData.contractorName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  name="contractorPhone"
                  value={formData.contractorPhone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="contractorEmail"
                  value={formData.contractorEmail}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Work Type *</label>
              <select
                name="workType"
                value={formData.workType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                required
              >
                <option value="">Select work type</option>
                {workTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Work Description *</label>
              <textarea
                name="workDescription"
                value={formData.workDescription}
                onChange={handleInputChange}
                rows={3}
                maxLength={500}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Detailed description of work to be performed..."
                required
              />
              <div className="text-xs text-gray-500 mt-1">{formData.workDescription.length}/500 characters</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Work Location *</label>
                <input
                  type="text"
                  name="workLocation"
                  value={formData.workLocation}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Duration</label>
                <input
                  type="text"
                  name="estimatedDuration"
                  value={formData.estimatedDuration}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 2 hours, 1 day"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Arrival Time *</label>
                <input
                  type="datetime-local"
                  name="arrivalTime"
                  value={formData.arrivalTime}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expected Completion</label>
                <input
                  type="datetime-local"
                  name="expectedCompletion"
                  value={formData.expectedCompletion}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Supervisor Name</label>
              <input
                type="text"
                name="supervisorName"
                value={formData.supervisorName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
                <input
                  type="text"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Phone</label>
                <input
                  type="tel"
                  name="emergencyPhone"
                  value={formData.emergencyPhone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Registration</label>
              <input
                type="text"
                name="vehicleReg"
                value={formData.vehicleReg}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., AB12 CDE"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tools/Equipment Brought</label>
              <textarea
                name="toolsEquipment"
                value={formData.toolsEquipment}
                onChange={handleInputChange}
                rows={2}
                maxLength={500}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="List of tools and equipment..."
              />
              <div className="text-xs text-gray-500 mt-1">{formData.toolsEquipment.length}/500 characters</div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="safetyBriefing"
                  checked={formData.safetyBriefing}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Safety Briefing Completed</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="equipmentChecked"
                  checked={formData.equipmentChecked}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Equipment Safety Check Completed</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="permitRequired"
                  checked={formData.permitRequired}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Work Permit Required</span>
              </label>
            </div>

            {formData.permitRequired && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Permit Number</label>
                <input
                  type="text"
                  name="permitNumber"
                  value={formData.permitNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="hazardousWork"
                  checked={formData.hazardousWork}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Hazardous Work Involved</span>
              </label>
            </div>

            {formData.hazardousWork && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hazard Description</label>
                <textarea
                  name="hazardDescription"
                  value={formData.hazardDescription}
                  onChange={handleInputChange}
                  rows={2}
                  maxLength={500}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Describe the hazardous work and safety measures..."
                />
                <div className="text-xs text-gray-500 mt-1">{formData.hazardDescription.length}/500 characters</div>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
            >
              Sign In Contractor
            </button>
          </form>
        </div>

        {/* Active Contractors */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Contractors</h2>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {contractors.map((contractor) => (
              <div key={contractor.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{contractor.name}</h3>
                    <p className="text-xs text-gray-500">{contractor.company}</p>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(contractor.status)}`}>
                    {contractor.status}
                  </span>
                </div>
                
                <div className="text-xs text-gray-600 space-y-1">
                  <div><strong>Work Type:</strong> {contractor.workType}</div>
                  <div><strong>Location:</strong> {contractor.location}</div>
                  <div><strong>Arrival:</strong> {contractor.arrivalTime}</div>
                  <div><strong>Supervisor:</strong> {contractor.supervisor}</div>
                  <div><strong>Permit:</strong> {contractor.permitNumber}</div>
                </div>
                
                {contractor.status === 'Working' && (
                  <button
                    onClick={() => handleSignOut(contractor.id)}
                    className="mt-2 w-full bg-red-50 text-red-600 py-1 px-2 rounded text-xs hover:bg-red-100 transition-colors cursor-pointer"
                  >
                    Sign Out
                  </button>
                )}
              </div>
            ))}
            {contractors.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <i className="ri-user-settings-line text-4xl mb-2"></i>
                <p>No active contractors</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contractor Summary */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Daily Contractor Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{contractors.length}</div>
            <div className="text-sm text-blue-600">Total Contractors</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {contractors.filter(c => c.status === 'Working').length}
            </div>
            <div className="text-sm text-green-600">Currently Working</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {contractors.filter(c => c.status === 'Completed').length}
            </div>
            <div className="text-sm text-purple-600">Completed</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {contractors.filter(c => c.permitNumber !== 'N/A').length}
            </div>
            <div className="text-sm text-red-600">Permit Required</div>
          </div>
        </div>
      </div>
    </div>
  );
}