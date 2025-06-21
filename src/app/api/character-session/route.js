import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(req) {
  const supabase = createRouteHandlerClient({ cookies });
  const body = await req.json();
  const { user_email, character_id, session_id, started_at, ended_at, duration_seconds, user_name, user_phone } = body;

  const { data, error } = await supabase
    .from('character_sessions')
    .insert([
      { user_email, character_id, session_id, started_at, ended_at, duration_seconds, user_name, user_phone }
    ]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true, data });
}

export async function PATCH(req) {
  const supabase = createRouteHandlerClient({ cookies });
  const body = await req.json();
  const { session_id, rating, feedback } = body;

  const { data, error } = await supabase
    .from('character_sessions')
    .update({ rating, feedback })
    .eq('session_id', session_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true, data });
} 