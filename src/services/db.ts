import { Invoice, BusinessProfile, FilingPeriod, AppNotification, UserAccount } from '../types';
import { runGSTHealthCheck, getInvoiceSeverity } from './gstHealthCheck';

const DB_KEYS = {
  USERS: 'gstease_users',
  CURRENT_USER_ID: 'gstease_current_user_id',
  PROFILE_PREFIX: 'gstease_profile_',
  INVOICES_PREFIX: 'gstease_invoices_',
  // Legacy demo keys
  PROFILE: 'gstease_business_profile',
  INVOICES: 'gstease_invoices',
  FILING_PERIODS: 'gstease_filing_periods',
  NOTIFICATIONS: 'gstease_notifications',
};

// Initial Seed Business Profile for Default Demo User
export const INITIAL_BUSINESS_PROFILE: BusinessProfile = {
  id: 'biz_001',
  businessName: 'Sharma Enterprise Solutions',
  ownerName: 'Rajesh Sharma',
  email: 'rajesh@sharmaenterprise.in',
  phone: '+91 98765 43210',
  gstin: '27ABCDE1234F1Z5',
  businessType: 'Retail & Service Provider',
  state: 'Maharashtra',
  address: 'Shop No. 14, Commercial Complex, MG Road, Pune',
  pincode: '411001',
  financialYear: '2026-2027',
  defaultTaxRate: 18,
  isSetupComplete: true,
};

// Initial Seed User Account
export const INITIAL_DEMO_USER: UserAccount = {
  id: 'user_demo_001',
  fullName: 'Rajesh Sharma',
  email: 'rajesh@sharmaenterprise.in',
  password: 'demo123',
  businessId: 'biz_001',
  createdAt: '2026-08-01T00:00:00Z',
};

