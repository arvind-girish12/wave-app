"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { toast } from 'react-hot-toast';

export default function FeedbackModal({ open, onClose, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [preferDifferent, setPreferDifferent] = useState(null);
  const [characterPreference, setCharacterPreference] = useState('');
  const [willingSurvey, setWillingSurvey] = useState(true); // Default to yes
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [isIndian, setIsIndian] = useState(null);
  const [locationChecked, setLocationChecked] = useState(false);

  // Detect if user is from India using browser settings
  const detectLocation = () => {
    // Method 1: Check timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const indianTimezones = ['Asia/Kolkata', 'Asia/Calcutta'];
    
    // Method 2: Check locale
    const locale = navigator.language || navigator.languages?.[0] || '';
    const hasIndianLocale = locale.includes('IN') || locale.includes('in');
    
    // Method 3: Check currency from Intl.NumberFormat (if available)
    let hasIndianCurrency = false;
    try {
      const formatter = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'INR' });
      const resolved = formatter.resolvedOptions();
      hasIndianCurrency = resolved.currency === 'INR';
    } catch (e) {
      // Ignore currency detection errors
    }

    // Determine if user is likely from India
    const isLikelyIndian = indianTimezones.includes(timezone) || hasIndianLocale || hasIndianCurrency;
    
    setIsIndian(isLikelyIndian);
    setLocationChecked(true);
  };

  // Run location detection on component mount
  useEffect(() => {
    if (open && !locationChecked) {
      detectLocation();
    }
  }, [open, locationChecked]);

  const handleKeyDown = (e) => {
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
    let value = e.target.value.replace(/[^0-9\s-]/g, '');
    value = value.replace(/(\d{5})(\d{0,5})/, '$1 $2').trim();
    setPhone(value);
    setError('');
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Please provide a rating.');
      return;
    }

    // Validate phone if user is willing to chat and is from India
    if (willingSurvey && isIndian) {
      const digits = phone.replace(/\D/g, '');
      if (digits.length < 8) {
        setError('Please enter a valid phone number.');
        return;
      }

      // Save phone number to database
      try {
        const fullPhone = `+91 ${digits}`;
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
      } catch (error) {
        toast.error('Failed to save phone number.');
        return;
      }
    }

    // Submit feedback
    onSubmit({ 
      rating, 
      preferDifferent, 
      characterPreference,
      willingSurvey: isIndian ? willingSurvey : null,
      phone: (willingSurvey && isIndian) ? phone : null
    });
  };

  const handleClose = () => {
    // Reset form state
    setRating(0);
    setPreferDifferent(null);
    setCharacterPreference('');
    setWillingSurvey(true); // Reset to default yes
    setPhone('');
    setError('');
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-lg border border-gray-200 ml-auto mr-auto max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-black">Session Feedback</h2>
        
        <div className="mb-4">
          <label className="block mb-2 font-medium text-black">How would you rate this session?</label>
          <div className="flex gap-2">
            {[1,2,3,4,5].map(star => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={star <= rating ? "text-yellow-400 text-2xl" : "text-gray-300 text-2xl"}
              >★</button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-medium text-black">Would you prefer a different character?</label>
          <div className="flex gap-4">
            <label className="text-black">
              <input
                type="radio"
                name="preferDifferent"
                value="yes"
                checked={preferDifferent === true}
                onChange={() => setPreferDifferent(true)}
              /> Yes
            </label>
            <label className="text-black">
              <input
                type="radio"
                name="preferDifferent"
                value="no"
                checked={preferDifferent === false}
                onChange={() => setPreferDifferent(false)}
              /> No
            </label>
          </div>
        </div>

        {preferDifferent && (
          <div className="mb-4">
            <label className="block mb-2 font-medium text-black">What kind of character would you like to speak to?</label>
            <textarea
              className="w-full border rounded p-2 text-black"
              value={characterPreference}
              onChange={e => setCharacterPreference(e.target.value)}
              rows={3}
            />
          </div>
        )}

        {/* Only show for Indian users */}
        {isIndian && (
          <>
            <div className="mb-4">
              <label className="block mb-2 font-medium text-black">Would you be okay to have a quick chat with us regarding the feedback?</label>
              <div className="flex gap-4">
                <label className="text-black">
                  <input
                    type="radio"
                    name="willingSurvey"
                    value="yes"
                    checked={willingSurvey === true}
                    onChange={() => setWillingSurvey(true)}
                  /> Yes
                </label>
                <label className="text-black">
                  <input
                    type="radio"
                    name="willingSurvey"
                    value="no"
                    checked={willingSurvey === false}
                    onChange={() => {
                      setWillingSurvey(false);
                      setPhone('');
                      setError('');
                    }}
                  /> No
                </label>
              </div>
            </div>

            {/* Phone input - only show when they select yes */}
            {willingSurvey && (
              <div className="mb-4">
                <label htmlFor="whatsapp-phone" className="block text-black font-medium mb-2">
                  WhatsApp Number (we'll reach out for a quick feedback chat):
                </label>
                <div className="flex w-full gap-2">
                  <span className="rounded-md border border-gray-300 bg-gray-50 text-black px-3 py-2 font-medium text-sm">
                    🇮🇳 +91
                  </span>
                  <input
                    id="whatsapp-phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="Phone number"
                    value={phone}
                    onChange={handlePhoneChange}
                    onKeyDown={handleKeyDown}
                    maxLength={15}
                    className="flex-1 rounded-md border border-gray-300 bg-white text-black px-3 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                </div>
              </div>
            )}
          </>
        )}

        {error && (
          <div className="text-red-500 text-xs mb-4">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button 
            className="px-4 py-2 rounded bg-gray-200 text-black" 
            onClick={handleClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded bg-indigo-600 text-white disabled:bg-gray-400"
            onClick={handleSubmit}
            disabled={rating === 0}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}