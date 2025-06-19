"use client";

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { trackVisit, trackVisitWithEmail } from '../utils/trackVisits';
import { toast } from 'react-hot-toast';
import { supabase } from '../utils/supabaseClient';

const COUNTRY_CODES = [
  // +1
  { code: '+1', flag: '🇺🇸', country: 'USA' },
  { code: '+1', flag: '🇨🇦', country: 'Canada' },

  // +2
  { code: '+27', flag: '🇿🇦', country: 'South Africa' },
  { code: '+233', flag: '🇬🇭', country: 'Ghana' },
  { code: '+234', flag: '🇳🇬', country: 'Nigeria' },
  { code: '+254', flag: '🇰🇪', country: 'Kenya' },

  // +3
  { code: '+30', flag: '🇬🇷', country: 'Greece' },
  { code: '+31', flag: '🇳🇱', country: 'Netherlands' },
  { code: '+32', flag: '🇧🇪', country: 'Belgium' },
  { code: '+33', flag: '🇫🇷', country: 'France' },
  { code: '+34', flag: '🇪🇸', country: 'Spain' },
  { code: '+36', flag: '🇭🇺', country: 'Hungary' },
  { code: '+39', flag: '🇮🇹', country: 'Italy' },
  { code: '+41', flag: '🇨🇭', country: 'Switzerland' },
  { code: '+43', flag: '🇦🇹', country: 'Austria' },
  { code: '+44', flag: '🇬🇧', country: 'UK' },
  { code: '+45', flag: '🇩🇰', country: 'Denmark' },
  { code: '+46', flag: '🇸🇪', country: 'Sweden' },
  { code: '+47', flag: '🇳🇴', country: 'Norway' },
  { code: '+48', flag: '🇵🇱', country: 'Poland' },
  { code: '+49', flag: '🇩🇪', country: 'Germany' },

  // +5
  { code: '+52', flag: '🇲🇽', country: 'Mexico' },

  // +6
  { code: '+60', flag: '🇲🇾', country: 'Malaysia' },
  { code: '+61', flag: '🇦🇺', country: 'Australia' },
  { code: '+62', flag: '🇮🇩', country: 'Indonesia' },
  { code: '+63', flag: '🇵🇭', country: 'Philippines' },
  { code: '+64', flag: '🇳🇿', country: 'New Zealand' },
  { code: '+65', flag: '🇸🇬', country: 'Singapore' },
  { code: '+66', flag: '🇹🇭', country: 'Thailand' },

  // +8
  { code: '+81', flag: '🇯🇵', country: 'Japan' },
  { code: '+82', flag: '🇰🇷', country: 'South Korea' },
  { code: '+84', flag: '🇻🇳', country: 'Vietnam' },
  { code: '+86', flag: '🇨🇳', country: 'China' },

  // +9
  { code: '+90', flag: '🇹🇷', country: 'Turkey' },
  { code: '+91', flag: '🇮🇳', country: 'India' },
  { code: '+92', flag: '🇵🇰', country: 'Pakistan' },
  { code: '+93', flag: '🇦🇫', country: 'Afghanistan' },
  { code: '+94', flag: '🇱🇰', country: 'Sri Lanka' },
  { code: '+961', flag: '🇱🇧', country: 'Lebanon' },
  { code: '+962', flag: '🇯🇴', country: 'Jordan' },
  { code: '+966', flag: '🇸🇦', country: 'Saudi Arabia' },
  { code: '+968', flag: '🇴🇲', country: 'Oman' },
  { code: '+971', flag: '🇦🇪', country: 'UAE' },
  { code: '+972', flag: '🇮🇱', country: 'Israel' },
  { code: '+973', flag: '🇧🇭', country: 'Bahrain' },
  { code: '+974', flag: '🇶🇦', country: 'Qatar' },
  { code: '+977', flag: '🇳🇵', country: 'Nepal' },
];

