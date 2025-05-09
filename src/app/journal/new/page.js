"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../utils/supabaseClient';
import { FaLink, FaTimes } from 'react-icons/fa';

export default function NewJournalEntry() {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push('/login');
          return;
        }

        const { data, error } = await supabase
          .from('sessions')
          .select('id, topic, created_at')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setSessions(data || []);
      } catch (error) {
        console.error('Error fetching sessions:', error);
        setError('Failed to load sessions');
      }
    };

    fetchSessions();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }

      const { data: entry, error: entryError } = await supabase
        .from('journal_entries')
        .insert([
          {
            user_id: session.user.id,
            content,
            linked_session_id: selectedSession?.id || null
          }
        ])
        .select()
        .single();

      if (entryError) throw entryError;

      // TODO: Add AI inference generation here
      // For now, we'll just redirect to the entry
      router.push(`/journal/${entry.id}`);
    } catch (error) {
      console.error('Error creating journal entry:', error);
      setError('Failed to create journal entry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-wave-forest">New Journal Entry</h1>
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-wave-forest"
          >
            Cancel
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your thoughts here..."
              className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wave-teal focus:border-transparent resize-none"
              required
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FaLink className="text-wave-teal" />
              <h3 className="font-semibold text-gray-700">Link to Session (Optional)</h3>
            </div>

            {selectedSession ? (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-wave-forest">{selectedSession.topic}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(selectedSession.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedSession(null)}
                  className="text-gray-500 hover:text-red-500"
                >
                  <FaTimes />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sessions.map((session) => (
                  <button
                    key={session.id}
                    type="button"
                    onClick={() => setSelectedSession(session)}
                    className="text-left p-3 border border-gray-200 rounded-lg hover:border-wave-teal hover:bg-gray-50 transition-colors"
                  >
                    <p className="font-medium text-wave-forest">{session.topic}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(session.created_at).toLocaleDateString()}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || !content.trim()}
              className="bg-wave-teal text-white px-6 py-2 rounded-lg hover:bg-wave-forest transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 