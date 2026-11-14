import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AppShell } from './components/layout/AppShell';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';

import { LegalHelpProvider } from './context/LegalHelpContext';
import { CookieConsentBanner } from './components/common/CookieConsentBanner';
import { HelpFaqModal } from './components/common/HelpFaqModal';
import { LegalModal } from './components/common/LegalModal';

const SettingsPage = lazy(() => import('./pages/SettingsPage').then((module) => ({ default: module.SettingsPage })));
const StockPage = lazy(() => import('./pages/StockPage').then((module) => ({ default: module.StockPage })));
const PurchasesPage = lazy(() => import('./pages/PurchasesPage').then((module) => ({ default: module.PurchasesPage })));
const SuppliersPage = lazy(() => import('./pages/SuppliersPage').then((module) => ({ default: module.SuppliersPage })));
const CustomersPage = lazy(() => import('./pages/CustomersPage').then((module) => ({ default: module.CustomersPage })));
const SalesPage = lazy(() => import('./pages/SalesPage').then((module) => ({ default: module.SalesPage })));
const PaymentsPage = lazy(() => import('./pages/PaymentsPage').then((module) => ({ default: module.PaymentsPage })));
const ExpensesPage = lazy(() => import('./pages/ExpensesPage').then((module) => ({ default: module.ExpensesPage })));
const ReportsPage = lazy(() => import('./pages/ReportsPage').then((module) => ({ default: module.ReportsPage })));
const SalesReturnsPage = lazy(() => import('./pages/SalesReturnsPage').then((module) => ({ default: module.SalesReturnsPage })));
const CreateSalesReturnPage = lazy(() => import('./pages/CreateSalesReturnPage').then((module) => ({ default: module.CreateSalesReturnPage })));
const AuditPage = lazy(() => import('./pages/AuditPage').then((module) => ({ default: module.AuditPage })));
const CatalogueBuilderPage = lazy(() => import('./pages/CatalogueBuilderPage').then((module) => ({ default: module.CatalogueBuilderPage })));

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LegalHelpProvider>
          <Suspense fallback={<div role="status" className="p-6 text-center text-sm text-slate-600">Loading…</div>}>
          <Routes>
            {/* Public login route */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected routes enclosed by AppShell layout */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppShell />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/sales" element={<SalesPage />} />
                <Route path="/sales-returns" element={<SalesReturnsPage />} />
                <Route path="/sales-returns/create" element={<CreateSalesReturnPage />} />
                <Route path="/purchases" element={<PurchasesPage />} />
                <Route path="/stock" element={<StockPage />} />
                <Route path="/payments" element={<PaymentsPage />} />
                <Route path="/expenses" element={<ExpensesPage />} />
                <Route path="/customers" element={<CustomersPage />} />
                <Route path="/suppliers" element={<SuppliersPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/audit" element={<AuditPage />} />
                <Route path="/catalogue-builder" element={<CatalogueBuilderPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
            </Route>

            {/* Catch-all redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </Suspense>

          {/* Global software essentials */}
          <CookieConsentBanner />
          <HelpFaqModal />
          <LegalModal />
        </LegalHelpProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
