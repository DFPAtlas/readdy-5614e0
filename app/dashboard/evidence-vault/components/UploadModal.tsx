'use client';

import { useState } from 'react';
import GlassCard from '@/app/components/GlassCard';

interface Props {
  sites: { id: string; site_name: string }[];
  clients: { id: string; name: string }[];
  onUpload: (file: File, metadata: any) => Promise<{ error?: any }>;
  onClose: () => void;
}

export default function UploadModal({ sites, clients, onUpload, onClose }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState('image');
  const [siteId, setSiteId] = useState('');
  const [clientId, setClientId] = useState('');
  const [linkedIncident, setLinkedIncident] = useState(false);
  const [linkedPatrol, setLinkedPatrol] = useState(false);
  const [linkedOB, setLinkedOB] = useState(false);
  const [linkedReport, setLinkedReport] = useState(false);
  const [linkedMaintenance, setLinkedMaintenance] = useState(false);
  const [linkedWelfare, setLinkedWelfare] = useState(false);
  const [gpsLat, setGpsLat] = useState('');
  const [gpsLng, setGpsLng] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    const { error } = await onUpload(file, {
      file_type: fileType,
      site_id: siteId || undefined,
      client_id: clientId || undefined,
      linked_to_incident: linkedIncident,
      linked_to_patrol: linkedPatrol,
      linked_to_ob: linkedOB,
      linked_to_report: linkedReport,
      linked_to_maintenance: linkedMaintenance,
      linked_to_welfare: linkedWelfare,
      gps_latitude: gpsLat ? parseFloat(gpsLat) : undefined,
      gps_longitude: gpsLng ? parseFloat(gpsLng) : undefined,
    });
    setUploading(false);
    if (error) setError(error.message || 'Upload failed');
    else onClose();
  };

  const getAcceptTypes = () => {
    switch (fileType) {
      case 'image': return 'image/*';
      case 'video': return 'video/*';
      case 'audio': return 'audio/*';
      case 'pdf': return 'application/pdf';
      default: return '*';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <GlassCard className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Upload Evidence</h2>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white cursor-pointer">
              <i className="ri-close-line text-lg"></i>
            </button>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">File Type</label>
              <div className="flex gap-2">
                {['image', 'video', 'pdf', 'audio', 'document'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setFileType(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                      fileType === t
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800/60 text-gray-400 hover:text-white'
                    }`}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Select File</label>
              <div className="relative">
                <input
                  type="file"
                  accept={getAcceptTypes()}
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="bg-gray-800/60 border border-gray-700 border-dashed rounded-lg p-6 text-center hover:border-gray-500 transition-colors">
                  <div className="w-8 h-8 flex items-center justify-center mx-auto mb-2">
                    <i className="ri-upload-cloud-2-line text-gray-400 text-xl"></i>
                  </div>
                  <p className="text-sm text-gray-400">
                    {file ? file.name : 'Click to browse or drag file here'}
                  </p>
                  {file && (
                    <p className="text-xs text-gray-500 mt-1">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Site</label>
                <select
                  value={siteId}
                  onChange={(e) => setSiteId(e.target.value)}
                  className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">No site</option>
                  {sites.map((s) => (
                    <option key={s.id} value={s.id}>{s.site_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Client</label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">No client</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Link To</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Incident', value: linkedIncident, set: setLinkedIncident },
                  { label: 'Patrol', value: linkedPatrol, set: setLinkedPatrol },
                  { label: 'OB Entry', value: linkedOB, set: setLinkedOB },
                  { label: 'Report', value: linkedReport, set: setLinkedReport },
                  { label: 'Maintenance', value: linkedMaintenance, set: setLinkedMaintenance },
                  { label: 'Welfare', value: linkedWelfare, set: setLinkedWelfare },
                ].map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => opt.set(!opt.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                      opt.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800/60 text-gray-400 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">GPS Latitude</label>
                <input
                  type="text"
                  value={gpsLat}
                  onChange={(e) => setGpsLat(e.target.value)}
                  placeholder="51.5074"
                  className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">GPS Longitude</label>
                <input
                  type="text"
                  value={gpsLng}
                  onChange={(e) => setGpsLng(e.target.value)}
                  placeholder="-0.1278"
                  className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={!file || uploading}
              className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-400 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
            >
              {uploading ? (
                <span className="flex items-center justify-center gap-2">
                  <i className="ri-loader-4-line animate-spin"></i> Uploading...
                </span>
              ) : (
                'Upload Evidence'
              )}
            </button>
            <button
              onClick={onClose}
              className="bg-gray-800/60 hover:bg-gray-700/60 text-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
            >
              Cancel
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}