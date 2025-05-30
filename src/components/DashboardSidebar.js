"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../utils/supabaseClient';
import { useTheme } from '../context/ThemeContext';
import { FaHome, FaCog, FaQuestionCircle, FaSignOutAlt } from 'react-icons/fa';

const navSections = [
  {
    title: 'Main',
    items: [
      { icon: <FaHome />, label: 'Home', href: '/' },
    ],
  },
  {
    title: 'Account',
    items: [
      { icon: <FaCog />, label: 'Settings', href: '/settings' },
      { icon: <FaQuestionCircle />, label: 'Help', href: '/help' },
      { icon: <FaSignOutAlt />, label: 'Log out', href: '/logout', isLogout: true },
    ],
  },
];

export default function DashboardSidebar({ onLogout, mobileOpen, onClose }) {
  const { theme } = useTheme();
  const router = useRouter();

  // Define theme-based classes for better Tailwind detection
  const sidebarBgClasses = theme === 'light'
    ? 'bg-gradient-to-br from-[#e0f2fe] via-[#cbeafe] to-[#fbcfe8]'
    : 'bg-gradient-to-br from-[#0A0613] via-[#2B176B] to-[#3B2BFF]';

  const logoTextClasses = theme === 'light' ? 'text-gray-900' : 'text-white';
  
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
    <div className="flex flex-col h-full justify-between">
      <div>
        <div className={`mb-8 text-2xl font-bold tracking-tight drop-shadow-lg ${logoTextClasses}`}>wave</div>
        
        {/* Main section */}
        <div className="mb-6">
          <div className={`uppercase text-xs font-semibold mb-2 pl-2 tracking-wider ${sectionTitleClasses}`}>
            {navSections[0].title}
          </div>
          <ul className="space-y-1">
            {navSections[0].items.map(item => (
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
      </div>

      {/* Account section at bottom */}
      <div className="mt-auto">
        <div className={`uppercase text-xs font-semibold mb-2 pl-2 tracking-wider ${sectionTitleClasses}`}>
          {navSections[1].title}
        </div>
        <ul className="space-y-1">
          {navSections[1].items.map(item => (
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
        <div className={`text-xs text-center opacity-60 mt-4 ${footerTextClasses}`}>
          &copy; {new Date().getFullYear()} Wave
        </div>
      </div>
    </div>
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