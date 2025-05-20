import { NextResponse } from 'next/server';
import { supabaseServer } from '../../../utils/supabaseServerClient';

export async function POST(request) {
  try {
    const { user_id, phone, display_name } = await request.json();

    if (!user_id || !phone) {
      return NextResponse.json({ error: 'Missing user_id or phone' }, { status: 400 });
    }

    // Upsert the phone number into user_profiles
    const { error } = await supabaseServer
      .from('user_profiles')
      .upsert(
        { 
          user_id, 
          phone_no: phone, 
          display_name: display_name || 'User', 
          created_at: new Date().toISOString() 
        },
        { onConflict: 'user_id', ignoreDuplicates: false }
      );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
} 