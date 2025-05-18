export const dynamic = "force-dynamic";
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// GET /api/profile → return profile info, activity summary, and preferences
export async function GET(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = session.user.id;

    // Get profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (profileError && profileError.code === 'PGRST116') {
      // No profile found, return empty response
      return NextResponse.json({ profile: null, stats: null }, { status: 200 });
    }
    if (profileError) throw profileError;

    // Get summary stats
    const [sessions, journals, exercises, moods] = await Promise.all([
      supabase.from('sessions').select('id').eq('user_id', userId),
      supabase.from('journal_entries').select('id').eq('user_id', userId),
      supabase.from('exercise_logs').select('id').eq('user_id', userId),
      supabase.from('mood_entries').select('mood').eq('user_id', userId)
    ]);
    const avgMood = moods.data && moods.data.length
      ? (moods.data.map(m => ({ happy: 5, good: 4, neutral: 3, sad: 2, angry: 1 })[m.mood] || 3)
          .reduce((a, b) => a + b, 0) / moods.data.length).toFixed(2)
      : null;

    return NextResponse.json({
      profile,
      stats: {
        sessions: sessions.data.length,
        journal_entries: journals.data.length,
        exercises_completed: exercises.data.length,
        avg_mood: avgMood
      }
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT /api/profile/preferences → update agent preferences	expects { preferred_tone, preferred_agent, allow_agent_suggestions }
export async function PUT(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = session.user.id;
    const { preferred_tone, preferred_agent, allow_agent_suggestions } = await request.json();
    const { error } = await supabase
      .from('user_profiles')
      .update({ preferred_tone, preferred_agent, allow_agent_suggestions })
      .eq('user_id', userId);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating preferences:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 