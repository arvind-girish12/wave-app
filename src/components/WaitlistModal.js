"use client";

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function WaitlistModal({ onClose }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClientComponentClient();

  const handleJoinWaitlist = async () => {
    try {
      setIsSubmitting(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No user found');
      }

      const { error } = await supabase
        .from('user_profiles')
        .update({
          is_on_waitlist: true,
          waitlist_joined_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;
      
      onClose();
    } catch (error) {
      console.error('Error joining waitlist:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#0A0613]/90 via-[#2B176B]/90 to-[#3B2BFF]/90 flex items-center justify-center z-50">
      <div className="relative max-w-2xl w-full p-8 mx-4 flex flex-col items-center rounded-2xl border-2 border-[#6B4EFF] shadow-2xl overflow-hidden bg-[#1a1333]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#D1D5DB] hover:text-white text-2xl font-bold focus:outline-none"
          aria-label="Close waitlist modal"
        >
          ×
        </button>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-white">Session Limit Reached</h2>
          <p className="mb-6 text-[#D1D5DB] text-lg leading-relaxed">
            You've completed your 5 free sessions. We're glad you found Wave helpful!<br /><br />
            Join our waitlist to be among the first to know when we launch our full version with unlimited sessions and more features.
          </p>
          <button
            onClick={handleJoinWaitlist}
            disabled={isSubmitting}
            className="bg-[#6B4EFF] text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:bg-[#3B2BFF] transition-colors focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Joining...' : 'Join Waitlist'}
          </button>
        </div>
      </div>
    </div>
  );
} 