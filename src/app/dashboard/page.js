"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../utils/supabaseClient";
import { useTheme } from "../../context/ThemeContext";
import OnboardingModal from "../../components/OnboardingModal";
import WaitlistModal from "../../components/WaitlistModal";
import { CheckCircleIcon, CloudIcon, SparklesIcon } from '@heroicons/react/24/solid';
import { FaBars, FaUser, FaCalendarAlt, FaBrain, FaComments, FaBook, FaSeedling } from 'react-icons/fa';
import ShareMood from '../../components/ShareMood';
import { shouldBypassAuthClient } from '../../utils/environment';

const TOUGH_TONGUE_API_TOKEN = 'n5wfYV9ffqSzULGKGaS5X-7XuUf2Svimj46P1Zlbbx4';
const SCENARIO_ID = '681df5ff4e0a1c83aae411ec';

function MicroNudge({ visible, onHide }) {
  useEffect(() => {
    if (!visible) return;
    const timeout = setTimeout(onHide, 8000);
    return () => clearTimeout(timeout);
  }, [visible, onHide]);
  if (!visible) return null;
  return (
    <div style={{ position: 'fixed', left: 0, right: 0, bottom: '4.5rem', zIndex: 60, pointerEvents: 'none' }} className="flex justify-center">
      <div className="bg-[#6B4EFF] text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-fade-in pointer-events-auto">
        <span className="font-medium">Ready to begin? Click the <b>Start</b> button above to begin your first session! <span className='ml-2 text-2xl' role='img' aria-label='upward finger'>☝️</span></span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { theme } = useTheme();
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
  const [showMicroNudge, setShowMicroNudge] = useState(false);
  const sessionStartTimeRef = useRef(null);
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalMinutes: 0,
    averageRating: 0,
    streakDays: 0,
    lastSession: null,
    nextSession: null
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  console.log('Dashboard theme:', theme); // Debug log

  useEffect(() => {
    const checkUser = async () => {
      if (shouldBypassAuthClient()) {
        setLoading(false);
        return;
      }
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

    if (!shouldBypassAuthClient()) {
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
    }
  }, [router]);

  useEffect(() => {
    if (user) {
      // Fetch user stats
      const fetchStats = async () => {
        const { data: sessions } = await supabase
          .from('sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (sessions) {
          const totalMinutes = sessions.reduce((acc, session) => acc + (session.duration || 0), 0);
          const totalRating = sessions.reduce((acc, session) => acc + (session.rating || 0), 0);
          const averageRating = sessions.length > 0 ? totalRating / sessions.length : 0;

          // Calculate streak
          let streakDays = 0;
          let currentDate = new Date();
          currentDate.setHours(0, 0, 0, 0);

          for (let i = 0; i < sessions.length; i++) {
            const sessionDate = new Date(sessions[i].created_at);
            sessionDate.setHours(0, 0, 0, 0);

            if (i === 0 && sessionDate.getTime() === currentDate.getTime()) {
              streakDays = 1;
            } else if (i > 0) {
              const prevSessionDate = new Date(sessions[i - 1].created_at);
              prevSessionDate.setHours(0, 0, 0, 0);
              const dayDiff = Math.floor((prevSessionDate - sessionDate) / (1000 * 60 * 60 * 24));
              
              if (dayDiff === 1) {
                streakDays++;
              } else {
                break;
              }
            }
          }

          setStats({
            totalSessions: sessions.length,
            totalMinutes,
            averageRating,
            streakDays,
            lastSession: sessions[0] || null,
            nextSession: null // This would be calculated based on user's schedule
          });
        }
      };

      fetchStats();
    }
  }, [user]);

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
            sessionStartTimeRef.current = Date.now();
            break;
          case 'onStop':
            setLatestSessionId(data.sessionId);
            // Calculate session duration
            const sessionEndTime = Date.now();
            const sessionStartTime = sessionStartTimeRef.current;
            let sessionDuration = null;
            if (sessionStartTime) {
              sessionDuration = Math.floor((sessionEndTime - sessionStartTime) / 1000); // seconds
            }
            // Save session duration to Supabase
            if (data.sessionId && sessionDuration !== null) {
              supabase
                .from('sessions')
                .update({ session_duration: sessionDuration })
                .eq('id', data.sessionId);
            }
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
    setTimeout(() => setShowMicroNudge(true), 400); // Show nudge after modal closes
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
      <div className="flex justify-center items-center w-full h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6B4EFF] shadow-lg"></div>
      </div>
    );
  }

  return (
    <>
      {loading ? (
        <div className="flex justify-center items-center w-full h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6B4EFF] shadow-lg"></div>
        </div>
      ) : analyzing ? (
        <div className="w-full flex flex-col items-center p-4 md:p-10">
          <h1 className={`text-2xl md:text-3xl font-bold mb-4 text-center ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
            We're gently reviewing your session…
          </h1>
          <div className="w-full max-w-md" style={{ background: 'var(--secondary)', borderRadius: '9999px', height: '1rem', marginBottom: '1.5rem', overflow: 'hidden' }}>
            <div style={{ background: 'linear-gradient(to right, #6B4EFF, #F7BFA3)', height: '1rem', borderRadius: '9999px', animation: 'pulse 2s infinite' }}></div>
          </div>
          <p className={`text-lg text-center ${theme === 'light' ? 'text-gray-700' : 'text-white'}`}>
            This may take a moment. Feel free to take a deep breath while we prepare your insights.
          </p>
        </div>
      ) : transcript && analysis ? (
        <div className="w-full flex flex-col items-center gap-8 p-4 md:p-8">
          <ShareMood analysis={analysis} />
          {/* Today, you felt... */}
          <div className={`w-full max-w-2xl mb-2 p-6 rounded-xl shadow ${theme === 'light' ? 'bg-white/80' : 'bg-[#2B176B]/80'}`}>
            <h2 className={`text-lg font-semibold mb-2 flex items-center gap-2 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
              <SparklesIcon className="w-6 h-6" style={{ color: 'var(--secondary)' }} /> <span>Today, you felt…</span>
            </h2>
            <p className={`${theme === 'light' ? 'text-gray-700' : 'text-white'}`}>
              {analysis.transcript_summary?.summary || '—'}
            </p>
          </div>

          {/* What You Were Carrying */}
          {Array.isArray(analysis.emotional_analysis?.primary_emotions) && analysis.emotional_analysis.primary_emotions.length > 0 && (
            <div className="w-full max-w-2xl mb-2">
              <h3 className={`text-md font-semibold mb-3 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                What You Were Carrying
              </h3>
              <div className="flex flex-wrap gap-4">
                {analysis.emotional_analysis.primary_emotions.map((emotion, idx) => (
                  <div key={emotion+idx} className="flex flex-col items-center">
                    <div className={`rounded-full shadow p-4 text-2xl mb-1 ${
                      theme === 'light' 
                        ? 'bg-[#F7BFA3]/30' 
                        : 'bg-[#3B2BFF]/30'
                    }`}>
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
                    <span className={`text-sm font-medium capitalize ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                      {emotion}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Emotional Weather */}
          {Array.isArray(analysis.emotional_analysis?.mood_keywords) && analysis.emotional_analysis.mood_keywords.length > 0 && (
            <div className="w-full max-w-2xl mb-2">
              <h3 className={`text-md font-semibold mb-3 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>Your Emotional Weather</h3>
              <div className="flex flex-wrap gap-4">
                {analysis.emotional_analysis.mood_keywords.map((mood, idx) => (
                  <div key={mood+idx} className="flex flex-col items-center">
                    <CloudIcon className="w-8 h-8 text-[#6B4EFF] mb-1" />
                    <span className={`text-sm font-medium capitalize ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>{mood}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Observations */}
          {analysis.transcript_summary?.key_points && analysis.transcript_summary.key_points.length > 0 && (
            <div className={`w-full max-w-2xl rounded-xl shadow p-6 border ${theme === 'light' ? 'bg-white/80 border-[#F7BFA3]' : 'bg-[#2B176B]/80 border-[#6B4EFF]'}`}>
              <h3 className={`text-md font-semibold mb-2 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>Observations</h3>
              <ul className={`list-disc pl-6 ${theme === 'light' ? 'text-gray-700' : 'text-white/90'}`}>
                {analysis.transcript_summary.key_points.map((point, idx) => (
                  <li key={idx} className={theme === 'light' ? 'text-gray-700' : 'text-white'}>{point}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Cognitive Patterns */}
          {(analysis.cognitive_patterns?.thinking_distortions?.length > 0 || analysis.cognitive_patterns?.self_talk_patterns?.length > 0) && (
            <div className={`w-full max-w-2xl rounded-xl shadow p-6 border ${theme === 'light' ? 'bg-white/80 border-[#F7BFA3]' : 'bg-[#2B176B]/80 border-[#6B4EFF]'}`}>
              <h3 className={`text-md font-semibold mb-2 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>Cognitive Patterns</h3>
              {analysis.cognitive_patterns?.thinking_distortions?.length > 0 && (
                <div className="mb-2">
                  <span className={`font-medium ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>Thinking Distortions:</span>
                  <ul className="list-disc pl-6">
                    {analysis.cognitive_patterns.thinking_distortions.map((d, idx) => (
                      <li key={idx} className={theme === 'light' ? 'text-gray-700' : 'text-white'}>{d}</li>
                    ))}
                  </ul>
                </div>
              )}
              {analysis.cognitive_patterns?.self_talk_patterns?.length > 0 && (
                <div>
                  <span className={`font-medium ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>Self-Talk Patterns:</span>
                  <ul className="list-disc pl-6">
                    {analysis.cognitive_patterns.self_talk_patterns.map((d, idx) => (
                      <li key={idx} className={theme === 'light' ? 'text-gray-700' : 'text-white'}>{d}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Triggers Identified */}
          {Array.isArray(analysis.triggers_identified) && analysis.triggers_identified.length > 0 && (
            <div className={`w-full max-w-2xl rounded-xl shadow p-6 border ${theme === 'light' ? 'bg-white/80 border-[#F7BFA3]' : 'bg-[#2B176B]/80 border-[#6B4EFF]'}`}>
              <h3 className={`text-md font-semibold mb-2 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>Triggers Identified</h3>
              <ul className="list-disc pl-6">
                {analysis.triggers_identified.map((trigger, idx) => (
                  <li key={idx} className={theme === 'light' ? 'text-gray-700' : 'text-white'}>
                    <span className={`capitalize font-medium ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>{trigger.type}:</span> {trigger.description}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* User Intent */}
          {(analysis.user_intent?.expressed_goals?.length > 0 || analysis.user_intent?.support_requested?.length > 0) && (
            <div className={`w-full max-w-2xl rounded-xl shadow p-6 border ${theme === 'light' ? 'bg-white/80 border-[#F7BFA3]' : 'bg-[#2B176B]/80 border-[#6B4EFF]'}`}>
              <h3 className={`text-md font-semibold mb-2 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>Your Intentions</h3>
              {analysis.user_intent?.expressed_goals?.length > 0 && (
                <div className="mb-2">
                  <span className={`font-medium ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>Expressed Goals:</span>
                  <ul className="list-disc pl-6">
                    {analysis.user_intent.expressed_goals.map((goal, idx) => (
                      <li key={idx} className={theme === 'light' ? 'text-gray-700' : 'text-white'}>{goal}</li>
                    ))}
                  </ul>
                </div>
              )}
              {analysis.user_intent?.support_requested?.length > 0 && (
                <div>
                  <span className={`font-medium ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>Support Requested:</span>
                  <ul className="list-disc pl-6">
                    {analysis.user_intent.support_requested.map((req, idx) => (
                      <li key={idx} className={theme === 'light' ? 'text-gray-700' : 'text-white'}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Recommendations / Tiny Mission */}
          {analysis.recommendations && (
            <div className={`w-full max-w-2xl rounded-xl shadow p-6 border ${theme === 'light' ? 'bg-white/80 border-[#F7BFA3]' : 'bg-[#2B176B]/80 border-[#6B4EFF]'}`}>
              <h3 className={`text-md font-semibold mb-2 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>Tonight's Tiny Mission</h3>
              {Array.isArray(analysis.recommendations.exercises) && analysis.recommendations.exercises.length > 0 && (
                <ul className="mb-2 flex flex-wrap gap-3">
                  {analysis.recommendations.exercises.map((ex, idx) => (
                    <li key={idx} className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium shadow ${
                      theme === 'light' 
                        ? 'bg-[#F7BFA3]/40 text-gray-800' 
                        : 'bg-[#3B2BFF]/30 text-white'
                    }`}>
                      <CheckCircleIcon className="w-4 h-4 text-[#6B4EFF]" />
                      <span className={theme === 'light' ? 'text-gray-800' : 'text-white'}>{ex.name}</span> 
                      <span className={`text-xs ${theme === 'light' ? 'text-gray-600' : 'text-white/60'}`}>
                        ({ex.type}, {ex.duration_sec ? `${ex.duration_sec}s` : ex.guide_steps ? `${ex.guide_steps} steps` : ''})
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              {analysis.recommendations.journal_prompt && (
                <div className={`rounded p-3 text-sm italic ${
                  theme === 'light' 
                    ? 'bg-[#F7BFA3]/40 text-gray-700' 
                    : 'bg-[#6B4EFF]/40 text-white'
                }`}>
                  {analysis.recommendations.journal_prompt}
                </div>
              )}
            </div>
          )}

          {/* Insight Tags */}
          {Array.isArray(analysis.insight_tags) && analysis.insight_tags.length > 0 && (
            <div className="w-full max-w-2xl mb-2">
              <h3 className={`text-md font-semibold mb-3 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>Insight Tags</h3>
              <div className="flex flex-wrap gap-2">
                {analysis.insight_tags.map((tag, idx) => (
                  <span key={tag+idx} className={`px-3 py-1 rounded-full text-xs font-medium shadow ${
                    theme === 'light' 
                      ? 'bg-[#F7BFA3]/40 text-gray-800' 
                      : 'bg-[#3B2BFF]/30 text-white'
                  }`}>{tag}</span>
                ))}
              </div>
            </div>
          )}

          {/* Follow Up Suggestions */}
          {Array.isArray(analysis.follow_up_suggestions) && analysis.follow_up_suggestions.length > 0 && (
            <div className={`w-full max-w-2xl rounded-xl shadow p-6 border ${theme === 'light' ? 'bg-white/80 border-[#F7BFA3]' : 'bg-[#2B176B]/80 border-[#6B4EFF]'}`}>
              <h3 className={`text-md font-semibold mb-2 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>Gentle Suggestions for Tomorrow</h3>
              <ul className="list-disc pl-6">
                {analysis.follow_up_suggestions.map((sugg, idx) => (
                  <li key={idx} className={theme === 'light' ? 'text-gray-700' : 'text-white'}>{sugg}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        !showOnboarding && !showWaitlist && (
          <>
            <div className="w-full embedded-content flex justify-center">
              <iframe
                ref={iframeRef}
                src={theme === 'light' 
                  ? "https://app.toughtongueai.com/embed/67f654c0f2dd89fc5d2d6043?bg=%23fdfffe&name=Mira&hidePoweredBy=true&skipPrecheck=true&buttonColor=%23c9d7f3&buttonIcon=call&scenarioNameColor=%23c2d3f5&buttonOutline=false"
                  : "https://app.toughtongueai.com/embed/682a1868ae689d4ad1974efc?bg=%23180e32&hidePoweredBy=true&skipPrecheck=true&buttonColor=%23cb96df"
                }
                width="400px"
                height="700px"
                frameBorder="0"
                allow="microphone; camera; display-capture"
                className="rounded-lg shadow-lg"
              />
            </div>
            <MicroNudge visible={showMicroNudge} onHide={() => setShowMicroNudge(false)} />
          </>
        )
      )}
      {showOnboarding && <OnboardingModal onClose={handleCloseOnboarding} />}
      {showWaitlist && <WaitlistModal onClose={() => setShowWaitlist(false)} />}
    </>
  );
} 