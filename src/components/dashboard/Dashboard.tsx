import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  Percent,
  Receipt,
  AlertTriangle,
  Calendar,
  CheckCircle,
  Plus,
  Scan,
  ShieldCheck,
  Sparkles,
  FileText
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { Invoice, GSTSummaryData, BusinessProfile } from '../../types';
import { formatINR } from '../../services/gstEngine';

interface DashboardProps {
  profile: BusinessProfile;
  summary: GSTSummaryData;
  recentInvoices: Invoice[];
  onNavigate: (view: string) => void;
  onAddInvoice: () => void;
  onScanInvoice: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  profile,
  summary,
  recentInvoices,
  onNavigate,
  onAddInvoice,
  onScanInvoice,
}) => {
  // Monthly Chart Mock Data aligned with current state
  const chartData = [
    { month: 'Apr', Sales: 320000, Purchases: 180000, GstPayable: 15200 },
    { month: 'May', Sales: 410000, Purchases: 210000, GstPayable: 21000 },
    { month: 'Jun', Sales: 380000, Purchases: 190000, GstPayable: 19500 },
    { month: 'Jul', Sales: 460000, Purchases: 230000, GstPayable: 24800 },
    {
      month: 'Aug (Current)',
      Sales: summary.totalTaxableSales,
      Purchases: summary.totalPurchases,
      GstPayable: summary.estimatedGstPayable,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Welcome Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Welcome back, <span className="gradient-text">{profile.ownerName}</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              FY 2026-27 Active
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Managing <strong className="text-slate-200">{profile.businessName}</strong> (GSTIN: {profile.gstin})
          </p>
        </div>

        {/* Quick Actions Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onScanInvoice}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-purple-500/25 transition hover:scale-[1.02]"
          >
            <Scan className="h-4 w-4" />
            <span>AI Scan Invoice</span>
          </button>

          <button
            onClick={onAddInvoice}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition hover:scale-[1.02]"
          >
            <Plus className="h-4 w-4" />
            <span>Add Invoice</span>
          </button>

          <button
            onClick={() => onNavigate('healthCheck')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
          >
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>GST Audit</span>
          </button>
        </div>
      </div>

      {/* 8 Primary Executive Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Sales */}
        <div
          onClick={() => onNavigate('sales')}
          className="glass-card glass-card-hover p-4 rounded-2xl border border-slate-800 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Sales</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <ArrowUpRight className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-white tracking-tight">{formatINR(summary.totalTaxableSales)}</p>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-emerald-400">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>{summary.salesCount} Sales Invoices recorded</span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Purchases */}
        <div
          onClick={() => onNavigate('purchases')}
          className="glass-card glass-card-hover p-4 rounded-2xl border border-slate-800 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Purchases</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <ArrowDownLeft className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-white tracking-tight">{formatINR(summary.totalPurchases)}</p>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-blue-400">
              <TrendingDown className="h-3.5 w-3.5" />
              <span>{summary.purchaseCount} Purchase Invoices</span>
            </div>
          </div>
        </div>

        {/* Card 3: Output GST */}
        <div
          onClick={() => onNavigate('summary')}
          className="glass-card glass-card-hover p-4 rounded-2xl border border-slate-800 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Output GST</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-purple-300 tracking-tight">{formatINR(summary.totalOutputGst)}</p>
            <p className="text-[11px] text-slate-400 mt-1">Total Tax collected on sales</p>
          </div>
        </div>

        {/* Card 4: Input Tax Credit */}
        <div
          onClick={() => onNavigate('itc')}
          className="glass-card glass-card-hover p-4 rounded-2xl border border-slate-800 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Input Tax Credit (ITC)</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Percent className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-indigo-300 tracking-tight">{formatINR(summary.eligibleItc)}</p>
            <p className="text-[11px] text-emerald-400 mt-1">✓ Eligible for tax setoff</p>
          </div>
        </div>

        {/* Card 5: Estimated GST Payable */}
        <div
          onClick={() => onNavigate('summary')}
          className="glass-card glass-card-hover p-4 rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 to-purple-950/30 cursor-pointer col-span-1 sm:col-span-2 lg:col-span-2"
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
                Estimated GST Payable (GSTR-3B)
              </span>
              <p className="text-xs text-slate-400 mt-0.5">Formula: Output GST - Input Tax Credit</p>
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Receipt className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-3xl font-extrabold text-white tracking-tight">
              {formatINR(summary.estimatedGstPayable)}
            </p>
            <span className="text-xs font-semibold text-slate-300 bg-indigo-500/20 px-2.5 py-1 rounded-full border border-indigo-500/30">
              Due Sep 20, 2026
            </span>
          </div>
        </div>

        {/* Card 6: Invoice Errors */}
        <div
          onClick={() => onNavigate('healthCheck')}
          className={`glass-card glass-card-hover p-4 rounded-2xl border cursor-pointer ${
            summary.errorCount > 0
              ? 'border-rose-500/40 bg-rose-950/20'
              : 'border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Invoice Health Errors</span>
            <div className={`p-2 rounded-xl ${summary.errorCount > 0 ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className={`text-2xl font-bold tracking-tight ${summary.errorCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {summary.errorCount} Issues
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              {summary.errorCount > 0 ? '🔴 Requires health check review' : '🟢 All invoices clean & valid'}
            </p>
          </div>
        </div>

        {/* Card 7: Next Filing Deadline */}
        <div
          onClick={() => onNavigate('calendar')}
          className="glass-card glass-card-hover p-4 rounded-2xl border border-slate-800 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Filing Period</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Calendar className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-lg font-bold text-amber-300">GSTR-1 & 3B</p>
            <p className="text-[11px] text-slate-400 mt-1">Deadline: 11th & 20th Sep 2026</p>
          </div>
        </div>
      </div>

      {/* Main Chart Section: Monthly Sales vs Purchases vs Net GST */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Column (2/3 Width) */}
        <div className="lg:col-span-2 glass-card p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Monthly GST Trend & Cash Flow</h3>
              <p className="text-xs text-slate-400">Taxable Sales vs Purchases vs Estimated Tax Payable (₹)</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block"></span> Sales
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400 inline-block"></span> Purchases
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#475569',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(value: any) => [formatINR(value), '']}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Sales" fill="#6366f1" radius={[6, 6, 0, 0]} name="Taxable Sales" />
                <Bar dataKey="Purchases" fill="#c084fc" radius={[6, 6, 0, 0]} name="Taxable Purchases" />
                <Bar dataKey="GstPayable" fill="#10b981" radius={[6, 6, 0, 0]} name="Net GST Payable" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI GST Assistant & Health Check Widget Column (1/3 Width) */}
        <div className="space-y-4">
          {/* Sahayak Teaser Card */}
          <div className="glass-card p-5 rounded-2xl border border-purple-500/30 bg-gradient-to-b from-purple-950/30 via-slate-900 to-slate-900">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300">
                <Sparkles className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">GST Sahayak AI Assistant</h4>
                <p className="text-[11px] text-purple-300">Instant answers from your live invoices</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 mt-3 leading-relaxed">
              "How much input tax credit can I claim this month?" or "Why is my GST payable higher than expected?"
            </p>

            <button
              onClick={() => onNavigate('assistant')}
              className="mt-4 w-full py-2 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md transition"
            >
              Ask GST Sahayak Now →
            </button>
          </div>

          {/* Quick Filing Readiness Banner */}
          <div className="glass-card p-5 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-xs text-slate-300">Filing Readiness Checklist</h4>
              <span className="text-xs font-bold text-emerald-400">85% Complete</span>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                <span>GSTIN & Business Master verified</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                <span>Sales & Purchase tax math validated</span>
              </div>
              <div className="flex items-center gap-2 text-amber-300">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                <span>Review {summary.errorCount} flagged invoice errors</span>
              </div>
            </div>

            <button
              onClick={() => onNavigate('readiness')}
              className="mt-3.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
            >
              <span>View Full Readiness Score</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Invoices Table */}
      <div className="glass-card p-5 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white">Recent Transactions</h3>
            <p className="text-xs text-slate-400">Latest recorded sales and purchase invoices</p>
          </div>
          <button
            onClick={() => onNavigate('invoices')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
          >
            View All ({recentInvoices.length}) →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3 rounded-l-lg">Invoice No</th>
                <th className="p-3">Date</th>
                <th className="p-3">Type</th>
                <th className="p-3">Party Name</th>
                <th className="p-3 text-right">Taxable (₹)</th>
                <th className="p-3 text-right">GST Tax (₹)</th>
                <th className="p-3 text-right">Total (₹)</th>
                <th className="p-3 text-center rounded-r-lg">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recentInvoices.slice(0, 6).map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3 font-mono font-medium text-slate-100">{inv.invoiceNumber}</td>
                  <td className="p-3 text-slate-400">{inv.invoiceDate}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        inv.type === 'sales'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}
                    >
                      {inv.type}
                    </span>
                  </td>
                  <td className="p-3 font-medium text-slate-200">
                    {inv.type === 'sales' ? inv.buyerName : inv.sellerName}
                  </td>
                  <td className="p-3 text-right font-mono">{formatINR(inv.taxableAmount)}</td>
                  <td className="p-3 text-right font-mono text-purple-300">{formatINR(inv.totalGst)}</td>
                  <td className="p-3 text-right font-mono font-bold text-white">{formatINR(inv.totalAmount)}</td>
                  <td className="p-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                        inv.status === 'critical'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : inv.status === 'warning'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {inv.status === 'critical' && '🔴 Error'}
                      {inv.status === 'warning' && '🟠 Review'}
                      {inv.status === 'valid' && '🟢 Valid'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
