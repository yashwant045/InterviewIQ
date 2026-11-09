import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  History,
  Code2,
  FileText,
  User,
  Settings,
  HelpCircle,
  Plus,
  Sparkles,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

export default function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/history', label: 'Interview History', icon: History },
    { to: '/practice', label: 'Practice Hub', icon: Code2 },
    { to: '/profile', label: 'Profile & Resume', icon: FileText },
  ];

  return (
    <div className="flex h-screen bg-[#090b10] text-slate-100 overflow-hidden font-sans">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0d0f17] border-r border-slate-800/80 p-5 justify-between">
        <div className="space-y-6">
          {/* Logo */}
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-3 cursor-pointer group px-2"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-600/30 group-hover:scale-105 transition">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold bg-gradient-to-r from-white via-slate-200 to-purple-400 bg-clip-text text-transparent">
                InterviewIQ
              </span>
              <span className="block text-[10px] text-purple-400 font-medium tracking-wider uppercase">
                AI Interviewer
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 pt-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-violet-600/20 to-purple-600/10 text-purple-300 border border-violet-500/30 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="space-y-4 pt-4 border-t border-slate-800/80">
          <div className="p-3.5 rounded-xl bg-gradient-to-b from-purple-900/20 to-transparent border border-purple-500/20 text-xs">
            <div className="flex items-center gap-2 text-purple-300 font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pro Plan Active</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Unlimited mock sessions & real-time radar evaluations enabled.
            </p>
          </div>

          <div className="flex items-center justify-between px-2 text-xs text-slate-400">
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2 hover:text-slate-200 transition"
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 text-rose-400 hover:text-rose-300 transition"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 border-b border-slate-800/80 bg-[#0d0f17]/80 backdrop-blur px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-800 text-slate-300"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <span className="font-bold text-purple-400">InterviewIQ</span>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>AI Interview Engine Online</span>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/configure')}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-purple-600/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Plus className="w-4 h-4" />
              <span>Start New Interview</span>
            </button>

            {/* User Avatar */}
            <div
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2.5 cursor-pointer pl-2 border-l border-slate-800"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center font-bold text-xs text-white shadow-md">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'JD'}
              </div>
              <span className="hidden sm:inline text-xs font-medium text-slate-300">
                {user?.name || 'John'}
              </span>
            </div>
          </div>
        </header>

        {/* Body View Container */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

