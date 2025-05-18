"use client";

import { useEffect, useState } from "react";
import { FaUser, FaCog, FaTags, FaRobot, FaBars } from "react-icons/fa";
import { motion } from "framer-motion";
import DashboardSidebar from '../../components/DashboardSidebar';
import { toast } from 'react-hot-toast';

const TONE_OPTIONS = [
  { value: "gentle", label: "Gentle" },
  { value: "coaching", label: "Coaching" },
  { value: "neutral", label: "Neutral" },
];

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [editing, setEditing] = useState(false);
  const [preferences, setPreferences] = useState({ preferred_tone: "gentle", preferred_agent: "", allow_agent_suggestions: true });
  const [saving, setSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const res = await fetch("/api/profile");
    const data = await res.json();
    if (!data.profile) {
      // No profile found, set safe defaults
      setProfile({});
      setStats({});
      setPreferences({
        preferred_tone: "gentle",
        preferred_agent: "",
        allow_agent_suggestions: true,
      });
      return;
    }
    setProfile(data.profile);
    setStats(data.stats);
    setPreferences({
      preferred_tone: data.profile.preferred_tone || "gentle",
      preferred_agent: data.profile.preferred_agent || "",
      allow_agent_suggestions: data.profile.allow_agent_suggestions !== false,
    });
  };

  const handlePrefChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPreferences((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch("/api/profile/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      });
      toast.success('Preferences saved!');
      setSaving(false);
      setEditing(false);
      fetchProfile();
    } catch (error) {
      toast.error('Failed to save preferences.');
      setSaving(false);
    }
  };

  if (!profile || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0A0613] via-[#2B176B] to-[#3B2BFF]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6B4EFF] shadow-lg"></div>
      </div>
    );
  }

  if (profile && Object.keys(profile).length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-gradient-to-br from-[#0A0613] via-[#2B176B] to-[#3B2BFF]">
        No profile found. Please set up your profile in settings.
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-[#0A0613] via-[#2B176B] to-[#3B2BFF]">
      {/* Hamburger for mobile */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-[#2B176B] p-2 rounded-full shadow-lg border border-[#6B4EFF] text-white"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open sidebar"
      >
        <FaBars className="w-6 h-6" />
      </button>
      <DashboardSidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 p-4 md:p-8 w-full md:ml-64 transition-all duration-300">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-8">
          {/* Profile Overview */}
          <div className="bg-[#1a1333]/80 rounded-xl p-6 shadow-sm flex flex-col items-center">
            <img src={profile?.avatar_url || ''} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-2 border-[#6B4EFF] mb-4" style={{ background: !profile?.avatar_url ? '#2B176B' : undefined }} />
            <h1 className="text-2xl font-bold text-white mb-1">{profile?.display_name || ''}</h1>
            <div className="text-[#D1D5DB] mb-2">Joined on: {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : ''}</div>
            <div className="flex gap-6 mt-4">
              <div className="flex flex-col items-center">
                <span className="text-lg font-semibold text-white">{stats?.sessions ?? '-'}</span>
                <span className="text-xs text-[#D1D5DB]">Sessions</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-lg font-semibold text-white">{stats?.journal_entries ?? '-'}</span>
                <span className="text-xs text-[#D1D5DB]">Journal Entries</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-lg font-semibold text-white">{stats?.exercises_completed ?? '-'}</span>
                <span className="text-xs text-[#D1D5DB]">Exercises</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-lg font-semibold text-white">{stats?.avg_mood ?? '-'}</span>
                <span className="text-xs text-[#D1D5DB]">Avg. Mood</span>
              </div>
            </div>
          </div>

          {/* Topics Explored */}
          {/* Removed topics section */}

          {/* Agent Preferences */}
          <div className="bg-[#1a1333]/80 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <FaRobot className="text-white" />
              <h2 className="text-lg font-semibold text-white">Agent Preferences</h2>
              {!editing && (
                <button onClick={() => setEditing(true)} className="ml-auto text-sm text-[#D1D5DB] hover:underline flex items-center gap-1"><FaCog /> Edit</button>
              )}
            </div>
            {editing ? (
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#D1D5DB]">Preferred Tone</label>
                  <select name="preferred_tone" value={preferences.preferred_tone} onChange={handlePrefChange} className="mt-1 block w-full rounded-md border-gray-300 focus:border-[#6B4EFF] focus:ring-[#6B4EFF] text-black text-sm px-3 py-2">
                    {TONE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#D1D5DB]">Default Agent</label>
                  <input type="text" name="preferred_agent" value={preferences.preferred_agent} onChange={handlePrefChange} className="mt-1 block w-full rounded-md border-gray-300 focus:border-[#6B4EFF] focus:ring-[#6B4EFF] text-black text-sm px-3 py-2" placeholder="e.g., Confidence Coach" />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="allow_agent_suggestions" name="allow_agent_suggestions" checked={preferences.allow_agent_suggestions} onChange={handlePrefChange} className="rounded border-gray-300 focus:ring-[#6B4EFF]" />
                  <label htmlFor="allow_agent_suggestions" className="text-sm text-[#D1D5DB]">Allow agent suggestions</label>
                </div>
                <button type="submit" disabled={saving} className="bg-[#6B4EFF] text-white px-4 py-2 rounded-lg hover:bg-[#6B4EFF]/90 transition-colors disabled:opacity-50">{saving ? "Saving..." : "Save Preferences"}</button>
                <button type="button" onClick={() => setEditing(false)} className="ml-2 text-sm text-[#D1D5DB] hover:underline">Cancel</button>
              </form>
            ) : (
              <div className="space-y-2">
                <div className="text-[#D1D5DB]"><span className="font-medium text-white">Preferred Tone:</span> {profile?.preferred_tone || "-"}</div>
                <div className="text-[#D1D5DB]" ><span className="font-medium text-white">Default Agent:</span> {profile?.preferred_agent || "-"}</div>
                <div className="text-[#D1D5DB]" ><span className="font-medium text-white">Agent Suggestions:</span> {profile?.allow_agent_suggestions ? "Enabled" : "Disabled"}</div>
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
} 