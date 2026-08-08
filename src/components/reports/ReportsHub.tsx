import React from 'react';
import {
  FileBarChart,
  Download,
  FileSpreadsheet,
  FileText,
  Eye,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { Invoice, GSTSummaryData, BusinessProfile } from '../../types';
import { exportInvoicesCSV, generateFilingPDFReport } from '../../services/reportGenerator';
import { formatINR } from '../../services/gstEngine';

interface ReportsHubProps {
  profile: BusinessProfile;
  summary: GSTSummaryData;
  invoices: Invoice[];
}

export const ReportsHub: React.FC<ReportsHubProps> = ({
  profile,
  summary,
  invoices,
}) => {
  const reportsList = [
    {
      id: 'sales_rep',
      title: 'Sales Outward Register (GSTR-1 Data)',
      description: 'Comprehensive report of all sales invoices, buyer GSTINs, HSN codes, and output taxes.',
      icon: FileSpreadsheet,
      badge: `${summary.salesCount} Invoices`,
      onExportCSV: () => exportInvoicesCSV(invoices.filter((i) => i.type === 'sales'), 'Sales_Outward_Register'),
    },
    {
      id: 'pur_rep',
      title: 'Purchase Inward Register (ITC Ledger)',
      description: 'Detailed statement of all inward purchase bills, supplier GSTINs, and claimable ITC.',
      icon: FileSpreadsheet,
      badge: `${summary.purchaseCount} Bills`,
      onExportCSV: () => exportInvoicesCSV(invoices.filter((i) => i.type === 'purchase'), 'Purchase_Inward_Register'),
    },
    {
      id: 'gst3b_rep',
      title: 'GST Liability & Computation Summary (GSTR-3B)',
      description: 'Summary statement showing Output Tax minus Eligible Input Tax Credit with net payable math.',
      icon: FileText,
      badge: 'Official PDF',
      onExportPDF: () => generateFilingPDFReport(profile, summary, invoices),
    },
    {
      id: 'audit_rep',
      title: 'Invoice Health & Error Audit Log',
      description: 'Audit log listing all flagged errors, duplicate invoice numbers, and GSTIN format issues.',
      icon: AlertTriangle,
      badge: `${summary.errorCount} Issues Flagged`,
      onExportCSV: () => exportInvoicesCSV(invoices.filter((i) => i.status !== 'valid'), 'Invoice_Error_Audit_Report'),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 rounded-2xl border border-slate-800">
        <h2 className="text-xl font-bold text-white tracking-tight">Reports & Filing Downloads Hub</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Generate, preview, and download filing-ready reports in PDF and CSV/Excel formats.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportsList.map((rep) => {
          const Icon = rep.icon;
          return (
            <div
              key={rep.id}
              className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3 flex flex-col justify-between hover:border-slate-700 transition"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                    {rep.badge}
                  </span>
                </div>

                <h3 className="font-bold text-base text-white mt-3">{rep.title}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{rep.description}</p>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
                {rep.onExportPDF && (
                  <button
                    onClick={rep.onExportPDF}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download PDF</span>
                  </button>
                )}
                {rep.onExportCSV && (
                  <button
                    onClick={rep.onExportCSV}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    <span>Export CSV</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
