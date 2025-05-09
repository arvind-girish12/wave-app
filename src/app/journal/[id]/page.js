"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../utils/supabaseClient';
import { formatDistanceToNow } from 'date-fns';
import { FaLink, FaLightbulb, FaRegSmile, FaRegMeh, FaRegFrown, FaArrowLeft, FaEdit } from 'react-icons/fa';

export default function JournalEntryDetail({ params }) {
  const router = useRouter();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEntry = async () => {
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
              id,
              topic,
              agent_type,
              created_at
            )
          `)
          .eq('id', params.id)
          .single();

        if (error) throw error;
        setEntry(data);
      } catch (error) {
        console.error('Error fetching journal entry:', error);
        setError('Failed to load journal entry');
      } finally {
        setLoading(false);
      }
    };

    fetchEntry();
  }, [params.id, router]);

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
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-8"></div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="h-8 w-3/4 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !entry) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-red-500 mb-4">{error || 'Entry not found'}</p>
          <button
            onClick={() => router.back()}
            className="text-wave-teal hover:text-wave-forest flex items-center gap-2 mx-auto"
          >
            <FaArrowLeft />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const inference = entry.journal_inferences?.[0];

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-wave-forest mb-8 transition-colors"
        >
          <FaArrowLeft />
          Back to Journal
        </button>

        <div className="bg-white rounded-lg shadow-sm p-6 transform transition-all duration-200 hover:shadow-md">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-wave-forest mb-2">
                {entry.content.split('\n')[0]}
              </h1>
              <p className="text-gray-500">
                {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {entry.sessions && (
                <button
                  onClick={() => router.push(`/sessions/${entry.sessions.id}`)}
                  className="flex items-center gap-2 text-wave-teal hover:text-wave-forest transition-colors"
                >
                  <FaLink />
                  View Session
                </button>
              )}
              <button
                onClick={() => router.push(`/journal/${entry.id}/edit`)}
                className="flex items-center gap-2 text-gray-600 hover:text-wave-forest transition-colors"
              >
                <FaEdit />
                Edit
              </button>
            </div>
          </div>

          <div className="prose max-w-none mb-8">
            {entry.content.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          {inference && (
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center gap-2 mb-4">
                <FaLightbulb className="text-yellow-500" />
                <h2 className="text-lg font-semibold text-wave-forest">AI Insights</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-700 mb-2">Summary</h3>
                  <p className="text-gray-600">{inference.summary}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-700 mb-2">Tone & Sentiment</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-gray-600">Tone:</span>
                    <span className="font-medium text-wave-forest">{inference.tone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Sentiment:</span>
                    <span className="font-medium text-wave-forest">{inference.sentiment}</span>
                    {getSentimentIcon(inference.sentiment)}
                  </div>
                </div>
              </div>

              {inference.keywords?.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-medium text-gray-700 mb-2">Key Themes</h3>
                  <div className="flex flex-wrap gap-2">
                    {inference.keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm hover:bg-gray-200 transition-colors"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 