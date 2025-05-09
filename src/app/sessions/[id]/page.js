"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../utils/supabaseClient';
import { formatDistanceToNow } from 'date-fns';

export default function SessionDetail({ params }) {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data: { session: authSession } } = await supabase.auth.getSession();
        
        if (!authSession) {
          router.push('/login');
          return;
        }

        const { data, error } = await supabase
          .from('sessions')
          .select(`
            *,
            messages (
              id,
              content,
              timestamp,
              sender
            )
          `)
          .eq('id', params.id)
          .eq('user_id', authSession.user.id)
          .single();

        if (error) throw error;
        setSession(data);
        setMessages(data.messages || []);
      } catch (error) {
        console.error('Error fetching session:', error);
        router.push('/sessions');
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [params.id, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const { data: { session: authSession } } = await supabase.auth.getSession();
      
      if (!authSession) {
        router.push('/login');
        return;
      }

      // Add user message
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          session_id: params.id,
          sender: 'user',
          content: newMessage.trim()
        });

      if (messageError) throw messageError;

      // Simulate agent response (you can replace this with actual AI response)
      setTimeout(async () => {
        const { error: agentError } = await supabase
          .from('messages')
          .insert({
            session_id: params.id,
            sender: 'agent',
            content: 'I understand. Let me help you with that.'
          });

        if (agentError) throw agentError;

        // Refresh messages
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('session_id', params.id)
          .order('timestamp', { ascending: true });

        if (error) throw error;
        setMessages(data);
      }, 1000);

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-wave-offwhite">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-wave-forest"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex justify-center items-center h-screen bg-wave-offwhite">
        <p className="text-gray-500">Session not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-wave-offwhite">
      <div className="p-4 bg-white shadow-sm">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-xl font-semibold text-wave-forest">{session.topic}</h1>
          <p className="text-sm text-gray-600">{session.agent_type}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.sender === 'user'
                    ? 'bg-wave-teal text-white'
                    : 'bg-white text-gray-800'
                }`}
              >
                <p>{message.content}</p>
                <span className="text-xs opacity-70 mt-1 block">
                  {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                </span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <form onSubmit={handleSendMessage} className="p-4 bg-white border-t">
        <div className="max-w-4xl mx-auto flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-wave-teal"
          />
          <button
            type="submit"
            className="bg-wave-teal text-white px-4 py-2 rounded-lg hover:bg-wave-forest transition-colors"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
} 