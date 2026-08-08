import { InvoiceItem, InvoiceType } from '../types';

export interface ExtractedInvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  type: InvoiceType;
  sellerName: string;
  sellerGstin: string;
  sellerState: string;
  buyerName: string;
  buyerGstin: string;
  buyerState: string;
  productDescription: string;
  hsnSac: string;
  quantity: number;
  unitPrice: number;
  taxableAmount: number;
  gstRate: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalAmount: number;
  isInclusiveTax: boolean;
  confidenceScore: number; // 0 to 100
  extractedFieldsCount: number;
  detectedErrorsCount: number;
  rawTextPreview?: string;
}

const SAMPLE_OCR_TEMPLATES: ExtractedInvoiceData[] = [
  {
    invoiceNumber: 'INV-2026-099',
    invoiceDate: '2026-08-08',
    type: 'purchase',
    sellerName: 'Reliance Digital Retail Ltd',
    sellerGstin: '27AAACR5555A1Z1',
    sellerState: 'Maharashtra',
    buyerName: 'Sharma Enterprise Solutions',
    buyerGstin: '27ABCDE1234F1Z5',
    buyerState: 'Maharashtra',
    productDescription: 'Apple iPad Air 11" M2 Wi-Fi 128GB',
    hsnSac: '8471',
    quantity: 1,
    unitPrice: 59900,
    taxableAmount: 59900,
    gstRate: 18,
    cgstAmount: 5391,
    sgstAmount: 5391,
    igstAmount: 0,
    totalAmount: 70682,
    isInclusiveTax: false,
    confidenceScore: 96,
    extractedFieldsCount: 14,
    detectedErrorsCount: 0,
    rawTextPreview: 'TAX INVOICE\nReliance Digital Retail Ltd GSTIN: 27AAACR5555A1Z1\nBill To: Sharma Enterprise Solutions GSTIN: 27ABCDE1234F1Z5\nInv No: INV-2026-099 Date: 08-Aug-2026\nItem: Apple iPad Air 11 HSN: 8471 Qty: 1 Rate: 59900\nCGST @ 9%: 5391 SGST @ 9%: 5391\nTotal Payable: ₹70,682.00',
  },
  {
    invoiceNumber: 'INV-2026-104',
    invoiceDate: '2026-08-07',
    type: 'sales',
    sellerName: 'Sharma Enterprise Solutions',
    sellerGstin: '27ABCDE1234F1Z5',
    sellerState: 'Maharashtra',
    buyerName: 'Bangalore Tech Park Ltd',
    buyerGstin: '29AAACB1234F1Z9',
    buyerState: 'Karnataka',
    productDescription: 'Custom Cloud Architecture & Security Audit',
    hsnSac: '998314',
    quantity: 1,
    unitPrice: 85000,
    taxableAmount: 85000,
    gstRate: 18,
    cgstAmount: 0,
    sgstAmount: 0,
    igstAmount: 15300,
    totalAmount: 100300,
    isInclusiveTax: false,
    confidenceScore: 94,
    extractedFieldsCount: 14,
    detectedErrorsCount: 0,
    rawTextPreview: 'INVOICE\nSharma Enterprise Solutions, Pune\nCustomer: Bangalore Tech Park Ltd (Karnataka)\nInv #: INV-2026-104 Date: 07/08/2026\nServices: Cloud Architecture Audit HSN 998314 Amount: 85000\nIGST 18%: 15300 Total: ₹1,00,300.00',
  },
  {
    invoiceNumber: 'PUR-9944',
    invoiceDate: '2026-08-06',
    type: 'purchase',
    sellerName: 'Vikas Hardware & Spares',
    sellerGstin: '27AAAAV9999Z999', // Warning GSTIN
    sellerState: 'Maharashtra',
    buyerName: 'Sharma Enterprise Solutions',
    buyerGstin: '27ABCDE1234F1Z5',
    buyerState: 'Maharashtra',
    productDescription: 'Heavy-Duty Networking Cables & Connectors',
    hsnSac: '8544',
    quantity: 5,
    unitPrice: 2400,
    taxableAmount: 12000,
    gstRate: 18,
    cgstAmount: 1080,
    sgstAmount: 1080,
    igstAmount: 0,
    totalAmount: 14160,
    isInclusiveTax: false,
    confidenceScore: 88,
    extractedFieldsCount: 12,
    detectedErrorsCount: 1,
    rawTextPreview: 'CASH MEMO / INVOICE\nVikas Hardware & Spares GSTIN: 27AAAAV9999Z999\nTo: Sharma Enterprise Solutions\nInv: PUR-9944 Date: 06-Aug-2026\nNetworking Cables HSN 8544 5 Pcs @ 2400 = 12000\nTax 18% = 2160 Total: 14160',
  },
];

/**
 * AI Invoice OCR Scanner Service
 * Simulates intelligent multi-modal vision parsing with progressive loading status.
 * Can be swapped easily with Google Vision / Gemini Multimodal API.
 */
export async function simulateInvoiceOCRScan(
  file: File,
  onProgress?: (progressText: string, percentage: number) => void
): Promise<ExtractedInvoiceData> {
  // Step 1: Pre-processing image/PDF
  onProgress?.('Uploading document to AI Scanner engine...', 20);
  await new Promise((res) => setTimeout(res, 800));

  // Step 2: Extracting text & layout
  onProgress?.('Performing OCR layout analysis & text detection...', 55);
  await new Promise((res) => setTimeout(res, 1000));

  // Step 3: Entity extraction & GST verification
  onProgress?.('Extracting GSTINs, HSN codes, Taxable Amounts & CGST/SGST/IGST...', 85);
  await new Promise((res) => setTimeout(res, 900));

  onProgress?.('Finalizing invoice data verification...', 100);
  await new Promise((res) => setTimeout(res, 400));

  // Select realistic template or customize based on filename
  const filename = file.name.toLowerCase();
  let selected = SAMPLE_OCR_TEMPLATES[0];

  if (filename.includes('sales') || filename.includes('tech') || filename.includes('cloud')) {
    selected = SAMPLE_OCR_TEMPLATES[1];
  } else if (filename.includes('pur') || filename.includes('bill') || filename.includes('hardware')) {
    selected = SAMPLE_OCR_TEMPLATES[2];
  }

  // Generate slightly dynamic invoice number based on timestamp to avoid duplicate collision during user test
  const dynamicNum = `${selected.invoiceNumber.split('-')[0]}-${selected.invoiceNumber.split('-')[1]}-${Math.floor(
    100 + Math.random() * 899
  )}`;

  return {
    ...selected,
    invoiceNumber: dynamicNum,
    invoiceDate: new Date().toISOString().split('T')[0],
  };
}
