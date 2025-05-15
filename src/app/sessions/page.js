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
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-[#0A0613] via-[#2B176B] to-[#3B2BFF]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6B4EFF] shadow-lg"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0613] via-[#2B176B] to-[#3B2BFF] ml-64 p-8">
      <h1 className="text-3xl font-bold text-white mb-8">Your Sessions</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="bg-[#1a1333]/80 rounded-2xl shadow-xl p-6 border-2 border-[#6B4EFF] flex flex-col gap-4 hover:shadow-2xl transition-shadow cursor-pointer"
            onClick={() => router.push(`/sessions/${session.id}`)}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs bg-[#2B176B]/80 text-[#D1D5DB] px-3 py-1 rounded-full">{session.agent_type}</span>
              <span className="text-xs text-[#D1D5DB]">{new Date(session.created_at).toLocaleString()}</span>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2 line-clamp-1">{session.topic || 'Untitled Session'}</h2>
            <p className="text-[#D1D5DB] text-sm line-clamp-2 mb-2">{session.transcript_summary?.summary || '—'}</p>
            <div className="flex flex-wrap gap-2 mb-2">
              {Array.isArray(session.insight_tags) && session.insight_tags.map((tag, idx) => (
                <span key={tag+idx} className="bg-[#3B2BFF]/30 text-white px-3 py-1 rounded-full text-xs font-medium shadow">{tag}</span>
              ))}
            </div>
            {Array.isArray(session.emotional_analysis?.mood_keywords) && session.emotional_analysis.mood_keywords.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {session.emotional_analysis.mood_keywords.map((mood, idx) => (
                  <span key={mood+idx} className="bg-[#6B4EFF]/30 text-[#D1D5DB] px-2 py-1 rounded-full text-xs font-medium">{mood}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      {sessions.length === 0 && (
        <div className="text-[#D1D5DB] text-lg mt-12 text-center">No sessions found.</div>
      )}
    </div>
  );
} 