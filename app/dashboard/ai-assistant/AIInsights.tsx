'use client';

import { useState } from 'react';

export default function AIInsights() {
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  const insights = [
    {
      type: 'performance',
      title: 'Staff Performance Insight',
      description: 'John Smith has maintained 99% check-in rate for the past 30 days. Consider promoting him to senior guard.',
      impact: 'high',
      icon: 'ri-user-star-line',
      color: 'green'
    },
    {
      type: 'security',
      title: 'Security Pattern Alert',
      description: 'Industrial Park East shows 3x higher incident rate during night shifts. Recommend additional patrol.',
      impact: 'critical',
      icon: 'ri-shield-keyhole-line',
      color: 'red'
    },
    {
      type: 'efficiency',
      title: 'Route Optimization',
      description: 'AI analysis suggests 15% time savings by adjusting patrol routes at City Centre Mall.',
      impact: 'medium',
      icon: 'ri-route-line',
      color: 'blue'
    },
    {
      type: 'prediction',
      title: 'Predictive Alert',
      description: 'Based on historical data, Corporate Tower may experience higher activity next Friday evening.',
      impact: 'medium',
      icon: 'ri-brain-line',
      color: 'purple'
    },
    {
      type: 'cost',
      title: 'Cost Optimization',
      description: 'Automated check-calls have reduced manual oversight costs by 23% this month.',
      impact: 'high',
      icon: 'ri-money-pound-circle-line',
      color: 'green'
    }
  ];

  const metrics = [
    { label: 'AI Accuracy', value: '97.2%', change: '+2.1%', icon: 'ri-target-line' },
    { label: 'Response Time', value: '1.3s', change: '-0.4s', icon: 'ri-timer-line' },
    { label: 'Incidents Prevented', value: '12', change: '+5', icon: 'ri-shield-check-line' },
    { label: 'Efficiency Gain', value: '28%', change: '+3%', icon: 'ri-speed-up-line' }
  ];

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getIconColor = (color: string) => {
    switch (color) {
      case 'red': return 'text-red-600 bg-red-100';
      case 'green': return 'text-green-600 bg-green-100';
      case 'blue': return 'text-blue-600 bg-blue-100';
      case 'purple': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">AI-Powered Insights</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Period:</span>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
          >
            <option value="day">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getIconColor('blue')}`}>
                <i className={`${metric.icon} text-sm`}></i>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                metric.change.startsWith('+') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {metric.change}
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
            <div className="text-sm text-gray-600">{metric.label}</div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Smart Recommendations</h3>
        {insights.map((insight, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-start space-x-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getIconColor(insight.color)}`}>
                <i className={`${insight.icon} text-lg`}></i>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                  <span className={`text-xs px-2 py-1 rounded-full ${getImpactColor(insight.impact)}`}>
                    {insight.impact}
                  </span>
                </div>
                <p className="text-gray-600 mb-3">{insight.description}</p>
                <div className="flex items-center space-x-2">
                  <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap">
                    Take Action
                  </button>
                  <button className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors cursor-pointer whitespace-nowrap">
                    Learn More
                  </button>
                  <button className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors cursor-pointer whitespace-nowrap">
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <i className="ri-lightbulb-line text-white text-lg"></i>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">AI Learning Progress</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Pattern Recognition</span>
            <span className="text-sm font-medium text-gray-900">94%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '94%' }}></div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Predictive Accuracy</span>
            <span className="text-sm font-medium text-gray-900">87%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-green-600 h-2 rounded-full" style={{ width: '87%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}