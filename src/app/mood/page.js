"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../utils/supabaseClient';
import { FaPlus, FaFire, FaChartLine, FaCalendarAlt, FaChartBar, FaChartPie } from 'react-icons/fa';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const MOOD_EMOJIS = {
  happy: '😄',
  calm: '😌',
  neutral: '😐',
  sad: '😢',
  anxious: '😰'
};

const MOOD_COLORS = {
  happy: 'bg-yellow-100 text-yellow-700',
  calm: 'bg-green-100 text-green-700',
  neutral: 'bg-gray-100 text-gray-700',
  sad: 'bg-blue-100 text-blue-700',
  anxious: 'bg-red-100 text-red-700'
};

const MOOD_VALUES = {
  happy: 5,
  calm: 4,
  neutral: 3,
  sad: 2,
  anxious: 1
};

export default function MoodTrackerPage() {
  const router = useRouter();
  const [moodEntries, setMoodEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    streak: 0,
    averageMood: 'neutral',
    weeklyDistribution: {},
    moodTrend: []
  });
  const [showNewMoodModal, setShowNewMoodModal] = useState(false);
  const [selectedMood, setSelectedMood] = useState(null);
  const [moodNote, setMoodNote] = useState('');

  useEffect(() => {
    fetchMoodData();
  }, []);

  const fetchMoodData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }

      // Fetch mood entries
      const { data, error } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', session.user.id)
        .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (error) throw error;

      setMoodEntries(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error('Error fetching mood data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (entries) => {
    // Calculate streak
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    const sortedEntries = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (sortedEntries.length > 0 && sortedEntries[0].date === today) {
      streak = 1;
      for (let i = 1; i < sortedEntries.length; i++) {
        const currentDate = new Date(sortedEntries[i - 1].date);
        const prevDate = new Date(sortedEntries[i].date);
        const diffDays = Math.floor((currentDate - prevDate) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          streak++;
        } else {
          break;
        }
      }
    }

    // Calculate average mood
    const totalMoodValue = entries.reduce((sum, entry) => sum + MOOD_VALUES[entry.mood], 0);
    const averageMoodValue = entries.length > 0 ? totalMoodValue / entries.length : 3;
    
    const averageMood = Object.entries(MOOD_VALUES).find(([_, value]) => 
      Math.abs(value - averageMoodValue) < 0.5
    )?.[0] || 'neutral';

    // Calculate weekly distribution
    const weeklyDistribution = entries.reduce((acc, entry) => {
      const date = new Date(entry.date);
      const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
      acc[dayOfWeek] = (acc[dayOfWeek] || 0) + 1;
      return acc;
    }, {});

    // Calculate mood trend
    const moodTrend = entries
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(entry => ({
        date: entry.date,
        value: MOOD_VALUES[entry.mood]
      }));

    setStats({
      streak,
      averageMood,
      weeklyDistribution,
      moodTrend
    });
  };

  const handleSaveMood = async () => {
    if (!selectedMood) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      const { error } = await supabase
        .from('mood_entries')
        .insert([
          {
            user_id: session.user.id,
            mood: selectedMood,
            note: moodNote,
            date: new Date().toISOString().split('T')[0]
          }
        ]);

      if (error) throw error;

      setShowNewMoodModal(false);
      setSelectedMood(null);
      setMoodNote('');
      fetchMoodData();
    } catch (error) {
      console.error('Error saving mood:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f3e8ff] via-[#f5eafe] to-[#eaf6ff] p-8">
        <div className="max-w-6xl mx-auto">
          <div className="h-8 w-48 bg-white/50 rounded animate-pulse mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-white/50 rounded-xl animate-pulse"></div>
            ))}
          </div>
          <div className="h-96 bg-white/50 rounded-xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  const chartData = {
    labels: stats.moodTrend.map(entry => new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Mood Trend',
        data: stats.moodTrend.map(entry => entry.value),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Mood Trend (Last 30 Days)'
      }
    },
    scales: {
      y: {
        min: 1,
        max: 5,
        ticks: {
          stepSize: 1,
          callback: function(value) {
            return Object.entries(MOOD_VALUES).find(([_, v]) => v === value)?.[0] || '';
          }
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-wave-offwhite p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-wave-forest">Mood Tracker</h1>
          <button
            onClick={() => setShowNewMoodModal(true)}
            className="flex items-center gap-2 bg-wave-teal text-white px-4 py-2 rounded-lg hover:bg-wave-forest transition-colors"
          >
            <FaPlus />
            Log Mood
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <FaFire className="text-orange-500 text-xl" />
              <h2 className="text-lg font-semibold text-gray-800">Current Streak</h2>
            </div>
            <p className="text-3xl font-bold text-wave-forest">{stats.streak} days</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <FaChartLine className="text-blue-500 text-xl" />
              <h2 className="text-lg font-semibold text-gray-800">Average Mood</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-3xl">{MOOD_EMOJIS[stats.averageMood]}</span>
              <span className="text-lg font-medium text-gray-600">
                {stats.averageMood.charAt(0).toUpperCase() + stats.averageMood.slice(1)}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <FaChartBar className="text-purple-500 text-xl" />
              <h2 className="text-lg font-semibold text-gray-800">Entries This Week</h2>
            </div>
            <p className="text-3xl font-bold text-wave-forest">
              {Object.values(stats.weeklyDistribution).reduce((sum, count) => sum + count, 0)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Mood Trend</h2>
            <div className="h-64">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Moods</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 7 }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];
                const entry = moodEntries.find(e => e.date === dateStr);
                
                return (
                  <div
                    key={dateStr}
                    className={`aspect-square rounded-lg flex flex-col items-center justify-center p-4 ${
                      entry ? MOOD_COLORS[entry.mood] : 'bg-gray-50'
                    }`}
                  >
                    <span className="text-2xl mb-2">{entry ? MOOD_EMOJIS[entry.mood] : '📅'}</span>
                    <span className="text-sm font-medium">
                      {date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </span>
                    <span className="text-xs text-gray-500">
                      {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Mood History</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {moodEntries.map((entry) => (
              <div
                key={entry.id}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center p-4 ${
                  MOOD_COLORS[entry.mood]
                }`}
              >
                <span className="text-2xl mb-2">{MOOD_EMOJIS[entry.mood]}</span>
                <span className="text-sm font-medium">
                  {new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                {entry.note && (
                  <p className="text-xs text-center mt-2 line-clamp-2">{entry.note}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {showNewMoodModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold text-wave-forest mb-4">How are you feeling today?</h2>
            <div className="grid grid-cols-5 gap-4 mb-6">
              {Object.entries(MOOD_EMOJIS).map(([mood, emoji]) => (
                <button
                  key={mood}
                  onClick={() => setSelectedMood(mood)}
                  className={`text-4xl p-4 rounded-lg transition-colors ${
                    selectedMood === mood ? 'bg-wave-teal bg-opacity-10 ring-2 ring-wave-teal' : 'hover:bg-gray-100'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <textarea
              value={moodNote}
              onChange={(e) => setMoodNote(e.target.value)}
              placeholder="Add a note (optional)"
              className="w-full p-3 border border-gray-200 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-wave-forest"
              rows={3}
            />
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowNewMoodModal(false);
                  setSelectedMood(null);
                  setMoodNote('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveMood}
                disabled={!selectedMood}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedMood
                    ? 'bg-wave-teal text-white hover:bg-wave-forest'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 