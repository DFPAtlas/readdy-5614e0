'use client';

import { useState } from 'react';

interface CheckInFormProps {
  guardInfo: {
    name: string;
    id: string;
    assignedSite: string;
    siteId: string;
  };
}

export default function CheckInForm({ guardInfo }: CheckInFormProps) {
  const [formData, setFormData] = useState({
    location: '',
    status: 'normal',
    notes: '',
    weatherConditions: '',
    temperature: '',
    visibility: 'good'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastCheckIn, setLastCheckIn] = useState<Date | null>(null);

  const checkInLocations = [
    'Main Entrance',
    'Parking Area A',
    'Parking Area B',
    'Building Perimeter',
    'Loading Dock',
    'Emergency Exits',
    'Roof Access',
    'Security Office',
    'West Wing',
    'East Wing'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setLastCheckIn(new Date());
      setFormData({
        location: '',
        status: 'normal',
        notes: '',
        weatherConditions: '',
        temperature: '',
        visibility: 'good'
      });
      setIsSubmitting(false);
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="space-y-6">
      {lastCheckIn && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
          <div className="flex items-center">
            <i className="ri-check-line text-emerald-400 mr-2"></i>
            <span className="text-emerald-300">
              Check-in successful at {lastCheckIn.toLocaleTimeString()} from {formData.location || 'selected location'}
            </span>
          </div>
        </div>
      )}

      <div className="bg-[#111827]/60 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Site Check-In</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Check-In Location *
              </label>
              <select
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 pr-8 bg-gray-800/60 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 text-white"
              >
                <option value="">Select Location</option>
                {checkInLocations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Area Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 pr-8 bg-gray-800/60 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 text-white"
              >
                <option value="normal">Normal - All Clear</option>
                <option value="attention">Needs Attention</option>
                <option value="urgent">Urgent Issue</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Weather Conditions
              </label>
              <input
                type="text"
                name="weatherConditions"
                value={formData.weatherConditions}
                onChange={handleChange}
                placeholder="e.g., Clear, Rainy, Foggy"
                className="w-full px-3 py-2 bg-gray-800/60 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 text-white placeholder-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Temperature (°C)
              </label>
              <input
                type="number"
                name="temperature"
                value={formData.temperature}
                onChange={handleChange}
                placeholder="e.g., 18"
                className="w-full px-3 py-2 bg-gray-800/60 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 text-white placeholder-gray-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Visibility
              </label>
              <select
                name="visibility"
                value={formData.visibility}
                onChange={handleChange}
                className="w-full px-3 py-2 pr-8 bg-gray-800/60 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 text-white"
              >
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Additional Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              maxLength={500}
              placeholder="Any observations, issues, or additional information..."
              className="w-full px-3 py-2 bg-gray-800/60 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 text-white placeholder-gray-500"
            />
            <div className="text-sm text-gray-500 mt-1">
              {formData.notes.length}/500 characters
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => setFormData({
                location: '',
                status: 'normal',
                notes: '',
                weatherConditions: '',
                temperature: '',
                visibility: 'good'
              })}
              className="px-6 py-2 text-gray-300 border border-gray-700 rounded-lg hover:bg-white/5 transition-colors cursor-pointer whitespace-nowrap"
            >
              Clear Form
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.location}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap flex items-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <i className="ri-send-plane-line mr-2"></i>
                  Submit Check-In
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-[#111827]/60 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Check-Ins</h3>
        <div className="space-y-3">
          {[
            { location: 'Main Entrance', time: '14:30', status: 'Normal' },
            { location: 'Parking Area A', time: '13:45', status: 'Normal' },
            { location: 'Building Perimeter', time: '13:00', status: 'Attention' },
            { location: 'Emergency Exits', time: '12:15', status: 'Normal' }
          ].map((checkIn, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-white/5 last:border-b-0">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-3 ${
                  checkIn.status === 'Normal' ? 'bg-emerald-500' : 'bg-amber-500'
                }`}></div>
                <span className="font-medium text-white">{checkIn.location}</span>
              </div>
              <div className="text-sm text-gray-400">{checkIn.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}