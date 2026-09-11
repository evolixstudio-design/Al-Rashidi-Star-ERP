import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AppShell } from './components/layout/AppShell';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { SettingsPage } from './pages/SettingsPage';
import { StockPage } from './pages/StockPage';
import { PurchasesPage } from './pages/PurchasesPage';
import { SuppliersPage } from './pages/SuppliersPage';
import { CustomersPage } from './pages/CustomersPage';
import { SalesPage } from './pages/SalesPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { ReportsPage } from './pages/ReportsPage';
import { SalesReturnsPage } from './pages/SalesReturnsPage';
import { CreateSalesReturnPage } from './pages/CreateSalesReturnPage';
import { AuditPage } from './pages/AuditPage';
import { CatalogueBuilderPage } from './pages/CatalogueBuilderPage';

import { LegalHelpProvider } from './context/LegalHelpContext';
import { CookieConsentBanner } from './components/common/CookieConsentBanner';
import { HelpFaqModal } from './components/common/HelpFaqModal';
import { LegalModal } from './components/common/LegalModal';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LegalHelpProvider>
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
