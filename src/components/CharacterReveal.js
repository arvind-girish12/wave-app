"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { FaDice, FaCloud, FaDove, FaThumbsUp, FaThumbsDown, FaMicrophone, FaMicrophoneSlash, FaArrowRight } from 'react-icons/fa';
import Typewriter from 'typewriter-effect';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

const MAX_SKIPS = 3;

const characterIframeMap = {
  1: "https://app.toughtongueai.com/embed/67f654c0f2dd89fc5d2d6043?bg=%23fdfffe&name=Mira&hidePoweredBy=true&skipPrecheck=true&buttonColor=%23c9d7f3&buttonIcon=call&scenarioNameColor=%23c2d3f5&buttonOutline=false",
  2: "https://app.toughtongueai.com/embed/68355dcd12d822723ba97f50?bg=%23f2e5d4&hidePoweredBy=true&skipPrecheck=true&promptUserInfo=true&buttonColor=%23f1e3f2&buttonOutline=false&scenarioNameColor=%237e6d6d",
  3: "https://app.toughtongueai.com/embed/683722168d5a66f1aaac837b?bg=%23f7e4ee&skipPrecheck=true&buttonColor=%23fbeffb&buttonOutline=false&scenarioNameColor=%23978787",
  4: "https://app.toughtongueai.com/embed/68395a3fdb1f6ef1edd06a92?bg=%23fcfffa&skipPrecheck=true&buttonColor=%23a8b0bd&buttonOutline=false&scenarioNameColor=%23898b89"
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
    // Simulate new character loading
    setTimeout(() => {
      setLoading(false);
      setCurrentCharacter(characters[Math.floor(Math.random() * characters.length)]);
    }, 2500);
  };

  const skipCharacter = () => {
    if (characters.length < 2 || skipsRemaining <= 0) return;
    let next;
    do {
      next = characters[Math.floor(Math.random() * characters.length)];
    } while (next.id === currentCharacter.id);
    setCurrentCharacter(next);
    setShowFeedback(false);
    setStartConversation(false);
    setSkipsRemaining(prev => prev - 1);
  };

  // Loading Screen
  if (!currentCharacter) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`flex flex-col items-center justify-center min-h-[80vh] ${inter.className}`}
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
    <div className={`relative min-h-screen max-h-screen w-full ${inter.className}`}>
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

      <div className="relative z-10 w-full px-2 md:px-4 py-8">
        {/* Skips left icon/counter at the top right */}
        {skipsRemaining > 0 && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-white/70 rounded-full px-3 py-1 shadow text-xs font-semibold text-black z-20">
            <FaDice className="w-3 h-3" />
            Skips left: {skipsRemaining}
          </div>
        )}
        <AnimatePresence mode="wait">
          {!showFeedback && !startConversation ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8 mt-16"
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
                              .typeString("Say hi to your new listening buddy 👋")
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
                className="backdrop-blur-lg rounded-2xl p-4 md:p-6 bg-white/30 border border-white/50 w-full h-[580px] overflow-y-auto"
              >
                <div className="space-y-8">
                  {/* Avatar Placeholder */}
                  <div className="w-40 h-40 rounded-full bg-gradient-to-br from-[#6B4EFF] to-[#F7BFA3] flex items-center justify-center">
                    <span className="text-5xl font-bold text-white">
                      {currentCharacter.name[0]}
                    </span>
                  </div>

                  {/* Character Info */}
                  <div className="space-y-4">
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
                  height="720"
                  className="rounded-lg shadow-lg w-[360px] md:w-[720px]"
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

      {/* Fixed Next/Skip CTA at bottom right, only if skips remain */}
      {skipsRemaining > 0 && (
        <button
          onClick={skipCharacter}
          className="fixed bottom-6 right-6 z-50 bg-gray-200 text-gray-800 px-5 py-3 rounded-full shadow-lg text-sm font-semibold hover:bg-gray-300 transition flex items-center gap-2"
          aria-label="Skip to next character"
        >
          Skip <FaArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
} 