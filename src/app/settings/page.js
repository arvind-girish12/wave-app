"use client";

import { useEffect, useState } from "react";
import { FaUser, FaBell, FaCamera, FaCheck } from "react-icons/fa";
import { Switch } from '@headlessui/react';
import { motion } from "framer-motion";

export default function SettingsPage() {
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
      setAvatarPreview(data.profile.avatar_url);
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
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      console.error('Error updating profile:', error);
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
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      console.error('Error updating settings:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-wave-offwhite p-8">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-96 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-wave-offwhite p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto space-y-8"
      >
        <h1 className="text-3xl font-bold text-wave-forest">Settings</h1>

        {/* Profile Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-sm"
        >
          <div className="flex items-center gap-4 mb-6">
            <FaUser className="w-6 h-6 text-wave-forest" />
            <h2 className="text-xl font-semibold text-wave-forest">Profile</h2>
          </div>

          <form onSubmit={handleProfileUpdate} className="space-y-6">
            {/* Avatar Upload */}
            <div className="flex items-center gap-6">
              <div className="relative group">
                <img
                  src={avatarPreview}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-2 border-wave-forest transition-transform group-hover:scale-105"
                />
                <label
                  htmlFor="avatar"
                  className="absolute bottom-0 right-0 p-2 bg-wave-forest text-white rounded-full cursor-pointer hover:bg-wave-forest/90 transition-colors shadow-lg"
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
                <h3 className="font-medium text-gray-900">Profile Picture</h3>
                <p className="text-sm text-gray-500">
                  Upload a new profile picture
                </p>
              </div>
            </div>

            {/* Display Name */}
            <div>
              <label htmlFor="display_name" className="block text-sm font-medium text-gray-700">
                Display Name
              </label>
              <input
                type="text"
                id="display_name"
                name="display_name"
                defaultValue={profile.display_name}
                placeholder="Display Name"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-wave-forest focus:ring-wave-forest transition-colors"
                required
              />
            </div>

            {/* Pronouns */}
            <div>
              <label htmlFor="pronouns" className="block text-sm font-medium text-gray-700">
                Pronouns (optional)
              </label>
              <input
                type="text"
                id="pronouns"
                name="pronouns"
                defaultValue={profile.pronouns}
                placeholder="e.g., he/him, she/her, they/them"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-wave-forest focus:ring-wave-forest transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-wave-forest text-white py-2 px-4 rounded-lg hover:bg-wave-forest/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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
          className="bg-white rounded-xl p-6 shadow-sm"
        >
          <div className="flex items-center gap-4 mb-6">
            <FaBell className="w-6 h-6 text-wave-forest" />
            <h2 className="text-xl font-semibold text-wave-forest">Notifications</h2>
          </div>

          <form onSubmit={handleSettingsUpdate} className="space-y-6">
            {/* Notification Toggles */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors">
                <div>
                  <h3 className="font-medium text-gray-900">Daily Mood Reminder</h3>
                  <p className="text-sm text-gray-500">
                    Get reminded to log your mood each day
                  </p>
                </div>
                <Switch
                  name="notify_mood_reminder"
                  defaultChecked={settings.notify_mood_reminder}
                  className={`${
                    settings.notify_mood_reminder ? 'bg-wave-forest' : 'bg-gray-200'
                  } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                >
                  <span
                    className={`${
                      settings.notify_mood_reminder ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                  />
                </Switch>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors">
                <div>
                  <h3 className="font-medium text-gray-900">Weekly Progress Summary</h3>
                  <p className="text-sm text-gray-500">
                    Receive a weekly summary of your progress
                  </p>
                </div>
                <Switch
                  name="notify_progress_summary"
                  defaultChecked={settings.notify_progress_summary}
                  className={`${
                    settings.notify_progress_summary ? 'bg-wave-forest' : 'bg-gray-200'
                  } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                >
                  <span
                    className={`${
                      settings.notify_progress_summary ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                  />
                </Switch>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors">
                <div>
                  <h3 className="font-medium text-gray-900">Journal Suggestions</h3>
                  <p className="text-sm text-gray-500">
                    Get prompts for journal entries
                  </p>
                </div>
                <Switch
                  name="notify_journal_nudge"
                  defaultChecked={settings.notify_journal_nudge}
                  className={`${
                    settings.notify_journal_nudge ? 'bg-wave-forest' : 'bg-gray-200'
                  } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                >
                  <span
                    className={`${
                      settings.notify_journal_nudge ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                  />
                </Switch>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors">
                <div>
                  <h3 className="font-medium text-gray-900">Exercise Streak Reminders</h3>
                  <p className="text-sm text-gray-500">
                    Get reminded to maintain your exercise streak
                  </p>
                </div>
                <Switch
                  name="notify_exercise_streak"
                  defaultChecked={settings.notify_exercise_streak}
                  className={`${
                    settings.notify_exercise_streak ? 'bg-wave-forest' : 'bg-gray-200'
                  } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                >
                  <span
                    className={`${
                      settings.notify_exercise_streak ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                  />
                </Switch>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-wave-forest text-white py-2 px-4 rounded-lg hover:bg-wave-forest/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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
    </div>
  );
} 