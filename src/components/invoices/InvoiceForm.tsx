import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calculator, Info, CheckCircle2 } from 'lucide-react';
import { Invoice, InvoiceItem, InvoiceType, BusinessProfile } from '../../types';
import {
  INDIAN_STATES,
  GST_RATES,
  COMMON_HSN_CODES,
  calculateGST,
  formatINR,
  determineTaxType
} from '../../services/gstEngine';

interface InvoiceFormProps {
  profile: BusinessProfile;
  initialInvoice?: Invoice | null;
  defaultType?: InvoiceType;
  isOpen: boolean;
  onClose: () => void;
  onSave: (invoiceData: any) => void;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({
  profile,
  initialInvoice,
  defaultType = 'sales',
  isOpen,
  onClose,
  onSave,
}) => {
  const [type, setType] = useState<InvoiceType>(initialInvoice?.type || defaultType);
  const [invoiceNumber, setInvoiceNumber] = useState(
    initialInvoice?.invoiceNumber || `INV-2026-${Math.floor(100 + Math.random() * 899)}`
  );
  const [invoiceDate, setInvoiceDate] = useState(
    initialInvoice?.invoiceDate || new Date().toISOString().split('T')[0]
  );

  // Seller Details
  const [sellerName, setSellerName] = useState(initialInvoice?.sellerName || profile.businessName);
  const [sellerGstin, setSellerGstin] = useState(initialInvoice?.sellerGstin || profile.gstin);
  const [sellerState, setSellerState] = useState(initialInvoice?.sellerState || profile.state);

  // Buyer Details
  const [buyerName, setBuyerName] = useState(
    initialInvoice?.buyerName || (type === 'sales' ? 'Apex Infotech Pvt Ltd' : profile.businessName)
  );
  const [buyerGstin, setBuyerGstin] = useState(
    initialInvoice?.buyerGstin || (type === 'sales' ? '27AAACA9876E1ZB' : profile.gstin)
  );
  const [buyerState, setBuyerState] = useState(
    initialInvoice?.buyerState || (type === 'sales' ? 'Maharashtra' : 'Maharashtra')
  );

  // Tax & Line Item
  const [description, setDescription] = useState(
    initialInvoice?.items[0]?.description || 'IT Services & Software License'
  );
  const [hsnSac, setHsnSac] = useState(initialInvoice?.items[0]?.hsnSac || '998314');
  const [quantity, setQuantity] = useState(initialInvoice?.items[0]?.quantity || 1);
  const [unitPrice, setUnitPrice] = useState(initialInvoice?.items[0]?.unitPrice || 50000);
  const [gstRate, setGstRate] = useState(initialInvoice?.gstRate || 18);
  const [isInclusiveTax, setIsInclusiveTax] = useState(initialInvoice?.isInclusiveTax || false);
  const [paymentStatus, setPaymentStatus] = useState<any>(initialInvoice?.paymentStatus || 'paid');

  // Update seller/buyer defaults when switching type
  useEffect(() => {
    if (!initialInvoice) {
      if (type === 'sales') {
        setSellerName(profile.businessName);
        setSellerGstin(profile.gstin);
        setSellerState(profile.state);
        setBuyerName('Apex Infotech Pvt Ltd');
        setBuyerGstin('27AAACA9876E1ZB');
        setBuyerState('Maharashtra');
      } else {
        setSellerName('TechCraft Systems Pvt Ltd');
        setSellerGstin('27AAACT1010A1Z2');
        setSellerState('Maharashtra');
        setBuyerName(profile.businessName);
        setBuyerGstin(profile.gstin);
        setBuyerState(profile.state);
      }
    }
  }, [type, profile, initialInvoice]);

  if (!isOpen) return null;

  // Calculate taxes on the fly
  const calc = calculateGST(unitPrice, quantity, gstRate, isInclusiveTax, sellerState, buyerState);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const item: InvoiceItem = {
      id: `item_${Date.now()}`,
      description,
      hsnSac,
      quantity,
      unitPrice,
      taxableAmount: calc.taxableAmount,
      gstRate,
      cgstAmount: calc.cgst,
      sgstAmount: calc.sgst,
      igstAmount: calc.igst,
      totalAmount: calc.totalAmount,
    };

    const invoiceData = {
      id: initialInvoice?.id,
      invoiceNumber,
      invoiceDate,
      type,
      sellerName,
      sellerGstin,
      sellerState,
      buyerName,
      buyerGstin,
      buyerState,
      items: [item],
      taxableAmount: calc.taxableAmount,
      gstRate,
      cgst: calc.cgst,
      sgst: calc.sgst,
      igst: calc.igst,
      totalGst: calc.totalGst,
      totalAmount: calc.totalAmount,
      isInclusiveTax,
      paymentStatus,
      itcStatus: type === 'purchase' ? (sellerGstin ? 'eligible' : 'review_required') : undefined,
    };

    onSave(invoiceData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="glass-card w-full max-w-2xl rounded-2xl border border-slate-700 p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="font-bold text-lg text-white">
              {initialInvoice ? 'Edit Invoice' : 'Create New GST Invoice'}
            </h3>
            <p className="text-xs text-slate-400">
              Automatic CGST/SGST vs IGST calculation based on seller & buyer states.
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:bg-slate-800 text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
          {/* Invoice Type Switcher */}
          <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-900/80 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setType('sales')}
              className={`py-2 rounded-lg font-semibold transition ${
                type === 'sales'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Outward Sales Invoice
            </button>
            <button
              type="button"
              onClick={() => setType('purchase')}
              className={`py-2 rounded-lg font-semibold transition ${
                type === 'purchase'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Inward Purchase Bill
            </button>
          </div>

          {/* Row 1: Invoice # & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Invoice Number *</label>
              <input
                type="text"
                required
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-slate-200 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Invoice Date *</label>
              <input
                type="date"
                required
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-slate-200 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Row 2: Seller & Buyer Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
            {/* Seller */}
            <div className="space-y-2">
              <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">
                Seller Details (Supplier)
              </span>
              <input
                type="text"
                placeholder="Seller Name *"
                required
                value={sellerName}
                onChange={(e) => setSellerName(e.target.value)}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-slate-200"
              />
              <input
                type="text"
                placeholder="Seller GSTIN (e.g. 27AAAAA0000A1Z5)"
                value={sellerGstin}
                onChange={(e) => setSellerGstin(e.target.value.toUpperCase())}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-slate-200 font-mono text-[11px]"
              />
              <select
                value={sellerState}
                onChange={(e) => setSellerState(e.target.value)}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-slate-200"
              >
                {INDIAN_STATES.map((st) => (
                  <option key={st.code} value={st.name}>
                    {st.name} ({st.gstCode})
                  </option>
                ))}
              </select>
            </div>

            {/* Buyer */}
            <div className="space-y-2">
              <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">
                Buyer Details (Customer)
              </span>
              <input
                type="text"
                placeholder="Buyer Name *"
                required
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-slate-200"
              />
              <input
                type="text"
                placeholder="Buyer GSTIN (Optional for B2C)"
                value={buyerGstin}
                onChange={(e) => setBuyerGstin(e.target.value.toUpperCase())}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-slate-200 font-mono text-[11px]"
              />
              <select
                value={buyerState}
                onChange={(e) => setBuyerState(e.target.value)}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-slate-200"
              >
                {INDIAN_STATES.map((st) => (
                  <option key={st.code} value={st.name}>
                    {st.name} ({st.gstCode})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Product & Line Item */}
          <div className="space-y-3 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
            <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">
              Product / Service Particulars
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  placeholder="Item Description *"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-slate-200"
                />
              </div>
              <div>
                <select
                  value={hsnSac}
                  onChange={(e) => setHsnSac(e.target.value)}
                  className="w-full rounded-lg bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-slate-200 font-mono"
                >
                  {COMMON_HSN_CODES.map((hsn) => (
                    <option key={hsn.code} value={hsn.code}>
                      HSN {hsn.code} ({hsn.rate}%)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <label className="text-slate-400 block mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full rounded-lg bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Unit Price (₹)</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(Number(e.target.value))}
                  className="w-full rounded-lg bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">GST Rate (%)</label>
                <select
                  value={gstRate}
                  onChange={(e) => setGstRate(Number(e.target.value))}
                  className="w-full rounded-lg bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-slate-200 font-mono"
                >
                  {GST_RATES.map((r) => (
                    <option key={r} value={r}>
                      {r}% GST
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Pricing Mode</label>
                <button
                  type="button"
                  onClick={() => setIsInclusiveTax(!isInclusiveTax)}
                  className={`w-full py-1.5 px-2 rounded-lg text-[11px] font-semibold border transition ${
                    isInclusiveTax
                      ? 'bg-purple-900/40 text-purple-300 border-purple-500/50'
                      : 'bg-slate-950 text-slate-300 border-slate-700'
                  }`}
                >
                  {isInclusiveTax ? 'Tax Inclusive' : 'Tax Exclusive'}
                </button>
              </div>
            </div>
          </div>

          {/* Tax Calculation Live Breakdown */}
          <div className="bg-indigo-950/40 border border-indigo-500/30 p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-indigo-300 font-semibold">
              <span className="flex items-center gap-1.5">
                <Calculator className="h-4 w-4" />
                <span>GST Tax Breakdown</span>
              </span>
              <span className="text-[11px] bg-indigo-500/20 px-2 py-0.5 rounded font-mono">
                {calc.taxType === 'intra' ? 'Intra-state (CGST + SGST)' : 'Inter-state (IGST)'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono pt-1 text-slate-300">
              <div>
                <span className="text-slate-400 block text-[10px]">Taxable Amount</span>
                <span className="font-bold text-white">{formatINR(calc.taxableAmount)}</span>
              </div>
              {calc.taxType === 'intra' ? (
                <>
                  <div>
                    <span className="text-slate-400 block text-[10px]">CGST ({gstRate / 2}%)</span>
                    <span className="text-purple-300">{formatINR(calc.cgst)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">SGST ({gstRate / 2}%)</span>
                    <span className="text-purple-300">{formatINR(calc.sgst)}</span>
                  </div>
                </>
              ) : (
                <div className="col-span-2">
                  <span className="text-slate-400 block text-[10px]">IGST ({gstRate}%)</span>
                  <span className="text-purple-300">{formatINR(calc.igst)}</span>
                </div>
              )}
              <div>
                <span className="text-slate-400 block text-[10px]">Total Invoice</span>
                <span className="font-bold text-emerald-400">{formatINR(calc.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold shadow-md"
            >
              Save Invoice & Run Health Check
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
