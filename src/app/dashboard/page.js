"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../utils/supabaseClient";
import OnboardingModal from "../../components/OnboardingModal";
import WaitlistModal from "../../components/WaitlistModal";
import DashboardSidebar from "../../components/DashboardSidebar";
import { CheckCircleIcon, CloudIcon, SunIcon, MoonIcon, SparklesIcon } from '@heroicons/react/24/solid';

const TOUGH_TONGUE_API_TOKEN = 'n5wfYV9ffqSzULGKGaS5X-7XuUf2Svimj46P1Zlbbx4';
const SCENARIO_ID = '681df5ff4e0a1c83aae411ec';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [showSession, setShowSession] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [latestSessionId, setLatestSessionId] = useState(null);
  const iframeRef = useRef(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/login");
        return;
      }
      
      setUser(session.user);
      
      // Fetch user profile to check session count
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();
      
      if (error) {
        console.error('Error fetching user profile:', error);
      } else {
        setUserProfile(profile);
      }
      
      setLoading(false);
    };

    checkUser();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT") {
          router.push("/login");
        } else if (session) {
          setUser(session.user);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  // Add event listener for iframe messages
  useEffect(() => {
    const handleMessage = (event) => {
      const data = event.data;
      if (data && data.event) {
        switch (data.event) {
          case 'onStart':
            // Check if user has reached session limit
            if (userProfile && userProfile.session_count >= userProfile.session_limit) {
              setShowWaitlist(true);
              return;
            }
            break;
          case 'onStop':
            setLatestSessionId(data.sessionId);
            // Start analyzing after 15 seconds
            setTimeout(async () => {
              setShowSession(false);
              setAnalyzing(true);
              // Fetch session details
              try {
                const response = await fetch('/api/toughtongue', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ latestSessionId: data.sessionId })
                });
                if (response.ok) {
                  const result = await response.json();
                  // Assume transcript_content is in result.latestSession.transcript_content
                  setTranscript(result.latestSession?.transcript_content || "No transcript found.");
                } else {
                  setTranscript("Failed to fetch session details.");
                }
              } catch (err) {
                setTranscript("Error fetching session details.");
              }
              setAnalyzing(false);
              setSessionComplete(true);
            }, 15000);
            break;
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [userProfile]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleCloseOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem('hasSeenOnboarding', 'true');
  };

  const handleBeginSession = () => {
    setShowSession(true);
    setSessionComplete(false);
    setLatestSessionId(null);
  };

  const handleAnalyzeSession = async () => {
    try {
      // Call our internal API endpoint with the latest session ID
      const response = await fetch('/api/toughtongue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ latestSessionId })
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch session data');
      }
      const data = await response.json();
      console.log('Session Analysis:', data);
    } catch (error) {
      console.error('Error fetching analysis data:', error);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
      if (hasSeenOnboarding === 'true') {
        setShowOnboarding(false);
      }
    }
  }, []);

  // When transcript is set, immediately analyze it
  useEffect(() => {
    if (transcript && latestSessionId && !analysis && !analyzing && user) {
      setAnalyzing(true);
      (async () => {
        try {
          const response = await fetch('/api/analyse-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ transcript_content: transcript, session_id: latestSessionId, user_id: user.id })
          });
          if (response.ok) {
            const result = await response.json();
            setAnalysis(result.analysis);
          } else {
            setAnalysis({ error: 'Failed to analyze session.' });
          }
        } catch (err) {
          setAnalysis({ error: 'Error analyzing session.' });
        }
        setAnalyzing(false);
      })();
    }
  }, [transcript, latestSessionId, analysis, analyzing, user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-[#0A0613] via-[#2B176B] to-[#3B2BFF] ml-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6B4EFF] shadow-lg"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex ml-64" style={{ background: 'linear-gradient(135deg, #0A0613 0%, #2B176B 40%, #3B2BFF 70%, #F7BFA3 100%)' }}>
      <main className="flex-1 flex flex-col items-center justify-center p-8">
        {loading ? (
          <div className="flex justify-center items-center h-screen bg-gradient-to-br from-[#0A0613] via-[#2B176B] to-[#3B2BFF] ml-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6B4EFF] shadow-lg"></div>
          </div>
        ) : analyzing ? (
          <div className="w-full max-w-2xl flex flex-col items-center bg-[#1a1333]/80 rounded-3xl shadow-2xl p-10 border border-[#3B2BFF]">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-4 text-center">We're gently reviewing your session…</h1>
            <div className="w-full bg-[#3B2BFF]/30 rounded-full h-4 mb-6 overflow-hidden">
              <div className="bg-gradient-to-r from-[#6B4EFF] to-[#F7BFA3] h-4 rounded-full animate-pulse" style={{ width: '100%' }}></div>
            </div>
            <p className="text-[#D1D5DB] text-lg text-center">This may take a moment. Feel free to take a deep breath while we prepare your insights.</p>
          </div>
        ) : transcript && analysis ? (
          <div className="w-full max-w-2xl flex flex-col items-center gap-8 bg-[#1a1333]/80 rounded-3xl shadow-2xl p-8 border border-[#3B2BFF]">
            {/* Today, you felt... */}
            <div className="w-full bg-[#2B176B]/80 rounded-xl shadow p-6 mb-2 border border-[#6B4EFF]">
              <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                <SparklesIcon className="w-6 h-6 text-[#D1D5DB]" /> <span className="text-white">Today, you felt…</span>
              </h2>
              <p className="text-white text-base">{analysis.transcript_summary?.summary || '—'}</p>
            </div>

            {/* What You Were Carrying */}
            {Array.isArray(analysis.emotional_analysis?.primary_emotions) && analysis.emotional_analysis.primary_emotions.length > 0 && (
              <div className="w-full mb-2">
                <h3 className="text-md font-semibold text-white mb-3">What You Were Carrying</h3>
                <div className="flex flex-wrap gap-4">
                  {analysis.emotional_analysis.primary_emotions.map((emotion, idx) => (
                    <div key={emotion+idx} className="flex flex-col items-center">
                      <div className="rounded-full bg-[#3B2BFF]/30 shadow p-4 text-2xl mb-1">
                        {/* Emoji or icon can be mapped here if desired */}
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
                      <span className="text-white text-sm font-medium capitalize">{emotion}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Emotional Weather */}
            {Array.isArray(analysis.emotional_analysis?.mood_keywords) && analysis.emotional_analysis.mood_keywords.length > 0 && (
              <div className="w-full mb-2">
                <h3 className="text-md font-semibold text-white mb-3">Your Emotional Weather</h3>
                <div className="flex flex-wrap gap-4">
                  {analysis.emotional_analysis.mood_keywords.map((mood, idx) => (
                    <div key={mood+idx} className="flex flex-col items-center">
                      <CloudIcon className="w-8 h-8 text-[#6B4EFF] mb-1" />
                      <span className="text-white text-sm font-medium capitalize">{mood}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Observations */}
            {analysis.transcript_summary?.key_points && analysis.transcript_summary.key_points.length > 0 && (
              <div className="w-full bg-[#2B176B]/80 rounded-xl shadow p-6 border border-[#6B4EFF]">
                <h3 className="text-md font-semibold text-white mb-2">Observations</h3>
                <ul className="list-disc pl-6 text-white/90">
                  {analysis.transcript_summary.key_points.map((point, idx) => (
                    <li key={idx} className="text-white">{point}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Cognitive Patterns */}
            {(analysis.cognitive_patterns?.thinking_distortions?.length > 0 || analysis.cognitive_patterns?.self_talk_patterns?.length > 0) && (
              <div className="w-full bg-[#2B176B]/80 rounded-xl shadow p-6 border border-[#6B4EFF]">
                <h3 className="text-md font-semibold text-white mb-2">Cognitive Patterns</h3>
                {analysis.cognitive_patterns?.thinking_distortions?.length > 0 && (
                  <div className="mb-2">
                    <span className="font-medium text-white">Thinking Distortions:</span>
                    <ul className="list-disc pl-6">
                      {analysis.cognitive_patterns.thinking_distortions.map((d, idx) => (
                        <li key={idx} className="text-white">{d}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {analysis.cognitive_patterns?.self_talk_patterns?.length > 0 && (
                  <div>
                    <span className="font-medium text-white">Self-Talk Patterns:</span>
                    <ul className="list-disc pl-6">
                      {analysis.cognitive_patterns.self_talk_patterns.map((d, idx) => (
                        <li key={idx} className="text-white">{d}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Triggers Identified */}
            {Array.isArray(analysis.triggers_identified) && analysis.triggers_identified.length > 0 && (
              <div className="w-full bg-[#2B176B]/80 rounded-xl shadow p-6 border border-[#6B4EFF]">
                <h3 className="text-md font-semibold text-white mb-2">Triggers Identified</h3>
                <ul className="list-disc pl-6">
                  {analysis.triggers_identified.map((trigger, idx) => (
                    <li key={idx} className="text-white"><span className="capitalize font-medium text-white">{trigger.type}:</span> {trigger.description}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* User Intent */}
            {(analysis.user_intent?.expressed_goals?.length > 0 || analysis.user_intent?.support_requested?.length > 0) && (
              <div className="w-full bg-[#2B176B]/80 rounded-xl shadow p-6 border border-[#6B4EFF]">
                <h3 className="text-md font-semibold text-white mb-2">Your Intentions</h3>
                {analysis.user_intent?.expressed_goals?.length > 0 && (
                  <div className="mb-2">
                    <span className="font-medium text-white">Expressed Goals:</span>
                    <ul className="list-disc pl-6">
                      {analysis.user_intent.expressed_goals.map((goal, idx) => (
                        <li key={idx} className="text-white">{goal}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {analysis.user_intent?.support_requested?.length > 0 && (
                  <div>
                    <span className="font-medium text-white">Support Requested:</span>
                    <ul className="list-disc pl-6">
                      {analysis.user_intent.support_requested.map((req, idx) => (
                        <li key={idx} className="text-white">{req}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Recommendations / Tiny Mission */}
            {analysis.recommendations && (
              <div className="w-full bg-[#2B176B]/80 rounded-xl shadow p-6 border border-[#6B4EFF]">
                <h3 className="text-md font-semibold text-white mb-2">Tonight's Tiny Mission</h3>
                {Array.isArray(analysis.recommendations.exercises) && analysis.recommendations.exercises.length > 0 && (
                  <ul className="mb-2 flex flex-wrap gap-3">
                    {analysis.recommendations.exercises.map((ex, idx) => (
                      <li key={idx} className="flex items-center gap-2 bg-[#3B2BFF]/30 px-3 py-2 rounded-full text-white text-sm font-medium shadow">
                        <CheckCircleIcon className="w-4 h-4 text-[#6B4EFF]" />
                        <span className="text-white">{ex.name}</span> <span className="text-xs text-white/60">({ex.type}, {ex.duration_sec ? `${ex.duration_sec}s` : ex.guide_steps ? `${ex.guide_steps} steps` : ''})</span>
                      </li>
                    ))}
                  </ul>
                )}
                {analysis.recommendations.journal_prompt && (
                  <div className="bg-[#6B4EFF]/40 rounded p-3 text-white text-sm italic">
                    {analysis.recommendations.journal_prompt}
                  </div>
                )}
              </div>
            )}

            {/* Insight Tags */}
            {Array.isArray(analysis.insight_tags) && analysis.insight_tags.length > 0 && (
              <div className="w-full mb-2">
                <h3 className="text-md font-semibold text-white mb-3">Insight Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.insight_tags.map((tag, idx) => (
                    <span key={tag+idx} className="bg-[#3B2BFF]/30 text-white px-3 py-1 rounded-full text-xs font-medium shadow">{tag}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Follow Up Suggestions */}
            {Array.isArray(analysis.follow_up_suggestions) && analysis.follow_up_suggestions.length > 0 && (
              <div className="w-full bg-[#2B176B]/80 rounded-xl shadow p-6 border border-[#6B4EFF]">
                <h3 className="text-md font-semibold text-white mb-2">Gentle Suggestions for Tomorrow</h3>
                <ul className="list-disc pl-6">
                  {analysis.follow_up_suggestions.map((sugg, idx) => (
                    <li key={idx} className="text-white">{sugg}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          !showOnboarding && !showWaitlist && (
            <div className="w-full max-w-4xl embedded-content flex justify-center">
              <iframe
                ref={iframeRef}
                src="https://app.toughtongueai.com/embed/681df5ff4e0a1c83aae411ec?bg=%23170e32&skipPrecheck=true&buttonColor=%23d1c1d7"
                width="100%"
                height="700px"
                frameBorder="0"
                allow="microphone; camera; display-capture"
                className="rounded-lg shadow-lg"
              />
            </div>
          )
        )}
      </main>
      {showOnboarding && <OnboardingModal onClose={handleCloseOnboarding} />}
      {showWaitlist && <WaitlistModal onClose={() => setShowWaitlist(false)} />}
    </div>
  );
} 