import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Printer,
  X,
  FileSpreadsheet,
  Scan
} from 'lucide-react';
import { Invoice, InvoiceType, ErrorSeverity } from '../../types';
import { formatINR } from '../../services/gstEngine';
import { exportInvoicesCSV } from '../../services/reportGenerator';

interface InvoiceListProps {
  invoices: Invoice[];
  filterType?: InvoiceType | 'all';
  onAddInvoice: () => void;
  onScanInvoice: () => void;
  onEditInvoice: (invoice: Invoice) => void;
  onDeleteInvoice: (id: string) => void;
}

export const InvoiceList: React.FC<InvoiceListProps> = ({
  invoices,
  filterType = 'all',
  onAddInvoice,
  onScanInvoice,
  onEditInvoice,
  onDeleteInvoice,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<InvoiceType | 'all'>(filterType);
  const [selectedStatus, setSelectedStatus] = useState<ErrorSeverity | 'all'>('all');
  const [selectedInvoiceForView, setSelectedInvoiceForView] = useState<Invoice | null>(null);

  // Filtered List Computation
  const filteredInvoices = invoices.filter((inv) => {
    // Type Filter
    if (selectedType !== 'all' && inv.type !== selectedType) return false;

    // Status Filter
    if (selectedStatus !== 'all' && inv.status !== selectedStatus) return false;

    // Search query
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      const matchNum = inv.invoiceNumber.toLowerCase().includes(q);
      const matchParty =
        inv.sellerName.toLowerCase().includes(q) || inv.buyerName.toLowerCase().includes(q);
      const matchGstin =
        inv.sellerGstin.toLowerCase().includes(q) || inv.buyerGstin.toLowerCase().includes(q);
      const matchHsn = inv.items.some((i) => i.hsnSac.toLowerCase().includes(q));
      if (!matchNum && !matchParty && !matchGstin && !matchHsn) return false;
    }

    return true;
  });

  // Calculate Subtotals
  const totalTaxable = filteredInvoices.reduce((s, i) => s + i.taxableAmount, 0);
  const totalGst = filteredInvoices.reduce((s, i) => s + i.totalGst, 0);
  const grandTotal = filteredInvoices.reduce((s, i) => s + i.totalAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-5 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Invoice Management</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage sales & purchase invoices, verify GST calculations, and audit compliance.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => exportInvoicesCSV(filteredInvoices, 'GST_Invoices_Register')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onScanInvoice}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition"
          >
            <Scan className="h-4 w-4" />
            <span>AI OCR Scan</span>
          </button>

          <button
            onClick={onAddInvoice}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition"
          >
            <Plus className="h-4 w-4" />
            <span>Add Invoice</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Field */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by invoice number, party name, GSTIN, or HSN code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl bg-slate-900/80 border border-slate-700/80 pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Type & Status Filters */}
        <div className="flex items-center gap-2">
          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as any)}
            className="rounded-xl bg-slate-900/80 border border-slate-700/80 px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
          >
            <option value="all">All Types (Sales & Purchase)</option>
            <option value="sales">Sales (Outward)</option>
            <option value="purchase">Purchases (Inward)</option>
          </select>

          {/* Health Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="rounded-xl bg-slate-900/80 border border-slate-700/80 px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
          >
            <option value="all">All Audit Statuses</option>
            <option value="valid">🟢 Valid Only</option>
            <option value="warning">🟠 Review Required</option>
            <option value="critical">🔴 Critical Errors</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-700/60">
              <tr>
                <th className="p-3.5">Invoice #</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Type</th>
                <th className="p-3.5">Party / Business</th>
                <th className="p-3.5">GSTIN</th>
                <th className="p-3.5 text-right">Taxable (₹)</th>
                <th className="p-3.5 text-right">GST Rate</th>
                <th className="p-3.5 text-right">GST Tax (₹)</th>
                <th className="p-3.5 text-right">Total Amount (₹)</th>
                <th className="p-3.5 text-center">Health Status</th>
                <th className="p-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={11} className="text-center py-10 text-slate-400 text-xs">
                    No matching invoices found. Click "Add Invoice" or "AI OCR Scan" to record one.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-800/50 transition">
                    <td className="p-3.5 font-mono font-semibold text-slate-100">{inv.invoiceNumber}</td>
                    <td className="p-3.5 text-slate-400">{inv.invoiceDate}</td>
                    <td className="p-3.5">
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
                    <td className="p-3.5 font-medium text-slate-200">
                      {inv.type === 'sales' ? inv.buyerName : inv.sellerName}
                    </td>
                    <td className="p-3.5 font-mono text-slate-400 text-[11px]">
                      {inv.type === 'sales' ? inv.buyerGstin || 'B2C (Unregistered)' : inv.sellerGstin || 'Missing'}
                    </td>
                    <td className="p-3.5 text-right font-mono">{formatINR(inv.taxableAmount)}</td>
                    <td className="p-3.5 text-right font-mono text-slate-400">{inv.gstRate}%</td>
                    <td className="p-3.5 text-right font-mono text-purple-300">{formatINR(inv.totalGst)}</td>
                    <td className="p-3.5 text-right font-mono font-bold text-white">
                      {formatINR(inv.totalAmount)}
                    </td>
                    <td className="p-3.5 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                          inv.status === 'critical'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : inv.status === 'warning'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                        title={inv.errors.map((e) => e.message).join(' | ')}
                      >
                        {inv.status === 'critical' && '🔴 Error'}
                        {inv.status === 'warning' && '🟠 Review'}
                        {inv.status === 'valid' && '🟢 Valid'}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setSelectedInvoiceForView(inv)}
                          className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition"
                          title="View Official Tax Invoice"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onEditInvoice(inv)}
                          className="p-1.5 rounded-lg text-indigo-400 hover:bg-slate-700 transition"
                          title="Edit Invoice"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onDeleteInvoice(inv.id)}
                          className="p-1.5 rounded-lg text-rose-400 hover:bg-slate-700 transition"
                          title="Delete Invoice"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Subtotals Summary */}
        <div className="bg-slate-800/80 px-4 py-3 border-t border-slate-700/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-300 font-mono gap-2">
          <span>
            Total Displayed Invoices: <strong>{filteredInvoices.length}</strong>
          </span>
          <div className="flex items-center gap-4">
            <span>Taxable: <strong>{formatINR(totalTaxable)}</strong></span>
            <span>Total GST: <strong className="text-purple-300">{formatINR(totalGst)}</strong></span>
            <span>Grand Total: <strong className="text-white">{formatINR(grandTotal)}</strong></span>
          </div>
        </div>
      </div>

      {/* Official Tax Invoice Preview Modal */}
      {selectedInvoiceForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card w-full max-w-3xl rounded-2xl border border-slate-700 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-indigo-400" />
                <h3 className="font-bold text-lg text-white">
                  TAX INVOICE — {selectedInvoiceForView.invoiceNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedInvoiceForView(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-800 text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Printable Invoice Container */}
            <div className="my-6 bg-slate-900 p-6 rounded-xl border border-slate-800 text-xs space-y-6">
              {/* Header Box */}
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-base font-bold text-white">{selectedInvoiceForView.sellerName}</h2>
                  <p className="text-slate-400">GSTIN: {selectedInvoiceForView.sellerGstin}</p>
                  <p className="text-slate-400">State: {selectedInvoiceForView.sellerState}</p>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-300 font-bold uppercase text-[11px]">
                    {selectedInvoiceForView.type === 'sales' ? 'TAX INVOICE (SALES)' : 'PURCHASE BILL'}
                  </span>
                  <p className="text-slate-300 font-mono mt-2">Inv #: {selectedInvoiceForView.invoiceNumber}</p>
                  <p className="text-slate-400">Date: {selectedInvoiceForView.invoiceDate}</p>
                </div>
              </div>

              {/* Billed To */}
              <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/50">
                <span className="text-[10px] uppercase font-bold text-slate-400">Billed To (Customer / Buyer)</span>
                <p className="text-sm font-semibold text-slate-200 mt-0.5">{selectedInvoiceForView.buyerName}</p>
                <p className="text-slate-400">GSTIN: {selectedInvoiceForView.buyerGstin || 'Unregistered B2C'}</p>
                <p className="text-slate-400">Place of Supply: {selectedInvoiceForView.buyerState}</p>
              </div>

              {/* Items Table */}
              <table className="w-full text-left text-xs border border-slate-800">
                <thead className="bg-slate-800 text-slate-300 uppercase text-[10px]">
                  <tr>
                    <th className="p-2 border-b border-slate-800">#</th>
                    <th className="p-2 border-b border-slate-800">Description</th>
                    <th className="p-2 border-b border-slate-800">HSN/SAC</th>
                    <th className="p-2 text-right border-b border-slate-800">Qty</th>
                    <th className="p-2 text-right border-b border-slate-800">Rate (₹)</th>
                    <th className="p-2 text-right border-b border-slate-800">Taxable (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {selectedInvoiceForView.items.map((item, idx) => (
                    <tr key={item.id}>
                      <td className="p-2 font-mono text-slate-400">{idx + 1}</td>
                      <td className="p-2 text-slate-200 font-medium">{item.description}</td>
                      <td className="p-2 font-mono text-slate-400">{item.hsnSac || 'N/A'}</td>
                      <td className="p-2 text-right font-mono">{item.quantity}</td>
                      <td className="p-2 text-right font-mono">{formatINR(item.unitPrice)}</td>
                      <td className="p-2 text-right font-mono text-slate-100">{formatINR(item.taxableAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Tax Calculations Breakdown */}
              <div className="flex justify-end">
                <div className="w-64 space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>Taxable Amount:</span>
                    <span>{formatINR(selectedInvoiceForView.taxableAmount)}</span>
                  </div>
                  {selectedInvoiceForView.cgst > 0 && (
                    <div className="flex justify-between text-slate-400">
                      <span>CGST ({selectedInvoiceForView.gstRate / 2}%):</span>
                      <span>{formatINR(selectedInvoiceForView.cgst)}</span>
                    </div>
                  )}
                  {selectedInvoiceForView.sgst > 0 && (
                    <div className="flex justify-between text-slate-400">
                      <span>SGST ({selectedInvoiceForView.gstRate / 2}%):</span>
                      <span>{formatINR(selectedInvoiceForView.sgst)}</span>
                    </div>
                  )}
                  {selectedInvoiceForView.igst > 0 && (
                    <div className="flex justify-between text-slate-400">
                      <span>IGST ({selectedInvoiceForView.gstRate}%):</span>
                      <span>{formatINR(selectedInvoiceForView.igst)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-bold text-white border-t border-slate-700 pt-2">
                    <span>Total Amount:</span>
                    <span>{formatINR(selectedInvoiceForView.totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Compliance Errors Notice if any */}
              {selectedInvoiceForView.errors.length > 0 && (
                <div className="p-3 bg-rose-950/30 border border-rose-500/40 rounded-lg text-rose-300">
                  <p className="font-bold flex items-center gap-1 text-xs">
                    <AlertTriangle className="h-4 w-4 text-rose-400" />
                    GST Audit Issues Detected on this Invoice:
                  </p>
                  <ul className="list-disc list-inside mt-1 space-y-0.5 text-[11px] text-rose-200">
                    {selectedInvoiceForView.errors.map((e) => (
                      <li key={e.id}>{e.message} ({e.fixSuggestion})</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition"
              >
                <Printer className="h-4 w-4" />
                <span>Print Invoice</span>
              </button>
              <button
                onClick={() => setSelectedInvoiceForView(null)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
