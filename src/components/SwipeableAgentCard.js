import React, { useState, useEffect, useRef } from 'react';
import { useSwipeable } from 'react-swipeable';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowLeft, FaArrowRight, FaShare, FaCopy, FaTimes } from 'react-icons/fa';
import characterDescriptions from '../utils/characterDescriptions';
import { generateShareUrl } from '../utils/characterNames';
import { toast } from 'react-hot-toast';


export default function SwipeableAgentCard({ agent, onSwipeLeft, onSwipeRight, onCTAClick, isTop, animationProps, cardClassName }) {
  const [showSharePopover, setShowSharePopover] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const popoverRef = useRef(null);
  
  const handlers = useSwipeable({
    onSwipedLeft: () => onSwipeLeft(agent),
    onSwipedRight: () => onSwipeRight(agent),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  const defaultAnimation = {
    initial: { opacity: 0, y: 40, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, x: -200, scale: 0.9 },
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  };
  const anim = animationProps || defaultAnimation;

  // Handle clicking outside popover to close it
  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setShowSharePopover(false);
      }
    }

    if (showSharePopover) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSharePopover]);

  const handleShare = async () => {
    const url = generateShareUrl(agent.name.toLowerCase());
    
    // Check if it's a mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // Use native sharing on mobile
      try {
        if (navigator.share) {
          await navigator.share({
            title: `Talk to ${agent.name} on Wave`,
            text: `Check out ${agent.name} on Wave - your AI companion for meaningful conversations!`,
            url: url,
          });
        } else {
          // Fallback: copy to clipboard
          await navigator.clipboard.writeText(url);
          toast.success('Link copied to clipboard!');
        }
      } catch (error) {
        console.error('Error sharing:', error);
        // Fallback: copy to clipboard
        try {
          await navigator.clipboard.writeText(url);
          toast.success('Link copied to clipboard!');
        } catch (clipboardError) {
          console.error('Error copying to clipboard:', clipboardError);
          toast.error('Failed to share link');
        }
      }
    } else {
      // Show popover on desktop
      setShareUrl(url);
      setShowSharePopover(true);
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard!');
      setShowSharePopover(false);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast.error('Failed to copy link');
    }
  };

  return (
    <AnimatePresence>
      {isTop && (
        <motion.div
          {...handlers}
          initial={anim.initial}
          animate={anim.animate}
          exit={anim.exit}
          transition={anim.transition}
          className={`relative bg-white/80 rounded-2xl shadow-xl flex flex-col justify-between items-center border border-gray-200 w-[340px] sm:w-[400px] md:w-[500px] h-[600px] md:h-[600px] mx-auto p-6 md:p-10 overflow-y-auto ${cardClassName || ''}`}
          style={{ touchAction: 'pan-y' }}
        >
          {/* Share Button - Desktop Only */}
          <button
            onClick={handleShare}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/80 shadow-md hover:bg-indigo-100 transition-colors text-indigo-500 z-10 hidden md:flex"
            aria-label="Share character"
          >
            <FaShare size={16} />
          </button>

          {/* Share Popover - Desktop Only */}
          <AnimatePresence>
            {showSharePopover && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute top-16 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-20 hidden md:block min-w-[300px]"
                ref={popoverRef}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900">Share {agent.name}</h3>
                  <button
                    onClick={() => setShowSharePopover(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <FaTimes size={14} />
                  </button>
                </div>
                
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md border border-gray-200">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 text-sm text-gray-700 bg-transparent border-none outline-none"
                  />
                  <button
                    onClick={handleCopyUrl}
                    className="p-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-md transition-colors"
                    title="Copy URL"
                  >
                    <FaCopy size={14} />
                  </button>
                </div>
                
                <p className="text-xs text-gray-500 mt-2">
                  Copy this link to share {agent.name} with friends
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex-1 w-full flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#6B4EFF] to-[#F7BFA3] flex items-center justify-center overflow-hidden mb-5">
              {agent.image ? (
                <img src={agent.image} alt={agent.name} className="object-cover w-24 h-24 rounded-full" />
              ) : (
                <span className="text-3xl font-bold text-white">{agent.name[0]}</span>
              )}
            </div>
            <div className="text-2xl font-bold text-black mb-2 text-center">{agent.name}</div>
            <div className="text-base text-gray-700 mb-1 text-left w-full">{agent.age} years old • From {agent.country}</div>
            {agent.voice_style && (
              <div className="text-indigo-700 italic text-sm mb-2 text-left w-full">Voice style: {agent.voice_style}</div>
            )}
            <div className="text-gray-600 text-sm text-left w-full mb-3 whitespace-pre-wrap">
               {characterDescriptions[agent.id]}
            </div>
            {/* {agent.childhood && agent.childhood.length > 0 && (
              <div className="text-gray-600 text-sm mb-3 text-left w-full">"{agent.childhood[0]}"</div>
            )} */}
          </div>
          <div className="w-full mt-4">
            <button
              className="w-full py-3 rounded-xl cta-color text-white font-bold text-lg shadow-lg hover:bg-sky-600 transition-all mb-2"
              onClick={() => onCTAClick(agent)}
            >
              Talk to {agent.name}
            </button>
            
            {/* Mobile Share Button */}
            <button
              onClick={handleShare}
              className="w-full py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-gray-700 font-medium text-sm md:hidden flex items-center justify-center gap-2"
            >
              <FaShare size={14} />
              Share {agent.name}
            </button>
            
            {/* Swipe hint */}
            <div className="flex items-center justify-center gap-2 mt-2 text-gray-400 text-base select-none md:hidden">
              <FaArrowLeft />
              <span className="text-sm block">Swipe left to explore more</span>
              <FaArrowRight />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 