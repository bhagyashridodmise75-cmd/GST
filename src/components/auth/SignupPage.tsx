import React, { useState } from 'react';
import {
  FileText, User, Mail, Lock, Building2, Hash, Briefcase,
  MapPin, Phone, ArrowRight, CheckCircle2, AlertCircle, Eye, EyeOff,
} from 'lucide-react';
import { db } from '../../services/db';
import { INDIAN_STATES } from '../../services/gstEngine';

const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

const BUSINESS_TYPES = [
  'Retail & Service Provider',
  'Manufacturer',
  'Trader / Wholesaler',
  'Freelancer / Consultant',
  'E-Commerce Seller',
  'Restaurant / Food Service',
  'IT & Technology Services',
  'Healthcare / Pharmacy',
  'Construction & Real Estate',
  'Transport & Logistics',
  'Education / Training',
  'Other',
];

export const SignupPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [gstin, setGstin] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [state, setState] = useState('');
  const [phone, setPhone] = useState('');

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = (): string | null => {
    if (!fullName.trim()) return 'Full Name is required.';
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address.';
    if (!password || password.length < 6) return 'Password must be at least 6 characters.';
    if (!businessName.trim()) return 'Business Name is required.';
    if (!gstin.trim()) return 'GSTIN is required.';
    if (!GSTIN_REGEX.test(gstin.trim().toUpperCase())) return 'Invalid GSTIN format. Example: 27ABCDE1234F1Z5';
    if (!businessType) return 'Please select a Business Type.';
    if (!state) return 'Please select a State.';
    if (!phone.trim()) return 'Phone Number is required.';
    if (!/^[\d\s\+\-]{10,15}$/.test(phone.trim())) return 'Enter a valid phone number (10–15 digits).';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    try {
      db.registerUser({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        businessName: businessName.trim(),
        gstin: gstin.trim().toUpperCase(),
        businessType,
        state,
        phone: phone.trim(),
      });

      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4 animate-in fade-in">
          <div className="h-16 w-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-8 w-8 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Account Created!</h2>
          <p className="text-slate-400 text-sm">Redirecting you to your dashboard…</p>
          <div className="flex justify-center">
            <div className="h-1 w-32 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 animate-pulse rounded-full" style={{ width: '80%' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          <a href="/login" className="text-sm text-slate-400 hover:text-indigo-400 transition font-medium">
            Already have an account? <span className="text-indigo-400 underline underline-offset-2">Login</span>
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 text-xs text-indigo-400 font-medium mb-4">
              <Briefcase className="h-3.5 w-3.5" />
              Free Business Account
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              Register Your <span className="gradient-text">Business</span>
            </h1>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              Create your GSTEase account to manage invoices, track ITC, and get AI-powered GST filing assistance.
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

            <form onSubmit={handleSubmit} noValidate>
              {/* Row 1: Full Name + Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    <User className="h-3 w-3 inline mr-1 text-indigo-400" />
                    Full Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    id="signup-fullname"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Rajesh Sharma"
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition"
                    required
                    autoComplete="name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    <Mail className="h-3 w-3 inline mr-1 text-indigo-400" />
                    Email Address <span className="text-rose-400">*</span>
                  </label>
                  <input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@business.com"
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Row 2: Password */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  <Lock className="h-3 w-3 inline mr-1 text-indigo-400" />
                  Password <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2.5 pr-10 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition"
                    required
                    autoComplete="new-password"
                    minLength={6}
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
                <p className="text-[11px] text-slate-500 mt-1">Use at least 6 characters with a mix of letters and numbers.</p>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-slate-800" />
                <span className="text-[11px] text-slate-500 font-medium uppercase tracking-widest">Business Details</span>
                <div className="flex-1 h-px bg-slate-800" />
              </div>

              {/* Row 3: Business Name + GSTIN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    <Building2 className="h-3 w-3 inline mr-1 text-indigo-400" />
                    Business Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    id="signup-business-name"
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Sharma Enterprise Solutions"
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition"
                    required
                    autoComplete="organization"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    <Hash className="h-3 w-3 inline mr-1 text-indigo-400" />
                    GSTIN <span className="text-rose-400">*</span>
                  </label>
                  <input
                    id="signup-gstin"
                    type="text"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value.toUpperCase())}
                    placeholder="27ABCDE1234F1Z5"
                    maxLength={15}
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 font-mono tracking-wide focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition"
                    required
                  />
                  <p className="text-[11px] text-slate-500 mt-1">15-character GST Identification Number</p>
                </div>
              </div>

              {/* Row 4: Business Type + State */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    <Briefcase className="h-3 w-3 inline mr-1 text-indigo-400" />
                    Business Type <span className="text-rose-400">*</span>
                  </label>
                  <select
                    id="signup-business-type"
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition"
                    required
                  >
                    <option value="" disabled>Select type…</option>
                    {BUSINESS_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    <MapPin className="h-3 w-3 inline mr-1 text-indigo-400" />
                    State of Registration <span className="text-rose-400">*</span>
                  </label>
                  <select
                    id="signup-state"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition"
                    required
                  >
                    <option value="" disabled>Select state…</option>
                    {INDIAN_STATES.map((st) => (
                      <option key={st.code} value={st.name}>
                        {st.name} ({st.gstCode})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 5: Phone */}
              <div className="mb-6">
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  <Phone className="h-3 w-3 inline mr-1 text-indigo-400" />
                  Phone Number <span className="text-rose-400">*</span>
                </label>
                <input
                  id="signup-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 font-mono focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition"
                  required
                  autoComplete="tel"
                />
              </div>

              {/* Submit Button */}
              <button
                id="signup-submit"
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
                    Creating Account…
                  </>
                ) : (
                  <>
                    Create Business Account
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              {/* Login Link */}
              <p className="text-center text-xs text-slate-500 mt-4">
                Already have an account?{' '}
                <a href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition underline underline-offset-2">
                  Login here
                </a>
              </p>

              {/* Disclaimer */}
              <p className="text-center text-[10px] text-slate-600 mt-3 leading-relaxed">
                GST estimates are for assistance only. Verify with a qualified CA or the official GST portal before filing.
              </p>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};
