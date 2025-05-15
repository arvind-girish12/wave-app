"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../utils/supabaseClient";
import OnboardingModal from "../../components/OnboardingModal";
import DashboardSidebar from "../../components/DashboardSidebar";
import { CheckCircleIcon, CloudIcon, SunIcon, MoonIcon, SparklesIcon } from '@heroicons/react/24/solid';

const TOUGH_TONGUE_API_TOKEN = 'n5wfYV9ffqSzULGKGaS5X-7XuUf2Svimj46P1Zlbbx4';
const SCENARIO_ID = '681df5ff4e0a1c83aae411ec';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [showSession, setShowSession] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [latestSessionId, setLatestSessionId] = useState(null);
  const iframeRef = useRef(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/login");
        return;
      }
      
      setUser(session.user);
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
            // Session started
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
  }, []);

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
      <div className="flex justify-center items-center h-screen bg-wave-offwhite">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-wave-forest"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-wave-offwhite">
      <main className="flex-1 flex flex-col items-center justify-center p-8">
        {loading ? (
          <div className="flex justify-center items-center h-screen bg-wave-offwhite">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-wave-forest"></div>
          </div>
        ) : analyzing ? (
          <div className="w-full max-w-2xl flex flex-col items-center bg-wave-offwhite rounded-2xl shadow-xl p-10">
            <h1 className="text-2xl font-bold text-wave-forest mb-4">We're gently reviewing your session…</h1>
            <div className="w-full bg-wave-green rounded-full h-4 mb-6 overflow-hidden">
              <div className="bg-wave-teal h-4 rounded-full animate-pulse" style={{ width: '100%' }}></div>
            </div>
            <p className="text-wave-forest text-lg">This may take a moment. Feel free to take a deep breath while we prepare your insights.</p>
          </div>
        ) : transcript ? (
          analyzing || !analysis ? (
            <div className="w-full max-w-2xl flex flex-col items-center bg-wave-offwhite rounded-2xl shadow-xl p-10">
              <h1 className="text-2xl font-bold text-wave-forest mb-4">We're gently reviewing your session…</h1>
              <div className="w-full bg-wave-green rounded-full h-4 mb-6 overflow-hidden">
                <div className="bg-wave-teal h-4 rounded-full animate-pulse" style={{ width: '100%' }}></div>
              </div>
              <p className="text-wave-forest text-lg">This may take a moment. Feel free to take a deep breath while we prepare your insights.</p>
            </div>
          ) : (
            <div className="w-full max-w-2xl flex flex-col items-center gap-8 bg-wave-offwhite rounded-2xl shadow-xl p-8">
              {/* Today, you felt... */}
              <div className="w-full bg-white/80 rounded-xl shadow p-6 mb-2 border border-wave-green">
                <h2 className="text-lg font-semibold text-wave-forest mb-2 flex items-center gap-2">
                  <SparklesIcon className="w-6 h-6 text-wave-teal" /> <span className="text-wave-forest">Today, you felt…</span>
                </h2>
                <p className="text-wave-forest text-base">{analysis.transcript_summary?.summary || '—'}</p>
              </div>

              {/* What You Were Carrying */}
              {Array.isArray(analysis.emotional_analysis?.primary_emotions) && analysis.emotional_analysis.primary_emotions.length > 0 && (
                <div className="w-full mb-2">
                  <h3 className="text-md font-semibold text-wave-forest mb-3">What You Were Carrying</h3>
                  <div className="flex flex-wrap gap-4">
                    {analysis.emotional_analysis.primary_emotions.map((emotion, idx) => (
                      <div key={emotion+idx} className="flex flex-col items-center">
                        <div className="rounded-full bg-wave-marker-3 shadow p-4 text-2xl mb-1">
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
                        <span className="text-wave-forest text-sm font-medium capitalize">{emotion}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Emotional Weather */}
              {Array.isArray(analysis.emotional_analysis?.mood_keywords) && analysis.emotional_analysis.mood_keywords.length > 0 && (
                <div className="w-full mb-2">
                  <h3 className="text-md font-semibold text-wave-forest mb-3">Your Emotional Weather</h3>
                  <div className="flex flex-wrap gap-4">
                    {analysis.emotional_analysis.mood_keywords.map((mood, idx) => (
                      <div key={mood+idx} className="flex flex-col items-center">
                        <CloudIcon className="w-8 h-8 text-wave-teal mb-1" />
                        <span className="text-wave-forest text-sm font-medium capitalize">{mood}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Observations */}
              {analysis.transcript_summary?.key_points && analysis.transcript_summary.key_points.length > 0 && (
                <div className="w-full bg-white/80 rounded-xl shadow p-6 border border-wave-green">
                  <h3 className="text-md font-semibold text-wave-forest mb-2">Observations</h3>
                  <ul className="list-disc pl-6 text-wave-forest/90">
                    {analysis.transcript_summary.key_points.map((point, idx) => (
                      <li key={idx} className="text-wave-forest">{point}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Cognitive Patterns */}
              {(analysis.cognitive_patterns?.thinking_distortions?.length > 0 || analysis.cognitive_patterns?.self_talk_patterns?.length > 0) && (
                <div className="w-full bg-white/80 rounded-xl shadow p-6 border border-wave-green">
                  <h3 className="text-md font-semibold text-wave-forest mb-2">Cognitive Patterns</h3>
                  {analysis.cognitive_patterns?.thinking_distortions?.length > 0 && (
                    <div className="mb-2">
                      <span className="font-medium text-wave-forest">Thinking Distortions:</span>
                      <ul className="list-disc pl-6">
                        {analysis.cognitive_patterns.thinking_distortions.map((d, idx) => (
                          <li key={idx} className="text-wave-forest">{d}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {analysis.cognitive_patterns?.self_talk_patterns?.length > 0 && (
                    <div>
                      <span className="font-medium text-wave-forest">Self-Talk Patterns:</span>
                      <ul className="list-disc pl-6">
                        {analysis.cognitive_patterns.self_talk_patterns.map((d, idx) => (
                          <li key={idx} className="text-wave-forest">{d}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Triggers Identified */}
              {Array.isArray(analysis.triggers_identified) && analysis.triggers_identified.length > 0 && (
                <div className="w-full bg-white/80 rounded-xl shadow p-6 border border-wave-green">
                  <h3 className="text-md font-semibold text-wave-forest mb-2">Triggers Identified</h3>
                  <ul className="list-disc pl-6">
                    {analysis.triggers_identified.map((trigger, idx) => (
                      <li key={idx} className="text-wave-forest"><span className="capitalize font-medium text-wave-forest">{trigger.type}:</span> {trigger.description}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* User Intent */}
              {(analysis.user_intent?.expressed_goals?.length > 0 || analysis.user_intent?.support_requested?.length > 0) && (
                <div className="w-full bg-white/80 rounded-xl shadow p-6 border border-wave-green">
                  <h3 className="text-md font-semibold text-wave-forest mb-2">Your Intentions</h3>
                  {analysis.user_intent?.expressed_goals?.length > 0 && (
                    <div className="mb-2">
                      <span className="font-medium text-wave-forest">Expressed Goals:</span>
                      <ul className="list-disc pl-6">
                        {analysis.user_intent.expressed_goals.map((goal, idx) => (
                          <li key={idx} className="text-wave-forest">{goal}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {analysis.user_intent?.support_requested?.length > 0 && (
                    <div>
                      <span className="font-medium text-wave-forest">Support Requested:</span>
                      <ul className="list-disc pl-6">
                        {analysis.user_intent.support_requested.map((req, idx) => (
                          <li key={idx} className="text-wave-forest">{req}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Recommendations / Tiny Mission */}
              {analysis.recommendations && (
                <div className="w-full bg-white/80 rounded-xl shadow p-6 border border-wave-green">
                  <h3 className="text-md font-semibold text-wave-forest mb-2">Tonight's Tiny Mission</h3>
                  {Array.isArray(analysis.recommendations.exercises) && analysis.recommendations.exercises.length > 0 && (
                    <ul className="mb-2 flex flex-wrap gap-3">
                      {analysis.recommendations.exercises.map((ex, idx) => (
                        <li key={idx} className="flex items-center gap-2 bg-wave-marker-1 px-3 py-2 rounded-full text-wave-forest text-sm font-medium shadow">
                          <CheckCircleIcon className="w-4 h-4 text-wave-teal" />
                          <span className="text-wave-forest">{ex.name}</span> <span className="text-xs text-wave-forest/60">({ex.type}, {ex.duration_sec ? `${ex.duration_sec}s` : ex.guide_steps ? `${ex.guide_steps} steps` : ''})</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {analysis.recommendations.journal_prompt && (
                    <div className="bg-wave-green/40 rounded p-3 text-wave-forest text-sm italic">
                      {analysis.recommendations.journal_prompt}
                    </div>
                  )}
                </div>
              )}

              {/* Insight Tags */}
              {Array.isArray(analysis.insight_tags) && analysis.insight_tags.length > 0 && (
                <div className="w-full mb-2">
                  <h3 className="text-md font-semibold text-wave-forest mb-3">Insight Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.insight_tags.map((tag, idx) => (
                      <span key={tag+idx} className="bg-wave-marker-1 text-wave-forest px-3 py-1 rounded-full text-xs font-medium shadow">{tag}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Follow Up Suggestions */}
              {Array.isArray(analysis.follow_up_suggestions) && analysis.follow_up_suggestions.length > 0 && (
                <div className="w-full bg-white/80 rounded-xl shadow p-6 border border-wave-green">
                  <h3 className="text-md font-semibold text-wave-forest mb-2">Gentle Suggestions for Tomorrow</h3>
                  <ul className="list-disc pl-6">
                    {analysis.follow_up_suggestions.map((sugg, idx) => (
                      <li key={idx} className="text-wave-forest">{sugg}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )
        ) : !showSession ? (
          <div className="w-full max-w-2xl flex flex-col items-center">
            <h1 className="text-2xl font-bold text-wave-forest mb-8">
              {sessionComplete ? "Great job! Let's analyze your session" : "Perfect timing!"}
            </h1>
            <div className="w-48 h-48 rounded-full bg-yellow-400 mb-8 flex items-center justify-center shadow-lg">
              {sessionComplete && (
                <div className="text-4xl">🎉</div>
              )}
            </div>
            <div className="flex flex-col gap-4 w-full max-w-md">
              <button 
                onClick={sessionComplete ? handleAnalyzeSession : handleBeginSession}
                className="bg-wave-teal text-white font-semibold py-3 rounded-lg shadow hover:bg-wave-forest transition-colors"
              >
                {sessionComplete ? "Analyze Session" : "Begin Session"}
              </button>
              <div className="flex gap-2 justify-center">
                <button className="bg-gray-100 text-wave-forest px-4 py-1 rounded font-medium">Classic</button>
                <button className="bg-gray-200 text-wave-forest px-4 py-1 rounded font-medium opacity-60 cursor-not-allowed">Guided</button>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-4xl">
            <iframe
              ref={iframeRef}
              src={`https://app.toughtongueai.com/embed/681df5ff4e0a1c83aae411ec?bg=transparent&skipPrecheck=true&userEmail=${user?.email}`}
              width="100%"
              height="700px"
              frameBorder="0"
              allow="microphone; camera; display-capture"
              className="rounded-lg shadow-lg"
            />
          </div>
        )}
      </main>
      {showOnboarding && <OnboardingModal onClose={handleCloseOnboarding} />}
    </div>
  );
} 