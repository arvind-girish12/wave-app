"use client";

import { useState } from 'react';

export default function OnboardingModal({ onClose }) {
  const [currentStep, setCurrentStep] = useState(1);
  
  const handleSkip = () => {
    onClose();
  };
  
  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl max-w-lg w-full p-8 mx-4">
        {currentStep === 1 && (
          <div className="flex flex-col items-center text-center">
            <div className="text-3xl mb-4 text-wave-forest">:)</div>
            <h2 className="text-xl font-medium mb-4 text-wave-forest">Hi Friend</h2>
            
            <p className="mb-4 text-wave-forest">
              We Created Wave Because Life Can Be... A Lot Sometimes
            </p>
            <p className="mb-4 text-wave-forest">
              You Just Need Someone To Talk To
            </p>
            
            <p className="mb-6 text-wave-forest">
              Whether You're Navigating Anxiety, Figuring Things Out,
              <br />Or Just Need A Moment To Breathe
            </p>
            
            <p className="font-medium mb-6 text-wave-forest">We're Here For You</p>
            
            <p className="mb-2 text-wave-forest">
              Wanna Give It A Try?
            </p>
            <p className="mb-8 text-wave-forest">
              Start With This <span className="font-bold text-wave-forest">Quick Guide</span>
            </p>
            
            <div className="italic mb-2 text-wave-forest">Love,</div>
            <div className="font-medium text-lg mb-8 text-wave-forest">Aastha & Team</div>
            
            <div className="flex w-full justify-between">
              <button 
                onClick={handleSkip}
                className="bg-gray-100 hover:bg-gray-200 py-2 px-6 rounded-md text-wave-forest"
              >
                Skip
              </button>
              <button 
                onClick={handleNext}
                className="bg-wave-teal text-white hover:bg-wave-forest py-2 px-6 rounded-md"
              >
                Next
              </button>
            </div>
          </div>
        )}
        
        {currentStep === 2 && (
          <div className="flex flex-col items-center text-center">
            <h2 className="text-xl font-medium mb-6 text-wave-forest">Wave Is Your Anxiety Companion</h2>
            
            <p className="mb-4 text-wave-forest">
              Designed Specifically For The Indian Context
            </p>
            <p className="mb-6 text-wave-forest">
              We Understand The Unique Stressors And Challenges You Face
            </p>
            
            <div className="w-full max-w-md bg-wave-lavender rounded-lg p-6 mb-8">
              <p className="font-medium mb-2 text-wave-forest">Our AI Is Trained To Help With:</p>
              <ul className="text-left mt-4 space-y-2">
                <li className="flex items-center text-wave-forest">
                  <span className="h-2 w-2 bg-wave-forest rounded-full mr-2"></span>
                  Daily Anxiety Management
                </li>
                <li className="flex items-center text-wave-forest">
                  <span className="h-2 w-2 bg-wave-forest rounded-full mr-2"></span>
                  Breathing & Mindfulness Techniques
                </li>
                <li className="flex items-center text-wave-forest">
                  <span className="h-2 w-2 bg-wave-forest rounded-full mr-2"></span>
                  Culturally Relevant Support
                </li>
                <li className="flex items-center text-wave-forest">
                  <span className="h-2 w-2 bg-wave-forest rounded-full mr-2"></span>
                  Private, Judgment-Free Conversations
                </li>
              </ul>
            </div>
            
            <div className="flex w-full justify-between">
              <button 
                onClick={handleSkip}
                className="bg-gray-100 hover:bg-gray-200 py-2 px-6 rounded-md text-wave-forest"
              >
                Skip
              </button>
              <button 
                onClick={handleNext}
                className="bg-wave-teal text-white hover:bg-wave-forest py-2 px-6 rounded-md"
              >
                Next
              </button>
            </div>
          </div>
        )}
        
        {currentStep === 3 && (
          <div className="flex flex-col items-center text-center">
            <h2 className="text-xl font-medium mb-6 text-wave-forest">Ready To Begin Your Journey?</h2>
            
            <p className="mb-6 text-wave-forest">
              Just Start Typing, And Our AI Will Respond With Warmth And Understanding
            </p>
            
            <div className="bg-wave-lavender p-6 rounded-lg mb-8 w-full max-w-md">
              <p className="font-medium mb-4 text-wave-forest">Try Saying:</p>
              <div className="bg-white p-3 rounded mb-2 text-left text-wave-forest">"I'm Feeling Anxious Today"</div>
              <div className="bg-white p-3 rounded mb-2 text-left text-wave-forest">"Help Me With My Breathing"</div>
              <div className="bg-white p-3 rounded text-left text-wave-forest">"I Need Someone To Talk To"</div>
            </div>
            
            <p className="mb-8 text-wave-forest">
              Remember, We're Here For You Whenever You Need Us
            </p>
            
            <button 
              onClick={onClose}
              className="bg-wave-teal text-white hover:bg-wave-forest py-3 px-8 rounded-md w-full max-w-xs"
            >
              Start Chatting
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 