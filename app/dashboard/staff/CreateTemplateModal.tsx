'use client';

import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

interface CreateTemplateModalProps {
  onClose: () => void;
  onCreated: () => void;
}

const POSITIONS = ['Security Guard', 'Security Officer', 'Senior Security Officer', 'Security Supervisor', 'Security Manager'];
const DEPARTMENTS = ['Security', 'Management', 'Operations', 'Administration'];
const SHIFT_OPTIONS = ['Day Shift', 'Night Shift', 'Rotating Shift', 'Flexible'];
const CONTRACT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Temporary'];

const INITIAL_FORM = {
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
  contractType: 'Full-time',
};

export default function CreateTemplateModal({ onClose, onCreated }: CreateTemplateModalProps) {
  const { companyId } = useAuth();
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [photoPreview, setPhotoPreview] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [departmentOpen, setDepartmentOpen] = useState(false);
  const [positionOpen, setPositionOpen] = useState(false);
  const [shiftOpen, setShiftOpen] = useState(false);
  const [contractOpen, setContractOpen] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const uploadPhoto = async (): Promise<string | null> => {
    if (!photoFile || !companyId) return null;
    const ext = photoFile.name.split('.').pop() || 'jpg';
    const path = `templates/${companyId}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const { error: upErr } = await supabase.storage.from('guard-photos').upload(path, photoFile, { cacheControl: '3600' });
    if (upErr) throw upErr;
    const { data: urlData } = supabase.storage.from('guard-photos').getPublicUrl(path);
    return urlData.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) { setError('No company context.'); return; }
    setSaving(true);
    setError(null);

    try {
      let photoUrl: string | null = null;
      if (photoFile) {
        photoUrl = await uploadPhoto();
      }

      const payload = {
        company_id: companyId,
        template_name: formData.templateName,
        template_description: formData.templateDescription || null,
        position: formData.position,
        salary: formData.salary ? parseFloat(formData.salary) : null,
        certifications: formData.certifications || null,
        medical_conditions: formData.medicalConditions || null,
        default_shift: formData.shift,
        department: formData.department,
        training_required: formData.trainingRequired || null,
        uniform_required: formData.uniformRequired,
        background_check_required: formData.backgroundCheckRequired,
        sia_license_required: formData.siaLicenseRequired,
        minimum_experience: formData.minimumExperience ? parseInt(formData.minimumExperience) : 0,
        skills_required: formData.skillsRequired || null,
        responsibilities: formData.responsibilities || null,
        work_location: formData.workLocation || null,
        benefits: formData.benefits || null,
        contract_type: formData.contractType,
        photo_url: photoUrl,
        status: 'Active',
      };

      const { error: insertErr } = await supabase.from('guard_templates').insert(payload);
      if (insertErr) throw insertErr;

      onCreated();
    } catch (err: any) {
      setError(err.message || 'Failed to create template.');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-lg z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Create Staff Template</h2>
            <button onClick={onClose} disabled={saving} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded transition-colors cursor-pointer">
              <i className="ri-close-line text-gray-500 text-xl"></i>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center justify-between">
              <span>{error}</span>
              <button type="button" onClick={() => setError(null)} className="w-6 h-6 flex items-center justify-center cursor-pointer">
                <i className="ri-close-line text-red-500"></i>
              </button>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Template Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Template Name *</label>
                <input type="text" name="templateName" value={formData.templateName} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="e.g., Senior Security Officer Template" required />
              </div>
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <button type="button" onClick={() => setDepartmentOpen(!departmentOpen)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8">
                  {formData.department}
                  <i className="ri-arrow-down-s-line text-gray-400"></i>
                </button>
                {departmentOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-20">
                    {DEPARTMENTS.map(d => (
                      <button key={d} type="button" onClick={() => { setFormData(prev => ({ ...prev, department: d })); setDepartmentOpen(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer">{d}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Template Description</label>
              <textarea name="templateDescription" value={formData.templateDescription} onChange={handleInputChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm" placeholder="Describe this template and when to use it" />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Template Photo</h3>
            <div className="flex items-center space-x-6">
              <div className="relative">
                {photoPreview ? (
                  <img src={photoPreview} alt="Template" className="w-24 h-24 rounded-full object-cover object-top border-4 border-blue-500" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-300">
                    <i className="ri-user-line text-gray-500 text-3xl"></i>
                  </div>
                )}
                <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors cursor-pointer">
                  <i className="ri-camera-line text-white text-sm"></i>
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </div>
              <div>
                <h4 className="text-md font-medium text-gray-900">Default Profile Photo</h4>
                <p className="text-sm text-gray-500">{photoFile ? photoFile.name : 'Optional: Upload a default photo for this template'}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Position Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Position *</label>
                <button type="button" onClick={() => setPositionOpen(!positionOpen)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8">
                  {formData.position}
                  <i className="ri-arrow-down-s-line text-gray-400"></i>
                </button>
                {positionOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-20">
                    {POSITIONS.map(p => (
                      <button key={p} type="button" onClick={() => { setFormData(prev => ({ ...prev, position: p })); setPositionOpen(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer">{p}</button>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Default Salary (Annual)</label>
                <input type="number" name="salary" value={formData.salary} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="30000" />
              </div>
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Default Shift</label>
                <button type="button" onClick={() => setShiftOpen(!shiftOpen)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8">
                  {formData.shift}
                  <i className="ri-arrow-down-s-line text-gray-400"></i>
                </button>
                {shiftOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-20">
                    {SHIFT_OPTIONS.map(s => (
                      <button key={s} type="button" onClick={() => { setFormData(prev => ({ ...prev, shift: s })); setShiftOpen(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer">{s}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Requirements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Experience (Years)</label>
                <input type="number" name="minimumExperience" value={formData.minimumExperience} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" min="0" />
              </div>
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Contract Type</label>
                <button type="button" onClick={() => setContractOpen(!contractOpen)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8">
                  {formData.contractType}
                  <i className="ri-arrow-down-s-line text-gray-400"></i>
                </button>
                {contractOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-20">
                    {CONTRACT_TYPES.map(c => (
                      <button key={c} type="button" onClick={() => { setFormData(prev => ({ ...prev, contractType: c })); setContractOpen(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer">{c}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="mt-4 space-y-3">
              <label className="flex items-center cursor-pointer">
                <input type="checkbox" name="siaLicenseRequired" checked={formData.siaLicenseRequired} onChange={handleInputChange} className="mr-3" />
                <span className="text-sm text-gray-700">SIA License Required</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input type="checkbox" name="backgroundCheckRequired" checked={formData.backgroundCheckRequired} onChange={handleInputChange} className="mr-3" />
                <span className="text-sm text-gray-700">Background Check Required</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input type="checkbox" name="uniformRequired" checked={formData.uniformRequired} onChange={handleInputChange} className="mr-3" />
                <span className="text-sm text-gray-700">Uniform Required</span>
              </label>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills & Certifications</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Required Certifications</label>
                <textarea name="certifications" value={formData.certifications} onChange={handleInputChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm" placeholder="e.g., First Aid, Fire Safety, CCTV Operation" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Required Skills</label>
                <textarea name="skillsRequired" value={formData.skillsRequired} onChange={handleInputChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm" placeholder="e.g., Excellent communication, Physical fitness, Attention to detail" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Training Required</label>
                <textarea name="trainingRequired" value={formData.trainingRequired} onChange={handleInputChange} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm" placeholder="e.g., Company security procedures, Emergency response protocols" />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Work Location</label>
                <input type="text" name="workLocation" value={formData.workLocation} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="e.g., Various client sites, Office building" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Key Responsibilities</label>
                <textarea name="responsibilities" value={formData.responsibilities} onChange={handleInputChange} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm" placeholder="e.g., Monitor CCTV systems, Conduct regular patrols, Check visitor credentials" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Benefits Package</label>
                <textarea name="benefits" value={formData.benefits} onChange={handleInputChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm" placeholder="e.g., Health insurance, Pension scheme, Paid holidays" />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical Requirements</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Medical Fitness Requirements</label>
              <textarea name="medicalConditions" value={formData.medicalConditions} onChange={handleInputChange} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm" placeholder="e.g., Must be physically fit, No serious medical conditions that affect work" />
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button type="button" onClick={onClose} disabled={saving} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2">
              {saving && <i className="ri-loader-4-line animate-spin"></i>}
              <span>{saving ? 'Creating...' : 'Create Template'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}