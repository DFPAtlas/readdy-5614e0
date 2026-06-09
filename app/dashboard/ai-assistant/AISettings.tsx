'use client';

import { useState } from 'react';

export default function AISettings() {
  const [settings, setSettings] = useState({
    autoGenerate: true,
    voiceCommands: true,
    smartAlerts: true,
    predictiveAnalysis: false,
    dataRetention: '30',
    processingMode: 'balanced',
    alertSensitivity: 'medium',
    languageModel: 'advanced'
  });

  const handleSettingChange = (key: string, value: boolean | string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const aiCapabilities = [
    { name: 'Voice Recognition', status: 'active', uptime: '99.8%' },
    { name: 'Pattern Analysis', status: 'active', uptime: '98.5%' },
    { name: 'Predictive Modeling', status: 'learning', uptime: '87.2%' },
    { name: 'Natural Language Processing', status: 'active', uptime: '96.7%' },
    { name: 'Image Recognition', status: 'active', uptime: '94.3%' },
    { name: 'Anomaly Detection', status: 'active', uptime: '97.1%' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'learning': return 'bg-yellow-100 text-yellow-800';
      case 'maintenance': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">AI Assistant Settings</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap">
          Save Changes
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium text-gray-900">Auto-Generate Reports</label>
                  <p className="text-sm text-gray-600">Automatically create daily and weekly reports</p>
                </div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.autoGenerate}
                    onChange={(e) => handleSettingChange('autoGenerate', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium text-gray-900">Voice Commands</label>
                  <p className="text-sm text-gray-600">Enable voice-activated controls</p>
                </div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.voiceCommands}
                    onChange={(e) => handleSettingChange('voiceCommands', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium text-gray-900">Smart Alerts</label>
                  <p className="text-sm text-gray-600">AI-powered intelligent notifications</p>
                </div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.smartAlerts}
                    onChange={(e) => handleSettingChange('smartAlerts', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium text-gray-900">Predictive Analysis</label>
                  <p className="text-sm text-gray-600">Advanced forecasting and trend analysis</p>
                </div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.predictiveAnalysis}
                    onChange={(e) => handleSettingChange('predictiveAnalysis', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Processing Configuration</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data Retention (days)</label>
                <select
                  value={settings.dataRetention}
                  onChange={(e) => handleSettingChange('dataRetention', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                >
                  <option value="30">30 days</option>
                  <option value="60">60 days</option>
                  <option value="90">90 days</option>
                  <option value="180">6 months</option>
                  <option value="365">1 year</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Processing Mode</label>
                <select
                  value={settings.processingMode}
                  onChange={(e) => handleSettingChange('processingMode', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                >
                  <option value="fast">Fast (Lower accuracy)</option>
                  <option value="balanced">Balanced (Recommended)</option>
                  <option value="accurate">Accurate (Slower processing)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Alert Sensitivity</label>
                <select
                  value={settings.alertSensitivity}
                  onChange={(e) => handleSettingChange('alertSensitivity', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                >
                  <option value="low">Low (Fewer alerts)</option>
                  <option value="medium">Medium (Balanced)</option>
                  <option value="high">High (More sensitive)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Language Model</label>
                <select
                  value={settings.languageModel}
                  onChange={(e) => handleSettingChange('languageModel', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                >
                  <option value="basic">Basic (Faster)</option>
                  <option value="standard">Standard (Balanced)</option>
                  <option value="advanced">Advanced (Most accurate)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Capabilities Status</h3>
            <div className="space-y-3">
              {aiCapabilities.map((capability, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{capability.name}</div>
                    <div className="text-sm text-gray-600">Uptime: {capability.uptime}</div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(capability.status)}`}>
                    {capability.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Training Progress</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Security Pattern Recognition</span>
                  <span className="font-medium">94%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '94%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Voice Command Accuracy</span>
                  <span className="font-medium">87%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '87%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Predictive Analysis</span>
                  <span className="font-medium">72%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '72%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <i className="ri-leaf-line text-white text-lg"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">AI Performance</h3>
                <p className="text-sm text-gray-600">Current system efficiency</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">98.7%</div>
                <div className="text-sm text-gray-600">Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">1.2s</div>
                <div className="text-sm text-gray-600">Response Time</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <i className="ri-warning-line text-yellow-600"></i>
          <h4 className="font-semibold text-yellow-800">Important Notes</h4>
        </div>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Changes to AI settings may take up to 15 minutes to take effect</li>
          <li>• Predictive analysis requires at least 30 days of historical data</li>
          <li>• Higher processing modes consume more system resources</li>
          <li>• Voice commands are processed locally for security</li>
        </ul>
      </div>
    </div>
  );
}