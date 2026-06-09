'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('last-7-days');
  const [selectedSite, setSelectedSite] = useState('all');

  const reportTypes = [
    { id: 'security-incidents', name: 'Security Incidents', icon: 'ri-error-warning-line', color: 'text-red-600' },
    { id: 'staff-attendance', name: 'Staff Attendance', icon: 'ri-user-line', color: 'text-blue-600' },
    { id: 'patrol-reports', name: 'Patrol Reports', icon: 'ri-map-pin-line', color: 'text-green-600' },
    { id: 'maintenance-requests', name: 'Maintenance Requests', icon: 'ri-tools-line', color: 'text-orange-600' },
    { id: 'visitor-logs', name: 'Visitor Logs', icon: 'ri-user-add-line', color: 'text-purple-600' },
    { id: 'cctv-analytics', name: 'CCTV Analytics', icon: 'ri-video-line', color: 'text-indigo-600' },
    { id: 'client-summary', name: 'Client Summary', icon: 'ri-file-text-line', color: 'text-gray-600' },
    { id: 'performance-metrics', name: 'Performance Metrics', icon: 'ri-bar-chart-line', color: 'text-teal-600' }
  ];

  const sites = [
    { id: 'all', name: 'All Sites' },
    { id: '1', name: 'City Centre Mall' },
    { id: '2', name: 'Industrial Park East' },
    { id: '3', name: 'Riverside Office Complex' },
    { id: '4', name: 'Warehouse District' },
    { id: '5', name: 'Shopping Centre West' },
    { id: '6', name: 'Corporate Tower' }
  ];

  const quickStats = [
    { title: 'Total Reports Generated', value: '247', change: '+12%', icon: 'ri-file-list-line' },
    { title: 'Active Incidents', value: '3', change: '-25%', icon: 'ri-error-warning-line' },
    { title: 'Staff Check-ins Today', value: '18/21', change: '+5%', icon: 'ri-user-follow-line' },
    { title: 'Client Satisfaction', value: '98.5%', change: '+2.1%', icon: 'ri-star-line' }
  ];

  const recentReports = [
    { title: 'Weekly Security Summary - City Centre Mall', generated: '2 hours ago', type: 'Client Report', status: 'Sent' },
    { title: 'Staff Performance Analytics - All Sites', generated: '5 hours ago', type: 'Internal Report', status: 'Draft' },
    { title: 'Incident Analysis - Industrial Park East', generated: '1 day ago', type: 'Security Report', status: 'Sent' },
    { title: 'Monthly Patrol Effectiveness Report', generated: '2 days ago', type: 'Performance Report', status: 'Sent' }
  ];

  const [reportToast, setReportToast] = useState<string | null>(null);

  const handleGenerateReport = (reportType: string) => {
    setReportToast(`Generating ${reportType.replace(/-/g, ' ')} report...`);
    setTimeout(() => setReportToast(null), 3000);
  };

  const handleScheduleReport = (reportType: string) => {
    setReportToast(`${reportType.replace(/-/g, ' ')} report scheduled.`);
    setTimeout(() => setReportToast(null), 3000);
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a]">      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Control Room Reports Dashboard</h1>
          <p className="text-gray-400">Generate comprehensive reports for clients and internal analysis</p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <div key={index} className="bg-[#111827]/80 p-6 rounded-xl border border-gray-800 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-600/15 rounded-lg flex items-center justify-center">
                  <i className={`${stat.icon} text-xl text-blue-400`}></i>
                </div>
                <span className="text-sm font-medium text-emerald-400">{stat.change}</span>
              </div>
              <h3 className="text-sm font-medium text-gray-400 mb-1">{stat.title}</h3>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-[#111827]/80 p-6 rounded-xl border border-gray-800 backdrop-blur-sm mb-8">
          <div className="flex flex-wrap items-center space-x-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Date Range</label>
              <select 
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
              >
                <option value="today">Today</option>
                <option value="last-7-days">Last 7 Days</option>
                <option value="last-30-days">Last 30 Days</option>
                <option value="last-quarter">Last Quarter</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Site</label>
              <select 
                value={selectedSite}
                onChange={(e) => setSelectedSite(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
              >
                {sites.map(site => (
                  <option key={site.id} value={site.id}>{site.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end space-x-3">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap">
                Apply Filters
              </button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap">
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Report Types Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-6">Available Reports</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {reportTypes.map((report) => (
              <div key={report.id} className="bg-[#111827]/80 p-6 rounded-xl border border-gray-800 backdrop-blur-sm hover:border-gray-700 transition-colors">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                    <i className={`${report.icon} text-xl ${report.color}`}></i>
                  </div>
                  <h3 className="font-semibold text-white">{report.name}</h3>
                </div>
                
                <div className="space-y-2">
                  <button 
                    onClick={() => handleGenerateReport(report.id)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Generate Now
                  </button>
                  <button 
                    onClick={() => handleScheduleReport(report.id)}
                    className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Schedule
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Reports & Export Options */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Reports */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Recent Reports</h2>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium cursor-pointer">
                  View All
                </button>
              </div>
              
              <div className="space-y-4">
                {recentReports.map((report, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{report.title}</h3>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-gray-600">{report.generated}</span>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-600">{report.type}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        report.status === 'Sent' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {report.status}
                      </span>
                      <button className="text-gray-400 hover:text-gray-600 cursor-pointer">
                        <i className="ri-download-line"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Export & Client Tools */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Export Options</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors cursor-pointer">
                  <i className="ri-file-pdf-line text-red-600"></i>
                  <span>Export to PDF</span>
                </button>
                <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors cursor-pointer">
                  <i className="ri-file-excel-line text-green-600"></i>
                  <span>Export to Excel</span>
                </button>
                <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors cursor-pointer">
                  <i className="ri-mail-line text-blue-600"></i>
                  <span>Email Report</span>
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Client Portal</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors cursor-pointer">
                  <i className="ri-share-line"></i>
                  <span>Share with Client</span>
                </button>
                <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors cursor-pointer">
                  <i className="ri-calendar-line"></i>
                  <span>Schedule Auto-Send</span>
                </button>
                <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors cursor-pointer">
                  <i className="ri-settings-line"></i>
                  <span>Report Templates</span>
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link href="/dashboard/reports/security-incident" className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors cursor-pointer">
                  <i className="ri-error-warning-line"></i>
                  <span>Create Incident Report</span>
                </Link>
                <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors cursor-pointer">
                  <i className="ri-pie-chart-line"></i>
                  <span>View Analytics</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}