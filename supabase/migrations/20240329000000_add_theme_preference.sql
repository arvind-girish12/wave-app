-- Update theme preference default to light
ALTER TABLE user_profiles
ALTER COLUMN theme_preference SET DEFAULT 'light';

-- Update existing profiles to have light theme
UPDATE user_profiles
SET theme_preference = 'light'
WHERE theme_preference IS NULL OR theme_preference = 'dark'; 