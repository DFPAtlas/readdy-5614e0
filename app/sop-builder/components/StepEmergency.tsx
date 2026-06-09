'use client';

import { SOPFormData } from '@/lib/useBuiltSOPs';

interface Props {
  data: SOPFormData;
  onChange: (data: Partial<SOPFormData>) => void;
}

export default function StepEmergency({ data, onChange }: Props) {
  const addContact = () => {
    onChange({ emergency_contacts: [...data.emergency_contacts, { name: '', role: '', phone: '' }] });
  };

  const updateContact = (idx: number, field: 'name' | 'role' | 'phone', value: string) => {
    const next = [...data.emergency_contacts];
    next[idx] = { ...next[idx], [field]: value };
    onChange({ emergency_contacts: next });
  };

  const removeContact = (idx: number) => {
    onChange({ emergency_contacts: data.emergency_contacts.filter((_, i) => i !== idx) });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Emergency Contacts</h2>
        <p className="text-sm text-gray-400">Add emergency contacts available at this site.</p>
      </div>

      <div className="space-y-3">
        {data.emergency_contacts.map((c, idx) => (
          <div key={idx} className="bg-gray-800/40 border border-gray-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact {idx + 1}</span>
              {data.emergency_contacts.length > 1 && (
                <button
                  onClick={() => removeContact(idx)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                >
                  <div className="w-4 h-4 flex items-center justify-center"><i className="ri-delete-bin-line text-xs"></i></div>
                </button>
              )}
            </div>
            <div className="grid grid-cols-3 gap-3">
              <input
                type="text"
                value={c.name}
                onChange={(e) => updateContact(idx, 'name', e.target.value)}
                placeholder="Name"
                className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
              <input
                type="text"
                value={c.role}
                onChange={(e) => updateContact(idx, 'role', e.target.value)}
                placeholder="Role"
                className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
              <input
                type="text"
                value={c.phone}
                onChange={(e) => updateContact(idx, 'phone', e.target.value)}
                placeholder="Phone"
                className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        ))}

        <button
          onClick={addContact}
          className="w-full py-3 rounded-xl border border-dashed border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 hover:bg-gray-800/40 transition-all text-sm font-medium cursor-pointer whitespace-nowrap"
        >
          <div className="w-4 h-4 inline-flex items-center justify-center mr-1">
            <i className="ri-add-line"></i>
          </div>
          Add Contact
        </button>
      </div>
    </div>
  );
}