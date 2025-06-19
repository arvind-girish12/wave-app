import { supabase } from './supabaseClient';

/**
 * Utility function to track user page visits
 * @param {string} visitType - Type of visit to track (login_visits, dashboard_visits, etc.)
 * @param {Object} additionalData - Additional data to send (like login_email)
 * @returns {Promise<void>}
 */
export async function trackVisit(visitType) {
  try {
    const unique_user_id = localStorage.getItem('unique_user_id') || crypto.randomUUID();
    localStorage.setItem('unique_user_id', unique_user_id);

    const response = await fetch('/api/track-visit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        unique_user_id,
        visits: {
          [visitType]: 1
        }
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to track visit');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

/**
 * Fetch user email from Supabase session with fallback
 * @param {Object} supabase - Supabase client instance
 * @returns {Promise<string>} - User email or 'localhost' as fallback
 */
export const fetchUserEmail = async (supabase) => {
  let userEmail = 'localhost'; // default fallback
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.email) {
      userEmail = session.user.email;
    }
  } catch (e) {
    // ignore, fallback to localhost
  }
  return userEmail;
};

/**
 * Track visit with user email automatically fetched
 * @param {string} visitType - Type of visit to track
 * @param {Object} supabase - Supabase client instance
 * @param {Object} additionalData - Additional data to send
 * @returns {Promise<void>}
 */
export async function trackVisitWithEmail(visitType) {
  try {
    let userEmail = 'localhost'; // default fallback

    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (!error && session?.user?.email) {
        userEmail = session.user.email;
      }
    } catch (e) {
      // ignore, fallback to localhost
    }

    const unique_user_id = localStorage.getItem('unique_user_id') || crypto.randomUUID();
    localStorage.setItem('unique_user_id', unique_user_id);

    const response = await fetch('/api/track-visit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        unique_user_id,
        login_email: userEmail,
        visits: {
          [visitType]: 1
        }
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to track visit');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

/**
 * Get the current unique user ID from localStorage
 * @returns {string|null} - The unique user ID or null if not found
 */
export const getUniqueUserId = () => {
  return localStorage.getItem('unique_user_id');
};

/**
 * Generate and store a new unique user ID
 * @returns {string} - The newly generated unique user ID
 */
export const generateUniqueUserId = () => {
  const uniqueUserId = crypto.randomUUID();
  localStorage.setItem('unique_user_id', uniqueUserId);
  return uniqueUserId;
};

/**
 * Clear the stored unique user ID (useful for logout or reset)
 */
export function clearUniqueUserId() {
  localStorage.removeItem('unique_user_id');
}