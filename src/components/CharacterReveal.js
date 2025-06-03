"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { FaDice, FaCloud, FaDove, FaThumbsUp, FaThumbsDown, FaMicrophone, FaMicrophoneSlash, FaArrowRight } from 'react-icons/fa';
import Typewriter from 'typewriter-effect';
import { supabase } from '../utils/supabaseClient';
import FeedbackModal from './FeedbackModal';

const MAX_SKIPS = 3;

const characterIframeMap = {
  1: "https://app.toughtongueai.com/embed/67f654c0f2dd89fc5d2d6043?bg=%23fdfffe&name=Mira&hidePoweredBy=true&skipPrecheck=true&buttonColor=%23c9d7f3&buttonIcon=call&scenarioNameColor=%23c2d3f5&buttonOutline=false",
  2: "https://app.toughtongueai.com/embed/68355dcd12d822723ba97f50?bg=%23f2e9d4&skipPrecheck=true&buttonColor=%23fac342&buttonIcon=call&buttonOutline=false&scenarioNameColor=%23c9b382&buttonOutline=false",
  3: "https://app.toughtongueai.com/embed/683722168d5a66f1aaac837b?bg=%23211641&skipPrecheck=true&buttonColor=%23be618c&buttonOutline=false",
  4: "https://app.toughtongueai.com/embed/68395a3fdb1f6ef1edd06a92?bg=%23fcfffa&skipPrecheck=true&buttonColor=%23a8b0bd&buttonOutline=false&scenarioNameColor=%23898b89&buttonOutline=false"
};

const characterImageMap = {
  1: '/mira.jpg',
  2: '/novajames.gif',
  3: '/seraphina.jpg',
  4: '/maccallan.jpg',
};

