"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { FaRobot, FaRedo, FaThumbsUp, FaThumbsDown } from 'react-icons/fa';

const MAX_SKIPS = 3;

export default function CharacterMatch() {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [currentCharacter, setCurrentCharacter] = useState(null);
  const [skipsRemaining, setSkipsRemaining] = useState(MAX_SKIPS);
  const [showFeedback, setShowFeedback] = useState(false);
  const [userPreferenceQuery, setUserPreferenceQuery] = useState('');
  const [likedLastCharacter, setLikedLastCharacter] = useState(null);

  // Mock character data - replace with actual API call
  const mockCharacter = {
    name: "Jordan",
    age: 27,
    country: "Canada",
    childhood: "Grew up in a small coastal town, spent summers volunteering at the local animal shelter.",
    funFact: "Once biked across two countries to chase a solar eclipse.",
    tags: ["deep thinker", "funny", "empathetic", "bookworm"]
  };

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
      setCurrentCharacter(mockCharacter);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const startConversation = () => {
    // Implement conversation start logic
    console.log('Starting conversation with:', currentCharacter.name);
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
      setCurrentCharacter(mockCharacter); // Replace with actual API call
    }, 2500);
  };

  // Loading Screen
  if (loading) {
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
          <FaRobot className={`w-16 h-16 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`} />
        </motion.div>
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-2xl font-semibold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}
        >
          Finding someone to talk to...
        </motion.h2>
      </motion.div>
    );
  }

  // Character Preview
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <AnimatePresence mode="wait">
        {!showFeedback ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="flex justify-between items-start">
              <h1 className={`text-3xl font-bold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                Your character for today is {currentCharacter.name}
              </h1>
              {skipsRemaining > 0 && (
                <button
                  onClick={handleSkip}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    theme === 'light'
                      ? 'bg-[#F7BFA3]/20 hover:bg-[#F7BFA3]/30 text-gray-700'
                      : 'bg-[#3B2BFF]/20 hover:bg-[#3B2BFF]/30 text-white'
                  }`}
                >
                  <FaRedo className="w-4 h-4" />
                  Skip ({skipsRemaining} left)
                </button>
              )}
            </div>

            <div className={`rounded-xl p-6 ${
              theme === 'light'
                ? 'bg-white/80 border border-[#F7BFA3]'
                : 'bg-[#1a1333]/80 border border-[#6B4EFF]'
            }`}>
              <div className="space-y-4">
                <div>
                  <h3 className={`text-xl font-semibold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                    {currentCharacter.name}
                  </h3>
                  <p className={`${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>
                    {currentCharacter.age} years old • From {currentCharacter.country}
                  </p>
                </div>

                <div>
                  <p className={`${theme === 'light' ? 'text-gray-700' : 'text-gray-200'}`}>
                    {currentCharacter.childhood}
                  </p>
                  <p className={`mt-2 ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>
                    {currentCharacter.funFact}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {currentCharacter.tags.map((tag, index) => (
                    <span
                      key={index}
                      className={`px-3 py-1 rounded-full text-sm ${
                        theme === 'light'
                          ? 'bg-[#F7BFA3]/30 text-gray-700'
                          : 'bg-[#3B2BFF]/30 text-white'
                      }`}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={startConversation}
              className="w-full bg-[#6B4EFF] text-white py-3 px-6 rounded-lg hover:bg-[#6B4EFF]/90 transition-colors text-lg font-medium"
            >
              Start Conversation
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="feedback"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`rounded-xl p-6 ${
              theme === 'light'
                ? 'bg-white/80 border border-[#F7BFA3]'
                : 'bg-[#1a1333]/80 border border-[#6B4EFF]'
            }`}
          >
            <div className="space-y-6">
              <h2 className={`text-2xl font-semibold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                Did you like this character?
              </h2>
              
              <div className="flex gap-4">
                <button
                  onClick={() => handleFeedback(true)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-colors ${
                    likedLastCharacter === true
                      ? 'bg-green-500 text-white'
                      : theme === 'light'
                      ? 'bg-[#F7BFA3]/20 text-gray-700 hover:bg-[#F7BFA3]/30'
                      : 'bg-[#3B2BFF]/20 text-white hover:bg-[#3B2BFF]/30'
                  }`}
                >
                  <FaThumbsUp className="w-5 h-5" />
                  Yes
                </button>
                <button
                  onClick={() => handleFeedback(false)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-colors ${
                    likedLastCharacter === false
                      ? 'bg-red-500 text-white'
                      : theme === 'light'
                      ? 'bg-[#F7BFA3]/20 text-gray-700 hover:bg-[#F7BFA3]/30'
                      : 'bg-[#3B2BFF]/20 text-white hover:bg-[#3B2BFF]/30'
                  }`}
                >
                  <FaThumbsDown className="w-5 h-5" />
                  No
                </button>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                  What kind of person do you want to talk to next?
                </label>
                <textarea
                  value={userPreferenceQuery}
                  onChange={(e) => setUserPreferenceQuery(e.target.value)}
                  placeholder="I want a man who can listen unlike my boyfriend"
                  className={`w-full p-3 rounded-lg resize-none ${
                    theme === 'light'
                      ? 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400'
                      : 'bg-[#2B176B]/50 border-gray-600 text-white placeholder:text-gray-400'
                  }`}
                  rows={3}
                />
              </div>

              <button
                onClick={matchNewCharacter}
                className="w-full bg-[#6B4EFF] text-white py-3 px-6 rounded-lg hover:bg-[#6B4EFF]/90 transition-colors text-lg font-medium"
              >
                Find Someone New →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 