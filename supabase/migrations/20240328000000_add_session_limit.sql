-- Add session limit and waitlist fields to user_profiles
ALTER TABLE user_profiles
ADD COLUMN session_count INTEGER DEFAULT 0,
ADD COLUMN session_limit INTEGER DEFAULT 5,
ADD COLUMN is_on_waitlist BOOLEAN DEFAULT false,
ADD COLUMN waitlist_joined_at TIMESTAMP WITH TIME ZONE;

-- Create function to increment session count
CREATE OR REPLACE FUNCTION increment_session_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE user_profiles
    SET session_count = session_count + 1
    WHERE user_id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to increment session count on new session
CREATE TRIGGER increment_session_count_trigger
AFTER INSERT ON sessions
FOR EACH ROW
EXECUTE FUNCTION increment_session_count(); 