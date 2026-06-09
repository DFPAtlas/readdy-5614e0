'use client';

import { useState } from 'react';

export default function CCTVLogForm() {
  const [formData, setFormData] = useState({
    timestamp: '',
    cameraLocation: '',
    incident: '',
    severity: 'low',
    description: '',
    actionTaken: '',
    followUpRequired: false,
    recordingReference: '',
    witnessDetails: '',
    reportedBy: ''
  });

  const [cctvLogs, setCctvLogs] = useState([
    {
      id: 1,
      timestamp: '2024-01-15 14:30:00',
      camera: 'Main Entrance Camera 1',
      incident: 'Suspicious Activity',
      severity: 'medium',
      description: 'Individual loitering near main entrance for extended period',
      actionTaken: 'Security approached and identified visitor',
      status: 'Resolved',
      recordingRef: 'REC-2024-001'
    },
    {
      id: 2,
      timestamp: '2024-01-15 13:15:00',
      camera: 'Parking Area Camera 3',
      incident: 'Vehicle Incident',
      severity: 'low',
      description: 'Minor vehicle collision in parking area',
      actionTaken: 'Incident documented, parties exchanged information',
      status: 'Resolved',
      recordingRef: 'REC-2024-002'
    },
    {
      id: 3,
      timestamp: '2024-01-15 12:45:00',
      camera: 'Food Court Camera 2',
      incident: 'Safety Concern',
      severity: 'high',
      description: 'Liquid spill creating slip hazard',
      actionTaken: 'Area cordoned off, cleaning crew notified',
      status: 'In Progress',
      recordingRef: 'REC-2024-003'
    }
  ]);

  const cameraLocations = [
    'Main Entrance Camera 1',
    'Main Entrance Camera 2',
    'Food Court Camera 1',
    'Food Court Camera 2',
    'Parking Area Camera 1',
    'Parking Area Camera 2',
    'Parking Area Camera 3',
    'Retail Area Camera 1',
    'Retail Area Camera 2',
    'Emergency Exit Camera 1',
    'Emergency Exit Camera 2',
    'Loading Bay Camera 1',
    'Control Room Camera 1'
  ];

  const incidentTypes = [
    'Suspicious Activity',
    'Theft/Shoplifting',
    'Vandalism',
    'Altercation',
    'Safety Concern',
    'Vehicle Incident',
    'Unauthorized Access',
    'Equipment Malfunction',
    'Fire/Smoke',
    'Medical Emergency',
    'Crowd Control',
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
    const newLog = {
      id: cctvLogs.length + 1,
      timestamp: formData.timestamp,
      camera: formData.cameraLocation,
      incident: formData.incident,
      severity: formData.severity,
      description: formData.description,
      actionTaken: formData.actionTaken,
      status: 'New',
      recordingRef: `REC-2024-${String(cctvLogs.length + 1).padStart(3, '0')}`
    };
    setCctvLogs([newLog, ...cctvLogs]);
    setFormData({
      timestamp: '',
      cameraLocation: '',
      incident: '',
      severity: 'low',
      description: '',
      actionTaken: '',
      followUpRequired: false,
      recordingReference: '',
      witnessDetails: '',
      reportedBy: ''
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
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
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'New':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">
        {/* CCTV Log Form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">CCTV Incident Log</h2>
          <form id="cctv-log-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Timestamp *</label>
              <input
                type="datetime-local"
                name="timestamp"
                value={formData.timestamp}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Camera Location *</label>
              <select
                name="cameraLocation"
                value={formData.cameraLocation}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                required
              >
                <option value="">Select camera location</option>
                {cameraLocations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Incident Type *</label>
              <select
                name="incident"
                value={formData.incident}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                required
              >
                <option value="">Select incident type</option>
                {incidentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Severity Level *</label>
              <select
                name="severity"
                value={formData.severity}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                maxLength={500}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Detailed description of what was observed..."
                required
              />
              <div className="text-xs text-gray-500 mt-1">{formData.description.length}/500 characters</div>
            </div>

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
              <label className="block text-sm font-medium text-gray-700 mb-1">Recording Reference</label>
              <input
                type="text"
                name="recordingReference"
                value={formData.recordingReference}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., REC-2024-001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Witness Details</label>
              <textarea
                name="witnessDetails"
                value={formData.witnessDetails}
                onChange={handleInputChange}
                rows={2}
                maxLength={500}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Any witness information..."
              />
              <div className="text-xs text-gray-500 mt-1">{formData.witnessDetails.length}/500 characters</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reported By</label>
              <input
                type="text"
                name="reportedBy"
                value={formData.reportedBy}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Guard name or ID"
              />
            </div>

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

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
            >
              Submit CCTV Log
            </button>
          </form>
        </div>

        {/* Recent CCTV Logs */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent CCTV Logs</h2>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {cctvLogs.map((log) => (
              <div key={log.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(log.severity)}`}>
                      {log.severity.toUpperCase()}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(log.status)}`}>
                      {log.status}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">{log.timestamp}</span>
                </div>
                
                <h3 className="text-sm font-medium text-gray-900 mb-1">{log.incident}</h3>
                <p className="text-xs text-gray-600 mb-2">{log.camera}</p>
                <p className="text-xs text-gray-700 mb-2">{log.description}</p>
                
                <div className="bg-gray-50 p-2 rounded text-xs">
                  <strong>Action:</strong> {log.actionTaken}
                </div>
                
                {log.recordingRef && (
                  <div className="mt-2 text-xs text-blue-600">
                    <i className="ri-video-line mr-1"></i>
                    Recording: {log.recordingRef}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Camera Status Grid */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Camera Status Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {cameraLocations.map((camera, index) => (
            <div key={camera} className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className={`w-3 h-3 rounded-full ${index % 10 === 0 ? 'bg-red-500' : 'bg-green-500'}`}></div>
                <span className="text-xs text-gray-500">
                  {index % 10 === 0 ? 'Offline' : 'Online'}
                </span>
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">{camera}</h3>
              <p className="text-xs text-gray-600">
                {index % 10 === 0 ? 'Connection Lost' : 'Recording'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}