// Initial Seed Sample Invoices (18 Invoices)
const INITIAL_INVOICES_RAW: Partial<Invoice>[] = [
  {
    id: 'inv_s1',
    invoiceNumber: 'INV-2026-001',
    invoiceDate: '2026-08-01',
    type: 'sales',
    sellerName: 'Sharma Enterprise Solutions',
    sellerGstin: '27ABCDE1234F1Z5',
    sellerState: 'Maharashtra',
    buyerName: 'Apex Infotech Pvt Ltd',
    buyerGstin: '27AAACA9876E1ZB',
    buyerState: 'Maharashtra',
    items: [
      {
        id: 'item_1',
        description: 'IT Consulting & Cloud Setup',
        hsnSac: '998314',
        quantity: 1,
        unitPrice: 150000,
        taxableAmount: 150000,
        gstRate: 18,
        cgstAmount: 13500,
        sgstAmount: 13500,
        igstAmount: 0,
        totalAmount: 177000,
      },
    ],
    taxableAmount: 150000,
    gstRate: 18,
    cgst: 13500,
    sgst: 13500,
    igst: 0,
    totalGst: 27000,
    totalAmount: 177000,
    isInclusiveTax: false,
    paymentStatus: 'paid',
    createdAt: '2026-08-01T10:00:00Z',
  },
  {
    id: 'inv_s2',
    invoiceNumber: 'INV-2026-002',
    invoiceDate: '2026-08-03',
    type: 'sales',
    sellerName: 'Sharma Enterprise Solutions',
    sellerGstin: '27ABCDE1234F1Z5',
    sellerState: 'Maharashtra',
    buyerName: 'Karnataka Logistics Corp',
    buyerGstin: '29BBBCB5432D1ZA',
    buyerState: 'Karnataka',
    items: [
      {
        id: 'item_2',
        description: 'Network Equipment & Hardware Support',
        hsnSac: '8471',
        quantity: 2,
        unitPrice: 50000,
        taxableAmount: 100000,
        gstRate: 18,
        cgstAmount: 0,
        sgstAmount: 0,
        igstAmount: 18000,
        totalAmount: 118000,
      },
    ],
    taxableAmount: 100000,
    gstRate: 18,
    cgst: 0,
    sgst: 0,
    igst: 18000,
    totalGst: 18000,
    totalAmount: 118000,
    isInclusiveTax: false,
    paymentStatus: 'paid',
    createdAt: '2026-08-03T11:30:00Z',
  },
  {
    id: 'inv_s3',
    invoiceNumber: 'INV-2026-003',
    invoiceDate: '2026-08-04',
    type: 'sales',
    sellerName: 'Sharma Enterprise Solutions',
    sellerGstin: '27ABCDE1234F1Z5',
    sellerState: 'Maharashtra',
    buyerName: 'Mahalaxmi Traders',
    buyerGstin: '27CCCCM1111A1Z9',
    buyerState: 'Maharashtra',
    items: [
      {
        id: 'item_3',
        description: 'Office Stationery & Printing Services',
        hsnSac: '4820',
        quantity: 10,
        unitPrice: 5000,
        taxableAmount: 50000,
        gstRate: 12,
        cgstAmount: 3000,
        sgstAmount: 3000,
        igstAmount: 0,
        totalAmount: 56000,
      },
    ],
    taxableAmount: 50000,
    gstRate: 12,
    cgst: 3000,
    sgst: 3000,
    igst: 0,
    totalGst: 6000,
    totalAmount: 56000,
    isInclusiveTax: false,
    paymentStatus: 'unpaid',
    createdAt: '2026-08-04T14:15:00Z',
  },
  {
    id: 'inv_s4',
    invoiceNumber: 'INV-2026-004',
    invoiceDate: '2026-08-05',
    type: 'sales',
    sellerName: 'Sharma Enterprise Solutions',
    sellerGstin: '27ABCDE1234F1Z5',
    sellerState: 'Maharashtra',
    buyerName: 'Siddhi Electronics',
    buyerGstin: '27DDDDD2222B1Z8',
    buyerState: 'Maharashtra',
    items: [
      {
        id: 'item_4',
        description: 'Annual Maintenance Contract',
        hsnSac: '998314',
        quantity: 1,
        unitPrice: 200000,
        taxableAmount: 200000,
        gstRate: 18,
        cgstAmount: 18000,
        sgstAmount: 18000,
        igstAmount: 0,
        totalAmount: 236000,
      },
    ],
    taxableAmount: 200000,
    gstRate: 18,
    cgst: 18000,
    sgst: 18000,
    igst: 0,
    totalGst: 36000,
    totalAmount: 236000,
    isInclusiveTax: false,
    paymentStatus: 'paid',
    createdAt: '2026-08-05T09:45:00Z',
  },
  {
    id: 'inv_s5_err',
    invoiceNumber: 'INV-2026-004',
    invoiceDate: '2026-08-06',
    type: 'sales',
    sellerName: 'Sharma Enterprise Solutions',
    sellerGstin: '27ABCDE1234F1Z5',
    sellerState: 'Maharashtra',
    buyerName: 'Delhi Digital World',
    buyerGstin: '07INVALID999',
    buyerState: 'Delhi',
    items: [
      {
        id: 'item_5',
        description: 'Software License',
        hsnSac: '',
        quantity: 1,
        unitPrice: 50000,
        taxableAmount: 50000,
        gstRate: 18,
        cgstAmount: 4500,
        sgstAmount: 4500,
        igstAmount: 0,
        totalAmount: 59000,
      },
    ],
    taxableAmount: 50000,
    gstRate: 18,
    cgst: 4500,
    sgst: 4500,
    igst: 0,
    totalGst: 9000,
    totalAmount: 59000,
    isInclusiveTax: false,
    paymentStatus: 'unpaid',
    createdAt: '2026-08-06T16:20:00Z',
  },
  {
    id: 'inv_p1',
    invoiceNumber: 'PUR-8801',
    invoiceDate: '2026-08-02',
    type: 'purchase',
    sellerName: 'TechCraft Systems Pvt Ltd',
    sellerGstin: '27AAACT1010A1Z2',
    sellerState: 'Maharashtra',
    buyerName: 'Sharma Enterprise Solutions',
    buyerGstin: '27ABCDE1234F1Z5',
    buyerState: 'Maharashtra',
    items: [
      {
        id: 'item_p1',
        description: 'Dell Workstation Laptops & Accessories',
        hsnSac: '8471',
        quantity: 2,
        unitPrice: 60000,
        taxableAmount: 120000,
        gstRate: 18,
        cgstAmount: 10800,
        sgstAmount: 10800,
        igstAmount: 0,
        totalAmount: 141600,
      },
    ],
    taxableAmount: 120000,
    gstRate: 18,
    cgst: 10800,
    sgst: 10800,
    igst: 0,
    totalGst: 21600,
    totalAmount: 141600,
    isInclusiveTax: false,
    itcStatus: 'eligible',
    paymentStatus: 'paid',
    createdAt: '2026-08-02T12:00:00Z',
  },
  {
    id: 'inv_p2',
    invoiceNumber: 'PUR-8802',
    invoiceDate: '2026-08-04',
    type: 'purchase',
    sellerName: 'National Office Supplies',
    sellerGstin: '27BBBNO2020B1Z4',
    sellerState: 'Maharashtra',
    buyerName: 'Sharma Enterprise Solutions',
    buyerGstin: '27ABCDE1234F1Z5',
    buyerState: 'Maharashtra',
    items: [
      {
        id: 'item_p2',
        description: 'Office Furniture & Chairs',
        hsnSac: '9403',
        quantity: 1,
        unitPrice: 50000,
        taxableAmount: 50000,
        gstRate: 18,
        cgstAmount: 4500,
        sgstAmount: 4500,
        igstAmount: 0,
        totalAmount: 59000,
      },
    ],
    taxableAmount: 50000,
    gstRate: 18,
    cgst: 4500,
    sgst: 4500,
    igst: 0,
    totalGst: 9000,
    totalAmount: 59000,
    isInclusiveTax: false,
    itcStatus: 'eligible',
    paymentStatus: 'paid',
    createdAt: '2026-08-04T15:30:00Z',
  },
  {
    id: 'inv_p3',
    invoiceNumber: 'PUR-8803',
    invoiceDate: '2026-08-05',
    type: 'purchase',
    sellerName: 'Gujarat Telecom & Fiber',
    sellerGstin: '24CCCGT3030C1Z6',
    sellerState: 'Gujarat',
    buyerName: 'Sharma Enterprise Solutions',
    buyerGstin: '27ABCDE1234F1Z5',
    buyerState: 'Maharashtra',
    items: [
      {
        id: 'item_p3',
        description: 'High-speed Internet & Server Rental',
        hsnSac: '998413',
        quantity: 1,
        unitPrice: 30000,
        taxableAmount: 30000,
        gstRate: 18,
        cgstAmount: 0,
        sgstAmount: 0,
        igstAmount: 5400,
        totalAmount: 35400,
      },
    ],
    taxableAmount: 30000,
    gstRate: 18,
    cgst: 0,
    sgst: 0,
    igst: 5400,
    totalGst: 5400,
    totalAmount: 35400,
    isInclusiveTax: false,
    itcStatus: 'eligible',
    paymentStatus: 'paid',
    createdAt: '2026-08-05T17:10:00Z',
  },
  {
    id: 'inv_p4_review',
    invoiceNumber: 'PUR-8804',
    invoiceDate: '2026-08-06',
    type: 'purchase',
    sellerName: 'Kharadi Local Hardware',
    sellerGstin: '',
    sellerState: 'Maharashtra',
    buyerName: 'Sharma Enterprise Solutions',
    buyerGstin: '27ABCDE1234F1Z5',
    buyerState: 'Maharashtra',
    items: [
      {
        id: 'item_p4',
        description: 'Electrical Repairs & Maintenance Supplies',
        hsnSac: '8536',
        quantity: 1,
        unitPrice: 15000,
        taxableAmount: 15000,
        gstRate: 18,
        cgstAmount: 1350,
        sgstAmount: 1350,
        igstAmount: 0,
        totalAmount: 17700,
      },
    ],
    taxableAmount: 15000,
    gstRate: 18,
    cgst: 1350,
    sgst: 1350,
    igst: 0,
    totalGst: 2700,
    totalAmount: 17700,
    isInclusiveTax: false,
    itcStatus: 'review_required',
    paymentStatus: 'unpaid',
    createdAt: '2026-08-06T18:00:00Z',
  },
];

