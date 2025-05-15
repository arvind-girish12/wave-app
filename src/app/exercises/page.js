"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../utils/supabaseClient';
import { FaPlay, FaRegClock, FaRegCheckCircle, FaSearch } from 'react-icons/fa';

const EXERCISE_TYPES = [
  { id: 'all', label: 'All', icon: '🧘', color: 'bg-purple-100 text-purple-700' },
  { id: 'breathing', label: 'Breathing', icon: '🫁', color: 'bg-blue-100 text-blue-700' },
  { id: 'affirmation', label: 'Affirmations', icon: '🗣️', color: 'bg-green-100 text-green-700' },
  { id: 'cbt', label: 'CBT', icon: '🧠', color: 'bg-orange-100 text-orange-700' },
  { id: 'visualization', label: 'Visualizations', icon: '🌅', color: 'bg-pink-100 text-pink-700' }
];

export default function ExercisesPage() {
  const router = useRouter();
  const [exercises, setExercises] = useState([]);
  const [selectedType, setSelectedType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [completedExercises, setCompletedExercises] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push('/login');
          return;
        }

        // Fetch exercises
        const { data: exercisesData, error: exercisesError } = await supabase
          .from('exercises')
          .select('*')
          .order('created_at', { ascending: false });

        if (exercisesError) throw exercisesError;

        // Fetch completed exercises
        const { data: logsData, error: logsError } = await supabase
          .from('exercise_logs')
          .select('exercise_id')
          .eq('user_id', session.user.id);

        if (logsError) throw logsError;

        setExercises(exercisesData || []);
        setCompletedExercises(new Set(logsData?.map(log => log.exercise_id) || []));
      } catch (error) {
        console.error('Error fetching exercises:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, [router]);

  const filteredExercises = exercises
    .filter(exercise => selectedType === 'all' || exercise.type === selectedType)
    .filter(exercise => 
      exercise.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exercise.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f3e8ff] via-[#f5eafe] to-[#eaf6ff] p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div className="h-8 w-48 bg-white/50 rounded animate-pulse"></div>
          </div>
          <div className="flex gap-4 mb-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 w-24 bg-white/50 rounded animate-pulse"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white/50 rounded-xl p-6 shadow-sm">
                <div className="h-6 w-3/4 bg-white/70 rounded animate-pulse mb-4"></div>
                <div className="h-4 w-full bg-white/70 rounded animate-pulse mb-4"></div>
                <div className="h-8 w-24 bg-white/70 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-wave-offwhite p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-wave-forest">Your Tools for the Moment</h1>
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search exercises..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-wave-forest focus:border-transparent"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>

        <div className="flex gap-4 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {EXERCISE_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-200 ${
                selectedType === type.id
                  ? `${type.color} shadow-md scale-105`
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="text-xl">{type.icon}</span>
              <span className="font-medium">{type.label}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExercises.map((exercise) => (
            <div
              key={exercise.id}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-1"
            >
              <div className="flex flex-col h-full">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-xl font-semibold text-wave-forest">{exercise.title}</h2>
                    {completedExercises.has(exercise.id) && (
                      <FaRegCheckCircle className="text-green-500" title="Completed" />
                    )}
                  </div>
                  <p className="text-gray-600 mb-4 line-clamp-2">{exercise.description}</p>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="flex items-center gap-1 text-sm text-gray-500">
                      <FaRegClock />
                      {formatDuration(exercise.duration_sec)}
                    </span>
                    <span className={`text-sm px-3 py-1 rounded-full ${
                      EXERCISE_TYPES.find(t => t.id === exercise.type)?.color || 'bg-gray-100 text-gray-600'
                    }`}>
                      {exercise.type.charAt(0).toUpperCase() + exercise.type.slice(1)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => router.push(`/exercises/${exercise.id}`)}
                  className="flex items-center justify-center gap-2 bg-wave-teal text-white px-4 py-2 rounded-lg hover:bg-wave-forest transition-colors w-full"
                >
                  <FaPlay />
                  Start Exercise
                </button>
              </div>
            </div>
          ))}

          {filteredExercises.length === 0 && (
            <div className="col-span-full text-center py-12 bg-white rounded-xl shadow-sm">
              <p className="text-gray-500">No exercises found for this category.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 