"use client";

import { FaHome, FaComments, FaBook, FaBrain, FaCalendarAlt, FaSeedling, FaCog, FaUser, FaGlobe, FaQuestionCircle, FaLightbulb, FaSignOutAlt, FaTimes } from 'react-icons/fa';

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
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:fixed md:top-0 md:left-0 md:h-screen md:w-64 md:bg-gradient-to-br md:from-[#0A0613] md:via-[#2B176B] md:to-[#3B2BFF] md:border-r-2 md:border-[#6B4EFF] md:flex md:flex-col md:justify-between md:py-6 md:px-4 md:shadow-2xl md:shadow-[#6B4EFF]/70 md:z-30">
        <div>
          <div className="mb-8 text-2xl font-bold text-white tracking-tight drop-shadow-lg">wave</div>
          {navSections.map(section => (
            <div key={section.title} className="mb-6">
              <div className="uppercase text-xs text-[#D1D5DB] font-semibold mb-2 pl-2 tracking-wider">{section.title}</div>
              <ul className="space-y-1">
                {section.items.map(item => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-white hover:bg-gradient-to-r hover:from-[#2B176B] hover:to-[#3B2BFF] hover:shadow-lg transition-all font-medium ${item.isLogout ? 'text-red-400 hover:bg-red-900/30' : ''}`}
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
        <div className="text-xs text-[#D1D5DB] text-center opacity-60">&copy; {new Date().getFullYear()} Wave</div>
      </aside>
      {/* Mobile Drawer Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose}></div>
          <aside className="relative w-64 h-full bg-gradient-to-br from-[#0A0613] via-[#2B176B] to-[#3B2BFF] border-r-2 border-[#6B4EFF] flex flex-col justify-between py-6 px-4 shadow-2xl shadow-[#6B4EFF]/70 z-50 animate-slide-in-left">
            <button className="absolute top-4 right-4 text-white text-2xl" onClick={onClose}><FaTimes /></button>
            <div className="mb-8 text-2xl font-bold text-white tracking-tight drop-shadow-lg">wave</div>
            {navSections.map(section => (
              <div key={section.title} className="mb-6">
                <div className="uppercase text-xs text-[#D1D5DB] font-semibold mb-2 pl-2 tracking-wider">{section.title}</div>
                <ul className="space-y-1">
                  {section.items.map(item => (
                    <li key={item.label}>
                      <a
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-white hover:bg-gradient-to-r hover:from-[#2B176B] hover:to-[#3B2BFF] hover:shadow-lg transition-all font-medium ${item.isLogout ? 'text-red-400 hover:bg-red-900/30' : ''}`}
                        onClick={item.isLogout ? (e) => { e.preventDefault(); onLogout && onLogout(); onClose && onClose(); } : onClose}
                      >
                        <span className="text-lg drop-shadow-sm">{item.icon}</span>
                        <span>{item.label}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="text-xs text-[#D1D5DB] text-center opacity-60 mt-auto">&copy; {new Date().getFullYear()} Wave</div>
          </aside>
        </div>
      )}
    </>
  );
} 