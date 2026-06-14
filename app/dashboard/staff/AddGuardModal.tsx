'use client';

import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

interface AddGuardModalProps {
  onClose: () => void;
  onSubmit: (guardData: any) => void;
  existingGuard?: any;
  isEdit?: boolean;
}

const POSITIONS = ['Security Guard', 'Security Officer', 'Senior Security Officer', 'Security Supervisor'];

function mapDbToForm(db: any) {
  if (!db) return {};
  return {
    firstName: db.first_name || '',
    lastName: db.last_name || '',
    email: db.email || '',
    phone: db.phone || '',
    address: db.address || '',
    postcode: db.postcode || '',
    emergencyName: db.emergency_contact_name || '',
    emergencyPhone: db.emergency_contact_phone || '',
    emergencyRelation: db.emergency_contact_relation || '',
    position: db.position || 'Security Guard',
    hireDate: db.hire_date || '',
    salary: db.salary ? String(db.salary) : '',
    badgeNumber: db.badge_number || '',
    siaLicense: db.sia_licence || '',
    siaExpiry: db.sia_expiry || '',
    certifications: db.certifications || '',
    medicalConditions: db.medical_conditions || '',
    reference1Name: db.reference_1_name || '',
    reference1Phone: db.reference_1_phone || '',
    reference2Name: db.reference_2_name || '',
    reference2Phone: db.reference_2_phone || '',
    bankAccount: db.bank_account || '',
    sortCode: db.sort_code || '',
    niNumber: db.ni_number || '',
    hourlyRate: db.hourly_rate ? String(db.hourly_rate) : '',
    skills: db.skills || [],
    status: db.status || 'active',
  };
}

const INITIAL_FORM = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  postcode: '',
  emergencyName: '',
  emergencyPhone: '',
  emergencyRelation: '',
  position: 'Security Guard',
  hireDate: '',
  salary: '',
  badgeNumber: '',
  siaLicense: '',
  siaExpiry: '',
  certifications: '',
  medicalConditions: '',
  reference1Name: '',
  reference1Phone: '',
  reference2Name: '',
  reference2Phone: '',
  bankAccount: '',
  sortCode: '',
  niNumber: '',
  hourlyRate: '',
};

