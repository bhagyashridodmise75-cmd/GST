import React, { useState, useEffect } from 'react';
import { db } from './services/db';
import { Invoice, BusinessProfile, GSTSummaryData, FilingPeriod, AppNotification } from './types';
import { runGSTHealthCheck, getInvoiceSeverity } from './services/gstHealthCheck';

// Layout
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';

// Pages & Modals
import { LandingPage } from './components/landing/LandingPage';
import { Dashboard } from './components/dashboard/Dashboard';
import { InvoiceList } from './components/invoices/InvoiceList';
import { InvoiceForm } from './components/invoices/InvoiceForm';
import { InvoiceScanner } from './components/scanner/InvoiceScanner';
import { GSTHealthCheck } from './components/healthCheck/GSTHealthCheck';
import { GSTSummary } from './components/gstSummary/GSTSummary';
import { ITCTracker } from './components/itc/ITCTracker';
import { FilingReadiness } from './components/readiness/FilingReadiness';
import { ReportsHub } from './components/reports/ReportsHub';
import { GSTCalendar } from './components/calendar/GSTCalendar';
import { GSTSahayak } from './components/assistant/GSTSahayak';
import { BusinessProfileSettings } from './components/settings/BusinessProfileSettings';
import { AuthModal } from './components/auth/AuthModal';

