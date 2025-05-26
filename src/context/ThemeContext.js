"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../utils/supabaseClient';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Initialize theme from localStorage immediately to prevent flash
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') || 'dark';
      // Apply theme to DOM immediately during initialization
      document.documentElement.classList.remove('dark', 'light');
      document.documentElement.classList.add(savedTheme);
      return savedTheme;
    }
    return 'dark';
  });
  
  const [isInitialized, setIsInitialized] = useState(false);
  const userIdRef = useRef(null);
  const isUpdatingRef = useRef(false);

  // Helper to set theme on <html>
  const applyThemeToDOM = useCallback((themeValue) => {
    if (typeof window !== 'undefined') {
      const html = document.documentElement;
      // Remove both classes first
      html.classList.remove('dark', 'light');
      // Force a reflow to ensure the removal is applied
      html.offsetHeight;
      // Add the new theme class
      html.classList.add(themeValue);
    }
  }, []);

  // Update theme state and persist to localStorage and DB
  const updateTheme = useCallback(async (newTheme, skipDB = false) => {
    if (isUpdatingRef.current) return;
    isUpdatingRef.current = true;

    try {
      setTheme(newTheme);
      applyThemeToDOM(newTheme);
      
      // Always update localStorage for instant persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', newTheme);
      }

      // Update database if not skipping and user is authenticated
      if (!skipDB && userIdRef.current) {
        await supabase
          .from('user_profiles')
          .update({ theme_preference: newTheme })
          .eq('user_id', userIdRef.current);
      }
    } finally {
      isUpdatingRef.current = false;
    }
  }, [applyThemeToDOM]);

  // Fetch theme from database and sync with localStorage
  const syncThemeFromDB = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        userIdRef.current = session.user.id;
        
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('theme_preference')
          .eq('user_id', session.user.id)
          .single();
        
        if (profile?.theme_preference && profile.theme_preference !== theme) {
          // Update theme from DB, skip DB update to avoid loop
          await updateTheme(profile.theme_preference, true);
        }
      }
    } catch (error) {
      console.error('Error syncing theme from DB:', error);
    } finally {
      setIsInitialized(true);
    }
  }, [theme, updateTheme]);

  // Apply theme to DOM immediately on mount
  useEffect(() => {
    applyThemeToDOM(theme);
  }, [theme, applyThemeToDOM]);

  // Initialize theme from database on mount
  useEffect(() => {
    syncThemeFromDB();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        syncThemeFromDB();
      } else if (event === 'SIGNED_OUT') {
        userIdRef.current = null;
        setIsInitialized(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [syncThemeFromDB]);

  // Subscribe to real-time theme changes from other tabs/devices
  useEffect(() => {
    if (!userIdRef.current) return;

    const channel = supabase
      .channel('theme_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_profiles',
          filter: `user_id=eq.${userIdRef.current}`,
        },
        (payload) => {
          if (payload.new.theme_preference && payload.new.theme_preference !== theme) {
            // Update from real-time change, skip DB update to avoid loop
            updateTheme(payload.new.theme_preference, true);
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [userIdRef.current, theme, updateTheme]);

  // Public API for toggling theme
  const toggleTheme = useCallback(async (newTheme) => {
    await updateTheme(newTheme, false);
  }, [updateTheme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isInitialized }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 