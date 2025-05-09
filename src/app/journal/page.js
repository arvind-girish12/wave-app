"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../utils/supabaseClient';
import { formatDistanceToNow } from 'date-fns';
import { FaLink, FaLightbulb, FaRegSmile, FaRegMeh, FaRegFrown, FaPlus } from 'react-icons/fa';

export default function JournalPage() {
  const router = useRouter();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push('/login');
          return;
        }

        const { data, error } = await supabase
          .from('journal_entries')
          .select(`
            *,
            journal_inferences (
              keywords,
              sentiment,
              tone,
              summary
            ),
            sessions!linked_session_id (
              topic,
              agent_type
            )
          `)
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setEntries(data || []);
      } catch (error) {
        console.error('Error fetching journal entries:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, [router]);

  const handleNewEntry = () => {
    router.push('/journal/new');
  };

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'positive':
        return <FaRegSmile className="text-green-500" />;
      case 'neutral':
        return <FaRegMeh className="text-yellow-500" />;
      case 'negative':
        return <FaRegFrown className="text-red-500" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <div className="h-5 w-5 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="h-5 w-5 bg-gray-200 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                    ))}
                  </div>
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-wave-forest">My Journal</h1>
          <button
            onClick={handleNewEntry}
            className="bg-wave-teal text-white px-4 py-2 rounded-lg hover:bg-wave-forest transition-colors flex items-center gap-2"
          >
            <FaPlus />
            New Entry
          </button>
        </div>

        <div className="space-y-4">
          {entries.map((entry) => {
            const inference = entry.journal_inferences?.[0];
            const firstLine = entry.content.split('\n')[0];
            
            return (
              <div
                key={entry.id}
                className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer transform hover:-translate-y-1 duration-200"
                onClick={() => router.push(`/journal/${entry.id}`)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-wave-forest line-clamp-1">
                      {firstLine}
                    </h2>
                    <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                      {entry.content}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {entry.sessions && (
                      <span className="text-wave-teal" title="Linked to session">
                        <FaLink />
                      </span>
                    )}
                    {inference && (
                      <>
                        <span className="text-yellow-500" title="AI insights available">
                          <FaLightbulb />
                        </span>
                        {getSentimentIcon(inference.sentiment)}
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    {inference?.keywords?.slice(0, 3).map((keyword, index) => (
                      <span
                        key={index}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full hover:bg-gray-200 transition-colors"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
            );
          })}

          {entries.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <p className="text-gray-500 mb-4">No journal entries yet. Start writing to begin your journey!</p>
              <button
                onClick={handleNewEntry}
                className="bg-wave-teal text-white px-6 py-2 rounded-lg hover:bg-wave-forest transition-colors"
              >
                Write Your First Entry
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 