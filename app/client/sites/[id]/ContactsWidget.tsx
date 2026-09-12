'use client';

import { useSiteContacts, type SiteContact } from '@/lib/useSiteContacts';

const CONTACT_TYPE_ICONS: Record<string, string> = {
  emergency: 'ri-alarm-warning-line',
  client: 'ri-user-star-line',
  building_manager: 'ri-building-2-line',
  facilities: 'ri-tools-line',
  out_of_hours: 'ri-moon-line',
  keyholder: 'ri-key-2-line',
  alarm_responder: 'ri-shield-flash-line',
};

const CONTACT_TYPE_LABELS: Record<string, string> = {
  emergency: 'Emergency',
  client: 'Client Contact',
  building_manager: 'Building Manager',
  facilities: 'Facilities',
  out_of_hours: 'Out of Hours',
  keyholder: 'Keyholder',
  alarm_responder: 'Alarm Responder',
};

export default function ContactsWidget({ siteId, companyId, enabled }: { siteId: string; companyId: string | null; enabled: boolean }) {
  const { contacts, loading, error } = useSiteContacts(siteId, companyId, enabled);

  if (!enabled) return null;

  return (
    <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 flex items-center justify-center bg-cyan-500/10 rounded-lg border border-cyan-500/20">
            <i className="ri-contacts-book-line text-cyan-400 text-sm"></i>
          </div>
          <h3 className="text-sm font-semibold text-white">Site Contacts</h3>
        </div>
        <span className="text-xs text-gray-500">{contacts.length} contact{contacts.length !== 1 ? 's' : ''}</span>
      </div>
      <div className="p-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-cyan-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-6">
            <p className="text-xs text-gray-500">Could not load contacts</p>
          </div>
        ) : contacts.length === 0 ? (
          <div className="text-center py-6">
            <div className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-full mx-auto mb-2">
              <i className="ri-contacts-line text-gray-500"></i>
            </div>
            <p className="text-sm text-gray-400 font-medium">No contacts saved</p>
            <p className="text-xs text-gray-500 mt-1">Use Manage Site Data to add contacts.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {contacts.map((contact) => (
              <div key={contact.id} className={`p-3 rounded-lg border ${contact.is_primary ? 'bg-cyan-500/[0.06] border-cyan-500/20' : 'bg-white/5 border-white/5'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-6 h-6 flex items-center justify-center rounded ${contact.is_primary ? 'bg-cyan-500/10' : 'bg-white/5'}`}>
                    <i className={`${CONTACT_TYPE_ICONS[contact.contact_type] || 'ri-user-line'} text-xs ${contact.is_primary ? 'text-cyan-400' : 'text-gray-400'}`}></i>
                  </div>
                  <span className="text-xs font-medium text-white">{contact.contact_name}</span>
                  {contact.is_primary && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded font-medium">Primary</span>
                  )}
                </div>
                <div className="ml-8 space-y-0.5">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">{CONTACT_TYPE_LABELS[contact.contact_type] || contact.contact_type}</p>
                  {contact.contact_phone && (
                    <p className="text-xs text-gray-300 flex items-center gap-1">
                      <i className="ri-phone-line text-[10px] text-gray-500"></i>
                      {contact.contact_phone}
                    </p>
                  )}
                  {contact.contact_email && (
                    <p className="text-xs text-gray-300 flex items-center gap-1">
                      <i className="ri-mail-line text-[10px] text-gray-500"></i>
                      {contact.contact_email}
                    </p>
                  )}
                  {contact.notes && <p className="text-[10px] text-gray-500 mt-1">{contact.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}