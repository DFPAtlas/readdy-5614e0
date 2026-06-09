'use client';

import { useState } from 'react';

export default function MaintenanceRequestForm() {
  const [formData, setFormData] = useState({
    requestType: '',
    priority: 'medium',
    location: '',
    description: '',
    reportedBy: '',
    contactNumber: '',
    dateReported: '',
    urgency: 'routine',
    affectedAreas: '',
    safetyRisk: false,
    temporaryMeasures: '',
    attachments: ''
  });

  const [maintenanceRequests, setMaintenanceRequests] = useState([
    {
      id: 'MR-2024-001',
      type: 'Electrical',
      priority: 'high',
      location: 'Main Entrance',
      description: 'Entrance lighting not working',
      status: 'In Progress',
      reportedBy: 'John Smith',
      dateReported: '2024-01-15',
      assignedTo: 'ElectricCorp Ltd'
    },
    {
      id: 'MR-2024-002',
      type: 'Plumbing',
      priority: 'medium',
      location: 'Food Court Restrooms',
      description: 'Leak in main restroom sink',
      status: 'Pending',
      reportedBy: 'Sarah Johnson',
      dateReported: '2024-01-15',
      assignedTo: 'PlumbFix Services'
    },
    {
      id: 'MR-2024-003',
      type: 'HVAC',
      priority: 'low',
      location: 'Retail Area',
      description: 'Air conditioning unit making noise',
      status: 'Completed',
      reportedBy: 'Michael Williams',
      dateReported: '2024-01-14',
      assignedTo: 'CoolAir Systems'
    }
  ]);

  const requestTypes = [
    'Electrical',
    'Plumbing',
    'HVAC',
    'Lighting',
    'Security Systems',
    'Fire Safety',
    'Cleaning',
    'Structural',
    'Flooring',
    'Doors/Windows',
    'Elevator',
    'Landscaping',
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
    const newRequest = {
      id: `MR-2024-${String(maintenanceRequests.length + 1).padStart(3, '0')}`,
      type: formData.requestType,
      priority: formData.priority,
      location: formData.location,
      description: formData.description,
      status: 'Pending',
      reportedBy: formData.reportedBy,
      dateReported: formData.dateReported,
      assignedTo: 'Pending Assignment'
    };
    setMaintenanceRequests([newRequest, ...maintenanceRequests]);
    setFormData({
      requestType: '',
      priority: 'medium',
      location: '',
      description: '',
      reportedBy: '',
      contactNumber: '',
      dateReported: '',
      urgency: 'routine',
      affectedAreas: '',
      safetyRisk: false,
      temporaryMeasures: '',
      attachments: ''
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Maintenance Request Form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Maintenance Request</h2>
          <form id="maintenance-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Request Type *</label>
              <select
                name="requestType"
                value={formData.requestType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                required
              >
                <option value="">Select request type</option>
                {requestTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority *</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                  required
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Urgency *</label>
                <select
                  name="urgency"
                  value={formData.urgency}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                  required
                >
                  <option value="routine">Routine</option>
                  <option value="urgent">Urgent</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Specific location of the maintenance issue"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                maxLength={500}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Detailed description of the maintenance issue..."
                required
              />
              <div className="text-xs text-gray-500 mt-1">{formData.description.length}/500 characters</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reported By *</label>
                <input
                  type="text"
                  name="reportedBy"
                  value={formData.reportedBy}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                <input
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Reported *</label>
              <input
                type="date"
                name="dateReported"
                value={formData.dateReported}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Affected Areas</label>
              <textarea
                name="affectedAreas"
                value={formData.affectedAreas}
                onChange={handleInputChange}
                rows={2}
                maxLength={500}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Areas or operations affected by this issue..."
              />
              <div className="text-xs text-gray-500 mt-1">{formData.affectedAreas.length}/500 characters</div>
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="safetyRisk"
                  checked={formData.safetyRisk}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Safety Risk Present</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Temporary Measures Taken</label>
              <textarea
                name="temporaryMeasures"
                value={formData.temporaryMeasures}
                onChange={handleInputChange}
                rows={3}
                maxLength={500}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Any temporary measures or workarounds implemented..."
              />
              <div className="text-xs text-gray-500 mt-1">{formData.temporaryMeasures.length}/500 characters</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Attachments/Photos</label>
              <input
                type="text"
                name="attachments"
                value={formData.attachments}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Photo references or document names"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
            >
              Submit Maintenance Request
            </button>
          </form>
        </div>

        {/* Recent Requests */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Maintenance Requests</h2>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {maintenanceRequests.map((request) => (
              <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">{request.id}</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(request.priority)}`}>
                      {request.priority.toUpperCase()}
                    </span>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                    {request.status}
                  </span>
                </div>
                
                <h3 className="text-sm font-medium text-gray-900 mb-1">{request.type}</h3>
                <p className="text-xs text-gray-600 mb-2">{request.location}</p>
                <p className="text-xs text-gray-700 mb-2">{request.description}</p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>
                    <i className="ri-user-line mr-1"></i>
                    {request.reportedBy}
                  </span>
                  <span>{request.dateReported}</span>
                </div>
                
                <div className="mt-2 text-xs text-blue-600">
                  <i className="ri-tools-line mr-1"></i>
                  Assigned to: {request.assignedTo}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Maintenance Summary */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Maintenance Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{maintenanceRequests.length}</div>
            <div className="text-sm text-blue-600">Total Requests</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {maintenanceRequests.filter(r => r.status === 'Pending').length}
            </div>
            <div className="text-sm text-yellow-600">Pending</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {maintenanceRequests.filter(r => r.status === 'In Progress').length}
            </div>
            <div className="text-sm text-purple-600">In Progress</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {maintenanceRequests.filter(r => r.status === 'Completed').length}
            </div>
            <div className="text-sm text-green-600">Completed</div>
          </div>
        </div>
      </div>
    </div>
  );
}