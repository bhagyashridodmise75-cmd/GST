import { IndianState, TaxType } from '../types';

export const INDIAN_STATES: IndianState[] = [
  { code: 'MH', name: 'Maharashtra', gstCode: '27' },
  { code: 'KA', name: 'Karnataka', gstCode: '29' },
  { code: 'DL', name: 'Delhi', gstCode: '07' },
  { code: 'GJ', name: 'Gujarat', gstCode: '24' },
  { code: 'TN', name: 'Tamil Nadu', gstCode: '33' },
  { code: 'UP', name: 'Uttar Pradesh', gstCode: '09' },
  { code: 'WB', name: 'West Bengal', gstCode: '19' },
  { code: 'TS', name: 'Telangana', gstCode: '36' },
  { code: 'HR', name: 'Haryana', gstCode: '06' },
  { code: 'RJ', name: 'Rajasthan', gstCode: '08' },
  { code: 'MP', name: 'Madhya Pradesh', gstCode: '23' },
  { code: 'PB', name: 'Punjab', gstCode: '03' },
  { code: 'KL', name: 'Kerala', gstCode: '32' },
  { code: 'BR', name: 'Bihar', gstCode: '10' },
  { code: 'AP', name: 'Andhra Pradesh', gstCode: '37' },
];

export const GST_RATES = [0, 5, 12, 18, 28];

export const COMMON_HSN_CODES = [
  { code: '998314', desc: 'IT Design and Software Development Services', rate: 18 },
  { code: '998311', desc: 'Management & Business Consulting Services', rate: 18 },
  { code: '8471', desc: 'Automatic Data Processing Machines / Laptops', rate: 18 },
  { code: '6203', desc: 'Men Garments and Ready-made Textiles', rate: 12 },
  { code: '2106', desc: 'Packaged Food Preparations', rate: 12 },
  { code: '996331', desc: 'Restaurant & Catering Services', rate: 5 },
  { code: '995411', desc: 'General Construction Services', rate: 18 },
  { code: '8708', desc: 'Motor Vehicle Parts and Accessories', rate: 28 },
  { code: '4820', desc: 'Paper Stationery and Office Supplies', rate: 12 },
];

/**
 * Format numbers according to the Indian Numbering System (Lakhs & Crores)
 * e.g., 500000 -> ₹5,00,000.00
 */
export function formatINR(amount: number, showSymbol: boolean = true): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return showSymbol ? '₹0' : '0';
  }
  
  const absAmount = Math.abs(amount);
  const roundedAmount = Math.round(absAmount * 100) / 100;
  const parts = roundedAmount.toFixed(2).split('.');
  let integerPart = parts[0];
  const decimalPart = parts[1] === '00' ? '' : `.${parts[1]}`;

  // Apply Indian Lakh/Crore comma formatting
  if (integerPart.length > 3) {
    const lastThree = integerPart.substring(integerPart.length - 3);
    const otherNumbers = integerPart.substring(0, integerPart.length - 3);
    integerPart = `${otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',')},${lastThree}`;
  }

  const sign = amount < 0 ? '-' : '';
  const symbol = showSymbol ? '₹' : '';
  return `${sign}${symbol}${integerPart}${decimalPart}`;
}

/**
 * Determine if transaction is Intra-state (CGST+SGST) or Inter-state (IGST)
 */
export function determineTaxType(sellerState: string, buyerState: string): TaxType {
  if (!sellerState || !buyerState) return 'intra';
  const cleanSeller = sellerState.trim().toLowerCase();
  const cleanBuyer = buyerState.trim().toLowerCase();
  return cleanSeller === cleanBuyer ? 'intra' : 'inter';
}

export interface TaxCalculationResult {
  taxableAmount: number;
  totalGst: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalAmount: number;
  taxType: TaxType;
}

/**
 * Calculate full GST amounts given item price, quantity, rate, tax mode, and states
 */
export function calculateGST(
  unitPrice: number,
  quantity: number,
  gstRate: number, // percentage e.g. 18
  isInclusive: boolean,
  sellerState: string,
  buyerState: string
): TaxCalculationResult {
  const baseValue = unitPrice * quantity;
  const taxType = determineTaxType(sellerState, buyerState);

  let taxableAmount = 0;
  let totalGst = 0;

  if (isInclusive && gstRate > 0) {
    // Taxable = Base / (1 + Rate/100)
    taxableAmount = baseValue / (1 + gstRate / 100);
    totalGst = baseValue - taxableAmount;
  } else {
    // Taxable = Base
    taxableAmount = baseValue;
    totalGst = baseValue * (gstRate / 100);
  }

  // Round values to 2 decimal places
  taxableAmount = Math.round(taxableAmount * 100) / 100;
  totalGst = Math.round(totalGst * 100) / 100;
  const totalAmount = Math.round((taxableAmount + totalGst) * 100) / 100;

  let cgst = 0;
  let sgst = 0;
  let igst = 0;

  if (taxType === 'intra') {
    cgst = Math.round((totalGst / 2) * 100) / 100;
    sgst = Math.round((totalGst - cgst) * 100) / 100; // avoid rounding split difference
  } else {
    igst = totalGst;
  }

  return {
    taxableAmount,
    totalGst,
    cgst,
    sgst,
    igst,
    totalAmount,
    taxType,
  };
}

/**
 * Validates standard Indian GSTIN format (15 characters)
 * e.g., 27AAAAA0000A1Z5
 */
export function validateGSTINFormat(gstin: string): boolean {
  if (!gstin) return false;
  const cleanGstin = gstin.trim().toUpperCase();
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstinRegex.test(cleanGstin);
}
