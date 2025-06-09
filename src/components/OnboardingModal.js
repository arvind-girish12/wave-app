"use client";

import { useState } from 'react';
import Image from 'next/image';
import { supabase } from '../utils/supabaseClient';
import { toast } from 'react-hot-toast';

const COUNTRY_CODES = [
  { code: '+91', label: '🇮🇳 +91' },
  { code: '+1', label: '🇺🇸 +1' },
  { code: '+44', label: '🇬🇧 +44' },
  { code: '+61', label: '🇦🇺 +61' },
  { code: '+971', label: '🇦🇪 +971' },
];

export default function OnboardingModal({ onClose }) {
  const [countryCode, setCountryCode] = useState(COUNTRY_CODES[0].code);
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [agreed, setAgreed] = useState(false);

  // Only allow input when countryCode is '+91'
  const isIndian = countryCode === '+91';

  const handleKeyDown = (e) => {
    if (!isIndian) return;
    if (e.key === 'Backspace') {
      e.preventDefault();
      setPhone(prev => {
        const digits = prev.replace(/\D/g, '').slice(0, -1);
        return digits.replace(/(\d{5})(\d{0,5})/, '$1 $2').trim();
      });
      setError('');
    }
  };

  const handlePhoneChange = (e) => {
    if (!isIndian) return;
    let value = e.target.value.replace(/[^0-9\s-]/g, '');
    value = value.replace(/(\d{5})(\d{0,5})/, '$1 $2').trim();
    setPhone(value);
    setError('');
  };

  const handleGetStarted = async () => {
    if (!agreed) {
      setError('You must agree to the Terms & Privacy Policy.');
      return;
    }
    if (!isIndian) {
      setError('Phone entry is only allowed for Indian numbers.');
      return;
    }
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 8) {
      setError('Please enter a valid phone number.');
      return;
    }
    const fullPhone = `${countryCode} ${digits}`;
    const { data: { session } } = await supabase.auth.getSession();
    const accessToken = session?.access_token;
    const response = await fetch('/api/update-phone', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
      },
      body: JSON.stringify({
        user_id: session?.user?.id,
        phone: fullPhone,
        display_name: session?.user?.email
      })
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      toast.error(result.error || 'Failed to save phone number.');
      return;
    }
    toast.success('Phone number saved!');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-sky-100/90 flex items-center justify-center z-50">
      <div className="relative max-w-4xl w-full mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
        <div className="relative z-20 w-full p-8 md:p-10 flex flex-col items-center lato-onboarding">
          <button
            onClick={onClose}
            aria-label="Close onboarding"
            className="absolute top-4 right-4 text-gray-400 hover:text-black text-2xl font-bold focus:outline-none"
          >
            ×
          </button>

          <div className="w-full max-w-lg mx-auto text-left">
            <h2 className="text-2xl font-bold mb-5 text-black">Welcome to Wave</h2>
            <p className="mb-4 text-gray-700 leading-relaxed">
              Wave is your gentle AI companion—here to listen, support, and help you feel heard, anytime you need it. No judgment, just care.<br/>
              <span className="block h-2"/>
              Your conversations are private and fully encrypted, so you can be yourself and talk freely.
            </p>
            <div className="mb-4 p-3 rounded-lg bg-indigo-50 text-indigo-800 text-sm border border-indigo-200">
              <b>We are beta testing!</b> We are a small team and your feedback would be extremely valuable. We will not spam you.
            </div>

            <label htmlFor="whatsapp-phone" className="block text-black font-medium mb-2">
              WhatsApp Number (for feedback, updates, and early access):
            </label>
            <div className="flex w-full gap-2 mb-2">
              <select
                value={countryCode}
                onChange={e => { setCountryCode(e.target.value); setPhone(''); setError(''); }}
                className="rounded-md border border-indigo-300 bg-white text-black px-2 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                style={{ minWidth: 90 }}
              >
                {COUNTRY_CODES.map(c => (
                  <option key={c.code} value={c.code}>{c.label}</option>
                ))}
              </select>
              <input
                id="whatsapp-phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder={isIndian ? "Phone number" : "Disabled for non-India"}
                value={phone}
                onChange={handlePhoneChange}
                onKeyDown={handleKeyDown}
                maxLength={15}
                disabled={!isIndian}
                className={`flex-1 rounded-md border border-indigo-300 bg-white text-black px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300
                  ${!isIndian ? 'bg-gray-100 cursor-not-allowed' : 'placeholder-gray-400'}`}
              />
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
              className={`w-full max-w-xs py-3 rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-offset-2
                ${agreed
                  ? 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg'
                  : 'bg-indigo-200 text-gray-400 cursor-not-allowed'
                }`}
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
