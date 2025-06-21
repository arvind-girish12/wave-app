"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { FaDice, FaCloud, FaDove, FaThumbsUp, FaThumbsDown, FaMicrophone, FaMicrophoneSlash, FaArrowRight, FaArrowLeft } from 'react-icons/fa';
import Typewriter from 'typewriter-effect';
import { supabase } from '../utils/supabaseClient';
import FeedbackModal from './FeedbackModal';
import SwipeableAgentCard from './SwipeableAgentCard';
import { useMenu } from '../context/MenuContext';
import TypewriterWrapper from './TypewriterWrapper';
import { trackVisitWithEmail } from '../utils/trackVisits';

const characterIframeMap = {
  1: "https://app.toughtongueai.com/embed/67f654c0f2dd89fc5d2d6043?bg=%23fdfffe&name=Mira&hidePoweredBy=true&skipPrecheck=true&buttonColor=%23c9d7f3&buttonIcon=call&scenarioNameColor=%23c2d3f5&buttonOutline=false&allowInteraction=true",
  2: "https://app.toughtongueai.com/embed/68355dcd12d822723ba97f50?bg=%23f2e9d4&skipPrecheck=true&buttonColor=%23fac342&buttonIcon=call&buttonOutline=false&scenarioNameColor=%23c9b382&buttonOutline=false&allowInteraction=true",
  3: "https://app.toughtongueai.com/embed/683722168d5a66f1aaac837b?bg=%23211641&skipPrecheck=true&buttonColor=%23be618c&buttonOutline=false&allowInteraction=true",
  4: "https://app.toughtongueai.com/embed/68395a3fdb1f6ef1edd06a92?bg=%23fcfffa&skipPrecheck=true&buttonColor=%23a8b0bd&buttonOutline=false&scenarioNameColor=%23898b89&buttonOutline=false&allowInteraction=true",
  5: "https://app.toughtongueai.com/embed/68407514764a4fff3df0b851?bg=%23cae8d4&skipPrecheck=true&buttonColor=%23ffb72a&buttonOutline=false&scenarioNameColor=%233f9d67",
  6: "https://app.toughtongueai.com/embed/683dc28a2698ebf16b09cdaa?bg=%23f3f0e2&hidePoweredBy=true&skipPrecheck=true&buttonColor=%23efd8af&buttonOutline=false&scenarioNameColor=%23b44f33",
  7: "https://app.toughtongueai.com/embed/683feaf4764a4fff3df0b296?bg=%23bfcde8&skipPrecheck=true&buttonColor=%239aabdf&buttonOutline=false",
  8: "https://app.toughtongueai.com/embed/683eef74f499ca9b71d5ac8a?bg=%23d0d3dd&skipPrecheck=true&buttonColor=%23b6bac9&buttonOutline=false",
  9: "https://app.toughtongueai.com/embed/6841469c764a4fff3df0baba?bg=%23bcd1e1&hidePoweredBy=true&skipPrecheck=true&tools=true&buttonColor=%23e2d3d0&buttonOutline=false&scenarioNameColor=%23211211"
};

const characterImageMap = {
  1: '/mira.jpg',
  2: '/novajames.gif',
  3: '/seraphina.jpg',
  4: '/maccallan.jpg',
  5: '/zenny.png',
  6: '/reed.png',
  7: '/arjun.png',
  8: '/lucky.png'
};

