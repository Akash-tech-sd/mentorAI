import React from 'react';
import { UserProfile } from '../types';
import { 
  GraduationCap, 
  Sparkles, 
  Bell, 
  BookOpen, 
  UserCheck, 
  RefreshCw,
  Award
} from 'lucide-react';

interface NavbarProps {
  currentUser: UserProfile;
  allUsers: UserProfile[];
  onSwitchUser: (user: UserProfile) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  unreadEmailCount: number;
  onOpenEmailInbox: () => void;
  onOpenGuide: () => void;
  onOpenGraduation: () => void;
  isEligibleForGraduation: boolean;
  onResetData: () => void;
  isResetting: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  allUsers,
  onSwitchUser,
  activeTab,
  setActiveTab,
  unreadEmailCount,
  onOpenEmailInbox,
  onOpenGuide,
  onOpenGraduation,
  isEligibleForGraduation,
  onResetData,
  isResetting,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-blue-300 bg-clip-text text-transparent">
                  MentorAI
                </span>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Data Analytics
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                AI Internship Mentor & Automated Task Review System
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('roadmap')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'roadmap'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              1-Year Roadmap
            </button>
            <button
              onClick={() => setActiveTab('mentor')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === 'mentor'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>AI Mentor Voice</span>
            </button>
            <button
              onClick={() => setActiveTab('reviewer')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === 'reviewer'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>Reviewer Portal</span>
            </button>
          </nav>

          {/* Action Tools & User Profile Switcher */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Student Guide Button */}
            <button
              onClick={onOpenGuide}
              className="flex items-center space-x-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 transition"
              title="View Architecture, Supabase SQL Schema, GitHub & Deployment Guide"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Guide & Docs</span>
            </button>

            {/* Email Notification Bell */}
            <button
              onClick={onOpenEmailInbox}
              className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
              title="Dispatched Email Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadEmailCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-slate-900">
                  {unreadEmailCount}
                </span>
              )}
            </button>

            {/* Graduation / Certificate Badge */}
            {isEligibleForGraduation && (
              <button
                onClick={onOpenGraduation}
                className="animate-pulse flex items-center space-x-1 text-xs font-bold px-2.5 py-1.5 rounded-lg bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                title="View Official Certificate"
              >
                <Award className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Graduation Certificate</span>
              </button>
            )}

            {/* Role Switcher Dropdown */}
            <div className="relative">
              <select
                value={currentUser.id}
                onChange={(e) => {
                  const target = allUsers.find(u => u.id === e.target.value);
                  if (target) onSwitchUser(target);
                }}
                className="bg-slate-800 text-xs text-slate-200 border border-slate-700 rounded-lg py-1.5 pl-2 pr-7 font-medium cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {allUsers.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.role === 'intern' ? '🎓 Intern: ' : '👔 Reviewer: '}
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Seed Data */}
            <button
              onClick={onResetData}
              disabled={isResetting}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
              title="Reset data to initial fresh state"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden overflow-x-auto py-2 border-t border-slate-800 space-x-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1 rounded text-xs whitespace-nowrap font-medium ${
              activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'text-slate-400'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('roadmap')}
            className={`px-3 py-1 rounded text-xs whitespace-nowrap font-medium ${
              activeTab === 'roadmap' ? 'bg-blue-600 text-white' : 'text-slate-400'
            }`}
          >
            1-Year Roadmap
          </button>
          <button
            onClick={() => setActiveTab('mentor')}
            className={`px-3 py-1 rounded text-xs whitespace-nowrap font-medium ${
              activeTab === 'mentor' ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
          >
            AI Mentor
          </button>
          <button
            onClick={() => setActiveTab('reviewer')}
            className={`px-3 py-1 rounded text-xs whitespace-nowrap font-medium ${
              activeTab === 'reviewer' ? 'bg-emerald-600 text-white' : 'text-slate-400'
            }`}
          >
            Reviewer Portal
          </button>
        </div>

      </div>
    </header>
  );
};
