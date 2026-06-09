'use client';

import { useState } from 'react';

interface EmergencyActionsProps {
  guardInfo: {
    name: string;
    id: string;
    assignedSite: string;
    siteId: string;
  };
}

export default function EmergencyActions({ guardInfo }: EmergencyActionsProps) {
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [emergencyType, setEmergencyType] = useState('');
  const [emergencyDetails, setEmergencyDetails] = useState('');

  const emergencyTypes = [
    { type: 'fire', label: 'Fire Emergency', icon: 'ri-fire-line', color: 'bg-red-600' },
    { type: 'medical', label: 'Medical Emergency', icon: 'ri-first-aid-kit-line', color: 'bg-orange-600' },
    { type: 'security', label: 'Security Breach', icon: 'ri-shield-cross-line', color: 'bg-purple-600' },
    { type: 'evacuation', label: 'Evacuation Required', icon: 'ri-door-open-line', color: 'bg-yellow-600' }
  ];

  const handleEmergencyAlert = (type: string) => {
    setEmergencyType(type);
    setShowEmergencyModal(true);
  };

  const handleEmergencySubmit = () => {
    setShowEmergencyModal(false);
    setEmergencyType('');
    setEmergencyDetails('');
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#111827]/60 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Emergency Actions</h3>
          <div className="flex items-center text-sm text-gray-400">
            <i className="ri-phone-line mr-1"></i>
            Emergency: 999
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {emergencyTypes.map((emergency) => (
            <button
              key={emergency.type}
              onClick={() => handleEmergencyAlert(emergency.type)}
              className={`p-3 rounded-xl text-white font-medium transition-colors cursor-pointer whitespace-nowrap flex flex-col items-center ${emergency.color} hover:opacity-90`}
            >
              <i className={`${emergency.icon} text-xl mb-1`}></i>
              <span className="text-xs text-center">{emergency.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-4 flex justify-center">
          <button className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors cursor-pointer whitespace-nowrap flex items-center text-sm">
            <i className="ri-phone-line mr-2"></i>
            Contact Control Room
          </button>
        </div>
      </div>

      <div className="bg-[#111827]/60 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Site Info</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2 text-gray-300">
            <i className="ri-building-line text-blue-400"></i>
            Westfield Shopping Centre
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <i className="ri-map-pin-line text-blue-400"></i>
            123 High St, Manchester
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <i className="ri-phone-line text-blue-400"></i>
            +44 161 999 0000
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <i className="ri-shield-line text-blue-400"></i>
            Control: +44 161 123 4567
          </div>
        </div>
      </div>

      {showEmergencyModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111827] rounded-xl w-full max-w-md p-6 border border-white/10">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-500/15 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-alarm-warning-line text-red-400 text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-white">Emergency Alert</h3>
              <p className="text-gray-400 mt-2">
                {emergencyTypes.find(e => e.type === emergencyType)?.label}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Emergency Details
                </label>
                <textarea
                  value={emergencyDetails}
                  onChange={(e) => setEmergencyDetails(e.target.value)}
                  rows={3}
                  placeholder="Provide details about the emergency situation..."
                  className="w-full px-3 py-2 bg-gray-800/60 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500 text-white placeholder-gray-500"
                />
              </div>

              <div className="bg-red-500/10 p-4 rounded-lg border border-red-500/20">
                <p className="text-sm text-red-300">
                  This will immediately alert the control room and emergency services if required.
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setShowEmergencyModal(false)}
                className="px-6 py-2 text-gray-300 border border-gray-700 rounded-lg hover:bg-white/5 transition-colors cursor-pointer whitespace-nowrap"
              >
                Cancel
              </button>
              <button
                onClick={handleEmergencySubmit}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors cursor-pointer whitespace-nowrap flex items-center"
              >
                <i className="ri-alarm-warning-line mr-2"></i>
                Send Alert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}