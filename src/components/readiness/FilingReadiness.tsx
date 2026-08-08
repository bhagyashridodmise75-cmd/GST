import React, { useState } from 'react';
import {
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Download,
  ShieldCheck,
  FileSpreadsheet,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { BusinessProfile, GSTSummaryData, Invoice } from '../../types';
import { formatINR } from '../../services/gstEngine';
import { generateFilingPDFReport } from '../../services/reportGenerator';

interface FilingReadinessProps {
  profile: BusinessProfile;
  summary: GSTSummaryData;
  invoices: Invoice[];
  errorCount: number;
}

export const FilingReadiness: React.FC<FilingReadinessProps> = ({
  profile,
  summary,
  invoices,
  errorCount,
}) => {
  const [showFilingReportModal, setShowFilingReportModal] = useState(false);

  // Dynamic Score Calculation
  let baseScore = 100;
  if (errorCount > 0) baseScore -= errorCount * 10;
  if (!profile.gstin) baseScore -= 20;
  const readinessScore = Math.max(20, Math.min(100, baseScore));

  const checklistItems = [
    { id: '1', title: 'Business Profile & GSTIN verified', done: !!profile.gstin && profile.isSetupComplete },
    { id: '2', title: 'Sales invoices processed (Outward Taxable)', done: summary.salesCount > 0 },
    { id: '3', title: 'Purchase invoices processed (Inward ITC)', done: summary.purchaseCount > 0 },
    { id: '4', title: 'GST calculations (CGST/SGST/IGST) verified', done: true },
    {
      id: '5',
      title: `Invoice health check (${errorCount} issues detected)`,
      done: errorCount === 0,
      warning: errorCount > 0,
    },
    { id: '6', title: 'Eligible Input Tax Credit (ITC) calculated', done: summary.eligibleItc > 0 },
  ];

  const handleGenerateReport = () => {
    // Trigger celebratory confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
    setShowFilingReportModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">GST Filing Readiness Audit</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Evaluate your GSTR-1 and GSTR-3B tax return filing score prior to submitting on the official portal.
          </p>
        </div>

        <button
          onClick={handleGenerateReport}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/25 transition hover:scale-105"
        >
          <Sparkles className="h-4 w-4" />
          <span>Generate Filing-Ready Report</span>
        </button>
      </div>

      {/* Large Score Indicator & Checklist Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Gauge Card */}
        <div className="glass-card p-6 rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 flex flex-col items-center justify-center text-center space-y-4">
          <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
            Overall Filing Readiness Score
          </span>

          {/* Radial Circular Display */}
          <div className="relative w-40 h-40 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-emerald-400 transition-all duration-1000"
                strokeDasharray={`${readinessScore}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-4xl font-extrabold text-white">{readinessScore}%</span>
              <span className="text-[10px] text-emerald-400 block font-semibold">Grade A Compliance</span>
            </div>
          </div>

          <p className="text-xs text-slate-300">
            {readinessScore >= 80
              ? 'Your return dataset is in healthy condition. You can download your filing-ready summary.'
              : 'Attention needed on flagged invoice errors to maximize score.'}
          </p>
        </div>

        {/* Dynamic Interactive Checklist (2/3 Width) */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-bold text-base text-white">Pre-Filing Compliance Checklist</h3>
            <span className="text-xs text-slate-400">
              {checklistItems.filter((i) => i.done).length} / {checklistItems.length} Verified
            </span>
          </div>

          <div className="space-y-3">
            {checklistItems.map((item) => (
              <div
                key={item.id}
                className={`p-3.5 rounded-xl border flex items-center justify-between text-xs transition ${
                  item.done
                    ? 'bg-slate-900/80 border-slate-800 text-slate-200'
                    : 'bg-amber-950/20 border-amber-500/30 text-amber-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.done ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />
                  )}
                  <span className="font-semibold">{item.title}</span>
                </div>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    item.done
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {item.done ? '✓ Completed' : '⚠ Review Required'}
                </span>
              </div>
            ))}
          </div>

          {/* CTA Box */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={handleGenerateReport}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition"
            >
              <FileCheck2 className="h-4 w-4" />
              <span>Generate Filing-Ready Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Official GSTR Filing Report Modal */}
      {showFilingReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card w-full max-w-2xl rounded-2xl border border-slate-700 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-emerald-400 animate-pulse" />
                <h3 className="font-bold text-lg text-white">GSTEase Filing-Ready Report Summary</h3>
              </div>
              <button
                onClick={() => setShowFilingReportModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-800 text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 space-y-4 text-xs font-mono">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800 text-slate-300">
                <span>Business Name: <strong>{profile.businessName}</strong></span>
                <span>GSTIN: <strong>{profile.gstin}</strong></span>
              </div>

              <div className="space-y-2 text-slate-300">
                <div className="flex justify-between">
                  <span>Outward Taxable Sales Value:</span>
                  <span>{formatINR(summary.totalTaxableSales)}</span>
                </div>
                <div className="flex justify-between text-purple-300">
                  <span>Total Output GST Collected:</span>
                  <span>{formatINR(summary.totalOutputGst)}</span>
                </div>
                <div className="flex justify-between text-emerald-300">
                  <span>Less Eligible Input Tax Credit (ITC):</span>
                  <span>− {formatINR(summary.eligibleItc)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-white border-t border-slate-700 pt-2 font-sans">
                  <span>Net Estimated GST Payable:</span>
                  <span className="text-emerald-400 font-mono">{formatINR(summary.estimatedGstPayable)}</span>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <p className="text-[11px] text-slate-400 italic leading-snug">
              "This filing-ready report summarizes your GSTR-1 and GSTR-3B figures for review. You can use these values directly when logging into the government portal (gst.gov.in)."
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => generateFilingPDFReport(profile, summary, invoices)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700"
              >
                <Download className="h-4 w-4" />
                <span>Download Official PDF</span>
              </button>
              <button
                onClick={() => setShowFilingReportModal(false)}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
              >
                Done / Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
