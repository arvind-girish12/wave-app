-- Create mood_entries table
CREATE TABLE mood_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    mood TEXT CHECK (mood IN ('happy', 'calm', 'neutral', 'sad', 'anxious')) NOT NULL,
    note TEXT,
    date DATE NOT NULL,
    linked_session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
    linked_journal_id UUID REFERENCES journal_entries(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, date)
);

-- Create indexes
CREATE INDEX mood_entries_user_id_idx ON mood_entries(user_id);
CREATE INDEX mood_entries_date_idx ON mood_entries(date);
CREATE INDEX mood_entries_mood_idx ON mood_entries(mood);

-- Enable Row Level Security
ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own mood entries"
    ON mood_entries FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mood entries"
    ON mood_entries FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mood entries"
    ON mood_entries FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mood entries"
    ON mood_entries FOR DELETE
    USING (auth.uid() = user_id);

-- Insert sample mood entries for testing
INSERT INTO mood_entries (user_id, mood, note, date, created_at) VALUES
    (
        '4940425f-cae9-479e-a259-7c15d55dddb7',
        'happy',
        'Had a great day at work!',
        CURRENT_DATE - INTERVAL '1 day',
        CURRENT_TIMESTAMP
    ),
    (
        '4940425f-cae9-479e-a259-7c15d55dddb7',
        'calm',
        'Morning meditation went well',
        CURRENT_DATE - INTERVAL '2 days',
        CURRENT_TIMESTAMP
    ),
    (
        '4940425f-cae9-479e-a259-7c15d55dddb7',
        'neutral',
        'Regular day',
        CURRENT_DATE - INTERVAL '3 days',
        CURRENT_TIMESTAMP
    ),
    (
        '4940425f-cae9-479e-a259-7c15d55dddb7',
        'sad',
        'Feeling a bit down today',
        CURRENT_DATE - INTERVAL '4 days',
        CURRENT_TIMESTAMP
    ),
    (
        '4940425f-cae9-479e-a259-7c15d55dddb7',
        'anxious',
        'Work deadline approaching',
        CURRENT_DATE - INTERVAL '5 days',
        CURRENT_TIMESTAMP
    ); 