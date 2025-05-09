-- Create exercises table
CREATE TABLE exercises (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    type TEXT CHECK (type IN ('breathing', 'affirmation', 'cbt', 'visualization')) NOT NULL,
    content_type TEXT CHECK (content_type IN ('text', 'audio', 'animation')) NOT NULL,
    description TEXT NOT NULL,
    duration_sec INTEGER NOT NULL,
    steps TEXT[] DEFAULT '{}',
    media_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create exercise_logs table
CREATE TABLE exercise_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes
CREATE INDEX exercise_logs_user_id_idx ON exercise_logs(user_id);
CREATE INDEX exercise_logs_exercise_id_idx ON exercise_logs(exercise_id);
CREATE INDEX exercises_type_idx ON exercises(type);

-- Enable Row Level Security
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for exercises
CREATE POLICY "Exercises are viewable by all authenticated users"
    ON exercises FOR SELECT
    USING (auth.role() = 'authenticated');

-- Create policies for exercise_logs
CREATE POLICY "Users can view their own exercise logs"
    ON exercise_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own exercise logs"
    ON exercise_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Insert sample exercises
INSERT INTO exercises (title, type, content_type, description, duration_sec, steps, media_url) VALUES
    (
        'Box Breathing',
        'breathing',
        'animation',
        'A simple breathing technique to help you relax and focus. Follow the animated box to guide your breath.',
        300,
        ARRAY['Breathe in for 4 counts', 'Hold for 4 counts', 'Exhale for 4 counts', 'Hold for 4 counts'],
        NULL
    ),
    (
        'Daily Affirmations',
        'affirmation',
        'audio',
        'Start your day with positive affirmations to boost your mood and confidence.',
        180,
        ARRAY['I am capable of handling whatever comes my way', 'I choose to be confident and self-assured', 'I am worthy of love and respect'],
        'https://example.com/affirmations.mp3'
    ),
    (
        'Thought Challenge',
        'cbt',
        'text',
        'Learn to identify and challenge negative thoughts using CBT techniques.',
        600,
        ARRAY['Identify the negative thought', 'Write down evidence for and against', 'Consider alternative perspectives', 'Develop a balanced thought'],
        NULL
    ),
    (
        'Peaceful Beach',
        'visualization',
        'audio',
        'A guided visualization to help you find calm and peace.',
        480,
        ARRAY['Find a comfortable position', 'Close your eyes', 'Imagine yourself on a peaceful beach', 'Engage all your senses'],
        'https://example.com/beach-visualization.mp3'
    ),
    (
        '4-7-8 Breathing',
        'breathing',
        'animation',
        'A natural tranquilizer for the nervous system. This breathing pattern helps reduce anxiety and promote sleep.',
        240,
        ARRAY['Breathe in through nose for 4 counts', 'Hold breath for 7 counts', 'Exhale through mouth for 8 counts'],
        NULL
    ); 