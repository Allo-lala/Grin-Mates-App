'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { User, Camera, Save, LogOut, Loader2, Edit3 } from 'lucide-react';
import { MobileLayout } from '@/components/layout/mobile-layout';
import { ResponsiveContainer } from '@/components/layout/responsive-container';
import { clearSessionState } from '@/lib/session';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, ready, authenticated, logout } = usePrivy();
  const [isEditing, setIsEditing] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    location: '',
    dateOfBirth: '',
    phoneNumber: '',
  });

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    // Here you would typically save to a backend
    console.log('Saving profile:', profileData);
    setIsEditing(false);
    // You can add actual save logic here
  };

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogout = async () => {
    try {
      // Clear all session state - Requirements: 6.5
      clearSessionState();
      
      // Logout from Privy
      await logout();
      
      // Redirect to onboarding - Requirements: 6.5
      router.push('/');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-[#1db584]" />
      </div>
    );
  }

  if (!authenticated || !user) {
    router.push('/');
    return null;
  }

  return (
    <MobileLayout showBottomNav={true}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#1db584] to-[#15a576] pb-8 pt-6">
          <ResponsiveContainer maxWidth="md" padding="md">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-white">Profile</h1>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-white hover:bg-white/30 transition-colors"
              >
                <Edit3 className="h-4 w-4" />
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
            </div>
          </ResponsiveContainer>
        </div>

        {/* Main content */}
        <ResponsiveContainer maxWidth="md" padding="md" className="space-y-6 py-8">
          {/* Profile card */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 md:p-8 space-y-6">
            {/* Avatar section */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#1db584] to-[#15a576] overflow-hidden">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-12 w-12 text-white" />
                  )}
                </div>
                {isEditing && (
                  <label className="absolute -bottom-2 -right-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[#1db584] text-white hover:bg-[#15a576] transition-colors">
                    <Camera className="h-4 w-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Profile fields */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#1db584] focus:outline-none focus:ring-1 focus:ring-[#1db584]"
                      placeholder="Enter first name"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{profileData.firstName || 'Not set'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#1db584] focus:outline-none focus:ring-1 focus:ring-[#1db584]"
                      placeholder="Enter last name"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{profileData.lastName || 'Not set'}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                {isEditing ? (
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#1db584] focus:outline-none focus:ring-1 focus:ring-[#1db584]"
                    placeholder="Tell us about yourself"
                  />
                ) : (
                  <p className="text-gray-900 py-2">{profileData.bio || 'No bio added'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#1db584] focus:outline-none focus:ring-1 focus:ring-[#1db584]"
                    placeholder="Enter your location"
                  />
                ) : (
                  <p className="text-gray-900 py-2">{profileData.location || 'Not set'}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth
                  </label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={profileData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#1db584] focus:outline-none focus:ring-1 focus:ring-[#1db584]"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">
                      {profileData.dateOfBirth ? new Date(profileData.dateOfBirth).toLocaleDateString() : 'Not set'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={profileData.phoneNumber}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#1db584] focus:outline-none focus:ring-1 focus:ring-[#1db584]"
                      placeholder="Enter phone number"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{profileData.phoneNumber || 'Not set'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Save button */}
            {isEditing && (
              <button
                onClick={handleSaveProfile}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#1db584] py-3 font-medium text-white hover:bg-[#15a576] transition-colors min-h-[44px]"
              >
                <Save className="h-5 w-5" />
                Save Profile
              </button>
            )}

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 py-3 font-medium text-red-600 hover:bg-red-100 transition-all min-h-[44px]"
            >
              <LogOut className="h-5 w-5" />
              Disconnect Wallet
            </button>
          </div>
        </ResponsiveContainer>
      </div>
    </MobileLayout>
  );
}
