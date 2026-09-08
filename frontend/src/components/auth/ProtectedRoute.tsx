import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslations } from '../../hooks/useTranslations';

export const ProtectedRoute: React.FC = () => {
  const { user, isLoading } = useAuth();
  const { t } = useTranslations();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 text-sm">
        <div className="animate-spin rounded-full h-10 w-10 border-3 border-sky-200 border-t-sky-600 mb-3"></div>
        <p className="text-xs font-semibold text-slate-700">
          {t.common.loading}
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
