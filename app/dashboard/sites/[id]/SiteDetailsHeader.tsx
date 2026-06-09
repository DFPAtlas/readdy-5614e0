'use client';

import Link from 'next/link';

export default function SiteDetailsHeader() {
  return (
    <header className="bg-slate-600 text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-6">
            <Link href="/dashboard" className="flex items-center hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">SM</span>
              </div>
              <span className="text-xl font-bold">Security Monitoring Dashboard</span>
            </Link>
          </div>

          <nav className="flex items-center space-x-8 text-sm">
            <Link href="/dashboard" className="text-white hover:text-blue-200 cursor-pointer">
              Dashboard
            </Link>
            <Link href="/dashboard/reports" className="text-white hover:text-blue-200 cursor-pointer">
              Reports
            </Link>
            <Link href="/dashboard/settings" className="text-white hover:text-blue-200 cursor-pointer">
              Settings
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <div className="bg-slate-500 px-3 py-1 rounded text-sm">
              System Status: Online
            </div>
            <div className="bg-blue-600 px-3 py-1 rounded text-sm">
              Notifications
            </div>
            <div className="bg-teal-600 px-3 py-1 rounded text-sm flex items-center">
              <span className="mr-1">JD</span>
              <span>John Doe</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}