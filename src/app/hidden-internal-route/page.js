"use client";

import { useState } from 'react';
import { FaBars } from 'react-icons/fa';
import DashboardSidebar from '../../components/DashboardSidebar';

export default function HiddenInternalRoute() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-[#0A0613] via-[#2B176B] to-[#3B2BFF]">
      {/* Hamburger for mobile */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-[#2B176B] p-2 rounded-full shadow-lg border border-[#6B4EFF] text-white"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open sidebar"
      >
        <FaBars className="w-6 h-6" />
      </button>
      <DashboardSidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 p-4 md:p-8 w-full md:ml-64 transition-all duration-300">
        <div className="max-w-7xl mx-auto">
          <iframe
            src="https://app.toughtongueai.com/embed/682a1868ae689d4ad1974efc?bg=%23180f32&skipPrecheck=true&buttonColor=%23d2b2e1&powerUp=sam"
            width="100%"
            height="700px"
            frameBorder="0"
            allow="microphone; camera; display-capture"
            className="rounded-xl shadow-xl"
          />
        </div>
      </main>
    </div>
  );
} 