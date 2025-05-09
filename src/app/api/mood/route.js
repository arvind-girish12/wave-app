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
    const { data, error } = await supabase
      .from('mood_entries')
      .select('*')
      .eq('user_id', session.user.id)
      .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('date', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching mood entries:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { mood, note, linked_session_id, linked_journal_id } = await request.json();
    const today = new Date().toISOString().split('T')[0];

    // Check if entry already exists for today
    const { data: existingEntry } = await supabase
      .from('mood_entries')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('date', today)
      .single();

    if (existingEntry) {
      // Update existing entry
      const { error } = await supabase
        .from('mood_entries')
        .update({
          mood,
          note,
          linked_session_id,
          linked_journal_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingEntry.id);

      if (error) throw error;
    } else {
      // Create new entry
      const { error } = await supabase
        .from('mood_entries')
        .insert([
          {
            user_id: session.user.id,
            mood,
            note,
            date: today,
            linked_session_id,
            linked_journal_id
          }
        ]);

      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving mood entry:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 