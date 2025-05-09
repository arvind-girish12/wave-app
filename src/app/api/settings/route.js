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

    // Get user settings and profile
    const [settingsResponse, profileResponse] = await Promise.all([
      supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', session.user.id)
        .single(),
      supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single()
    ]);

    if (settingsResponse.error) throw settingsResponse.error;
    if (profileResponse.error) throw profileResponse.error;

    return NextResponse.json({
      settings: settingsResponse.data,
      profile: profileResponse.data
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { notify_mood_reminder, notify_progress_summary, notify_journal_nudge, notify_exercise_streak } = await request.json();

    // Update settings
    const { error } = await supabase
      .from('user_settings')
      .update({
        notify_mood_reminder,
        notify_progress_summary,
        notify_journal_nudge,
        notify_exercise_streak,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', session.user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 