"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../utils/supabaseClient';
import { FaArrowLeft, FaCheck, FaPlay, FaPause, FaRegClock } from 'react-icons/fa';

const EXERCISE_TYPE_COLORS = {
  breathing: 'bg-blue-100 text-blue-700',
  affirmation: 'bg-green-100 text-green-700',
  cbt: 'bg-orange-100 text-orange-700',
  visualization: 'bg-pink-100 text-pink-700'
};

export default function ExerciseDetailPage({ params }) {
  const router = useRouter();
  const [exercise, setExercise] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const fetchExercise = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push('/login');
          return;
        }

        const { data, error } = await supabase
          .from('exercises')
          .select('*')
          .eq('id', params.id)
          .single();

        if (error) throw error;
        setExercise(data);
        setTimeLeft(data.duration_sec);
      } catch (error) {
        console.error('Error fetching exercise:', error);
        setError('Failed to load exercise');
      } finally {
        setLoading(false);
      }
    };

    fetchExercise();
  }, [params.id, router]);

  useEffect(() => {
    let timer;
    if (isPlaying && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
        setProgress(prev => {
          const newProgress = ((exercise.duration_sec - (timeLeft - 1)) / exercise.duration_sec) * 100;
          return Math.min(newProgress, 100);
        });
      }, 1000);
    } else if (timeLeft === 0) {
      setIsPlaying(false);
      handleComplete();
    }
    return () => clearInterval(timer);
  }, [isPlaying, timeLeft, exercise]);

  const handleComplete = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from('exercise_logs')
        .insert([
          {
            user_id: session.user.id,
            exercise_id: exercise.id,
            completed_at: new Date().toISOString()
          }
        ]);

      if (error) throw error;
      router.push('/exercises');
    } catch (error) {
      console.error('Error logging completion:', error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-wave-offwhite p-8">
        <div className="max-w-3xl mx-auto">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-8"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !exercise) {
    return (
      <div className="min-h-screen bg-wave-offwhite p-8">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-red-500 mb-4">{error || 'Exercise not found'}</p>
          <button
            onClick={() => router.push('/exercises')}
            className="text-wave-forest hover:underline"
          >
            Return to exercises
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-wave-offwhite p-8">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => router.push('/exercises')}
          className="flex items-center gap-2 text-wave-forest hover:text-wave-teal mb-8 transition-colors"
        >
          <FaArrowLeft />
          Back to exercises
        </button>

        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-wave-forest mb-2">{exercise.title}</h1>
              <p className="text-gray-600">{exercise.description}</p>
            </div>
            <span className={`text-sm px-4 py-2 rounded-full mt-4 md:mt-0 ${
              EXERCISE_TYPE_COLORS[exercise.type] || 'bg-gray-100 text-gray-600'
            }`}>
              {exercise.type.charAt(0).toUpperCase() + exercise.type.slice(1)}
            </span>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500 flex items-center gap-2">
                <FaRegClock />
                {formatTime(timeLeft)} remaining
              </span>
              <span className="text-sm text-gray-500">{Math.round(progress)}% complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-wave-forest h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="space-y-4">
            {exercise.steps.map((step, index) => (
              <div
                key={index}
                className={`p-6 rounded-xl border transition-all duration-300 ${
                  index === currentStep
                    ? 'border-wave-forest bg-wave-offwhite scale-105'
                    : index < currentStep
                    ? 'border-green-200 bg-green-50'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                    index === currentStep
                      ? 'bg-wave-forest text-white scale-110'
                      : index < currentStep
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {index < currentStep ? (
                      <FaCheck />
                    ) : (
                      <span className="font-medium">{index + 1}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800 text-lg">{step}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <button
              onClick={() => {
                setIsPlaying(!isPlaying);
                if (!isPlaying && currentStep < exercise.steps.length - 1) {
                  setCurrentStep(prev => prev + 1);
                }
              }}
              className={`flex items-center gap-3 px-8 py-4 rounded-xl text-white text-lg font-medium transition-all duration-300 transform hover:scale-105 ${
                isPlaying ? 'bg-wave-forest' : 'bg-wave-teal'
              }`}
            >
              {isPlaying ? (
                <>
                  <FaPause />
                  Pause
                </>
              ) : (
                <>
                  <FaPlay />
                  Start Exercise
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 