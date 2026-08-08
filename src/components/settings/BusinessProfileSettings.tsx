import React, { useState } from 'react';
import { Building2, Save, RefreshCw, CheckCircle2, ShieldCheck } from 'lucide-react';
import { BusinessProfile } from '../../types';
import { INDIAN_STATES } from '../../services/gstEngine';

interface BusinessProfileSettingsProps {
  profile: BusinessProfile;
  onUpdateProfile: (updated: Partial<BusinessProfile>) => void;
  onResetDemoData: () => void;
}

export const BusinessProfileSettings: React.FC<BusinessProfileSettingsProps> = ({
  profile,
  onUpdateProfile,
  onResetDemoData,
}) => {
  const [formData, setFormData] = useState<BusinessProfile>(profile);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 rounded-2xl border border-slate-800">
        <h2 className="text-xl font-bold text-white tracking-tight">Business Profile & GST Settings</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Manage business registration details, state location for tax determination, and default rate presets.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-6 rounded-2xl border border-slate-800 space-y-5 text-xs">
        {savedSuccess && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Business profile settings updated successfully!</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Business Registered Name *</label>
            <input
              type="text"
              required
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-slate-200"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Owner / Authorized Representative *</label>
            <input
              type="text"
              required
              value={formData.ownerName}
              onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-slate-200"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">GSTIN Number (15 Characters) *</label>
            <input
              type="text"
              required
              value={formData.gstin}
              onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-slate-200 font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">State of Registration *</label>
            <select
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-slate-200"
            >
              {INDIAN_STATES.map((st) => (
                <option key={st.code} value={st.name}>
                  {st.name} ({st.gstCode})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Business Type *</label>
            <select
              value={formData.businessType}
              onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-slate-200"
            >
              <option value="Retail & Service Provider">Retail & Service Provider</option>
              <option value="Small Manufacturer">Small Manufacturer</option>
              <option value="Wholesale Trader">Wholesale Trader</option>
              <option value="Freelancer / Consultant">Freelancer / Consultant</option>
              <option value="Micro Enterprise">Micro Enterprise</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-slate-200"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-slate-300 font-medium mb-1">Business Registered Address</label>
            <textarea
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-slate-200"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onResetDemoData}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 text-xs font-medium border border-slate-700 transition"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Reset Demo Invoices Dataset</span>
          </button>

          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs shadow-md"
          >
            <Save className="h-4 w-4" />
            <span>Save Profile Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
