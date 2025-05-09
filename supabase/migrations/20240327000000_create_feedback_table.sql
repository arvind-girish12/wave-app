-- Create user_feedback table
CREATE TABLE IF NOT EXISTS user_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('bug', 'feature', 'feedback', 'positive')),
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  handled BOOLEAN DEFAULT false NOT NULL
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS user_feedback_user_id_idx ON user_feedback(user_id);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS user_feedback_created_at_idx ON user_feedback(created_at);

-- Enable Row Level Security
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can insert their own feedback"
  ON user_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own feedback"
  ON user_feedback FOR SELECT
  USING (auth.uid() = user_id);

-- Optional: Create policy for admins to view all feedback
-- This requires an admin role or similar setup
-- CREATE POLICY "Admins can view all feedback"
--   ON user_feedback FOR SELECT
--   USING (auth.uid() IN (SELECT user_id FROM admin_users)); 