// Initial Notifications
export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif_1',
    title: 'GSTR-3B Filing Deadline Approaching',
    message: 'August 2026 GSTR-3B return is due on 20th September 2026.',
    type: 'info',
    timestamp: '2026-08-08T09:00:00Z',
    isRead: false,
  },
  {
    id: 'notif_2',
    title: 'GST Audit Alert: Duplicate Invoice Detected',
    message: 'Invoice INV-2026-004 has duplicate invoice number entries.',
    type: 'error',
    timestamp: '2026-08-07T14:30:00Z',
    isRead: false,
    invoiceId: 'inv_s5_err',
    viewTarget: 'healthCheck',
  },
];

class DataStore {
  private users: UserAccount[] = [];
  private currentUserId: string | null = null;

  constructor() {
    this.init();
  }

  private init() {
    // 1. Load users or seed initial demo user
    const savedUsers = localStorage.getItem(DB_KEYS.USERS);
    if (savedUsers) {
      try {
        this.users = JSON.parse(savedUsers);
      } catch (e) {
        this.users = [INITIAL_DEMO_USER];
      }
    } else {
      this.users = [INITIAL_DEMO_USER];
      localStorage.setItem(DB_KEYS.USERS, JSON.stringify(this.users));
    }

    // 2. Current User session
    const savedCurrentUserId = localStorage.getItem(DB_KEYS.CURRENT_USER_ID);
    if (savedCurrentUserId && this.users.some((u) => u.id === savedCurrentUserId)) {
      this.currentUserId = savedCurrentUserId;
    } else {
      this.currentUserId = INITIAL_DEMO_USER.id;
      localStorage.setItem(DB_KEYS.CURRENT_USER_ID, INITIAL_DEMO_USER.id);
    }

    // 3. Ensure Demo Business Profile & Invoices exist for biz_001
    const demoProfileKey = `${DB_KEYS.PROFILE_PREFIX}biz_001`;
    if (!localStorage.getItem(demoProfileKey) && !localStorage.getItem(DB_KEYS.PROFILE)) {
      localStorage.setItem(demoProfileKey, JSON.stringify(INITIAL_BUSINESS_PROFILE));
      localStorage.setItem(DB_KEYS.PROFILE, JSON.stringify(INITIAL_BUSINESS_PROFILE));
    }

    const demoInvoicesKey = `${DB_KEYS.INVOICES_PREFIX}biz_001`;
    if (!localStorage.getItem(demoInvoicesKey) && !localStorage.getItem(DB_KEYS.INVOICES)) {
      const demoInvoices = this.buildInitialInvoices();
      localStorage.setItem(demoInvoicesKey, JSON.stringify(demoInvoices));
      localStorage.setItem(DB_KEYS.INVOICES, JSON.stringify(demoInvoices));
    }
  }

