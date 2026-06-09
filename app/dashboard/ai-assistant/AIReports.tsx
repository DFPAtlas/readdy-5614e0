'use client';

import { useState } from 'react';

export default function AIReports() {
  const [selectedReport, setSelectedReport] = useState('');
  const [generatingReport, setGeneratingReport] = useState(false);
  const [reportHistory, setReportHistory] = useState([
    { name: 'Daily Operations Summary', type: 'daily', generated: '2 hours ago', size: '2.3 MB' },
    { name: 'Weekly Performance Analytics', type: 'weekly', generated: '1 day ago', size: '5.1 MB' },
    { name: 'Incident Analysis Report', type: 'incident', generated: '3 days ago', size: '1.8 MB' },
    { name: 'Staff Performance Review', type: 'staff', generated: '1 week ago', size: '3.2 MB' }
  ]);

  const reportTypes = [
    {
      id: 'daily',
      name: 'Daily Operations Report',
      description: 'Comprehensive overview of daily security operations, check-ins, and incidents',
      icon: 'ri-calendar-line',
      estimatedTime: '2-3 minutes',
      features: ['Site status summary', 'Staff check-in data', 'Incident logs', 'Performance metrics']
    },
    {
      id: 'weekly',
      name: 'Weekly Performance Analytics',
      description: 'In-depth analysis of weekly trends, patterns, and performance insights',
      icon: 'ri-bar-chart-line',
      estimatedTime: '5-7 minutes',
      features: ['Trend analysis', 'Performance benchmarks', 'AI insights', 'Recommendations']
    },
    {
      id: 'incident',
      name: 'Incident Analysis Report',
      description: 'Detailed analysis of security incidents with patterns and prevention strategies',
      icon: 'ri-alert-line',
      estimatedTime: '3-4 minutes',
      features: ['Incident categorization', 'Root cause analysis', 'Prevention strategies', 'Risk assessment']
    },
    {
      id: 'staff',
      name: 'Staff Performance Report',
      description: 'Individual and team performance metrics with improvement recommendations',
      icon: 'ri-team-line',
      estimatedTime: '4-5 minutes',
      features: ['Individual metrics', 'Team performance', 'Training needs', 'Recognition suggestions']
    },
    {
      id: 'predictive',
      name: 'Predictive Analytics Report',
      description: 'AI-powered predictions for future security needs and risk assessment',
      icon: 'ri-brain-line',
      estimatedTime: '6-8 minutes',
      features: ['Future trend predictions', 'Risk forecasting', 'Resource planning', 'Optimization suggestions']
    },
    {
      id: 'custom',
      name: 'Custom Report',
      description: 'Build a custom report with specific parameters and data points',
      icon: 'ri-settings-3-line',
      estimatedTime: '5-10 minutes',
      features: ['Custom parameters', 'Flexible data selection', 'Personalized insights', 'Export options']
    }
  ];

  const handleGenerateReport = (reportType: string) => {
    setGeneratingReport(true);
    setSelectedReport(reportType);
    
    setTimeout(() => {
      const reportName = reportTypes.find(r => r.id === reportType)?.name || 'Custom Report';
      const newReport = {
        name: reportName,
        type: reportType,
        generated: 'Just now',
        size: (Math.random() * 3 + 1).toFixed(1) + ' MB'
      };
      
      setReportHistory(prev => [newReport, ...prev]);
      setGeneratingReport(false);
      setSelectedReport('');
    }, 3000);
  };

  const getReportIcon = (type: string) => {
    const report = reportTypes.find(r => r.id === type);
    return report?.icon || 'ri-file-text-line';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">AI-Generated Reports</h2>
        <div className="flex items-center space-x-2">
          <div className="text-sm text-gray-600">Auto-generate:</div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Daily Reports</span>
          </label>
        </div>
      </div>

      {generatingReport && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <i className="ri-loader-4-line text-white animate-spin"></i>
            </div>
            <div>
              <h3 className="font-semibold text-blue-900">Generating Report</h3>
              <p className="text-sm text-blue-700">AI is analyzing your data and creating insights...</p>
            </div>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportTypes.map((report) => (
          <div key={report.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <i className={`${report.icon} text-blue-600 text-lg`}></i>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{report.name}</h3>
                <p className="text-sm text-gray-600">{report.estimatedTime}</p>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">{report.description}</p>
            
            <div className="space-y-2 mb-4">
              {report.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
            
            <button
              onClick={() => handleGenerateReport(report.id)}
              disabled={generatingReport}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap"
            >
              {generatingReport && selectedReport === report.id ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        ))}
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Reports</h3>
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="divide-y divide-gray-200">
            {reportHistory.map((report, index) => (
              <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <i className={`${getReportIcon(report.type)} text-gray-600`}></i>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{report.name}</h4>
                      <p className="text-sm text-gray-600">Generated {report.generated} • {report.size}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap">
                      <i className="ri-eye-line mr-1"></i>
                      View
                    </button>
                    <button className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors cursor-pointer whitespace-nowrap">
                      <i className="ri-download-line mr-1"></i>
                      Download
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
            <i className="ri-magic-line text-white text-lg"></i>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">AI Report Enhancement</h3>
        </div>
        <p className="text-gray-600 mb-4">
          Our AI continuously learns from your data to provide more accurate insights and personalized recommendations in every report.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">127</div>
            <div className="text-sm text-gray-600">Data Points Analyzed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">94%</div>
            <div className="text-sm text-gray-600">Accuracy Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">23</div>
            <div className="text-sm text-gray-600">Insights Generated</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">15s</div>
            <div className="text-sm text-gray-600">Average Processing</div>
          </div>
        </div>
      </div>
    </div>
  );
}