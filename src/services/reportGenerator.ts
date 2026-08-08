import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Invoice, BusinessProfile, GSTSummaryData } from '../types';
import { formatINR } from './gstEngine';

/**
 * Generate CSV file download
 */
export function downloadCSV(filename: string, rows: string[][]) {
  const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Download Sales / Purchase / Audit Reports as CSV
 */
export function exportInvoicesCSV(invoices: Invoice[], reportTitle: string) {
  const headers = [
    'Invoice No',
    'Date',
    'Type',
    'Seller Name',
    'Seller GSTIN',
    'Buyer Name',
    'Buyer GSTIN',
    'Taxable Amount (₹)',
    'GST Rate (%)',
    'CGST (₹)',
    'SGST (₹)',
    'IGST (₹)',
    'Total Tax (₹)',
    'Total Amount (₹)',
    'Compliance Status',
    'Payment Status',
  ];

  const dataRows = invoices.map((inv) => [
    inv.invoiceNumber,
    inv.invoiceDate,
    inv.type.toUpperCase(),
    inv.sellerName,
    inv.sellerGstin,
    inv.buyerName,
    inv.buyerGstin,
    inv.taxableAmount.toString(),
    `${inv.gstRate}%`,
    inv.cgst.toString(),
    inv.sgst.toString(),
    inv.igst.toString(),
    inv.totalGst.toString(),
    inv.totalAmount.toString(),
    inv.status.toUpperCase(),
    inv.paymentStatus.toUpperCase(),
  ]);

  downloadCSV(`${reportTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`, [headers, ...dataRows]);
}

/**
 * Generate PDF Report for GST Filing Summary / Invoice Audit
 */
export function generateFilingPDFReport(
  profile: BusinessProfile,
  summary: GSTSummaryData,
  invoices: Invoice[]
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('GSTEase - GST Filing Summary Report', 14, 22);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, pageWidth - 14, 22, { align: 'right' });
  doc.text(`Period: ${summary.period}`, pageWidth - 14, 28, { align: 'right' });

  // Business Metadata Card
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Business Details', 14, 50);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Business Name: ${profile.businessName}`, 14, 58);
  doc.text(`GSTIN: ${profile.gstin}`, 14, 64);
  doc.text(`Owner: ${profile.ownerName}`, 14, 70);
  doc.text(`State: ${profile.state}`, 120, 58);
  doc.text(`Email: ${profile.email}`, 120, 64);

  doc.setLineWidth(0.5);
  doc.setDrawColor(226, 232, 240);
  doc.line(14, 76, pageWidth - 14, 76);

  // GST Liability & ITC Table
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('GSTR-3B Tax Computation Summary', 14, 86);

  autoTable(doc, {
    startY: 90,
    head: [['Particulars', 'Taxable Amount (₹)', 'CGST (₹)', 'SGST (₹)', 'IGST (₹)', 'Total Tax (₹)']],
    body: [
      [
        'Outward Taxable Supplies (Sales)',
        formatINR(summary.totalTaxableSales, false),
        formatINR(summary.outputCgst, false),
        formatINR(summary.outputSgst, false),
        formatINR(summary.outputIgst, false),
        formatINR(summary.totalOutputGst, false),
      ],
      [
        'Eligible Input Tax Credit (ITC)',
        formatINR(summary.totalPurchases, false),
        '-',
        '-',
        '-',
        formatINR(summary.eligibleItc, false),
      ],
      [
        'Net Estimated GST Payable',
        '-',
        '-',
        '-',
        '-',
        formatINR(summary.estimatedGstPayable, false),
      ],
    ],
    headStyles: { fillColor: [99, 102, 241], textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    theme: 'grid',
  });

  // Recent Invoices Breakdown
  const finalY = (doc as any).lastAutoTable.finalY || 150;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Recorded Invoices Schedule', 14, finalY + 14);

  const invoiceRows = invoices.map((inv) => [
    inv.invoiceNumber,
    inv.invoiceDate,
    inv.type.toUpperCase(),
    inv.type === 'sales' ? inv.buyerName : inv.sellerName,
    formatINR(inv.taxableAmount, false),
    formatINR(inv.totalGst, false),
    formatINR(inv.totalAmount, false),
    inv.status.toUpperCase(),
  ]);

  autoTable(doc, {
    startY: finalY + 18,
    head: [['Inv No', 'Date', 'Type', 'Party Name', 'Taxable (₹)', 'Tax (₹)', 'Total (₹)', 'Status']],
    body: invoiceRows,
    headStyles: { fillColor: [51, 65, 85], textColor: [255, 255, 255] },
    styles: { fontSize: 8 },
    theme: 'striped',
  });

  // Disclaimer Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(
      'Disclaimer: This report is generated by GSTEase for informational & filing preparation purposes. Verify calculations prior to submitting official returns on the GSTN Portal.',
      14,
      doc.internal.pageSize.height - 10
    );
  }

  doc.save(`GSTEase_Filing_Report_${profile.businessName.replace(/\s+/g, '_')}_${summary.period}.pdf`);
}
