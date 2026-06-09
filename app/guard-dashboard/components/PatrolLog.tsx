'use client';

import { useState } from 'react';

interface PatrolLogProps {
  guardInfo: {
    name: string;
    id: string;
    assignedSite: string;
    siteId: string;
  };
}

export default function PatrolLog({ guardInfo }: PatrolLogProps) {
  const [activePatrol, setActivePatrol] = useState<string | null>(null);
  const [patrolData, setPatrolData] = useState({
    patrolType: '',
    startTime: '',
    endTime: '',
    areasChecked: [] as string[],
    observations: '',
    issuesFound: '',
    actionsTaken: '',
    nextPatrolTime: ''
  });

  const patrolTypes = [
    'Routine Perimeter Check',
    'Building Interior Patrol',
    'Parking Area Inspection',
    'Emergency Exit Check',
    'Equipment Check',
    'Incident Follow-up'
  ];

  const patrolAreas = [
    'Main Building',
    'West Wing',
    'East Wing',
    'Parking Area A',
    'Parking Area B',
    'Loading Dock',
    'Emergency Exits',
    'Roof Access',
    'Security Office',
    'Perimeter Fence'
  ];

  const startPatrol = (type: string) => {
    setActivePatrol(type);
    setPatrolData({
      ...patrolData,
      patrolType: type,
      startTime: new Date().toLocaleTimeString(),
      areasChecked: [],
      observations: '',
      issuesFound: '',
      actionsTaken: '',
      nextPatrolTime: ''
    });
  };

  const endPatrol = () => {
    setPatrolData({
      ...patrolData,
      endTime: new Date().toLocaleTimeString()
    });
    setActivePatrol(null);
  };

  const toggleArea = (area: string) => {
    setPatrolData({
      ...patrolData,
      areasChecked: patrolData.areasChecked.includes(area)
        ? patrolData.areasChecked.filter(a => a !== area)
        : [...patrolData.areasChecked, area]
    });
  };

  const completedPatrols = [
    {
      type: 'Routine Perimeter Check',
      startTime: '12:00',
      endTime: '12:30',
      areasChecked: 5,
      status: 'Completed',
      issues: 0
    },
    {
      type: 'Building Interior Patrol',
      startTime: '10:00',
      endTime: '10:45',
      areasChecked: 8,
      status: 'Completed',
      issues: 1
    },
    {
      type: 'Parking Area Inspection',
      startTime: '08:00',
      endTime: '08:20',
      areasChecked: 3,
      status: 'Completed',
      issues: 0
    }
  ];

  return (
    <div className="space-y-6">
      {activePatrol && (
        <div className="bg-blue-600/10 border border-blue-500/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-blue-300">Active Patrol: {activePatrol}</h2>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-400 rounded-full mr-2 animate-pulse"></div>
              <span className="text-blue-400">In Progress</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Start Time
              </label>
              <div className="text-white font-medium">{patrolData.startTime}</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Areas to Check
              </label>
              <div className="grid grid-cols-2 gap-2">
                {patrolAreas.map(area => (
                  <label key={area} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={patrolData.areasChecked.includes(area)}
                      onChange={() => toggleArea(area)}
                      className="mr-2 cursor-pointer"
                    />
                    <span className="text-sm text-gray-300">{area}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Observations
              </label>
              <textarea
                value={patrolData.observations}
                onChange={(e) => setPatrolData({...patrolData, observations: e.target.value})}
                rows={3}
                maxLength={500}
                placeholder="Any observations during patrol..."
                className="w-full px-3 py-2 bg-gray-800/60 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 text-white placeholder-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Issues Found
              </label>
              <textarea
                value={patrolData.issuesFound}
                onChange={(e) => setPatrolData({...patrolData, issuesFound: e.target.value})}
                rows={2}
                maxLength={500}
                placeholder="Any issues or concerns found..."
                className="w-full px-3 py-2 bg-gray-800/60 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 text-white placeholder-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Actions Taken
              </label>
              <textarea
                value={patrolData.actionsTaken}
                onChange={(e) => setPatrolData({...patrolData, actionsTaken: e.target.value})}
                rows={2}
                maxLength={500}
                placeholder="Actions taken to address any issues..."
                className="w-full px-3 py-2 bg-gray-800/60 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 text-white placeholder-gray-500"
              />
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={endPatrol}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors cursor-pointer whitespace-nowrap flex items-center"
            >
              <i className="ri-stop-line mr-2"></i>
              End Patrol
            </button>
          </div>
        </div>
      )}

      {!activePatrol && (
        <div className="bg-[#111827]/60 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Start New Patrol</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {patrolTypes.map(type => (
              <button
                key={type}
                onClick={() => startPatrol(type)}
                className="p-4 text-left border border-white/10 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
              >
                <div className="font-medium text-white">{type}</div>
                <div className="text-sm text-gray-400 mt-1">
                  Click to start this patrol type
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="bg-[#111827]/60 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Completed Patrols Today</h3>
        <div className="space-y-4">
          {completedPatrols.map((patrol, index) => (
            <div key={index} className="border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-white">{patrol.type}</h4>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></div>
                  <span className="text-sm text-emerald-400">{patrol.status}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Start:</span>
                  <span className="text-white ml-2">{patrol.startTime}</span>
                </div>
                <div>
                  <span className="text-gray-500">End:</span>
                  <span className="text-white ml-2">{patrol.endTime}</span>
                </div>
                <div>
                  <span className="text-gray-500">Areas:</span>
                  <span className="text-white ml-2">{patrol.areasChecked}</span>
                </div>
                <div>
                  <span className="text-gray-500">Issues:</span>
                  <span className={`ml-2 ${patrol.issues > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {patrol.issues}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}