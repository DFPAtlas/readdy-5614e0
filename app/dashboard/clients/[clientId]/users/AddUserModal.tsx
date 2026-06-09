'use client';

import { useState } from 'react';

interface CompanyUser {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  role: string | null;
}

interface AddUserModalProps {
  clientName: string;
  availableUsers: CompanyUser[];
  onAdd: (userId: string, role: string) => Promise<{ error: any }>;
  onClose: () => void;
  fullName: (u: CompanyUser) => string;
}

export default function AddUserModal({ clientName, availableUsers, onAdd, onClose, fullName }: AddUserModalProps) {
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState('viewer');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedUserId) return;
    setSubmitting(true);
    await onAdd(selectedUserId, selectedRole);
    setSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-[#111827] border border-gray-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <div>
            <h3 className="text-lg font-semibold text-white">Add User to Client</h3>
            <p className="text-sm text-gray-400 mt-0.5">{clientName}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-white rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <div className="w-5 h-5 flex items-center justify-center">
              <i className="ri-close-line"></i>
            </div>
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5 space-y-5">
          {/* User select */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Select User</label>
            {availableUsers.length === 0 ? (
              <div className="p-4 bg-gray-800/50 rounded-lg text-sm text-gray-500 text-center">
                All company users are already linked to this client.
              </div>
            ) : (
              <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
                {availableUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => setSelectedUserId(u.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors cursor-pointer ${
                      selectedUserId === u.id
                        ? 'bg-blue-600/15 border border-blue-500/30'
                        : 'bg-gray-800/40 border border-transparent hover:bg-gray-800'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-blue-600/15 flex items-center justify-center text-blue-400 text-sm font-semibold flex-shrink-0">
                      {u.first_name?.[0] || ''}{u.last_name?.[0] || ''}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-white truncate">{fullName(u)}</div>
                      <div className="text-xs text-gray-500 truncate">{u.email}</div>
                    </div>
                    {selectedUserId === u.id && (
                      <div className="ml-auto w-5 h-5 flex items-center justify-center text-blue-400">
                        <i className="ri-check-line"></i>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Role select */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Client Role</label>
            <div className="flex gap-2">
              {[
                { value: 'viewer', label: 'Viewer' },
                { value: 'manager', label: 'Manager' },
                { value: 'admin', label: 'Admin' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSelectedRole(opt.value)}
                  className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-medium border transition-colors cursor-pointer whitespace-nowrap ${
                    selectedRole === opt.value
                      ? 'bg-blue-600/15 text-blue-400 border-blue-500/30'
                      : 'bg-gray-800/40 text-gray-400 border-gray-700 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {selectedRole === 'viewer' && 'Can view reports, incidents and messages.'}
              {selectedRole === 'manager' && 'Can also approve reports and manage messages.'}
              {selectedRole === 'admin' && 'Full client portal access including user management.'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedUserId || submitting}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
              !selectedUserId || submitting
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
          >
            {submitting && (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            Add User
          </button>
        </div>
      </div>
    </div>
  );
}