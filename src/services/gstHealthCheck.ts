import { Invoice, GSTHealthError, ErrorSeverity } from '../types';
import { validateGSTINFormat, determineTaxType } from './gstEngine';

export function runGSTHealthCheck(invoice: Invoice, allInvoices: Invoice[] = []): GSTHealthError[] {
  const errors: GSTHealthError[] = [];

  // Helper to push error
  const addError = (
    code: string,
    message: string,
    field: string,
    severity: ErrorSeverity,
    fixSuggestion: string
  ) => {
    errors.push({
      id: `${invoice.id}-${code}`,
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber || 'UNNAMED',
      code,
      message,
      field,
      severity,
      fixSuggestion,
    });
  };

  // 1. Missing Invoice Number or Date
  if (!invoice.invoiceNumber || invoice.invoiceNumber.trim() === '') {
    addError(
      'ERR_NO_INV_NUM',
      'Invoice number is missing',
      'invoiceNumber',
      'critical',
      'Provide a valid unique invoice reference number.'
    );
  }

  if (!invoice.invoiceDate) {
    addError(
      'ERR_NO_DATE',
      'Invoice date is missing',
      'invoiceDate',
      'critical',
      'Select a valid transaction date for tax period alignment.'
    );
  }

  // 2. Duplicate Invoice Number Check
  if (allInvoices.length > 0 && invoice.invoiceNumber) {
    const isDuplicateNum = allInvoices.some(
      (inv) =>
        inv.id !== invoice.id &&
        inv.type === invoice.type &&
        inv.invoiceNumber.trim().toLowerCase() === invoice.invoiceNumber.trim().toLowerCase()
    );
    if (isDuplicateNum) {
      addError(
        'ERR_DUP_INV_NUM',
        `Duplicate invoice number "${invoice.invoiceNumber}" detected`,
        'invoiceNumber',
        'critical',
        'Invoice numbers must be unique within a tax year.'
      );
    }

    // 3. Duplicate Invoice Content Check (Same date, seller, buyer, and amount)
    const isExactDuplicate = allInvoices.some(
      (inv) =>
        inv.id !== invoice.id &&
        inv.type === invoice.type &&
        inv.invoiceDate === invoice.invoiceDate &&
        inv.totalAmount === invoice.totalAmount &&
        (inv.sellerGstin === invoice.sellerGstin || inv.buyerName === invoice.buyerName)
    );
    if (isExactDuplicate) {
      addError(
        'ERR_DUP_CONTENT',
        'Potential duplicate transaction detected (same party, date & total amount)',
        'totalAmount',
        'warning',
        'Verify if this transaction was submitted twice.'
      );
    }
  }

  // 4. Missing / Invalid Seller & Buyer Details
  if (!invoice.sellerName || invoice.sellerName.trim() === '') {
    addError(
      'ERR_NO_SELLER',
      'Seller business name is missing',
      'sellerName',
      'critical',
      'Provide seller business details.'
    );
  }

  if (!invoice.buyerName || invoice.buyerName.trim() === '') {
    addError(
      'ERR_NO_BUYER',
      'Buyer name is missing',
      'buyerName',
      'critical',
      'Provide buyer name or business details.'
    );
  }

  // 5. Seller & Buyer GSTIN checks
  if (invoice.type === 'purchase') {
    if (!invoice.sellerGstin || invoice.sellerGstin.trim() === '') {
      addError(
        'ERR_NO_SELLER_GSTIN',
        'Supplier GSTIN is missing',
        'sellerGstin',
        'warning',
        'Supplier GSTIN is mandatory to claim Input Tax Credit (ITC).'
      );
    } else if (!validateGSTINFormat(invoice.sellerGstin)) {
      addError(
        'ERR_INVALID_SELLER_GSTIN',
        `Invalid Supplier GSTIN format "${invoice.sellerGstin}"`,
        'sellerGstin',
        'critical',
        'GSTIN must be 15 characters (e.g., 27AAAAA0000A1Z5).'
      );
    }
  }

  if (invoice.type === 'sales' && invoice.buyerGstin) {
    if (!validateGSTINFormat(invoice.buyerGstin)) {
      addError(
        'ERR_INVALID_BUYER_GSTIN',
        `Invalid Buyer GSTIN format "${invoice.buyerGstin}"`,
        'buyerGstin',
        'warning',
        'Verify customer GSTIN for B2B tax invoice credit pass-through.'
      );
    }
  }

  // 6. Negative Amount Check
  if (invoice.taxableAmount < 0 || invoice.totalAmount < 0) {
    addError(
      'ERR_NEG_AMOUNT',
      'Invoice amount cannot be negative',
      'taxableAmount',
      'critical',
      'For returns or credit adjustments, use Credit Note instead.'
    );
  }

  // 7. HSN / SAC Code Check
  const missingHsn = invoice.items.some((item) => !item.hsnSac || item.hsnSac.trim() === '');
  if (missingHsn || invoice.items.length === 0) {
    addError(
      'ERR_NO_HSN',
      'Missing HSN/SAC classification code for invoice items',
      'hsnSac',
      'warning',
      'GST regulations require HSN/SAC codes for items above threshold.'
    );
  }

  // 8. Tax Type & CGST/SGST vs IGST Mismatch Check
  const expectedTaxType = determineTaxType(invoice.sellerState, invoice.buyerState);
  
  if (expectedTaxType === 'intra') {
    // Should have CGST + SGST, no IGST
    if (invoice.igst > 0) {
      addError(
        'ERR_TAX_TYPE_MISMATCH',
        'IGST applied on intra-state transaction (same state)',
        'igst',
        'critical',
        'Intra-state transactions must use CGST + SGST instead of IGST.'
      );
    }

    // CGST should equal SGST
    if (Math.abs(invoice.cgst - invoice.sgst) > 0.05) {
      addError(
        'ERR_CGST_SGST_MISMATCH',
        `CGST (₹${invoice.cgst}) does not match SGST (₹${invoice.sgst})`,
        'cgst',
        'critical',
        'For intra-state sales, CGST and SGST must be equal (50:50 ratio).'
      );
    }
  } else {
    // Inter-state: Should have IGST, zero CGST/SGST
    if (invoice.cgst > 0 || invoice.sgst > 0) {
      addError(
        'ERR_TAX_TYPE_MISMATCH',
        'CGST/SGST applied on inter-state transaction (different states)',
        'cgst',
        'critical',
        'Inter-state transactions must use IGST instead of CGST/SGST.'
      );
    }
  }

  // 9. Incorrect Tax Math Check
  if (invoice.taxableAmount > 0 && invoice.gstRate > 0) {
    const expectedGst = (invoice.taxableAmount * invoice.gstRate) / 100;
    const actualGst = invoice.totalGst;
    if (Math.abs(expectedGst - actualGst) > 1.5) {
      addError(
        'ERR_MATH_MISMATCH',
        `Calculated GST (₹${actualGst}) does not match ${invoice.gstRate}% rate on ₹${invoice.taxableAmount} (Expected: ₹${Math.round(expectedGst)})`,
        'totalGst',
        'critical',
        'Recalculate invoice taxes to prevent tax audit discrepancies.'
      );
    }
  }

  return errors;
}

/**
 * Assess overall invoice status based on list of errors
 */
export function getInvoiceSeverity(errors: GSTHealthError[]): ErrorSeverity {
  if (errors.some((e) => e.severity === 'critical')) return 'critical';
  if (errors.some((e) => e.severity === 'warning')) return 'warning';
  return 'valid';
}
