'use client';

import { useState, useEffect } from 'react';

export interface CompanyFormData {
  name: string;
  contact_person: string;
  phone: string;
  email: string;
  address: string;
  logo_url?: string;
}

interface CompanyProfileStepProps {
  data: CompanyFormData;
  onChange: (data: CompanyFormData) => void;
  companyName?: string | null;
  companyEmail?: string | null;
  companyPhone?: string | null;
  companyAddress?: string | null;
}

const inputBase =
  'w-full bg-white/5 border rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors';
const inputNormal = 'border-white/10';

export default function CompanyProfileStep({ data, onChange, companyName, companyEmail, companyPhone, companyAddress }: CompanyProfileStepProps) {
  const [logoPreview, setLogoPreview] = useState<string | null>(data.logo_url || null);

  useEffect(() => {
    if (companyName && !data.name) {
      onChange({ ...data, name: companyName });
    }
    if (companyEmail && !data.email) {
      onChange({ ...data, email: companyEmail });
    }
    if (companyPhone && !data.phone) {
      onChange({ ...data, phone: companyPhone });
    }
    if (companyAddress && !data.address) {
      onChange({ ...data, address: companyAddress });
    }
  }, [companyName, companyEmail, companyPhone, companyAddress]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setLogoPreview(url);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
        <div className="w-16 h-16 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
          {logoPreview ? (
            <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
          ) : (
            <i className="ri-building-2-line text-gray-500 text-xl" />
          )}
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-300 mb-1">Company Logo</label>
          <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600/20 border border-blue-500/30 rounded-lg text-sm text-blue-400 cursor-pointer hover:bg-blue-600/30 transition-colors">
            <i className="ri-upload-2-line" />
            Upload Logo
            <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
          </label>
          <p className="text-xs text-gray-500 mt-1">Optional. PNG, JPG, or SVG. Max 2MB.</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          Company Name <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={data.name}
          onChange={(e) => onChange({ ...data, name: e.target.value })}
          className={`${inputBase} ${inputNormal}`}
          placeholder="e.g. Shield Security Ltd"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          Contact Person <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={data.contact_person}
          onChange={(e) => onChange({ ...data, contact_person: e.target.value })}
          className={`${inputBase} ${inputNormal}`}
          placeholder="e.g. John Smith"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Email <span className="text-red-400">*</span>
          </label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => onChange({ ...data, email: e.target.value })}
            className={`${inputBase} ${inputNormal}`}
            placeholder="ops@company.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Phone <span className="text-red-400">*</span>
          </label>
          <input
            type="tel"
            value={data.phone}
            onChange={(e) => onChange({ ...data, phone: e.target.value })}
            className={`${inputBase} ${inputNormal}`}
            placeholder="+44 7700 900000"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          Address <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={data.address}
          onChange={(e) => onChange({ ...data, address: e.target.value })}
          className={`${inputBase} ${inputNormal}`}
          placeholder="Company headquarters address"
        />
      </div>
    </div>
  );
}