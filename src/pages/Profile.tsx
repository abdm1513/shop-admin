import React, { useState } from 'react';
import { User, Mail, Calendar, Shield, Save, Camera, Key } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { formatDate } from '../utils/formatters';
import { Input } from '../components/shared/Input';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { useToast } from '../hooks/useToast';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const handleSave = async () => {
    try {
      setLoading(true);
      // In a real app, you would call an API to update the user profile
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      showToast('Profile updated successfully', 'success');
      setIsEditing(false);
    } catch (error) {
      showToast('Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading profile..." />
      </div>
    );
  }

  const userInfo = [
    { label: 'User ID', value: user.$id, icon: User },
    { label: 'Email', value: user.email, icon: Mail },
    { label: 'Account Created', value: formatDate(user.$createdAt), icon: Calendar },
    { label: 'Last Updated', value: formatDate(user.$updatedAt), icon: Calendar },
    { label: 'Email Verified', value: user.emailVerification ? 'Yes' : 'No', icon: Shield },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Profile Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account information and preferences
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          {isEditing ? (
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    name: user.name || '',
                    email: user.email || '',
                  });
                }}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50 flex items-center"
              >
                {loading ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Changes
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium text-white transition-colors flex items-center"
            >
              <User className="h-4 w-4 mr-2" />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Basic Information
            </h3>

            <div className="space-y-6">
              {isEditing ? (
                <>
                  <Input
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                  />
                  <Input
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    disabled // Usually email cannot be changed
                  />
                </>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {userInfo.map((info, index) => {
                    const Icon = info.icon;
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <Icon className="h-4 w-4 mr-2" />
                          {info.label}
                        </div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white break-all">
                          {info.value}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Security Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Security
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    Change Password
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Update your password regularly for better security
                  </p>
                </div>
                <button
                  onClick={() => showToast('Password change feature coming soon!', 'info')}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors flex items-center"
                >
                  <Key className="h-4 w-4 mr-2" />
                  Change
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    Two-Factor Authentication
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <button
                  onClick={() => showToast('2FA feature coming soon!', 'info')}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
                >
                  Enable
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Picture & Stats */}
        <div className="space-y-6">
          {/* Profile Picture */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Profile Picture
            </h3>

            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="h-32 w-32 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-4xl font-semibold text-blue-600 dark:text-blue-300">
                  {user.name?.charAt(0) || 'A'}
                </div>
                <button
                  onClick={() => showToast('Profile picture upload coming soon!', 'info')}
                  className="absolute bottom-0 right-0 h-10 w-10 rounded-full bg-blue-600 hover:bg-blue-700 border-4 border-white dark:border-gray-800 flex items-center justify-center text-white transition-colors"
                  title="Change photo"
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 text-center">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {user.name || 'Administrator'}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user.email}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Admin User
                </p>
              </div>
            </div>
          </div>

          {/* Account Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Account Stats
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Member Since
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {new Date(user.$createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Last Login
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Just now
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Account Status
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                  Active
                </span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => showToast('Session management coming soon!', 'info')}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                View Active Sessions
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;