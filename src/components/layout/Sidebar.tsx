import React from 'react';
import {
  LayoutDashboard,
  FileSpreadsheet,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
  Percent,
  Receipt,
  FileCheck2,
  FileBarChart,
  Calendar,
  Sparkles,
  Settings,
  Scan
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  errorCount: number;
  readinessScore: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  errorCount,
  readinessScore,
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'scanner', label: 'AI Invoice Scanner', icon: Scan, highlight: true },
    { id: 'invoices', label: 'All Invoices', icon: FileSpreadsheet },
    { id: 'sales', label: 'Sales (Outward)', icon: ArrowUpRight },
    { id: 'purchases', label: 'Purchases (Inward)', icon: ArrowDownLeft },
    { id: 'itc', label: 'Input Tax Credit', icon: Percent },
    { id: 'summary', label: 'GST Summary', icon: Receipt },
    {
      id: 'healthCheck',
      label: 'GST Health Check',
      icon: ShieldCheck,
      badge: errorCount > 0 ? `${errorCount} issues` : 'Clean',
      badgeColor: errorCount > 0 ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    {
      id: 'readiness',
      label: 'Filing Readiness',
      icon: FileCheck2,
      badge: `${readinessScore}%`,
      badgeColor: readinessScore >= 80 ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    { id: 'reports', label: 'Reports Hub', icon: FileBarChart },
    { id: 'calendar', label: 'GST Calendar', icon: Calendar },
    { id: 'assistant', label: 'GST Sahayak', icon: Sparkles, textGradient: true },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 shrink-0 hidden md:block glass-panel border-r border-slate-800/80 bg-slate-950/60 p-4 min-h-[calc(100vh-4.25rem)]">
      <div className="space-y-1">
        <p className="px-3 text-[10px] font-bold tracking-wider text-slate-500 uppercase pb-2">
          Navigation Menu
        </p>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/20 font-semibold scale-[1.02]'
                  : item.highlight
                  ? 'bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 border border-indigo-500/30'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`h-4 w-4 shrink-0 ${
                    isActive ? 'text-white' : item.textGradient ? 'text-purple-400' : 'text-slate-400'
                  }`}
                />
                <span className={item.textGradient && !isActive ? 'gradient-text font-bold' : ''}>
                  {item.label}
                </span>
              </div>

              {item.badge && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Dynamic Readiness Card Footer */}
      <div className="mt-8 rounded-2xl glass-card p-3.5 border border-slate-700/60">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-semibold text-slate-300">August Filing Score</span>
          <span className="font-bold text-indigo-400">{readinessScore}%</span>
        </div>
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${readinessScore}%` }}
          ></div>
        </div>
        <p className="text-[10px] text-slate-400 mt-2 leading-tight">
          {readinessScore >= 90
            ? '✓ Perfect readiness! Ready to export GSTR summary report.'
            : '⚠ Fix critical errors in Health Check to reach 100% readiness.'}
        </p>
      </div>
    </aside>
  );
};
