'use client';

import { useState } from 'react';
import { useClientInfo } from '@/lib/useClientInfo';
import CompanyDetailsSection from './sections/CompanyDetailsSection';
import SitesSection from './sections/SitesSection';
import DocumentsSection from './sections/DocumentsSection';
import ContactsSection from './sections/ContactsSection';
import SiteSummarySection from './sections/SiteSummarySection';

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
              onCreate={info.createSite}
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
              onCreate={info.createContact}
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
              onGenerate={info.generateSiteSummary}
              onUpdate={info.updateSummary}
            />
          )}
        </div>
      </div>
    </div>
  );
}