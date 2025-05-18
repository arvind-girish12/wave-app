"use client";

import { useState } from 'react';
import { FaShareAlt } from 'react-icons/fa';

export default function ShareMood({ analysis }) {
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateShareText = () => {
    const emotions = analysis.emotional_analysis?.primary_emotions || [];
    const summary = analysis.transcript_summary?.summary || '';
    const tags = analysis.insight_tags || [];
    
    let shareText = "🌊 How I'm feeling today:\n\n";
    
    if (emotions.length > 0) {
      shareText += "Emotions: " + emotions.join(", ") + "\n\n";
    }
    
    if (summary) {
      shareText += "Reflection: " + summary + "\n\n";
    }
    
    if (tags.length > 0) {
      shareText += "Insights: " + tags.join(", ") + "\n\n";
    }
    
    shareText += "Shared via Wave 🌊";
    
    return shareText;
  };

  const handleShare = async () => {
    const shareText = generateShareText();
    
    if (navigator.share) {
      try {
        await navigator.share({
          text: shareText
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={handleShare}
        className="bg-[#6B4EFF] text-white px-4 py-2 rounded-full shadow-lg hover:bg-[#3B2BFF] transition-colors flex items-center gap-2"
      >
        <FaShareAlt />
        <span>{copied ? 'Copied!' : 'Share how I feel'}</span>
      </button>
    </div>
  );
} 