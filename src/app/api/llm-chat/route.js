
import { NextResponse } from 'next/server';

import characterPrompts from "../../../utils/characterPrompts";
export async function POST(req) {
  try {
    const body = await req.json();
    const { messages, character = {} } = body || {};

    // Use env for security — set your key in .env.local as GOOGLE_API_KEY
    const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

    if (!GOOGLE_API_KEY) {
      return NextResponse.json({ error: "Google API key not set" }, { status: 500 });
    }
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "No messages provided." }, { status: 400 });
    }

    // Dynamic import to avoid issues with Next.js edge runtimes
    const { ChatGoogleGenerativeAI } = await import("@langchain/google-genai");
    const { HumanMessage, AIMessage } = await import("@langchain/core/messages");

    // Map messages to LangChain format
    const lcMessages = messages.map(m =>
      m.role === "user"
        ? new HumanMessage(m.content)
        : new AIMessage(m.content)
    );

    // System prompt with deep persona if available
    let systemInstruction = "You are a helpful assistant.";
    if (character?.id && characterPrompts[character.id]) {
      systemInstruction = characterPrompts[character.id]?.trim();
    } else if (character?.name) {
      systemInstruction = `You are role-playing as "${character.name}". Respond in a conversational style as this character.`;
    }

    const model = new ChatGoogleGenerativeAI({
      apiKey: GOOGLE_API_KEY,
      model: "gemini-1.5-flash",     // Use Gemini 1.5 Flash model as requested
      temperature: 0.7,
      maxOutputTokens: 2048,
    });

    // Add system message if needed (for Gemini/free-form)
    const systemMsg = systemInstruction ? [new HumanMessage(systemInstruction)] : [];
    const inputMessages = systemMsg.concat(lcMessages);

    const response = await model.invoke(inputMessages);

    return NextResponse.json({
      result: response.content,
    });

  } catch (error) {
    console.error("llm-chat error", error);
    return NextResponse.json({ error: error?.message || "Unexpected error" }, { status: 500 });
  }
}
