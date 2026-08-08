import React, { useState } from 'react';
import {
  FileText, Mail, Lock, ArrowRight, AlertCircle, Eye, EyeOff,
  Sparkles, UserCheck,
} from 'lucide-react';
import { db } from '../../services/db';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) { setError('Email address is required.'); return; }
    if (!password.trim()) { setError('Password is required.'); return; }

    setIsLoading(true);
    try {
      db.loginUser(email.trim(), password);
      window.location.href = '/';
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setIsLoading(true);
    try {
      db.loginUser('rajesh@sharmaenterprise.in', 'demo123');
      window.location.href = '/';
    } catch (err: any) {
      setError(err.message || 'Demo login failed.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950 px-4 py-1.5 text-center text-xs text-slate-400 border-b border-slate-800/50 flex items-center justify-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <strong className="text-slate-300">GSTEase AI Assistant</strong>
        <span className="text-slate-500">—</span>
        <span>Designed for Indian Micro &amp; Small Enterprises. Not an official GSTN government filing portal.</span>
      </div>

      {/* Navbar */}
      <header className="sticky top-0 z-40 glass-panel border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <a href="/" className="flex items-center gap-2 group transition">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg tracking-tight text-white group-hover:text-indigo-400 transition">
                  GST<span className="text-indigo-400">Ease</span>
                </span>
                <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-400 border border-indigo-500/20">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">GST Filing &amp; Audit Assistant</p>
            </div>
          </a>
          <a href="/signup" className="text-sm text-slate-400 hover:text-indigo-400 transition font-medium">
            New business?{' '}
            <span className="text-indigo-400 underline underline-offset-2">Create an account</span>
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-500/30 mb-4 mx-auto">
              <UserCheck className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome <span className="gradient-text">Back</span>
            </h1>
            <p className="text-slate-400 text-sm">
              Sign in to manage your GST invoices and filing.
            </p>
          </div>

          {/* Form Card */}
          <div className="glass-card rounded-2xl border border-slate-700/60 p-6 sm:p-8 shadow-2xl">
            {/* Error Banner */}
            {error && (
              <div className="mb-5 flex items-start gap-3 rounded-xl bg-rose-500/10 border border-rose-500/30 px-4 py-3 text-sm text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Demo Login Quick Button */}
            <button
              id="login-demo"
              type="button"
              onClick={handleDemoLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-indigo-500/40 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 hover:text-indigo-200 text-sm font-medium transition mb-5 disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4 text-purple-400 animate-pulse" />
              Login as Demo User (Sharma Enterprise)
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-slate-800" />
              <span className="text-[11px] text-slate-500 font-medium">or sign in with email</span>
              <div className="flex-1 h-px bg-slate-800" />
            </div>

            <form onSubmit={handleSubmit} noValidate>
              {/* Email */}
              <div className="mb-4">
                <label htmlFor="login-email" className="block text-xs font-medium text-slate-300 mb-1.5">
                  <Mail className="h-3 w-3 inline mr-1 text-indigo-400" />
                  Email Address <span className="text-rose-400">*</span>
                </label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@business.com"
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition"
                  required
                  autoComplete="email"
                />
              </div>

              {/* Password */}
              <div className="mb-6">
                <label htmlFor="login-password" className="block text-xs font-medium text-slate-300 mb-1.5">
                  <Lock className="h-3 w-3 inline mr-1 text-indigo-400" />
                  Password <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Your password"
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2.5 pr-10 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                id="login-submit"
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 transition-all duration-200 active:scale-[0.98]"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing In…
                  </>
                ) : (
                  <>
                    Sign In to Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              {/* Signup Link */}
              <p className="text-center text-xs text-slate-500 mt-4">
                Don't have an account?{' '}
                <a href="/signup" className="text-indigo-400 hover:text-indigo-300 font-medium transition underline underline-offset-2">
                  Create one for free
                </a>
              </p>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};
