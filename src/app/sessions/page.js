"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../utils/supabaseClient";

export default function SessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("sessions")
        .select("id, topic, agent_type, created_at, transcript_summary, insight_tags, emotional_analysis")
        .order("created_at", { ascending: false });
      if (!error) setSessions(data || []);
      setLoading(false);
    };
    fetchSessions();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-wave-offwhite">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-wave-forest"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-wave-offwhite p-8">
      <h1 className="text-3xl font-bold text-wave-forest mb-8">Your Sessions</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer hover:shadow-2xl transition-shadow border border-wave-green flex flex-col gap-2"
            onClick={() => router.push(`/sessions/${session.id}`)}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-wave-forest font-semibold text-lg truncate max-w-[60%]">
                {session.topic || "Untitled Session"}
              </span>
              <span className="text-xs bg-wave-marker-1 text-wave-forest px-2 py-1 rounded-full">
                {session.agent_type || ' Anxiety Coach'}
              </span>
            </div>
            <div className="text-sm text-wave-forest/80 mb-1">
              {new Date(session.created_at).toLocaleString()}
            </div>
            <div className="text-wave-forest text-sm line-clamp-3 mb-2">
              {session.transcript_summary?.summary || "No summary available."}
            </div>
            {/* Insight Tags */}
            {Array.isArray(session.insight_tags) && session.insight_tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {session.insight_tags.map((tag, idx) => (
                  <span key={tag+idx} className="bg-wave-marker-1 text-wave-forest px-3 py-1 rounded-full text-xs font-medium shadow">{tag}</span>
                ))}
              </div>
            )}
            {/* Emotional Weather */}
            {session.emotional_analysis?.mood_keywords && Array.isArray(session.emotional_analysis.mood_keywords) && session.emotional_analysis.mood_keywords.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {session.emotional_analysis.mood_keywords.map((mood, idx) => (
                  <span key={mood+idx} className="bg-wave-marker-3 text-wave-forest px-3 py-1 rounded-full text-xs font-medium shadow">{mood}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      {sessions.length === 0 && (
        <div className="text-wave-forest text-lg mt-12 text-center">No sessions found.</div>
      )}
    </div>
  );
} 