export type InvoiceType = 'sales' | 'purchase';
export type TaxType = 'intra' | 'inter'; // Intra-state (CGST+SGST) vs Inter-state (IGST)
export type ErrorSeverity = 'critical' | 'warning' | 'valid';
export type PaymentStatus = 'paid' | 'unpaid' | 'partial';
export type ITCStatus = 'eligible' | 'review_required' | 'ineligible';

export interface UserAccount {
  id: string;
  fullName: string;
  email: string;
  password?: string;
  businessId: string;
  createdAt: string;
}

export interface BusinessProfile {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  gstin: string;
  businessType: string; // e.g., 'Retail', 'Service Provider', 'Trader', 'Manufacturer', 'Freelancer'
  state: string;
  address: string;
  pincode: string;
  financialYear: string;
  defaultTaxRate: number;
  isSetupComplete: boolean;
}

export interface InvoiceItem {
  id: string;
  description: string;
  hsnSac: string;
  quantity: number;
  unitPrice: number;
  taxableAmount: number;
  gstRate: number; // e.g. 5, 12, 18, 28
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalAmount: number;
}

export interface GSTHealthError {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  code: string;
  message: string;
  field: string;
  severity: ErrorSeverity;
  fixSuggestion: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string;
  type: InvoiceType;
  
  // Parties
  sellerName: string;
  sellerGstin: string;
  sellerState: string;
  
  buyerName: string;
  buyerGstin: string;
  buyerState: string;
  
  // Items & Money
  items: InvoiceItem[];
  taxableAmount: number;
  gstRate: number; // Average or primary rate
  cgst: number;
  sgst: number;
  igst: number;
  totalGst: number;
  totalAmount: number;
  isInclusiveTax: boolean;
  
  // Compliance
  status: ErrorSeverity;
  errors: GSTHealthError[];
  itcStatus?: ITCStatus;
  paymentStatus: PaymentStatus;
  
  notes?: string;
  fileUrl?: string;
  createdAt: string;
}

export interface PartyMaster {
  id: string;
  name: string;
  gstin: string;
  state: string;
  email: string;
  phone: string;
  type: 'customer' | 'vendor';
  address?: string;
}

export interface GSTSummaryData {
  period: string;
  totalTaxableSales: number;
  outputCgst: number;
  outputSgst: number;
  outputIgst: number;
  totalOutputGst: number;
  
  totalPurchases: number;
  totalPurchaseGst: number;
  eligibleItc: number;
  reviewItc: number;
  
  estimatedGstPayable: number;
  salesCount: number;
  purchaseCount: number;
  errorCount: number;
}

export interface FilingPeriod {
  id: string;
  returnType: 'GSTR-1' | 'GSTR-3B' | 'CMP-08' | 'GSTR-9';
  periodName: string;
  dueDate: string;
  status: 'pending' | 'prepared' | 'filed';
  penaltyPerDay: number;
  reminderEnabled: boolean;
  notes?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'error' | 'warning' | 'info' | 'success';
  timestamp: string;
  isRead: boolean;
  invoiceId?: string;
  viewTarget?: string;
}

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestions?: string[];
  dataSummary?: {
    sales?: number;
    purchases?: number;
    gstPayable?: number;
    errorsCount?: number;
    itcEligible?: number;
  };
}

export interface IndianState {
  code: string;
  name: string;
  gstCode: string;
}
