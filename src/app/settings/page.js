"use client";

import { useEffect, useState } from "react";
import { FaUser, FaBell, FaCamera, FaCheck, FaBars } from "react-icons/fa";
import { Switch } from '@headlessui/react';
import { motion } from "framer-motion";
import { toast } from 'react-hot-toast';
import { useTheme } from "../../context/ThemeContext";

export default function SettingsPage() {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState(null);
  const [profile, setProfile] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      setSettings(data.settings);
      setProfile(data.profile);
      setAvatarPreview(data?.profile?.avatar_url);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const formData = new FormData(e.target);
      const profileData = {
        display_name: formData.get('display_name'),
        pronouns: formData.get('pronouns'),
        avatar_url: avatarPreview
      };

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      });

      if (!response.ok) throw new Error('Failed to update profile');
      toast.success('Profile changes saved!');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to save profile changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleSettingsUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const formData = new FormData(e.target);
      const settingsData = {
        notify_mood_reminder: formData.get('notify_mood_reminder') === 'true',
        notify_progress_summary: formData.get('notify_progress_summary') === 'true',
        notify_journal_nudge: formData.get('notify_journal_nudge') === 'true',
        notify_exercise_streak: formData.get('notify_exercise_streak') === 'true'
      };

      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsData)
      });

      if (!response.ok) throw new Error('Failed to update settings');
      toast.success('Settings saved!');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6B4EFF] shadow-lg"></div>
      </div>
    );
  }

  return (
    <main className="flex-1 p-4 md:p-8 w-full md:ml-64 transition-all duration-300">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-8">
        <h1 className={`text-3xl font-bold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>Settings</h1>

        {/* Profile Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`rounded-xl p-6 shadow-sm ${
            theme === 'light' 
              ? 'bg-white/80 border border-[#F7BFA3]' 
              : 'bg-[#1a1333]/80'
          }`}
        >
          <div className="flex items-center gap-4 mb-6">
            <FaUser className={`w-6 h-6 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`} />
            <h2 className={`text-xl font-semibold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>Profile</h2>
          </div>

          <form onSubmit={handleProfileUpdate} className="space-y-6">
            {/* Avatar Upload */}
            <div className="flex items-center gap-6">
              <div className="relative group">
                <img
                  src={avatarPreview}
                  className="w-24 h-24 rounded-full object-cover border-2 border-[#6B4EFF] transition-transform group-hover:scale-105"
                />
                <label
                  htmlFor="avatar"
                  className="absolute bottom-0 right-0 p-2 bg-[#6B4EFF] text-white rounded-full cursor-pointer hover:bg-[#6B4EFF]/90 transition-colors shadow-lg"
                >
                  <FaCamera className="w-4 h-4" />
                </label>
                <input
                  type="file"
                  id="avatar"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>
              <div>
                <h3 className={`font-medium ${theme === 'light' ? 'text-gray-900' : 'text-gray-300'}`}>Profile Picture</h3>
                <p className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-500'}`}>
                  Upload a new profile picture
                </p>
              </div>
            </div>

            {/* Display Name */}
            <div>
              <label htmlFor="display_name" className={`block text-sm font-medium ${theme === 'light' ? 'text-gray-900' : 'text-gray-300'}`}>
                Display Name
              </label>
              <input
                type="text"
                id="display_name"
                name="display_name"
                defaultValue={profile?.display_name}
                placeholder="Display Name"
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-[#6B4EFF] focus:ring-[#6B4EFF] transition-colors text-sm px-3 py-2 ${
                  theme === 'light' 
                    ? 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400' 
                    : 'bg-[#2B176B]/50 border-gray-600 text-white placeholder:text-gray-400'
                }`}
                required
              />
            </div>

            {/* Pronouns */}
            <div>
              <label htmlFor="pronouns" className={`block text-sm font-medium ${theme === 'light' ? 'text-gray-900' : 'text-gray-300'}`}>
                Pronouns (optional)
              </label>
              <input
                type="text"
                id="pronouns"
                name="pronouns"
                defaultValue={profile?.pronouns}
                placeholder="e.g., he/him, she/her, they/them"
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-[#6B4EFF] focus:ring-[#6B4EFF] transition-colors text-sm px-3 py-2 ${
                  theme === 'light' 
                    ? 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400' 
                    : 'bg-[#2B176B]/50 border-gray-600 text-white placeholder:text-gray-400'
                }`}
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-[#6B4EFF] text-white py-2 px-4 rounded-lg hover:bg-[#6B4EFF]/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : saveSuccess ? (
                <>
                  <FaCheck className="w-4 h-4" />
                  Saved!
                </>
              ) : (
                'Save Profile'
              )}
            </button>
          </form>
        </motion.div>

        {/* Notification Settings */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`rounded-xl p-6 shadow-sm ${
            theme === 'light' 
              ? 'bg-white/80 border border-[#F7BFA3]' 
              : 'bg-[#1a1333]/80'
          }`}
        >
          <div className="flex items-center gap-4 mb-6">
            <FaBell className={`w-6 h-6 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`} />
            <h2 className={`text-xl font-semibold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>Notifications</h2>
          </div>

          <form onSubmit={handleSettingsUpdate} className="space-y-6">
            {/* Notification Toggles */}
            <div className="space-y-4">
              <div className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                theme === 'light' 
                  ? 'hover:bg-[#F7BFA3]/20' 
                  : 'hover:bg-[#2B176B]/70'
              }`}>
                <div>
                  <h3 className={`font-medium ${theme === 'light' ? 'text-gray-900' : 'text-gray-300'}`}>Daily Mood Reminder</h3>
                  <p className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-500'}`}>
                    Get reminded to log your mood each day
                  </p>
                </div>
                <Switch
                  name="notify_mood_reminder"
                  defaultChecked={settings?.notify_mood_reminder}
                  className={`${
                    settings?.notify_mood_reminder ? 'bg-[#6B4EFF]' : 'bg-gray-200'
                  } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                >
                  <span
                    className={`${
                      settings?.notify_mood_reminder ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                  />
                </Switch>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-[#6B4EFF] text-white py-2 px-4 rounded-lg hover:bg-[#6B4EFF]/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : saveSuccess ? (
                <>
                  <FaCheck className="w-4 h-4" />
                  Saved!
                </>
              ) : (
                'Save Settings'
              )}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </main>
  );
} 