  private buildInitialInvoices(): Invoice[] {
    const allRaw = INITIAL_INVOICES_RAW as Invoice[];
    return allRaw.map((inv) => {
      const errors = runGSTHealthCheck(inv, allRaw);
      const severity = getInvoiceSeverity(errors);
      return {
        ...inv,
        status: severity,
        errors: errors,
      } as Invoice;
    });
  }

  // --- USER AUTHENTICATION & MULTI-USER METHODS ---

  public getCurrentUser(): UserAccount | null {
    return this.users.find((u) => u.id === this.currentUserId) || this.users[0] || null;
  }

  public registerUser(details: {
    fullName: string;
    email: string;
    password?: string;
    businessName: string;
    gstin: string;
    businessType: string;
    state: string;
    phone: string;
    address?: string;
  }): { user: UserAccount; profile: BusinessProfile } {
    const cleanEmail = details.email.trim().toLowerCase();

    // Check if user email already exists
    const existing = this.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      throw new Error(`An account with email "${details.email}" already exists. Please login.`);
    }

    const userId = `user_${Date.now()}`;
    const businessId = `biz_${Date.now()}`;

    const newUser: UserAccount = {
      id: userId,
      fullName: details.fullName.trim(),
      email: cleanEmail,
      password: details.password || 'password123',
      businessId,
      createdAt: new Date().toISOString(),
    };

    const newProfile: BusinessProfile = {
      id: businessId,
      businessName: details.businessName.trim(),
      ownerName: details.fullName.trim(),
      email: cleanEmail,
      phone: details.phone.trim(),
      gstin: details.gstin.trim().toUpperCase(),
      businessType: details.businessType,
      state: details.state,
      address: details.address || `${details.state}, India`,
      pincode: '400001',
      financialYear: '2026-2027',
      defaultTaxRate: 18,
      isSetupComplete: true,
    };

