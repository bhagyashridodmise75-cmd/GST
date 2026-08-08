import { Invoice, BusinessProfile, FilingPeriod } from '../types';
import { formatINR } from './gstEngine';

export interface SahayakResponse {
  replyText: string;
  suggestedFollowups?: string[];
  dataRef?: {
    totalSales?: number;
    totalPurchases?: number;
    outputGst?: number;
    inputTaxCredit?: number;
    estimatedPayable?: number;
    errorInvoicesCount?: number;
  };
}

export function processSahayakQuery(
  userQuery: string,
  invoices: Invoice[],
  profile: BusinessProfile,
  filingPeriods: FilingPeriod[]
): SahayakResponse {
  const query = userQuery.toLowerCase().trim();

  // Calculate live database metrics
  const salesInvoices = invoices.filter((i) => i.type === 'sales');
  const purchaseInvoices = invoices.filter((i) => i.type === 'purchase');

  const totalSales = salesInvoices.reduce((sum, i) => sum + i.taxableAmount, 0);
  const totalPurchases = purchaseInvoices.reduce((sum, i) => sum + i.taxableAmount, 0);

  const outputGst = salesInvoices.reduce((sum, i) => sum + i.totalGst, 0);
  const totalPurchaseGst = purchaseInvoices.reduce((sum, i) => sum + i.totalGst, 0);

  // Eligible ITC (only eligible or non-critical purchase invoices)
  const eligibleItc = purchaseInvoices
    .filter((i) => i.itcStatus === 'eligible' || (!i.itcStatus && i.status !== 'critical'))
    .reduce((sum, i) => sum + i.totalGst, 0);

  const estimatedPayable = Math.max(0, outputGst - eligibleItc);

  const errorInvoices = invoices.filter((i) => i.status === 'critical' || i.status === 'warning');
  const criticalInvoices = invoices.filter((i) => i.status === 'critical');
  const upcomingPeriod = filingPeriods.find((p) => p.status === 'pending');

  const DISCLAIMER = "\n\n⚠️ *Note: This calculation is an estimate based on your recorded invoices in GSTEase. Please verify with a certified Chartered Accountant (CA) or official GST portal before filing returns.*";

  // Intent 1: "How much GST do I need to pay?" / "GST payable" / "Tax liability"
  if (
    query.includes('how much gst') ||
    query.includes('need to pay') ||
    query.includes('tax liability') ||
    query.includes('payable')
  ) {
    return {
      replyText: `Based on your live transactions for **${profile.businessName}**:\n\n` +
        `• **Total Output GST (on Sales):** ${formatINR(outputGst)}\n` +
        `• **Eligible Input Tax Credit (ITC):** ${formatINR(eligibleItc)}\n` +
        `------------------------------------------\n` +
        `💰 **Estimated GST Payable:** ${formatINR(estimatedPayable)}\n\n` +
        `Formula: \`Output GST (${formatINR(outputGst)}) - ITC (${formatINR(eligibleItc)}) = ${formatINR(estimatedPayable)}\`\n` +
        `Your next return **GSTR-3B** due date is **${upcomingPeriod ? upcomingPeriod.dueDate : '20th September 2026'}**.` +
        DISCLAIMER,
      suggestedFollowups: [
        'Why is my GST payable high?',
        'How much input tax credit do I have?',
        'Show invoices with errors.',
      ],
      dataRef: {
        totalSales,
        totalPurchases,
        outputGst,
        inputTaxCredit: eligibleItc,
        estimatedPayable,
      },
    };
  }

  // Intent 2: "Why is my GST payable high?" / "Reduce tax" / "High tax"
  if (
    query.includes('why is my gst payable high') ||
    query.includes('high tax') ||
    query.includes('reduce tax') ||
    query.includes('why so high')
  ) {
    const unverifiedPurchases = purchaseInvoices.filter((i) => i.itcStatus === 'review_required' || !i.sellerGstin);
    const unclaimedItc = unverifiedPurchases.reduce((sum, i) => sum + i.totalGst, 0);

    let explanation = `Your GST payable is **${formatINR(estimatedPayable)}** because your Output GST (${formatINR(outputGst)}) significantly exceeds your claimed Input Tax Credit (${formatINR(eligibleItc)}).\n\n`;

    if (unclaimedItc > 0) {
      explanation += `💡 **Primary Reason Detected:** You have **${unverifiedPurchases.length} purchase invoice(s)** with unverified supplier GSTINs totaling **${formatINR(unclaimedItc)} in un-claimed ITC**.\n` +
        `By updating your supplier GSTINs in the ITC section, you can claim this credit and reduce your payable GST down to **${formatINR(Math.max(0, estimatedPayable - unclaimedItc))}**!`;
    } else {
      explanation += `💡 **Key Factors:**\n` +
        `1. Your Sales Taxable Value (${formatINR(totalSales)}) is higher than Purchases (${formatINR(totalPurchases)}).\n` +
        `2. Ensure all purchase bills (rent, cloud services, software, raw materials, office supplies) are uploaded to maximize ITC deductions.`;
    }

    return {
      replyText: explanation + DISCLAIMER,
      suggestedFollowups: [
        'How much input tax credit do I have?',
        'Which invoices need attention?',
        'Show my sales for this month.',
      ],
    };
  }

  // Intent 3: "Show invoices with errors" / "Invoices needing attention" / "Health check errors"
  if (
    query.includes('invoices with errors') ||
    query.includes('need attention') ||
    query.includes('health check') ||
    query.includes('error') ||
    query.includes('critical')
  ) {
    if (errorInvoices.length === 0) {
      return {
        replyText: `🎉 Great news! All **${invoices.length} recorded invoices** passed the GST Health Check with zero errors.\n\n` +
          `Your filing readiness score is currently at a high grade. You are ready to generate your GSTR summary report.` +
          DISCLAIMER,
        suggestedFollowups: [
          'How much GST do I need to pay?',
          'How much input tax credit do I have?',
        ],
      };
    }

    let errorListText = `⚠️ **${errorInvoices.length} Invoice(s) require attention** before filing:\n\n`;
    errorInvoices.forEach((inv, index) => {
      const topErr = inv.errors[0]?.message || 'Compliance warning';
      const severityIcon = inv.status === 'critical' ? '🔴 Critical' : '🟠 Warning';
      errorListText += `${index + 1}. **${inv.invoiceNumber}** (${inv.buyerName || inv.sellerName}) - ${severityIcon}\n   └ *Issue:* ${topErr}\n`;
    });

    errorListText += `\nGo to the **GST Health Check** tab to use 1-click Quick Fixes for these errors!`;

    return {
      replyText: errorListText + DISCLAIMER,
      suggestedFollowups: [
        'How much GST do I need to pay?',
        'Show my sales for this month.',
      ],
      dataRef: {
        errorInvoicesCount: errorInvoices.length,
      },
    };
  }

  // Intent 4: "How much input tax credit do I have?" / "ITC details"
  if (
    query.includes('input tax credit') ||
    query.includes('itc') ||
    query.includes('purchase tax')
  ) {
    return {
      replyText: `📊 **Input Tax Credit (ITC) Summary for ${profile.businessName}**:\n\n` +
        `• **Total Purchase Invoices:** ${purchaseInvoices.length}\n` +
        `• **Total Purchase Taxable Value:** ${formatINR(totalPurchases)}\n` +
        `• **Eligible ITC Claimable:** ${formatINR(eligibleItc)}\n` +
        `• **Review Required ITC:** ${formatINR(totalPurchaseGst - eligibleItc)}\n\n` +
        `Remember: Under GST Rule 36(4), ITC can only be claimed if your supplier has uploaded the invoice in their GSTR-1 and it reflects in your GSTR-2B.` +
        DISCLAIMER,
      suggestedFollowups: [
        'How much GST do I need to pay?',
        'Which invoices need attention?',
      ],
    };
  }

  // Intent 5: "Show my sales for this month" / "Sales summary"
  if (
    query.includes('sales') ||
    query.includes('outward supplies') ||
    query.includes('revenue')
  ) {
    return {
      replyText: `📈 **Sales Overview (August 2026)**:\n\n` +
        `• **Total Sales Invoices:** ${salesInvoices.length}\n` +
        `• **Total Taxable Value:** ${formatINR(totalSales)}\n` +
        `• **Total Output GST Collected:** ${formatINR(outputGst)}\n` +
        `  - CGST: ${formatINR(salesInvoices.reduce((s, i) => s + i.cgst, 0))}\n` +
        `  - SGST: ${formatINR(salesInvoices.reduce((s, i) => s + i.sgst, 0))}\n` +
        `  - IGST: ${formatINR(salesInvoices.reduce((s, i) => s + i.igst, 0))}\n\n` +
        `• **Gross Total Revenue (with Tax):** ${formatINR(totalSales + outputGst)}` +
        DISCLAIMER,
      suggestedFollowups: [
        'How much GST do I need to pay?',
        'How much input tax credit do I have?',
      ],
    };
  }

  // Fallback General Tax Guidance
  return {
    replyText: `Hello! I am **GST Sahayak**, your AI tax assistant for **${profile.businessName}**.\n\n` +
      `I can help you analyze your GST calculations, track Input Tax Credit, inspect invoice errors, and check filing deadlines using your actual recorded transactions.\n\n` +
      `Here is your quick financial status:\n` +
      `• Total Sales: ${formatINR(totalSales)}\n` +
      `• Output GST: ${formatINR(outputGst)}\n` +
      `• Eligible ITC: ${formatINR(eligibleItc)}\n` +
      `• **Estimated GST Payable: ${formatINR(estimatedPayable)}**\n\n` +
      `Feel free to click any of the suggested questions below!` +
      DISCLAIMER,
    suggestedFollowups: [
      'How much GST do I need to pay?',
      'Show invoices with errors.',
      'Why is my GST payable high?',
      'How much input tax credit do I have?',
      'Show my sales for this month.',
    ],
  };
}
