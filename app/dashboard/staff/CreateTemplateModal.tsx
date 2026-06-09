'use client';

import { useState, useRef } from 'react';

interface CreateTemplateModalProps {
  onClose: () => void;
  onSubmit: (templateData: any) => void;
}

export default function CreateTemplateModal({ onClose, onSubmit }: CreateTemplateModalProps) {
  const [formData, setFormData] = useState({
    templateName: '',
    templateDescription: '',
    position: 'Security Guard',
    salary: '',
    certifications: '',
    medicalConditions: '',
    shift: 'Day Shift',
    department: 'Security',
    trainingRequired: '',
    uniformRequired: true,
    backgroundCheckRequired: true,
    siaLicenseRequired: true,
    minimumExperience: '0',
    skillsRequired: '',
    responsibilities: '',
    workLocation: '',
    benefits: '',
    contractType: 'Full-time'
  });

  const [photoPreview, setPhotoPreview] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const templateData = {
      ...formData,
      id: Date.now(),
      photo: photoPreview || 'https://readdy.ai/api/search-image?query=professional%20security%20guard%20template%20placeholder%20uniform%20badge%20security%20officer%20clean%20background&width=80&height=80&seq=template1&orientation=squarish',
      createdAt: new Date().toISOString(),
      status: 'Active'
    };

    onSubmit(templateData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Create Staff Template</h2>
            <button 
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded transition-colors cursor-pointer"
            >
              <i className="ri-close-line text-gray-500 text-xl"></i>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Template Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Template Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Template Name *</label>
                <input
                  type="text"
                  name="templateName"
                  value={formData.templateName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Senior Security Officer Template"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                >
                  <option value="Security">Security</option>
                  <option value="Management">Management</option>
                  <option value="Operations">Operations</option>
                  <option value="Administration">Administration</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Template Description</label>
              <textarea
                name="templateDescription"
                value={formData.templateDescription}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Describe what this template is for and when to use it"
              />
            </div>
          </div>

          {/* Photo Template */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Template Photo</h3>
            <div className="flex items-center space-x-6">
              <div className="relative">
                {photoPreview ? (
                  <img 
                    src={photoPreview} 
                    alt="Template photo"
                    className="w-24 h-24 rounded-full object-cover object-top border-4 border-blue-500"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-300">
                    <i className="ri-user-line text-gray-500 text-3xl"></i>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  <i className="ri-camera-line text-white text-sm"></i>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>
              <div>
                <h4 className="text-md font-medium text-gray-900">Default Profile Photo</h4>
                <p className="text-sm text-gray-500">Optional: Upload a default photo for this template</p>
              </div>
            </div>
          </div>

          {/* Position & Employment */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Position Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Position *</label>
                <select
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                  required
                >
                  <option value="Security Guard">Security Guard</option>
                  <option value="Security Officer">Security Officer</option>
                  <option value="Senior Security Officer">Senior Security Officer</option>
                  <option value="Security Supervisor">Security Supervisor</option>
                  <option value="Security Manager">Security Manager</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Default Salary (Annual)</label>
                <input
                  type="number"
                  name="salary"
                  value={formData.salary}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="30000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Default Shift</label>
                <select
                  name="shift"
                  value={formData.shift}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                >
                  <option value="Day Shift">Day Shift</option>
                  <option value="Night Shift">Night Shift</option>
                  <option value="Rotating Shift">Rotating Shift</option>
                  <option value="Flexible">Flexible</option>
                </select>
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Requirements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Experience (Years)</label>
                <input
                  type="number"
                  name="minimumExperience"
                  value={formData.minimumExperience}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contract Type</label>
                <select
                  name="contractType"
                  value={formData.contractType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Temporary">Temporary</option>
                </select>
              </div>
            </div>
            
            <div className="mt-4 space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="siaLicenseRequired"
                  checked={formData.siaLicenseRequired}
                  onChange={handleInputChange}
                  className="mr-3"
                />
                <span className="text-sm text-gray-700">SIA License Required</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="backgroundCheckRequired"
                  checked={formData.backgroundCheckRequired}
                  onChange={handleInputChange}
                  className="mr-3"
                />
                <span className="text-sm text-gray-700">Background Check Required</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="uniformRequired"
                  checked={formData.uniformRequired}
                  onChange={handleInputChange}
                  className="mr-3"
                />
                <span className="text-sm text-gray-700">Uniform Required</span>
              </label>
            </div>
          </div>

          {/* Skills & Certifications */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills & Certifications</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Required Certifications</label>
                <textarea
                  name="certifications"
                  value={formData.certifications}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="e.g., First Aid, Fire Safety, CCTV Operation, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Required Skills</label>
                <textarea
                  name="skillsRequired"
                  value={formData.skillsRequired}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="e.g., Excellent communication, Physical fitness, Attention to detail, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Training Required</label>
                <textarea
                  name="trainingRequired"
                  value={formData.trainingRequired}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="e.g., Company security procedures, Emergency response protocols, etc."
                />
              </div>
            </div>
          </div>

          {/* Job Details */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Work Location</label>
                <input
                  type="text"
                  name="workLocation"
                  value={formData.workLocation}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Various client sites, Office building, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Key Responsibilities</label>
                <textarea
                  name="responsibilities"
                  value={formData.responsibilities}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="e.g., Monitor CCTV systems, Conduct regular patrols, Check visitor credentials, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Benefits Package</label>
                <textarea
                  name="benefits"
                  value={formData.benefits}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="e.g., Health insurance, Pension scheme, Paid holidays, etc."
                />
              </div>
            </div>
          </div>

          {/* Medical */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical Requirements</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Medical Fitness Requirements</label>
              <textarea
                name="medicalConditions"
                value={formData.medicalConditions}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="e.g., Must be physically fit, No serious medical conditions that affect work performance"
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
            >
              Create Template
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}