"use client";

import { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { toast } from 'react-hot-toast';

const COUNTRY_CODES = [
  { code: '+91', label: '🇮🇳 +91' },
  { code: '+1', label: '🇺🇸 +1' },
  { code: '+44', label: '🇬🇧 +44' },
  { code: '+61', label: '🇦🇺 +61' },
  { code: '+971', label: '🇦🇪 +971' },
  // Add more as needed
];

export default function OnboardingModal({ onClose }) {
  const [countryCode, setCountryCode] = useState(COUNTRY_CODES[0].code);
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const handlePhoneChange = (e) => {
    // Only allow numbers, spaces, dashes
    let value = e.target.value.replace(/[^0-9\s-]/g, '');
    // Optionally format (e.g., 12345 67890 for India)
    if (countryCode === '+91') {
      value = value.replace(/(\d{5})(\d{0,5})/, '$1 $2').trim();
    }
    setPhone(value);
    setError('');
  };

  const handleGetStarted = async () => {
    // Basic validation: must be at least 8 digits
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 8) {
      setError('Please enter a valid phone number.');
      return;
    }
    // Send phone number to backend API endpoint with auth token
    const fullPhone = `${countryCode} ${digits}`;
    const { data: { session } } = await supabase.auth.getSession();
    const accessToken = session?.access_token;
    const response = await fetch('/api/update-phone', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {})
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
    <div className="fixed inset-0 bg-gradient-to-br from-[#0A0613]/90 via-[#2B176B]/90 to-[#3B2BFF]/90 flex items-center justify-center z-50">
      <div className="onboarding-modal-card relative max-w-4xl w-full p-0 mx-4 flex flex-col items-center rounded-2xl border-2 border-[#6B4EFF] shadow-2xl overflow-hidden">
        <div className="absolute inset-0 z-0" style={{ background: 'url(/onboarding-background.jpeg) center center / cover no-repeat' }} />
        <div className="absolute inset-0 z-10 bg-[#1a1333]/20" />
        <div className="relative z-20 w-full p-8 md:p-10 flex flex-col items-center lato-onboarding">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-[#D1D5DB] hover:text-white text-2xl font-bold focus:outline-none"
            aria-label="Close onboarding"
          >
            ×
          </button>
          <div className="flex flex-col items-start text-left w-full max-w-lg mx-auto">
            <h2 className="text-2xl font-bold mb-5 text-white drop-shadow">Welcome to Wave</h2>
            <p className="mb-4 text-[#D1D5DB] leading-relaxed">
              Wave is your gentle AI companion—here to listen, support, and help you feel heard, anytime you need it. No judgment, just care.<br />
              <span className="block h-2" />
              Your conversations are private and fully encrypted, so you can be yourself and talk freely.
            </p>
            <div className="mb-4 p-3 rounded-lg bg-[#2B176B]/60 text-[#E9D7FF] text-sm border border-[#6B4EFF]">
              <b>We are beta testing!</b> We are a small team and your feedback would be extremely valuable. We will not spam you.
            </div>
            <label className="block text-white font-medium mb-2 mt-2" htmlFor="whatsapp-phone">WhatsApp Number (for feedback, updates, and early access):</label>
            <div className="flex w-full gap-2 mb-2">
              <select
                className="rounded-md border border-[#6B4EFF] bg-[#1a1333] text-white px-2 py-2 focus:outline-none focus:ring-2 focus:ring-[#6B4EFF]"
                value={countryCode}
                onChange={e => setCountryCode(e.target.value)}
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
                className="flex-1 rounded-md border border-[#6B4EFF] bg-[#1a1333] text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] placeholder:text-[#D1D5DB]"
                placeholder="Phone number"
                value={phone}
                onChange={handlePhoneChange}
                maxLength={15}
              />
            </div>
            {error && <div className="text-red-400 text-xs mb-2">{error}</div>}
            <button
              onClick={handleGetStarted}
              className="bg-[#6B4EFF] text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:bg-[#3B2BFF] transition-colors w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:ring-offset-2 mt-4"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 