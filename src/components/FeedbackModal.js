import { useState } from 'react';

export default function FeedbackModal({ open, onClose, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [preferDifferent, setPreferDifferent] = useState(null);
  const [characterPreference, setCharacterPreference] = useState('');

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-lg border border-gray-200 ml-auto mr-auto">
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
        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 rounded bg-gray-200 text-black" onClick={onClose}>Cancel</button>
          <button
            className="px-4 py-2 rounded bg-indigo-600 text-white"
            onClick={() => onSubmit({ rating, preferDifferent, characterPreference })}
            disabled={rating === 0}
          >Submit</button>
        </div>
      </div>
    </div>
  );
} 