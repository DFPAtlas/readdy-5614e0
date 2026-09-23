'use client';

import { useState } from 'react';
import { useClientInfo, type ClientSite, type ClientContact, type SiteAISummary } from '@/lib/useClientInfo';
import CompanyDetailsSection from './sections/CompanyDetailsSection';
import SitesSection from './sections/SitesSection';
import DocumentsSection from './sections/DocumentsSection';
import ContactsSection from './sections/ContactsSection';
import SiteSummarySection from './sections/SiteSummarySection';

function toRiskLevel(value: string | null): ClientSite['risk_level'] {
  if (value === 'Low' || value === 'Medium' || value === 'High') return value;
  return null;
}

function toContactType(value: string | null): ClientContact['contact_type'] {
  if (
    value === 'Operations' ||
    value === 'Finance' ||
    value === 'Emergency' ||
    value === 'Site Contact' ||
    value === 'Contract Manager'
  ) {
    return value;
  }
  return null;
}

function mapClientSite(row: {
  id: string;
  client_id: string;
  site_name: string;
  site_address: string | null;
  site_contact_person: string | null;
  site_phone: string | null;
  client_contact_for_site: string | null;
  opening_hours: string | null;
  security_cover_hours: string | null;
  site_notes: string | null;
  site_map_url: string | null;
  risk_level: string | null;
  created_by: string | null;
  created_at: string | null;
  updated_at: string | null;
}): ClientSite {
  return {
    id: row.id,
    client_id: row.client_id,
    site_name: row.site_name,
    site_address: row.site_address,
    site_contact_person: row.site_contact_person,
    site_phone: row.site_phone,
    client_contact_for_site: row.client_contact_for_site,
    opening_hours: row.opening_hours,
    security_cover_hours: row.security_cover_hours,
    site_notes: row.site_notes,
    site_map_url: row.site_map_url,
    risk_level: toRiskLevel(row.risk_level),
    created_by: row.created_by,
    created_at: row.created_at ?? '',
    updated_at: row.updated_at ?? '',
  };
}

function mapClientContact(row: {
  id: string;
  client_id: string;
  site_id: string | null;
  name: string;
  job_title: string | null;
  email: string | null;
  phone: string | null;
  mobile: string | null;
  contact_type: string | null;
  created_by: string | null;
  created_at: string | null;
  updated_at: string | null;
}): ClientContact {
  return {
    id: row.id,
    client_id: row.client_id,
    site_id: row.site_id,
    name: row.name,
    job_title: row.job_title,
    email: row.email,
    phone: row.phone,
    mobile: row.mobile,
    contact_type: toContactType(row.contact_type),
    created_by: row.created_by,
    created_at: row.created_at ?? '',
    updated_at: row.updated_at ?? '',
  };
}

function mapSiteAISummary(row: {
  id: string;
  site_id: string;
  client_id: string;
  site_overview: string | null;
  key_contacts: string | null;
  important_procedures: string | null;
  risks: string | null;
  emergency_notes: string | null;
  guard_briefing_summary: string | null;
  generated_by: string | null;
  created_at: string | null;
  updated_at: string | null;
}): SiteAISummary {
  return {
    id: row.id,
    site_id: row.site_id,
    client_id: row.client_id,
    site_overview: row.site_overview,
    key_contacts: row.key_contacts,
    important_procedures: row.important_procedures,
    risks: row.risks,
    emergency_notes: row.emergency_notes,
    guard_briefing_summary: row.guard_briefing_summary,
    generated_by: row.generated_by,
    created_at: row.created_at ?? '',
    updated_at: row.updated_at ?? '',
  };
}

const TABS = [
  { key: 'company', label: 'Company Details', icon: 'ri-building-2-line' },
  { key: 'sites', label: 'Sites', icon: 'ri-map-pin-line' },
  { key: 'documents', label: 'Documents', icon: 'ri-folder-upload-line' },
  { key: 'contacts', label: 'Key Contacts', icon: 'ri-contacts-book-line' },
  { key: 'ai-summary', label: 'AI Summaries', icon: 'ri-sparkling-line' },
];

export default function ClientInformationPage() {
  const [activeTab, setActiveTab] = useState('company');
  const info = useClientInfo();

  const handleCreateSite = async (data: Parameters<typeof info.createSite>[0]) => {
    const { data: row, error } = await info.createSite(data);
    return { data: row ? mapClientSite(row) : null, error };
  };

  const handleCreateContact = async (data: Parameters<typeof info.createContact>[0]) => {
    const { data: row, error } = await info.createContact(data);
    return { data: row ? mapClientContact(row) : null, error };
  };

  const handleGenerateSummary = async (siteId: string) => {
    const { data: row, error } = await info.generateSiteSummary(siteId);
    return { data: row ? mapSiteAISummary(row) : null, error };
  };

  if (info.loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (info.error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
        <div className="w-10 h-10 mx-auto mb-3 flex items-center justify-center text-red-400">
          <i className="ri-error-warning-line text-xl"></i>
        </div>
        <p className="text-sm text-red-300">{info.error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Client Information</h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage your company details, sites, documents, contacts and AI summaries
          </p>
        </div>
        {!info.canEdit && (
          <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-full">
            View Only
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-[#0f172a]/70 border border-white/10 rounded-xl overflow-hidden">
        <div className="flex items-center gap-0.5 p-1.5 border-b border-white/10 overflow-x-auto">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className={tab.icon}></i>
                </div>
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {activeTab === 'company' && (
            <CompanyDetailsSection
              profile={info.profile}
              canEdit={info.canEdit}
              saving={info.saving}
              onSave={info.upsertProfile}
            />
          )}
          {activeTab === 'sites' && (
            <SitesSection
              sites={info.sites}
              canEdit={info.canEdit}
              saving={info.saving}
              onCreate={handleCreateSite}
              onUpdate={info.updateSite}
              onDelete={info.deleteSite}
            />
          )}
          {activeTab === 'documents' && (
            <DocumentsSection
              documents={info.documents}
              sites={info.sites}
              canEdit={info.canEdit}
              saving={info.saving}
              onUpload={info.uploadDocument}
              onDelete={info.deleteDocument}
              onUpdateCategory={info.updateDocumentCategory}
              getUrl={info.getDocumentUrl}
            />
          )}
          {activeTab === 'contacts' && (
            <ContactsSection
              contacts={info.contacts}
              sites={info.sites}
              canEdit={info.canEdit}
              saving={info.saving}
              onCreate={handleCreateContact}
              onUpdate={info.updateContact}
              onDelete={info.deleteContact}
            />
          )}
          {activeTab === 'ai-summary' && (
            <SiteSummarySection
              sites={info.sites}
              summaries={info.summaries}
              documents={info.documents}
              contacts={info.contacts}
              canEdit={info.canEdit}
              saving={info.saving}
              onGenerate={handleGenerateSummary}
              onUpdate={info.updateSummary}
            />
          )}
        </div>
      </div>
    </div>
  );
}