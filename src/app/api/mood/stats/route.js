export const dynamic = "force-dynamic";
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get last 30 days of mood entries
    const { data: entries, error } = await supabase
      .from('mood_entries')
      .select('*')
      .eq('user_id', session.user.id)
      .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (error) throw error;

    // Calculate statistics
    const stats = {
      streak: 0,
      averageMood: 0,
      weeklyDistribution: {
        '😊': 0,
        '😌': 0,
        '😐': 0,
        '😔': 0,
        '😢': 0
      }
    };

    if (entries.length > 0) {
      // Calculate streak
      let currentStreak = 0;
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      // Check if there's an entry for today or yesterday
      const hasRecentEntry = entries.some(entry => 
        entry.date === today || entry.date === yesterday
      );

      if (hasRecentEntry) {
        currentStreak = 1;
        let checkDate = new Date(entries[0].date);
        
        for (let i = 1; i < entries.length; i++) {
          const prevDate = new Date(entries[i].date);
          const dayDiff = Math.floor((checkDate - prevDate) / (24 * 60 * 60 * 1000));
          
          if (dayDiff === 1) {
            currentStreak++;
            checkDate = prevDate;
          } else {
            break;
          }
        }
      }
      stats.streak = currentStreak;

      // Calculate average mood
      const moodValues = {
        '😊': 5,
        '😌': 4,
        '😐': 3,
        '😔': 2,
        '😢': 1
      };
      
      const totalMoodValue = entries.reduce((sum, entry) => sum + moodValues[entry.mood], 0);
      stats.averageMood = Math.round((totalMoodValue / entries.length) * 10) / 10;

      // Calculate weekly distribution
      const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const weeklyEntries = entries.filter(entry => entry.date >= lastWeek);
      
      weeklyEntries.forEach(entry => {
        stats.weeklyDistribution[entry.mood]++;
      });
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching mood statistics:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 