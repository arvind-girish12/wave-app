import { NextResponse } from 'next/server';
import { supabaseServer } from '../../../utils/supabaseServerClient';

export async function POST(request) {
  try {
    const { phone, display_name } = await request.json();

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // Insert the phone number and display name
    const { error } = await supabaseServer
      .from('user_profiles')
      .insert([
        { 
          phone_no: phone, 
          display_name: display_name || 'User', 
          created_at: new Date().toISOString() 
        }
      ]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
} 