export default function CharacterReveal() {
  const { theme } = useTheme();
  const { setIsMenuVisible } = useMenu();
  const [loading, setLoading] = useState(true);
  const [currentCharacter, setCurrentCharacter] = useState(null);
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
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    async function fetchCharacters() {
      const res = await fetch('/api/characters');
      const data = await res.json();
      
      if (data && data.length) {
        // Separate characters into groups
        const priorityGroup = data.filter(char => [4, 5, 6].includes(char.id)); // IDs 4, 5, 6
        const otherGroup = data.filter(char => [1, 2, 3, 7, 8, 9].includes(char.id)); // IDs 1, 2, 3, 7, 8, 9
        
        // Shuffle the other group
        const shuffledOtherGroup = [...otherGroup].sort(() => Math.random() - 0.5);
        
        // Combine: First 3 are always 4,5,6 (in order), then shuffled others
        const orderedCharacters = [
          ...priorityGroup, // First 3 positions: IDs 4, 5, 6
          ...shuffledOtherGroup // Remaining 6 positions: shuffled IDs 1, 2, 3, 7, 8, 9
        ];
        
        setCharacters(orderedCharacters);
        
        // Set the first character (ID 4) as current
        if (orderedCharacters.length > 0) {
          setCurrentCharacter(orderedCharacters[0]);
        }
      }
      trackVisitWithEmail("dashboard_visits");
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
            trackVisitWithEmail("character_visits");
            break;
          case 'onStop':
            console.log('[CharacterReveal] onStop event received:', data);
            sessionInfoRef.current.endTime = Date.now();
            const durationSeconds = Math.floor((sessionInfoRef.current.endTime - sessionInfoRef.current.startTime) / 1000);
            const userEmail = sessionInfoRef.current.userEmail || 'localhost';
            
            // Get user data from localStorage
            const userName = localStorage.getItem('userName') || null;
            const userPhone = localStorage.getItem('userPhone') || null;
            
            const payload = {
              user_email: 'not_authenticated',
              character_id: sessionInfoRef.current.characterId,
              session_id: sessionInfoRef.current.sessionIdText,
              started_at: new Date(sessionInfoRef.current.startTime).toISOString(),
              ended_at: new Date(sessionInfoRef.current.endTime).toISOString(),
              duration_seconds: durationSeconds,
              user_name: userName,
              user_phone: userPhone,
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
            trackVisitWithEmail("feedback_visits");
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

  useEffect(() => {
    // Always start session on first dot
    if (characters.length) {
      setCurrentIndex(0);
    }
  }, [characters]);

  // Navigation logic: move to next/prev agent (0-8 for all 9 characters)
  const goToNextAgent = () => {
    setCurrentIndex(idx => Math.min(idx + 1, characters.length - 1));
  };
  const goToPrevAgent = () => {
    setCurrentIndex(idx => Math.max(idx - 1, 0));
  };

  // Current agent
  const currentAgent = characters[currentIndex] || null;

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

  const handleFeedback = (liked) => {
    setLikedLastCharacter(liked);
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
    // Reset conversation state to show character screen
    setStartConversation(false);
    setMicPermission(null);
    if (iframeRef.current) {
      iframeRef.current.src = ''; // Clear the iframe src
    }
  };

  const handleExitConversation = () => {
    setStartConversation(false);
    setMicPermission(null);
    if (iframeRef.current) {
      iframeRef.current.src = ''; // Clear the iframe src
    }
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

      <div className="relative z-10 w-full px-2 md:px-4 py-8 flex-1 h-dvh flex flex-col items-center justify-center">
        {/* Instruction */}
        {!startConversation && !showFeedback && <TypewriterWrapper />}
        
        {/* Queue Indicator - Now shows 9 dots for all characters */}
        {!startConversation && (
          <div className="flex justify-center items-center gap-2 mb-4">
            {characters.map((_, idx) => (
              <span key={idx} className={`w-2 h-2 rounded-full ${idx === currentIndex ? 'bg-indigo-500' : 'bg-gray-300'}`}></span>
            ))}
          </div>
        )}
        
        {/* Arrow Controls + Swipeable Card or Iframe */}
        <div className="relative flex items-center justify-center w-full max-w-none mx-auto gap-0" style={{ minHeight: '1px' }}>
          {/* Left Arrow: absolutely positioned */}
          {!startConversation && (
            <div className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10">
              <button
                className={`p-2 rounded-full bg-white/80 shadow hover:bg-indigo-100 transition-colors text-indigo-500 ${currentIndex === 0 ? 'invisible' : ''}`}
                onClick={goToPrevAgent}
                aria-label="Previous agent"
                aria-hidden={currentIndex === 0}
                tabIndex={currentIndex === 0 ? -1 : 0}
                style={{ width: 48, height: 48 }}
              >
                <FaArrowLeft size={32} />
              </button>
            </div>
          )}
          
          {/* Card or Iframe: fixed width */}
          <div className="w-[340px] sm:w-[400px] md:w-[500px] mx-auto">
            {startConversation && micPermission === 'granted' ? (
              <div className="w-full h-[600px] bg-white rounded-xl overflow-hidden shadow-xl">
                <iframe
                  ref={iframeRef}
                  src={characterIframeMap[currentAgent.id]}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  allow="microphone; camera; display-capture"
                />
              </div>
            ) : currentAgent && (
              <SwipeableAgentCard
                agent={{
                  ...currentAgent,
                  image: characterImageMap[currentAgent.id],
                }}
                onSwipeLeft={goToNextAgent}
                onSwipeRight={goToPrevAgent}
                isTop={true}
                animationProps={{
                  initial: { opacity: 0, x: 120 },
                  animate: { opacity: 1, x: 0 },
                  exit: { opacity: 0, x: -120 },
                  transition: { type: 'spring', stiffness: 300, damping: 30 },
                }}
                cardClassName="w-full"
                onCTAClick={handleStartConversation}
              />
            )}
          </div>
          
          {/* Right Arrow: absolutely positioned */}
          {!startConversation && (
            <div className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10">
              <button
                className={`p-2 rounded-full bg-white/80 shadow hover:bg-indigo-100 transition-colors text-indigo-500 ${currentIndex === characters.length - 1 ? 'invisible' : ''}`}
                onClick={goToNextAgent}
                aria-label="Next agent"
                aria-hidden={currentIndex === characters.length - 1}
                tabIndex={currentIndex === characters.length - 1 ? -1 : 0}
                style={{ width: 48, height: 48 }}
              >
                <FaArrowRight size={32} />
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Microphone Permission UI */}
      {micPermission === 'denied' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">Microphone Access Required</h2>
            <p className="mb-6 text-gray-600">
              To have a conversation, we need access to your microphone. Please enable it in your browser settings.
            </p>
            <button
              onClick={retryMicrophonePermission}
              className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Back Button - Only shown when iframe is active */}
      {startConversation && micPermission === 'granted' && (
        <button
          onClick={handleExitConversation}
          className="md:hidden fixed top-4 left-4 z-50 bg-[#2B176B] p-2 rounded-full shadow-lg border border-[#6B4EFF] text-white"
          aria-label="Back to characters"
        >
          <FaArrowLeft className="w-6 h-6" />
        </button>
      )}

      {/* Feedback Modal */}
      <FeedbackModal 
        open={showFeedbackModal} 
        onClose={() => setShowFeedbackModal(false)} 
        onSubmit={handleFeedbackSubmit} 
      />
    </div>
  );
}