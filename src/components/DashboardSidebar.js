"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../utils/supabaseClient';
import { useTheme } from '../context/ThemeContext';
import { FaHome, FaComments, FaBook, FaBrain, FaCalendarAlt, FaSeedling, FaCog, FaUser, FaGlobe, FaQuestionCircle, FaLightbulb, FaSignOutAlt, FaTimes } from 'react-icons/fa';
import { SunIcon, MoonIcon } from '@heroicons/react/24/solid';

const navSections = [
  {
    title: 'Core',
    items: [
      { icon: <FaHome />, label: 'Home', href: '/' },
      { icon: <FaComments />, label: 'Sessions', href: '/sessions' },
    ],
  },
  {
    title: 'Account',
    items: [
      { icon: <FaCog />, label: 'Settings', href: '/settings' },
      { icon: <FaUser />, label: 'My Profile', href: '/profile' },
      { icon: <FaGlobe />, label: 'Language / Tone', href: '/language' },
    ],
  },
  {
    title: 'Support',
    items: [
      { icon: <FaQuestionCircle />, label: 'Help', href: '/help' },
      { icon: <FaLightbulb />, label: 'Feedback', href: '/feedback' },
      { icon: <FaSignOutAlt />, label: 'Log out', href: '/logout', isLogout: true },
    ],
  },
];

export default function DashboardSidebar({ onLogout, mobileOpen, onClose }) {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  const handleThemeChange = (newTheme) => {
    toggleTheme(newTheme);
  };

  // Define theme-based classes for better Tailwind detection
  const sidebarBgClasses = theme === 'light'
    ? 'bg-gradient-to-br from-[#e0f2fe] via-[#cbeafe] to-[#fbcfe8]'
    : 'bg-gradient-to-br from-[#0A0613] via-[#2B176B] to-[#3B2BFF]';

  const logoTextClasses = theme === 'light' ? 'text-gray-900' : 'text-white';
  
  const toggleBgClasses = theme === 'light' ? 'bg-[#F7BFA3]/20' : 'bg-[#3B2BFF]/20';
  
  const lightBtnClasses = theme === 'light'
    ? 'bg-gradient-to-r from-[#F7BFA3] to-[#FFD6C4] text-gray-900 shadow-lg'
    : 'text-gray-600 hover:text-gray-900 hover:bg-white/10';
    
  const darkBtnClasses = theme === 'dark'
    ? 'bg-gradient-to-r from-[#2B176B] to-[#3B2BFF] text-white shadow-lg'
    : 'text-gray-600 hover:text-gray-900 hover:bg-white/10';

  const sectionTitleClasses = theme === 'light' ? 'text-gray-600' : 'text-[#D1D5DB]';
  const footerTextClasses = theme === 'light' ? 'text-gray-600' : 'text-[#D1D5DB]';

  // Helper function for navigation item classes
  const getNavItemClasses = (item) => {
    const baseClasses = 'flex items-center gap-3 px-3 py-2 rounded-lg transition-all font-medium';
    
    if (theme === 'light') {
      if (item.isLogout) {
        return `${baseClasses} text-red-500 hover:bg-red-50`;
      } else {
        return `${baseClasses} text-gray-700 hover:bg-gradient-to-r hover:from-[#F7BFA3] hover:to-[#FFD6C4] hover:text-gray-900`;
      }
    } else {
      if (item.isLogout) {
        return `${baseClasses} text-red-400 hover:bg-red-900/30`;
      } else {
        return `${baseClasses} text-white hover:bg-gradient-to-r hover:from-[#2B176B] hover:to-[#3B2BFF] hover:shadow-lg`;
      }
    }
  };

  const renderSidebarContent = () => (
    <>
      <div>
        <div className={`mb-8 text-2xl font-bold tracking-tight drop-shadow-lg ${logoTextClasses}`}>wave</div>
        
        {/* Theme Toggle */}
        <div className="px-4 mb-6">
          <div className={`flex items-center justify-center gap-2 p-1 rounded-lg ${toggleBgClasses}`}>
            <button
              onClick={() => handleThemeChange('light')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 ${lightBtnClasses}`}
            >
              <SunIcon className="w-5 h-5 mx-auto" />
            </button>
            <button
              onClick={() => handleThemeChange('dark')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 ${darkBtnClasses}`}
            >
              <MoonIcon className="w-5 h-5 mx-auto" />
            </button>
          </div>
        </div>

        {navSections.map(section => (
          <div key={section.title} className="mb-6">
            <div className={`uppercase text-xs font-semibold mb-2 pl-2 tracking-wider ${sectionTitleClasses}`}>
              {section.title}
            </div>
            <ul className="space-y-1">
              {section.items.map(item => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className={getNavItemClasses(item)}
                    onClick={item.isLogout ? (e) => { e.preventDefault(); onLogout && onLogout(); } : undefined}
                  >
                    <span className="text-lg drop-shadow-sm">{item.icon}</span>
                    <span>{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className={`text-xs text-center opacity-60 ${footerTextClasses}`}>
        &copy; {new Date().getFullYear()} Wave
      </div>
    </>
  );

  return (
    <div className={`fixed inset-y-0 left-0 w-64 shadow-lg z-30 transition-all duration-300 ${
      mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
    } ${sidebarBgClasses}`}>
      <div className="flex flex-col h-full p-4">
        {renderSidebarContent()}
      </div>
    </div>
  );
}