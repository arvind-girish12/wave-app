"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "../../../utils/supabaseClient";
import { CheckCircleIcon, CloudIcon, SparklesIcon } from '@heroicons/react/24/solid';

export default function SessionDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchSession = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("sessions")
        .select("*")
        .eq("id", id)
        .single();
      if (!error) setSession(data);
      setLoading(false);
    };
    fetchSession();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-purple-100 via-purple-200 to-purple-300">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-wave-offwhite">
        <div className="text-wave-forest text-xl">Session not found.</div>
      </div>
    );
  }

  const analysis = session;

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-purple-100 via-purple-200 to-purple-300 p-8">
      <div className="w-full max-w-2xl flex flex-col items-center gap-8 bg-white/80 rounded-2xl shadow-xl p-8 border-2 border-purple-200">
        {/* Topic */}
        <div className="w-full flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-purple-900">Session Details</h1>
          <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
            {analysis.agent_type}
          </span>
        </div>
        <div className="w-full text-purple-700 text-sm mb-2">
          {new Date(analysis.created_at).toLocaleString()}
        </div>
        <div className="w-full bg-white/90 rounded-xl shadow p-6 mb-2 border border-purple-300">
          <h2 className="text-lg font-semibold text-purple-900 mb-2 flex items-center gap-2">
            <SparklesIcon className="w-6 h-6 text-purple-500" /> <span className="text-purple-900">Today, you felt…</span>
          </h2>
          <p className="text-purple-800 text-base">{analysis.transcript_summary?.summary || '—'}</p>
        </div>

        {/* What You Were Carrying */}
        {Array.isArray(analysis.emotional_analysis?.primary_emotions) && analysis.emotional_analysis.primary_emotions.length > 0 && (
          <div className="w-full mb-2">
            <h3 className="text-md font-semibold text-purple-900 mb-3">What You Were Carrying</h3>
            <div className="flex flex-wrap gap-4">
              {analysis.emotional_analysis.primary_emotions.map((emotion, idx) => (
                <div key={emotion+idx} className="flex flex-col items-center">
                  <div className="rounded-full bg-purple-300 shadow p-4 text-2xl mb-1">
                    {emotion === 'anxious' && '😰'}
                    {emotion === 'sad' || emotion === 'sadness' ? '😢' : ''}
                    {emotion === 'tired' && '😴'}
                    {emotion === 'hopeful' && '😊'}
                    {emotion === 'frustrated' && '😠'}
                    {emotion === 'overwhelmed' && '😵‍💫'}
                    {emotion === 'self-critical' && '🤔'}
                    {emotion === 'stressed' || emotion === 'stress' ? '😣' : ''}
                    {emotion === 'rest' && '🛌'}
                  </div>
                  <span className="text-purple-800 text-sm font-medium capitalize">{emotion}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Emotional Weather */}
        {Array.isArray(analysis.emotional_analysis?.mood_keywords) && analysis.emotional_analysis.mood_keywords.length > 0 && (
          <div className="w-full mb-2">
            <h3 className="text-md font-semibold text-purple-900 mb-3">Your Emotional Weather</h3>
            <div className="flex flex-wrap gap-4">
              {analysis.emotional_analysis.mood_keywords.map((mood, idx) => (
                <div key={mood+idx} className="flex flex-col items-center">
                  <CloudIcon className="w-8 h-8 text-purple-500 mb-1" />
                  <span className="text-purple-800 text-sm font-medium capitalize">{mood}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Observations */}
        {analysis.transcript_summary?.key_points && analysis.transcript_summary.key_points.length > 0 && (
          <div className="w-full bg-white/90 rounded-xl shadow p-6 border border-purple-300">
            <h3 className="text-md font-semibold text-purple-900 mb-2">Observations</h3>
            <ul className="list-disc pl-6 text-purple-800/90">
              {analysis.transcript_summary.key_points.map((point, idx) => (
                <li key={idx} className="text-purple-800">{point}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Cognitive Patterns */}
        {(analysis.cognitive_patterns?.thinking_distortions?.length > 0 || analysis.cognitive_patterns?.self_talk_patterns?.length > 0) && (
          <div className="w-full bg-white/90 rounded-xl shadow p-6 border border-purple-300">
            <h3 className="text-md font-semibold text-purple-900 mb-2">Cognitive Patterns</h3>
            {analysis.cognitive_patterns?.thinking_distortions?.length > 0 && (
              <div className="mb-2">
                <span className="font-medium text-purple-900">Thinking Distortions:</span>
                <ul className="list-disc pl-6">
                  {analysis.cognitive_patterns.thinking_distortions.map((d, idx) => (
                    <li key={idx} className="text-purple-800">{d}</li>
                  ))}
                </ul>
              </div>
            )}
            {analysis.cognitive_patterns?.self_talk_patterns?.length > 0 && (
              <div>
                <span className="font-medium text-purple-900">Self-Talk Patterns:</span>
                <ul className="list-disc pl-6">
                  {analysis.cognitive_patterns.self_talk_patterns.map((d, idx) => (
                    <li key={idx} className="text-purple-800">{d}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Triggers Identified */}
        {Array.isArray(analysis.triggers_identified) && analysis.triggers_identified.length > 0 && (
          <div className="w-full bg-white/90 rounded-xl shadow p-6 border border-purple-300">
            <h3 className="text-md font-semibold text-purple-900 mb-2">Triggers Identified</h3>
            <ul className="list-disc pl-6">
              {analysis.triggers_identified.map((trigger, idx) => (
                <li key={idx} className="text-purple-800"><span className="capitalize font-medium text-purple-900">{trigger.type}:</span> {trigger.description}</li>
              ))}
            </ul>
          </div>
        )}

        {/* User Intent */}
        {(analysis.user_intent?.expressed_goals?.length > 0 || analysis.user_intent?.support_requested?.length > 0) && (
          <div className="w-full bg-white/90 rounded-xl shadow p-6 border border-purple-300">
            <h3 className="text-md font-semibold text-purple-900 mb-2">Your Intentions</h3>
            {analysis.user_intent?.expressed_goals?.length > 0 && (
              <div className="mb-2">
                <span className="font-medium text-purple-900">Expressed Goals:</span>
                <ul className="list-disc pl-6">
                  {analysis.user_intent.expressed_goals.map((goal, idx) => (
                    <li key={idx} className="text-purple-800">{goal}</li>
                  ))}
                </ul>
              </div>
            )}
            {analysis.user_intent?.support_requested?.length > 0 && (
              <div>
                <span className="font-medium text-purple-900">Support Requested:</span>
                <ul className="list-disc pl-6">
                  {analysis.user_intent.support_requested.map((req, idx) => (
                    <li key={idx} className="text-purple-800">{req}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Recommendations / Tiny Mission */}
        {analysis.recommendations && (
          <div className="w-full bg-white/90 rounded-xl shadow p-6 border border-purple-300">
            <h3 className="text-md font-semibold text-purple-900 mb-2">Tonight's Tiny Mission</h3>
            {Array.isArray(analysis.recommendations.exercises) && analysis.recommendations.exercises.length > 0 && (
              <ul className="mb-2 flex flex-wrap gap-3">
                {analysis.recommendations.exercises.map((ex, idx) => (
                  <li key={idx} className="flex items-center gap-2 bg-purple-200 px-3 py-2 rounded-full text-purple-800 text-sm font-medium shadow">
                    <CheckCircleIcon className="w-4 h-4 text-purple-500" />
                    <span className="text-purple-800">{ex.name}</span> <span className="text-xs text-purple-800/60">({ex.type}, {ex.duration_sec ? `${ex.duration_sec}s` : ex.guide_steps ? `${ex.guide_steps} steps` : ''})</span>
                  </li>
                ))}
              </ul>
            )}
            {analysis.recommendations.journal_prompt && (
              <div className="bg-purple-300/40 rounded p-3 text-purple-800 text-sm italic">
                {analysis.recommendations.journal_prompt}
              </div>
            )}
          </div>
        )}

        {/* Insight Tags */}
        {Array.isArray(analysis.insight_tags) && analysis.insight_tags.length > 0 && (
          <div className="w-full mb-2">
            <h3 className="text-md font-semibold text-purple-900 mb-3">Insight Tags</h3>
            <div className="flex flex-wrap gap-2">
              {analysis.insight_tags.map((tag, idx) => (
                <span key={tag+idx} className="bg-purple-200 text-purple-800 px-3 py-1 rounded-full text-xs font-medium shadow">{tag}</span>
              ))}
            </div>
          </div>
        )}

        {/* Follow Up Suggestions */}
        {Array.isArray(analysis.follow_up_suggestions) && analysis.follow_up_suggestions.length > 0 && (
          <div className="w-full bg-white/90 rounded-xl shadow p-6 border border-purple-300">
            <h3 className="text-md font-semibold text-purple-900 mb-2">Gentle Suggestions for Tomorrow</h3>
            <ul className="list-disc pl-6">
              {analysis.follow_up_suggestions.map((sugg, idx) => (
                <li key={idx} className="text-purple-800">{sugg}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
} 