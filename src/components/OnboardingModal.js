"use client";

import { useState } from 'react';

export default function OnboardingModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#0A0613]/90 via-[#2B176B]/90 to-[#3B2BFF]/90 flex items-center justify-center z-50">
      <div className="onboarding-modal-card relative max-w-4xl w-full p-0 mx-4 flex flex-col items-center rounded-2xl border-2 border-[#6B4EFF] shadow-2xl overflow-hidden">
        <div className="absolute inset-0 z-0" style={{ background: 'url(/onboarding-background.jpeg) center center / cover no-repeat' }} />
        <div className="absolute inset-0 z-10 bg-[#1a1333]/20" />
        <div className="relative z-20 w-full p-10 flex flex-col items-center lato-onboarding">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-[#D1D5DB] hover:text-white text-2xl font-bold focus:outline-none"
            aria-label="Close onboarding"
          >
            ×
          </button>
          <div className="flex flex-col items-start text-left w-full">
            <h2 className="text-2xl font-bold mb-4 text-white drop-shadow">Welcome to Wave</h2>
            <p className="mb-6 text-[#D1D5DB] leading-relaxed">
              <span className="hidden md:inline">
                In the summer of 2020, I woke up one morning with a heavy feeling in my chest. I thought it would go away, but it stayed for days. I tried talking to people, but no one really got it. And when I really needed someone to just listen, I couldn't find that space.<br /><br />
                That's why Wave exists.<br /><br />
                It's here for you in those hard moments. When you feel overwhelmed, anxious, or just need someone to talk to, Wave is your companion in that exact moment for that moment. No judgment. No pressure. Just care, comfort, and someone who truly listens. Available when you need it.<br /><br />
                Your conversations are private and encrypted - Wave can't read them, and they're yours alone. We believe in creating a safe space where you can be completely yourself.<br /><br />
                You're not alone. We're here for you.
              </span>
              <span className="md:hidden">
                We designed Wave for you so that in the moments you feel anxious, overwhelmed, or alone - you have someone to turn to. We built a gentle companion who listens without judgment or pressure. Just calm, care, and the feeling of being truly heard.<br /><br />
                Your conversations are private and encrypted - Wave can't read them, and they're yours alone. We believe in creating a safe space where you can be completely yourself.<br /><br />
                Right when you need it most. In your hardest moments, you don't have to be alone anymore.
              </span>
            </p>
            <div className="italic mb-1 text-[#D1D5DB]">With love,</div>
            <div className="font-medium text-lg mb-8 text-white">Aastha & Team</div>
            <button
              onClick={onClose}
              className="bg-[#6B4EFF] text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:bg-[#3B2BFF] transition-colors w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:ring-offset-2"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 