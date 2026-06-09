'use client';

import { useState } from 'react';

interface IncidentReportProps {
  guardInfo: {
    name: string;
    id: string;
    assignedSite: string;
    siteId: string;
  };
}

export default function IncidentReport({ guardInfo }: IncidentReportProps) {
  const [formData, setFormData] = useState({
    incidentType: '',
    severity: 'low',
    location: '',
    dateTime: '',
    description: '',
    witnessName: '',
    witnessContact: '',
    actionsTaken: '',
    policeInvolved: false,
    emergencyServices: false,
    followUpRequired: false,
    followUpNotes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  const incidentTypes = [
    'Theft/Burglary',
    'Vandalism',
    'Trespassing',
    'Suspicious Activity',
    'Fire/Safety',
    'Medical Emergency',
    'Accident/Injury',
    'Equipment Malfunction',
    'Disturbance',
    'Other'
  ];

  const locations = [
    'Main Building',
    'West Wing',
    'East Wing',
    'Parking Area A',
    'Parking Area B',
    'Loading Dock',
    'Emergency Exits',
    'Roof Access',
    'Security Office',
    'Perimeter Fence',
    'Reception Area',
    'Stairwell',
    'Elevator'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setSubmissionSuccess(true);
      setIsSubmitting(false);
      setTimeout(() => {
        setFormData({
          incidentType: '',
          severity: 'low',
          location: '',
          dateTime: '',
          description: '',
          witnessName: '',
          witnessContact: '',
          actionsTaken: '',
          policeInvolved: false,
          emergencyServices: false,
          followUpRequired: false,
          followUpNotes: ''
        });
        setSubmissionSuccess(false);
      }, 3000);
    }, 1500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    });
  };

  if (submissionSuccess) {
    return (
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-8 text-center">
        <div className="w-16 h-16 bg-emerald-500/15 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="ri-check-line text-emerald-400 text-2xl"></i>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Incident Report Submitted</h3>
        <p className="text-gray-300">
          Your incident report has been successfully submitted and will be reviewed by the control room immediately.
        </p>
        <p className="text-sm text-gray-400 mt-2">
          Report ID: INC-{Date.now().toString().slice(-6)}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-[#111827]/60 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Incident Report</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Incident Type *
              </label>
              <select
                name="incidentType"
                value={formData.incidentType}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 pr-8 bg-gray-800/60 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500 text-white"
              >
                <option value="">Select Incident Type</option>
                {incidentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Severity Level *
              </label>
              <select
                name="severity"
                value={formData.severity}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 pr-8 bg-gray-800/60 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500 text-white"
              >
                <option value="low">Low - Minor issue</option>
                <option value="medium">Medium - Requires attention</option>
                <option value="high">High - Urgent response needed</option>
                <option value="critical">Critical - Emergency response</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Location *
              </label>
              <select
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 pr-8 bg-gray-800/60 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500 text-white"
              >
                <option value="">Select Location</option>
                {locations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Date & Time *
              </label>
              <input
                type="datetime-local"
                name="dateTime"
                value={formData.dateTime}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-gray-800/60 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Incident Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              maxLength={500}
              required
              placeholder="Provide detailed description of the incident..."
              className="w-full px-3 py-2 bg-gray-800/60 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500 text-white placeholder-gray-500"
            />
            <div className="text-sm text-gray-500 mt-1">
              {formData.description.length}/500 characters
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Witness Name
              </label>
              <input
                type="text"
                name="witnessName"
                value={formData.witnessName}
                onChange={handleChange}
                placeholder="Full name of witness (if any)"
                className="w-full px-3 py-2 bg-gray-800/60 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500 text-white placeholder-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Witness Contact
              </label>
              <input
                type="text"
                name="witnessContact"
                value={formData.witnessContact}
                onChange={handleChange}
                placeholder="Phone number or email"
                className="w-full px-3 py-2 bg-gray-800/60 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500 text-white placeholder-gray-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Actions Taken *
            </label>
            <textarea
              name="actionsTaken"
              value={formData.actionsTaken}
              onChange={handleChange}
              rows={3}
              maxLength={500}
              required
              placeholder="Describe what actions were taken in response to the incident..."
              className="w-full px-3 py-2 bg-gray-800/60 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500 text-white placeholder-gray-500"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="policeInvolved"
                checked={formData.policeInvolved}
                onChange={handleChange}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-600 rounded cursor-pointer"
              />
              <label className="ml-2 block text-sm text-gray-300 cursor-pointer">
                Police were involved or contacted
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="emergencyServices"
                checked={formData.emergencyServices}
                onChange={handleChange}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-600 rounded cursor-pointer"
              />
              <label className="ml-2 block text-sm text-gray-300 cursor-pointer">
                Emergency services were called
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="followUpRequired"
                checked={formData.followUpRequired}
                onChange={handleChange}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-600 rounded cursor-pointer"
              />
              <label className="ml-2 block text-sm text-gray-300 cursor-pointer">
                Follow-up action required
              </label>
            </div>
          </div>

          {formData.followUpRequired && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Follow-up Notes
              </label>
              <textarea
                name="followUpNotes"
                value={formData.followUpNotes}
                onChange={handleChange}
                rows={2}
                maxLength={500}
                placeholder="Specify what follow-up actions are needed..."
                className="w-full px-3 py-2 bg-gray-800/60 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500 text-white placeholder-gray-500"
              />
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => setFormData({
                incidentType: '',
                severity: 'low',
                location: '',
                dateTime: '',
                description: '',
                witnessName: '',
                witnessContact: '',
                actionsTaken: '',
                policeInvolved: false,
                emergencyServices: false,
                followUpRequired: false,
                followUpNotes: ''
              })}
              className="px-6 py-2 text-gray-300 border border-gray-700 rounded-lg hover:bg-white/5 transition-colors cursor-pointer whitespace-nowrap"
            >
              Clear Form
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap flex items-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <i className="ri-alarm-warning-line mr-2"></i>
                  Submit Report
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}