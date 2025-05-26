"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../utils/supabaseClient';
import { useTheme } from '../context/ThemeContext';
import DashboardSidebar from './DashboardSidebar';
import { FaBars } from 'react-icons/fa';

export default function LayoutWrapper({ children }) {
  const { theme, isInitialized } = useTheme();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // Show a minimal loading state until theme is initialized
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#6B4EFF]"></div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      <div className="relative z-20 flex flex-col flex-1 min-h-screen">
        <DashboardSidebar 
          onLogout={handleSignOut}
          mobileOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
        />
        <div 
          className={`flex flex-col md:flex-row flex-1 relative ${
            theme === 'light' 
              ? 'bg-sky-bg' 
              : 'bg-gradient-to-br from-[#0A0613] via-[#2B176B] to-[#3B2BFF]'
          }`}
          style={{ 
            transition: 'all 0.3s ease'
          }}
        >
          {/* Light theme overlay for better text contrast */}
          {theme === 'light' && (
            <div className="absolute inset-0 bg-white/20 pointer-events-none z-0"></div>
          )}
          
          {/* Hamburger for mobile */}
          <button
            className="md:hidden fixed top-4 left-4 z-50 bg-[#2B176B] p-2 rounded-full shadow-lg border border-[#6B4EFF] text-white"
            onClick={() => setMobileOpen(true)}
            aria-label="Open sidebar"
          >
            <FaBars className="w-6 h-6" />
          </button>
          <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 w-full md:ml-64 transition-all duration-300 relative z-10">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
} 