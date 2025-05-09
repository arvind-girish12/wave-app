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

    // Get mood trends
    const { data: moodEntries } = await supabase
      .from('mood_entries')
      .select('*')
      .eq('user_id', session.user.id)
      .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('date', { ascending: true });

    // Get journal sentiment
    const { data: journalEntries } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', session.user.id)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: true });

    // Get session topics
    const { data: sessions } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', session.user.id)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: true });

    // Get exercise streaks
    const { data: exerciseLogs } = await supabase
      .from('exercise_logs')
      .select('*')
      .eq('user_id', session.user.id)
      .gte('completed_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('completed_at', { ascending: true });

    // Get latest insights
    const { data: insights } = await supabase
      .from('progress_insights')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    // Get unlocked badges
    const { data: userBadges } = await supabase
      .from('user_badges')
      .select(`
        *,
        badges (
          name,
          description,
          icon_url
        )
      `)
      .eq('user_id', session.user.id)
      .order('unlocked_at', { ascending: false });

    // Get all badges for progress tracking
    const { data: allBadges } = await supabase
      .from('badges')
      .select('*')
      .order('trigger_count', { ascending: true });

    // Calculate progress towards badges
    const badgeProgress = allBadges.map(badge => {
      let currentCount = 0;
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      switch (badge.trigger_type) {
        case 'journal':
          currentCount = journalEntries?.filter(entry => 
            new Date(entry.created_at) >= thirtyDaysAgo
          ).length || 0;
          break;
        case 'mood':
          currentCount = moodEntries?.length || 0;
          break;
        case 'session':
          currentCount = sessions?.length || 0;
          break;
        case 'exercise':
          currentCount = exerciseLogs?.length || 0;
          break;
      }

      return {
        ...badge,
        current_count: currentCount,
        progress: Math.min(100, (currentCount / badge.trigger_count) * 100),
        is_unlocked: userBadges?.some(ub => ub.badge_id === badge.id) || false
      };
    });

    return NextResponse.json({
      mood_trends: moodEntries || [],
      journal_sentiment: journalEntries || [],
      session_topics: sessions || [],
      exercise_streaks: exerciseLogs || [],
      latest_insights: insights || [],
      unlocked_badges: userBadges || [],
      badge_progress: badgeProgress
    });
  } catch (error) {
    console.error('Error fetching progress summary:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 