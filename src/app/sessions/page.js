"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../utils/supabaseClient";
import { FaBars } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';

export default function SessionsPage() {
  const { theme } = useTheme();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      <div className="flex justify-center items-center w-full h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6B4EFF] shadow-lg"></div>
      </div>
    );
  }

  // Define theme-based classes
  const titleClasses = theme === 'light' 
    ? 'text-gray-900' 
    : 'text-white';
    
  const cardClasses = theme === 'light'
    ? 'bg-white/80 border-[#F7BFA3] text-gray-900'
    : 'bg-[#1a1333]/80 border-[#6B4EFF] text-white';
    
  const agentTypeClasses = theme === 'light'
    ? 'bg-[#F7BFA3]/30 text-gray-700'
    : 'bg-[#2B176B]/80 text-[#D1D5DB]';
    
  const dateClasses = theme === 'light'
    ? 'text-gray-600'
    : 'text-[#D1D5DB]';
    
  const sessionTitleClasses = theme === 'light'
    ? 'text-gray-900'
    : 'text-white';
    
  const summaryClasses = theme === 'light'
    ? 'text-gray-700'
    : 'text-[#D1D5DB]';
    
  const tagClasses = theme === 'light'
    ? 'bg-[#F7BFA3]/40 text-gray-800'
    : 'bg-[#3B2BFF]/30 text-white';
    
  const moodClasses = theme === 'light'
    ? 'bg-[#F7BFA3]/20 text-gray-600'
    : 'bg-[#6B4EFF]/30 text-[#D1D5DB]';
    
  const emptyStateClasses = theme === 'light'
    ? 'text-gray-600'
    : 'text-[#D1D5DB]';

  return (
    <div className="w-full h-full flex-1 p-4 md:p-8">
      <h1 className={`text-2xl md:text-3xl font-bold mb-6 md:mb-8 ${titleClasses}`}>
        Your Sessions
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
        {sessions.map((session) => (
          <div
            key={session.id}
            className={`rounded-2xl shadow-xl p-4 md:p-6 border-2 flex flex-col gap-4 hover:shadow-2xl transition-shadow cursor-pointer ${cardClasses}`}
            onClick={() => router.push(`/sessions/${session.id}`)}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs px-3 py-1 rounded-full ${agentTypeClasses}`}>
                {session.agent_type}
              </span>
              <span className={`text-xs ${dateClasses}`}>
                {new Date(session.created_at).toLocaleString()}
              </span>
            </div>
            <h2 className={`text-lg md:text-xl font-semibold mb-2 line-clamp-1 ${sessionTitleClasses}`}>
              {session.topic || 'Untitled Session'}
            </h2>
            <p className={`text-sm md:text-base line-clamp-2 mb-2 ${summaryClasses}`}>
              {session.transcript_summary?.summary || '—'}
            </p>
            <div className="flex flex-wrap gap-2 mb-2">
              {Array.isArray(session.insight_tags) && session.insight_tags.map((tag, idx) => (
                <span key={tag+idx} className={`px-3 py-1 rounded-full text-xs font-medium shadow ${tagClasses}`}>
                  {tag}
                </span>
              ))}
            </div>
            {Array.isArray(session.emotional_analysis?.mood_keywords) && session.emotional_analysis.mood_keywords.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {session.emotional_analysis.mood_keywords.map((mood, idx) => (
                  <span key={mood+idx} className={`px-2 py-1 rounded-full text-xs font-medium ${moodClasses}`}>
                    {mood}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      {sessions.length === 0 && (
        <div className={`text-lg mt-12 text-center ${emptyStateClasses}`}>
          No sessions found.
        </div>
      )}
    </div>
  );
} 