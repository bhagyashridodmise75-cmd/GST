import React from 'react';
import {
  FileText,
  Sparkles,
  ShieldCheck,
  Percent,
  Scan,
  CheckCircle2,
  ArrowRight,
  Receipt,
  Building2,
  FileCheck2,
  Users
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onViewDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onViewDemo }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Public Top Header */}
      <header className="w-full glass-panel border-b border-slate-800/80 bg-slate-900/80 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight text-white">
                GST<span className="text-indigo-400">Ease</span>
              </span>
              <p className="text-[10px] text-slate-400 -mt-1">For Indian MSMEs & Freelancers</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            
            <button
              onClick={onGetStarted}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 transition hover:scale-105"
            >
              Get Started Free
            </button>
            <button
              onClick={onViewDemo}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              Explore GSTease
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-3.5 py-1.5 text-xs text-indigo-300 border border-indigo-500/20 mb-6">
          <Sparkles className="h-4 w-4 text-purple-400 animate-pulse" />
          <span>AI-Powered GST Management & Filing Assistant</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight max-w-4xl mx-auto">
          GST Filing Made <span className="gradient-text">Simple & Error-Free</span> for Small Businesses
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Manage invoices, calculate GST, track input tax credit, detect invoice errors with AI health check, and generate filing-ready reports — all from one simple dashboard.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={onGetStarted}
            className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-bold shadow-xl shadow-indigo-500/30 transition hover:scale-105"
          >
            <span>Get Started Free</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          <button
          
            className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-sm font-bold border border-slate-700 transition"
          >
            <Receipt className="h-4 w-4 text-indigo-400" />
            <span>Sign in</span>
          </button>
        </div>

        {/* Hero Feature Badges */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
          <div className="glass-card p-4 rounded-2xl border border-slate-800">
            <Scan className="h-6 w-6 text-purple-400 mb-2" />
            <h4 className="font-bold text-sm text-white">AI Invoice OCR</h4>
            <p className="text-xs text-slate-400 mt-0.5">Extract invoice details from PDF & image uploads</p>
          </div>
          <div className="glass-card p-4 rounded-2xl border border-slate-800">
            <ShieldCheck className="h-6 w-6 text-emerald-400 mb-2" />
            <h4 className="font-bold text-sm text-white">GST Health Check</h4>
            <p className="text-xs text-slate-400 mt-0.5">Automated 12-rule error auditor (🔴/🟠/🟢)</p>
          </div>
          <div className="glass-card p-4 rounded-2xl border border-slate-800">
            <Percent className="h-6 w-6 text-indigo-400 mb-2" />
            <h4 className="font-bold text-sm text-white">ITC Tracking</h4>
            <p className="text-xs text-slate-400 mt-0.5">Rule 36(4) Input Tax Credit eligibility setoff</p>
          </div>
          <div className="glass-card p-4 rounded-2xl border border-slate-800">
            <Sparkles className="h-6 w-6 text-amber-400 mb-2" />
            <h4 className="font-bold text-sm text-white">GST Sahayak AI</h4>
            <p className="text-xs text-slate-400 mt-0.5">Ask questions about your live GST calculations</p>
          </div>
        </div>
      </section>

      {/* Target Users Banner */}
      <section className="py-12 bg-slate-900/60 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-6">
            Tailored specifically for Indian Enterprise Owners
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 text-xs font-semibold text-slate-300">
            <span>🛒 Small Shop Owners</span>
            <span>👨‍💻 Freelancers & Consultants</span>
            <span>🏭 Small Manufacturers</span>
            <span>📦 Traders & Distributors</span>
            <span>🛠️ Service Providers</span>
            <span>🏢 Micro Enterprises</span>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-white">How GSTEase Works in 4 Simple Steps</h2>
          <p className="text-xs text-slate-400 max-w-xl mx-auto">
            No accounting degree required. Clean SaaS flow designed for micro business owners.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass-card p-6 rounded-2xl border border-slate-800 relative">
            <span className="text-4xl font-extrabold text-indigo-500/20 absolute top-4 right-4">01</span>
            <h4 className="font-bold text-base text-white">Add or Upload Invoices</h4>
            <p className="text-xs text-slate-400 mt-2">Manual entry or drag-and-drop PDF/image OCR scanner.</p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-slate-800 relative">
            <span className="text-4xl font-extrabold text-indigo-500/20 absolute top-4 right-4">02</span>
            <h4 className="font-bold text-base text-white">Automated GST Engine</h4>
            <p className="text-xs text-slate-400 mt-2">Auto-determines CGST+SGST vs IGST based on State match.</p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-slate-800 relative">
            <span className="text-4xl font-extrabold text-indigo-500/20 absolute top-4 right-4">03</span>
            <h4 className="font-bold text-base text-white">Run GST Health Check</h4>
            <p className="text-xs text-slate-400 mt-2">Identify duplicate invoices, missing GSTINs, and math errors.</p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-slate-800 relative">
            <span className="text-4xl font-extrabold text-indigo-500/20 absolute top-4 right-4">04</span>
            <h4 className="font-bold text-base text-white">Download Filing Report</h4>
            <p className="text-xs text-slate-400 mt-2">Generate PDF & CSV reports ready for GSTR-1 & GSTR-3B.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 py-8 bg-slate-950 text-center text-xs text-slate-500">
        <p>GSTEase — AI-Powered GST Filing Assistant for Micro & Small Enterprises</p>
        <p className="mt-1 text-[11px]">
          Disclaimer: This application provides GST calculations and filing assistance for informational purposes. Users should verify tax information with a certified CA before filing returns on the GSTN portal.
        </p>
      </footer>
    </div>
  );
};
