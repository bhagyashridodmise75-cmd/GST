import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Wrench,
  Eye,
  FileCheck,
  Filter,
  Sparkles
} from 'lucide-react';
import { Invoice, GSTHealthError, ErrorSeverity } from '../../types';
import { formatINR } from '../../services/gstEngine';

interface GSTHealthCheckProps {
  invoices: Invoice[];
  onFixInvoice: (invoice: Invoice) => void;
  onRecheckAll: () => void;
}

export const GSTHealthCheck: React.FC<GSTHealthCheckProps> = ({
  invoices,
  onFixInvoice,
  onRecheckAll,
}) => {
  const [activeTab, setActiveTab] = useState<ErrorSeverity | 'all'>('all');

  const criticalInvoices = invoices.filter((i) => i.status === 'critical');
  const warningInvoices = invoices.filter((i) => i.status === 'warning');
  const validInvoices = invoices.filter((i) => i.status === 'valid');

  const displayInvoices = invoices.filter((inv) => {
    if (activeTab === 'all') return true;
    return inv.status === activeTab;
  });

  const totalErrorsCount = invoices.reduce((sum, inv) => sum + inv.errors.length, 0);

  return (
    <div className="space-y-6">
      {/* Header Overview Card */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">GST Health Check & Error Auditor</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Automated 12-rule compliance audit detecting missing GSTINs, calculation mismatches, duplicates & tax ratio errors.
          </p>
        </div>

        <button
          onClick={onRecheckAll}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition"
        >
          <Sparkles className="h-4 w-4" />
          <span>Re-Run Audit Engine</span>
        </button>
      </div>

      {/* Severity Filter Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* Tab All */}
        <button
          onClick={() => setActiveTab('all')}
          className={`glass-card p-4 rounded-2xl border text-left transition ${
            activeTab === 'all'
              ? 'border-indigo-500/50 bg-indigo-950/20'
              : 'border-slate-800 hover:border-slate-700'
          }`}
        >
          <span className="text-xs font-medium text-slate-400 block">Total Audited</span>
          <p className="text-2xl font-bold text-white mt-1">{invoices.length} Invoices</p>
          <span className="text-[10px] text-slate-400 mt-1 block">{totalErrorsCount} total audit triggers</span>
        </button>

        {/* Tab Critical */}
        <button
          onClick={() => setActiveTab('critical')}
          className={`glass-card p-4 rounded-2xl border text-left transition ${
            activeTab === 'critical'
              ? 'border-rose-500/60 bg-rose-950/30'
              : 'border-slate-800 hover:border-rose-500/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-400">🔴 Critical Errors</span>
            <AlertOctagon className="h-4 w-4 text-rose-400" />
          </div>
          <p className="text-2xl font-bold text-rose-300 mt-1">{criticalInvoices.length} Invoices</p>
          <span className="text-[10px] text-rose-400 mt-1 block">Filing blocker — Fix immediately</span>
        </button>

        {/* Tab Warnings */}
        <button
          onClick={() => setActiveTab('warning')}
          className={`glass-card p-4 rounded-2xl border text-left transition ${
            activeTab === 'warning'
              ? 'border-amber-500/60 bg-amber-950/30'
              : 'border-slate-800 hover:border-amber-500/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-400">🟠 Warnings</span>
            <AlertTriangle className="h-4 w-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-300 mt-1">{warningInvoices.length} Invoices</p>
          <span className="text-[10px] text-amber-400 mt-1 block">Review before GSTR-3B submission</span>
        </button>

        {/* Tab Valid */}
        <button
          onClick={() => setActiveTab('valid')}
          className={`glass-card p-4 rounded-2xl border text-left transition ${
            activeTab === 'valid'
              ? 'border-emerald-500/60 bg-emerald-950/30'
              : 'border-slate-800 hover:border-emerald-500/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-400">🟢 Valid Invoices</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-300 mt-1">{validInvoices.length} Invoices</p>
          <span className="text-[10px] text-emerald-400 mt-1 block">100% Audit compliant</span>
        </button>
      </div>

      {/* Audit Results Feed */}
      <div className="space-y-4">
        {displayInvoices.length === 0 ? (
          <div className="glass-card p-10 rounded-2xl border border-slate-800 text-center text-slate-400 text-xs">
            No invoices found in this category filter.
          </div>
        ) : (
          displayInvoices.map((inv) => (
            <div
              key={inv.id}
              className={`glass-card p-5 rounded-2xl border transition ${
                inv.status === 'critical'
                  ? 'border-rose-500/40 bg-rose-950/10'
                  : inv.status === 'warning'
                  ? 'border-amber-500/30 bg-amber-950/10'
                  : 'border-slate-800/80'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase inline-flex items-center gap-1 ${
                      inv.status === 'critical'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : inv.status === 'warning'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {inv.status === 'critical' && '🔴 Critical'}
                    {inv.status === 'warning' && '🟠 Warning'}
                    {inv.status === 'valid' && '🟢 Valid'}
                  </span>

                  <div>
                    <h3 className="font-bold text-sm text-white font-mono">{inv.invoiceNumber}</h3>
                    <p className="text-[11px] text-slate-400">
                      {inv.type.toUpperCase()} | Party: <strong className="text-slate-200">{inv.type === 'sales' ? inv.buyerName : inv.sellerName}</strong> ({inv.invoiceDate})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right font-mono text-xs">
                    <span className="text-slate-400 block text-[10px]">Total Amount</span>
                    <span className="font-bold text-white">{formatINR(inv.totalAmount)}</span>
                  </div>

                  {inv.errors.length > 0 && (
                    <button
                      onClick={() => onFixInvoice(inv)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition"
                    >
                      <Wrench className="h-3.5 w-3.5" />
                      <span>Fix Error</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Error Detail Cards list */}
              {inv.errors.length === 0 ? (
                <div className="pt-3 flex items-center gap-2 text-xs text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Passed all 12 GST audit checks (GSTIN, HSN, Tax Split Ratio & Math verified).</span>
                </div>
              ) : (
                <div className="pt-3 space-y-2">
                  {inv.errors.map((err) => (
                    <div
                      key={err.id}
                      className={`p-3 rounded-xl border text-xs ${
                        err.severity === 'critical'
                          ? 'bg-rose-950/40 border-rose-500/30 text-rose-200'
                          : 'bg-amber-950/30 border-amber-500/30 text-amber-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-white">{err.message}</p>
                          <p className="text-[11px] opacity-85 mt-0.5">
                            <strong>Recommendation:</strong> {err.fixSuggestion}
                          </p>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-slate-900/60 font-mono text-[10px] uppercase text-slate-400">
                          Field: {err.field}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