export default function OnboardingModal({ onClose }) {
  const [error, setError] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [step, setStep] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    trackVisitWithEmail("onboarding_visits");
  }, []);

  // Filter countries based on search term
  const filteredCountries = COUNTRY_CODES.filter(({ code, country }) => 
    code.toLowerCase().includes(searchTerm.toLowerCase()) || 
    country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCountryCodeChange = (e) => {
    const value = e.target.value;
    // Allow empty input or input starting with +
    if (value === '') {
      setSearchTerm('');
      return;
    }
    
    // If input doesn't start with +, add it
    const formattedValue = value.startsWith('+') ? value : `+${value}`;
    
    // Only allow digits after the +
    if (/^\+[0-9]*$/.test(formattedValue)) {
      setSearchTerm(formattedValue);
    }
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      setPhoneNumber(prev => {
        const digits = prev.replace(/\D/g, '').slice(0, -1);
        return digits.replace(/(\d{5})(\d{0,5})/, '$1 $2').trim();
      });
      setError('');
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setPhoneNumber(value);
    setError('');
  };

  const handleGetStarted = async () => {
    if (!agreed) {
      setError('You must agree to the Terms & Privacy Policy.');
      return;
    }
    setStep(2);
  };

  const handleSubmitFeedback = async () => {
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!phoneNumber.trim()) {
      setError('Please provide your WhatsApp number');
      return;
    }

    // Validate phone number format
    const digits = phoneNumber.replace(/\D/g, '');
    if (digits.length < 8) {
      setError('Please enter a valid WhatsApp number');
      return;
    }

    try {
      setIsSubmitting(true);
      // Save phone number to database
      const fullPhone = `${countryCode} ${phoneNumber}`;
      
      const response = await fetch('/api/update-phone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone: fullPhone,
          display_name: name
        })
      });
      
      const result = await response.json();
      if (!response.ok || !result.success) {
        toast.error(result.error || 'Failed to save details.');
        return;
      }

      toast.success('Welcome to Wave!');
      onClose();
    } catch (error) {
      setError('Failed to save details. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-sky-100/90 flex items-center justify-center z-50">
      <div className="relative max-w-4xl w-full mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
        <div className="relative z-20 w-full p-8 md:p-10 flex flex-col items-center lato-onboarding">
          {/* <button
            onClick={onClose}
            aria-label="Close onboarding"
            className="absolute top-4 right-4 text-gray-400 hover:text-black text-2xl font-bold focus:outline-none"
          >
            ×
          </button> */}

          <div className="w-full text-left">
            {step === 1 ? (
              <>
                <h2 className="text-3xl font-bold mb-5 text-black">Welcome to Wave</h2>
                <p className="mb-4 text-gray-500 leading-relaxed text-md">
                  Wave is your gentle AI companion—here to listen, support, and help you feel heard, anytime you need it. No judgment, just care.
                </p>
                <div className="p-6 mb-6 bg-indigo-50 border-2 border-indigo-200 rounded-lg">
                  <p className="text-md font-bold text-indigo-500 mb-3 tracking-wide">WE CANNOT ACCESS YOUR CONVERSATIONS</p>
                  <p className="text-sm text-indigo-500 font-semibold mt-2">Your chats are 100% private, encrypted, and completely secure.</p>
                  <p className="text-sm text-indigo-500 mt-4">This is your safe space - we have zero access to what you share.</p>
                </div>

                <div className="flex items-center mb-4">
                  <input
                    id="agree"
                    type="checkbox"
                    checked={agreed}
                    onChange={e => { setAgreed(e.target.checked); setError(''); }}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="agree" className="ml-2 text-sm text-gray-700">
                    I agree to the{' '}
                    <a
                      href="https://www.wave-length.in/terms-of-use"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 underline"
                    >
                      Terms & Conditions
                    </a>{' '}
                    and{' '}
                    <a
                      href="https://www.wave-length.in/privacy-policy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 underline"
                    >
                      Privacy Policy
                    </a>
                  </label>
                </div>

                {error && (
                  <div className="text-red-500 text-xs mb-2">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleGetStarted}
                  disabled={!agreed}
                  className={`w-full max-w-xs py-3 rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-offset-2 text-sm
                    ${agreed
                      ? 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg'
                      : 'bg-indigo-200 text-gray-400 cursor-not-allowed'
                    }`}
                >
                  Continue
                </button>
              </>
            ) : (
              <>
                <h2 className="text-3xl font-bold mb-5 text-black">Tell Us About Yourself!</h2>
                <p className="mb-4 text-gray-500 leading-relaxed text-md">
                  We're a small team building something special. Join us on this journey!
                </p>
                <div className="mb-4 p-3 rounded-lg bg-indigo-50 text-indigo-800 text-sm border border-indigo-200">
                  <b>We promise:</b> We will not spam you. 
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-bold text-gray-500 mb-4">
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="What should we call you?"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-black"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-bold text-gray-500 mb-4">
                      WhatsApp Number
                    </label>
                    <div className="flex gap-2">
                      <div className="relative w-[5rem]" ref={dropdownRef}>
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={handleCountryCodeChange}
                          onFocus={() => setShowDropdown(true)}
                          placeholder="+91"
                          className="w-[5rem] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-black bg-white"
                        />
                        {showDropdown && (
                          <div className="absolute z-50 w-[5rem] mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto text-sm text-black font-normal">
                            {filteredCountries.map(({ code, flag, country }) => (
                              <div
                                key={code}
                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                                onClick={() => {
                                  setCountryCode(code);
                                  setSearchTerm(code);
                                  setShowDropdown(false);
                                }}
                              >
                                {flag} {code}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <input
                        type="tel"
                        id="phone"
                        value={phoneNumber}
                        onChange={handlePhoneChange}
                        onKeyDown={handleKeyDown}
                        placeholder="98765 43210"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-black"
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="text-red-500 text-xs mt-2">
                    {error}
                  </div>
                )}

                <div className="mt-6">
                  <button
                    onClick={handleSubmitFeedback}
                    className="w-full py-3 rounded-lg font-semibold bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-offset-2 text-sm"
                  >
                    Get Started! ✨
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}