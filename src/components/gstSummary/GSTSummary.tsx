import React, { useState } from 'react';
import {
  Calculator,
  Calendar,
  Download,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { GSTSummaryData, BusinessProfile, Invoice } from '../../types';
import { formatINR } from '../../services/gstEngine';
import { generateFilingPDFReport } from '../../services/reportGenerator';

interface GSTSummaryProps {
  profile: BusinessProfile;
  summary: GSTSummaryData;
  invoices: Invoice[];
}

export const GSTSummary: React.FC<GSTSummaryProps> = ({
  profile,
  summary,
  invoices,
}) => {
  const [period, setPeriod] = useState('August 2026');

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">GST Tax Liability Summary (GSTR-3B)</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated tax calculation: Output GST (on Sales) minus Eligible Input Tax Credit (ITC).
          </p>
        </div>

        {/* Period Selector & Download PDF */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-700/80 px-3 py-1.5 rounded-xl text-xs">
            <Calendar className="h-4 w-4 text-indigo-400" />
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="August 2026">August 2026 (Current)</option>
              <option value="July 2026">July 2026</option>
              <option value="Q2 FY 2026-27">Q2 FY 2026-27 (Jul-Sep)</option>
              <option value="FY 2026-27">FY 2026-27 (Full Year)</option>
            </select>
          </div>

          <button
            onClick={() => generateFilingPDFReport(profile, summary, invoices)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md transition"
          >
            <Download className="h-4 w-4" />
            <span>Download GSTR-3B PDF</span>
          </button>
        </div>
      </div>

      {/* Main Calculation Step-by-Step Card */}
      <div className="glass-card p-6 rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-indigo-400" />
            <h3 className="font-bold text-base text-white">GSTR-3B Tax Formula Computation</h3>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            Filing Deadline: 20th September 2026
          </span>
        </div>

        {/* Step 1: Output Tax */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-slate-900/80 p-4 rounded-xl border border-slate-800">
          <div className="md:col-span-2">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
              Step 1: Gross Output GST (Sales Tax Liability)
            </span>
            <p className="text-xs text-slate-300 mt-1">
              Collected from {summary.salesCount} sales transactions with total taxable value of {formatINR(summary.totalTaxableSales)}.
            </p>
          </div>
          <div className="text-right font-mono">
            <span className="text-2xl font-extrabold text-purple-300">{formatINR(summary.totalOutputGst)}</span>
          </div>
        </div>

        {/* Minus Sign Divider */}
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold border border-slate-700">
            −
          </div>
        </div>

        {/* Step 2: Input Tax Credit */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-slate-900/80 p-4 rounded-xl border border-slate-800">
          <div className="md:col-span-2">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Step 2: Less Eligible Input Tax Credit (ITC Setoff)
            </span>
            <p className="text-xs text-slate-300 mt-1">
              Claimable tax paid on {summary.purchaseCount} purchase bills with total purchase value of {formatINR(summary.totalPurchases)}.
            </p>
          </div>
          <div className="text-right font-mono">
            <span className="text-2xl font-extrabold text-emerald-300">{formatINR(summary.eligibleItc)}</span>
          </div>
        </div>

        {/* Equals Sign Divider */}
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold shadow-lg">
            =
          </div>
        </div>

        {/* Step 3: Net GST Payable */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-gradient-to-r from-indigo-900/60 to-purple-900/60 p-5 rounded-xl border border-indigo-500/40">
          <div className="md:col-span-2">
            <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
              Step 3: Final Estimated GST Payable in Cash (Electronic Cash Ledger)
            </span>
            <p className="text-xs text-slate-200 mt-1">
              Net cash tax payable to the Government after deducting all eligible ITC setoffs.
            </p>
          </div>
          <div className="text-right font-mono">
            <span className="text-3xl font-black text-white">{formatINR(summary.estimatedGstPayable)}</span>
          </div>
        </div>
      </div>

      {/* Tax Component Breakdown Table (CGST, SGST, IGST) */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800">
        <h3 className="font-bold text-base text-white mb-4">Detailed Tax Component Breakdown</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3.5">Tax Head Particulars</th>
                <th className="p-3.5 text-right">CGST (Central Tax)</th>
                <th className="p-3.5 text-right">SGST (State Tax)</th>
                <th className="p-3.5 text-right">IGST (Integrated Tax)</th>
                <th className="p-3.5 text-right font-bold text-white">Total GST (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              <tr>
                <td className="p-3.5 font-sans font-medium text-slate-200">A. Output Tax (Sales Invoices)</td>
                <td className="p-3.5 text-right">{formatINR(summary.outputCgst)}</td>
                <td className="p-3.5 text-right">{formatINR(summary.outputSgst)}</td>
                <td className="p-3.5 text-right">{formatINR(summary.outputIgst)}</td>
                <td className="p-3.5 text-right font-bold text-purple-300">{formatINR(summary.totalOutputGst)}</td>
              </tr>
              <tr>
                <td className="p-3.5 font-sans font-medium text-slate-200">B. Input Tax Credit (Purchases)</td>
                <td className="p-3.5 text-right text-emerald-400">{formatINR(summary.outputCgst)}</td>
                <td className="p-3.5 text-right text-emerald-400">{formatINR(summary.outputSgst)}</td>
                <td className="p-3.5 text-right text-emerald-400">
                  {formatINR(Math.max(0, summary.eligibleItc - (summary.outputCgst + summary.outputSgst)))}
                </td>
                <td className="p-3.5 text-right font-bold text-emerald-300">{formatINR(summary.eligibleItc)}</td>
              </tr>
              <tr className="bg-indigo-950/40 font-bold">
                <td className="p-3.5 font-sans text-indigo-300">C. Net Tax Liability Payable</td>
                <td className="p-3.5 text-right text-white">
                  {formatINR(Math.max(0, summary.outputCgst - summary.outputCgst))}
                </td>
                <td className="p-3.5 text-right text-white">
                  {formatINR(Math.max(0, summary.outputSgst - summary.outputSgst))}
                </td>
                <td className="p-3.5 text-right text-white">{formatINR(summary.estimatedGstPayable)}</td>
                <td className="p-3.5 text-right text-indigo-300 text-sm">{formatINR(summary.estimatedGstPayable)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
