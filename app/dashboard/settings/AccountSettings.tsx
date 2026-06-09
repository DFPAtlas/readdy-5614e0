'use client';

import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export default function AccountSettings() {
  const { profile, user, company } = useAuth();

  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    jobTitle: '',
    department: 'Operations',
    location: '',
    bio: '',
    timezone: 'Europe/London',
    language: 'English (UK)',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24-hour'
  });

  const [profilePhoto, setProfilePhoto] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setProfileData(prev => ({
        ...prev,
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
      }));
    }
  }, [profile]);

  useEffect(() => {
    if (user?.avatar_url) {
      setProfilePhoto(user.avatar_url);
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
    setSaveError('');
    setSaveSuccess(false);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePhoto(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!profile?.id) return;
    setIsSaving(true);
    setSaveError('');
    setSaveSuccess(false);

    const { error } = await supabase
      .from('users')
      .update({
        first_name: profileData.firstName.trim() || null,
        last_name: profileData.lastName.trim() || null,
        phone: profileData.phone.trim() || null,
        email: profileData.email.trim() || null,
      })
      .eq('id', profile.id);

    if (error) {
      if (error.code === '42501' || error.message.toLowerCase().includes('row-level security')) {
        setSaveError('You do not have permission to update this profile.');
      } else {
        setSaveError('Failed to save changes. Please try again.');
      }
      setIsSaving(false);
      return;
    }

    setSaveSuccess(true);
    setIsEditing(false);
    setIsSaving(false);

    // Sync email with Supabase Auth if changed
    if (profileData.email.trim() && profileData.email.trim() !== profile.email) {
      const { error: authError } = await supabase.auth.updateUser({ email: profileData.email.trim() });
      if (authError) {
        setSaveError('Profile saved, but email update failed. Please try again.');
      }
    }
  };

  const handleCancel = () => {
    if (profile) {
      setProfileData(prev => ({
        ...prev,
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
      }));
    }
    setSaveError('');
    setSaveSuccess(false);
    setIsEditing(false);
  };

  const roleDisplay = profile?.role ? profile.role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'User';

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Account Settings</h2>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap flex items-center text-sm"
            >
              <i className="ri-edit-line mr-2"></i>
              Edit Profile
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors cursor-pointer whitespace-nowrap text-sm disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors cursor-pointer whitespace-nowrap text-sm disabled:opacity-50 flex items-center"
              >
                {isSaving ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin mr-2"></div>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 space-y-8">
        {(saveError || saveSuccess) && (
          <div className={`p-3 rounded-lg text-sm ${saveError ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
            {saveError || 'Changes saved successfully.'}
          </div>
        )}

        {/* Profile Photo Section */}
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold border-4 border-gray-300 overflow-hidden">
              {profilePhoto ? (
                <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span>{profileData.firstName?.[0] || ''}{profileData.lastName?.[0] || ''}</span>
              )}
            </div>
            {isEditing && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors cursor-pointer"
              >
                <i className="ri-camera-line text-white text-sm"></i>
              </button>
            )}
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
            <p className="text-sm text-gray-500">Upload a professional photo for your profile</p>
            {isEditing && (
              <p className="text-xs text-gray-400 mt-1">Recommended: 400x400px, max 2MB</p>
            )}
          </div>
        </div>

        {/* Personal Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="firstName"
                  value={profileData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{profileData.firstName || <span className="text-gray-400 italic">Not set</span>}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="lastName"
                  value={profileData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{profileData.lastName || <span className="text-gray-400 italic">Not set</span>}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{profileData.email || <span className="text-gray-400 italic">Not set</span>}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{profileData.phone || <span className="text-gray-400 italic">Not set</span>}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <p className="text-gray-900 capitalize">{roleDisplay}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
              <p className="text-gray-900">{company?.name || <span className="text-gray-400 italic">Not set</span>}</p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              {isEditing ? (
                <input
                  type="text"
                  name="location"
                  value={profileData.location}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{profileData.location || <span className="text-gray-400 italic">Not set</span>}</p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
              {isEditing ? (
                <textarea
                  name="bio"
                  value={profileData.bio}
                  onChange={handleInputChange}
                  rows={3}
                  maxLength={500}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              ) : (
                <p className="text-gray-900">{profileData.bio || <span className="text-gray-400 italic">Not set</span>}</p>
              )}
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferences</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
              {isEditing ? (
                <select
                  name="timezone"
                  value={profileData.timezone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                >
                  <option value="Europe/London">Europe/London (GMT)</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                  <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                  <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                </select>
              ) : (
                <p className="text-gray-900">{profileData.timezone}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
              {isEditing ? (
                <select
                  name="language"
                  value={profileData.language}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                >
                  <option value="English (UK)">English (UK)</option>
                  <option value="English (US)">English (US)</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                </select>
              ) : (
                <p className="text-gray-900">{profileData.language}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
              {isEditing ? (
                <select
                  name="dateFormat"
                  value={profileData.dateFormat}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              ) : (
                <p className="text-gray-900">{profileData.dateFormat}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Format</label>
              {isEditing ? (
                <select
                  name="timeFormat"
                  value={profileData.timeFormat}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                >
                  <option value="24-hour">24-hour</option>
                  <option value="12-hour">12-hour</option>
                </select>
              ) : (
                <p className="text-gray-900">{profileData.timeFormat}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}