-- Create page_visits table
CREATE TABLE page_visits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    unique_user_id TEXT NOT NULL,
    login_email TEXT,
    login_visits INTEGER DEFAULT 0,
    onboarding_visits INTEGER DEFAULT 0,
    dashboard_visits INTEGER DEFAULT 0,
    character_visits INTEGER DEFAULT 0,
    feedback_visits INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(unique_user_id)
);

-- Create index on unique_user_id for faster lookups
CREATE INDEX page_visits_unique_user_id_idx ON page_visits(unique_user_id);

-- Enable Row Level Security
ALTER TABLE page_visits ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can insert page visits"
    ON page_visits FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Anyone can update page visits"
    ON page_visits FOR UPDATE
    USING (true);

CREATE POLICY "Anyone can view page visits"
    ON page_visits FOR SELECT
    USING (true); 