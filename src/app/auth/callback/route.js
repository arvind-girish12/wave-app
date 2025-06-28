import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { shouldBypassAuthServer } from '../../../utils/environment';

export async function GET(request) {
  // If on localhost, just redirect to dashboard
  if (shouldBypassAuthServer()) {
    const redirectUrl = new URL('/dashboard', request.url);
    // Preserve character parameter if present
    const characterParam = new URL(request.url).searchParams.get('character');
    if (characterParam) {
      redirectUrl.searchParams.set('character', characterParam);
    }
    return NextResponse.redirect(redirectUrl);
  }

  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const characterParam = requestUrl.searchParams.get('character');

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    await supabase.auth.exchangeCodeForSession(code);
  }

  const redirectUrl = new URL('/dashboard', request.url);
  // Preserve character parameter if present
  if (characterParam) {
    redirectUrl.searchParams.set('character', characterParam);
  }
  return NextResponse.redirect(redirectUrl);
} 