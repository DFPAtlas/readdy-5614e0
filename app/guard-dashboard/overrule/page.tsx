'use client';

import { useState } from 'react';
import Link from 'next/link';
import SiteStaffList from './SiteStaffList';
import VisitorLogForm from './VisitorLogForm';
import CCTVLogForm from './CCTVLogForm';
import DailyOccurrencesForm from './DailyOccurrencesForm';
import MaintenanceRequestForm from './MaintenanceRequestForm';
import DeliveryLogForm from './DeliveryLogForm';
import ContractorSignInForm from './ContractorSignInForm';
import VehicleLogForm from './VehicleLogForm';

export default function OverruleDashboard() {
  const [activeTab, setActiveTab] = useState('staff');

  const currentTime = new Date().toLocaleString();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/guard-dashboard" 
                className="text-blue-600 hover:text-blue-800 cursor-pointer whitespace-nowrap flex items-center"
              >
                <i className="ri-arrow-left-line mr-2"></i>
                Back to Guard Dashboard
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Site Management Dashboard</h1>
                <p className="text-sm text-gray-600">Westfield Shopping Centre - Overrule Access</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                <i className="ri-time-line mr-1"></i>
                {currentTime}
              </div>
              <div className="text-sm text-gray-600">
                <i className="ri-shield-check-line mr-1"></i>
                Guard ID: G-2024-001
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('staff')}
              className={`py-4 px-1 border-b-2 font-medium text-sm cursor-pointer whitespace-nowrap ${
                activeTab === 'staff' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <i className="ri-group-line mr-2"></i>
              Site Staff
            </button>
            <button
              onClick={() => setActiveTab('visitors')}
              className={`py-4 px-1 border-b-2 font-medium text-sm cursor-pointer whitespace-nowrap ${
                activeTab === 'visitors' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <i className="ri-user-add-line mr-2"></i>
              Visitor Log
            </button>
            <button
              onClick={() => setActiveTab('cctv')}
              className={`py-4 px-1 border-b-2 font-medium text-sm cursor-pointer whitespace-nowrap ${
                activeTab === 'cctv' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <i className="ri-camera-line mr-2"></i>
              CCTV Log
            </button>
            <button
              onClick={() => setActiveTab('occurrences')}
              className={`py-4 px-1 border-b-2 font-medium text-sm cursor-pointer whitespace-nowrap ${
                activeTab === 'occurrences' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <i className="ri-file-text-line mr-2"></i>
              Daily Occurrences
            </button>
            <button
              onClick={() => setActiveTab('maintenance')}
              className={`py-4 px-1 border-b-2 font-medium text-sm cursor-pointer whitespace-nowrap ${
                activeTab === 'maintenance' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <i className="ri-tools-line mr-2"></i>
              Maintenance
            </button>
            <button
              onClick={() => setActiveTab('deliveries')}
              className={`py-4 px-1 border-b-2 font-medium text-sm cursor-pointer whitespace-nowrap ${
                activeTab === 'deliveries' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <i className="ri-truck-line mr-2"></i>
              Deliveries
            </button>
            <button
              onClick={() => setActiveTab('contractors')}
              className={`py-4 px-1 border-b-2 font-medium text-sm cursor-pointer whitespace-nowrap ${
                activeTab === 'contractors' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <i className="ri-user-settings-line mr-2"></i>
              Contractors
            </button>
            <button
              onClick={() => setActiveTab('vehicles')}
              className={`py-4 px-1 border-b-2 font-medium text-sm cursor-pointer whitespace-nowrap ${
                activeTab === 'vehicles' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <i className="ri-car-line mr-2"></i>
              Vehicle Log
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'staff' && <SiteStaffList />}
        {activeTab === 'visitors' && <VisitorLogForm />}
        {activeTab === 'cctv' && <CCTVLogForm />}
        {activeTab === 'occurrences' && <DailyOccurrencesForm />}
        {activeTab === 'maintenance' && <MaintenanceRequestForm />}
        {activeTab === 'deliveries' && <DeliveryLogForm />}
        {activeTab === 'contractors' && <ContractorSignInForm />}
        {activeTab === 'vehicles' && <VehicleLogForm />}
      </div>
    </div>
  );
}