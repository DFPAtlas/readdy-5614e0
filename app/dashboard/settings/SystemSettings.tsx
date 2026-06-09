'use client';

import { useState } from 'react';

export default function SystemSettings() {
  const [systemSettings, setSystemSettings] = useState({
    companyName: 'GuardianHub Security Services',
    companyAddress: '123 Security Lane, London, UK',
    companyPhone: '+44 20 1234 5678',
    companyEmail: 'admin@guardianhub.co.uk',
    timezone: 'Europe/London',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24-hour',
    currency: 'GBP',
    autoBackup: true,
    backupFrequency: 'daily',
    retentionPeriod: '365',
    maintenanceMode: false,
    debugMode: false,
    apiRateLimit: '1000',
    maxFileSize: '10',
    allowedFileTypes: 'jpg,png,pdf,doc,docx'
  });

  const [integrations, setIntegrations] = useState({
    googleMaps: true,
    emailService: true,
    smsService: false,
    paymentGateway: true,
    cloudStorage: true,
    analytics: false
  });

  const [emailSettings, setEmailSettings] = useState({
    smtpServer: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUsername: 'noreply@guardianhub.co.uk',
    smtpPassword: '••••••••••••',
    fromEmail: 'noreply@guardianhub.co.uk',
    fromName: 'GuardianHub Notifications'
  });

  const handleSettingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setSystemSettings(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setSystemSettings(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleIntegrationChange = (name: string) => {
    setIntegrations(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEmailSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const [systemToast, setSystemToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setSystemToast(msg);
    setTimeout(() => setSystemToast(null), 3000);
  };

  const handleSave = () => showToast('Settings saved successfully.');
  const handleBackupNow = () => showToast('Manual backup initiated.');
  const handleClearCache = () => showToast('Cache cleared.');
  const handleExportData = () => showToast('Data export initiated.');

  return (
    <div className="space-y-6">
      {/* Company Information */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Company Information</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
              <input
                type="text"
                name="companyName"
                value={systemSettings.companyName}
                onChange={handleSettingChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                name="companyPhone"
                value={systemSettings.companyPhone}
                onChange={handleSettingChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                name="companyEmail"
                value={systemSettings.companyEmail}
                onChange={handleSettingChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
              <select
                name="currency"
                value={systemSettings.currency}
                onChange={handleSettingChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
              >
                <option value="GBP">GBP (£)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <textarea
                name="companyAddress"
                value={systemSettings.companyAddress}
                onChange={handleSettingChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Regional Settings */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Regional Settings</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
              <select
                name="timezone"
                value={systemSettings.timezone}
                onChange={handleSettingChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
              >
                <option value="Europe/London">Europe/London (GMT)</option>
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
              <select
                name="dateFormat"
                value={systemSettings.dateFormat}
                onChange={handleSettingChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Format</label>
              <select
                name="timeFormat"
                value={systemSettings.timeFormat}
                onChange={handleSettingChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
              >
                <option value="24-hour">24-hour</option>
                <option value="12-hour">12-hour</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Backup Settings */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Backup Settings</h2>
            <button
              onClick={handleBackupNow}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap text-sm"
            >
              Backup Now
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="autoBackup"
                  checked={systemSettings.autoBackup}
                  onChange={handleSettingChange}
                  className="mr-3"
                />
                <span className="text-sm text-gray-700">Enable automatic backups</span>
              </label>
            </div>
            
            {systemSettings.autoBackup && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Backup Frequency</label>
                  <select
                    name="backupFrequency"
                    value={systemSettings.backupFrequency}
                    onChange={handleSettingChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                  >
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Retention Period (days)</label>
                  <select
                    name="retentionPeriod"
                    value={systemSettings.retentionPeriod}
                    onChange={handleSettingChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                  >
                    <option value="30">30 days</option>
                    <option value="90">90 days</option>
                    <option value="180">180 days</option>
                    <option value="365">365 days</option>
                  </select>
                </div>
              </div>
            )}

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Last Backup</h4>
              <p className="text-sm text-gray-600">January 22, 2024 at 03:00 AM</p>
              <p className="text-xs text-gray-500 mt-1">Next backup scheduled for January 23, 2024 at 03:00 AM</p>
            </div>
          </div>
        </div>
      </div>

      {/* Email Configuration */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Email Configuration</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Server</label>
              <input
                type="text"
                name="smtpServer"
                value={emailSettings.smtpServer}
                onChange={handleEmailChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Port</label>
              <input
                type="number"
                name="smtpPort"
                value={emailSettings.smtpPort}
                onChange={handleEmailChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Username</label>
              <input
                type="text"
                name="smtpUsername"
                value={emailSettings.smtpUsername}
                onChange={handleEmailChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Password</label>
              <input
                type="password"
                name="smtpPassword"
                value={emailSettings.smtpPassword}
                onChange={handleEmailChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">From Email</label>
              <input
                type="email"
                name="fromEmail"
                value={emailSettings.fromEmail}
                onChange={handleEmailChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">From Name</label>
              <input
                type="text"
                name="fromName"
                value={emailSettings.fromName}
                onChange={handleEmailChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* System Integrations */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">System Integrations</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Google Maps</h4>
                <p className="text-sm text-gray-600">Location services and mapping</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={integrations.googleMaps}
                  onChange={() => handleIntegrationChange('googleMaps')}
                />
                <div className={`w-11 h-6 rounded-full ${integrations.googleMaps ? 'bg-blue-600' : 'bg-gray-200'}`}>
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${integrations.googleMaps ? 'translate-x-5' : 'translate-x-0'} mt-0.5 ml-0.5`}></div>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Email Service</h4>
                <p className="text-sm text-gray-600">Automated email notifications</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={integrations.emailService}
                  onChange={() => handleIntegrationChange('emailService')}
                />
                <div className={`w-11 h-6 rounded-full ${integrations.emailService ? 'bg-blue-600' : 'bg-gray-200'}`}>
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${integrations.emailService ? 'translate-x-5' : 'translate-x-0'} mt-0.5 ml-0.5`}></div>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">SMS Service</h4>
                <p className="text-sm text-gray-600">Text message notifications</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={integrations.smsService}
                  onChange={() => handleIntegrationChange('smsService')}
                />
                <div className={`w-11 h-6 rounded-full ${integrations.smsService ? 'bg-blue-600' : 'bg-gray-200'}`}>
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${integrations.smsService ? 'translate-x-5' : 'translate-x-0'} mt-0.5 ml-0.5`}></div>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Payment Gateway</h4>
                <p className="text-sm text-gray-600">Payment processing integration</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={integrations.paymentGateway}
                  onChange={() => handleIntegrationChange('paymentGateway')}
                />
                <div className={`w-11 h-6 rounded-full ${integrations.paymentGateway ? 'bg-blue-600' : 'bg-gray-200'}`}>
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${integrations.paymentGateway ? 'translate-x-5' : 'translate-x-0'} mt-0.5 ml-0.5`}></div>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Cloud Storage</h4>
                <p className="text-sm text-gray-600">File storage and backup</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={integrations.cloudStorage}
                  onChange={() => handleIntegrationChange('cloudStorage')}
                />
                <div className={`w-11 h-6 rounded-full ${integrations.cloudStorage ? 'bg-blue-600' : 'bg-gray-200'}`}>
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${integrations.cloudStorage ? 'translate-x-5' : 'translate-x-0'} mt-0.5 ml-0.5`}></div>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Analytics</h4>
                <p className="text-sm text-gray-600">Usage analytics and reporting</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={integrations.analytics}
                  onChange={() => handleIntegrationChange('analytics')}
                />
                <div className={`w-11 h-6 rounded-full ${integrations.analytics ? 'bg-blue-600' : 'bg-gray-200'}`}>
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${integrations.analytics ? 'translate-x-5' : 'translate-x-0'} mt-0.5 ml-0.5`}></div>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Advanced Settings</h2>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">API Rate Limit (requests/hour)</label>
                <input
                  type="number"
                  name="apiRateLimit"
                  value={systemSettings.apiRateLimit}
                  onChange={handleSettingChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max File Size (MB)</label>
                <input
                  type="number"
                  name="maxFileSize"
                  value={systemSettings.maxFileSize}
                  onChange={handleSettingChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Allowed File Types</label>
                <input
                  type="text"
                  name="allowedFileTypes"
                  value={systemSettings.allowedFileTypes}
                  onChange={handleSettingChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="jpg,png,pdf,doc,docx"
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="maintenanceMode"
                  checked={systemSettings.maintenanceMode}
                  onChange={handleSettingChange}
                  className="mr-3"
                />
                <span className="text-sm text-gray-700">Enable maintenance mode</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="debugMode"
                  checked={systemSettings.debugMode}
                  onChange={handleSettingChange}
                  className="mr-3"
                />
                <span className="text-sm text-gray-700">Enable debug mode</span>
              </label>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleClearCache}
                className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors cursor-pointer whitespace-nowrap text-sm"
              >
                Clear Cache
              </button>
              <button
                onClick={handleExportData}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors cursor-pointer whitespace-nowrap text-sm"
              >
                Export Data
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
        >
          Save All Settings
        </button>
      </div>
    </div>
  );
}