export default function CharacterReveal() {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [currentCharacter, setCurrentCharacter] = useState(null);
  const [skipsRemaining, setSkipsRemaining] = useState(MAX_SKIPS);
  const [showFeedback, setShowFeedback] = useState(false);
  const [userPreferenceQuery, setUserPreferenceQuery] = useState('');
  const [likedLastCharacter, setLikedLastCharacter] = useState(null);
  const [startConversation, setStartConversation] = useState(false);
  const [micPermission, setMicPermission] = useState(null);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const iframeRef = useRef(null);
  const [characters, setCharacters] = useState([]);
  const wakeLockRef = useRef(null);
  const sessionInfoRef = useRef({
    startTime: null,
    endTime: null,
    sessionIdText: null,
    characterId: null,
    userEmail: null,
    timeoutId: null,
  });
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [lastSessionIdText, setLastSessionIdText] = useState(null);

  useEffect(() => {
    async function fetchCharacters() {
      const res = await fetch('/api/characters');
      const data = await res.json();
      setCharacters(data);
      if (data && data.length) {
        setCurrentCharacter(data[Math.floor(Math.random() * data.length)]);
      }
    }
    fetchCharacters();
  }, []);

  useEffect(() => {
    async function requestWakeLock() {
      try {
        if ('wakeLock' in navigator) {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
        }
      } catch (err) {
        console.error('Wake Lock error:', err);
      }
    }

    function releaseWakeLock() {
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    }

    async function fetchUserEmail() {
      let userEmail = 'localhost'; // default fallback
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.email) {
          userEmail = session.user.email;
        }
      } catch (e) {
        // ignore, fallback to localhost
      }
      sessionInfoRef.current.userEmail = userEmail; // always set, even if async fails
      console.log('[CharacterReveal] Using userEmail:', userEmail);
      return userEmail;
    }

    async function handleMessage(event) {
      // Optional: verify the origin for security
      // if (event.origin !== 'https://app.toughtongueai.com') return;
      const data = event.data;
      if (data && data.event) {
        switch (data.event) {
          case 'onStart':
            console.log('[CharacterReveal] onStart event received:', data);
            sessionInfoRef.current.startTime = Date.now();
            sessionInfoRef.current.sessionIdText = data.sessionId || null;
            sessionInfoRef.current.characterId = currentCharacter?.id;
            fetchUserEmail(); // don't await, just call to set ref as soon as possible
            requestWakeLock();
            break;
          case 'onStop':
            console.log('[CharacterReveal] onStop event received:', data);
            sessionInfoRef.current.endTime = Date.now();
            const durationSeconds = Math.floor((sessionInfoRef.current.endTime - sessionInfoRef.current.startTime) / 1000);
            const userEmail = sessionInfoRef.current.userEmail || 'localhost';
            const payload = {
              user_email: userEmail,
              character_id: sessionInfoRef.current.characterId,
              session_id: sessionInfoRef.current.sessionIdText,
              started_at: new Date(sessionInfoRef.current.startTime).toISOString(),
              ended_at: new Date(sessionInfoRef.current.endTime).toISOString(),
              duration_seconds: durationSeconds,
            };
            console.log('[CharacterReveal] Scheduling API call to /api/character-session in 10s with payload:', payload);
            sessionInfoRef.current.timeoutId = setTimeout(async () => {
              console.log('[CharacterReveal] Making API call to /api/character-session...');
              const res = await fetch('/api/character-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
              });
              if (res.ok) {
                setLastSessionIdText(sessionInfoRef.current.sessionIdText);
                setShowFeedbackModal(true);
                console.log('[CharacterReveal] Feedback modal should now be visible.');
              } else {
                console.error('[CharacterReveal] API call failed:', await res.text());
              }
            }, 10000);
            releaseWakeLock();
            break;
        }
      }
    }

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
      releaseWakeLock();
      if (sessionInfoRef.current.timeoutId) clearTimeout(sessionInfoRef.current.timeoutId);
    };
  }, [currentCharacter]);

  const requestMicrophonePermission = async () => {
    try {
      setIsRequestingPermission(true);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicPermission('granted');
      // Stop the stream immediately as we just needed to check permissions
      stream.getTracks().forEach(track => track.stop());
      setStartConversation(true);
    } catch (error) {
      console.error('Microphone permission error:', error);
      setMicPermission('denied');
    } finally {
      setIsRequestingPermission(false);
    }
  };

  const handleStartConversation = () => {
    requestMicrophonePermission();
  };

  const retryMicrophonePermission = () => {
    setMicPermission(null);
    requestMicrophonePermission();
  };

  const handleSkip = () => {
    if (skipsRemaining > 0) {
      setShowFeedback(true);
    }
  };

  const handleFeedback = (liked) => {
    setLikedLastCharacter(liked);
  };

  const matchNewCharacter = () => {
    setShowFeedback(false);
    setLoading(true);
    setSkipsRemaining(prev => prev - 1);
    // Remove current character from the list
    setCharacters(prevChars => prevChars.filter(c => c.id !== currentCharacter.id));
    // Simulate new character loading
    setTimeout(() => {
      setLoading(false);
      setCurrentCharacter(prev => {
        // Pick a new character from the updated list
        const available = characters.filter(c => c.id !== currentCharacter.id);
        return available[Math.floor(Math.random() * available.length)];
      });
    }, 2500);
  };

  const skipCharacter = () => {
    if (characters.length < 2 || skipsRemaining <= 0) return;
    // Remove current character from the list
    const updatedCharacters = characters.filter(c => c.id !== currentCharacter.id);
    setCharacters(updatedCharacters);
    // Pick a new character from the updated list
    const next = updatedCharacters[Math.floor(Math.random() * updatedCharacters.length)];
    setCurrentCharacter(next);
    setShowFeedback(false);
    setStartConversation(false);
    setSkipsRemaining(prev => prev - 1);
  };

  // Feedback modal submit handler
  const handleFeedbackSubmit = async ({ rating, preferDifferent, characterPreference }) => {
    if (!lastSessionIdText) return;
    await fetch('/api/character-session', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: lastSessionIdText,
        rating,
        feedback: preferDifferent ? characterPreference : '',
      }),
    });
    setShowFeedbackModal(false);
  };

  // Loading Screen
  if (!currentCharacter) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center min-h-[80vh]"
      >
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
            scale: { duration: 1.5, repeat: Infinity }
          }}
          className="mb-8"
        >
          <FaDice className="w-16 h-16 text-black" />
        </motion.div>
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[24px] font-semibold text-black"
        >
          Finding someone to talk to
        </motion.h2>
      </motion.div>
    );
  }

  // Character Preview
  return (
    <div className={`relative min-h-screen max-h-screen w-full`}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Clouds */}
        <motion.div
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-4 left-0"
        >
          <FaCloud className={`w-12 h-12 ${theme === 'light' ? 'text-gray-300' : 'text-gray-700'}`} />
        </motion.div>
        <motion.div
          animate={{ x: ['100%', '-100%'] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-10 right-0"
        >
          <FaCloud className={`w-16 h-16 ${theme === 'light' ? 'text-gray-300' : 'text-gray-700'}`} />
        </motion.div>

        {/* Birds */}
        <motion.div
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-2 left-0"
        >
          <FaDove className={`w-8 h-8 ${theme === 'light' ? 'text-gray-400' : 'text-gray-600'}`} />
        </motion.div>
      </div>

      <div className="relative z-10 w-full px-2 md:px-4 py-8 flex-1 h-dvh">
        {/* Skips left icon/counter at the top right */}
        {skipsRemaining > 0 && (
          <>
            <div className="absolute top-2 right-2 flex items-center gap-1 bg-white/70 rounded-full px-3 py-1 shadow text-xs font-semibold text-black z-20">
              <FaDice className="w-3 h-3" />
              Skips left: {skipsRemaining}
            </div>
            <button
              onClick={skipCharacter}
              className="absolute top-10 right-2 z-50 bg-gray-200 text-gray-800 px-5 py-3 rounded-full shadow-lg text-sm font-semibold hover:bg-gray-300 transition flex items-center gap-2"
              aria-label="Skip to next character"
            >
              Skip <FaArrowRight className="w-4 h-4" />
            </button>
          </>
        )}
        <AnimatePresence mode="wait">
          {!showFeedback && !startConversation ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8 mt-16 flex-1"
            >
              {/* Headline */}
              <div className="h-[80px] flex items-center">
                <div className="text-[24px] font-semibold text-black">
                  <Typewriter
                    onInit={(typewriter) => {
                      typewriter
                        .typeString("You've just been matched with someone interesting")
                        .callFunction(() => {
                          setTimeout(() => {
                            typewriter
                              .deleteAll()
                              .typeString("Say Hi to your new listening buddy 👋")
                              .start();
                          }, 1000);
                        })
                        .start();
                    }}
                    options={{
                      delay: 50,
                      cursor: '▋',
                    }}
                  />
                </div>
              </div>

              {/* Character Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="backdrop-blur-lg rounded-2xl p-4 md:p-6 bg-white/30 border border-white/50 w-full h-[360px] md:h-[480px] overflow-y-auto"
              >
                <div className="flex flex-row items-start gap-6 h-full">
                  {/* Avatar Placeholder */}
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#6B4EFF] to-[#F7BFA3] flex items-center justify-center overflow-hidden">
                    {characterImageMap[currentCharacter.id] ? (
                      <img
                        src={characterImageMap[currentCharacter.id]}
                        alt={currentCharacter.name}
                        className="object-cover w-20 h-20 rounded-full"
                      />
                    ) : (
                      <span className="text-2xl font-bold text-white">
                        {currentCharacter.name[0]}
                      </span>
                    )}
                  </div>
                  {/* Character Info */}
                  <div className="space-y-4 flex-1 overflow-y-auto">
                    <div className="text-[20px] font-bold text-black">{currentCharacter.name}</div>
                    <div className="text-[16px] text-black">
                      {currentCharacter.age} years old • From {currentCharacter.country}
                    </div>
                    {currentCharacter.voice_style && (
                      <div className="text-[14px] text-indigo-700 italic">
                        Voice style: {currentCharacter.voice_style}
                      </div>
                    )}
                    <div className="text-[16px] text-gray-800 font-medium">
                      {currentCharacter.description}
                    </div>
                    <div>
                      <div className="font-semibold text-[15px] text-black">Life experiences:</div>
                      <ul className="list-disc ml-5 text-[15px] text-gray-700">
                        {currentCharacter.childhood.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="font-semibold text-[15px] text-black">Cool traits:</div>
                      <ul className="list-disc ml-5 text-[15px] text-gray-700">
                        {currentCharacter.cool_traits.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {currentCharacter.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 rounded-full text-[14px] font-semibold bg-indigo-100 text-indigo-700"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* CTA Button - left aligned, reduced height */}
              <div className="flex justify-start items-center mt-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative px-8 py-3 rounded-xl text-[16px] font-semibold text-white bg-[#6B4EFF] shadow-lg"
                  onClick={handleStartConversation}
                  disabled={isRequestingPermission}
                >
                  <motion.div
                    animate={{
                      boxShadow: [
                        '0 0 0 0 rgba(107, 78, 255, 0.4)',
                        '0 0 0 10px rgba(107, 78, 255, 0)',
                      ],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="absolute inset-0 rounded-xl"
                  />
                  {isRequestingPermission ? (
                    <span className="flex items-center gap-2">
                      <FaMicrophone className="animate-pulse" />
                      Requesting microphone access...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <FaMicrophone />
                      Talk to {currentCharacter.name}
                    </span>
                  )}
                </motion.button>
              </div>
            </motion.div>
          ) : startConversation ? (
            <motion.div
              key="conversation"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full h-[calc(100vh-80px)] flex justify-center items-center"
            >
              {micPermission === 'denied' ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center space-y-4"
                >
                  <FaMicrophoneSlash className="w-16 h-16 text-red-500 mx-auto" />
                  <h2 className="text-[24px] font-semibold text-black">Microphone Access Required</h2>
                  <p className="text-[16px] text-black">
                    Please enable microphone access in your browser settings to start the conversation.
                  </p>
                  <button
                    onClick={retryMicrophonePermission}
                    className="px-6 py-3 rounded-lg bg-[#6B4EFF] text-white font-semibold hover:bg-[#6B4EFF]/90 transition-colors"
                  >
                    Try Again
                  </button>
                </motion.div>
              ) : (
                <iframe
                  ref={iframeRef}
                  src={characterIframeMap[currentCharacter.id]}
                  width="360"
                  height="450"
                  className="rounded-lg shadow-lg w-[360px] md:w-[720px] h-[450px] md:h-[720px]"
                  frameBorder="0"
                  allow="microphone; camera; display-capture"
                />
              )}
            </motion.div>
          ) : (
            <motion.div
              key="feedback"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="backdrop-blur-lg rounded-2xl p-8 bg-white/30 border border-white/50"
            >
              <div className="space-y-8">
                <h2 className="text-[24px] font-semibold text-black">
                  Did you like this character?
                </h2>
                
                <div className="flex gap-6">
                  <button
                    onClick={() => handleFeedback(true)}
                    className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-lg transition-colors font-semibold text-[24px] ${
                      likedLastCharacter === true
                        ? 'bg-green-500 text-white'
                        : 'bg-white/50 text-black hover:bg-white/70'
                    }`}
                  >
                    <FaThumbsUp className="w-6 h-6" />
                    Yes
                  </button>
                  <button
                    onClick={() => handleFeedback(false)}
                    className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-lg transition-colors font-semibold text-[24px] ${
                      likedLastCharacter === false
                        ? 'bg-red-500 text-white'
                        : 'bg-white/50 text-black hover:bg-white/70'
                    }`}
                  >
                    <FaThumbsDown className="w-6 h-6" />
                    No
                  </button>
                </div>

                <div>
                  <label className="block text-[24px] font-semibold text-black mb-3">
                    What kind of person do you want to talk to next?
                  </label>
                  <textarea
                    value={userPreferenceQuery}
                    onChange={(e) => setUserPreferenceQuery(e.target.value)}
                    placeholder="I want a man who can listen unlike my boyfriend"
                    className="w-full p-4 rounded-lg resize-none backdrop-blur-sm bg-white/50 border-white/50 text-black placeholder:text-gray-600 font-semibold text-[16px]"
                    rows={3}
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={matchNewCharacter}
                  className="w-full bg-[#6B4EFF] text-white py-4 px-8 rounded-lg hover:bg-[#6B4EFF]/90 transition-colors text-[14px] font-semibold"
                >
                  Find Someone New →
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <FeedbackModal open={showFeedbackModal} onClose={() => setShowFeedbackModal(false)} onSubmit={handleFeedbackSubmit} />
    </div>
  );
} 