-- Extend user_profiles table
ALTER TABLE user_profiles
ADD COLUMN preferred_tone TEXT CHECK (preferred_tone IN ('gentle', 'coaching', 'neutral')) DEFAULT 'gentle',
ADD COLUMN preferred_agent TEXT,
ADD COLUMN allow_agent_suggestions BOOLEAN DEFAULT true;

-- Create topic_stats table
CREATE TABLE topic_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  topic TEXT NOT NULL,
  source TEXT CHECK (source IN ('session', 'journal')) NOT NULL,
  count INTEGER DEFAULT 1,
  last_used TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX topic_stats_user_id_idx ON topic_stats(user_id);

-- Enable RLS and policies for topic_stats
ALTER TABLE topic_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own topic stats" ON topic_stats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own topic stats" ON topic_stats FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own topic stats" ON topic_stats FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own topic stats" ON topic_stats FOR DELETE USING (auth.uid() = user_id); 