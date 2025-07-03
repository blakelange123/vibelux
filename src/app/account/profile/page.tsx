'use client';

import React, { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  User,
  Mail,
  Phone,
  Building,
  MapPin,
  Calendar,
  Camera,
  Edit3,
  Save,
  X,
  Shield,
  CreditCard,
  Activity,
  Settings,
  LogOut,
  Trash2,
  Download,
  Upload,
  Globe,
  Briefcase,
  Award
} from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { user } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: user?.fullName || user?.firstName || '',
    email: user?.primaryEmailAddress?.emailAddress || '',
    phone: user?.primaryPhoneNumber?.phoneNumber || '',
    company: '',
    jobTitle: '',
    location: '',
    bio: '',
    website: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });
  const [profileImage, setProfileImage] = useState(user?.imageUrl || '');

  const handleSave = async () => {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...profileData,
          profileImage
        }),
      });
      
      if (response.ok) {
        setIsEditing(false);
        // Show success notification
      } else {
        throw new Error('Failed to save profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      // Show error notification
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const accountAge = user?.createdAt 
    ? Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
        <p className="text-gray-400">Manage your account information and preferences</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Profile Card */}
          <div className="bg-gray-800 rounded-xl p-6 mb-6">
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-700">
                  {profileImage ? (
                    <img 
                      src={profileImage} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-16 h-16 text-gray-500" />
                    </div>
                  )}
                </div>
                {isEditing && (
                  <label className="absolute bottom-0 right-0 p-2 bg-green-600 rounded-full cursor-pointer hover:bg-green-700 transition-colors">
                    <Camera className="w-4 h-4 text-white" />
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </label>
                )}
              </div>
              <h2 className="text-xl font-semibold text-white mb-1">
                {profileData.displayName || 'Your Name'}
              </h2>
              <p className="text-gray-400 text-sm mb-4">{profileData.email}</p>
              
              {/* Quick Stats */}
              <div className="w-full pt-4 border-t border-gray-700">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Member Since</span>
                    <span className="text-white">
                      {user?.createdAt 
                        ? new Date(user.createdAt).toLocaleDateString()
                        : 'N/A'
                      }
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Account Age</span>
                    <span className="text-white">{accountAge} days</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Subscription</span>
                    <span className="text-green-400">Professional</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
            <nav className="space-y-2">
              <Link 
                href="/account/security" 
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Shield className="w-5 h-5 text-gray-400" />
                <span className="text-gray-300">Security Settings</span>
              </Link>
              <Link 
                href="/account/billing" 
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <CreditCard className="w-5 h-5 text-gray-400" />
                <span className="text-gray-300">Billing & Subscription</span>
              </Link>
              <Link 
                href="/account/activity" 
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Activity className="w-5 h-5 text-gray-400" />
                <span className="text-gray-300">Activity History</span>
              </Link>
              <Link 
                href="/settings" 
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Settings className="w-5 h-5 text-gray-400" />
                <span className="text-gray-300">App Settings</span>
              </Link>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Profile Information */}
          <div className="bg-gray-800 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Profile Information</h3>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Display Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Display Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.displayName}
                    onChange={(e) => setProfileData({
                      ...profileData,
                      displayName: e.target.value
                    })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                ) : (
                  <p className="text-white">{profileData.displayName || '-'}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Email Address
                </label>
                <p className="text-white">{profileData.email}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Email managed by authentication provider
                </p>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({
                      ...profileData,
                      phone: e.target.value
                    })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    placeholder="+1 (555) 123-4567"
                  />
                ) : (
                  <p className="text-white">{profileData.phone || '-'}</p>
                )}
              </div>

              {/* Company */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Building className="w-4 h-4 inline mr-1" />
                  Company
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.company}
                    onChange={(e) => setProfileData({
                      ...profileData,
                      company: e.target.value
                    })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    placeholder="Acme Corp"
                  />
                ) : (
                  <p className="text-white">{profileData.company || '-'}</p>
                )}
              </div>

              {/* Job Title */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Briefcase className="w-4 h-4 inline mr-1" />
                  Job Title
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.jobTitle}
                    onChange={(e) => setProfileData({
                      ...profileData,
                      jobTitle: e.target.value
                    })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    placeholder="Cultivation Manager"
                  />
                ) : (
                  <p className="text-white">{profileData.jobTitle || '-'}</p>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Location
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.location}
                    onChange={(e) => setProfileData({
                      ...profileData,
                      location: e.target.value
                    })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    placeholder="San Francisco, CA"
                  />
                ) : (
                  <p className="text-white">{profileData.location || '-'}</p>
                )}
              </div>

              {/* Website */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Globe className="w-4 h-4 inline mr-1" />
                  Website
                </label>
                {isEditing ? (
                  <input
                    type="url"
                    value={profileData.website}
                    onChange={(e) => setProfileData({
                      ...profileData,
                      website: e.target.value
                    })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    placeholder="https://example.com"
                  />
                ) : (
                  <p className="text-white">{profileData.website || '-'}</p>
                )}
              </div>

              {/* Bio */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Bio
                </label>
                {isEditing ? (
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData({
                      ...profileData,
                      bio: e.target.value
                    })}
                    rows={4}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <p className="text-white">{profileData.bio || '-'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Account Actions */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Account Actions</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <Download className="w-5 h-5 text-gray-400" />
                  <div className="text-left">
                    <p className="text-white font-medium">Download Your Data</p>
                    <p className="text-sm text-gray-400">Get a copy of all your account data</p>
                  </div>
                </div>
                <span className="text-gray-400">→</span>
              </button>

              <button className="w-full flex items-center justify-between p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-gray-400" />
                  <div className="text-left">
                    <p className="text-white font-medium">Verify Your Account</p>
                    <p className="text-sm text-gray-400">Add business verification for trust</p>
                  </div>
                </div>
                <span className="text-gray-400">→</span>
              </button>

              <button className="w-full flex items-center justify-between p-4 bg-red-900/20 hover:bg-red-900/30 border border-red-600/30 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <Trash2 className="w-5 h-5 text-red-400" />
                  <div className="text-left">
                    <p className="text-red-400 font-medium">Delete Account</p>
                    <p className="text-sm text-gray-400">Permanently delete your account and data</p>
                  </div>
                </div>
                <span className="text-red-400">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}