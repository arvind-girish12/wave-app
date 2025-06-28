import React from 'react';
import { useSwipeable } from 'react-swipeable';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowLeft, FaArrowRight, FaShare } from 'react-icons/fa';
import characterDescriptions from '../utils/characterDescriptions';
import { generateShareUrl } from '../utils/characterNames';
import { toast } from 'react-hot-toast';


export default function SwipeableAgentCard({ agent, onSwipeLeft, onSwipeRight, onCTAClick, isTop, animationProps, cardClassName }) {
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

  const handleShare = async () => {
    const characterName = generateShareUrl(agent.name.toLowerCase());
    
    try {
      if (navigator.share) {
        // Use native sharing on mobile
        await navigator.share({
          title: `Talk to ${agent.name} on Wave`,
          text: `Check out ${agent.name} on Wave - your AI companion for meaningful conversations!`,
          url: characterName,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(characterName);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(characterName);
        toast.success('Link copied to clipboard!');
      } catch (clipboardError) {
        console.error('Error copying to clipboard:', clipboardError);
        toast.error('Failed to share link');
      }
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