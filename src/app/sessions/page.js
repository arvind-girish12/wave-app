"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../utils/supabaseClient';
import { formatDistanceToNow } from 'date-fns';

export default function SessionsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

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
          .select(`
            *,
            messages (
              content,
              timestamp,
              sender
            )
          `)
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setSessions(data || []);
      } catch (error) {
        console.error('Error fetching sessions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [router]);

  const handleNewSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('sessions')
        .insert({
          topic: 'New Conversation',
          agent_type: 'General Support',
          user_id: session.user.id
        })
        .select()
        .single();

      if (error) throw error;
      router.push(`/sessions/${data.id}`);
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-wave-offwhite">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-wave-forest"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-wave-forest">My Conversations</h1>
          <button
            onClick={handleNewSession}
            className="bg-wave-teal text-white px-4 py-2 rounded-lg hover:bg-wave-forest transition-colors"
          >
            + New Session
          </button>
        </div>

        <div className="space-y-4">
          {sessions.map((session) => {
            const lastMessage = session.messages?.[session.messages.length - 1];
            return (
              <div
                key={session.id}
                className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/sessions/${session.id}`)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h2 className="text-lg font-semibold text-wave-forest">{session.agent_type}</h2>
                    <p className="text-sm text-gray-600">{session.topic}</p>
                  </div>
                  <span className="text-sm text-gray-500">
                    {lastMessage ? formatDistanceToNow(new Date(lastMessage.timestamp), { addSuffix: true }) : 'No messages'}
                  </span>
                </div>
                {lastMessage && (
                  <p className="text-gray-700 line-clamp-2">{lastMessage.content}</p>
                )}
              </div>
            );
          })}

          {sessions.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No conversations yet. Start a new session to begin!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 