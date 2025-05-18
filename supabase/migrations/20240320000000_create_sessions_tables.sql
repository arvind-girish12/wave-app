-- Create sessions table
CREATE TABLE sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    topic TEXT NOT NULL,
    agent_type TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    is_archived BOOLEAN DEFAULT false NOT NULL,
    transcript_summary JSONB,
    emotional_analysis JSONB,
    cognitive_patterns JSONB,
    triggers_identified JSONB,
    user_intent JSONB,
    recommendations JSONB,
    insight_tags TEXT[],
    follow_up_suggestions TEXT[],
    session_duration INTEGER,
    session_id TEXT UNIQUE
);

-- Create messages table with explicit foreign key constraint
CREATE TABLE messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL,
    sender TEXT NOT NULL CHECK (sender IN ('user', 'agent')),
    content TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT fk_session
        FOREIGN KEY (session_id)
        REFERENCES sessions(id)
        ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX sessions_user_id_idx ON sessions(user_id);
CREATE INDEX messages_session_id_idx ON messages(session_id);

-- Enable Row Level Security
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own sessions"
    ON sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions"
    ON sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
    ON sessions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view messages from their sessions"
    ON messages FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM sessions
        WHERE sessions.id = messages.session_id
        AND sessions.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert messages to their sessions"
    ON messages FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM sessions
        WHERE sessions.id = messages.session_id
        AND sessions.user_id = auth.uid()
    )); 