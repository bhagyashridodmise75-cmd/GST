import React, { useState } from 'react';
import {
  UploadCloud,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Scan,
  Check,
  Edit3,
  RefreshCw
} from 'lucide-react';
import { simulateInvoiceOCRScan, ExtractedInvoiceData } from '../../services/ocrService';
import { BusinessProfile } from '../../types';
import { formatINR } from '../../services/gstEngine';

interface InvoiceScannerProps {
  profile: BusinessProfile;
  onSaveExtractedInvoice: (extracted: any) => void;
}

export const InvoiceScanner: React.FC<InvoiceScannerProps> = ({
  profile,
  onSaveExtractedInvoice,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgressText, setScanProgressText] = useState('');
  const [scanPercentage, setScanPercentage] = useState(0);
  const [extractedData, setExtractedData] = useState<ExtractedInvoiceData | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setExtractedData(null);

    try {
      const result = await simulateInvoiceOCRScan(file, (text, pct) => {
        setScanProgressText(text);
        setScanPercentage(pct);
      });
      setExtractedData(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleSave = () => {
    if (!extractedData) return;

    const invoiceData = {
      invoiceNumber: extractedData.invoiceNumber,
      invoiceDate: extractedData.invoiceDate,
      type: extractedData.type,
      sellerName: extractedData.sellerName,
      sellerGstin: extractedData.sellerGstin,
      sellerState: extractedData.sellerState,
      buyerName: extractedData.buyerName,
      buyerGstin: extractedData.buyerGstin,
      buyerState: extractedData.buyerState,
      items: [
        {
          id: `item_${Date.now()}`,
          description: extractedData.productDescription,
          hsnSac: extractedData.hsnSac,
          quantity: extractedData.quantity,
          unitPrice: extractedData.unitPrice,
          taxableAmount: extractedData.taxableAmount,
          gstRate: extractedData.gstRate,
          cgstAmount: extractedData.cgstAmount,
          sgstAmount: extractedData.sgstAmount,
          igstAmount: extractedData.igstAmount,
          totalAmount: extractedData.totalAmount,
        },
      ],
      taxableAmount: extractedData.taxableAmount,
      gstRate: extractedData.gstRate,
      cgst: extractedData.cgstAmount,
      sgst: extractedData.sgstAmount,
      igst: extractedData.igstAmount,
      totalGst: extractedData.cgstAmount + extractedData.sgstAmount + extractedData.igstAmount,
      totalAmount: extractedData.totalAmount,
      isInclusiveTax: extractedData.isInclusiveTax,
      paymentStatus: 'paid',
      itcStatus: extractedData.type === 'purchase' ? 'eligible' : undefined,
    };

    onSaveExtractedInvoice(invoiceData);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-card p-6 rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/30">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
            <Sparkles className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">AI Invoice Scanner & OCR</h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Upload any invoice image or PDF. Our AI automatically extracts Invoice #, GSTINs, HSN codes, and calculated tax amounts.
            </p>
          </div>
        </div>
      </div>

      {/* Upload Drag & Drop Area */}
      {!isScanning && !extractedData && (
        <div className="glass-card p-10 rounded-2xl border-2 border-dashed border-slate-700 hover:border-purple-500/60 transition text-center group cursor-pointer relative">
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={handleFileUpload}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
          />
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
            <UploadCloud className="h-8 w-8" />
          </div>
          <h3 className="mt-4 text-base font-bold text-white">Drag & drop your invoice PDF or image here</h3>
          <p className="text-xs text-slate-400 mt-1">Supports PNG, JPG, JPEG, and PDF documents (Max 10MB)</p>
          <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-500/20">
            <Scan className="h-4 w-4" />
            <span>Select File to Scan</span>
          </div>
        </div>
      )}

      {/* Scanning Animation Progress View */}
      {isScanning && (
        <div className="glass-card p-10 rounded-2xl border border-slate-800 text-center space-y-4">
          <div className="relative mx-auto w-24 h-24 flex items-center justify-center rounded-2xl bg-slate-900 border border-purple-500/40 overflow-hidden">
            <Scan className="h-10 w-10 text-purple-400 animate-pulse" />
            <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-scan"></div>
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Scanning Invoice with AI OCR Engine...</h3>
            <p className="text-xs text-purple-300 mt-1">{scanProgressText}</p>
          </div>
          <div className="max-w-xs mx-auto bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${scanPercentage}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Extracted Data Editable Verification Form */}
      {extractedData && (
        <div className="glass-card p-6 rounded-2xl border border-slate-700 space-y-6">
          {/* Header Banner */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              <div>
                <h3 className="font-bold text-base text-white">Extraction Successful! Review & Edit Information</h3>
                <p className="text-xs text-slate-400">
                  AI Confidence Score: <strong className="text-emerald-400">{extractedData.confidenceScore}%</strong> | {extractedData.extractedFieldsCount} fields extracted
                </p>
              </div>
            </div>
            <button
              onClick={() => setExtractedData(null)}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-white"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Scan Another Invoice</span>
            </button>
          </div>

          {/* Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Invoice & Date */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">Extracted Invoice #</label>
              <input
                type="text"
                value={extractedData.invoiceNumber}
                onChange={(e) => setExtractedData({ ...extractedData, invoiceNumber: e.target.value })}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-slate-200 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Extracted Invoice Date</label>
              <input
                type="date"
                value={extractedData.invoiceDate}
                onChange={(e) => setExtractedData({ ...extractedData, invoiceDate: e.target.value })}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-slate-200"
              />
            </div>

            {/* Seller */}
            <div className="space-y-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <span className="font-bold text-slate-300 uppercase text-[10px]">Extracted Seller Details</span>
              <input
                type="text"
                value={extractedData.sellerName}
                onChange={(e) => setExtractedData({ ...extractedData, sellerName: e.target.value })}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-slate-200"
              />
              <input
                type="text"
                value={extractedData.sellerGstin}
                onChange={(e) => setExtractedData({ ...extractedData, sellerGstin: e.target.value })}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-slate-200 font-mono"
              />
            </div>

            {/* Buyer */}
            <div className="space-y-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <span className="font-bold text-slate-300 uppercase text-[10px]">Extracted Buyer Details</span>
              <input
                type="text"
                value={extractedData.buyerName}
                onChange={(e) => setExtractedData({ ...extractedData, buyerName: e.target.value })}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-slate-200"
              />
              <input
                type="text"
                value={extractedData.buyerGstin}
                onChange={(e) => setExtractedData({ ...extractedData, buyerGstin: e.target.value })}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-slate-200 font-mono"
              />
            </div>

            {/* Product & Amounts */}
            <div className="md:col-span-2 space-y-2 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
              <span className="font-bold text-slate-300 uppercase text-[10px]">Extracted Product & Financial Amounts</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  value={extractedData.productDescription}
                  onChange={(e) => setExtractedData({ ...extractedData, productDescription: e.target.value })}
                  className="sm:col-span-2 rounded-lg bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-slate-200"
                />
                <input
                  type="text"
                  placeholder="HSN Code"
                  value={extractedData.hsnSac}
                  onChange={(e) => setExtractedData({ ...extractedData, hsnSac: e.target.value })}
                  className="rounded-lg bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-slate-200 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 font-mono">
                <div>
                  <label className="text-slate-400 block text-[10px]">Taxable Amount</label>
                  <input
                    type="number"
                    value={extractedData.taxableAmount}
                    onChange={(e) => setExtractedData({ ...extractedData, taxableAmount: Number(e.target.value) })}
                    className="w-full rounded-lg bg-slate-950 border border-slate-700 px-2.5 py-1 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block text-[10px]">GST Rate (%)</label>
                  <input
                    type="number"
                    value={extractedData.gstRate}
                    onChange={(e) => setExtractedData({ ...extractedData, gstRate: Number(e.target.value) })}
                    className="w-full rounded-lg bg-slate-950 border border-slate-700 px-2.5 py-1 text-purple-300"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-slate-400 block text-[10px]">Extracted Total Amount (₹)</label>
                  <input
                    type="number"
                    value={extractedData.totalAmount}
                    onChange={(e) => setExtractedData({ ...extractedData, totalAmount: Number(e.target.value) })}
                    className="w-full rounded-lg bg-slate-950 border border-slate-700 px-2.5 py-1 text-emerald-400 font-bold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* OCR Raw Text Preview Drawer */}
          {extractedData.rawTextPreview && (
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-400">
              <span className="font-bold text-slate-300 block mb-1">OCR Raw Text Stream Preview:</span>
              <pre className="whitespace-pre-wrap">{extractedData.rawTextPreview}</pre>
            </div>
          )}

          {/* Save Action Bar */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setExtractedData(null)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
            >
              Discard
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-md"
            >
              <Check className="h-4 w-4" />
              <span>Confirm & Save Extracted Invoice</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
