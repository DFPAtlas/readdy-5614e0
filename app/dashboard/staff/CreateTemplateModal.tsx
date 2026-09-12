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

const inputClass = 'w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500';
const labelClass = 'block text-sm font-medium text-gray-300 mb-1.5';

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

  function DropdownButton({ open, onToggle, value }: { open: boolean; onToggle: () => void; value: string }) {
    return (
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-3 py-2 border border-gray-700 bg-gray-800/60 rounded-lg text-sm text-left flex items-center justify-between focus:outline-none focus:border-blue-500 pr-8 cursor-pointer"
      >
        {value}
        <div className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-down-s-line text-gray-400"></i></div>
      </button>
    );
  }

  function DropdownMenu({ options, onSelect }: { options: string[]; onSelect: (v: string) => void }) {
    return (
      <div className="absolute top-full left-0 right-0 mt-1 bg-[#1f2937] border border-gray-700 rounded-lg shadow-lg z-20 overflow-hidden">
        {options.map(o => (
          <button key={o} type="button" onClick={() => onSelect(o)} className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-800/60 hover:text-white transition-colors cursor-pointer">{o}</button>
        ))}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#111827] border border-gray-800 rounded-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#111827] border-b border-gray-800 px-6 py-4 rounded-t-xl z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Create Staff Template</h2>
            <button onClick={onClose} disabled={saving} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors cursor-pointer">
              <div className="w-4 h-4 flex items-center justify-center"><i className="ri-close-line"></i></div>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center justify-between">
              <span>{error}</span>
              <button type="button" onClick={() => setError(null)} className="w-6 h-6 flex items-center justify-center cursor-pointer">
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-close-line text-red-400"></i></div>
              </button>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Template Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Template Name *</label>
                <input type="text" name="templateName" value={formData.templateName} onChange={handleInputChange} className={inputClass} placeholder="e.g., Senior Security Officer Template" required />
              </div>
              <div className="relative">
                <label className={labelClass}>Department</label>
                <DropdownButton open={departmentOpen} onToggle={() => setDepartmentOpen(!departmentOpen)} value={formData.department} />
                {departmentOpen && <DropdownMenu options={DEPARTMENTS} onSelect={(d) => { setFormData(prev => ({ ...prev, department: d })); setDepartmentOpen(false); }} />}
              </div>
            </div>
            <div>
              <label className={labelClass}>Template Description</label>
              <textarea name="templateDescription" value={formData.templateDescription} onChange={handleInputChange} rows={3} className={`${inputClass} resize-none`} placeholder="Describe this template and when to use it" />
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6">
            <h3 className="text-lg font-semibold text-white mb-4">Template Photo</h3>
            <div className="flex items-center space-x-6">
              <div className="relative">
                {photoPreview ? (
                  <img src={photoPreview} alt="Template" className="w-24 h-24 rounded-full object-cover object-top border-4 border-blue-500" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center border-4 border-gray-700">
                    <div className="w-10 h-10 flex items-center justify-center"><i className="ri-user-line text-gray-500 text-3xl"></i></div>
                  </div>
                )}
                <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors cursor-pointer">
                  <div className="w-4 h-4 flex items-center justify-center"><i className="ri-camera-line text-white text-sm"></i></div>
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </div>
              <div>
                <h4 className="text-md font-medium text-white">Default Profile Photo</h4>
                <p className="text-sm text-gray-500">{photoFile ? photoFile.name : 'Optional: Upload a default photo for this template'}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6">
            <h3 className="text-lg font-semibold text-white mb-4">Position Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <label className={labelClass}>Position *</label>
                <DropdownButton open={positionOpen} onToggle={() => setPositionOpen(!positionOpen)} value={formData.position} />
                {positionOpen && <DropdownMenu options={POSITIONS} onSelect={(p) => { setFormData(prev => ({ ...prev, position: p })); setPositionOpen(false); }} />}
              </div>
              <div>
                <label className={labelClass}>Default Salary (Annual)</label>
                <input type="number" name="salary" value={formData.salary} onChange={handleInputChange} className={inputClass} placeholder="30000" />
              </div>
              <div className="relative">
                <label className={labelClass}>Default Shift</label>
                <DropdownButton open={shiftOpen} onToggle={() => setShiftOpen(!shiftOpen)} value={formData.shift} />
                {shiftOpen && <DropdownMenu options={SHIFT_OPTIONS} onSelect={(s) => { setFormData(prev => ({ ...prev, shift: s })); setShiftOpen(false); }} />}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6">
            <h3 className="text-lg font-semibold text-white mb-4">Requirements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Minimum Experience (Years)</label>
                <input type="number" name="minimumExperience" value={formData.minimumExperience} onChange={handleInputChange} className={inputClass} min="0" />
              </div>
              <div className="relative">
                <label className={labelClass}>Contract Type</label>
                <DropdownButton open={contractOpen} onToggle={() => setContractOpen(!contractOpen)} value={formData.contractType} />
                {contractOpen && <DropdownMenu options={CONTRACT_TYPES} onSelect={(c) => { setFormData(prev => ({ ...prev, contractType: c })); setContractOpen(false); }} />}
              </div>
            </div>
            <div className="mt-4 space-y-3">
              <label className="flex items-center cursor-pointer">
                <input type="checkbox" name="siaLicenseRequired" checked={formData.siaLicenseRequired} onChange={handleInputChange} className="mr-3 accent-blue-500" />
                <span className="text-sm text-gray-300">SIA License Required</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input type="checkbox" name="backgroundCheckRequired" checked={formData.backgroundCheckRequired} onChange={handleInputChange} className="mr-3 accent-blue-500" />
                <span className="text-sm text-gray-300">Background Check Required</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input type="checkbox" name="uniformRequired" checked={formData.uniformRequired} onChange={handleInputChange} className="mr-3 accent-blue-500" />
                <span className="text-sm text-gray-300">Uniform Required</span>
              </label>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6">
            <h3 className="text-lg font-semibold text-white mb-4">Skills & Certifications</h3>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Required Certifications</label>
                <textarea name="certifications" value={formData.certifications} onChange={handleInputChange} rows={3} className={`${inputClass} resize-none`} placeholder="e.g., First Aid, Fire Safety, CCTV Operation" />
              </div>
              <div>
                <label className={labelClass}>Required Skills</label>
                <textarea name="skillsRequired" value={formData.skillsRequired} onChange={handleInputChange} rows={3} className={`${inputClass} resize-none`} placeholder="e.g., Excellent communication, Physical fitness, Attention to detail" />
              </div>
              <div>
                <label className={labelClass}>Training Required</label>
                <textarea name="trainingRequired" value={formData.trainingRequired} onChange={handleInputChange} rows={2} className={`${inputClass} resize-none`} placeholder="e.g., Company security procedures, Emergency response protocols" />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6">
            <h3 className="text-lg font-semibold text-white mb-4">Job Details</h3>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Work Location</label>
                <input type="text" name="workLocation" value={formData.workLocation} onChange={handleInputChange} className={inputClass} placeholder="e.g., Various client sites, Office building" />
              </div>
              <div>
                <label className={labelClass}>Key Responsibilities</label>
                <textarea name="responsibilities" value={formData.responsibilities} onChange={handleInputChange} rows={4} className={`${inputClass} resize-none`} placeholder="e.g., Monitor CCTV systems, Conduct regular patrols, Check visitor credentials" />
              </div>
              <div>
                <label className={labelClass}>Benefits Package</label>
                <textarea name="benefits" value={formData.benefits} onChange={handleInputChange} rows={3} className={`${inputClass} resize-none`} placeholder="e.g., Health insurance, Pension scheme, Paid holidays" />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6">
            <h3 className="text-lg font-semibold text-white mb-4">Medical Requirements</h3>
            <div>
              <label className={labelClass}>Medical Fitness Requirements</label>
              <textarea name="medicalConditions" value={formData.medicalConditions} onChange={handleInputChange} rows={2} className={`${inputClass} resize-none`} placeholder="e.g., Must be physically fit, No serious medical conditions that affect work" />
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-800">
            <button type="button" onClick={onClose} disabled={saving} className="px-6 py-2 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2">
              {saving && <i className="ri-loader-4-line animate-spin"></i>}
              <span>{saving ? 'Creating...' : 'Create Template'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}