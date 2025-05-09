"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaHeart, FaDumbbell, FaBalanceScale } from "react-icons/fa";

const TONE_OPTIONS = [
  {
    value: "gentle",
    label: "Gentle",
    description: "A supportive and nurturing approach",
    icon: FaHeart,
    preview: "I understand this might be challenging. Let's take it one step at a time together.",
  },
  {
    value: "coaching",
    label: "Coaching",
    description: "Motivational and goal-oriented guidance",
    icon: FaDumbbell,
    preview: "You've got this! Let's push through and achieve your goals together.",
  },
  {
    value: "neutral",
    label: "Neutral",
    description: "Balanced and objective interaction",
    icon: FaBalanceScale,
    preview: "Let's analyze the situation and work through it systematically.",
  },
];

export default function LanguagePage() {
  const [preferences, setPreferences] = useState({
    preferred_tone: "gentle",
  });
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const res = await fetch("/api/profile");
      const data = await res.json();
      setPreferences({
        preferred_tone: data.profile.preferred_tone || "gentle",
      });
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  };

  const handleToneChange = (tone) => {
    setPreferences((prev) => ({
      ...prev,
      preferred_tone: tone,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      });
      if (!response.ok) throw new Error('Failed to update preferences');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-wave-offwhite p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto"
      >
        <div className="bg-white rounded-xl p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-wave-forest mb-2">Language & Tone</h1>
          <p className="text-wave-forest/80 mb-8">
            Customize how the AI communicates with you during your sessions.
          </p>

          <form onSubmit={handleSave} className="space-y-8">
            <div>
              <label className="block text-sm font-medium text-wave-forest mb-4">
                Select Your Preferred Tone
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {TONE_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <label
                      key={opt.value}
                      className={`relative flex flex-col p-6 rounded-xl border-2 cursor-pointer transition-all ${
                        preferences.preferred_tone === opt.value
                          ? 'border-wave-forest bg-wave-forest/5 shadow-md'
                          : 'border-gray-200 hover:border-wave-forest/50 hover:shadow-sm'
                      }`}
                    >
                      <input
                        type="radio"
                        name="preferred_tone"
                        value={opt.value}
                        checked={preferences.preferred_tone === opt.value}
                        onChange={() => handleToneChange(opt.value)}
                        className="sr-only"
                      />
                      <div className="flex items-center gap-3 mb-3">
                        <Icon className={`w-6 h-6 ${
                          preferences.preferred_tone === opt.value
                            ? 'text-wave-forest'
                            : 'text-gray-400'
                        }`} />
                        <span className="font-medium text-wave-forest">{opt.label}</span>
                      </div>
                      <p className="text-sm text-wave-forest/80 mb-4">{opt.description}</p>
                      <div className="mt-auto">
                        <p className="text-sm text-wave-forest/70 italic">
                          "{opt.preview}"
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-wave-forest text-white py-2 px-6 rounded-lg hover:bg-wave-forest/90 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : saveSuccess ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Saved!
                  </>
                ) : (
                  'Save Preferences'
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
} 