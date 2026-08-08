import React, { useState } from 'react';
import {
  FileText,
  Bell,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Building2,
  Calendar,
  Sparkles,
  HelpCircle,
  LogOut,
  RefreshCw,
  Home,
  UserCheck
} from 'lucide-react';
import { BusinessProfile, AppNotification } from '../../types';

interface NavbarProps {
  profile: BusinessProfile;
  notifications: AppNotification[];
  onMarkNotificationRead: (id: string) => void;
  onNavigate: (view: string) => void;
  onOpenSettings: () => void;
  onResetDemo: () => void;
  onGoToLanding: () => void;
  currentView: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  profile,
  notifications,
  onMarkNotificationRead,
  onNavigate,
  onOpenSettings,
  onResetDemo,
  onGoToLanding,
  currentView,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md">
      {/* Official Disclaimer Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950 px-4 py-1 text-center text-xs text-slate-400 border-b border-slate-800/50 flex items-center justify-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>
          <strong>GSTEase AI Assistant</strong> — Designed for Indian Micro & Small Enterprises. Verified against GSTR-1 & GSTR-3B rules.
        </span>
        <span className="hidden md:inline text-slate-500">|</span>
        <span className="hidden md:inline text-slate-400">Not an official GSTN government filing portal.</span>
      </div>

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand logo & Business indicator */}
        <div className="flex items-center gap-4">
          <button
            onClick={onGoToLanding}
            className="flex items-center gap-2 text-left group transition"
            title="Go to Landing Page"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg tracking-tight text-white group-hover:text-indigo-400 transition">
                  GST<span className="text-indigo-400">Ease</span>
                </span>
                <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-400 border border-indigo-500/20">
                  AI MVP
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">GST Filing & Audit Assistant</p>
            </div>
          </button>

          {/* Business Chip */}
          <div className="hidden lg:flex items-center gap-2 rounded-lg bg-slate-800/60 px-3 py-1.5 border border-slate-700/50 text-xs">
            <Building2 className="h-4 w-4 text-indigo-400" />
            <div>
              <p className="font-medium text-slate-200">{profile.businessName}</p>
              <p className="text-[10px] text-slate-400 font-mono">GSTIN: {profile.gstin}</p>
            </div>
          </div>
        </div>

        {/* Center: Filing Deadline Ticker */}
        <div className="hidden md:flex items-center gap-2 rounded-full bg-amber-500/10 px-3.5 py-1.5 text-xs text-amber-300 border border-amber-500/20">
          <Calendar className="h-3.5 w-3.5 text-amber-400" />
          <span>
            <strong>GSTR-3B Deadline:</strong> 20 Sep 2026
          </span>
          <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold">13 Days Left</span>
        </div>

        {/* Right Actions: Assistant trigger, Notifications, Settings, Demo Reset */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Sahayak Trigger Button */}
          <button
            onClick={() => onNavigate('assistant')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              currentView === 'assistant'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'bg-slate-800/80 text-purple-300 hover:bg-slate-700 border border-purple-500/30'
            }`}
          >
            <Sparkles className="h-4 w-4 text-purple-400 animate-pulse" />
            <span className="hidden sm:inline">GST Sahayak</span>
          </button>

          {/* Notification Bell Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative rounded-lg p-2 text-slate-300 hover:bg-slate-800 transition"
              title="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Drawer Modal */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl glass-card p-4 shadow-2xl z-50 border border-slate-700/60 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-indigo-400" />
                    <h4 className="font-semibold text-sm text-slate-100">Audit & Tax Notifications</h4>
                  </div>
                  <span className="text-xs text-slate-400">{notifications.length} alerts</span>
                </div>

                <div className="mt-3 max-h-72 overflow-y-auto space-y-2 pr-1">
                  {notifications.length === 0 ? (
                    <p className="text-center text-xs text-slate-400 py-6">No pending notifications.</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          onMarkNotificationRead(n.id);
                          if (n.viewTarget) onNavigate(n.viewTarget);
                          setShowNotifications(false);
                        }}
                        className={`group cursor-pointer rounded-lg p-2.5 transition border ${
                          n.isRead
                            ? 'bg-slate-800/30 border-slate-800 text-slate-400'
                            : 'bg-slate-800/80 border-slate-700 text-slate-200 hover:border-indigo-500/50'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {n.type === 'error' && <XCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />}
                          {n.type === 'warning' && <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />}
                          {n.type === 'info' && <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />}
                          <div className="flex-1">
                            <p className="text-xs font-semibold group-hover:text-indigo-300 transition">{n.title}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{n.message}</p>
                            <span className="text-[9px] text-slate-500 mt-1 block">
                              {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Settings / Profile Button */}
          <button
            onClick={onOpenSettings}
            className="rounded-lg p-2 text-slate-300 hover:bg-slate-800 transition"
            title="Business Settings & Tax Rates"
          >
            <UserCheck className="h-5 w-5" />
          </button>

          {/* Reset Demo Data Button */}
          <button
            onClick={onResetDemo}
            className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-400 transition bg-slate-800/40 hover:bg-slate-800 px-2 py-1 rounded border border-slate-700/40"
            title="Reset to initial sample demo invoices"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>
    </header>
  );
};
