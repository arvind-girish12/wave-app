import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { source, content } = await request.json();

    // Generate insight based on source and content
    let insight = {
      summary: '',
      tags: []
    };

    switch (source) {
      case 'journal':
        // Analyze journal sentiment and topics
        const sentiment = content.sentiment || 'neutral';
        const topics = content.topics || [];
        
        if (sentiment === 'positive') {
          insight.summary = `Your journal entries show a positive outlook on ${topics.join(', ')}`;
          insight.tags = ['positivity', ...topics];
        } else if (sentiment === 'negative') {
          insight.summary = `You're working through challenges related to ${topics.join(', ')}`;
          insight.tags = ['growth', ...topics];
        } else {
          insight.summary = `You're reflecting on ${topics.join(', ')}`;
          insight.tags = ['reflection', ...topics];
        }
        break;

      case 'mood':
        // Analyze mood patterns
        const mood = content.mood;
        const streak = content.streak || 0;
        
        if (streak > 3) {
          insight.summary = `You've maintained a ${mood} mood for ${streak} days in a row`;
          insight.tags = ['consistency', mood];
        } else {
          insight.summary = `You're currently feeling ${mood}`;
          insight.tags = [mood];
        }
        break;

      case 'session':
        // Analyze session topics and progress
        const sessionTopics = content.topics || [];
        const sessionCount = content.count || 0;
        
        insight.summary = `You've completed ${sessionCount} sessions focusing on ${sessionTopics.join(', ')}`;
        insight.tags = ['therapy', ...sessionTopics];
        break;

      case 'exercise':
        // Analyze exercise completion and types
        const exerciseType = content.type;
        const exerciseCount = content.count || 0;
        
        insight.summary = `You've completed ${exerciseCount} ${exerciseType} exercises`;
        insight.tags = ['exercise', exerciseType];
        break;
    }

    // Save insight to database
    const { error } = await supabase
      .from('progress_insights')
      .insert([
        {
          user_id: session.user.id,
          source,
          summary: insight.summary,
          tags: insight.tags
        }
      ]);

    if (error) throw error;

    return NextResponse.json({ success: true, insight });
  } catch (error) {
    console.error('Error generating insight:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 