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

    // Get all badges
    const { data: badges, error: badgesError } = await supabase
      .from('badges')
      .select('*')
      .order('trigger_count', { ascending: true });

    if (badgesError) throw badgesError;

    // Get user's unlocked badges
    const { data: userBadges, error: userBadgesError } = await supabase
      .from('user_badges')
      .select('badge_id')
      .eq('user_id', session.user.id);

    if (userBadgesError) throw userBadgesError;

    // Get user's activity counts
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Get journal count
    const { count: journalCount } = await supabase
      .from('journal_entries')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', session.user.id)
      .gte('created_at', thirtyDaysAgo.toISOString());

    // Get mood count
    const { count: moodCount } = await supabase
      .from('mood_entries')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', session.user.id)
      .gte('date', thirtyDaysAgo.toISOString().split('T')[0]);

    // Get session count
    const { count: sessionCount } = await supabase
      .from('sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', session.user.id)
      .gte('created_at', thirtyDaysAgo.toISOString());

    // Get exercise count
    const { count: exerciseCount } = await supabase
      .from('exercise_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', session.user.id)
      .gte('completed_at', thirtyDaysAgo.toISOString());

    // Calculate progress for each badge
    const badgesWithProgress = badges.map(badge => {
      let currentCount = 0;
      let isUnlocked = userBadges?.some(ub => ub.badge_id === badge.id) || false;

      switch (badge.trigger_type) {
        case 'journal':
          currentCount = journalCount || 0;
          break;
        case 'mood':
          currentCount = moodCount || 0;
          break;
        case 'session':
          currentCount = sessionCount || 0;
          break;
        case 'exercise':
          currentCount = exerciseCount || 0;
          break;
      }

      return {
        ...badge,
        current_count: currentCount,
        progress: Math.min(100, (currentCount / badge.trigger_count) * 100),
        is_unlocked: isUnlocked,
        remaining: Math.max(0, badge.trigger_count - currentCount)
      };
    });

    return NextResponse.json({
      badges: badgesWithProgress,
      activity_counts: {
        journal: journalCount || 0,
        mood: moodCount || 0,
        session: sessionCount || 0,
        exercise: exerciseCount || 0
      }
    });
  } catch (error) {
    console.error('Error fetching badges:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 