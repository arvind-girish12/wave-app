"use client";

import { FaHome, FaComments, FaBook, FaBrain, FaCalendarAlt, FaSeedling, FaCog, FaUser, FaGlobe, FaQuestionCircle, FaLightbulb, FaSignOutAlt } from 'react-icons/fa';

const navSections = [
  {
    title: 'Core',
    items: [
      { icon: <FaHome />, label: 'Home', href: '/' },
      { icon: <FaComments />, label: 'Sessions', href: '/sessions' },
      { icon: <FaBook />, label: 'Journal', href: '/journal' },
      { icon: <FaBrain />, label: 'Exercises', href: '/exercises' },
      { icon: <FaCalendarAlt />, label: 'Mood Tracker', href: '/mood' },
      { icon: <FaSeedling />, label: 'Progress', href: '/progress' },
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

export default function DashboardSidebar({ onLogout }) {
  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-gradient-to-br from-white via-purple-100 to-purple-200 border-r-2 border-purple-300 flex flex-col justify-between py-6 px-4 shadow-2xl shadow-purple-300/70 z-30">
      <div>
        <div className="mb-8 text-2xl font-bold text-purple-900 tracking-tight drop-shadow-lg">wave</div>
        {navSections.map(section => (
          <div key={section.title} className="mb-6">
            <div className="uppercase text-xs text-purple-400 font-semibold mb-2 pl-2 tracking-wider">{section.title}</div>
            <ul className="space-y-1">
              {section.items.map(item => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-purple-900 hover:bg-gradient-to-r hover:from-purple-400 hover:to-purple-600 hover:shadow-lg transition-all font-medium ${item.isLogout ? 'text-red-600 hover:bg-red-50' : ''}`}
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
      <div className="text-xs text-purple-500 text-center opacity-60">&copy; {new Date().getFullYear()} Wave</div>
    </aside>
  );
} 