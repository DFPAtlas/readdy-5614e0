'use client';

import { SOPFormData } from '@/lib/useBuiltSOPs';

interface Props {
  data: SOPFormData;
  onChange: (data: Partial<SOPFormData>) => void;
}

export default function StepRoles({ data, onChange }: Props) {
  const addRole = () => {
    onChange({
      roles: [...data.roles, { role: '', responsibility: '' }],
    });
  };

  const updateRole = (idx: number, field: 'role' | 'responsibility', value: string) => {
    const next = [...data.roles];
    next[idx] = { ...next[idx], [field]: value };
    onChange({ roles: next });
  };

  const removeRole = (idx: number) => {
    onChange({ roles: data.roles.filter((_, i) => i !== idx) });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Roles & Responsibilities</h2>
        <p className="text-sm text-gray-400">List each role and what they are responsible for in this procedure.</p>
      </div>

      <div className="space-y-3">
        {data.roles.map((r, idx) => (
          <div key={idx} className="bg-gray-800/40 border border-gray-700 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Role {idx + 1}</span>
              {data.roles.length > 1 && (
                <button
                  onClick={() => removeRole(idx)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                >
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-delete-bin-line text-xs"></i>
                  </div>
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={r.role}
                onChange={(e) => updateRole(idx, 'role', e.target.value)}
                placeholder="Role name"
                className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
              <input
                type="text"
                value={r.responsibility}
                onChange={(e) => updateRole(idx, 'responsibility', e.target.value)}
                placeholder="Responsibility"
                className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        ))}

        <button
          onClick={addRole}
          className="w-full py-3 rounded-xl border border-dashed border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 hover:bg-gray-800/40 transition-all text-sm font-medium cursor-pointer whitespace-nowrap"
        >
          <div className="w-4 h-4 inline-flex items-center justify-center mr-1">
            <i className="ri-add-line"></i>
          </div>
          Add Role
        </button>
      </div>
    </div>
  );
}