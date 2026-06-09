
'use client';

import { useState, useRef } from 'react';

export default function SecurityIncidentReport() {
  const [incidentType, setIncidentType] = useState('Other');
  const [location, setLocation] = useState('East Medical Center - Parking Lot 3');
  const [date, setDate] = useState('23/07/2025');
  const [time, setTime] = useState('19:45');
  const [reportedBy, setReportedBy] = useState('J. Garcia');
  const [description, setDescription] = useState('Suspicious individual in parking lot area 3. Wearing dark clothing, appeared to be testing door handles of vehicles. Currently monitoring via CCTV.');
  const [severity, setSeverity] = useState('Medium');
  const [potentialImpact, setPotentialImpact] = useState('Moderate - Partial disruption to operations');
  const [responseRequired, setResponseRequired] = useState('Security Self Response');
  const [immediateActions, setImmediateActions] = useState('Security officer dispatched to investigate. CCTV monitoring increased. Vehicle owners being contacted.');
  const [assignedTo, setAssignedTo] = useState('J. Martinez');
  const [escalatedTo, setEscalatedTo] = useState('Security Supervisor');
  const [furtherActions, setFurtherActions] = useState('Increase patrol frequency in parking areas. Review CCTV footage for previous days to identify if this is a recurring issue. Consider additional lighting in darker areas of the parking lot.');
  const [additionalNotes, setAdditionalNotes] = useState('This is the third suspicious activity report in parking Lot B this month. Recommend reviewing security measures for this area.');
  const [uploadedFiles, setUploadedFiles] = useState([
    { name: 'CCTV_Footage_Parking3_20250723_1915.mp4', type: 'video', icon: 'ri-file-text-line' },
    { name: 'Suspect_Image_Parking3_20250723.jpg', type: 'image', icon: 'ri-image-line' }
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files).map(file => ({
        name: file.name,
        type: file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'document',
        icon: file.type.startsWith('image/') ? 'ri-image-line' : 
              file.type.startsWith('video/') ? 'ri-video-line' : 'ri-file-text-line'
      }));
      setUploadedFiles([...uploadedFiles, ...newFiles]);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files) {
      const newFiles = Array.from(files).map(file => ({
        name: file.name,
        type: file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'document',
        icon: file.type.startsWith('image/') ? 'ri-image-line' : 
              file.type.startsWith('video/') ? 'ri-video-line' : 'ri-file-text-line'
      }));
      setUploadedFiles([...uploadedFiles, ...newFiles]);
    }
  };

  const [reportStatus, setReportStatus] = useState<string | null>(null);

  const handleSaveDraft = () => {
    setReportStatus('Draft saved successfully.');
    setTimeout(() => setReportStatus(null), 3000);
  };

  const handlePrintReport = () => {
    window.print();
  };

  const handleSubmitReport = () => {
    setReportStatus('Report submitted successfully.');
    setTimeout(() => setReportStatus(null), 3000);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="bg-slate-600 text-white px-6 py-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <i className="ri-shield-check-line text-white text-sm"></i>
            </div>
            <span className="text-lg font-semibold">Security Monitoring System</span>
          </div>
          <div className="flex items-center space-x-6 text-sm">
            <span>Dashboard</span>
            <span>Reports</span>
            <span>Settings</span>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Security Incident Report</h1>

        {/* Report Header Info */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">INCIDENT ID</label>
            <div className="text-sm text-gray-900 font-medium">INC-2025-0742</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">STATUS</label>
            <div className="text-sm text-blue-600 font-medium">New</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CREATED BY</label>
            <div className="text-sm text-gray-900">AI Agent</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">DATE/TIME</label>
            <div className="text-sm text-gray-900">Jul 23, 2025 - 20:15</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">PRIORITY</label>
            <div className="text-sm text-orange-600 font-medium">Medium</div>
          </div>
        </div>

        {/* Incident Details */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Incident Details</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Incident Type *</label>
              <select 
                value={incidentType}
                onChange={(e) => setIncidentType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Other">Other</option>
                <option value="Theft">Theft</option>
                <option value="Vandalism">Vandalism</option>
                <option value="Trespassing">Trespassing</option>
                <option value="Medical Emergency">Medical Emergency</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
              <input 
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-6 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
              <input 
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time *</label>
              <input 
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reported By</label>
              <input 
                type="text"
                value={reportedBy}
                onChange={(e) => setReportedBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Incident Description *</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
        </div>

        {/* Severity Assessment */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Severity Assessment</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Incident Severity</label>
            <div className="flex items-center space-x-8">
              <label className="flex items-center">
                <input 
                  type="radio" 
                  name="severity" 
                  value="Low"
                  checked={severity === 'Low'}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="mr-2"
                />
                <span className="text-sm">Low</span>
              </label>
              <label className="flex items-center">
                <input 
                  type="radio" 
                  name="severity" 
                  value="Medium"
                  checked={severity === 'Medium'}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="mr-2"
                />
                <span className="px-6 py-1 bg-orange-500 text-white rounded-full text-sm">Medium</span>
              </label>
              <label className="flex items-center">
                <input 
                  type="radio" 
                  name="severity" 
                  value="High"
                  checked={severity === 'High'}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="mr-2"
                />
                <span className="text-sm">High</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Potential Impact</label>
              <select 
                value={potentialImpact}
                onChange={(e) => setPotentialImpact(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Moderate - Partial disruption to operations">Moderate - Partial disruption to operations</option>
                <option value="Low - Minimal impact">Low - Minimal impact</option>
                <option value="High - Significant disruption">High - Significant disruption</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Response Required</label>
              <select 
                value={responseRequired}
                onChange={(e) => setResponseRequired(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Security Self Response">Security Self Response</option>
                <option value="Emergency Services">Emergency Services</option>
                <option value="Management Response">Management Response</option>
              </select>
            </div>
          </div>
        </div>

        {/* Response Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Response Actions</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Immediate Actions Taken</label>
            <textarea 
              value={immediateActions}
              onChange={(e) => setImmediateActions(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-6 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Assigned To</label>
              <input 
                type="text"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Escalated To</label>
              <input 
                type="text"
                value={escalatedTo}
                onChange={(e) => setEscalatedTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Recommended Further Actions</label>
            <textarea 
              value={furtherActions}
              onChange={(e) => setFurtherActions(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
        </div>

        {/* Evidence & Attachments */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Evidence & Attachments</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Files</label>
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <div className="mb-4">
                <i className="ri-upload-cloud-2-line text-4xl text-gray-400"></i>
              </div>
              <p className="text-gray-600 mb-2">
                Drag and drop files here or{' '}
                <span 
                  className="text-blue-600 cursor-pointer hover:text-blue-700"
                  onClick={handleBrowseClick}
                >
                  click to browse
                </span>
              </p>
              <p className="text-xs text-gray-500">Supports JPG, PNG, PDF, DOC, MP4, AVI - 10MB max</p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.mp4,.avi,.mov"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>

          <div className="space-y-2">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                <div className="flex items-center space-x-3">
                  <i className={`${file.icon} ${file.type === 'image' ? 'text-green-600' : file.type === 'video' ? 'text-purple-600' : 'text-blue-600'}`}></i>
                  <span className="text-sm text-gray-900">{file.name}</span>
                </div>
                <i 
                  className="ri-close-line text-gray-400 cursor-pointer hover:text-gray-600"
                  onClick={() => handleRemoveFile(index)}
                ></i>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Information */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
            <textarea 
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
        </div>

        {/* Action Buttons */}
        {reportStatus && (
          <div className="mb-4 px-4 py-2 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
            {reportStatus}
          </div>
        )}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button 
            onClick={handleSaveDraft}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
          >
            Save as Draft
          </button>
          <button 
            onClick={handlePrintReport}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
          >
            Print Report
          </button>
          <button 
            onClick={handleSubmitReport}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
          >
            Submit Report
          </button>
        </div>
      </div>
    </div>
  );
}
