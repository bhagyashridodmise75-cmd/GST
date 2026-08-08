import React, { useState } from 'react';
import {
  Percent,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Wrench,
  Search,
  Info
} from 'lucide-react';
import { Invoice, ITCStatus } from '../../types';
import { formatINR } from '../../services/gstEngine';

interface ITCTrackerProps {
  invoices: Invoice[];
  onFixInvoice: (invoice: Invoice) => void;
}

export const ITCTracker: React.FC<ITCTrackerProps> = ({ invoices, onFixInvoice }) => {
  const [statusFilter, setStatusFilter] = useState<ITCStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const purchaseInvoices = invoices.filter((i) => i.type === 'purchase');

  // Compute ITC metrics
  const eligibleInvoices = purchaseInvoices.filter(
    (i) => i.itcStatus === 'eligible' || (!i.itcStatus && i.status !== 'critical')
  );
  const reviewInvoices = purchaseInvoices.filter(
    (i) => i.itcStatus === 'review_required' || i.status === 'critical'
  );
  const ineligibleInvoices = purchaseInvoices.filter((i) => i.itcStatus === 'ineligible');

  const eligibleItcTotal = eligibleInvoices.reduce((s, i) => s + i.totalGst, 0);
  const reviewItcTotal = reviewInvoices.reduce((s, i) => s + i.totalGst, 0);
  const totalPurchaseTax = purchaseInvoices.reduce((s, i) => s + i.totalGst, 0);

  const filteredInvoices = purchaseInvoices.filter((inv) => {
    if (statusFilter !== 'all') {
      const invStatus = inv.itcStatus || (inv.status === 'critical' ? 'review_required' : 'eligible');
      if (invStatus !== statusFilter) return false;
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchNum = inv.invoiceNumber.toLowerCase().includes(q);
      const matchParty = inv.sellerName.toLowerCase().includes(q);
      const matchGstin = inv.sellerGstin.toLowerCase().includes(q);
      if (!matchNum && !matchParty && !matchGstin) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Percent className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Input Tax Credit (ITC) Tracker</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Track inward purchase tax credits eligible for GSTR-3B setoff against your output sales GST liability.
          </p>
        </div>
      </div>

      {/* 3 Summary Cards: Eligible ITC, Review Required, Ineligible */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Eligible ITC */}
        <div className="glass-card p-5 rounded-2xl border border-emerald-500/40 bg-emerald-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-400">Eligible ITC Claimable</span>
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          </div>
          <p className="text-3xl font-extrabold text-white tracking-tight mt-2">{formatINR(eligibleItcTotal)}</p>
          <p className="text-[11px] text-emerald-400 mt-1">
            {eligibleInvoices.length} Verified Purchase Invoices
          </p>
        </div>

        {/* Review Required */}
        <div className="glass-card p-5 rounded-2xl border border-amber-500/40 bg-amber-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-400">Pending Review ITC</span>
            <AlertCircle className="h-5 w-5 text-amber-400" />
          </div>
          <p className="text-3xl font-extrabold text-amber-300 tracking-tight mt-2">{formatINR(reviewItcTotal)}</p>
          <p className="text-[11px] text-amber-400 mt-1">
            {reviewInvoices.length} Bills (Missing Supplier GSTIN / Error)
          </p>
        </div>

        {/* Total Purchase Tax */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Purchase Tax Paid</span>
            <Percent className="h-5 w-5 text-indigo-400" />
          </div>
          <p className="text-3xl font-extrabold text-purple-300 tracking-tight mt-2">{formatINR(totalPurchaseTax)}</p>
          <p className="text-[11px] text-slate-400 mt-1">Across all {purchaseInvoices.length} purchase transactions</p>
        </div>
      </div>

      {/* Rule 36(4) Reconciliation Guidance Box */}
      <div className="p-4 rounded-xl glass-card border border-indigo-500/30 bg-indigo-950/30 flex items-start gap-3">
        <Info className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 space-y-1">
          <p className="font-semibold text-indigo-200">GST Rule 36(4) & GSTR-2B Compliance Tip:</p>
          <p className="text-slate-400 leading-relaxed">
            Ensure your suppliers have uploaded their GSTR-1 returns so that purchase bills reflect in your auto-generated <strong>GSTR-2B statement</strong>. Unverified supplier GSTINs may result in delayed ITC claims.
          </p>
        </div>
      </div>

      {/* Purchase Invoices Table */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        {/* Search & Filter Toolbar */}
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by supplier name, invoice #, or GSTIN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-slate-200 focus:outline-none"
          >
            <option value="all">All ITC Statuses</option>
            <option value="eligible">🟢 Eligible Claimable</option>
            <option value="review_required">🟠 Review Required</option>
            <option value="ineligible">🔴 Ineligible</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3.5">Purchase Bill #</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Supplier Name</th>
                <th className="p-3.5">Supplier GSTIN</th>
                <th className="p-3.5 text-right">Taxable (₹)</th>
                <th className="p-3.5 text-right">GST Amount (₹)</th>
                <th className="p-3.5 text-center">ITC Status</th>
                <th className="p-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400 font-sans text-xs">
                    No purchase invoices matching the criteria.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => {
                  const itcSt = inv.itcStatus || (inv.status === 'critical' ? 'review_required' : 'eligible');

                  return (
                    <tr key={inv.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3.5 font-bold text-slate-100">{inv.invoiceNumber}</td>
                      <td className="p-3.5 text-slate-400 font-sans">{inv.invoiceDate}</td>
                      <td className="p-3.5 font-sans font-medium text-slate-200">{inv.sellerName}</td>
                      <td className="p-3.5 text-slate-400">{inv.sellerGstin || 'Missing GSTIN'}</td>
                      <td className="p-3.5 text-right">{formatINR(inv.taxableAmount)}</td>
                      <td className="p-3.5 text-right text-purple-300 font-bold">{formatINR(inv.totalGst)}</td>
                      <td className="p-3.5 text-center font-sans">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                            itcSt === 'eligible'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : itcSt === 'review_required'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {itcSt === 'eligible' && '🟢 Eligible'}
                          {itcSt === 'review_required' && '🟠 Review Required'}
                          {itcSt === 'ineligible' && '🔴 Ineligible'}
                        </span>
                      </td>
                      <td className="p-3.5 text-center font-sans">
                        {itcSt !== 'eligible' && (
                          <button
                            onClick={() => onFixInvoice(inv)}
                            className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-semibold"
                          >
                            Update Bill
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
