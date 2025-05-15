"use client";

import { useEffect, useState } from "react";
import { FaUser, FaCog, FaTags, FaRobot } from "react-icons/fa";
import { motion } from "framer-motion";

const TONE_OPTIONS = [
  { value: "gentle", label: "Gentle" },
  { value: "coaching", label: "Coaching" },
  { value: "neutral", label: "Neutral" },
];

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [topics, setTopics] = useState([]);
  const [editing, setEditing] = useState(false);
  const [preferences, setPreferences] = useState({ preferred_tone: "gentle", preferred_agent: "", allow_agent_suggestions: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchTopics();
  }, []);

  const fetchProfile = async () => {
    const res = await fetch("/api/profile");
    const data = await res.json();
    setProfile(data.profile);
    setStats(data.stats);
    setPreferences({
      preferred_tone: data.profile.preferred_tone || "gentle",
      preferred_agent: data.profile.preferred_agent || "",
      allow_agent_suggestions: data.profile.allow_agent_suggestions !== false,
    });
  };

  const fetchTopics = async () => {
    const res = await fetch("/api/profile/topics");
    const data = await res.json();
    setTopics(data.topics || []);
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
    await fetch("/api/profile/preferences", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(preferences),
    });
    setSaving(false);
    setEditing(false);
    fetchProfile();
  };

  if (!profile || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f3e8ff] via-[#f5eafe] to-[#eaf6ff]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#b3c6ff] shadow-lg"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-wave-offwhite p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-8">
        {/* Profile Overview */}
        <div className="bg-white rounded-xl p-6 shadow-sm flex flex-col items-center">
          <img src={profile.avatar_url} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-2 border-wave-forest mb-4" />
          <h1 className="text-2xl font-bold text-wave-forest mb-1">{profile.display_name}</h1>
          <div className="text-gray-500 mb-2">Joined on: {new Date(profile.created_at).toLocaleDateString()}</div>
          <div className="flex gap-6 mt-4">
            <div className="flex flex-col items-center">
              <span className="text-lg font-semibold text-wave-forest">{stats.sessions}</span>
              <span className="text-xs text-gray-500">Sessions</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-lg font-semibold text-wave-forest">{stats.journal_entries}</span>
              <span className="text-xs text-gray-500">Journal Entries</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-lg font-semibold text-wave-forest">{stats.exercises_completed}</span>
              <span className="text-xs text-gray-500">Exercises</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-lg font-semibold text-wave-forest">{stats.avg_mood || '-'}</span>
              <span className="text-xs text-gray-500">Avg. Mood</span>
            </div>
          </div>
        </div>

        {/* Topics Explored */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <FaTags className="text-wave-forest" />
            <h2 className="text-lg font-semibold text-wave-forest">Topics Explored</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {topics.length === 0 && <span className="text-wave-forest">No topics yet</span>}
            {topics.map((t) => (
              <span key={t.topic} className="bg-wave-forest/10 text-wave-forest px-3 py-1 rounded-full text-sm font-medium">
                {t.topic} <span className="text-xs text-wave-forest">({t.count})</span>
              </span>
            ))}
          </div>
        </div>

        {/* Agent Preferences */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <FaRobot className="text-wave-forest" />
            <h2 className="text-lg font-semibold text-wave-forest">Agent Preferences</h2>
            {!editing && (
              <button onClick={() => setEditing(true)} className="ml-auto text-sm text-wave-forest hover:underline flex items-center gap-1"><FaCog /> Edit</button>
            )}
          </div>
          {editing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-wave-forest">Preferred Tone</label>
                <select name="preferred_tone" value={preferences.preferred_tone} onChange={handlePrefChange} className="mt-1 block w-full rounded-md border-gray-300 focus:border-wave-forest focus:ring-wave-forest">
                  {TONE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-wave-forest">Default Agent</label>
                <input type="text" name="preferred_agent" value={preferences.preferred_agent} onChange={handlePrefChange} className="mt-1 block w-full rounded-md border-gray-300 focus:border-wave-forest focus:ring-wave-forest" placeholder="e.g., Confidence Coach" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="allow_agent_suggestions" name="allow_agent_suggestions" checked={preferences.allow_agent_suggestions} onChange={handlePrefChange} className="rounded border-gray-300 focus:ring-wave-forest" />
                <label htmlFor="allow_agent_suggestions" className="text-sm text-wave-forest">Allow agent suggestions</label>
              </div>
              <button type="submit" disabled={saving} className="bg-wave-forest text-white px-4 py-2 rounded-lg hover:bg-wave-forest/90 transition-colors disabled:opacity-50">{saving ? "Saving..." : "Save Preferences"}</button>
              <button type="button" onClick={() => setEditing(false)} className="ml-2 text-sm text-wave-forest hover:underline">Cancel</button>
            </form>
          ) : (
            <div className="space-y-2">
              <div className="text-wave-forest"><span className="font-medium text-wave-forest">Preferred Tone:</span> {profile.preferred_tone || "-"}</div>
              <div className="text-wave-forest" ><span className="font-medium text-wave-forest">Default Agent:</span> {profile.preferred_agent || "-"}</div>
              <div className="text-wave-forest" ><span className="font-medium text-wave-forest">Agent Suggestions:</span> {profile.allow_agent_suggestions ? "Enabled" : "Disabled"}</div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
} 