export function App() {
  // Navigation State: 'landing' vs main app views
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // App Data State
  const [profile, setProfile] = useState<BusinessProfile>(db.getProfile());
  const [invoices, setInvoices] = useState<Invoice[]>(db.getInvoices());
  const [filingPeriods, setFilingPeriods] = useState<FilingPeriod[]>(db.getFilingPeriods());
  const [notifications, setNotifications] = useState<AppNotification[]>(db.getNotifications());

  // Invoice Form Modal state
  const [isInvoiceFormOpen, setIsInvoiceFormOpen] = useState<boolean>(false);
  const [invoiceToEdit, setInvoiceToEdit] = useState<Invoice | null>(null);
  const [defaultInvoiceType, setDefaultInvoiceType] = useState<'sales' | 'purchase'>('sales');

  // Compute GST Summary Metrics dynamically
  const salesInvoices = invoices.filter((i) => i.type === 'sales');
  const purchaseInvoices = invoices.filter((i) => i.type === 'purchase');

  const totalTaxableSales = salesInvoices.reduce((s, i) => s + i.taxableAmount, 0);
  const outputCgst = salesInvoices.reduce((s, i) => s + i.cgst, 0);
  const outputSgst = salesInvoices.reduce((s, i) => s + i.sgst, 0);
  const outputIgst = salesInvoices.reduce((s, i) => s + i.igst, 0);
  const totalOutputGst = salesInvoices.reduce((s, i) => s + i.totalGst, 0);

  const totalPurchases = purchaseInvoices.reduce((s, i) => s + i.taxableAmount, 0);
  const totalPurchaseGst = purchaseInvoices.reduce((s, i) => s + i.totalGst, 0);

  // Eligible ITC
  const eligibleItc = purchaseInvoices
    .filter((i) => i.itcStatus === 'eligible' || (!i.itcStatus && i.status !== 'critical'))
    .reduce((s, i) => s + i.totalGst, 0);
  const reviewItc = totalPurchaseGst - eligibleItc;

  const estimatedGstPayable = Math.max(0, totalOutputGst - eligibleItc);
  const errorCount = invoices.filter((i) => i.status === 'critical' || i.status === 'warning').length;

  const summaryData: GSTSummaryData = {
    period: 'August 2026',
    totalTaxableSales,
    outputCgst,
    outputSgst,
    outputIgst,
    totalOutputGst,
    totalPurchases,
    totalPurchaseGst,
    eligibleItc,
    reviewItc,
    estimatedGstPayable,
    salesCount: salesInvoices.length,
    purchaseCount: purchaseInvoices.length,
    errorCount,
  };

  // Calculate dynamic readiness score
  let baseScore = 100;
  if (errorCount > 0) baseScore -= errorCount * 10;
  if (!profile.gstin) baseScore -= 20;
  const readinessScore = Math.max(20, Math.min(100, baseScore));

  // --- ACTIONS ---
  const handleSaveInvoice = (data: any) => {
    const saved = db.saveInvoice(data);
    setInvoices(db.getInvoices());
    setInvoiceToEdit(null);
  };

  const handleDeleteInvoice = (id: string) => {
    db.deleteInvoice(id);
    setInvoices(db.getInvoices());
  };

  const handleFixInvoice = (invoice: Invoice) => {
    setInvoiceToEdit(invoice);
    setIsInvoiceFormOpen(true);
  };

  const handleScanInvoiceSave = (extractedData: any) => {
    db.saveInvoice(extractedData);
    setInvoices(db.getInvoices());
    setCurrentView('invoices');
  };

  const handleUpdateProfile = (updated: Partial<BusinessProfile>) => {
    const p = db.updateProfile(updated);
    setProfile(p);
  };

  const handleResetDemoData = () => {
    db.resetDemoData();
    setProfile(db.getProfile());
    setInvoices(db.getInvoices());
    setFilingPeriods(db.getFilingPeriods());
    setNotifications(db.getNotifications());
  };

  const handleMarkNotificationRead = (id: string) => {
    const updated = db.markNotificationAsRead(id);
    setNotifications(updated);
  };

  const handleUpdateFilingPeriod = (id: string, updates: Partial<FilingPeriod>) => {
    const updated = db.updateFilingPeriod(id, updates);
    setFilingPeriods(updated);
  };

  // If on Landing View, render Public Landing Page
  if (currentView === 'landing') {
    return (
      <LandingPage
        onGetStarted={() => setIsAuthModalOpen(true)}
        onViewDemo={() => setCurrentView('dashboard')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        profile={profile}
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationRead}
        onNavigate={(view) => setCurrentView(view)}
        onOpenSettings={() => setCurrentView('settings')}
        onResetDemo={handleResetDemoData}
        onGoToLanding={() => setCurrentView('landing')}
        currentView={currentView}
      />

      {/* Main Body */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        {/* Sidebar */}
        <Sidebar
          currentView={currentView}
          onNavigate={(view) => setCurrentView(view)}
          errorCount={errorCount}
          readinessScore={readinessScore}
        />

        {/* View Content Area */}
        <main className="flex-1 min-w-0">
          {currentView === 'dashboard' && (
            <Dashboard
              profile={profile}
              summary={summaryData}
              recentInvoices={invoices}
              onNavigate={(view) => setCurrentView(view)}
              onAddInvoice={() => {
                setInvoiceToEdit(null);
                setDefaultInvoiceType('sales');
                setIsInvoiceFormOpen(true);
              }}
              onScanInvoice={() => setCurrentView('scanner')}
            />
          )}

          {currentView === 'scanner' && (
            <InvoiceScanner
              profile={profile}
              onSaveExtractedInvoice={handleScanInvoiceSave}
            />
          )}

          {currentView === 'invoices' && (
            <InvoiceList
              invoices={invoices}
              filterType="all"
              onAddInvoice={() => {
                setInvoiceToEdit(null);
                setDefaultInvoiceType('sales');
                setIsInvoiceFormOpen(true);
              }}
              onScanInvoice={() => setCurrentView('scanner')}
              onEditInvoice={(inv) => {
                setInvoiceToEdit(inv);
                setIsInvoiceFormOpen(true);
              }}
              onDeleteInvoice={handleDeleteInvoice}
            />
          )}

          {currentView === 'sales' && (
            <InvoiceList
              invoices={invoices}
              filterType="sales"
              onAddInvoice={() => {
                setInvoiceToEdit(null);
                setDefaultInvoiceType('sales');
                setIsInvoiceFormOpen(true);
              }}
              onScanInvoice={() => setCurrentView('scanner')}
              onEditInvoice={(inv) => {
                setInvoiceToEdit(inv);
                setIsInvoiceFormOpen(true);
              }}
              onDeleteInvoice={handleDeleteInvoice}
            />
          )}

          {currentView === 'purchases' && (
            <InvoiceList
              invoices={invoices}
              filterType="purchase"
              onAddInvoice={() => {
                setInvoiceToEdit(null);
                setDefaultInvoiceType('purchase');
                setIsInvoiceFormOpen(true);
              }}
              onScanInvoice={() => setCurrentView('scanner')}
              onEditInvoice={(inv) => {
                setInvoiceToEdit(inv);
                setIsInvoiceFormOpen(true);
              }}
              onDeleteInvoice={handleDeleteInvoice}
            />
          )}

          {currentView === 'itc' && (
            <ITCTracker invoices={invoices} onFixInvoice={handleFixInvoice} />
          )}

          {currentView === 'summary' && (
            <GSTSummary profile={profile} summary={summaryData} invoices={invoices} />
          )}

          {currentView === 'healthCheck' && (
            <GSTHealthCheck
              invoices={invoices}
              onFixInvoice={handleFixInvoice}
              onRecheckAll={() => {
                db.recheckAllHealth();
                setInvoices(db.getInvoices());
              }}
            />
          )}

          {currentView === 'readiness' && (
            <FilingReadiness
              profile={profile}
              summary={summaryData}
              invoices={invoices}
              errorCount={errorCount}
            />
          )}

          {currentView === 'reports' && (
            <ReportsHub profile={profile} summary={summaryData} invoices={invoices} />
          )}

          {currentView === 'calendar' && (
            <GSTCalendar
              filingPeriods={filingPeriods}
              onUpdatePeriodStatus={handleUpdateFilingPeriod}
            />
          )}

          {currentView === 'assistant' && (
            <GSTSahayak profile={profile} invoices={invoices} filingPeriods={filingPeriods} />
          )}

          {currentView === 'settings' && (
            <BusinessProfileSettings
              profile={profile}
              onUpdateProfile={handleUpdateProfile}
              onResetDemoData={handleResetDemoData}
            />
          )}
        </main>
      </div>

      {/* Global Invoice Form Add/Edit Modal */}
      <InvoiceForm
        profile={profile}
        initialInvoice={invoiceToEdit}
        defaultType={defaultInvoiceType}
        isOpen={isInvoiceFormOpen}
        onClose={() => {
          setIsInvoiceFormOpen(false);
          setInvoiceToEdit(null);
        }}
        onSave={handleSaveInvoice}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthenticate={(newProfile) => {
          setProfile(newProfile);
          db.updateProfile(newProfile);
          setCurrentView('dashboard');
        }}
      />
    </div>
  );
}

export default App;
