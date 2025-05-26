import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { shouldBypassAuthServer } from '../../../utils/environment';

export async function GET(request) {
  // If on localhost, just redirect to dashboard
  if (shouldBypassAuthServer()) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL('/dashboard', request.url));
} 