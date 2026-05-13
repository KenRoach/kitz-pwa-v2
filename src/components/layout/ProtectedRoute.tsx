import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppStore } from '@/lib/store';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const user = useAppStore((s) => s.user);
  const hasToken = Boolean(localStorage.getItem('kitz-token'));

  if (!user && !hasToken) {
    return <Navigate to="/login" replace />;
  }

  if (!user && hasToken) {
    return (
      <div className="loading-screen" aria-label="Loading">
        <div className="loading-spinner" />
      </div>
    );
  }

  return <>{children}</>;
}
