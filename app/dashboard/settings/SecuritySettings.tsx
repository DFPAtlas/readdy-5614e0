'use client';

import { useState } from 'react';

export default function SecuritySettings() {
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [backupCodes, setBackupCodes] = useState([
    'ABC123DEF456',
    'GHI789JKL012',
    'MNO345PQR678',
    'STU901VWX234',
    'YZA567BCD890'
  ]);

  const [sessions, setSessions] = useState([
    {
      id: 1,
      device: 'Chrome on Windows',
      location: 'London, UK',
      lastActive: '2024-01-22 14:30',
      current: true,
      ipAddress: '192.168.1.100'
    },
    {
      id: 2,
      device: 'Safari on iPhone',
      location: 'London, UK',
      lastActive: '2024-01-22 09:15',
      current: false,
      ipAddress: '192.168.1.101'
    },
    {
      id: 3,
      device: 'Firefox on Mac',
      location: 'Birmingham, UK',
      lastActive: '2024-01-21 16:45',
      current: false,
      ipAddress: '192.168.1.102'
    }
  ]);

  const [loginAttempts] = useState([
    {
      id: 1,
      timestamp: '2024-01-22 14:30',
      location: 'London, UK',
      ipAddress: '192.168.1.100',
      status: 'Success',
      device: 'Chrome on Windows'
    },
    {
      id: 2,
      timestamp: '2024-01-22 09:15',
      location: 'London, UK',
      ipAddress: '192.168.1.101',
      status: 'Success',
      device: 'Safari on iPhone'
    },
    {
      id: 3,
      timestamp: '2024-01-21 23:42',
      location: 'Unknown',
      ipAddress: '192.168.1.255',
      status: 'Failed',
      device: 'Unknown'
    }
  ]);

  const [securitySettings, setSecuritySettings] = useState({
    sessionTimeout: '8',
    loginAlerts: true,
    suspiciousActivity: true,
    passwordExpiry: '90',
    requireStrongPassword: true,
    allowRememberDevice: true
  });

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSettingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setSecuritySettings(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setSecuritySettings(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    setPasswordSuccess(true);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setTimeout(() => setPasswordSuccess(false), 3000);
  };

  const handleEnable2FA = () => {
    setTwoFactorEnabled(true);
  };

  const handleDisable2FA = () => {
    setTwoFactorEnabled(false);
  };

  const handleTerminateSession = (sessionId: number) => {
    setSessions(prev => prev.filter(session => session.id !== sessionId));
  };

  const handleTerminateAllSessions = () => {
    setSessions(prev => prev.filter(session => session.current));
  };

  const generateNewBackupCodes = () => {
    const newCodes = [];
    for (let i = 0; i < 5; i++) {
      newCodes.push(Math.random().toString(36).substring(2, 15).toUpperCase());
    }
    setBackupCodes(newCodes);
  };

  return (
    <div className="space-y-6">
      {/* Change Password */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Change Password</h2>
        </div>
        <div className="p-6">
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {passwordError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">{passwordError}</div>
            )}
            {passwordSuccess && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-700">Password updated successfully.</div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
            >
              Update Password
            </button>
          </form>
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Two-Factor Authentication</h2>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Status</h3>
              <p className="text-sm text-gray-600">
                {twoFactorEnabled ? 'Two-factor authentication is enabled' : 'Two-factor authentication is disabled'}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                twoFactorEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {twoFactorEnabled ? 'Enabled' : 'Disabled'}
              </span>
              {twoFactorEnabled ? (
                <button
                  onClick={handleDisable2FA}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors cursor-pointer whitespace-nowrap text-sm"
                >
                  Disable 2FA
                </button>
              ) : (
                <button
                  onClick={handleEnable2FA}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors cursor-pointer whitespace-nowrap text-sm"
                >
                  Enable 2FA
                </button>
              )}
            </div>
          </div>

          {twoFactorEnabled && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Backup Codes</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Store these codes in a safe place. You can use them to access your account if you lose your device.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {backupCodes.map((code, index) => (
                      <div key={index} className="font-mono text-sm text-gray-900 bg-white p-2 rounded border">
                        {code}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={generateNewBackupCodes}
                    className="mt-3 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors cursor-pointer whitespace-nowrap text-sm"
                  >
                    Generate New Codes
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Active Sessions */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Active Sessions</h2>
            <button
              onClick={handleTerminateAllSessions}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors cursor-pointer whitespace-nowrap text-sm"
            >
              Terminate All Others
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {sessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <i className="ri-computer-line text-blue-600"></i>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{session.device}</h4>
                    <p className="text-sm text-gray-600">{session.location} • {session.ipAddress}</p>
                    <p className="text-xs text-gray-500">Last active: {session.lastActive}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {session.current && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      Current
                    </span>
                  )}
                  {!session.current && (
                    <button
                      onClick={() => handleTerminateSession(session.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition-colors cursor-pointer whitespace-nowrap text-sm"
                    >
                      Terminate
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Login History */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Recent Login Activity</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {loginAttempts.map((attempt) => (
              <div key={attempt.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    attempt.status === 'Success' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <i className={`${attempt.status === 'Success' ? 'ri-checkbox-circle-line text-green-600' : 'ri-close-circle-line text-red-600'}`}></i>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{attempt.device}</h4>
                    <p className="text-sm text-gray-600">{attempt.location} • {attempt.ipAddress}</p>
                    <p className="text-xs text-gray-500">{attempt.timestamp}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  attempt.status === 'Success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {attempt.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Security Settings</h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (hours)</label>
              <select
                name="sessionTimeout"
                value={securitySettings.sessionTimeout}
                onChange={handleSettingChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
              >
                <option value="1">1 hour</option>
                <option value="2">2 hours</option>
                <option value="4">4 hours</option>
                <option value="8">8 hours</option>
                <option value="24">24 hours</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password Expiry (days)</label>
              <select
                name="passwordExpiry"
                value={securitySettings.passwordExpiry}
                onChange={handleSettingChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
              >
                <option value="30">30 days</option>
                <option value="60">60 days</option>
                <option value="90">90 days</option>
                <option value="180">180 days</option>
                <option value="365">365 days</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="loginAlerts"
                checked={securitySettings.loginAlerts}
                onChange={handleSettingChange}
                className="mr-3"
              />
              <span className="text-sm text-gray-700">Send alerts for new login attempts</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="suspiciousActivity"
                checked={securitySettings.suspiciousActivity}
                onChange={handleSettingChange}
                className="mr-3"
              />
              <span className="text-sm text-gray-700">Monitor for suspicious activity</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="requireStrongPassword"
                checked={securitySettings.requireStrongPassword}
                onChange={handleSettingChange}
                className="mr-3"
              />
              <span className="text-sm text-gray-700">Require strong passwords</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="allowRememberDevice"
                checked={securitySettings.allowRememberDevice}
                onChange={handleSettingChange}
                className="mr-3"
              />
              <span className="text-sm text-gray-700">Allow "Remember this device" option</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}