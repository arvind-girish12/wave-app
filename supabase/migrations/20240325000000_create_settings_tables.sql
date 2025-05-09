-- Create user_settings table
CREATE TABLE user_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    notify_mood_reminder BOOLEAN DEFAULT true,
    notify_progress_summary BOOLEAN DEFAULT true,
    notify_journal_nudge BOOLEAN DEFAULT true,
    notify_exercise_streak BOOLEAN DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id)
);

-- Create user_profiles table
CREATE TABLE user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    display_name TEXT NOT NULL,
    pronouns TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id)
);

-- Create indexes
CREATE INDEX user_settings_user_id_idx ON user_settings(user_id);
CREATE INDEX user_profiles_user_id_idx ON user_profiles(user_id);

-- Enable Row Level Security
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own settings"
    ON user_settings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
    ON user_settings FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own profile"
    ON user_profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
    ON user_profiles FOR UPDATE
    USING (auth.uid() = user_id);

-- Insert sample data
INSERT INTO user_settings (user_id, notify_mood_reminder, notify_progress_summary, notify_journal_nudge, notify_exercise_streak)
VALUES (
    '4940425f-cae9-479e-a259-7c15d55dddb7',
    true,
    true,
    true,
    true
);

INSERT INTO user_profiles (user_id, display_name, pronouns, avatar_url)
VALUES (
    '4940425f-cae9-479e-a259-7c15d55dddb7',
    'Arvind',
    'he/him',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Arvind'
); 