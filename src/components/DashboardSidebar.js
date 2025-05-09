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
    <aside className="h-screen w-64 bg-wave-offwhite border-r border-wave-green flex flex-col justify-between py-6 px-4">
      <div>
        <div className="mb-8 text-2xl font-bold text-wave-forest tracking-tight">wave</div>
        {navSections.map(section => (
          <div key={section.title} className="mb-6">
            <div className="uppercase text-xs text-wave-teal font-semibold mb-2 pl-2">{section.title}</div>
            <ul className="space-y-1">
              {section.items.map(item => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-wave-forest hover:bg-wave-green transition-colors font-medium ${item.isLogout ? 'text-red-600 hover:bg-red-50' : ''}`}
                    onClick={item.isLogout ? (e) => { e.preventDefault(); onLogout && onLogout(); } : undefined}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="text-xs text-wave-forest text-center opacity-60">&copy; {new Date().getFullYear()} Wave</div>
    </aside>
  );
} 