import React, { useState } from 'react';
import { X, Building2, UserCheck, Lock, ArrowRight, FileText } from 'lucide-react';
import { BusinessProfile } from '../../types';
import { INDIAN_STATES } from '../../services/gstEngine';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticate: (profile: BusinessProfile) => void;
  initialMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthenticate,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);

  // Form Fields
  const [email, setEmail] = useState('rajesh@sharmaenterprise.in');
  const [password, setPassword] = useState('demo123');

  // Signup Business Fields
  const [businessName, setBusinessName] = useState('Sharma Enterprise Solutions');
  const [ownerName, setOwnerName] = useState('Rajesh Sharma');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [gstin, setGstin] = useState('27ABCDE1234F1Z5');
  const [businessType, setBusinessType] = useState('Retail & Service Provider');
  const [state, setState] = useState('Maharashtra');
  const [address, setAddress] = useState('MG Road, Pune');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const profile: BusinessProfile = {
      id: `biz_${Date.now()}`,
      businessName,
      ownerName,
      email,
      phone,
      gstin: gstin.toUpperCase(),
      businessType,
      state,
      address,
      pincode: '411001',
      financialYear: '2026-2027',
      defaultTaxRate: 18,
      isSetupComplete: true,
    };

    onAuthenticate(profile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="glass-card w-full max-w-md rounded-2xl border border-slate-700 p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold">
              <FileText className="h-4 w-4" />
            </div>
            <h3 className="font-bold text-base text-white">
              {mode === 'login' && 'Sign In to GSTEase'}
              {mode === 'signup' && 'Register New Business'}
              {mode === 'forgot' && 'Reset Password'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:bg-slate-800 text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Business Registered Name *</label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Owner / Representative Name *</label>
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">GSTIN Number (15 Chars) *</label>
                <input
                  type="text"
                  required
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value.toUpperCase())}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">State of Registration *</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
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
                <label className="block text-slate-300 font-medium mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-slate-200 font-mono"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-slate-300 font-medium mb-1">Email Address *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-slate-200"
            />
          </div>

          {mode !== 'forgot' && (
            <div>
              <label className="block text-slate-300 font-medium mb-1">Password *</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-slate-200"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs shadow-md transition"
          >
            {mode === 'login' && 'Sign In to Dashboard'}
            {mode === 'signup' && 'Create Business Account'}
            {mode === 'forgot' && 'Send Password Reset Link'}
          </button>

          <div className="flex justify-between items-center text-[11px] text-slate-400 pt-2 border-t border-slate-800">
            {mode === 'login' ? (
              <>
                <button type="button" onClick={() => setMode('signup')} className="hover:text-indigo-400">
                  Need a business account? Sign up
                </button>
                <button type="button" onClick={() => setMode('forgot')} className="hover:text-indigo-400">
                  Forgot password?
                </button>
              </>
            ) : (
              <button type="button" onClick={() => setMode('login')} className="hover:text-indigo-400">
                Already registered? Sign in
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
