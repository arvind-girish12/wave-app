-- Add theme preference to user_profiles
ALTER TABLE user_profiles
ADD COLUMN theme_preference TEXT CHECK (theme_preference IN ('light', 'dark')) DEFAULT 'dark';

-- Update existing profiles to have dark theme
UPDATE user_profiles
SET theme_preference = 'dark'
WHERE theme_preference IS NULL; 