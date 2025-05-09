-- Create progress_insights table
CREATE TABLE progress_insights (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    source TEXT CHECK (source IN ('journal', 'session', 'mood', 'exercise')) NOT NULL,
    summary TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create badges table
CREATE TABLE badges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon_url TEXT NOT NULL,
    trigger_type TEXT CHECK (trigger_type IN ('journal', 'mood', 'session', 'exercise')) NOT NULL,
    trigger_count INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create user_badges table
CREATE TABLE user_badges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    badge_id UUID REFERENCES badges(id) ON DELETE CASCADE NOT NULL,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, badge_id)
);

-- Create indexes
CREATE INDEX progress_insights_user_id_idx ON progress_insights(user_id);
CREATE INDEX progress_insights_source_idx ON progress_insights(source);
CREATE INDEX user_badges_user_id_idx ON user_badges(user_id);
CREATE INDEX badges_trigger_type_idx ON badges(trigger_type);

-- Enable Row Level Security
ALTER TABLE progress_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own progress insights"
    ON progress_insights FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view all badges"
    ON badges FOR SELECT
    USING (true);

CREATE POLICY "Users can view their own badges"
    ON user_badges FOR SELECT
    USING (auth.uid() = user_id);

-- Insert sample badges
INSERT INTO badges (name, description, icon_url, trigger_type, trigger_count) VALUES
    ('Mindful Streak', 'Complete 5 days of mood tracking in a row', '/badges/mindful-streak.svg', 'mood', 5),
    ('Journal Master', 'Write 10 journal entries', '/badges/journal-master.svg', 'journal', 10),
    ('Session Pro', 'Complete 5 therapy sessions', '/badges/session-pro.svg', 'session', 5),
    ('Exercise Enthusiast', 'Complete 10 exercises', '/badges/exercise-enthusiast.svg', 'exercise', 10),
    ('Mood Explorer', 'Log 5 different moods', '/badges/mood-explorer.svg', 'mood', 5),
    ('Consistent Writer', 'Write 3 journal entries in a week', '/badges/consistent-writer.svg', 'journal', 3),
    ('Therapy Regular', 'Complete 2 sessions in a week', '/badges/therapy-regular.svg', 'session', 2),
    ('Exercise Streak', 'Complete 3 exercises in a row', '/badges/exercise-streak.svg', 'exercise', 3);

-- Insert sample progress insights
INSERT INTO progress_insights (user_id, source, summary, tags) VALUES
    (
        '4940425f-cae9-479e-a259-7c15d55dddb7',
        'journal',
        'Your journal entries show increasing confidence in handling work challenges',
        ARRAY['confidence', 'growth', 'work']
    ),
    (
        '4940425f-cae9-479e-a259-7c15d55dddb7',
        'mood',
        'Your mood has been consistently positive over the last week',
        ARRAY['positivity', 'consistency']
    ),
    (
        '4940425f-cae9-479e-a259-7c15d55dddb7',
        'session',
        'You''ve made significant progress in managing anxiety during sessions',
        ARRAY['anxiety', 'progress']
    );

-- Insert sample user badges
INSERT INTO user_badges (user_id, badge_id) VALUES
    (
        '4940425f-cae9-479e-a259-7c15d55dddb7',
        (SELECT id FROM badges WHERE name = 'Mindful Streak')
    ),
    (
        '4940425f-cae9-479e-a259-7c15d55dddb7',
        (SELECT id FROM badges WHERE name = 'Journal Master')
    ); 