"use client";

import { useEffect, useState } from "react";
import { FaTrophy, FaLightbulb, FaChartLine, FaCalendarAlt } from "react-icons/fa";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function ProgressPage() {
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    try {
      const response = await fetch('/api/progress/summary');
      const data = await response.json();
      setProgressData(data);
    } catch (error) {
      console.error('Error fetching progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-wave-offwhite p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
      </div>
    );
  }

  const moodChartData = {
    labels: progressData?.mood_trends.map(entry => 
      new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    ) || [],
    datasets: [
      {
        label: 'Mood',
        data: progressData?.mood_trends.map(entry => {
          const moodValues = { '😊': 5, '🙂': 4, '😐': 3, '🙁': 2, '😢': 1 };
          return moodValues[entry.mood] || 3;
        }) || [],
        borderColor: '#2E7D32',
        backgroundColor: 'rgba(46, 125, 50, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      y: {
        min: 0,
        max: 6,
        ticks: {
          stepSize: 1,
          callback: (value) => {
            const moodEmojis = ['', '😢', '🙁', '😐', '🙂', '😊'];
            return moodEmojis[value] || '';
          },
        },
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
  };

  return (
    <div className="min-h-screen bg-wave-offwhite p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-wave-forest">Your Progress</h1>
          <div className="flex gap-2">
            {['week', 'month', 'year'].map((timeframe) => (
              <button
                key={timeframe}
                onClick={() => setSelectedTimeframe(timeframe)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedTimeframe === timeframe
                    ? 'bg-wave-forest text-white'
                    : 'bg-white text-wave-forest hover:bg-gray-50'
                }`}
              >
                {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <FaChartLine className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Current Streak</p>
                <p className="text-2xl font-bold text-wave-forest">
                  {progressData?.mood_trends?.length || 0} days
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <FaLightbulb className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Latest Insight</p>
                <p className="text-lg font-medium text-wave-forest line-clamp-1">
                  {progressData?.latest_insights?.[0]?.summary || 'No insights yet'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-50 rounded-lg">
                <FaTrophy className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Badges Earned</p>
                <p className="text-2xl font-bold text-wave-forest">
                  {progressData?.unlocked_badges?.length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mood Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-wave-forest mb-6">Mood Trends</h2>
          <div className="h-80">
            <Line data={moodChartData} options={chartOptions} />
          </div>
        </div>

        {/* Badges and Insights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Badges */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-wave-forest mb-6">Your Badges</h2>
            <div className="grid grid-cols-2 gap-4">
              {progressData?.badge_progress?.map((badge) => (
                <div
                  key={badge.id}
                  className={`p-4 rounded-lg border ${
                    badge.is_unlocked
                      ? 'border-green-200 bg-green-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <img
                      src={badge.icon_url}
                      alt={badge.name}
                      className="w-8 h-8"
                    />
                    <h3 className="font-medium text-wave-forest">{badge.name}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{badge.description}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-wave-forest h-2 rounded-full"
                      style={{ width: `${badge.progress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {badge.current_count} / {badge.trigger_count}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Insights */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-wave-forest mb-6">Latest Insights</h2>
            <div className="space-y-4">
              {progressData?.latest_insights?.map((insight) => (
                <div
                  key={insight.id}
                  className="p-4 rounded-lg border border-gray-200 hover:border-wave-forest transition-colors"
                >
                  <p className="text-gray-800 mb-2">{insight.summary}</p>
                  <div className="flex flex-wrap gap-2">
                    {insight.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-wave-forest/10 text-wave-forest rounded-full text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 