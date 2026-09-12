'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';

export default function ImportExportPage() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [exportType, setExportType] = useState('reports');
  const [importType, setImportType] = useState('guards');
  const [exportStatus, setExportStatus] = useState<'idle' | 'generating' | 'ready' | 'error'>('idle');
  const [importStatus, setImportStatus] = useState<'idle' | 'validating' | 'preview' | 'processing' | 'complete' | 'error'>('idle');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const exportOptions = [
    { key: 'reports', label: 'Approved Reports' },
    { key: 'finance', label: 'Finance Data (CSV)' },
    { key: 'sites', label: 'Sites & Client Data' },
    { key: 'rota', label: 'Rota Export' },
    { key: 'attendance', label: 'Attendance Records' },
    { key: 'compliance', label: 'Compliance Summary' },
    { key: 'security_events', label: 'Security Events (SIEM)' },
  ];

  const importOptions = [
    { key: 'guards', label: 'Guards / Workers' },
    { key: 'sites', label: 'Sites' },
    { key: 'clients', label: 'Clients' },
    { key: 'rate_cards', label: 'Rate Cards' },
    { key: 'training', label: 'Training Records' },
    { key: 'shift_templates', label: 'Shift Templates' },
  ];

  const handleExport = () => {
    setExportStatus('generating');
    setTimeout(() => setExportStatus('ready'), 2000);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImportStatus('validating');
      setTimeout(() => setImportStatus('preview'), 1500);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard/integrations" className="text-xs text-gray-400 hover:text-gray-300 mb-2 inline-flex items-center gap-1 cursor-pointer">
            <div className="w-3.5 h-3.5 flex items-center justify-center"><i className="ri-arrow-left-line"></i></div>
            Integrations
          </Link>
          <h1 className="text-2xl font-bold text-white">Import & Export Centre</h1>
          <p className="text-sm text-gray-400 mt-1">Securely transfer data in and out of GuardianHub</p>
        </div>
      </div>

      <div className="flex bg-[#111827] border border-gray-800 rounded-xl p-1 w-fit">
        <button
          onClick={() => setActiveTab('export')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'export' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          <div className="w-4 h-4 flex items-center justify-center inline mr-1.5"><i className="ri-download-line"></i></div>
          Export
        </button>
        <button
          onClick={() => setActiveTab('import')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'import' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          <div className="w-4 h-4 flex items-center justify-center inline mr-1.5"><i className="ri-upload-line"></i></div>
          Import
        </button>
      </div>

      {activeTab === 'export' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-[#111827] border border-gray-800 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-white mb-3">Export Type</h3>
              <div className="space-y-1">
                {exportOptions.map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => setExportType(opt.key)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors whitespace-nowrap cursor-pointer ${
                      exportType === opt.key ? 'bg-blue-600/15 text-blue-400' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleExport}
              disabled={exportStatus === 'generating'}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg text-sm text-white transition-colors whitespace-nowrap cursor-pointer"
            >
              <div className="w-4 h-4 flex items-center justify-center">
                <i className={exportStatus === 'generating' ? 'ri-loader-4-line animate-spin' : 'ri-download-line'}></i>
              </div>
              {exportStatus === 'generating' ? 'Generating...' : 'Generate Export'}
            </button>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 min-h-[300px]">
              {exportStatus === 'idle' && (
                <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                  <div className="w-16 h-16 flex items-center justify-center bg-gray-800 rounded-full text-gray-500 mb-4">
                    <i className="ri-file-download-line text-2xl"></i>
                  </div>
                  <p className="text-sm text-gray-400">Select an export type and generate your file</p>
                  <p className="text-xs text-gray-500 mt-1">Only approved data will be included in exports</p>
                </div>
              )}
              {exportStatus === 'generating' && (
                <div className="flex flex-col items-center justify-center h-full py-12">
                  <div className="w-8 h-8 flex items-center justify-center text-blue-400 animate-spin">
                    <i className="ri-loader-4-line text-3xl"></i>
                  </div>
                  <p className="text-sm text-gray-400 mt-3">Generating export...</p>
                </div>
              )}
              {exportStatus === 'ready' && (
                <div className="py-4">
                  <div className="flex items-center gap-3 mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                    <div className="w-5 h-5 flex items-center justify-center text-emerald-400"><i className="ri-check-line"></i></div>
                    <div>
                      <p className="text-sm text-emerald-400 font-medium">Export ready</p>
                      <p className="text-xs text-emerald-400/70">{exportOptions.find(o => o.key === exportType)?.label} — 247 records</p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-[10px] text-gray-500 uppercase tracking-wider">
                          <th className="px-3 py-2">ID</th>
                          <th className="px-3 py-2">Name</th>
                          <th className="px-3 py-2">Date</th>
                          <th className="px-3 py-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800">
                        {[1,2,3,4,5].map(i => (
                          <tr key={i} className="text-xs text-gray-400">
                            <td className="px-3 py-1.5 font-mono text-gray-500">EXP-{String(i).padStart(4, '0')}</td>
                            <td className="px-3 py-1.5">Record {i}</td>
                            <td className="px-3 py-1.5 text-gray-500">{new Date().toLocaleDateString()}</td>
                            <td className="px-3 py-1.5"><span className="text-emerald-400">Approved</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <button className="mt-4 flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm text-white transition-colors whitespace-nowrap cursor-pointer">
                    <div className="w-4 h-4 flex items-center justify-center"><i className="ri-download-line"></i></div>
                    Download CSV
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'import' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-[#111827] border border-gray-800 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-white mb-3">Import Type</h3>
              <div className="space-y-1">
                {importOptions.map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => { setImportType(opt.key); setImportStatus('idle'); setSelectedFile(null); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors whitespace-nowrap cursor-pointer ${
                      importType === opt.key ? 'bg-blue-600/15 text-blue-400' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[#0b1a1f] border border-blue-500/20 rounded-xl p-4">
              <p className="text-xs text-blue-300/70">
                Imported files are uploaded to private temporary storage, validated, and previewed before processing.
                You must approve the import before records are created.
              </p>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 min-h-[300px]">
              {importStatus === 'idle' && (
                <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                  <div className="w-16 h-16 flex items-center justify-center bg-gray-800 rounded-full text-gray-500 mb-4">
                    <i className="ri-file-upload-line text-2xl"></i>
                  </div>
                  <p className="text-sm text-gray-400">Upload a CSV file to import {importOptions.find(o => o.key === importType)?.label.toLowerCase()}</p>
                  <p className="text-xs text-gray-500 mt-1 mb-4">Accepted format: CSV with headers. Max 10MB.</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-sm text-gray-300 transition-colors whitespace-nowrap cursor-pointer"
                  >
                    <div className="w-4 h-4 flex items-center justify-center"><i className="ri-folder-open-line"></i></div>
                    Select File
                  </button>
                </div>
              )}

              {importStatus === 'validating' && selectedFile && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-8 h-8 flex items-center justify-center text-blue-400 animate-spin">
                    <i className="ri-loader-4-line text-3xl"></i>
                  </div>
                  <p className="text-sm text-gray-400 mt-3">Validating {selectedFile.name}...</p>
                </div>
              )}

              {importStatus === 'preview' && selectedFile && (
                <div>
                  <div className="flex items-center gap-3 mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div className="w-5 h-5 flex items-center justify-center text-blue-400"><i className="ri-file-list-line"></i></div>
                    <div>
                      <p className="text-sm text-blue-400 font-medium">Preview: {selectedFile.name}</p>
                      <p className="text-xs text-blue-400/70">32 rows detected, 0 validation errors</p>
                    </div>
                  </div>

                  <div className="overflow-x-auto mb-4">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-[10px] text-gray-500 uppercase tracking-wider">
                          <th className="px-3 py-2">First Name</th>
                          <th className="px-3 py-2">Last Name</th>
                          <th className="px-3 py-2">Email</th>
                          <th className="px-3 py-2">SIA Number</th>
                          <th className="px-3 py-2">Role</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800">
                        {['John', 'Sarah', 'Michael', 'Emma', 'David'].map((name, i) => (
                          <tr key={i} className="text-xs text-gray-400">
                            <td className="px-3 py-1.5">{name}</td>
                            <td className="px-3 py-1.5">{['Smith', 'Jones', 'Brown', 'Wilson', 'Taylor'][i]}</td>
                            <td className="px-3 py-1.5 text-gray-500">{name.toLowerCase()}@example.com</td>
                            <td className="px-3 py-1.5 font-mono text-gray-500">SIA-{100000 + i}</td>
                            <td className="px-3 py-1.5">Security Officer</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => { setImportStatus('idle'); setSelectedFile(null); }}
                      className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 hover:text-white transition-colors whitespace-nowrap cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => setImportStatus('processing')}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm text-white transition-colors whitespace-nowrap cursor-pointer"
                    >
                      Approve & Import
                    </button>
                  </div>
                </div>
              )}

              {importStatus === 'processing' && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-8 h-8 flex items-center justify-center text-blue-400 animate-spin">
                    <i className="ri-loader-4-line text-3xl"></i>
                  </div>
                  <p className="text-sm text-gray-400 mt-3">Processing import...</p>
                  <div className="w-64 h-1.5 bg-gray-800 rounded-full mt-3 overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full animate-pulse" style={{ width: '60%' }} />
                  </div>
                </div>
              )}

              {importStatus === 'complete' && (
                <div className="py-4">
                  <div className="flex items-center gap-3 mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                    <div className="w-5 h-5 flex items-center justify-center text-emerald-400"><i className="ri-check-line"></i></div>
                    <div>
                      <p className="text-sm text-emerald-400 font-medium">Import complete</p>
                      <p className="text-xs text-emerald-400/70">32 records imported, 0 skipped, 0 errors</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setImportStatus('idle'); setSelectedFile(null); }}
                    className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 hover:text-white transition-colors whitespace-nowrap cursor-pointer"
                  >
                    New Import
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}