export default function AddGuardModal({ onClose, onSubmit, existingGuard, isEdit = false }: AddGuardModalProps) {
  const { companyId } = useAuth();
  const [formData, setFormData] = useState(existingGuard ? mapDbToForm(existingGuard) : INITIAL_FORM);
  const [photoPreview, setPhotoPreview] = useState(existingGuard?.photo_url || '');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
    if (!photoFile || !companyId) return existingGuard?.photo_url || null;
    const ext = photoFile.name.split('.').pop() || 'jpg';
    const path = `guards/${companyId}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const { error: upErr } = await supabase.storage.from('guard-photos').upload(path, photoFile, { cacheControl: '3600' });
    if (upErr) throw upErr;
    const { data: urlData } = supabase.storage.from('guard-photos').getPublicUrl(path);
    return urlData.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    if (!companyId) {
      setError('No company context. Please try again.');
      setSaving(false);
      return;
    }

    try {
      let photoUrl: string | null = existingGuard?.photo_url || null;
      if (photoFile) {
        photoUrl = await uploadPhoto();
      }

      const name = `${formData.firstName} ${formData.lastName}`.trim();
      const payload = {
        company_id: companyId,
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email || null,
        phone: formData.phone || null,
        address: formData.address || null,
        postcode: formData.postcode || null,
        emergency_contact_name: formData.emergencyName || null,
        emergency_contact_phone: formData.emergencyPhone || null,
        emergency_contact_relation: formData.emergencyRelation || null,
        position: formData.position || 'Security Guard',
        hire_date: formData.hireDate || null,
        salary: formData.salary ? parseFloat(formData.salary) : null,
        badge_number: formData.badgeNumber || null,
        sia_licence: formData.siaLicense || null,
        sia_expiry: formData.siaExpiry || null,
        certifications: formData.certifications || null,
        medical_conditions: formData.medicalConditions || null,
        reference_1_name: formData.reference1Name || null,
        reference_1_phone: formData.reference1Phone || null,
        reference_2_name: formData.reference2Name || null,
        reference_2_phone: formData.reference2Phone || null,
        bank_account: formData.bankAccount || null,
        sort_code: formData.sortCode || null,
        ni_number: formData.niNumber || null,
        hourly_rate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : null,
        photo_url: photoUrl,
        status: 'active',
      };

      if (isEdit && existingGuard?.id) {
        const { error: updateErr } = await supabase
          .from('guards')
          .update(payload)
          .eq('id', existingGuard.id);

        if (updateErr) throw updateErr;
      } else {
        const { error: insertErr } = await supabase
          .from('guards')
          .insert(payload);

        if (insertErr) throw insertErr;
      }

      onSubmit({ name, ...payload });
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-lg z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {isEdit ? 'Edit Guard' : 'Add New Guard'}
            </h2>
            <button
              onClick={onClose}
              disabled={saving}
              className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded transition-colors cursor-pointer"
            >
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

          {/* Photo Upload */}
          <div className="flex items-center space-x-6">
            <div className="relative">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Guard"
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
              <h3 className="text-lg font-semibold text-gray-900">Profile Photo</h3>
              <p className="text-sm text-gray-500">Upload a professional photo for the guard&apos;s profile</p>
            </div>
          </div>

          {/* Personal Information */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Postcode</label>
                <input
                  type="text"
                  name="postcode"
                  value={formData.postcode}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                <input
                  type="text"
                  name="emergencyName"
                  value={formData.emergencyName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  name="emergencyPhone"
                  value={formData.emergencyPhone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                <input
                  type="text"
                  name="emergencyRelation"
                  value={formData.emergencyRelation}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Employment Information */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Employment Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Position *</label>
                <select
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm pr-8"
                  required
                >
                  {POSITIONS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hire Date *</label>
                <input
                  type="date"
                  name="hireDate"
                  value={formData.hireDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Annual Salary</label>
                <input
                  type="number"
                  name="salary"
                  value={formData.salary}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="30000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate</label>
                <input
                  type="number"
                  name="hourlyRate"
                  value={formData.hourlyRate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="15.00"
                  step="0.50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Badge Number</label>
                <input
                  type="text"
                  name="badgeNumber"
                  value={formData.badgeNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Certifications */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Certifications & Licenses</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SIA License Number</label>
                <input
                  type="text"
                  name="siaLicense"
                  value={formData.siaLicense}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SIA Expiry Date</label>
                <input
                  type="date"
                  name="siaExpiry"
                  value={formData.siaExpiry}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Certifications</label>
                <textarea
                  name="certifications"
                  value={formData.certifications}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                  placeholder="First Aid, Fire Safety, etc."
                />
              </div>
            </div>
          </div>

          {/* Medical & References */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical & References</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Medical Conditions</label>
                <textarea
                  name="medicalConditions"
                  value={formData.medicalConditions}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                  placeholder="Any medical conditions or allergies"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reference 1 Name</label>
                  <input
                    type="text"
                    name="reference1Name"
                    value={formData.reference1Name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reference 1 Phone</label>
                  <input
                    type="tel"
                    name="reference1Phone"
                    value={formData.reference1Phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reference 2 Name</label>
                  <input
                    type="text"
                    name="reference2Name"
                    value={formData.reference2Name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reference 2 Phone</label>
                  <input
                    type="tel"
                    name="reference2Phone"
                    value={formData.reference2Phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Banking Details */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Banking Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Account Number</label>
                <input
                  type="text"
                  name="bankAccount"
                  value={formData.bankAccount}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort Code</label>
                <input
                  type="text"
                  name="sortCode"
                  value={formData.sortCode}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">National Insurance Number</label>
                <input
                  type="text"
                  name="niNumber"
                  value={formData.niNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {saving && <i className="ri-loader-4-line animate-spin"></i>}
              <span>{saving ? (isEdit ? 'Updating...' : 'Adding...') : (isEdit ? 'Update Guard' : 'Add Guard')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}