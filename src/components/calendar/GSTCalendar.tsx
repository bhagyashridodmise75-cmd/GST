import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  Bell,
  AlertCircle,
  Edit2
} from 'lucide-react';
import { FilingPeriod } from '../../types';

interface GSTCalendarProps {
  filingPeriods: FilingPeriod[];
  onUpdatePeriodStatus: (id: string, updates: Partial<FilingPeriod>) => void;
}

export const GSTCalendar: React.FC<GSTCalendarProps> = ({
  filingPeriods,
  onUpdatePeriodStatus,
}) => {
  return (
    <div className="space-y-6">
      <div className="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <CalendarIcon className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">GST Compliance Filing Calendar</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Track official deadlines for GSTR-1, GSTR-3B, CMP-08, and Annual GSTR-9 returns with custom alerts.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filingPeriods.map((period) => (
          <div
            key={period.id}
            className={`glass-card p-5 rounded-2xl border transition space-y-3 ${
              period.status === 'filed'
                ? 'border-emerald-500/40 bg-emerald-950/10'
                : 'border-slate-800'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {period.returnType}
                </span>
                <h3 className="font-bold text-base text-white mt-1.5">{period.periodName}</h3>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  period.status === 'filed'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : period.status === 'prepared'
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                {period.status === 'filed' && '✓ Filed'}
                {period.status === 'prepared' && '📄 Prepared'}
                {period.status === 'pending' && '⏳ Pending'}
              </span>
            </div>

            <p className="text-xs text-slate-300">{period.notes}</p>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">
                Due Date: <strong className="text-white">{period.dueDate}</strong>
              </span>

              {/* Status Selector */}
              <select
                value={period.status}
                onChange={(e) =>
                  onUpdatePeriodStatus(period.id, { status: e.target.value as any })
                }
                className="rounded-lg bg-slate-900 border border-slate-700 px-2.5 py-1 text-xs text-slate-200 focus:outline-none"
              >
                <option value="pending">Set Pending</option>
                <option value="prepared">Set Prepared</option>
                <option value="filed">Mark Filed ✓</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