    // Save User & Profile
    this.users.push(newUser);
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(this.users));

    this.currentUserId = userId;
    localStorage.setItem(DB_KEYS.CURRENT_USER_ID, userId);

    localStorage.setItem(`${DB_KEYS.PROFILE_PREFIX}${businessId}`, JSON.stringify(newProfile));

    // Seed new business with clean sample invoice to give them immediate visual data
    const sampleSalesInv: Invoice = {
      id: `inv_${Date.now()}_1`,
      invoiceNumber: 'INV-2026-001',
      invoiceDate: new Date().toISOString().split('T')[0],
      type: 'sales',
      sellerName: newProfile.businessName,
      sellerGstin: newProfile.gstin,
      sellerState: newProfile.state,
      buyerName: 'Sample Client Enterprise',
      buyerGstin: '27AAACA9876E1ZB',
      buyerState: newProfile.state,
      items: [
        {
          id: `item_${Date.now()}`,
          description: 'Consulting & Business Services',
          hsnSac: '998314',
          quantity: 1,
          unitPrice: 50000,
          taxableAmount: 50000,
          gstRate: 18,
          cgstAmount: 4500,
          sgstAmount: 4500,
          igstAmount: 0,
          totalAmount: 59000,
        },
      ],
      taxableAmount: 50000,
      gstRate: 18,
      cgst: 4500,
      sgst: 4500,
      igst: 0,
      totalGst: 9000,
      totalAmount: 59000,
      isInclusiveTax: false,
      status: 'valid',
      errors: [],
      paymentStatus: 'paid',
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(`${DB_KEYS.INVOICES_PREFIX}${businessId}`, JSON.stringify([sampleSalesInv]));

    return { user: newUser, profile: newProfile };
  }

  public loginUser(email: string, password?: string): { user: UserAccount; profile: BusinessProfile } {
    const cleanEmail = email.trim().toLowerCase();
    const user = this.users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      throw new Error(`No account found matching "${email}". Please sign up first.`);
    }

    if (password && user.password && user.password !== password) {
      throw new Error(`Incorrect password. Please try again.`);
    }

    this.currentUserId = user.id;
    localStorage.setItem(DB_KEYS.CURRENT_USER_ID, user.id);

    return { user, profile: this.getProfile() };
  }

  public logoutUser(): void {
    this.currentUserId = null;
    localStorage.removeItem(DB_KEYS.CURRENT_USER_ID);
  }

  // --- DATA ACCESS METHODS TIED TO CURRENT BUSINESS SESSION ---

  public getProfile(): BusinessProfile {
    const currentUser = this.getCurrentUser();
    const bizId = currentUser ? currentUser.businessId : 'biz_001';
    const key = `${DB_KEYS.PROFILE_PREFIX}${bizId}`;

    const saved = localStorage.getItem(key) || localStorage.getItem(DB_KEYS.PROFILE);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_BUSINESS_PROFILE;
      }
    }
    return INITIAL_BUSINESS_PROFILE;
  }

  public updateProfile(updated: Partial<BusinessProfile>): BusinessProfile {
    const current = this.getProfile();
    const newProfile = { ...current, ...updated };

    const key = `${DB_KEYS.PROFILE_PREFIX}${current.id}`;
    localStorage.setItem(key, JSON.stringify(newProfile));

    if (current.id === 'biz_001') {
      localStorage.setItem(DB_KEYS.PROFILE, JSON.stringify(newProfile));
    }

    return newProfile;
  }

  public getInvoices(): Invoice[] {
    const profile = this.getProfile();
    const key = `${DB_KEYS.INVOICES_PREFIX}${profile.id}`;

    const saved = localStorage.getItem(key) || (profile.id === 'biz_001' ? localStorage.getItem(DB_KEYS.INVOICES) : null);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return profile.id === 'biz_001' ? this.buildInitialInvoices() : [];
      }
    }

    if (profile.id === 'biz_001') {
      const initial = this.buildInitialInvoices();
      localStorage.setItem(key, JSON.stringify(initial));
      return initial;
    }

    return [];
  }

  public saveInvoice(invoiceData: Omit<Invoice, 'id' | 'status' | 'errors' | 'createdAt'> & { id?: string }): Invoice {
    const profile = this.getProfile();
    const key = `${DB_KEYS.INVOICES_PREFIX}${profile.id}`;
    let currentInvoices = this.getInvoices();

    const isNew = !invoiceData.id;
    const id = invoiceData.id || `inv_${Date.now()}`;
    const createdAt = isNew ? new Date().toISOString() : (currentInvoices.find((i) => i.id === id)?.createdAt || new Date().toISOString());

    const draftInvoice: Invoice = {
      ...invoiceData,
      id,
      status: 'valid',
      errors: [],
      createdAt,
    };

    const otherInvoices = currentInvoices.filter((i) => i.id !== id);
    const errors = runGSTHealthCheck(draftInvoice, otherInvoices);
    const status = getInvoiceSeverity(errors);

    const finalInvoice: Invoice = {
      ...draftInvoice,
      errors,
      status,
    };

    if (isNew) {
      currentInvoices = [finalInvoice, ...currentInvoices];
    } else {
      currentInvoices = currentInvoices.map((inv) => (inv.id === id ? finalInvoice : inv));
    }

    // Recheck health across all invoices
    currentInvoices = currentInvoices.map((inv) => {
      const errs = runGSTHealthCheck(inv, currentInvoices);
      const sev = getInvoiceSeverity(errs);
      return { ...inv, errors: errs, status: sev };
    });

    localStorage.setItem(key, JSON.stringify(currentInvoices));
    if (profile.id === 'biz_001') {
      localStorage.setItem(DB_KEYS.INVOICES, JSON.stringify(currentInvoices));
    }

    return finalInvoice;
  }

  public deleteInvoice(id: string): void {
    const profile = this.getProfile();
    const key = `${DB_KEYS.INVOICES_PREFIX}${profile.id}`;
    let currentInvoices = this.getInvoices().filter((inv) => inv.id !== id);

    currentInvoices = currentInvoices.map((inv) => {
      const errors = runGSTHealthCheck(inv, currentInvoices);
      const status = getInvoiceSeverity(errors);
      return { ...inv, errors, status };
    });

    localStorage.setItem(key, JSON.stringify(currentInvoices));
    if (profile.id === 'biz_001') {
      localStorage.setItem(DB_KEYS.INVOICES, JSON.stringify(currentInvoices));
    }
  }

  public recheckAllHealth(): void {
    const profile = this.getProfile();
    const key = `${DB_KEYS.INVOICES_PREFIX}${profile.id}`;
    let currentInvoices = this.getInvoices();

    currentInvoices = currentInvoices.map((inv) => {
      const errors = runGSTHealthCheck(inv, currentInvoices);
      const status = getInvoiceSeverity(errors);
      return { ...inv, errors, status };
    });

    localStorage.setItem(key, JSON.stringify(currentInvoices));
    if (profile.id === 'biz_001') {
      localStorage.setItem(DB_KEYS.INVOICES, JSON.stringify(currentInvoices));
    }
  }

  public getFilingPeriods(): FilingPeriod[] {
    const saved = localStorage.getItem(DB_KEYS.FILING_PERIODS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  }

  public updateFilingPeriod(id: string, updates: Partial<FilingPeriod>): FilingPeriod[] {
    const periods = this.getFilingPeriods().map((p) => (p.id === id ? { ...p, ...updates } : p));
    localStorage.setItem(DB_KEYS.FILING_PERIODS, JSON.stringify(periods));
    return periods;
  }

  public getNotifications(): AppNotification[] {
    const saved = localStorage.getItem(DB_KEYS.NOTIFICATIONS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  }

  public markNotificationAsRead(id: string): AppNotification[] {
    const notifs = this.getNotifications().map((n) => (n.id === id ? { ...n, isRead: true } : n));
    localStorage.setItem(DB_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
    return notifs;
  }

  public resetDemoData(): void {
    const profile = this.getProfile();
    if (profile.id === 'biz_001') {
      localStorage.removeItem(DB_KEYS.PROFILE);
      localStorage.removeItem(DB_KEYS.INVOICES);
      localStorage.removeItem(`${DB_KEYS.PROFILE_PREFIX}biz_001`);
      localStorage.removeItem(`${DB_KEYS.INVOICES_PREFIX}biz_001`);
    }
    localStorage.removeItem(DB_KEYS.FILING_PERIODS);
    localStorage.removeItem(DB_KEYS.NOTIFICATIONS);
    this.init();
  }
}

export const db = new DataStore();
