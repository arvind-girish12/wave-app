import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = "force-dynamic";

const TOUGH_TONGUE_API_TOKEN = 'n5wfYV9ffqSzULGKGaS5X-7XuUf2Svimj46P1Zlbbx4';
const SCENARIO_ID = '681df5ff4e0a1c83aae411ec';

// Analyze the session data
export async function POST(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the current user
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the user's email and latest session ID from the request
    const userEmail = session.user.email;
    const { latestSessionId } = await request.json();

    if (!latestSessionId) {
      return NextResponse.json(
        { error: 'Latest session ID is required' },
        { status: 400 }
      );
    }

    // Fetch scenario details
    const scenarioResponse = await fetch('https://api.toughtongueai.com/api/public/scenarios', {
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${TOUGH_TONGUE_API_TOKEN}`
      }
    });

    if (!scenarioResponse.ok) {
      throw new Error(`Failed to fetch scenario data: ${scenarioResponse.status}`);
    }

    const scenarioData = await scenarioResponse.json();

    // Fetch all sessions for this scenario and user
    const sessionsResponse = await fetch(
      `https://api.toughtongueai.com/api/public/sessions?scenario_id=${SCENARIO_ID}`,
      {
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${TOUGH_TONGUE_API_TOKEN}`
        }
      }
    );

    if (!sessionsResponse.ok) {
      throw new Error(`Failed to fetch sessions data: ${sessionsResponse.status}`);
    }

    const sessionsData = await sessionsResponse.json();

    // Fetch details for the latest session
    const sessionDetailsResponse = await fetch(
      `https://api.toughtongueai.com/api/public/sessions/${latestSessionId}`,
      {
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${TOUGH_TONGUE_API_TOKEN}`
        }
      }
    );

    if (!sessionDetailsResponse.ok) {
      throw new Error(`Failed to fetch session details: ${sessionDetailsResponse.status}`);
    }

    const latestSessionDetails = await sessionDetailsResponse.json();

    return NextResponse.json({
      scenario: scenarioData,
      sessions: sessionsData,
      latestSession: latestSessionDetails
    });

  } catch (error) {
    console.error('Error analyzing session:', error);
    return NextResponse.json(
      { error: 'Failed to analyze session' },
      { status: 500 }
    );
  }
} 