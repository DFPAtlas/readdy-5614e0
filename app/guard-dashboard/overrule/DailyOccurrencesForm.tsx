'use client';

import { useState } from 'react';

export default function DailyOccurrencesForm() {
  const [formData, setFormData] = useState({
    date: '',
    shift: 'day',
    guardName: '',
    occurrenceType: '',
    time: '',
    location: '',
    description: '',
    witnessPresent: false,
    witnessDetails: '',
    actionTaken: '',
    policeInvolved: false,
    policeReference: '',
    followUpRequired: false,
    followUpDetails: '',
    priority: 'medium',
    resolved: false
  });

  const [occurrences, setOccurrences] = useState([
    {
      id: 1,
      date: '2024-01-15',
      shift: 'Day',
      type: 'Suspicious Activity',
      time: '14:30',
      location: 'Main Entrance',
      description: 'Individual photographing building exterior',
      priority: 'medium',
      status: 'Resolved',
      guard: 'John Smith'
    },
    {
      id: 2,
      date: '2024-01-15',
      shift: 'Day',
      type: 'Safety Concern',
      time: '13:15',
      location: 'Food Court',
      description: 'Wet floor not properly marked',
      priority: 'high',
      status: 'Resolved',
      guard: 'Sarah Johnson'
    },
    {
      id: 3,
      date: '2024-01-15',
      shift: 'Day',
      type: 'Theft',
      time: '12:00',
      location: 'Retail Area',
      description: 'Shoplifting incident reported by store staff',
      priority: 'high',
      status: 'Police Involved',
      guard: 'John Smith'
    }
  ]);

  const occurrenceTypes = [
    'Theft/Shoplifting',
    'Vandalism',
    'Suspicious Activity',
    'Safety Concern',
    'Altercation',
    'Medical Emergency',
    'Fire/Smoke',
    'Equipment Malfunction',
    'Unauthorized Access',
    'Vehicle Incident',
    'Disturbance',
    'Lost Property',
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
    const newOccurrence = {
      id: occurrences.length + 1,
      date: formData.date,
      shift: formData.shift === 'day' ? 'Day' : 'Night',
      type: formData.occurrenceType,
      time: formData.time,
      location: formData.location,
      description: formData.description,
      priority: formData.priority,
      status: formData.resolved ? 'Resolved' : 'Open',
      guard: formData.guardName
    };
    setOccurrences([newOccurrence, ...occurrences]);
    setFormData({
      date: '',
      shift: 'day',
      guardName: '',
      occurrenceType: '',
      time: '',
      location: '',
      description: '',
      witnessPresent: false,
      witnessDetails: '',
      actionTaken: '',
      policeInvolved: false,
      policeReference: '',
      followUpRequired: false,
      followUpDetails: '',
      priority: 'medium',
      resolved: false
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
      case 'Resolved':
        return 'bg-green-100 text-green-800';
      case 'Open':
        return 'bg-blue-100 text-blue-800';
      case 'Police Involved':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Daily Occurrence Form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Daily Occurrence Report</h2>
          <form id="occurrence-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shift *</label>
                <select
                  name="shift"
                  value={formData.shift}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                  required
                >
                  <option value="day">Day Shift</option>
                  <option value="night">Night Shift</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Guard Name *</label>
              <input
                type="text"
                name="guardName"
                value={formData.guardName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Occurrence Type *</label>
              <select
                name="occurrenceType"
                value={formData.occurrenceType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                required
              >
                <option value="">Select occurrence type</option>
                {occurrenceTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
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
                placeholder="Detailed description of the occurrence..."
                required
              />
              <div className="text-xs text-gray-500 mt-1">{formData.description.length}/500 characters</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority Level *</label>
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
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="witnessPresent"
                  checked={formData.witnessPresent}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Witness Present</span>
              </label>
            </div>

            {formData.witnessPresent && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Witness Details</label>
                <textarea
                  name="witnessDetails"
                  value={formData.witnessDetails}
                  onChange={handleInputChange}
                  rows={2}
                  maxLength={500}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Witness name, contact details, statement..."
                />
                <div className="text-xs text-gray-500 mt-1">{formData.witnessDetails.length}/500 characters</div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Action Taken *</label>
              <textarea
                name="actionTaken"
                value={formData.actionTaken}
                onChange={handleInputChange}
                rows={3}
                maxLength={500}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="What actions were taken in response..."
                required
              />
              <div className="text-xs text-gray-500 mt-1">{formData.actionTaken.length}/500 characters</div>
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="policeInvolved"
                  checked={formData.policeInvolved}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Police Involved</span>
              </label>
            </div>

            {formData.policeInvolved && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Police Reference Number</label>
                <input
                  type="text"
                  name="policeReference"
                  value={formData.policeReference}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., CR-2024-001"
                />
              </div>
            )}

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="followUpRequired"
                  checked={formData.followUpRequired}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Follow-up Required</span>
              </label>
            </div>

            {formData.followUpRequired && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Follow-up Details</label>
                <textarea
                  name="followUpDetails"
                  value={formData.followUpDetails}
                  onChange={handleInputChange}
                  rows={2}
                  maxLength={500}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="What follow-up actions are needed..."
                />
                <div className="text-xs text-gray-500 mt-1">{formData.followUpDetails.length}/500 characters</div>
              </div>
            )}

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="resolved"
                  checked={formData.resolved}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Occurrence Resolved</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
            >
              Submit Occurrence Report
            </button>
          </form>
        </div>

        {/* Recent Occurrences */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Occurrences</h2>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {occurrences.map((occurrence) => (
              <div key={occurrence.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(occurrence.priority)}`}>
                      {occurrence.priority.toUpperCase()}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(occurrence.status)}`}>
                      {occurrence.status}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">{occurrence.date} {occurrence.time}</span>
                </div>
                
                <h3 className="text-sm font-medium text-gray-900 mb-1">{occurrence.type}</h3>
                <p className="text-xs text-gray-600 mb-2">{occurrence.location} • {occurrence.shift} Shift</p>
                <p className="text-xs text-gray-700 mb-2">{occurrence.description}</p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    <i className="ri-user-line mr-1"></i>
                    {occurrence.guard}
                  </span>
                  <button className="text-blue-600 hover:text-blue-800 text-xs cursor-pointer">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Daily Summary */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Daily Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{occurrences.length}</div>
            <div className="text-sm text-blue-600">Total Occurrences</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {occurrences.filter(o => o.priority === 'high').length}
            </div>
            <div className="text-sm text-red-600">High Priority</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {occurrences.filter(o => o.status === 'Resolved').length}
            </div>
            <div className="text-sm text-green-600">Resolved</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {occurrences.filter(o => o.status === 'Police Involved').length}
            </div>
            <div className="text-sm text-purple-600">Police Involved</div>
          </div>
        </div>
      </div>
    </div>
  );
}