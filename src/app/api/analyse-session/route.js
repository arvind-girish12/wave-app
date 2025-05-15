import { NextResponse } from 'next/server';
import { supabaseServer } from '../../../utils/supabaseServerClient';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = "AIzaSyC1wfftqSseOHJIVmq5ytG0-3ABNtfB48Q";

export async function POST(request) {
  try {
    const { transcript_content, session_id, user_id } = await request.json();

    if (!transcript_content || !session_id || !user_id) {
      return NextResponse.json({ error: 'Missing transcript_content, session_id, or user_id' }, { status: 400 });
    }

    // Gemini prompt (now asks for a topic field as well)
    const prompt = `
You are an expert mental health AI assistant. Given the following transcript, analyze it and return a JSON object with the following structure:

{
  "topic": "...", // a short, descriptive topic for this session (e.g., 'Anxiety about friendships', 'Work stress', etc.)
  "transcript_summary": { "summary": "...", "key_points": [...] },
  "emotional_analysis": { "primary_emotions": [...], "tone": "...", "intensity_score": ..., "mood_keywords": [...] },
  "cognitive_patterns": { "thinking_distortions": [...], "self_talk_patterns": [...] },
  "triggers_identified": [ { "type": "...", "description": "..." }, ... ],
  "user_intent": { "expressed_goals": [...], "support_requested": [...] },
  "recommendations": { "exercises": [ { "type": "...", "name": "...", "duration_sec": ... }, ... ], "journal_prompt": "..." },
  "insight_tags": [...],
  "follow_up_suggestions": [...]
}

Transcript:
"""${transcript_content}"""
Return only the JSON object, no explanation.
    `;

    // Call Gemini
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const text = await result.response.text();

    // Parse the JSON from Gemini's response, stripping markdown code block if present
    let analysis;
    let cleaned = text.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```/, '').replace(/```$/, '').trim();
    }
    try {
      analysis = JSON.parse(cleaned);
    } catch (e) {
      return NextResponse.json({ error: 'Failed to parse Gemini response', raw: text }, { status: 500 });
    }

    // Fallbacks for required fields
    const topic = analysis.topic || 'General';
    const agent_type = 'Anxiety Coach'; // Always set to Anxiety Coach

    // Upsert into sessions table using session_id (text field)
    const { error } = await supabaseServer
      .from('sessions')
      .upsert(
        {
          session_id: session_id,
          user_id: user_id,
          topic: topic,
          agent_type: agent_type,
          transcript_summary: analysis.transcript_summary,
          emotional_analysis: analysis.emotional_analysis,
          cognitive_patterns: analysis.cognitive_patterns,
          triggers_identified: analysis.triggers_identified,
          user_intent: analysis.user_intent,
          recommendations: analysis.recommendations,
          insight_tags: analysis.insight_tags,
          follow_up_suggestions: analysis.follow_up_suggestions
        },
        { 
          onConflict: 'session_id',
          ignoreDuplicates: false
        }
      );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, analysis });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
} 